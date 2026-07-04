-- Briefing commercial quotidien (routine « copilote »).
-- RPC SECURITY DEFINER protégée par jeton (app_secrets.automation_token) :
-- expose un instantané agrégé du pipeline sans ouvrir la lecture des leads.

create or replace function public.get_lead_briefing(p_secret text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expected text;
  v_result jsonb;
begin
  select value into v_expected from public.app_secrets where key = 'automation_token';
  if v_expected is null or p_secret is distinct from v_expected then
    raise exception 'invalid automation token';
  end if;

  select jsonb_build_object(
    -- Leads « nouveau » en attente depuis plus de 24 h : à relancer d'urgence
    'stale_new', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', l.name, 'phone', l.phone, 'source', l.source,
        'source_ref', l.source_ref, 'city', l.city,
        'hours_waiting', round(extract(epoch from now() - l.created_at) / 3600)
      ) order by l.created_at)
      from public.leads l
      where l.status = 'new' and l.created_at < now() - interval '24 hours'
    ), '[]'::jsonb),

    -- Leads reçus ces dernières 24 h (tous statuts)
    'last_24h', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', l.name, 'phone', l.phone, 'source', l.source,
        'source_ref', l.source_ref, 'status', l.status
      ) order by l.created_at desc)
      from public.leads l
      where l.created_at >= now() - interval '24 hours'
    ), '[]'::jsonb),

    -- Acheteurs en recherche active (à matcher avec les nouvelles annonces)
    'waiting_buyers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', l.name, 'phone', l.phone, 'source_ref', l.source_ref,
        'city', l.city, 'message', left(coalesce(l.message, ''), 200)
      ) order by l.created_at desc)
      from public.leads l
      where l.status in ('new', 'contacted')
        and l.source in ('contact', 'listing', 'simulator')
        and l.created_at >= now() - interval '30 days'
    ), '[]'::jsonb),

    -- Annonces publiées ces dernières 48 h
    'new_listings_48h', coalesce((
      select jsonb_agg(jsonb_build_object(
        'title', li.title, 'slug', li.slug, 'transaction', li.transaction,
        'property_type', li.property_type, 'price', li.price,
        'city', c.name, 'neighborhood', n.name
      ) order by li.created_at desc)
      from public.listings li
      join public.cities c on c.id = li.city_id
      left join public.neighborhoods n on n.id = li.neighborhood_id
      where li.status = 'active' and li.created_at >= now() - interval '48 hours'
    ), '[]'::jsonb),

    -- Statistiques 7 jours (pour l'édition du lundi)
    'week_stats', (
      select jsonb_build_object(
        'total', count(*),
        'by_source', coalesce(jsonb_object_agg(src.source, src.cnt), '{}'::jsonb)
      )
      from (
        select source, count(*) as cnt from public.leads
        where created_at >= now() - interval '7 days'
        group by source
      ) src
    ),
    'pipeline', (
      select jsonb_build_object(
        'new', count(*) filter (where status = 'new'),
        'contacted', count(*) filter (where status = 'contacted'),
        'won_30d', count(*) filter (where status = 'won' and created_at >= now() - interval '30 days')
      )
      from public.leads
    )
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_lead_briefing(text) from public;
grant execute on function public.get_lead_briefing(text) to anon, authenticated;

-- Gestion du blog depuis /admin + briefing copilote v2 (critères structurés).

-- Écritures blog réservées au propriétaire authentifié
create policy "owner insert blog_posts" on public.blog_posts
  for insert to authenticated with check (true);
create policy "owner update blog_posts" on public.blog_posts
  for update to authenticated using (true) with check (true);
create policy "owner delete blog_posts" on public.blog_posts
  for delete to authenticated using (true);

-- waiting_buyers expose désormais le payload (critères structurés du
-- formulaire /avant-premiere) pour des rapprochements précis.
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
    'stale_new', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', l.name, 'phone', l.phone, 'source', l.source,
        'source_ref', l.source_ref, 'city', l.city,
        'hours_waiting', round(extract(epoch from now() - l.created_at) / 3600)
      ) order by l.created_at)
      from public.leads l
      where l.status = 'new' and l.created_at < now() - interval '24 hours'
    ), '[]'::jsonb),

    'last_24h', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', l.name, 'phone', l.phone, 'source', l.source,
        'source_ref', l.source_ref, 'status', l.status
      ) order by l.created_at desc)
      from public.leads l
      where l.created_at >= now() - interval '24 hours'
    ), '[]'::jsonb),

    'waiting_buyers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', l.name, 'phone', l.phone, 'source_ref', l.source_ref,
        'city', l.city, 'message', left(coalesce(l.message, ''), 200),
        'criteria', l.payload
      ) order by l.created_at desc)
      from public.leads l
      where l.status in ('new', 'contacted')
        and l.source in ('contact', 'listing', 'simulator')
        and l.created_at >= now() - interval '30 days'
    ), '[]'::jsonb),

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

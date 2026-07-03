-- MonBien — fonctions d'écriture (SECURITY DEFINER)
-- Toutes les écritures publiques passent par ces RPC : la clé anon ne peut
-- jamais écrire directement dans les tables.

-- ------------------------------------------------------------ submit_lead
create or replace function public.submit_lead(
  p_name text,
  p_phone text,
  p_email text default null,
  p_source text default 'contact',
  p_source_ref text default null,
  p_city text default null,
  p_message text default null,
  p_payload jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'name and phone are required';
  end if;
  insert into public.leads (name, phone, email, source, source_ref, city, message, payload)
  values (
    left(trim(p_name), 120),
    left(trim(p_phone), 32),
    nullif(left(trim(coalesce(p_email, '')), 160), ''),
    p_source,
    left(p_source_ref, 200),
    left(p_city, 80),
    nullif(left(trim(coalesce(p_message, '')), 2000), ''),
    coalesce(p_payload, '{}'::jsonb)
  )
  returning id into v_id;
  return v_id;
end;
$$;

-- ------------------------------------------------------- submit_valuation
create or replace function public.submit_valuation(
  p_name text,
  p_phone text,
  p_email text,
  p_city_id uuid,
  p_neighborhood_id uuid,
  p_property_type text,
  p_area_m2 numeric,
  p_rooms integer,
  p_condition text,
  p_estimated_low numeric,
  p_estimated_high numeric,
  p_payload jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead_id uuid;
  v_valuation_id uuid;
  v_city_name text;
begin
  select name into v_city_name from public.cities where id = p_city_id;

  v_lead_id := public.submit_lead(
    p_name, p_phone, p_email, 'valuation',
    p_property_type || '/' || coalesce(v_city_name, 'inconnue'),
    v_city_name, null, coalesce(p_payload, '{}'::jsonb)
  );

  insert into public.valuations (
    lead_id, city_id, neighborhood_id, property_type, area_m2,
    rooms, condition, estimated_low, estimated_high
  ) values (
    v_lead_id, p_city_id, p_neighborhood_id, p_property_type, p_area_m2,
    p_rooms, p_condition, p_estimated_low, p_estimated_high
  )
  returning id into v_valuation_id;

  return v_valuation_id;
end;
$$;

-- ------------------------------------------------------- ingest_blog_post
-- Utilisée par POST /api/blog/ingest ; le jeton est vérifié contre la table
-- privée app_secrets (inaccessible via l'API publique).
create or replace function public.ingest_blog_post(
  p_secret text,
  p_slug text,
  p_title text,
  p_body_md text,
  p_meta_description text default null,
  p_category text default null,
  p_tags jsonb default '[]'::jsonb,
  p_hero_image text default null,
  p_author text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expected text;
  v_id uuid;
begin
  select value into v_expected from public.app_secrets where key = 'blog_ingest_token';
  if v_expected is null or p_secret is distinct from v_expected then
    raise exception 'invalid ingest token';
  end if;
  if coalesce(trim(p_slug), '') = '' or coalesce(trim(p_title), '') = ''
     or coalesce(trim(p_body_md), '') = '' then
    raise exception 'slug, title and body_md are required';
  end if;

  insert into public.blog_posts (slug, title, meta_description, body_md, category,
                                 tags, hero_image, status, author, published_at, updated_at)
  values (p_slug, p_title, p_meta_description, p_body_md, p_category,
          coalesce(p_tags, '[]'::jsonb), p_hero_image, 'published', p_author, now(), now())
  on conflict (slug) do update set
    title = excluded.title,
    meta_description = excluded.meta_description,
    body_md = excluded.body_md,
    category = excluded.category,
    tags = excluded.tags,
    hero_image = excluded.hero_image,
    status = 'published',
    author = excluded.author,
    updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_lead(text,text,text,text,text,text,text,jsonb) from public;
revoke all on function public.submit_valuation(text,text,text,uuid,uuid,text,numeric,integer,text,numeric,numeric,jsonb) from public;
revoke all on function public.ingest_blog_post(text,text,text,text,text,text,jsonb,text,text) from public;
grant execute on function public.submit_lead(text,text,text,text,text,text,text,jsonb) to anon, authenticated;
grant execute on function public.submit_valuation(text,text,text,uuid,uuid,text,numeric,integer,text,numeric,numeric,jsonb) to anon, authenticated;
grant execute on function public.ingest_blog_post(text,text,text,text,text,text,jsonb,text,text) to anon, authenticated;

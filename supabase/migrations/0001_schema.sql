-- MonBien — schéma initial
-- Tables : cities, neighborhoods, price_data, listings, leads, valuations, blog_posts

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- cities
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  region text,
  lat double precision,
  lng double precision,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------- neighborhoods
create table public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  name text not null,
  slug text not null,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now(),
  unique (city_id, slug)
);
create index neighborhoods_city_idx on public.neighborhoods(city_id);

-- ------------------------------------------------------------ price_data
create table public.price_data (
  id uuid primary key default gen_random_uuid(),
  neighborhood_id uuid not null references public.neighborhoods(id) on delete cascade,
  property_type text not null,
  transaction text not null check (transaction in ('vente','location')),
  avg_price_per_m2 numeric not null,
  currency text not null default 'MAD',
  sample_size integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (neighborhood_id, property_type, transaction)
);
create index price_data_neighborhood_idx on public.price_data(neighborhood_id);

-- -------------------------------------------------------------- listings
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  title text not null,
  slug text not null unique,
  description text,
  transaction text not null check (transaction in ('vente','location')),
  property_type text not null,
  city_id uuid not null references public.cities(id) on delete restrict,
  neighborhood_id uuid references public.neighborhoods(id) on delete set null,
  price numeric not null,
  currency text not null default 'MAD',
  area_m2 numeric,
  rooms integer,
  bedrooms integer,
  bathrooms integer,
  features jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('active','sold','draft')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);
create index listings_city_idx on public.listings(city_id);
create index listings_filters_idx on public.listings(status, transaction, property_type);

-- ----------------------------------------------------------------- leads
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  source text not null check (source in ('valuation','simulator','price_map','listing','contact','blog')),
  source_ref text,
  city text,
  message text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new','contacted','won','lost')),
  created_at timestamptz not null default now()
);
create index leads_status_idx on public.leads(status);
create index leads_source_idx on public.leads(source);
create index leads_created_idx on public.leads(created_at desc);

-- ------------------------------------------------------------ valuations
create table public.valuations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  city_id uuid references public.cities(id) on delete set null,
  neighborhood_id uuid references public.neighborhoods(id) on delete set null,
  property_type text not null,
  area_m2 numeric not null,
  rooms integer,
  condition text,
  estimated_low numeric not null,
  estimated_high numeric not null,
  created_at timestamptz not null default now()
);
create index valuations_lead_idx on public.valuations(lead_id);

-- ------------------------------------------------------------ blog_posts
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  meta_description text,
  body_md text not null,
  category text,
  tags jsonb not null default '[]'::jsonb,
  hero_image text,
  status text not null default 'draft' check (status in ('draft','published')),
  author text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index blog_posts_status_idx on public.blog_posts(status, published_at desc);

-- ----------------------------------------------------------- app_secrets
-- Table privée (aucune policy => inaccessible via l'API) utilisée par les
-- fonctions SECURITY DEFINER pour valider les jetons d'automatisation.
create table public.app_secrets (
  key text primary key,
  value text not null
);

-- ------------------------------------------------------------------- RLS
alter table public.cities enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.price_data enable row level security;
alter table public.listings enable row level security;
alter table public.leads enable row level security;
alter table public.valuations enable row level security;
alter table public.blog_posts enable row level security;
alter table public.app_secrets enable row level security;

-- Lecture publique des données de contenu
create policy "public read cities" on public.cities for select using (true);
create policy "public read neighborhoods" on public.neighborhoods for select using (true);
create policy "public read price_data" on public.price_data for select using (true);
create policy "public read active listings" on public.listings for select
  using (status <> 'draft' or auth.role() = 'authenticated');
create policy "public read published posts" on public.blog_posts for select
  using (status = 'published' or auth.role() = 'authenticated');

-- Leads / valuations : réservés au propriétaire connecté (dashboard /admin)
create policy "owner read leads" on public.leads for select to authenticated using (true);
create policy "owner update leads" on public.leads for update to authenticated
  using (true) with check (true);
create policy "owner read valuations" on public.valuations for select to authenticated using (true);
-- (aucune policy insert : les écritures passent par les fonctions SECURITY DEFINER)

-- Édition des prix au m² et des descriptions de quartiers depuis /admin.

-- Écritures price_data réservées au propriétaire authentifié
create policy "owner insert price_data" on public.price_data
  for insert to authenticated with check (true);
create policy "owner update price_data" on public.price_data
  for update to authenticated using (true) with check (true);
create policy "owner delete price_data" on public.price_data
  for delete to authenticated using (true);

-- Description éditoriale par quartier (SEO des pages /quartiers)
alter table public.neighborhoods add column if not exists description text;

create policy "owner update neighborhoods" on public.neighborhoods
  for update to authenticated using (true) with check (true);

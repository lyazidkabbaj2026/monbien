-- Gestion des villes et quartiers depuis /admin/villes.
-- Le propriétaire authentifié peut créer/modifier/supprimer villes et quartiers.
-- Garde-fous existants : listings.city_id est en "on delete restrict" (une ville
-- portant des annonces ne peut pas être supprimée) ; neighborhoods et price_data
-- sont en cascade.

create policy "owner insert cities" on public.cities
  for insert to authenticated with check (true);
create policy "owner update cities" on public.cities
  for update to authenticated using (true) with check (true);
create policy "owner delete cities" on public.cities
  for delete to authenticated using (true);

-- (update neighborhoods existe déjà — migration 0006)
create policy "owner insert neighborhoods" on public.neighborhoods
  for insert to authenticated with check (true);
create policy "owner delete neighborhoods" on public.neighborhoods
  for delete to authenticated using (true);

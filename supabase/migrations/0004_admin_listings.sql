-- Gestion des annonces depuis /admin (propriétaire authentifié)
-- + bucket Storage public pour les photos d'annonces.

-- Écritures sur listings réservées à l'utilisateur connecté (mono-propriétaire)
create policy "owner insert listings" on public.listings
  for insert to authenticated with check (true);
create policy "owner update listings" on public.listings
  for update to authenticated using (true) with check (true);
create policy "owner delete listings" on public.listings
  for delete to authenticated using (true);

-- Bucket photos d'annonces : lecture publique, écriture authentifiée
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

create policy "public read listing images" on storage.objects
  for select using (bucket_id = 'listings');
create policy "owner upload listing images" on storage.objects
  for insert to authenticated with check (bucket_id = 'listings');
create policy "owner update listing images" on storage.objects
  for update to authenticated using (bucket_id = 'listings');
create policy "owner delete listing images" on storage.objects
  for delete to authenticated using (bucket_id = 'listings');

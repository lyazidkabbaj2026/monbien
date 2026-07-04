-- Permet au propriétaire authentifié de supprimer un lead (spam, tests).
create policy "owner delete leads" on public.leads
  for delete to authenticated using (true);

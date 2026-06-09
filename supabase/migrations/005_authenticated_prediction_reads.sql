drop policy if exists "authenticated users can read all predictions" on public.predictions;
create policy "authenticated users can read all predictions"
on public.predictions
for select
to authenticated
using (true);

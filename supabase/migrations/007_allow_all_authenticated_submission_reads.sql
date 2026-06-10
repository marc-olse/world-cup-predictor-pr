drop policy if exists "users can read own predictions" on public.predictions;
drop policy if exists "admins can read all predictions" on public.predictions;
drop policy if exists "authenticated users can read all predictions" on public.predictions;

create policy "authenticated users can read all predictions"
on public.predictions
for select
to authenticated
using (true);

grant select on public.predictions to authenticated;
grant select on public.profiles to authenticated;

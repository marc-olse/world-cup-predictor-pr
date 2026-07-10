drop policy if exists "users can read own tournament predictions" on public.tournament_predictions;
drop policy if exists "authenticated users can read all tournament predictions" on public.tournament_predictions;

create policy "authenticated users can read all tournament predictions"
on public.tournament_predictions
for select
to authenticated
using (true);

grant select on public.tournament_predictions to authenticated;

alter table public.predictions
alter column predicted_home_score drop not null,
alter column predicted_away_score drop not null;

create table if not exists public.tournament_predictions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  winner text,
  semi_finalists text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tournament_results (
  id boolean primary key default true check (id = true),
  winner text,
  semi_finalists text[] not null default '{}',
  updated_at timestamptz not null default now()
);

insert into public.tournament_results (id)
values (true)
on conflict (id) do nothing;

drop trigger if exists set_tournament_predictions_updated_at on public.tournament_predictions;
create trigger set_tournament_predictions_updated_at
before update on public.tournament_predictions
for each row execute function public.set_updated_at();

alter table public.tournament_predictions enable row level security;
alter table public.tournament_results enable row level security;

drop policy if exists "users can read own tournament predictions" on public.tournament_predictions;
create policy "users can read own tournament predictions"
on public.tournament_predictions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can upsert own tournament predictions" on public.tournament_predictions;
create policy "users can upsert own tournament predictions"
on public.tournament_predictions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own tournament predictions" on public.tournament_predictions;
create policy "users can update own tournament predictions"
on public.tournament_predictions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "tournament results are readable by authenticated users" on public.tournament_results;
create policy "tournament results are readable by authenticated users"
on public.tournament_results
for select
to authenticated
using (true);

drop policy if exists "admins can update tournament results" on public.tournament_results;
create policy "admins can update tournament results"
on public.tournament_results
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
);

create or replace function public.close_started_matches_with_null_predictions()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.predictions (
    user_id,
    match_id,
    predicted_home_score,
    predicted_away_score,
    points
  )
  select
    p.id,
    m.id,
    null,
    null,
    0
  from public.profiles p
  cross join public.matches m
  left join public.predictions pr
    on pr.user_id = p.id
    and pr.match_id = m.id
  where m.kickoff_at <= now()
    and pr.id is null
  on conflict (user_id, match_id) do nothing;
end;
$$;

grant execute on function public.close_started_matches_with_null_predictions() to authenticated;

create or replace view public.leaderboard as
select
  p.id as user_id,
  p.display_name,
  (
    coalesce(sum(pr.points), 0)
    + case
        when tr.winner is not null and tp.winner = tr.winner then 10
        else 0
      end
    + (
      select count(*)::integer * 5
      from unnest(tp.semi_finalists) guessed(country)
      where guessed.country = any(tr.semi_finalists)
    )
  )::integer as total_points,
  count(pr.id)::integer as predictions_count,
  count(*) filter (where pr.points = 3)::integer as exact_scores_count,
  count(*) filter (where pr.points = 1)::integer as correct_results_count
from public.profiles p
left join public.predictions pr on pr.user_id = p.id
left join public.tournament_predictions tp on tp.user_id = p.id
left join public.tournament_results tr on tr.id = true
group by p.id, p.display_name, tp.winner, tp.semi_finalists, tr.winner, tr.semi_finalists
order by total_points desc, exact_scores_count desc, correct_results_count desc, display_name asc;

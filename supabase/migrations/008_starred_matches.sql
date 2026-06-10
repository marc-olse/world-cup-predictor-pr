alter table public.matches
add column if not exists is_starred boolean not null default false;

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
  count(*) filter (where pr.points in (3, 6))::integer as exact_scores_count,
  count(*) filter (where pr.points in (1, 2))::integer as correct_results_count
from public.profiles p
left join public.predictions pr on pr.user_id = p.id
left join public.tournament_predictions tp on tp.user_id = p.id
left join public.tournament_results tr on tr.id = true
group by p.id, p.display_name, tp.winner, tp.semi_finalists, tr.winner, tr.semi_finalists
order by total_points desc, exact_scores_count desc, correct_results_count desc, display_name asc;

create or replace view public.leaderboard as
select
  p.id as user_id,
  p.display_name,
  coalesce(sum(pr.points), 0)::integer as total_points,
  count(pr.id)::integer as predictions_count,
  count(*) filter (where pr.points = 3)::integer as exact_scores_count,
  count(*) filter (where pr.points = 1)::integer as correct_results_count
from public.profiles p
left join public.predictions pr on pr.user_id = p.id
group by p.id, p.display_name
order by total_points desc, exact_scores_count desc, correct_results_count desc, display_name asc;

grant select on public.leaderboard to authenticated;

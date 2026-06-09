import type { LeaderboardRow } from '@/lib/types';

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  if (rows.length === 0) {
    return <p className="panel text-sm text-ink/65">No leaderboard rows yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-ink/10 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-ink/5 text-xs uppercase tracking-wide text-ink/60">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Display name</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Exact</th>
            <th className="px-4 py-3">Result</th>
            <th className="px-4 py-3">Predictions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {rows.map((row, index) => (
            <tr key={row.user_id}>
              <td className="px-4 py-3 font-semibold">{index + 1}</td>
              <td className="px-4 py-3">{row.display_name}</td>
              <td className="px-4 py-3 font-bold text-turf">{row.total_points}</td>
              <td className="px-4 py-3">{row.exact_scores_count}</td>
              <td className="px-4 py-3">{row.correct_results_count}</td>
              <td className="px-4 py-3">{row.predictions_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import type { LeaderboardRow } from '@/lib/types';

export type LeaderboardStarStats = Record<
  string,
  {
    exact: number;
    result: number;
  }
>;

function formatPercentage(value: number, total: number) {
  if (total === 0) {
    return '0%';
  }

  return `${Math.round((value / total) * 100)}%`;
}

function StatWithStarred({ starred, total }: { starred: number; total: number }) {
  return (
    <span>
      {total}{' '}
      <span className="whitespace-nowrap text-ink/55">({starred})</span>
    </span>
  );
}

function RankMarker({ index, totalRows }: { index: number; totalRows: number }) {
  const rank = index + 1;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  const inBottomTwo = totalRows > 3 && index >= totalRows - 2;

  return (
    <span className="inline-flex min-w-16 items-center gap-2 font-semibold">
      <span>{rank}</span>
      {medal ? (
        <span aria-label={`Position ${rank} medal`} className="text-lg leading-none">
          {medal}
        </span>
      ) : null}
      {inBottomTwo ? (
        <span aria-label="Bottom two" className="text-lg leading-none" title="Bottom two">
          🤡
        </span>
      ) : null}
    </span>
  );
}

export function LeaderboardTable({
  rows,
  starStats = {},
}: {
  rows: LeaderboardRow[];
  starStats?: LeaderboardStarStats;
}) {
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
            <th className="px-4 py-3">Points</th>
            <th className="px-4 py-3">Exact (⭐)</th>
            <th className="px-4 py-3">Result (⭐)</th>
            <th className="px-4 py-3">Exact %</th>
            <th className="px-4 py-3">Result %</th>
            <th className="px-4 py-3">#Predictions sent</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {rows.map((row, index) => {
            const starred = starStats[row.user_id] ?? { exact: 0, result: 0 };

            return (
              <tr key={row.user_id}>
                <td className="px-4 py-3">
                  <RankMarker index={index} totalRows={rows.length} />
                </td>
                <td className="px-4 py-3">{row.display_name}</td>
                <td className="px-4 py-3 font-bold text-turf">{row.total_points}</td>
                <td className="px-4 py-3">
                  <StatWithStarred
                    starred={starred.exact}
                    total={row.exact_scores_count}
                  />
                </td>
                <td className="px-4 py-3">
                  <StatWithStarred
                    starred={starred.result}
                    total={row.correct_results_count}
                  />
                </td>
                <td className="px-4 py-3 font-semibold text-ink/70">
                  {formatPercentage(row.exact_scores_count, row.predictions_count)}
                </td>
                <td className="px-4 py-3 font-semibold text-ink/70">
                  {formatPercentage(row.correct_results_count, row.predictions_count)}
                </td>
                <td className="px-4 py-3">{row.predictions_count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

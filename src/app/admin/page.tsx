import { recalculateMatchPoints, updateMatchScore } from '@/actions/admin';
import { Notice } from '@/components/Notice';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { MatchStatus } from '@/lib/types';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

const statuses: MatchStatus[] = ['scheduled', 'live', 'finished'];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; recalculated?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const supabase = await createClient();
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_at', { ascending: true });

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold">Admin scores</h1>
        <p className="mt-2 text-sm text-ink/60">
          Update match status, enter final scores, and recalculate prediction points.
        </p>
      </div>
      <Notice
        success={
          params.saved
            ? 'Match score saved and points recalculated.'
            : params.recalculated
              ? 'Points recalculated.'
              : undefined
        }
      />
      {matches?.length ? (
        <div className="grid gap-4">
          {matches.map((match) => (
            <article className="panel" key={match.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-ink/60">{formatDateTime(match.kickoff_at)}</p>
                  <h2 className="mt-1 text-lg font-bold">
                    {match.home_team} vs {match.away_team}
                  </h2>
                </div>
                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
                  {match.status}
                </span>
              </div>

              <form
                action={updateMatchScore}
                className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <input name="matchId" type="hidden" value={match.id} />
                <label className="grid gap-1 text-sm font-medium">
                  Home score
                  <input
                    className="field"
                    defaultValue={match.home_score ?? ''}
                    min="0"
                    name="homeScore"
                    placeholder="0"
                    type="number"
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Away score
                  <input
                    className="field"
                    defaultValue={match.away_score ?? ''}
                    min="0"
                    name="awayScore"
                    placeholder="0"
                    type="number"
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Status
                  <select className="field" defaultValue={match.status} name="status">
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="btn-primary self-end" type="submit">
                  Save
                </button>
              </form>
              <form action={recalculateMatchPoints} className="mt-3">
                <input name="matchId" type="hidden" value={match.id} />
                <button className="btn-secondary" type="submit">
                  Recalculate points
                </button>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <p className="panel text-sm text-ink/65">No matches have been seeded yet.</p>
      )}
    </section>
  );
}

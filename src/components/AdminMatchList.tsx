'use client';

import { useMemo, useState } from 'react';

import {
  recalculateMatchPoints,
  toggleMatchStar,
  updateMatchScore,
} from '@/actions/admin';
import { formatUkDate, getUkScheduleDateKey } from '@/lib/fixtures';
import type { Match, MatchStatus } from '@/lib/types';

const statuses: MatchStatus[] = ['scheduled', 'live', 'finished'];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function matchesSearch(match: Match, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const dateKey = getUkScheduleDateKey(match.kickoff_at);
  const dateLabel = formatUkDate(`${dateKey}T09:00:00+01:00`).toLowerCase();

  return (
    dateKey.includes(normalizedQuery) ||
    dateLabel.includes(normalizedQuery) ||
    match.home_team.toLowerCase().startsWith(normalizedQuery) ||
    match.away_team.toLowerCase().startsWith(normalizedQuery)
  );
}

export function AdminMatchList({ matches }: { matches: Match[] }) {
  const [query, setQuery] = useState('');
  const filteredMatches = useMemo(
    () => matches.filter((match) => matchesSearch(match, query)),
    [matches, query],
  );

  if (!matches.length) {
    return <p className="panel text-sm text-ink/65">No matches have been seeded yet.</p>;
  }

  return (
    <div className="grid gap-4">
      <div className="sticky top-0 z-20 -mx-4 border-y border-ink/10 bg-chalk/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-lg sm:border sm:bg-white sm:shadow-sm">
        <label className="grid gap-2 text-sm font-semibold">
          Search by day or country
          <input
            className="field"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type Friday, 2026-06-19, England..."
            type="search"
            value={query}
          />
        </label>
        <p className="mt-2 text-xs text-ink/55">
          Showing {filteredMatches.length} of {matches.length} games.
        </p>
      </div>

      {filteredMatches.length ? (
        filteredMatches.map((match) => (
          <article className="panel" key={match.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-ink/60">{formatDateTime(match.kickoff_at)}</p>
                <h2 className="mt-1 text-lg font-bold">
                  {match.home_team} vs {match.away_team}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {match.is_starred ? (
                  <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
                    Star game · double points
                  </span>
                ) : null}
                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
                  {match.status}
                </span>
              </div>
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
            <div className="mt-3 flex flex-wrap gap-2">
              <form action={toggleMatchStar}>
                <input name="matchId" type="hidden" value={match.id} />
                <input
                  name="isStarred"
                  type="hidden"
                  value={match.is_starred ? 'true' : 'false'}
                />
                <button
                  className={
                    match.is_starred
                      ? 'btn-secondary'
                      : 'btn-primary bg-gold text-ink hover:bg-gold/90'
                  }
                  type="submit"
                >
                  {match.is_starred ? 'De-star game' : 'Star game'}
                </button>
              </form>
              <form action={recalculateMatchPoints}>
                <input name="matchId" type="hidden" value={match.id} />
                <button className="btn-secondary" type="submit">
                  Recalculate points
                </button>
              </form>
            </div>
          </article>
        ))
      ) : (
        <p className="panel text-sm text-ink/65">No games match that search.</p>
      )}
    </div>
  );
}

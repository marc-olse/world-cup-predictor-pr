'use client';

import { useMemo, useState } from 'react';

import { BulkMatchdaySubmitButton } from '@/components/BulkMatchdaySubmitButton';
import { CompactPredictionForm } from '@/components/CompactPredictionForm';
import { countryFlag } from '@/lib/countries';
import {
  formatUkDate,
  formatUkKickoffTime,
  getFixtureMeta,
  getUkScheduleDateKey,
  groupMatchesByUkDate,
} from '@/lib/fixtures';
import type { Match, Prediction } from '@/lib/types';

function TeamBadge({ name }: { name: string }) {
  return (
    <div className="grid min-w-0 justify-items-center gap-2 text-center">
      <span
        aria-hidden="true"
        className="grid h-14 w-14 place-items-center rounded-lg bg-white text-4xl shadow-sm ring-1 ring-ink/10"
      >
        {countryFlag(name)}
      </span>
      <span className="max-w-24 break-words text-xs font-black uppercase leading-tight text-ink sm:max-w-32">
        {name === 'United States' ? 'USA' : name}
      </span>
    </div>
  );
}

function matchesSearch(match: Match, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const dateKey = getUkScheduleDateKey(match.kickoff_at);
  const dateLabel = formatUkDate(`${dateKey}T09:00:00+01:00`).toLowerCase();
  const teamsMatch = [match.home_team, match.away_team].some((team) =>
    team.toLowerCase().startsWith(normalizedQuery),
  );

  return teamsMatch || dateKey.includes(normalizedQuery) || dateLabel.includes(normalizedQuery);
}

export function MatchesList({
  matches,
  persistedMatchIds,
  predictions,
  returnTo = '/matches',
  showBulkSubmit = false,
  showSearch = true,
}: {
  matches: Match[];
  persistedMatchIds: string[];
  predictions: Prediction[];
  returnTo?: string;
  showBulkSubmit?: boolean;
  showSearch?: boolean;
}) {
  const [query, setQuery] = useState('');
  const persisted = useMemo(() => new Set(persistedMatchIds), [persistedMatchIds]);
  const predictionsByMatch = useMemo(
    () => new Map(predictions.map((prediction) => [prediction.match_id, prediction])),
    [predictions],
  );
  const filteredMatches = useMemo(
    () => matches.filter((match) => matchesSearch(match, query)),
    [matches, query],
  );

  return (
    <div className="grid gap-5">
      {showSearch ? (
        <div className="sticky top-0 z-20 -mx-4 border-y border-ink/10 bg-chalk/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-lg sm:border sm:bg-white sm:shadow-sm">
          <label className="grid gap-2 text-sm font-semibold">
            Search by country or date
            <input
              className="field"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type Bra, England, 2026-06-12, Friday..."
              type="search"
              value={query}
            />
          </label>
          <p className="mt-2 text-xs text-ink/55">
            Showing {filteredMatches.length} of {matches.length} games.
          </p>
        </div>
      ) : null}

      {showBulkSubmit ? <BulkMatchdaySubmitButton /> : null}

      {filteredMatches.length ? (
        <div className="grid gap-7">
          {groupMatchesByUkDate(filteredMatches).map((day) => (
            <section className="grid gap-3" key={day.dateKey}>
              <div className="sticky top-[88px] z-10 -mx-4 border-y border-ink/10 bg-chalk/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
                <h2 className="text-lg font-bold text-ink">{day.label}</h2>
              </div>

              <div className="grid gap-3">
                {day.matches.map((match) => {
                  const fixture = getFixtureMeta(match);
                  const prediction = predictionsByMatch.get(match.id);

                  return (
                    <article
                      className="overflow-hidden rounded-lg border border-ink/10 bg-[#ededee] shadow-sm"
                      key={match.id}
                    >
                      <div className="grid grid-cols-[1rem_minmax(0,1fr)_1rem] items-center gap-1 border-b border-ink/10 bg-white/55 px-3 py-3 text-[0.58rem] font-black uppercase tracking-normal text-ink/65 sm:grid-cols-[1.5rem_minmax(0,1fr)_1.5rem] sm:gap-2 sm:px-4 sm:text-xs sm:tracking-[0.12em]">
                        <span aria-hidden="true" />
                        <span className="min-w-0 truncate whitespace-nowrap text-center">
                          {formatUkKickoffTime(match.kickoff_at)} |{' '}
                          {fixture?.stage ?? 'World Cup'} | {fixture?.venue ?? 'TBC'}
                        </span>
                        <span aria-label={match.is_starred ? 'Star game' : undefined} className="text-right text-sm leading-none sm:text-base">
                          {match.is_starred ? '⭐' : null}
                        </span>
                      </div>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 px-4 py-4">
                        <TeamBadge name={match.home_team} />
                        <div className="grid justify-items-center">
                          {persisted.has(match.id) ? (
                            <CompactPredictionForm
                              match={match}
                              prediction={prediction}
                              returnTo={returnTo}
                            />
                          ) : (
                            <p className="rounded-lg border-2 border-ink/35 bg-white/20 px-4 py-3 text-center text-sm font-semibold text-ink/65">
                              Seed this fixture in Supabase to submit a score.
                            </p>
                          )}
                        </div>
                        <TeamBadge name={match.away_team} />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="panel text-sm text-ink/65">No games match that country search.</p>
      )}
    </div>
  );
}

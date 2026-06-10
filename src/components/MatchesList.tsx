'use client';

import { useMemo, useState } from 'react';

import { CompactPredictionForm } from '@/components/CompactPredictionForm';
import { countryFlag } from '@/lib/countries';
import {
  formatUkKickoffTime,
  getFixtureMeta,
  groupMatchesByUkDate,
} from '@/lib/fixtures';
import type { Match, Prediction } from '@/lib/types';

function TeamName({ name }: { name: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span aria-hidden="true" className="shrink-0 text-2xl leading-none">
        {countryFlag(name)}
      </span>
      <span className="truncate">{name}</span>
    </span>
  );
}

function matchesCountryPrefix(match: Match, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [match.home_team, match.away_team].some((team) =>
    team.toLowerCase().startsWith(normalizedQuery),
  );
}

function formatPredictionScore(
  prediction?: Pick<Prediction, 'predicted_home_score' | 'predicted_away_score'> | null,
) {
  if (!prediction) {
    return 'None yet';
  }

  if (
    prediction.predicted_home_score === null ||
    prediction.predicted_away_score === null
  ) {
    return 'Auto entry';
  }

  return `${prediction.predicted_home_score}-${prediction.predicted_away_score}`;
}

export function MatchesList({
  matches,
  persistedMatchIds,
  predictions,
  returnTo = '/matches',
}: {
  matches: Match[];
  persistedMatchIds: string[];
  predictions: Prediction[];
  returnTo?: string;
}) {
  const [query, setQuery] = useState('');
  const persisted = useMemo(() => new Set(persistedMatchIds), [persistedMatchIds]);
  const predictionsByMatch = useMemo(
    () => new Map(predictions.map((prediction) => [prediction.match_id, prediction])),
    [predictions],
  );
  const filteredMatches = useMemo(
    () => matches.filter((match) => matchesCountryPrefix(match, query)),
    [matches, query],
  );

  return (
    <div className="grid gap-5">
      <div className="sticky top-0 z-20 -mx-4 border-y border-ink/10 bg-chalk/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-lg sm:border sm:bg-white sm:shadow-sm">
        <label className="grid gap-2 text-sm font-semibold">
          Search by country
          <input
            className="field"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type first letters, e.g. Bra, Eng, Mex"
            type="search"
            value={query}
          />
        </label>
        <p className="mt-2 text-xs text-ink/55">
          Showing {filteredMatches.length} of {matches.length} games.
        </p>
      </div>

      {filteredMatches.length ? (
        <div className="grid gap-7">
          {groupMatchesByUkDate(filteredMatches).map((day) => (
            <section className="grid gap-3" key={day.dateKey}>
              <div className="sticky top-[88px] z-10 -mx-4 border-y border-ink/10 bg-chalk/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
                <h2 className="text-lg font-bold text-ink">{day.label}</h2>
              </div>

              <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
                {day.matches.map((match, index) => {
                  const fixture = getFixtureMeta(match);
                  const prediction = predictionsByMatch.get(match.id);

                  return (
                    <article
                      className={`grid gap-3 p-4 ${
                        index === 0 ? '' : 'border-t border-ink/10'
                      } lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start`}
                      key={match.id}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
                          <span>{formatUkKickoffTime(match.kickoff_at)}</span>
                          {fixture ? <span>{fixture.stage}</span> : null}
                        </div>
                        <h3 className="mt-2 grid min-w-0 gap-1 text-base font-bold text-ink sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
                          <TeamName name={match.home_team} />
                          <span className="hidden text-sm text-ink/35 sm:inline">vs</span>
                          <TeamName name={match.away_team} />
                        </h3>
                        {fixture ? (
                          <p className="mt-2 truncate text-sm text-ink/55">
                            {fixture.venue}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs font-medium text-ink/50">
                          Your prediction: {formatPredictionScore(prediction)}
                        </p>
                      </div>

                      <div className="min-w-0 rounded-md border border-ink/10 bg-chalk px-3 py-2">
                        {persisted.has(match.id) ? (
                          <CompactPredictionForm
                            match={match}
                            prediction={prediction}
                            returnTo={returnTo}
                          />
                        ) : (
                          <p className="text-sm text-ink/55">
                            Seed this fixture in Supabase to submit a score.
                          </p>
                        )}
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

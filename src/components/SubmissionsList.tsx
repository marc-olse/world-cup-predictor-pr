'use client';

import { useMemo, useState } from 'react';

import { countryFlag } from '@/lib/countries';
import {
  formatUkKickoffTime,
  getFixtureMeta,
  groupMatchesByUkDate,
} from '@/lib/fixtures';
import type { Match, Prediction, Profile } from '@/lib/types';

type SubmittedPrediction = Prediction & {
  profiles: Pick<Profile, 'display_name'> | null;
};

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/London',
  }).format(new Date(value));
}

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

function formatPredictionScore(
  prediction: Pick<Prediction, 'predicted_home_score' | 'predicted_away_score'>,
) {
  if (
    prediction.predicted_home_score === null ||
    prediction.predicted_away_score === null
  ) {
    return 'Auto entry';
  }

  return `${prediction.predicted_home_score}-${prediction.predicted_away_score}`;
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

export function SubmissionsList({
  matches,
  submissions,
}: {
  matches: Match[];
  submissions: SubmittedPrediction[];
}) {
  const [query, setQuery] = useState('');
  const submissionsByMatch = useMemo(() => {
    const grouped = new Map<string, SubmittedPrediction[]>();

    for (const submission of submissions) {
      grouped.set(submission.match_id, [
        ...(grouped.get(submission.match_id) ?? []),
        submission,
      ]);
    }

    return grouped;
  }, [submissions]);
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
                  const matchSubmissions = submissionsByMatch.get(match.id) ?? [];

                  return (
                    <article
                      className={`grid gap-3 p-4 ${
                        index === 0 ? '' : 'border-t border-ink/10'
                      } lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)] lg:items-start`}
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
                      </div>

                      <div className="min-w-0">
                        {matchSubmissions.length ? (
                          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                            {matchSubmissions.map((submission) => (
                              <li
                                className="rounded-md border border-ink/10 bg-chalk px-3 py-2"
                                key={submission.id}
                              >
                                <div className="flex items-baseline justify-between gap-3">
                                  <p className="truncate text-sm font-semibold">
                                    {submission.profiles?.display_name ?? 'Player'}
                                  </p>
                                  <p className="shrink-0 text-lg font-bold text-turf">
                                    {formatPredictionScore(submission)}
                                  </p>
                                </div>
                                <p className="mt-1 truncate text-xs text-ink/55">
                                  Updated {formatUpdatedAt(submission.updated_at)}
                                </p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="rounded-md border border-dashed border-ink/15 px-3 py-2 text-sm text-ink/55">
                            No submitted scores yet.
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

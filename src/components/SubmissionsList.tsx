'use client';

import { useMemo, useState } from 'react';

import { countryFlag } from '@/lib/countries';
import {
  formatUkDate,
  formatUkKickoffTime,
  getFixtureMeta,
  getUkScheduleDateKey,
  groupMatchesByUkDate,
} from '@/lib/fixtures';
import { calculatePredictionPoints } from '@/lib/scoring';
import type { Match, Prediction, Profile } from '@/lib/types';

type SubmittedPrediction = Prediction & {
  profiles: Pick<Profile, 'display_name'> | null;
};

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

function formatRealResult(match: Match) {
  if (match.home_score === null || match.away_score === null) {
    return 'Pending';
  }

  return `${match.home_score}-${match.away_score}`;
}

function statusLabel(status: Match['status']) {
  return status[0].toUpperCase() + status.slice(1);
}

function statusClass(status: Match['status']) {
  if (status === 'finished') {
    return 'bg-turf/15 text-turf ring-turf/20';
  }

  if (status === 'live') {
    return 'bg-gold/20 text-ink ring-gold/30';
  }

  return 'bg-ink/5 text-ink/55 ring-ink/10';
}

function predictionClass(match: Match, prediction: SubmittedPrediction) {
  const points = calculatePredictionPoints({
    actualAwayScore: match.away_score,
    actualHomeScore: match.home_score,
    predictedAwayScore: prediction.predicted_away_score,
    predictedHomeScore: prediction.predicted_home_score,
  });

  if (points === 3) {
    return 'border-turf/30 bg-turf/15';
  }

  if (points === 1) {
    return 'border-gold/40 bg-gold/20';
  }

  return 'border-ink/10 bg-white/75';
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
    () => matches.filter((match) => matchesSearch(match, query)),
    [matches, query],
  );

  return (
    <div className="grid gap-5">
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
                  const matchSubmissions = submissionsByMatch.get(match.id) ?? [];

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
                      <div className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,0.72fr)_minmax(340px,1.28fr)] lg:items-start">
                        <div className="grid gap-3">
                          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
                            <TeamBadge name={match.home_team} />
                            <div className="grid justify-items-center gap-2 pt-2 text-center">
                              <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-ink/45">
                                Result
                              </p>
                              <p
                                className={`font-black ${
                                  match.home_score === null || match.away_score === null
                                    ? 'text-sm text-ink/40'
                                    : 'text-2xl text-ink'
                                }`}
                              >
                                {formatRealResult(match)}
                              </p>
                              <span
                                className={`rounded-full px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] ring-1 ${statusClass(
                                  match.status,
                                )}`}
                              >
                                {statusLabel(match.status)}
                              </span>
                            </div>
                            <TeamBadge name={match.away_team} />
                          </div>
                        </div>

                        <div className="min-w-0">
                        {matchSubmissions.length ? (
                          <ul className="grid grid-cols-[repeat(auto-fit,minmax(112px,1fr))] gap-1.5">
                            {matchSubmissions.map((submission) => (
                              <li
                                className={`rounded-md border px-2 py-1.5 ${predictionClass(
                                  match,
                                  submission,
                                )}`}
                                key={submission.id}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="min-w-0 truncate text-xs font-semibold">
                                    {submission.profiles?.display_name ?? 'Player'}
                                  </p>
                                  <p className="shrink-0 text-sm font-black text-ink">
                                    {formatPredictionScore(submission)}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="rounded-md border border-dashed border-ink/15 px-3 py-2 text-sm text-ink/55">
                            No submitted scores yet.
                          </p>
                        )}
                        </div>
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

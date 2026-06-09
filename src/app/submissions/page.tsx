import { countryFlag } from '@/lib/countries';
import {
  fixtureToMatch,
  formatUkKickoffTime,
  getFixtureMeta,
  groupMatchesByUkDate,
  worldCupFixtures,
} from '@/lib/fixtures';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Match, Prediction, Profile } from '@/lib/types';

type SubmittedPrediction = Prediction & {
  profiles: Pick<Profile, 'display_name'> | null;
};

function matchKey(match: Pick<Match, 'home_team' | 'away_team' | 'kickoff_at'>) {
  return `${match.home_team}|${match.away_team}|${new Date(match.kickoff_at).getTime()}`;
}

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

export default async function SubmissionsPage() {
  await requireUser();

  const supabase = await createClient();
  const { data: databaseMatches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_at', { ascending: true });

  const staticMatches = worldCupFixtures.map(fixtureToMatch);
  const databaseMatchesById = new Map(
    (databaseMatches ?? []).map((match) => [match.source_id ?? match.id, match]),
  );
  const databaseMatchesByKey = new Map(
    (databaseMatches ?? []).map((match) => [matchKey(match), match]),
  );
  const staticMatchKeys = new Set(staticMatches.map(matchKey));
  const staticSourceIds = new Set(staticMatches.map((match) => match.id));
  const matches = [
    ...staticMatches.map((staticMatch) => {
      return (
        databaseMatchesById.get(staticMatch.id) ??
        databaseMatchesByKey.get(matchKey(staticMatch)) ??
        staticMatch
      );
    }),
    ...(databaseMatches ?? []).filter(
      (match) =>
        !staticMatchKeys.has(matchKey(match)) &&
        !staticSourceIds.has(match.source_id ?? match.id),
    ),
  ].sort(
    (first, second) =>
      new Date(first.kickoff_at).getTime() - new Date(second.kickoff_at).getTime(),
  );
  const matchIds = matches.map((match) => match.id);

  const { data: submissions } = matchIds.length
    ? await supabase
        .from('predictions')
        .select('*, profiles(display_name)')
        .in('match_id', matchIds)
        .order('updated_at', { ascending: false })
    : { data: [] as SubmittedPrediction[] };

  const submissionsByMatch = new Map<string, SubmittedPrediction[]>();

  for (const submission of (submissions ?? []) as SubmittedPrediction[]) {
    submissionsByMatch.set(submission.match_id, [
      ...(submissionsByMatch.get(submission.match_id) ?? []),
      submission,
    ]);
  }

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Submitted results</h1>
        <p className="mt-2 text-sm text-ink/60">
          Latest stored score from every player, listed by game.
        </p>
      </div>

      <div className="grid gap-7">
        {groupMatchesByUkDate(matches).map((day) => (
          <section className="grid gap-3" key={day.dateKey}>
            <div className="sticky top-0 z-10 -mx-4 border-y border-ink/10 bg-chalk/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
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
                        <p className="mt-2 truncate text-sm text-ink/55">{fixture.venue}</p>
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
                                  {submission.predicted_home_score}-
                                  {submission.predicted_away_score}
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
    </section>
  );
}

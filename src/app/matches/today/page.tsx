import { MatchesList } from '@/components/MatchesList';
import { Notice } from '@/components/Notice';
import { SubmissionsList } from '@/components/SubmissionsList';
import { requireUser } from '@/lib/auth';
import {
  fixtureToMatch,
  formatUkDate,
  getCurrentUkScheduleWindow,
  getUkScheduleDateKey,
  worldCupFixtures,
} from '@/lib/fixtures';
import { createClient } from '@/lib/supabase/server';
import type { Match, Prediction, Profile } from '@/lib/types';

type SubmittedPrediction = Prediction & {
  profiles: Pick<Profile, 'display_name'> | null;
};

function matchKey(match: Pick<Match, 'home_team' | 'away_team' | 'kickoff_at'>) {
  return `${match.home_team}|${match.away_team}|${new Date(match.kickoff_at).getTime()}`;
}

function getStaticMatchesInWindow(start: Date, end: Date) {
  return worldCupFixtures
    .filter((fixture) => {
      const kickoff = new Date(fixture.kickoffAt);
      return kickoff >= start && kickoff < end;
    })
    .map(fixtureToMatch);
}

function scheduleWindowFromDateKey(dateKey: string) {
  const start = new Date(`${dateKey}T09:00:00+01:00`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    end,
    label: formatUkDate(start.toISOString()),
    start,
  };
}

function getFixtureMatchdayKeys() {
  return Array.from(
    new Set(worldCupFixtures.map((fixture) => getUkScheduleDateKey(fixture.kickoffAt))),
  ).sort();
}

function getNextFixtureWindow(referenceStart: Date) {
  const referenceTime = referenceStart.getTime();
  const key = getFixtureMatchdayKeys().find(
    (dateKey) => scheduleWindowFromDateKey(dateKey).end.getTime() > referenceTime,
  );

  return key ? scheduleWindowFromDateKey(key) : null;
}

function getPreviousFixtureWindow(referenceStart: Date) {
  const referenceTime = referenceStart.getTime();
  const key = getFixtureMatchdayKeys()
    .filter((dateKey) => scheduleWindowFromDateKey(dateKey).start.getTime() < referenceTime)
    .at(-1);

  return key ? scheduleWindowFromDateKey(key) : null;
}

function mergeWindowMatches(staticMatches: Match[], databaseMatches: Match[]) {
  const databaseMatchesById = new Map(databaseMatches.map((match) => [match.id, match]));
  const databaseMatchesBySourceId = new Map(
    databaseMatches
      .filter((match) => match.source_id)
      .map((match) => [match.source_id, match]),
  );
  const databaseMatchesByKey = new Map(
    databaseMatches.map((match) => [matchKey(match), match]),
  );

  return staticMatches
    .map((staticMatch) => {
      return (
        databaseMatchesById.get(staticMatch.id) ??
        databaseMatchesBySourceId.get(staticMatch.source_id) ??
        databaseMatchesByKey.get(matchKey(staticMatch)) ??
        staticMatch
      );
    })
    .sort(
      (first, second) =>
        new Date(first.kickoff_at).getTime() - new Date(second.kickoff_at).getTime(),
    );
}

export default async function TodaysMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const supabase = await createClient();
  await supabase.rpc('close_started_matches_with_null_predictions');

  const currentWindow = getCurrentUkScheduleWindow();
  const nextWindow = getNextFixtureWindow(currentWindow.start);
  const previousWindow = getPreviousFixtureWindow(nextWindow?.start ?? currentWindow.start);
  const queryStart = previousWindow?.start ?? currentWindow.start;
  const queryEnd = nextWindow?.end ?? currentWindow.end;

  const { data: windowMatches } = await supabase
    .from('matches')
    .select('*')
    .gte('kickoff_at', queryStart.toISOString())
    .lt('kickoff_at', queryEnd.toISOString())
    .order('kickoff_at', { ascending: true });

  const databaseMatches = windowMatches ?? [];
  const nextDatabaseMatches = nextWindow ? databaseMatches.filter((match) => {
    const kickoff = new Date(match.kickoff_at);
    return kickoff >= nextWindow.start && kickoff < nextWindow.end;
  }) : [];
  const previousDatabaseMatches = previousWindow ? databaseMatches.filter((match) => {
    const kickoff = new Date(match.kickoff_at);
    return kickoff >= previousWindow.start && kickoff < previousWindow.end;
  }) : [];

  const nextMatches = nextWindow
    ? mergeWindowMatches(
        getStaticMatchesInWindow(nextWindow.start, nextWindow.end),
        nextDatabaseMatches,
      )
    : [];
  const previousMatches = previousWindow
    ? mergeWindowMatches(
        getStaticMatchesInWindow(previousWindow.start, previousWindow.end),
        previousDatabaseMatches,
      )
    : [];

  const persistedNextMatchIds = new Set(nextDatabaseMatches.map((match) => match.id));
  const persistedPreviousMatchIds = new Set(
    previousDatabaseMatches.map((match) => match.id),
  );

  const { data: predictions } = persistedNextMatchIds.size
    ? await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)
        .in('match_id', Array.from(persistedNextMatchIds))
    : { data: [] as Prediction[] };

  const { data: submissions } = persistedPreviousMatchIds.size
    ? await supabase
        .from('predictions')
        .select('*, profiles(display_name)')
        .in('match_id', Array.from(persistedPreviousMatchIds))
        .order('updated_at', { ascending: false })
    : { data: [] as SubmittedPrediction[] };
  return (
    <section className="grid gap-8">
      <div className="grid gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-turf">
          Daily matchday
        </p>
        <h1 className="text-3xl font-bold">Next matchday predictions</h1>
        <p className="text-sm text-ink/60">
          Submit or update scores before each game starts. Star games count double!
        </p>
      </div>

      <Notice success={params.saved ? 'Prediction saved.' : undefined} />

      <section className="grid gap-4">
        {nextMatches.length ? (
          <MatchesList
            matches={nextMatches}
            persistedMatchIds={Array.from(persistedNextMatchIds)}
            predictions={predictions ?? []}
            returnTo="/matches/today"
            showSearch={false}
          />
        ) : (
          <p className="panel text-sm text-ink/65">
            No games are scheduled for the current matchday.
          </p>
        )}
      </section>

      <section className="grid gap-4 border-t border-ink/10 pt-8">
        <div>
          <h2 className="text-2xl font-bold">Previous matchday results</h2>
          <p className="mt-1 text-sm text-ink/60">
            Results and group predictions
            {previousWindow ? ` for ${previousWindow.label}.` : '.'}
          </p>
        </div>
        {previousMatches.length ? (
          <SubmissionsList
            matches={previousMatches}
            showSearch={false}
            submissions={((submissions ?? []) as SubmittedPrediction[])}
          />
        ) : (
          <p className="panel text-sm text-ink/65">
            No games were scheduled for the previous matchday.
          </p>
        )}
      </section>
    </section>
  );
}

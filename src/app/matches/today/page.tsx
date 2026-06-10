import { MatchesList } from '@/components/MatchesList';
import { Notice } from '@/components/Notice';
import { SubmissionsList } from '@/components/SubmissionsList';
import { requireUser } from '@/lib/auth';
import {
  fixtureToMatch,
  formatUkDate,
  getCurrentUkScheduleWindow,
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single();

  const todayWindow = getCurrentUkScheduleWindow();
  const yesterdayStart = new Date(todayWindow.start);
  yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
  const yesterdayEnd = new Date(todayWindow.start);

  const { data: windowMatches } = await supabase
    .from('matches')
    .select('*')
    .gte('kickoff_at', yesterdayStart.toISOString())
    .lt('kickoff_at', todayWindow.end.toISOString())
    .order('kickoff_at', { ascending: true });

  const databaseMatches = windowMatches ?? [];
  const todayDatabaseMatches = databaseMatches.filter((match) => {
    const kickoff = new Date(match.kickoff_at);
    return kickoff >= todayWindow.start && kickoff < todayWindow.end;
  });
  const yesterdayDatabaseMatches = databaseMatches.filter((match) => {
    const kickoff = new Date(match.kickoff_at);
    return kickoff >= yesterdayStart && kickoff < yesterdayEnd;
  });

  const todayMatches = mergeWindowMatches(
    getStaticMatchesInWindow(todayWindow.start, todayWindow.end),
    todayDatabaseMatches,
  );
  const yesterdayMatches = mergeWindowMatches(
    getStaticMatchesInWindow(yesterdayStart, yesterdayEnd),
    yesterdayDatabaseMatches,
  );

  const persistedTodayMatchIds = new Set(todayDatabaseMatches.map((match) => match.id));
  const persistedYesterdayMatchIds = new Set(
    yesterdayDatabaseMatches.map((match) => match.id),
  );

  const { data: predictions } = persistedTodayMatchIds.size
    ? await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)
        .in('match_id', Array.from(persistedTodayMatchIds))
    : { data: [] as Prediction[] };

  const { data: submissions } = persistedYesterdayMatchIds.size
    ? await supabase
        .from('predictions')
        .select('*, profiles(display_name)')
        .in('match_id', Array.from(persistedYesterdayMatchIds))
        .order('updated_at', { ascending: false })
    : { data: [] as SubmittedPrediction[] };

  const displayName = profile?.display_name ?? user.email ?? 'there';

  return (
    <section className="grid gap-8">
      <div className="grid gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-turf">
          Daily matchday
        </p>
        <h1 className="text-3xl font-bold">
          What are your predictions for today&apos;s games, {displayName}?
        </h1>
        <p className="text-sm text-ink/60">
          Showing the current matchday slate for {todayWindow.label}.
        </p>
      </div>

      <Notice success={params.saved ? 'Prediction saved.' : undefined} />

      <section className="grid gap-4">
        <div>
          <h2 className="text-2xl font-bold">Today&apos;s predictions</h2>
          <p className="mt-1 text-sm text-ink/60">
            Submit or update scores before each game starts.
          </p>
        </div>
        {todayMatches.length ? (
          <MatchesList
            matches={todayMatches}
            persistedMatchIds={Array.from(persistedTodayMatchIds)}
            predictions={predictions ?? []}
            returnTo="/matches/today"
          />
        ) : (
          <p className="panel text-sm text-ink/65">
            No games are scheduled for the current matchday.
          </p>
        )}
      </section>

      <section className="grid gap-4 border-t border-ink/10 pt-8">
        <div>
          <h2 className="text-2xl font-bold">Yesterday&apos;s results</h2>
          <p className="mt-1 text-sm text-ink/60">
            Results and group predictions for {formatUkDate(yesterdayStart.toISOString())}.
          </p>
        </div>
        {yesterdayMatches.length ? (
          <SubmissionsList
            matches={yesterdayMatches}
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

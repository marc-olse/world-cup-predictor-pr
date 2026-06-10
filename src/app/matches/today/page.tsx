import { DemoMatchCard } from '@/components/DemoMatchCard';
import { MatchCard } from '@/components/MatchCard';
import { Notice } from '@/components/Notice';
import { requireUser } from '@/lib/auth';
import {
  fixtureToMatch,
  getCurrentUkScheduleWindow,
  worldCupFixtures,
} from '@/lib/fixtures';
import { createClient } from '@/lib/supabase/server';
import type { Match, Prediction } from '@/lib/types';

function matchKey(match: Pick<Match, 'home_team' | 'away_team' | 'kickoff_at'>) {
  return `${match.home_team}|${match.away_team}|${new Date(match.kickoff_at).getTime()}`;
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
  const matchday = getCurrentUkScheduleWindow();
  const staticMatches = worldCupFixtures
    .filter((fixture) => {
      const kickoff = new Date(fixture.kickoffAt);
      return kickoff >= matchday.start && kickoff < matchday.end;
    })
    .map(fixtureToMatch);

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .gte('kickoff_at', matchday.start.toISOString())
    .lt('kickoff_at', matchday.end.toISOString())
    .order('kickoff_at', { ascending: true });

  const databaseMatchesById = new Map((matches ?? []).map((match) => [match.id, match]));
  const databaseMatchesBySourceId = new Map(
    (matches ?? [])
      .filter((match) => match.source_id)
      .map((match) => [match.source_id, match]),
  );
  const databaseMatchesByKey = new Map((matches ?? []).map((match) => [matchKey(match), match]));
  const matchIds = (matches ?? []).map((match) => match.id);
  const { data: predictions } = matchIds.length
    ? await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)
        .in('match_id', matchIds)
    : { data: [] as Prediction[] };

  const predictionsByMatch = new Map(
    (predictions ?? []).map((prediction) => [prediction.match_id, prediction]),
  );

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold">Today&apos;s matches</h1>
        <p className="mt-2 text-sm text-ink/60">
          Showing the current matchday slate for {matchday.label}.
        </p>
      </div>
      <Notice success={params.saved ? 'Prediction saved.' : undefined} />
      {staticMatches.length || matches?.length ? (
        <div className="grid gap-4">
          {staticMatches.map((staticMatch) => {
          const databaseMatch =
            databaseMatchesById.get(staticMatch.id) ??
            databaseMatchesBySourceId.get(staticMatch.source_id) ??
            databaseMatchesByKey.get(matchKey(staticMatch));

          return databaseMatch ? (
            <MatchCard
              key={databaseMatch.id}
              match={databaseMatch}
              prediction={predictionsByMatch.get(databaseMatch.id)}
              returnTo="/matches/today"
              showForm
            />
          ) : (
            <DemoMatchCard key={staticMatch.id} match={staticMatch} />
          );
          })}
        </div>
      ) : (
        <p className="panel text-sm text-ink/65">
          No games are scheduled for the current matchday.
        </p>
      )}
    </section>
  );
}

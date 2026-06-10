import { MatchesList } from '@/components/MatchesList';
import { Notice } from '@/components/Notice';
import { requireUser } from '@/lib/auth';
import { fixtureToMatch, worldCupFixtures } from '@/lib/fixtures';
import { createClient } from '@/lib/supabase/server';
import type { Match, Prediction } from '@/lib/types';

function matchKey(match: Pick<Match, 'home_team' | 'away_team' | 'kickoff_at'>) {
  return `${match.home_team}|${match.away_team}|${new Date(match.kickoff_at).getTime()}`;
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const supabase = await createClient();
  await supabase.rpc('close_started_matches_with_null_predictions');

  const { data: databaseMatches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_at', { ascending: true });

  const databaseMatchesById = new Map(
    (databaseMatches ?? []).map((match) => [match.id, match]),
  );
  const databaseMatchesBySourceId = new Map(
    (databaseMatches ?? [])
      .filter((match) => match.source_id)
      .map((match) => [match.source_id, match]),
  );
  const databaseMatchesByKey = new Map(
    (databaseMatches ?? []).map((match) => [matchKey(match), match]),
  );
  const matches = worldCupFixtures.map((fixture) => {
    const staticMatch = fixtureToMatch(fixture);
    return (
      databaseMatchesById.get(staticMatch.id) ??
      databaseMatchesBySourceId.get(staticMatch.source_id) ??
      databaseMatchesByKey.get(matchKey(staticMatch)) ??
      staticMatch
    );
  });
  const persistedMatchIds = new Set((databaseMatches ?? []).map((match) => match.id));

  const matchIds = matches.map((match) => match.id);
  const { data: predictions } = matchIds.length
    ? await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)
        .in('match_id', matchIds)
    : { data: [] as Prediction[] };

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold">Match Predictions</h1>
        <p className="mt-2 text-sm text-ink/60">
          All 104 fixtures, grouped by matchday with UK kick-off times.
        </p>
      </div>
      <Notice success={params.saved ? 'Prediction saved.' : undefined} />
      <MatchesList
        matches={matches}
        persistedMatchIds={Array.from(persistedMatchIds)}
        predictions={predictions ?? []}
        returnTo="/matches"
      />
    </section>
  );
}

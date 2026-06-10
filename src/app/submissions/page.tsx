import { SubmissionsList } from '@/components/SubmissionsList';
import {
  fixtureToMatch,
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

export default async function SubmissionsPage() {
  await requireUser();

  const supabase = await createClient();
  await supabase.rpc('close_started_matches_with_null_predictions');
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

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Results</h1>
        <p className="mt-2 text-sm text-ink/60">
          Match results and every stored prediction from the group.
        </p>
      </div>

      <SubmissionsList
        matches={matches}
        submissions={((submissions ?? []) as SubmittedPrediction[])}
      />
    </section>
  );
}

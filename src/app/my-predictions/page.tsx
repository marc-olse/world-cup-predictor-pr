import { Notice } from '@/components/Notice';
import { TournamentPredictionForm } from '@/components/TournamentPredictionForm';
import { TournamentPredictionsList } from '@/components/TournamentPredictionsList';
import { requireUser } from '@/lib/auth';
import { formatUkKickoffTime, worldCupFixtures } from '@/lib/fixtures';
import { createClient } from '@/lib/supabase/server';
import type { Profile, TournamentPrediction } from '@/lib/types';

type TournamentResult = {
  semi_finalists: string[];
  winner: string | null;
};

export default async function TournamentPredictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const supabase = await createClient();
  const { data: prediction } = await supabase
    .from('tournament_predictions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  const { data: allPredictions } = await supabase
    .from('tournament_predictions')
    .select('*');
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name');
  const { data: tournamentResult } = await supabase
    .from('tournament_results')
    .select('winner, semi_finalists')
    .eq('id', true)
    .maybeSingle();
  const firstFixture = [...worldCupFixtures].sort(
    (first, second) =>
      new Date(first.kickoffAt).getTime() - new Date(second.kickoffAt).getTime(),
  )[0];
  const profilesById = new Map(
    ((profiles ?? []) as Pick<Profile, 'display_name' | 'id'>[]).map((profile) => [
      profile.id,
      profile,
    ]),
  );
  const groupPredictions = ((allPredictions ?? []) as TournamentPrediction[])
    .map((entry) => ({
      displayName: profilesById.get(entry.user_id)?.display_name ?? 'Player',
      semiFinalists: entry.semi_finalists,
      userId: entry.user_id,
      winner: entry.winner,
    }))
    .sort((first, second) => first.displayName.localeCompare(second.displayName));

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold">Tournament Predictions</h1>
        <p className="mt-2 text-sm text-ink/60">
          Pick your tournament winner and four semi-finalists.
        </p>
      </div>
      <Notice success={params.saved ? 'Tournament predictions saved.' : undefined} />
      <TournamentPredictionForm
        firstKickoffAt={firstFixture.kickoffAt}
        firstKickoffLabel={formatUkKickoffTime(firstFixture.kickoffAt)}
        prediction={prediction}
      />
      <TournamentPredictionsList
        predictions={groupPredictions}
        trueSemiFinalists={
          ((tournamentResult as TournamentResult | null)?.semi_finalists ?? [])
        }
        trueWinner={(tournamentResult as TournamentResult | null)?.winner ?? null}
      />
    </section>
  );
}

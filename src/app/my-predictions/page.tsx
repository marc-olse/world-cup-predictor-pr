import { Notice } from '@/components/Notice';
import { TournamentPredictionForm } from '@/components/TournamentPredictionForm';
import { requireUser } from '@/lib/auth';
import { formatUkKickoffTime, worldCupFixtures } from '@/lib/fixtures';
import { createClient } from '@/lib/supabase/server';

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
  const firstFixture = [...worldCupFixtures].sort(
    (first, second) =>
      new Date(first.kickoffAt).getTime() - new Date(second.kickoffAt).getTime(),
  )[0];

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
    </section>
  );
}

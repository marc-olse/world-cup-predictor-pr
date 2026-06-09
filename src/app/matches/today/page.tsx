import { DemoMatchCard } from '@/components/DemoMatchCard';
import { MatchCard } from '@/components/MatchCard';
import { Notice } from '@/components/Notice';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Match, Prediction } from '@/lib/types';

const demoMatchday = {
  label: '12 June 2026',
  start: '2026-06-12T00:00:00.000Z',
  end: '2026-06-13T00:00:00.000Z',
};

const demoMatches: Match[] = [
  {
    id: 'demo-canada-bosnia',
    kickoff_at: '2026-06-12T18:00:00.000Z',
    home_team: 'Canada',
    away_team: 'Bosnia and Herzegovina',
    home_score: null,
    away_score: null,
    status: 'scheduled',
    created_at: '2026-06-09T00:00:00.000Z',
    updated_at: '2026-06-09T00:00:00.000Z',
  },
  {
    id: 'demo-qatar-switzerland',
    kickoff_at: '2026-06-12T21:00:00.000Z',
    home_team: 'Qatar',
    away_team: 'Switzerland',
    home_score: null,
    away_score: null,
    status: 'scheduled',
    created_at: '2026-06-09T00:00:00.000Z',
    updated_at: '2026-06-09T00:00:00.000Z',
  },
  {
    id: 'demo-usa-paraguay',
    kickoff_at: '2026-06-12T23:00:00.000Z',
    home_team: 'United States',
    away_team: 'Paraguay',
    home_score: null,
    away_score: null,
    status: 'scheduled',
    created_at: '2026-06-09T00:00:00.000Z',
    updated_at: '2026-06-09T00:00:00.000Z',
  },
];

export default async function TodaysMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const supabase = await createClient();

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .gte('kickoff_at', demoMatchday.start)
    .lt('kickoff_at', demoMatchday.end)
    .order('kickoff_at', { ascending: true });

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
        <h1 className="text-3xl font-bold">June 12 matches</h1>
        <p className="mt-2 text-sm text-ink/60">
          Showing games played on {demoMatchday.label}. Predictions are open for
          this demo matchday.
        </p>
      </div>
      <Notice success={params.saved ? 'Prediction saved.' : undefined} />
      {matches?.length ? (
        <div className="grid gap-4">
          {matches.map((match) => (
            <MatchCard
              forcePredictionOpen={match.status !== 'finished'}
              key={match.id}
              match={match}
              prediction={predictionsByMatch.get(match.id)}
              showForm
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          <p className="rounded-md border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-ink/70">
            Showing local demo fixtures. Run the updated Supabase seed file when
            you want these predictions to persist in the database.
          </p>
          {demoMatches.map((match) => (
            <DemoMatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </section>
  );
}

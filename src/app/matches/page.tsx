import { MatchCard } from '@/components/MatchCard';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Prediction } from '@/lib/types';

export default async function MatchesPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
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
        <h1 className="text-3xl font-bold">All matches</h1>
        <p className="mt-2 text-sm text-ink/60">Fixtures are ordered by kickoff time.</p>
      </div>
      {matches?.length ? (
        <div className="grid gap-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predictionsByMatch.get(match.id)}
            />
          ))}
        </div>
      ) : (
        <p className="panel text-sm text-ink/65">No matches have been seeded yet.</p>
      )}
    </section>
  );
}

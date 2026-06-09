import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Match } from '@/lib/types';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default async function MyPredictionsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const matchIds = (predictions ?? []).map((prediction) => prediction.match_id);
  const { data: matches } = matchIds.length
    ? await supabase.from('matches').select('*').in('id', matchIds)
    : { data: [] as Match[] };

  const matchesById = new Map((matches ?? []).map((match) => [match.id, match]));

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold">My predictions</h1>
        <p className="mt-2 text-sm text-ink/60">Your submitted scores and points.</p>
      </div>
      {predictions?.length ? (
        <div className="grid gap-3">
          {predictions.map((prediction) => {
            const match = matchesById.get(prediction.match_id);
            const finalScore =
              match && match.home_score !== null && match.away_score !== null
                ? `${match.home_score}-${match.away_score}`
                : 'Not entered';

            return (
              <article className="panel" key={prediction.id}>
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="text-sm text-ink/60">
                      {match ? formatDateTime(match.kickoff_at) : 'Match not found'}
                    </p>
                    <h2 className="mt-1 text-lg font-bold">
                      {match ? `${match.home_team} vs ${match.away_team}` : prediction.match_id}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-ink/60">Points</p>
                    <p className="text-2xl font-bold text-turf">{prediction.points}</p>
                  </div>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-ink/55">Predicted score</dt>
                    <dd className="font-semibold">
                      {prediction.predicted_home_score}-{prediction.predicted_away_score}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink/55">Final score</dt>
                    <dd className="font-semibold">{finalScore}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="panel text-sm text-ink/65">You have not submitted any predictions yet.</p>
      )}
    </section>
  );
}

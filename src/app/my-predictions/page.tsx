import { saveTournamentPredictions } from '@/actions/tournament';
import { Notice } from '@/components/Notice';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { teamOptionLabel, tournamentTeams } from '@/lib/teams';

function TeamSelect({
  defaultValue,
  label,
  name,
}: {
  defaultValue?: string | null;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <select className="field" defaultValue={defaultValue ?? ''} name={name}>
        <option value="">Choose a country</option>
        {tournamentTeams.map((team) => (
          <option key={team} value={team}>
            {teamOptionLabel(team)}
          </option>
        ))}
      </select>
    </label>
  );
}

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

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold">Tournament Predictions</h1>
        <p className="mt-2 text-sm text-ink/60">
          Pick your tournament winner and four semi-finalists.
        </p>
      </div>
      <Notice success={params.saved ? 'Tournament predictions saved.' : undefined} />
      <form action={saveTournamentPredictions} className="grid gap-5">
        <section className="panel grid gap-4">
          <div>
            <h2 className="text-xl font-bold">Winner</h2>
            <p className="mt-1 text-sm text-ink/60">Correct winner earns +10 points.</p>
          </div>
          <TeamSelect defaultValue={prediction?.winner} label="Winner" name="winner" />
        </section>

        <section className="panel grid gap-4">
          <div>
            <h2 className="text-xl font-bold">Semi-finalists</h2>
            <p className="mt-1 text-sm text-ink/60">
              Each correct semi-finalist earns +5 points.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((index) => (
              <TeamSelect
                defaultValue={prediction?.semi_finalists?.[index]}
                key={index}
                label={`Semi-finalist ${index + 1}`}
                name={`semiFinalist${index + 1}`}
              />
            ))}
          </div>
        </section>

        <button className="btn-primary w-fit bg-coral hover:bg-coral/90" type="submit">
          Save predictions
        </button>
      </form>
    </section>
  );
}

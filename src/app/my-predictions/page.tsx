import { saveTournamentPredictions } from '@/actions/tournament';
import { Notice } from '@/components/Notice';
import { requireUser } from '@/lib/auth';
import { formatUkKickoffTime, worldCupFixtures } from '@/lib/fixtures';
import { createClient } from '@/lib/supabase/server';
import { teamOptionLabel, tournamentTeams } from '@/lib/teams';

function TeamSelect({
  defaultValue,
  disabled,
  label,
  name,
}: {
  defaultValue?: string | null;
  disabled: boolean;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <select className="field disabled:bg-ink/5 disabled:text-ink/40" defaultValue={defaultValue ?? ''} disabled={disabled} name={name}>
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
  const firstFixture = [...worldCupFixtures].sort(
    (first, second) =>
      new Date(first.kickoffAt).getTime() - new Date(second.kickoffAt).getTime(),
  )[0];
  const tournamentLocked = Date.now() >= new Date(firstFixture.kickoffAt).getTime();

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold">Tournament Predictions</h1>
        <p className="mt-2 text-sm text-ink/60">
          Pick your tournament winner and four semi-finalists.
        </p>
        {tournamentLocked ? (
          <p className="mt-2 rounded-md bg-ink/5 px-3 py-2 text-sm font-semibold text-ink/60">
            Tournament predictions closed when the first game kicked off.
          </p>
        ) : (
          <p className="mt-2 text-sm text-ink/60">
            Open until the first game kicks off at {formatUkKickoffTime(firstFixture.kickoffAt)}.
          </p>
        )}
      </div>
      <Notice success={params.saved ? 'Tournament predictions saved.' : undefined} />
      <form action={saveTournamentPredictions} className="grid gap-5">
        <section className="panel grid gap-4">
          <div>
            <h2 className="text-xl font-bold">Winner</h2>
            <p className="mt-1 text-sm text-ink/60">Correct winner earns +10 points.</p>
          </div>
          <TeamSelect
            defaultValue={prediction?.winner}
            disabled={tournamentLocked}
            label="Winner"
            name="winner"
          />
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
                disabled={tournamentLocked}
                key={index}
                label={`Semi-finalist ${index + 1}`}
                name={`semiFinalist${index + 1}`}
              />
            ))}
          </div>
        </section>

        <button
          className="btn-primary w-fit bg-coral hover:bg-coral/90 disabled:bg-ink/15 disabled:text-ink/45"
          disabled={tournamentLocked}
          type="submit"
        >
          {tournamentLocked ? 'Predictions closed' : 'Save predictions'}
        </button>
      </form>
    </section>
  );
}

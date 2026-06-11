'use client';

import { saveTournamentPredictions } from '@/actions/tournament';
import { teamOptionLabel, tournamentTeams } from '@/lib/teams';
import type { TournamentPrediction } from '@/lib/types';
import { useKickoffLock } from '@/lib/use-kickoff-lock';

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
      <select
        className="field disabled:bg-ink/5 disabled:text-ink/40"
        defaultValue={defaultValue ?? ''}
        disabled={disabled}
        name={name}
      >
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

export function TournamentPredictionForm({
  firstKickoffAt,
  firstKickoffLabel,
  prediction,
}: {
  firstKickoffAt: string;
  firstKickoffLabel: string;
  prediction?: TournamentPrediction | null;
}) {
  const locked = useKickoffLock(firstKickoffAt);

  return (
    <>
      {locked ? (
        <p className="rounded-md bg-ink/5 px-3 py-2 text-sm font-semibold text-ink/60">
          Tournament predictions closed when the first game kicked off.
        </p>
      ) : (
        <p className="text-sm text-ink/60">
          Open until the first game kicks off at {firstKickoffLabel}.
        </p>
      )}

      <form action={saveTournamentPredictions} className="grid gap-5">
        <section className="panel grid gap-4">
          <div>
            <h2 className="text-xl font-bold">Winner</h2>
            <p className="mt-1 text-sm text-ink/60">Correct winner earns +10 points.</p>
          </div>
          <TeamSelect
            defaultValue={prediction?.winner}
            disabled={locked}
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
                disabled={locked}
                key={index}
                label={`Semi-finalist ${index + 1}`}
                name={`semiFinalist${index + 1}`}
              />
            ))}
          </div>
        </section>

        <button
          className="btn-primary w-fit bg-coral hover:bg-coral/90 disabled:bg-ink/15 disabled:text-ink/45"
          disabled={locked}
          type="submit"
        >
          {locked ? 'Predictions closed' : 'Save predictions'}
        </button>
      </form>
    </>
  );
}

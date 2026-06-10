'use client';

import { useState } from 'react';

import { submitPrediction } from '@/actions/predictions';
import type { Match, Prediction } from '@/lib/types';

function ScoreInput({
  disabled,
  label,
  name,
  onChange,
  value,
}: {
  disabled: boolean;
  label: string;
  name: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <input
        className="h-14 w-14 rounded-lg border-2 border-ink/55 bg-white/40 px-2 text-center text-2xl font-black text-ink outline-none transition [appearance:textfield] focus:border-turf focus:ring-2 focus:ring-turf/20 disabled:border-ink/20 disabled:text-ink/35 sm:h-16 sm:w-16 sm:text-3xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        disabled={disabled}
        inputMode="numeric"
        min="0"
        name={name}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
        placeholder="-"
        type="number"
        value={value}
      />
    </label>
  );
}

export function CompactPredictionForm({
  match,
  prediction,
  returnTo = '/matches',
}: {
  match: Pick<Match, 'id' | 'kickoff_at'>;
  prediction?: Pick<
    Prediction,
    'predicted_home_score' | 'predicted_away_score'
  > | null;
  returnTo?: string;
}) {
  const [homeScore, setHomeScore] = useState(
    prediction?.predicted_home_score?.toString() ?? '',
  );
  const [awayScore, setAwayScore] = useState(
    prediction?.predicted_away_score?.toString() ?? '',
  );
  const closed = Date.now() >= new Date(match.kickoff_at).getTime();

  return (
    <form action={submitPrediction} className="grid justify-items-center gap-2">
      <input name="matchId" type="hidden" value={match.id} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <div className="flex items-center gap-2">
        <ScoreInput
          disabled={closed}
          label="Local"
          name="predictedHomeScore"
          onChange={setHomeScore}
          value={homeScore}
        />
        <span className="text-3xl font-black text-ink">:</span>
        <ScoreInput
          disabled={closed}
          label="Away"
          name="predictedAwayScore"
          onChange={setAwayScore}
          value={awayScore}
        />
      </div>
      <div className="grid w-full gap-1">
        <button
          className="btn-primary min-h-9 bg-coral px-3 py-1 hover:bg-coral/90"
          disabled={closed}
          type="submit"
        >
          {prediction ? 'Update' : 'Submit'}
        </button>
      </div>
      {closed ? (
        <p className="text-xs font-medium text-ink/50">Predictions closed</p>
      ) : null}
    </form>
  );
}

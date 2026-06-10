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
    <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-ink/50">
      {label}
      <input
        className="h-11 w-16 rounded-md border border-ink/15 bg-white px-2 text-center text-xl font-black text-ink outline-none transition focus:border-turf focus:ring-2 focus:ring-turf/20 disabled:bg-ink/5 disabled:text-ink/35"
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
    <form action={submitPrediction} className="grid gap-2">
      <input name="matchId" type="hidden" value={match.id} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <div className="flex items-end gap-2">
        <ScoreInput
          disabled={closed}
          label="Local"
          name="predictedHomeScore"
          onChange={setHomeScore}
          value={homeScore}
        />
        <span className="pb-2 text-xl font-black text-ink/35">-</span>
        <ScoreInput
          disabled={closed}
          label="Away"
          name="predictedAwayScore"
          onChange={setAwayScore}
          value={awayScore}
        />
        <button
          className="btn-primary h-11 min-h-0 bg-coral px-3 py-0 hover:bg-coral/90"
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

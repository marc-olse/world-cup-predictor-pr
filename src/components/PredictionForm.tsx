'use client';

import { useState } from 'react';

import { submitPrediction } from '@/actions/predictions';
import type { Match, Prediction } from '@/lib/types';

function ScoreBox({
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
    <input
      aria-label={label}
      className="h-16 w-16 rounded-lg border-2 border-ink/55 bg-white/40 text-center text-3xl font-black leading-none text-ink outline-none transition [appearance:textfield] focus:border-turf focus:ring-2 focus:ring-turf/20 disabled:border-ink/20 disabled:text-ink/35 sm:h-20 sm:w-20 sm:text-4xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      disabled={disabled}
      inputMode="numeric"
      min="0"
      name={name}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
      placeholder=""
      type="number"
      value={value}
    />
  );
}

export function PredictionForm({
  match,
  prediction,
  forceOpen = false,
  returnTo = '/matches/today',
}: {
  match: Pick<Match, 'id' | 'kickoff_at' | 'home_team' | 'away_team'>;
  prediction?: Pick<
    Prediction,
    'predicted_home_score' | 'predicted_away_score'
  > | null;
  forceOpen?: boolean;
  returnTo?: string;
}) {
  const [homeScore, setHomeScore] = useState(
    prediction?.predicted_home_score?.toString() ?? '',
  );
  const [awayScore, setAwayScore] = useState(
    prediction?.predicted_away_score?.toString() ?? '',
  );
  const closed = !forceOpen && Date.now() >= new Date(match.kickoff_at).getTime();

  return (
    <form action={submitPrediction} className="grid justify-items-center gap-3">
      <input name="matchId" type="hidden" value={match.id} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <div className="flex items-center justify-center gap-3">
        <ScoreBox
          disabled={closed}
          label="Local score"
          name="predictedHomeScore"
          onChange={setHomeScore}
          value={homeScore}
        />
        <span className="text-4xl font-black text-ink">:</span>
        <ScoreBox
          disabled={closed}
          label="Away score"
          name="predictedAwayScore"
          onChange={setAwayScore}
          value={awayScore}
        />
      </div>
      <div className="grid w-full gap-2">
        <button className="btn-primary w-full bg-coral hover:bg-coral/90" disabled={closed} type="submit">
          {prediction ? 'Update' : 'Submit'}
        </button>
        {closed ? (
          <p className="text-center text-xs font-semibold text-ink/50">
            Predictions closed
          </p>
        ) : null}
      </div>
    </form>
  );
}

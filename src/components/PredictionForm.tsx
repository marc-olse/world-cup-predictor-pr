'use client';

import { useState } from 'react';

import { submitPrediction } from '@/actions/predictions';
import type { Match, Prediction } from '@/lib/types';

function ScoreStepper({
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
  const numericValue = Number(value || 0);

  function increment() {
    onChange(String(numericValue + 1));
  }

  function decrement() {
    onChange(String(Math.max(0, numericValue - 1)));
  }

  return (
    <div className="grid justify-items-center gap-2">
      <label className="text-center text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ink/45">
        {label}
      </label>
      <div className="grid w-28 justify-items-center rounded-lg border border-ink/10 bg-white/90 px-2 py-3 shadow-sm sm:w-36">
        <button
          aria-label={`Increase ${label}`}
          className="grid h-8 w-12 place-items-center text-3xl font-bold leading-none text-ink/45 hover:text-ink disabled:opacity-30"
          disabled={disabled}
          onClick={increment}
          type="button"
        >
          ^
        </button>
        <input
          aria-label={label}
          className="h-20 w-full border-0 bg-transparent text-center text-6xl font-black leading-none text-ink outline-none [appearance:textfield] disabled:opacity-50 sm:h-24 sm:text-7xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          disabled={disabled}
          min="0"
          name={name}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
          inputMode="numeric"
          type="number"
          value={value}
        />
        <button
          aria-label={`Decrease ${label}`}
          className="grid h-8 w-12 place-items-center text-3xl font-bold leading-none text-ink/45 hover:text-ink disabled:opacity-30"
          disabled={disabled}
          onClick={decrement}
          type="button"
        >
          v
        </button>
      </div>
    </div>
  );
}

export function PredictionForm({
  match,
  prediction,
  forceOpen = false,
}: {
  match: Pick<Match, 'id' | 'kickoff_at' | 'home_team' | 'away_team'>;
  prediction?: Pick<
    Prediction,
    'predicted_home_score' | 'predicted_away_score'
  > | null;
  forceOpen?: boolean;
}) {
  const [homeScore, setHomeScore] = useState(
    prediction?.predicted_home_score?.toString() ?? '',
  );
  const [awayScore, setAwayScore] = useState(
    prediction?.predicted_away_score?.toString() ?? '',
  );
  const closed = !forceOpen && Date.now() >= new Date(match.kickoff_at).getTime();

  function generateRandomPrediction() {
    setHomeScore(String(Math.floor(Math.random() * 5)));
    setAwayScore(String(Math.floor(Math.random() * 5)));
  }

  return (
    <form action={submitPrediction} className="grid justify-items-center gap-5">
      <input name="matchId" type="hidden" value={match.id} />
      <div className="flex items-center justify-center gap-3 sm:gap-8">
        <ScoreStepper
          disabled={closed}
          label="Local score"
          name="predictedHomeScore"
          onChange={setHomeScore}
          value={homeScore}
        />
        <span className="mt-9 text-4xl font-black text-ink sm:text-5xl">-</span>
        <ScoreStepper
          disabled={closed}
          label="Away score"
          name="predictedAwayScore"
          onChange={setAwayScore}
          value={awayScore}
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          className="btn-secondary border-ocean/25 text-ocean"
          disabled={closed}
          onClick={generateRandomPrediction}
          type="button"
        >
          Generate random
        </button>
        <button className="btn-primary min-w-36 bg-coral hover:bg-coral/90" disabled={closed} type="submit">
          {prediction ? 'Update' : 'Submit'}
        </button>
      </div>
    </form>
  );
}

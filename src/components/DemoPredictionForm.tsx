'use client';

import { useState } from 'react';

import type { Match } from '@/lib/types';

function ScoreStepper({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const numericValue = Number(value || 0);

  return (
    <div className="grid justify-items-center gap-2">
      <label className="text-center text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ink/45">
        {label}
      </label>
      <div className="grid w-28 justify-items-center rounded-lg border border-ink/10 bg-white/90 px-2 py-3 shadow-sm sm:w-36">
        <button
          aria-label={`Increase ${label}`}
          className="grid h-8 w-12 place-items-center text-3xl font-bold leading-none text-ink/45 hover:text-ink"
          onClick={() => onChange(String(numericValue + 1))}
          type="button"
        >
          ^
        </button>
        <input
          aria-label={label}
          className="h-20 w-full border-0 bg-transparent text-center text-6xl font-black leading-none text-ink outline-none [appearance:textfield] sm:h-24 sm:text-7xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          inputMode="numeric"
          min="0"
          onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
          type="number"
          value={value}
        />
        <button
          aria-label={`Decrease ${label}`}
          className="grid h-8 w-12 place-items-center text-3xl font-bold leading-none text-ink/45 hover:text-ink"
          onClick={() => onChange(String(Math.max(0, numericValue - 1)))}
          type="button"
        >
          v
        </button>
      </div>
    </div>
  );
}

export function DemoPredictionForm({
  match,
}: {
  match: Pick<Match, 'id' | 'home_team' | 'away_team'>;
}) {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [saved, setSaved] = useState(false);

  function savePrediction() {
    window.localStorage.setItem(
      `demo-prediction:${match.id}`,
      JSON.stringify({ homeScore, awayScore }),
    );
    setSaved(true);
  }

  return (
    <div className="grid justify-items-center gap-5">
      <div className="flex items-center justify-center gap-3 sm:gap-8">
        <ScoreStepper
          label="Local score"
          onChange={(value) => {
            setHomeScore(value);
            setSaved(false);
          }}
          value={homeScore}
        />
        <span className="mt-9 text-4xl font-black text-ink sm:text-5xl">-</span>
        <ScoreStepper
          label="Away score"
          onChange={(value) => {
            setAwayScore(value);
            setSaved(false);
          }}
          value={awayScore}
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button className="btn-primary min-w-36 bg-coral hover:bg-coral/90" onClick={savePrediction} type="button">
          Submit
        </button>
      </div>
      {saved ? (
        <p className="text-sm font-medium text-turf">Prediction saved locally.</p>
      ) : null}
    </div>
  );
}

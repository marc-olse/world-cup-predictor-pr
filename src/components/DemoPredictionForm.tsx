'use client';

import { useState } from 'react';

import type { Match } from '@/lib/types';

function ScoreBox({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <input
      aria-label={label}
      className="h-16 w-16 rounded-lg border-2 border-ink/55 bg-white/40 text-center text-3xl font-black leading-none text-ink outline-none transition [appearance:textfield] focus:border-turf focus:ring-2 focus:ring-turf/20 sm:h-20 sm:w-20 sm:text-4xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      inputMode="numeric"
      min="0"
      onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
      type="number"
      value={value}
    />
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
    <div className="grid justify-items-center gap-3">
      <div className="flex items-center justify-center gap-3">
        <ScoreBox
          label="Local score"
          onChange={(value) => {
            setHomeScore(value);
            setSaved(false);
          }}
          value={homeScore}
        />
        <span className="text-4xl font-black text-ink">:</span>
        <ScoreBox
          label="Away score"
          onChange={(value) => {
            setAwayScore(value);
            setSaved(false);
          }}
          value={awayScore}
        />
      </div>
      <div className="grid w-full gap-2">
        <button className="btn-primary w-full bg-coral hover:bg-coral/90" onClick={savePrediction} type="button">
          Submit
        </button>
      </div>
      {saved ? (
        <p className="text-sm font-medium text-turf">Prediction saved locally.</p>
      ) : null}
    </div>
  );
}

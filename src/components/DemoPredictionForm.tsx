'use client';

import { useState } from 'react';

import type { Match } from '@/lib/types';

export function DemoPredictionForm({
  match,
}: {
  match: Pick<Match, 'id' | 'home_team' | 'away_team'>;
}) {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [saved, setSaved] = useState(false);

  function generateRandomPrediction() {
    setHomeScore(String(Math.floor(Math.random() * 5)));
    setAwayScore(String(Math.floor(Math.random() * 5)));
    setSaved(false);
  }

  function savePrediction() {
    window.localStorage.setItem(
      `demo-prediction:${match.id}`,
      JSON.stringify({ homeScore, awayScore }),
    );
    setSaved(true);
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <label className="grid gap-1 text-sm font-medium">
        Local score - {match.home_team}
        <input
          className="field"
          min="0"
          onChange={(event) => {
            setHomeScore(event.target.value);
            setSaved(false);
          }}
          placeholder="0"
          type="number"
          value={homeScore}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Away score - {match.away_team}
        <input
          className="field"
          min="0"
          onChange={(event) => {
            setAwayScore(event.target.value);
            setSaved(false);
          }}
          placeholder="0"
          type="number"
          value={awayScore}
        />
      </label>
      <div className="flex flex-wrap items-end gap-2 self-end">
        <button className="btn-secondary" onClick={generateRandomPrediction} type="button">
          Generate random
        </button>
        <button className="btn-primary" onClick={savePrediction} type="button">
          Save local
        </button>
      </div>
      {saved ? (
        <p className="text-sm font-medium text-turf sm:col-span-3">Prediction saved locally.</p>
      ) : null}
    </div>
  );
}

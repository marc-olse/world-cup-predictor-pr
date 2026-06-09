'use client';

import { useState } from 'react';

import { submitPrediction } from '@/actions/predictions';
import type { Match, Prediction } from '@/lib/types';

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
    <form action={submitPrediction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <input name="matchId" type="hidden" value={match.id} />
      <label className="grid gap-1 text-sm font-medium">
        Local score - {match.home_team}
        <input
          className="field"
          disabled={closed}
          min="0"
          name="predictedHomeScore"
          onChange={(event) => setHomeScore(event.target.value)}
          placeholder="0"
          type="number"
          value={homeScore}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Away score - {match.away_team}
        <input
          className="field"
          disabled={closed}
          min="0"
          name="predictedAwayScore"
          onChange={(event) => setAwayScore(event.target.value)}
          placeholder="0"
          type="number"
          value={awayScore}
        />
      </label>
      <div className="flex flex-wrap items-end gap-2 self-end">
        <button
          className="btn-secondary"
          disabled={closed}
          onClick={generateRandomPrediction}
          type="button"
        >
          Generate random
        </button>
        <button className="btn-primary" disabled={closed} type="submit">
          {prediction ? 'Update' : 'Submit'}
        </button>
      </div>
    </form>
  );
}

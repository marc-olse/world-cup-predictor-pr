'use client';

import { useState } from 'react';

import { submitPrediction } from '@/actions/predictions';
import { FinishedPredictionResult } from '@/components/FinishedPredictionResult';
import type { Match, Prediction } from '@/lib/types';
import { useKickoffLock } from '@/lib/use-kickoff-lock';

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
  match: Pick<
    Match,
    | 'id'
    | 'kickoff_at'
    | 'home_team'
    | 'away_team'
    | 'is_starred'
    | 'status'
    | 'home_score'
    | 'away_score'
  >;
  prediction?: Pick<
    Prediction,
    'predicted_home_score' | 'predicted_away_score' | 'points'
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
  const kickoffLocked = useKickoffLock(match.kickoff_at);
  const closed = !forceOpen && kickoffLocked;
  const finished =
    match.status === 'finished' &&
    match.home_score !== null &&
    match.away_score !== null;
  const formDisabled = closed || finished;
  const buttonClass = match.is_starred
    ? prediction
      ? 'bg-gold text-ink hover:bg-gold/90'
      : 'border border-gold/50 bg-gold/20 text-ink hover:bg-gold/30'
    : prediction
      ? 'bg-turf text-white hover:bg-turf/90'
      : 'border border-turf/30 bg-turf/15 text-turf hover:bg-turf/20';
  const disabledButtonClass = finished
    ? 'disabled:border disabled:border-ocean/20 disabled:bg-ocean/10 disabled:text-ocean disabled:opacity-100'
    : 'disabled:bg-ink/[0.08] disabled:text-ink/75 disabled:opacity-100';

  return (
    <form action={submitPrediction} className="grid justify-items-center gap-3">
      <input name="matchId" type="hidden" value={match.id} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <div className="flex items-center justify-center gap-3">
        <ScoreBox
          disabled={formDisabled}
          label="Local score"
          name="predictedHomeScore"
          onChange={setHomeScore}
          value={homeScore}
        />
        <span className="text-4xl font-black text-ink">:</span>
        <ScoreBox
          disabled={formDisabled}
          label="Away score"
          name="predictedAwayScore"
          onChange={setAwayScore}
          value={awayScore}
        />
      </div>
      {finished ? (
        <FinishedPredictionResult match={match} prediction={prediction} />
      ) : (
        <div className="grid w-full gap-2">
          <button
            className={`btn h-12 min-h-12 w-full overflow-hidden p-0 ${disabledButtonClass} ${buttonClass}`}
            disabled={formDisabled}
            type="submit"
          >
            {closed ? 'Game started' : prediction ? 'Update' : 'Submit'}
          </button>
        </div>
      )}
    </form>
  );
}

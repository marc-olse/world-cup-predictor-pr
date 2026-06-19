'use client';

import { useState } from 'react';

import { submitPrediction } from '@/actions/predictions';
import { FinishedPredictionResult } from '@/components/FinishedPredictionResult';
import type { Match, Prediction } from '@/lib/types';
import { useKickoffLock } from '@/lib/use-kickoff-lock';

function ScoreInput({
  bulkMatchId,
  bulkScoreSide,
  disabled,
  label,
  name,
  onChange,
  value,
}: {
  bulkMatchId?: string;
  bulkScoreSide?: 'away' | 'home';
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
        data-bulk-match-id={bulkMatchId}
        data-bulk-score-side={bulkScoreSide}
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
  match: Pick<
    Match,
    | 'id'
    | 'kickoff_at'
    | 'is_starred'
    | 'status'
    | 'home_score'
    | 'away_score'
  >;
  prediction?: Pick<
    Prediction,
    'predicted_home_score' | 'predicted_away_score' | 'points'
  > | null;
  returnTo?: string;
}) {
  const [homeScore, setHomeScore] = useState(
    prediction?.predicted_home_score?.toString() ?? '',
  );
  const [awayScore, setAwayScore] = useState(
    prediction?.predicted_away_score?.toString() ?? '',
  );
  const closed = useKickoffLock(match.kickoff_at);
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
    <form action={submitPrediction} className="grid justify-items-center gap-2">
      <input name="matchId" type="hidden" value={match.id} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <div className="flex items-center gap-2">
        <ScoreInput
          bulkMatchId={match.id}
          bulkScoreSide="home"
          disabled={formDisabled}
          label="Local"
          name="predictedHomeScore"
          onChange={setHomeScore}
          value={homeScore}
        />
        <span className="text-3xl font-black text-ink">:</span>
        <ScoreInput
          bulkMatchId={match.id}
          bulkScoreSide="away"
          disabled={formDisabled}
          label="Away"
          name="predictedAwayScore"
          onChange={setAwayScore}
          value={awayScore}
        />
      </div>
      {finished ? (
        <FinishedPredictionResult match={match} prediction={prediction} />
      ) : (
        <div className="grid w-full gap-1">
          <button
            className={`btn h-12 min-h-12 overflow-hidden p-0 ${disabledButtonClass} ${buttonClass}`}
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

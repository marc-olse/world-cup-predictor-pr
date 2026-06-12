import { getPredictionResultReason } from '@/lib/prediction-result';
import type { Match, Prediction } from '@/lib/types';

export function FinishedPredictionResult({
  match,
  prediction,
}: {
  match: Pick<
    Match,
    'home_score' | 'away_score' | 'is_starred'
  >;
  prediction?: Pick<
    Prediction,
    'predicted_home_score' | 'predicted_away_score' | 'points'
  > | null;
}) {
  if (match.home_score === null || match.away_score === null) {
    return null;
  }

  const points = prediction?.points ?? 0;
  const pointsClass =
    points >= 7
      ? 'text-gold'
      : points > 2
        ? 'text-turf'
        : points > 0
          ? 'text-amber-600'
          : 'text-ink/60';
  const reason = getPredictionResultReason({
    predictedHomeScore: prediction?.predicted_home_score,
    predictedAwayScore: prediction?.predicted_away_score,
    actualHomeScore: match.home_score,
    actualAwayScore: match.away_score,
  });

  return (
    <div
      aria-label={`Finished. Result ${match.home_score} to ${match.away_score}. ${reason}. ${points} points.`}
      className="grid h-16 w-56 max-w-[72vw] grid-cols-[4.5rem_minmax(0,1fr)_3.5rem] overflow-hidden rounded-md border border-ocean/25 bg-white text-ink shadow-sm sm:h-12"
      role="status"
    >
      <div className="grid min-w-0 grid-rows-[auto_auto] content-center justify-items-center gap-1 border-r border-ink/10 text-center leading-none">
        <span className="text-[0.48rem] font-bold uppercase text-ink/45">
          Finished
        </span>
        <span className="text-xl font-black tabular-nums sm:text-lg">
          {match.home_score} - {match.away_score}
        </span>
      </div>

      <div className="flex min-w-0 items-center justify-center gap-1 px-1 text-center text-[0.65rem] font-bold leading-none text-ink/70">
        <span className="whitespace-nowrap">{reason}</span>
        {match.is_starred && points > 0 ? (
          <span aria-hidden="true" className="shrink-0 text-sm leading-none">
            ⭐
          </span>
        ) : null}
      </div>

      <div
        className={`grid min-w-0 grid-rows-[auto_auto] content-center justify-items-center gap-1 border-l border-ink/10 text-center leading-none ${pointsClass}`}
      >
        <span className="text-[0.48rem] font-bold uppercase text-ink/45">
          Pts
        </span>
        <span className="text-lg font-black tabular-nums sm:text-base">
          {points > 0 ? '+' : ''}
          {points}
        </span>
      </div>
    </div>
  );
}

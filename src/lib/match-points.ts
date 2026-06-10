import { calculatePredictionPoints } from './scoring';
import type { MatchStatus } from './types';

export function calculateMatchPredictionPoints(params: {
  status: MatchStatus;
  isStarred?: boolean;
  predictedHomeScore: number | null;
  predictedAwayScore: number | null;
  actualHomeScore: number | null;
  actualAwayScore: number | null;
}) {
  if (params.status !== 'finished') {
    return 0;
  }

  const points = calculatePredictionPoints(params);

  return params.isStarred ? points * 2 : points;
}

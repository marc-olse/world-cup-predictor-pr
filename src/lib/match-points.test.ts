import { describe, expect, it } from 'vitest';

import { calculateMatchPredictionPoints } from './match-points';

describe('calculateMatchPredictionPoints', () => {
  it('returns 0 for an exact score when match is scheduled', () => {
    expect(
      calculateMatchPredictionPoints({
        status: 'scheduled',
        predictedHomeScore: 2,
        predictedAwayScore: 1,
        actualHomeScore: 2,
        actualAwayScore: 1,
      }),
    ).toBe(0);
  });

  it('returns 0 for an exact score when match is live', () => {
    expect(
      calculateMatchPredictionPoints({
        status: 'live',
        predictedHomeScore: 2,
        predictedAwayScore: 1,
        actualHomeScore: 2,
        actualAwayScore: 1,
      }),
    ).toBe(0);
  });

  it('awards points when match is finished', () => {
    expect(
      calculateMatchPredictionPoints({
        status: 'finished',
        predictedHomeScore: 2,
        predictedAwayScore: 1,
        actualHomeScore: 2,
        actualAwayScore: 1,
      }),
    ).toBe(3);
  });
});

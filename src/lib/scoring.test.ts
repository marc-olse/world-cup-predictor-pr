import { describe, expect, it } from 'vitest';

import { calculatePredictionPoints } from './scoring';

describe('calculatePredictionPoints', () => {
  it('returns 3 for an exact home win score', () => {
    expect(
      calculatePredictionPoints({
        predictedHomeScore: 2,
        predictedAwayScore: 1,
        actualHomeScore: 2,
        actualAwayScore: 1,
      }),
    ).toBe(3);
  });

  it('returns 3 for an exact draw score', () => {
    expect(
      calculatePredictionPoints({
        predictedHomeScore: 1,
        predictedAwayScore: 1,
        actualHomeScore: 1,
        actualAwayScore: 1,
      }),
    ).toBe(3);
  });

  it('returns 1 for a correct home win result with the wrong score', () => {
    expect(
      calculatePredictionPoints({
        predictedHomeScore: 3,
        predictedAwayScore: 1,
        actualHomeScore: 2,
        actualAwayScore: 0,
      }),
    ).toBe(1);
  });

  it('returns 1 for a correct away win result with the wrong score', () => {
    expect(
      calculatePredictionPoints({
        predictedHomeScore: 0,
        predictedAwayScore: 2,
        actualHomeScore: 1,
        actualAwayScore: 3,
      }),
    ).toBe(1);
  });

  it('returns 1 for a correct draw result with the wrong score', () => {
    expect(
      calculatePredictionPoints({
        predictedHomeScore: 2,
        predictedAwayScore: 2,
        actualHomeScore: 0,
        actualAwayScore: 0,
      }),
    ).toBe(1);
  });

  it('returns 0 for a wrong result', () => {
    expect(
      calculatePredictionPoints({
        predictedHomeScore: 2,
        predictedAwayScore: 1,
        actualHomeScore: 0,
        actualAwayScore: 1,
      }),
    ).toBe(0);
  });

  it('returns 0 when an actual score is missing', () => {
    expect(
      calculatePredictionPoints({
        predictedHomeScore: 2,
        predictedAwayScore: 1,
        actualHomeScore: null,
        actualAwayScore: 1,
      }),
    ).toBe(0);
  });
});

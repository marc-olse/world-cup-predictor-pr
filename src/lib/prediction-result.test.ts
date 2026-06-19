import { describe, expect, it } from 'vitest';

import { getPredictionResultReason } from './prediction-result';

describe('getPredictionResultReason', () => {
  it('labels an exact score', () => {
    expect(
      getPredictionResultReason({
        predictedHomeScore: 2,
        predictedAwayScore: 0,
        actualHomeScore: 2,
        actualAwayScore: 0,
      }),
    ).toBe('Exact score');
  });

  it('labels a correct outcome with a different score', () => {
    expect(
      getPredictionResultReason({
        predictedHomeScore: 3,
        predictedAwayScore: 1,
        actualHomeScore: 2,
        actualAwayScore: 0,
      }),
    ).toBe('Correct outcome');
  });

  it('labels a wrong outcome as unlucky', () => {
    expect(
      getPredictionResultReason({
        predictedHomeScore: 0,
        predictedAwayScore: 1,
        actualHomeScore: 2,
        actualAwayScore: 0,
      }),
    ).toBe('Unlucky');
  });

  it('labels a missing prediction as unlucky', () => {
    expect(
      getPredictionResultReason({
        predictedHomeScore: null,
        predictedAwayScore: null,
        actualHomeScore: 2,
        actualAwayScore: 0,
      }),
    ).toBe('Unlucky');
  });
});

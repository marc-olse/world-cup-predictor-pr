export type PredictionResultReason =
  | 'Exact score'
  | 'Correct outcome'
  | 'Unlucky';

export function getPredictionResultReason(params: {
  predictedHomeScore: number | null | undefined;
  predictedAwayScore: number | null | undefined;
  actualHomeScore: number | null | undefined;
  actualAwayScore: number | null | undefined;
}): PredictionResultReason {
  const {
    predictedHomeScore,
    predictedAwayScore,
    actualHomeScore,
    actualAwayScore,
  } = params;

  if (actualHomeScore === null || actualHomeScore === undefined) {
    return 'Unlucky';
  }

  if (actualAwayScore === null || actualAwayScore === undefined) {
    return 'Unlucky';
  }

  if (
    predictedHomeScore === actualHomeScore &&
    predictedAwayScore === actualAwayScore
  ) {
    return 'Exact score';
  }

  if (predictedHomeScore === null || predictedHomeScore === undefined) {
    return 'Unlucky';
  }

  if (predictedAwayScore === null || predictedAwayScore === undefined) {
    return 'Unlucky';
  }

  const predictedOutcome = Math.sign(
    predictedHomeScore - predictedAwayScore,
  );
  const actualOutcome = Math.sign(actualHomeScore - actualAwayScore);

  return predictedOutcome === actualOutcome ? 'Correct outcome' : 'Unlucky';
}

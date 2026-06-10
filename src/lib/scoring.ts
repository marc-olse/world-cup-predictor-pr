export function calculatePredictionPoints(params: {
  predictedHomeScore: number | null;
  predictedAwayScore: number | null;
  actualHomeScore: number | null;
  actualAwayScore: number | null;
}): number {
  const {
    predictedHomeScore,
    predictedAwayScore,
    actualHomeScore,
    actualAwayScore,
  } = params;

  if (
    actualHomeScore === null ||
    actualAwayScore === null ||
    predictedHomeScore === null ||
    predictedAwayScore === null
  ) {
    return 0;
  }

  const exactScore =
    predictedHomeScore === actualHomeScore &&
    predictedAwayScore === actualAwayScore;

  if (exactScore) {
    return 3;
  }

  const predictedResult =
    predictedHomeScore > predictedAwayScore
      ? 'home'
      : predictedHomeScore < predictedAwayScore
        ? 'away'
        : 'draw';

  const actualResult =
    actualHomeScore > actualAwayScore
      ? 'home'
      : actualHomeScore < actualAwayScore
        ? 'away'
        : 'draw';

  return predictedResult === actualResult ? 1 : 0;
}

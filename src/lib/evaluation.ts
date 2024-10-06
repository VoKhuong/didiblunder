import type { Evaluation } from "$models/Evaluation";

export function formatScore(evaluation: Evaluation) {
  if (evaluation.type === "mate") {
    return `M${Math.abs(evaluation.score)}`;
  } else {
    return (evaluation.score / 100).toLocaleString(undefined, {
      signDisplay: 'exceptZero',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
}

// score is in centipawns
const LIMIT: number = 1000;

function computeHeightForCP(value: number) {
  const rootValue = Math.sign(value) * Math.pow(Math.abs(value), 0.6);
  const rootLimit = Math.pow(LIMIT, 0.6);
  return Math.min(0.95, Math.max(0.05, (rootValue + rootLimit) / (2 * rootLimit)));
}

export function toEvaluationHeight(evaluation: Evaluation) {
  return evaluation.type === 'cp'
    ? computeHeightForCP(evaluation.score)
    : Math.sign(evaluation.score) > 0
      ? 1
      : 0;
}

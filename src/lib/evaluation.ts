import type { RawEval } from "$models/Engine";
import type { Evaluation } from "$models/Evaluation";
import type { Move } from "chess.js";

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

export function isBestMove(move: Move, evaluation?: Evaluation): boolean {
  if (evaluation?.pv.split(' ').at(0) === move.lan) {
    return true
  } else {
    return false;
  }
}

/**
 * 
 * WTF algo
 * @link https://github.com/franciscoBSalgueiro/en-croissant/blob/master/src/utils/score.ts
 */
export function getWinChance(centipawns: number) {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1);
}

export function computeWinChance(evaluation: RawEval) {
  return evaluation.type === "cp" ?
    Math.max(0, Math.min(getWinChance(evaluation.score), 100))
    : (Math.sign(evaluation.score) > 0
      ? 100
      : 0);
}

export function computeWinChanceLost(previousEval: RawEval, currentEval: RawEval) {
  return computeWinChance(previousEval) - computeWinChance(currentEval);
}

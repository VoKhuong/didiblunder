import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';

import {
  computeWinChance,
  computeWinChanceLost,
  formatScore,
  getBestMove,
  getWinChance,
  haveOnlyOneGoodMove,
  isForced,
  isNextMoveCrucial,
  isSacrifice,
  opponentDidABadPlay,
  toEvaluationHeight
} from '$lib/evaluation';
import type { AltEval, RawEval } from '$models/Engine';
import type { Evaluation } from '$models/Evaluation';
import Label from '$models/Label';

const evaluation = (overrides: Partial<Evaluation> = {}): Evaluation => ({
  score: 0,
  type: 'cp',
  pv: 'e2e4 d7d5',
  label: Label.UNDEFINED,
  ...overrides
});

const rawEval = (overrides: Partial<RawEval> = {}): RawEval => ({
  score: 0,
  type: 'cp',
  pv: 'e2e4',
  ...overrides
});

const altLine = (overrides: Partial<AltEval> = {}): AltEval => ({
  score: 0,
  type: 'cp',
  pv: 'd7d5',
  ...overrides
});

describe('formatScore', () => {
  it('formats centipawn scores with an explicit sign', () => {
    expect(formatScore(evaluation({ score: 0 }))).toBe('0');
    expect(formatScore(evaluation({ score: 150 }))).toBe('+1.5');
    expect(formatScore(evaluation({ score: -250 }))).toBe('-2.5');
    expect(formatScore(evaluation({ score: 123 }))).toBe('+1.23');
  });

  it('formats mate scores without the score sign', () => {
    expect(formatScore(evaluation({ type: 'mate', score: 3 }))).toBe('M3');
    expect(formatScore(evaluation({ type: 'mate', score: -2 }))).toBe('M2');
  });

  it('formats unknown mate distance as M#', () => {
    expect(formatScore(evaluation({ type: 'mate', score: Infinity }))).toBe('M#');
    expect(formatScore(evaluation({ type: 'mate', score: -Infinity }))).toBe('M#');
  });
});

describe('toEvaluationHeight', () => {
  it('places an even centipawn evaluation in the middle', () => {
    expect(toEvaluationHeight(evaluation({ score: 0 }))).toBe(0.5);
  });

  it('clamps large centipawn evaluations', () => {
    expect(toEvaluationHeight(evaluation({ score: 1000 }))).toBe(0.95);
    expect(toEvaluationHeight(evaluation({ score: -1000 }))).toBe(0.05);
    expect(toEvaluationHeight(evaluation({ score: 50_000 }))).toBe(0.95);
    expect(toEvaluationHeight(evaluation({ score: -50_000 }))).toBe(0.05);
  });

  it('pins mate evaluations to the top or bottom', () => {
    expect(toEvaluationHeight(evaluation({ type: 'mate', score: 2 }))).toBe(1);
    expect(toEvaluationHeight(evaluation({ type: 'mate', score: -2 }))).toBe(0);
  });
});

describe('getBestMove', () => {
  it('returns the first move of the principal variation', () => {
    expect(getBestMove(evaluation({ pv: 'e2e4 d7d5 g1f3' }))).toBe('e2e4');
  });

  it('handles missing and empty evaluations', () => {
    expect(getBestMove(undefined)).toBeUndefined();
    expect(getBestMove(evaluation({ pv: '' }))).toBe('');
  });
});

describe('isForced', () => {
  it('treats a missing alternative line as forced', () => {
    expect(isForced(evaluation())).toBe(true);
  });

  it('is not forced when another line exists', () => {
    expect(isForced(evaluation({ altLine: altLine() }))).toBe(false);
  });
});

describe('haveOnlyOneGoodMove', () => {
  it('returns false without an evaluation or alternative line', () => {
    expect(haveOnlyOneGoodMove('w', undefined)).toBe(false);
    expect(haveOnlyOneGoodMove('w', evaluation())).toBe(false);
  });

  it('detects a single winning move for white', () => {
    expect(
      haveOnlyOneGoodMove('w', evaluation({ score: 100, altLine: altLine({ score: -20 }) }))
    ).toBe(true);
  });

  it('detects a single winning move for black', () => {
    expect(
      haveOnlyOneGoodMove('b', evaluation({ score: -100, altLine: altLine({ score: 20 }) }))
    ).toBe(true);
  });

  it('returns false when both moves are winning', () => {
    expect(
      haveOnlyOneGoodMove('w', evaluation({ score: 100, altLine: altLine({ score: 50 }) }))
    ).toBe(false);
    expect(
      haveOnlyOneGoodMove('b', evaluation({ score: -100, altLine: altLine({ score: -50 }) }))
    ).toBe(false);
  });

  it('returns false when the primary move is not winning', () => {
    expect(
      haveOnlyOneGoodMove('w', evaluation({ score: 0, altLine: altLine({ score: -20 }) }))
    ).toBe(false);
    expect(
      haveOnlyOneGoodMove('b', evaluation({ score: 0, altLine: altLine({ score: 20 }) }))
    ).toBe(false);
  });
});

describe('isNextMoveCrucial', () => {
  it('returns false without both evaluations', () => {
    expect(isNextMoveCrucial('w', undefined, evaluation())).toBe(false);
    expect(isNextMoveCrucial('w', evaluation(), undefined)).toBe(false);
  });

  it('detects a large swing in white’s favor', () => {
    expect(isNextMoveCrucial('w', evaluation({ score: -100 }), evaluation({ score: 100 }))).toBe(
      true
    );
    expect(isNextMoveCrucial('w', evaluation({ score: 0 }), evaluation({ score: 200 }))).toBe(true);
  });

  it('detects a large swing in black’s favor', () => {
    expect(isNextMoveCrucial('b', evaluation({ score: 100 }), evaluation({ score: -100 }))).toBe(
      true
    );
    expect(isNextMoveCrucial('b', evaluation({ score: 0 }), evaluation({ score: -200 }))).toBe(
      true
    );
  });

  it('requires the evaluation to cross zero', () => {
    expect(isNextMoveCrucial('w', evaluation({ score: 100 }), evaluation({ score: 300 }))).toBe(
      false
    );
    expect(isNextMoveCrucial('b', evaluation({ score: -100 }), evaluation({ score: -300 }))).toBe(
      false
    );
  });

  it('requires a swing greater than the great threshold', () => {
    expect(isNextMoveCrucial('w', evaluation({ score: -100 }), evaluation({ score: 50 }))).toBe(
      false
    );
    expect(isNextMoveCrucial('w', evaluation({ score: -100 }), evaluation({ score: 51 }))).toBe(
      true
    );
  });
});

describe('isSacrifice', () => {
  it('never treats a pawn move as a sacrifice', () => {
    const chess = new Chess();
    const move = chess.move('e4');

    expect(isSacrifice(chess, move)).toBe(false);
  });

  it('detects an undefended piece moved to an attacked square', () => {
    const chess = new Chess('4k3/8/2p5/8/8/2N5/8/4K3 w - - 0 1');
    const move = chess.move('Nd5');

    expect(isSacrifice(chess, move)).toBe(true);
  });

  it('detects a valuable capture of a cheaper defended piece', () => {
    const chess = new Chess('4k3/8/2p5/3p4/8/8/3Q4/4K3 w - - 0 1');
    const move = chess.move('Qxd5');

    expect(isSacrifice(chess, move)).toBe(true);
  });

  it('does not call capturing a more valuable piece a sacrifice', () => {
    const chess = new Chess('4k3/8/2p5/3q4/8/2N5/8/4K3 w - - 0 1');
    const move = chess.move('Nxd5');

    expect(isSacrifice(chess, move)).toBe(false);
  });

  it('does not call a safe move to an unattacked square a sacrifice', () => {
    const chess = new Chess('4k3/8/8/8/8/2N5/8/4K3 w - - 0 1');
    const move = chess.move('Nd5');

    expect(isSacrifice(chess, move)).toBe(false);
  });
});

describe('opponentDidABadPlay', () => {
  it('returns true only for mistakes and blunders', () => {
    expect(opponentDidABadPlay(undefined)).toBe(false);
    expect(opponentDidABadPlay(evaluation({ label: Label.MISTAKE }))).toBe(true);
    expect(opponentDidABadPlay(evaluation({ label: Label.BLUNDER }))).toBe(true);
    expect(opponentDidABadPlay(evaluation({ label: Label.GOOD }))).toBe(false);
    expect(opponentDidABadPlay(evaluation({ label: Label.INACCURACY }))).toBe(false);
  });
});

describe('getWinChance', () => {
  it('returns an even chance for equal positions', () => {
    expect(getWinChance(0)).toBe(50);
  });

  it('increases with the evaluation and stays symmetric around zero', () => {
    expect(getWinChance(100)).toBeGreaterThan(50);
    expect(getWinChance(-100)).toBeLessThan(50);
    expect(getWinChance(100) + getWinChance(-100)).toBeCloseTo(100, 10);
  });

  it('approaches 100 and 0 for extreme evaluations', () => {
    expect(getWinChance(10_000)).toBeGreaterThan(99);
    expect(getWinChance(-10_000)).toBeLessThan(1);
  });
});

describe('computeWinChance', () => {
  it('uses the centipawn curve for cp evaluations', () => {
    expect(computeWinChance(rawEval({ score: 0 }))).toBe(50);
    expect(computeWinChance(rawEval({ score: 100 }))).toBe(getWinChance(100));
  });

  it('returns 100 or 0 for mate evaluations', () => {
    expect(computeWinChance(rawEval({ type: 'mate', score: 1 }))).toBe(100);
    expect(computeWinChance(rawEval({ type: 'mate', score: -1 }))).toBe(0);
    expect(computeWinChance(rawEval({ type: 'mate', score: Infinity }))).toBe(100);
    expect(computeWinChance(rawEval({ type: 'mate', score: -Infinity }))).toBe(0);
  });
});

describe('computeWinChanceLost', () => {
  it('is the drop in win chance between two evaluations', () => {
    const previous = rawEval({ score: 100 });
    const current = rawEval({ score: -100 });

    expect(computeWinChanceLost(previous, current)).toBeCloseTo(
      getWinChance(100) - getWinChance(-100),
      10
    );
  });

  it('is negative when the position improves', () => {
    expect(computeWinChanceLost(rawEval({ score: 0 }), rawEval({ score: 100 }))).toBeLessThan(0);
  });
});

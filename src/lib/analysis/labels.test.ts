import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';

import { resolveLabel, type LabelInput } from '$lib/analysis/labels';
import { analyze_move } from '$lib/engine';
import type { RawEval } from '$models/Engine';
import { EVAL_CHECKMATE_BLACK, type Evaluation } from '$models/Evaluation';
import Label from '$models/Label';

const base: LabelInput = {
  best: 'e2e4',
  winChanceLost: 0,
  moveLan: 'd2d4',
  isForced: false,
  isSacrifice: false,
  mayBeGreat: false,
  previousLabel: Label.GOOD,
  opponentBadPlay: false
};

const rawEval = (score: number): RawEval => ({
  score,
  type: 'cp',
  pv: 'e7e5'
});

describe('resolveLabel', () => {
  it.each([
    [-10, Label.EXCELLENT],
    [0, Label.EXCELLENT],
    [2, Label.EXCELLENT],
    [2.01, Label.GOOD],
    [5, Label.GOOD],
    [5.01, Label.INACCURACY],
    [10, Label.INACCURACY],
    [10.01, Label.MISTAKE],
    [20, Label.MISTAKE],
    [20.01, Label.BLUNDER]
  ])('maps a loss of %s win chance to %s', (winChanceLost, expected) => {
    expect(resolveLabel({ ...base, winChanceLost }).label).toBe(expected);
  });

  it('labels a best move as best', () => {
    expect(resolveLabel({ ...base, moveLan: 'e2e4' }).label).toBe(Label.BEST);
  });

  it('labels a forced best move as forced', () => {
    expect(resolveLabel({ ...base, moveLan: 'e2e4', isForced: true }).label).toBe(Label.FORCED);
  });

  it('labels a sacrificial best move as brilliant', () => {
    expect(resolveLabel({ ...base, moveLan: 'e2e4', isSacrifice: true }).label).toBe(
      Label.BRILLIANT
    );
  });

  it('labels a best move with only one good option as great', () => {
    expect(resolveLabel({ ...base, moveLan: 'e2e4', mayBeGreat: true }).label).toBe(Label.GREAT);
  });

  it('prefers forced over brilliant and great', () => {
    expect(
      resolveLabel({
        ...base,
        moveLan: 'e2e4',
        isForced: true,
        isSacrifice: true,
        mayBeGreat: true
      }).label
    ).toBe(Label.FORCED);
  });

  it('prefers brilliant over great', () => {
    expect(
      resolveLabel({ ...base, moveLan: 'e2e4', isSacrifice: true, mayBeGreat: true }).label
    ).toBe(Label.BRILLIANT);
  });

  it('labels a known opening as book when the previous label is undefined', () => {
    const result = resolveLabel({ ...base, previousLabel: undefined, opening: 'Test Opening' });

    expect(result).toEqual({ label: Label.BOOK, opening: 'Test Opening' });
  });

  it('labels a known opening as book when the previous label is book', () => {
    expect(
      resolveLabel({ ...base, previousLabel: Label.BOOK, opening: 'Test Opening' }).label
    ).toBe(Label.BOOK);
  });

  it('does not label a known opening as book after a non-book move', () => {
    expect(
      resolveLabel({ ...base, previousLabel: Label.GOOD, opening: 'Test Opening' }).label
    ).toBe(Label.EXCELLENT);
  });

  it('does not label an unknown opening as book', () => {
    expect(resolveLabel({ ...base, previousLabel: undefined }).label).toBe(Label.EXCELLENT);
  });

  it('labels a missed win after a blunder or mistake', () => {
    expect(resolveLabel({ ...base, previousLabel: Label.BLUNDER, winChanceLost: 5 }).label).toBe(
      Label.MISSED
    );
    expect(resolveLabel({ ...base, previousLabel: Label.MISTAKE, winChanceLost: 10 }).label).toBe(
      Label.MISSED
    );
  });

  it('does not label a missed win after a good move or below the threshold', () => {
    expect(resolveLabel({ ...base, previousLabel: Label.GOOD, winChanceLost: 20 }).label).toBe(
      Label.MISTAKE
    );
    expect(resolveLabel({ ...base, previousLabel: Label.BLUNDER, winChanceLost: 4.99 }).label).toBe(
      Label.GOOD
    );
  });

  it('lets missed override a best move', () => {
    expect(
      resolveLabel({ ...base, moveLan: 'e2e4', previousLabel: Label.BLUNDER, winChanceLost: 5 })
        .label
    ).toBe(Label.MISSED);
  });
});

describe('analyze_move labeling adapter', () => {
  it('keeps checkmate labels unchanged', () => {
    const chess = new Chess();
    chess.move('f3');
    chess.move('e5');
    chess.move('g4');
    const move = chess.move('Qh4#');

    expect(analyze_move(move, rawEval(0), chess, undefined, false)).toBe(EVAL_CHECKMATE_BLACK);
  });

  it('does not mutate the input evaluation', () => {
    const input: RawEval = {
      score: 50,
      type: 'cp',
      pv: 'e2e4',
      altLine: { score: 30, type: 'cp', pv: 'd2d4' }
    };
    const before = structuredClone(input);
    const chess = new Chess();
    chess.move('a3');
    chess.move('a6');
    const move = chess.move('b3');
    const previous: Evaluation = {
      score: 20,
      type: 'cp',
      pv: '',
      label: Label.GOOD
    };

    const result = analyze_move(move, input, chess, previous, false);

    expect(input).toEqual(before);
    expect(input.altLine?.score).toBe(30);
    expect(result).not.toBe(input);
    expect(result.score).toBe(-50);
    expect(result.altLine?.score).toBe(-30);
    expect(result.altLine).not.toBe(input.altLine);
  });
});

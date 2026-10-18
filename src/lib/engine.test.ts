import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';

import { analyze_move } from '$lib/engine';
import Label from '$models/Label';
import type { RawEval } from '$models/Engine';

const rawEval = (score: number): RawEval => ({
  score,
  type: 'cp',
  pv: 'e7e5'
});

describe('analyze_move', () => {
  it('uses a neutral evaluation for an off-book first move', () => {
    const chess = new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1');
    const move = chess.move('a3');

    const result = analyze_move(move, rawEval(20), chess, undefined, false);

    expect(result.label).not.toBe(Label.UNDEFINED);
    expect(result.label).not.toBe(Label.BOOK);
  });

  it('still labels known openings as book on the first move', () => {
    const chess = new Chess();
    const move = chess.move('a3');

    const result = analyze_move(move, rawEval(20), chess, undefined, false);

    expect(result.label).toBe(Label.BOOK);
    expect(result.opening).toBe("Anderssen's Opening");
  });
});

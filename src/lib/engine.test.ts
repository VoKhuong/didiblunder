import { Chess } from 'chess.js';
import { describe, expect, it, vi } from 'vitest';

import { analyze_game, analyze_move } from '$lib/engine';
import type { EngineClient } from '$lib/engine/client';
import Label from '$models/Label';
import type { RawEval } from '$models/Engine';

const rawEval = (score: number): RawEval => ({
  score,
  type: 'cp',
  pv: 'e7e5'
});

describe('analyze_move', () => {
  it('uses a neutral evaluation when the first analyzed move is off-book', () => {
    const chess = new Chess();
    chess.move('a3');
    chess.move('a6');
    const move = chess.move('b3');

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

describe('analyze_game', () => {
  it('aborts before evaluating when the signal is already aborted', async () => {
    const chess = new Chess();
    chess.move('e4');
    const move = chess.move('e5');
    const controller = new AbortController();
    controller.abort();
    const evaluate = vi.fn();
    const client = { evaluate } as unknown as EngineClient;
    const setProgress = vi.fn();

    await expect(
      analyze_game(client, [move], chess, 10, setProgress, controller.signal)
    ).rejects.toMatchObject({ name: 'AbortError' });

    expect(evaluate).not.toHaveBeenCalled();
    expect(setProgress).not.toHaveBeenCalled();
  });

  it('stops before labeling when the signal aborts during evaluation', async () => {
    const chess = new Chess();
    chess.move('e4');
    const move = chess.move('e5');
    const controller = new AbortController();
    const client = {
      evaluate: vi.fn(async () => {
        controller.abort();
        return rawEval(20);
      })
    } as unknown as EngineClient;

    await expect(
      analyze_game(client, [move], chess, 10, () => {}, controller.signal)
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});

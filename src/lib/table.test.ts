import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';

import { toTableRows } from '$lib/table';

const historyFor = (moves: string[]) => {
  const chess = new Chess();
  for (const move of moves) chess.move(move);
  return chess.history({ verbose: true });
};

describe('toTableRows', () => {
  it('returns no rows for an empty history', () => {
    expect(toTableRows([])).toEqual([]);
  });

  it('groups an even number of moves into full rows', () => {
    const rows = toTableRows(historyFor(['e4', 'e5', 'Nf3', 'Nc6']));

    expect(rows).toEqual([
      ['1.', 'e4', 'e5'],
      ['2.', 'Nf3', 'Nc6']
    ]);
  });

  it('leaves the last row incomplete for an odd number of moves', () => {
    const rows = toTableRows(historyFor(['e4', 'e5', 'Nf3']));

    expect(rows).toEqual([
      ['1.', 'e4', 'e5'],
      ['2.', 'Nf3']
    ]);
  });
});

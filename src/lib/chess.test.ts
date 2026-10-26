import { describe, expect, it } from 'vitest';

import { getMoveType } from '$lib/chess';
import MoveType from '$models/MoveType';

describe('getMoveType', () => {
  it('detects normal moves', () => {
    expect(getMoveType('e4')).toBe(MoveType.MOVE);
    expect(getMoveType('Nf3')).toBe(MoveType.MOVE);
  });

  it('detects castling', () => {
    expect(getMoveType('O-O')).toBe(MoveType.CASTLE);
    expect(getMoveType('O-O-O')).toBe(MoveType.CASTLE);
  });

  it('detects captures', () => {
    expect(getMoveType('exd5')).toBe(MoveType.CAPTURE);
    expect(getMoveType('Nxe5')).toBe(MoveType.CAPTURE);
  });

  it('detects promotions', () => {
    expect(getMoveType('e8=Q')).toBe(MoveType.PROMOTION);
    expect(getMoveType('exd8=N')).toBe(MoveType.PROMOTION);
  });

  it('detects checks', () => {
    expect(getMoveType('Qh5+')).toBe(MoveType.CHECK);
  });

  it('detects checkmates', () => {
    expect(getMoveType('Qh7#')).toBe(MoveType.CHECKMATE);
  });

  it('lets check and checkmate take precedence over captures and promotions', () => {
    expect(getMoveType('Qxe5+')).toBe(MoveType.CHECK);
    expect(getMoveType('exd8=Q+')).toBe(MoveType.CHECK);
    expect(getMoveType('exd8=Q#')).toBe(MoveType.CHECKMATE);
  });

  it('does not treat castling with check as castling', () => {
    expect(getMoveType('O-O+')).toBe(MoveType.CHECK);
  });
});

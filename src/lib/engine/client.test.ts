import { describe, expect, it } from 'vitest';

import { parseInfoLine } from './client';

describe('parseInfoLine', () => {
  it('parses a full multipv 1 info line', () => {
    expect(
      parseInfoLine(
        'info depth 15 seldepth 22 multipv 1 score cp 34 nodes 120000 nps 500000 tbhits 3 time 240 pv e2e4 e7e5 g1f3'
      )
    ).toEqual({
      depth: 15,
      seldepth: 22,
      multipv: 1,
      score: { type: 'cp', value: 34 },
      tbhits: 3,
      pv: 'e2e4 e7e5 g1f3'
    });
  });

  it('parses mate scores and multipv 2 lines', () => {
    expect(parseInfoLine('info depth 18 multipv 2 score mate -4 pv d7d5 c2c4')).toEqual({
      depth: 18,
      multipv: 2,
      score: { type: 'mate', value: -4 },
      pv: 'd7d5 c2c4'
    });
  });

  it('records lowerbound and upperbound score bounds', () => {
    expect(parseInfoLine('info depth 10 multipv 1 score cp 120 lowerbound pv e2e4')?.score).toEqual(
      {
        type: 'cp',
        value: 120,
        bound: 'lowerbound'
      }
    );
    expect(parseInfoLine('info depth 10 multipv 1 score cp -80 upperbound pv d2d4')?.score).toEqual(
      {
        type: 'cp',
        value: -80,
        bound: 'upperbound'
      }
    );
  });

  it('does not require the requested depth or a fixed token order', () => {
    expect(parseInfoLine('info multipv 1 tbhits 0 score cp 0 depth 9 pv e2e4')).toEqual({
      multipv: 1,
      tbhits: 0,
      score: { type: 'cp', value: 0 },
      depth: 9,
      pv: 'e2e4'
    });
  });

  it('ignores unknown info fields but keeps the known ones', () => {
    expect(parseInfoLine('info depth 12 currmove e2e4 currmovenumber 1 wdl 10 20 30')).toEqual({
      depth: 12
    });
  });

  it('returns null for non-info, unknown, and malformed lines', () => {
    expect(parseInfoLine('bestmove e2e4')).toBeNull();
    expect(parseInfoLine('info string NNUE evaluation enabled')).toBeNull();
    expect(parseInfoLine('info depth abc pv e2e4')).toBeNull();
    expect(parseInfoLine('info depth 12 multipv 1 score cp pv e2e4')).toBeNull();
    expect(parseInfoLine('info depth 12 multipv 1 score cp 20 pv')).toBeNull();
    expect(parseInfoLine('')).toBeNull();
  });
});

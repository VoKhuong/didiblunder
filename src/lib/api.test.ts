import { describe, expect, it } from 'vitest';

import {
  CHESSCOM_HISTORY_MONTHS,
  ChessComApiError,
  fetchGamesPage,
  getArchiveMonths,
  type ChessComCursor,
  type ChessComGame
} from '$lib/api';

const archiveKey = (index: number) => {
  const { year, month } = getArchiveMonths(new Date(), CHESSCOM_HISTORY_MONTHS)[index];
  return `${year}/${String(month).padStart(2, '0')}`;
};

const archiveKeys = () =>
  getArchiveMonths(new Date(), CHESSCOM_HISTORY_MONTHS).map(
    ({ year, month }) => `${year}/${String(month).padStart(2, '0')}`
  );

const makeGame = (endTime: number, url?: string): ChessComGame => ({
  pgn: '1. e4 e5',
  end_time: endTime,
  url: url ?? `https://www.chess.com/game/live/${endTime}`,
  white: { username: 'magnus', rating: 2800, result: 'win' },
  black: { username: 'opponent', rating: 2700, result: 'resigned' }
});

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** Archives keyed by `yyyy/mm`; a number is used as the response status. */
const mockFetch = (archives: Record<string, ChessComGame[] | number>) => {
  const requested: string[] = [];

  const fetchImpl = (async (input: RequestInfo | URL) => {
    const url = String(input);
    const match = /\/games\/(\d{4}\/\d{2})$/.exec(url);
    if (!match) throw new Error(`unexpected url: ${url}`);

    const key = match[1];
    requested.push(key);

    const archive = archives[key];
    if (archive === undefined) return new Response('not found', { status: 404 });
    if (typeof archive === 'number') return new Response('error', { status: archive });

    return new Response(JSON.stringify({ games: archive }), { status: 200 });
  }) as typeof fetch;

  return { fetchImpl, requested };
};

describe('getArchiveMonths', () => {
  it('returns the last 12 months newest-first', () => {
    const months = getArchiveMonths(new Date(2025, 2, 15), 12);

    expect(months).toHaveLength(12);
    expect(months[0]).toEqual({ year: 2025, month: 3 });
    expect(months.at(-1)).toEqual({ year: 2024, month: 4 });
  });

  it('rolls over the year in January', () => {
    expect(getArchiveMonths(new Date(2025, 0, 5), 3)).toEqual([
      { year: 2025, month: 1 },
      { year: 2024, month: 12 },
      { year: 2024, month: 11 }
    ]);
  });
});

describe('fetchGamesPage', () => {
  it('returns the newest 20 games of a single month', async () => {
    const { fetchImpl } = mockFetch({ [archiveKey(0)]: range(1, 50).map((t) => makeGame(t)) });

    const page = await fetchGamesPage('magnus', null, undefined, fetchImpl);

    expect(page.games.map((game) => game.end_time)).toEqual(range(31, 50).reverse());
    expect(page.nextCursor).toEqual({ month: 0, offset: 20 });
  });

  it('spans several months when the current month is short', async () => {
    const { fetchImpl } = mockFetch({
      [archiveKey(0)]: range(100, 104).map((t) => makeGame(t)),
      [archiveKey(1)]: range(1, 40).map((t) => makeGame(t))
    });

    const page = await fetchGamesPage('magnus', null, undefined, fetchImpl);

    expect(page.games.map((game) => game.end_time)).toEqual([
      ...range(100, 104).reverse(),
      ...range(26, 40).reverse()
    ]);
    expect(page.nextCursor).toEqual({ month: 1, offset: 15 });

    const next = await fetchGamesPage('magnus', page.nextCursor, undefined, fetchImpl);

    expect(next.games.map((game) => game.end_time)).toEqual(range(6, 25).reverse());
    expect(next.nextCursor).toEqual({ month: 1, offset: 35 });
  });

  it('skips an empty month', async () => {
    const { fetchImpl } = mockFetch({
      [archiveKey(0)]: [],
      [archiveKey(1)]: range(1, 25).map((t) => makeGame(t))
    });

    const page = await fetchGamesPage('magnus', null, undefined, fetchImpl);

    expect(page.games).toHaveLength(20);
    expect(page.nextCursor).toEqual({ month: 1, offset: 20 });
  });

  it('exhausts the 12-month window', async () => {
    const { fetchImpl, requested } = mockFetch({
      [archiveKey(5)]: range(1, 8).map((t) => makeGame(t))
    });

    const page = await fetchGamesPage('magnus', null, undefined, fetchImpl);

    expect(page.games).toHaveLength(8);
    expect(page.nextCursor).toBeNull();
    expect(requested).toHaveLength(CHESSCOM_HISTORY_MONTHS);
    expect(new Set(requested)).toEqual(new Set(archiveKeys()));
  });

  it('pages through the window without duplicates or gaps', async () => {
    const { fetchImpl } = mockFetch({
      [archiveKey(0)]: Array.from({ length: 25 }, (_, i) => makeGame(1000 - i)),
      [archiveKey(1)]: [],
      [archiveKey(2)]: Array.from({ length: 30 }, (_, i) => makeGame(800 - i))
    });

    const collected: ChessComGame[] = [];
    let cursor: ChessComCursor | null = null;

    for (let call = 0; call < 20; call += 1) {
      const page = await fetchGamesPage('magnus', cursor, 7, fetchImpl);
      collected.push(...page.games);
      cursor = page.nextCursor;
      if (!cursor) break;
    }

    expect(collected).toHaveLength(55);
    expect(new Set(collected.map((game) => game.end_time)).size).toBe(55);
    for (let i = 1; i < collected.length; i += 1) {
      expect(collected[i].end_time).toBeLessThan(collected[i - 1].end_time);
    }
  });

  it('dedupes a game that appears in two months', async () => {
    const shared = makeGame(900, 'https://www.chess.com/game/live/shared');
    const { fetchImpl } = mockFetch({
      [archiveKey(0)]: [shared],
      [archiveKey(1)]: [shared, ...Array.from({ length: 18 }, (_, i) => makeGame(400 - i))]
    });

    const page = await fetchGamesPage('magnus', null, 20, fetchImpl);

    expect(page.games.filter((game) => game.url === shared.url)).toHaveLength(1);
    expect(page.games).toHaveLength(19);
    expect(page.nextCursor).toBeNull();
  });

  it('throws a retryable error on 429', async () => {
    const { fetchImpl } = mockFetch({ [archiveKey(0)]: 429 });

    await expect(fetchGamesPage('magnus', null, 5, fetchImpl)).rejects.toBeInstanceOf(
      ChessComApiError
    );
    await expect(fetchGamesPage('magnus', null, 5, fetchImpl)).rejects.toMatchObject({
      status: 429,
      retryable: true
    });
  });

  it('treats a 404 archive month as empty', async () => {
    const { fetchImpl } = mockFetch({
      [archiveKey(1)]: [makeGame(2), makeGame(1)]
    });

    const page = await fetchGamesPage('magnus', null, 5, fetchImpl);

    expect(page.games.map((game) => game.end_time)).toEqual([2, 1]);
    expect(page.nextCursor).toBeNull();
  });

  it('honours the pageSize override', async () => {
    const { fetchImpl } = mockFetch({ [archiveKey(0)]: range(1, 10).map((t) => makeGame(t)) });

    const page = await fetchGamesPage('magnus', null, 5, fetchImpl);

    expect(page.games.map((game) => game.end_time)).toEqual([10, 9, 8, 7, 6]);
    expect(page.nextCursor).toEqual({ month: 0, offset: 5 });
  });
});

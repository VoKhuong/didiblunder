import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadRecentGames, type ChessComGame } from '$lib/api';

const validGame = (overrides: Partial<ChessComGame> = {}): ChessComGame => ({
  pgn: '1. e4 e5',
  end_time: 1700000000,
  white: { username: 'alice', rating: 1500, result: 'win' },
  black: { username: 'bob', rating: 1400, result: 'checkmated' },
  ...overrides
});

const response = (payload: unknown, overrides: Record<string, unknown> = {}) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  json: async () => payload,
  ...overrides
});

describe('loadRecentGames', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15));
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    mockFetch.mockReset();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('loads the current month and returns well-formed games', async () => {
    const game = validGame();
    mockFetch.mockResolvedValueOnce(response({ games: [game, { pgn: 42 }, null] }));

    await expect(loadRecentGames('alice')).resolves.toEqual([game]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('https://api.chess.com/pub/player/alice/games/2025/06', {
      signal: undefined
    });
  });

  it('falls back to the previous month when the current month is empty', async () => {
    mockFetch
      .mockResolvedValueOnce(response({ games: [] }))
      .mockResolvedValueOnce(response({ games: [validGame()] }));

    await expect(loadRecentGames('alice')).resolves.toHaveLength(1);
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'https://api.chess.com/pub/player/alice/games/2025/06',
      { signal: undefined }
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://api.chess.com/pub/player/alice/games/2025/05',
      { signal: undefined }
    );
  });

  it('rolls January back to December of the previous year', async () => {
    vi.setSystemTime(new Date(2025, 0, 15));
    mockFetch
      .mockResolvedValueOnce(response({ games: [] }))
      .mockResolvedValueOnce(response({ games: [] }));

    await loadRecentGames('alice');

    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://api.chess.com/pub/player/alice/games/2024/12',
      { signal: undefined }
    );
  });

  it('passes the abort signal to every request', async () => {
    const controller = new AbortController();
    mockFetch
      .mockResolvedValueOnce(response({ games: [] }))
      .mockResolvedValueOnce(response({ games: [validGame()] }));

    await loadRecentGames('alice', controller.signal);

    expect(mockFetch).toHaveBeenNthCalledWith(1, expect.any(String), {
      signal: controller.signal
    });
    expect(mockFetch).toHaveBeenNthCalledWith(2, expect.any(String), {
      signal: controller.signal
    });
  });

  it('throws a helpful error when the request fails', async () => {
    mockFetch.mockResolvedValueOnce(
      response(null, { ok: false, status: 404, statusText: 'Not Found' })
    );

    await expect(loadRecentGames('missing')).rejects.toThrow(
      'Could not load games for "missing" from chess.com (404 Not Found).'
    );
  });

  it('throws a clear error when the payload has no games array', async () => {
    mockFetch.mockResolvedValueOnce(response({}));

    await expect(loadRecentGames('alice')).rejects.toThrow(
      'Unexpected response from chess.com for "alice": expected a "games" array.'
    );
  });
});

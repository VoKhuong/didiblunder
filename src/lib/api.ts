export type ChessComPlayer = {
  username: string;
  rating: number;
  result: string;
};

export type ChessComGame = {
  pgn: string;
  end_time: number;
  white: ChessComPlayer;
  black: ChessComPlayer;
  url?: string;
};

export const CHESSCOM_PAGE_SIZE = 20;
export const CHESSCOM_HISTORY_MONTHS = 12;

/** month 0 = current month, 0..CHESSCOM_HISTORY_MONTHS - 1 */
export type ChessComCursor = { month: number; offset: number };

export type ChessComGamesPage = {
  games: ChessComGame[];
  /** null => the CHESSCOM_HISTORY_MONTHS window is exhausted */
  nextCursor: ChessComCursor | null;
};

export class ChessComApiError extends Error {
  status: number;
  retryable: boolean;

  constructor(status: number, retryable: boolean, message?: string) {
    super(message ?? `chess.com API request failed with status ${status}`);
    this.name = 'ChessComApiError';
    this.status = status;
    this.retryable = retryable;
  }
}

/** Newest-first archive months, `month` is 1-based (e.g. 2025/03). */
export const getArchiveMonths = (now: Date, count: number): { year: number; month: number }[] => {
  const months: { year: number; month: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: date.getFullYear(), month: date.getMonth() + 1 });
  }
  return months;
};

export const chessComGameKey = (game: ChessComGame) =>
  game.url ?? `${game.end_time}:${game.white.username}:${game.black.username}`;

const fetchArchiveMonth = async (
  username: string,
  year: number,
  month: number,
  fetchImpl: typeof fetch
): Promise<ChessComGame[]> => {
  const url = `https://api.chess.com/pub/player/${username}/games/${year}/${String(month).padStart(2, '0')}`;

  let response: Response;
  try {
    response = await fetchImpl(url);
  } catch (error) {
    throw new ChessComApiError(
      0,
      true,
      error instanceof Error ? error.message : 'Could not reach chess.com'
    );
  }

  // A missing archive month means "no games that month", not an error.
  if (response.status === 404) return [];

  if (!response.ok) {
    throw new ChessComApiError(response.status, response.status === 429 || response.status >= 500);
  }

  const payload = (await response.json()) as { games?: ChessComGame[] };
  return payload.games ?? [];
};

/**
 * Fetches one page of games, newest-first, starting at `cursor` (or the most recent game
 * when `cursor` is null). Never looks further back than CHESSCOM_HISTORY_MONTHS months.
 */
export const fetchGamesPage = async (
  username: string,
  cursor: ChessComCursor | null,
  pageSize: number = CHESSCOM_PAGE_SIZE,
  fetchImpl: typeof fetch = fetch
): Promise<ChessComGamesPage> => {
  const months = getArchiveMonths(new Date(), CHESSCOM_HISTORY_MONTHS);
  let monthIndex = cursor?.month ?? 0;
  let offset = cursor?.offset ?? 0;

  const games: ChessComGame[] = [];
  const seen = new Set<string>();

  while (monthIndex < months.length && games.length < pageSize) {
    const { year, month } = months[monthIndex];
    const monthGames = await fetchArchiveMonth(username, year, month, fetchImpl);
    const sorted = [...monthGames].sort((a, b) => b.end_time - a.end_time);

    // The cursor may point past the end of a month (e.g. when the previous page
    // ended exactly on that month's last game).
    if (offset >= sorted.length) {
      monthIndex += 1;
      offset = 0;
      continue;
    }

    while (offset < sorted.length && games.length < pageSize) {
      const game = sorted[offset];
      offset += 1;

      const key = chessComGameKey(game);
      if (seen.has(key)) continue;
      seen.add(key);
      games.push(game);
    }

    if (offset >= sorted.length) {
      monthIndex += 1;
      offset = 0;
    }
  }

  return {
    games,
    nextCursor: monthIndex >= months.length ? null : { month: monthIndex, offset }
  };
};

export const isUsername = (username: string, player: string) =>
  player.toLowerCase() === username.toLowerCase();

export const userWon = (username: string, game: ChessComGame) =>
  (isUsername(username, game.white.username) && game.white.result === 'win') ||
  (isUsername(username, game.black.username) && game.black.result === 'win');

export const isDraw = (game: ChessComGame) =>
  game.white.result !== 'win' && game.black.result !== 'win';

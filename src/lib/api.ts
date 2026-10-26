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
};

type YearMonth = {
  year: number;
  month: number;
};

const PLAYER_GAMES_URL = 'https://api.chess.com/pub/player';

const previousMonth = ({ year, month }: YearMonth): YearMonth =>
  month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };

const formatMonth = (month: number) => String(month).padStart(2, '0');

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isChessComPlayer = (value: unknown): value is ChessComPlayer =>
  isRecord(value) &&
  typeof value.username === 'string' &&
  typeof value.rating === 'number' &&
  typeof value.result === 'string';

const isChessComGame = (value: unknown): value is ChessComGame =>
  isRecord(value) &&
  typeof value.pgn === 'string' &&
  typeof value.end_time === 'number' &&
  isChessComPlayer(value.white) &&
  isChessComPlayer(value.black);

const fetchGamesForMonth = async (
  username: string,
  { year, month }: YearMonth,
  signal?: AbortSignal
): Promise<ChessComGame[]> => {
  const url = `${PLAYER_GAMES_URL}/${encodeURIComponent(username)}/games/${year}/${formatMonth(month)}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    const status = response.statusText
      ? `${response.status} ${response.statusText}`
      : String(response.status);

    throw new Error(
      `Could not load games for "${username}" from chess.com (${status}). Check the username and try again.`
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error(
      `Unexpected response from chess.com for "${username}": the payload is not valid JSON.`
    );
  }

  if (!isRecord(payload) || !Array.isArray(payload.games)) {
    throw new Error(
      `Unexpected response from chess.com for "${username}": expected a "games" array.`
    );
  }

  return payload.games.filter(isChessComGame);
};

export const loadRecentGames = async (
  username: string,
  signal?: AbortSignal
): Promise<ChessComGame[]> => {
  const today = new Date();
  const currentMonth: YearMonth = {
    year: today.getFullYear(),
    month: today.getMonth() + 1
  };

  const games = await fetchGamesForMonth(username, currentMonth, signal);
  if (games.length > 0) return games;

  return fetchGamesForMonth(username, previousMonth(currentMonth), signal);
};

export const isUsername = (username: string, player: string) =>
  player.toLowerCase() === username.toLowerCase();

export const userWon = (username: string, game: ChessComGame) =>
  (isUsername(username, game.white.username) && game.white.result === 'win') ||
  (isUsername(username, game.black.username) && game.black.result === 'win');

export const isDraw = (game: ChessComGame) =>
  game.white.result !== 'win' && game.black.result !== 'win';

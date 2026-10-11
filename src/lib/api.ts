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

export const loadRecentGames = async (username: string): Promise<ChessComGame[]> => {
  const today = new Date();
  const response = await fetch(
    `https://api.chess.com/pub/player/${username}/games/${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}`
  );
  const payload = await response.json();
  return payload.games;
};

export const isUsername = (username: string, player: string) =>
  player.toLowerCase() === username.toLowerCase();

export const userWon = (username: string, game: ChessComGame) =>
  (isUsername(username, game.white.username) && game.white.result === 'win') ||
  (isUsername(username, game.black.username) && game.black.result === 'win');

export const isDraw = (game: ChessComGame) =>
  game.white.result !== 'win' && game.black.result !== 'win';

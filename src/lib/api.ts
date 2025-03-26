export const loadRecentGames = async (username: string) => {
  const today = new Date();
  const response = await fetch(
    `https://api.chess.com/pub/player/${username}/games/${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}`
  );
  const payload = await response.json();
  return payload.games;
};

export const userWon = (username: string, game: any) =>
  (game.white.username === username && game.white.result === 'win') ||
  (game.black.username === username && game.black.result === 'win');

export const isDraw = (game: any) => game.white.result !== 'win' && game.black.result !== 'win';

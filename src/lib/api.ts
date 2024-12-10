
export const loadRecentGames = async (username: string) => {
  const today = new Date();
  const response = await fetch(`https://api.chess.com/pub/player/${username}/games/${today.getFullYear()}/${today.getMonth() + 1}`);
  const payload = await response.json();
  return payload.games;
}

export const userWon = (username: string, game: any) =>
  (game.white.username === username && game.white.result === 'win')
  || (game.black.username === username && game.black.result === 'win');

export const loadRecentGames = async (username: string) => {
  const today = new Date();
  const response = await fetch(`https://api.chess.com/pub/player/${username}/games/${today.getFullYear()}/${today.getMonth() + 1}`);
  const payload = await response.json();
  return payload.games;
}
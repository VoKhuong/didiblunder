import { getContext, setContext } from 'svelte';

import type { Game } from '$lib/game.svelte';

export const GAME_CONTEXT_KEY = 'game';

export function setGame(game: Game): void {
  setContext(GAME_CONTEXT_KEY, game);
}

export function getGame(): Game {
  const game = getContext<Game | undefined>(GAME_CONTEXT_KEY);

  if (!game) {
    throw new Error(
      `Game context not found. Make sure an ancestor component calls setGame() with the "${GAME_CONTEXT_KEY}" key.`
    );
  }

  return game;
}

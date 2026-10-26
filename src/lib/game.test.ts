import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';

import { Game } from '$lib/game.svelte';

const createGame = () => {
  const game = new Game();
  const chess = new Chess();
  for (const san of ['e4', 'e5', 'Nf3', 'Nc6']) chess.move(san);

  game.history = chess.history({ verbose: true });
  game.startFen = game.history[0].before;

  return game;
};

describe('Game', () => {
  it('derives the position from the selected move', () => {
    const game = createGame();

    expect(game.position).toBe(game.startFen);

    game.goTo(0);
    expect(game.position).toBe(game.history[0].after);

    game.last();
    expect(game.position).toBe(game.history.at(-1)!.after);
  });

  it('clamps navigation to the available moves', () => {
    const game = createGame();

    game.first();
    expect(game.move).toBe(-1);

    game.prev();
    expect(game.move).toBe(-1);

    game.next();
    expect(game.move).toBe(0);

    game.goTo(99);
    expect(game.move).toBe(game.history.length - 1);

    game.goTo(-99);
    expect(game.move).toBe(-1);
  });

  it('handles an empty history', () => {
    const game = new Game();

    game.first();
    expect(game.move).toBe(-1);
    expect(game.position).toBe(game.startFen);

    game.next();
    expect(game.move).toBe(-1);

    game.last();
    expect(game.move).toBe(-1);
  });
});

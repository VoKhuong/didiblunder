import { Chess, DEFAULT_POSITION, type Move } from 'chess.js';

import { init } from '$lib/engine';
import type { Evaluation } from '$models/Evaluation';
import Label from '$models/Label';
import type { Settings } from '$models/Settings';

/**
 * Shared, reactive state for a single game analysis session.
 *
 * Created once in the root page and provided to descendants via context. Keeping
 * the state in a class with runes avoids the Svelte 4 store boilerplate while
 * still exposing fine-grained reactivity.
 */
export class Game {
  /** Scratch board shared by the panel, board and engine. Not reactive. */
  readonly chess = new Chess();

  history = $state.raw<Move[]>([]);
  position = $state(DEFAULT_POSITION);
  move = $state(-1);
  evaluations = $state.raw<Evaluation[]>([]);
  engine = $state.raw<Worker>();

  settings = $state<Settings>({
    orientation: 'w',
    depth: 15,
    engine: 'lite-single'
  });

  /** The evaluation of the currently selected move. */
  evaluation = $derived.by((): Evaluation => {
    if (this.move >= 0 && this.move < this.evaluations.length) {
      return this.evaluations[this.move];
    }
    return {
      score: 0,
      type: 'cp',
      pv: '',
      label: Label.UNDEFINED
    };
  });

  async initEngine(engine: string) {
    this.engine?.terminate();
    this.engine = await init(engine);
  }
}

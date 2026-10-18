import { Chess, DEFAULT_POSITION, type Move } from 'chess.js';

import { init, type EngineClient } from '$lib/engine';
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
  engine = $state.raw<EngineClient>();
  isAnalyzing = $state(false);

  private abortController: AbortController | null = null;
  private generation = 0;

  settings = $state<Settings>({
    orientation: 'w',
    depth: 15,
    engine: 'lite-single',
    theme: 'dark'
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

  beginAnalysis(): { signal: AbortSignal; generation: number } | null {
    if (this.isAnalyzing) return null;

    this.isAnalyzing = true;
    this.abortController = new AbortController();
    this.generation += 1;

    return { signal: this.abortController.signal, generation: this.generation };
  }

  endAnalysis(generation: number) {
    if (generation !== this.generation) return;
    this.isAnalyzing = false;
    this.abortController = null;
  }

  isCurrentAnalysis(generation: number): boolean {
    return generation === this.generation;
  }

  cancelAnalysis() {
    this.abortController?.abort();
    this.abortController = null;
  }

  async initEngine(engine: string) {
    this.cancelAnalysis();
    this.engine?.terminate();
    this.engine = await init(engine);
  }
}

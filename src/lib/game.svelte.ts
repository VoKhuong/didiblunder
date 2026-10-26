import { Chess, DEFAULT_POSITION, type Move } from 'chess.js';

import { init } from '$lib/engine';
import type { EngineClient } from '$lib/engine/client';
import type { EngineId } from '$lib/engines';
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

  /** Raw PGN text shared by every loader and the analysis action. */
  pgn = $state('');
  history = $state.raw<Move[]>([]);
  startFen = $state(DEFAULT_POSITION);
  move = $state(-1);
  evaluations = $state.raw<Evaluation[]>([]);
  engine = $state.raw<EngineClient>();
  isAnalyzing = $state(false);

  private analysisController: AbortController | null = null;
  private analysisGeneration = 0;

  settings = $state<Settings>({
    orientation: 'w',
    depth: 15,
    engine: 'lite-single',
    theme: 'dark'
  });

  /** The position after the currently selected move, derived from the start FEN. */
  position = $derived(this.history[this.move]?.after ?? this.startFen);

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

  /** Select a move by index, clamping to the valid range (-1 means the start position). */
  goTo(index: number) {
    this.move = Math.max(-1, Math.min(index, this.history.length - 1));
  }

  first() {
    this.goTo(-1);
  }

  prev() {
    this.goTo(this.move - 1);
  }

  next() {
    this.goTo(this.move + 1);
  }

  last() {
    this.goTo(this.history.length - 1);
  }

  beginAnalysis() {
    this.analysisController?.abort();

    const controller = new AbortController();
    this.analysisController = controller;
    this.analysisGeneration += 1;
    this.isAnalyzing = true;

    return { signal: controller.signal, generation: this.analysisGeneration };
  }

  isAnalysisCurrent(generation: number): boolean {
    return generation === this.analysisGeneration;
  }

  endAnalysis(generation: number) {
    if (!this.isAnalysisCurrent(generation)) return;

    this.analysisController = null;
    this.isAnalyzing = false;
  }

  cancelAnalysis() {
    this.analysisController?.abort();
    this.analysisController = null;
    this.isAnalyzing = false;
  }

  async initEngine(engine: EngineId) {
    this.cancelAnalysis();
    this.engine?.terminate();
    this.engine = await init(engine);
  }
}

import type { RawEval } from '$models/Engine';
import { EVAL_CHECKMATE_BLACK, EVAL_CHECKMATE_WHITE, type Evaluation } from '$models/Evaluation';
import Label from '$models/Label';
import type { Chess, Move } from 'chess.js';
import {
  computeWinChanceLost,
  isForced,
  isNextMoveCrucial,
  haveOnlyOneGoodMove,
  isSacrifice,
  opponentDidABadPlay,
  getBestMove
} from './evaluation';

import OPENINGS from '$lib/openings.json';
import { log } from '$lib/log';
import { EngineClient } from './engine/client';
import { ENGINES, type EngineId } from './engines';

const NEUTRAL_EVAL: Evaluation = {
  score: 0,
  type: 'cp',
  pv: '',
  label: Label.UNDEFINED
};

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('Analysis aborted', 'AbortError');
  }
}

export async function init(engine: EngineId): Promise<EngineClient> {
  const config = ENGINES[engine];
  if (!config) {
    throw new Error('Invalid engine');
  }

  const workerModule = await config.load();
  const worker = new workerModule.default();
  const client = new EngineClient(worker);

  if (config.threads) {
    worker.postMessage(`setoption name Threads value ${window.navigator.hardwareConcurrency}`);
  }
  worker.postMessage(`setoption name MultiPV value 2`);
  worker.postMessage(`setoption name Move Overhead value 0`);

  worker.postMessage('isready');
  worker.postMessage('uci');
  worker.postMessage('ucinewgame');

  return client;
}

export async function analyze_game(
  client: EngineClient,
  history: Move[],
  chess: Chess,
  depth: number,
  setProgress: (n: number) => void,
  signal?: AbortSignal
): Promise<Evaluation[]> {
  throwIfAborted(signal);

  const evaluations: Evaluation[] = [];
  const rawEvals: RawEval[] = [];
  let mayBeGreat = false;
  const start = performance.now();
  const length = history.length;
  let rawPromise;

  for (let i = 0; i < history.length; i++) {
    throwIfAborted(signal);
    rawPromise = evaluate(client, history[i].after, depth, signal);
    setProgress(Math.min(Math.floor((i / length) * 100), 98));
    rawEvals.push(await rawPromise);
  }

  throwIfAborted(signal);

  const mid = performance.now();

  for (let i = 0; i < history.length; i++) {
    throwIfAborted(signal);
    mayBeGreat =
      isNextMoveCrucial(history[i].color, evaluations.at(-2), evaluations.at(-1)) ||
      haveOnlyOneGoodMove(history[i].color, evaluations.at(-1));
    evaluations.push(analyze_move(history[i], rawEvals[i], chess, evaluations.at(-1), mayBeGreat));
  }
  throwIfAborted(signal);
  setProgress(100);
  const end = performance.now();
  log(`Execution engine time: ${mid - start} ms`);
  log(`Execution labeling time: ${end - mid} ms`);
  log(`Execution total time: ${end - start} ms`);
  return evaluations;
}

export function analyze_move(
  move: Move,
  rawEval: RawEval,
  chess: Chess,
  previousEval: Evaluation | undefined,
  mayBeGreat: boolean
): Evaluation {
  chess.load(move.after);
  const turn = chess.turn();
  const previous = previousEval ?? NEUTRAL_EVAL;
  const best = getBestMove(previous);

  if (chess.isCheckmate()) {
    return turn === 'b' ? EVAL_CHECKMATE_WHITE : EVAL_CHECKMATE_BLACK;
  }

  // Reverse when black
  rawEval.score = turn === 'w' ? rawEval.score : -rawEval.score;

  if (rawEval.altLine && turn === 'b') {
    rawEval.altLine.score = -rawEval.altLine.score;
  }

  let label;

  // Compute label
  // Check for BOOK
  if (!previousEval || previousEval.label === Label.BOOK) {
    const openingName: string | undefined = OPENINGS[chess.fen() as keyof typeof OPENINGS];
    if (openingName) {
      return {
        ...rawEval,
        label: Label.BOOK,
        opening: openingName
      };
    }
  }

  // Check for BEST
  if (move.lan === best) {
    label = Label.BEST;
  }

  const winChanceLost =
    turn === 'b'
      ? computeWinChanceLost(previous, rawEval)
      : -computeWinChanceLost(previous, rawEval);

  // Check for EXCELLENT, GOOD, INACCURACY, MISTAKE or BLUNDER
  if (label === undefined) {
    if (winChanceLost <= 2) {
      label = Label.EXCELLENT;
    } else if (winChanceLost <= 5) {
      label = Label.GOOD;
    } else if (winChanceLost <= 10) {
      label = Label.INACCURACY;
    } else if (winChanceLost <= 20) {
      label = Label.MISTAKE;
    } else {
      label = Label.BLUNDER;
    }
  }

  // Check for FORCED, GREAT or BRILLIANT
  if (label === Label.BEST) {
    if (isForced(previous)) {
      label = Label.FORCED;
    } else if (isSacrifice(chess, move)) {
      label = Label.BRILLIANT;
    } else if (mayBeGreat) {
      label = Label.GREAT;
    }
  }

  // Check for MISSED
  if (opponentDidABadPlay(previousEval) && winChanceLost >= 5) {
    label = Label.MISSED;
  }

  return {
    ...rawEval,
    label,
    best
  };
}

export function evaluate(
  client: EngineClient,
  fen: string,
  depth: number,
  signal?: AbortSignal
): Promise<RawEval> {
  return client.evaluate(fen, depth, signal);
}

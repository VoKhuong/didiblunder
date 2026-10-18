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

const REGEX_MATCH =
  /multipv (\d+) score (\w+) (-?\d+) nodes \d+ nps \d+(?: hashfull \d+)? time \d+ pv (.*)/;

const NEUTRAL_EVAL: Evaluation = {
  score: 0,
  type: 'cp',
  pv: '',
  label: Label.UNDEFINED
};

type EngineRequest = {
  fen: string;
  depth: number;
  result: RawEval;
  resolve: (result: RawEval) => void;
  reject: (error: Error) => void;
};

export class EngineClient {
  private readonly worker: Worker;
  private readonly queue: EngineRequest[] = [];
  private active: EngineRequest | undefined;
  private terminated = false;

  constructor(worker: Worker) {
    this.worker = worker;
    this.worker.onmessage = ({ data }: MessageEvent<string>) => {
      log(`page got message: ${data}`);
      this.handleMessage(data);
    };
    this.worker.onerror = (ev: ErrorEvent) => {
      log(`page got error: ${ev.message}`);
      this.fail(new Error(ev.message || 'Engine error'));
    };
  }

  evaluate(fen: string, depth: number): Promise<RawEval> {
    if (this.terminated) {
      return Promise.reject(new Error('Engine has been terminated'));
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ fen, depth, result: {} as RawEval, resolve, reject });
      this.pump();
    });
  }

  terminate(reason: Error = new Error('Engine has been terminated')) {
    if (this.terminated) return;
    this.terminated = true;
    this.worker.onmessage = null;
    this.worker.onerror = null;
    this.worker.terminate();
    this.rejectAll(reason);
  }

  private pump() {
    if (this.terminated || this.active) return;

    const request = this.queue.shift();
    if (!request) return;

    this.active = request;

    this.worker.postMessage(`position fen ${request.fen}`);
    this.worker.postMessage(`go depth ${request.depth}`);
  }

  private handleMessage(data: string) {
    const request = this.active;
    if (!request) return;

    const regexInfo = new RegExp(`^info depth ${request.depth} seldepth \\d+ multipv`);
    if (regexInfo.test(data)) {
      const match = data.match(REGEX_MATCH);
      if (!match) {
        this.fail(new Error(`REGEX_MATCH failed: ${data}`));
        return;
      }
      // Info best line
      if (match.at(1) === '1') {
        request.result = {
          ...request.result,
          type: match.at(2) as RawEval['type'],
          score: parseInt(match.at(3)!),
          pv: match.at(4)!,
          data
        };
      } else {
        // Alt line
        request.result.altLine = {
          type: match.at(2) as RawEval['type'],
          score: parseInt(match.at(3)!),
          pv: match.at(4)!
        };
      }
    }
    // Last message
    else if (data.startsWith('bestmove')) {
      this.active = undefined;
      request.resolve(request.result);
      this.pump();
    }
  }

  private fail(reason: Error) {
    if (this.terminated) return;
    this.terminated = true;
    this.worker.onmessage = null;
    this.worker.onerror = null;
    this.worker.terminate();
    this.rejectAll(reason);
  }

  private rejectAll(reason: Error) {
    if (this.active) {
      this.active.reject(reason);
      this.active = undefined;
    }

    for (const request of this.queue.splice(0)) {
      request.reject(reason);
    }
  }
}

export async function init(engine: string): Promise<EngineClient> {
  let workerModule;
  switch (engine) {
    case 'lite-multi':
      workerModule = await import('stockfish/src/stockfish-16.1-lite.js?worker');
      break;
    case 'lite-single':
      workerModule = await import('stockfish/src/stockfish-16.1-lite-single.js?worker');
      break;
    case 'large-multi':
      workerModule = await import('stockfish/src/stockfish-16.1.js?worker');
      break;
    case 'large-single':
      workerModule = await import('stockfish/src/stockfish-16.1-single.js?worker');
      break;
    default:
      throw new Error('Invalid engine');
  }

  const worker = new workerModule.default();
  const client = new EngineClient(worker);

  if (engine.includes('multi')) {
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
  setProgress: (n: number) => void
): Promise<Evaluation[]> {
  const evaluations: Evaluation[] = [];
  const rawEvals: RawEval[] = [];
  let mayBeGreat = false;
  const start = performance.now();
  const length = history.length;

  for (let i = 0; i < history.length; i++) {
    setProgress(Math.min(Math.floor((i / length) * 100), 98));
    rawEvals.push(await client.evaluate(history[i].after, depth));
  }

  const mid = performance.now();

  for (let i = 0; i < history.length; i++) {
    mayBeGreat =
      isNextMoveCrucial(history[i].color, evaluations.at(-2), evaluations.at(-1)) ||
      haveOnlyOneGoodMove(history[i].color, evaluations.at(-1));
    evaluations.push(analyze_move(history[i], rawEvals[i], chess, evaluations.at(-1), mayBeGreat));
  }
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

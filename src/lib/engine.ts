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

export async function init(engine: string) {
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

  worker.onmessage = ({ data }: any) => log(`page got message: ${data}`);
  worker.onerror = (ev: any) => log(`page got error: ${ev.message}`);

  if (engine.includes('multi')) {
    worker.postMessage(`setoption name Threads value ${window.navigator.hardwareConcurrency}`);
  }
  worker.postMessage(`setoption name MultiPV value 2`);
  worker.postMessage(`setoption name Move Overhead value 0`);

  worker.postMessage('isready');
  worker.postMessage('uci');
  worker.postMessage('ucinewgame');

  return worker;
}

export async function analyze_game(
  worker: Worker,
  history: Move[],
  chess: Chess,
  depth: number
): Promise<Evaluation[]> {
  const evaluations: Evaluation[] = [];
  const rawEvals: RawEval[] = [];
  let mayBeGreat = false;
  const start = performance.now();

  for (const move of history) {
    rawEvals.push(await evaluate(worker, move.after, depth));
  }

  const mid = performance.now();

  for (let i = 0; i < history.length; i++) {
    mayBeGreat =
      isNextMoveCrucial(history[i].color, evaluations.at(-2), evaluations.at(-1)) ||
      haveOnlyOneGoodMove(history[i].color, evaluations.at(-1));
    evaluations.push(analyze_move(history[i], rawEvals[i], chess, evaluations.at(-1), mayBeGreat));
  }
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
  const best = getBestMove(previousEval);

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
      ? computeWinChanceLost(previousEval!, rawEval)
      : -computeWinChanceLost(previousEval!, rawEval);

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
    if (isForced(previousEval!)) {
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

const REGEX_MATCH =
  /multipv (\d+) score (\w+) (-?\d+) nodes \d+ nps \d+(?: hashfull \d+)? time \d+ pv (.*)/;

export function evaluate(worker: Worker, fen: string, depth: number): Promise<RawEval> {
  return new Promise((resolve) => {
    const regexInfo = new RegExp(`^info depth ${depth} seldepth \\d+ multipv`);
    let result: any = {};

    worker.onmessage = ({ data }: { data: string }) => {
      if (regexInfo.test(data)) {
        const match = data.match(REGEX_MATCH);
        if (!match) {
          throw new Error(`REGEX_MATCH failed: ${data}`);
        }
        // Info best line
        if (match.at(1) === '1') {
          result = {
            ...result,
            type: match.at(2),
            score: parseInt(match.at(3)!),
            pv: match.at(4),
            data
          };
        } else {
          // Alt line
          result.altLine = {
            type: match.at(2),
            score: parseInt(match.at(3)!),
            pv: match.at(4)
          };
        }
      }
      // Last message
      else if (data.startsWith('bestmove')) {
        resolve(result);
      }
    };

    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${depth}`);
  });
}

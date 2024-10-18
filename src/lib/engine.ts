import type { RawEval } from '$models/Engine';
import type { Evaluation } from '$models/Evaluation';
import Label from '$models/Label';
import type { Chess, Move } from 'chess.js';
import Stockfish from 'stockfish/src/stockfish-nnue-16.js?worker';
import { computeWinChanceLost, isBestMove } from './evaluation';

export function init() {
  const worker = new Stockfish();
  worker.onmessage = ({ data }) => console.log(`page got message: ${data}`);
  worker.onerror = (ev) => console.log(`page got error: ${ev.message}`);

  worker.postMessage(`setoption name Threads value ${window.navigator.hardwareConcurrency}`);
  // worker.postMessage('setoption name MultiPV value 3');
  worker.postMessage('setoption name UCI_ShowWDL value true');

  worker.postMessage('isready');
  worker.postMessage('uci');
  worker.postMessage('ucinewgame');

  return worker;
}

export async function analyze_game(worker: Worker, history: Move[], chess: Chess, depth: number): Promise<Evaluation[]> {
  const evaluations: Evaluation[] = [];

  for (const move of history) {
    evaluations.push(await analyze_move(worker, move, chess, evaluations.at(-1), depth));
  }
  return evaluations;
}

export async function analyze_move(worker: Worker, move: Move, chess: Chess, previousEval: Evaluation | undefined, depth: number): Promise<Evaluation> {
  let result = await evaluate(worker, move.after, depth);
  chess.load(move.after);
  const turn = chess.turn();

  // Reverse when black
  result.score = turn === 'w'
    ? result.score
    : -result.score;
  
  [result.wdl.w, result.wdl.l] = turn === 'w'
    ? [result.wdl.w, result.wdl.l]
    : [result.wdl.l, result.wdl.w];
  
  let label;
  let winChanceLost = 0;
  
  // Compute label
  // Check for BEST and BOOK
  if (isBestMove(move, previousEval)) {
    label = Label.BEST;
  }
  if (!previousEval) {
    label = Label.BOOK;
  } else {
    winChanceLost = turn === 'b'
      ? computeWinChanceLost(previousEval, result)
      : -computeWinChanceLost(previousEval, result);
  }

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

  return {
    ...result,
    label,
    winChance: winChanceLost
  };
}

export async function evaluate(worker: Worker, fen: string, depth: number): Promise<RawEval> {
  return new Promise((resolve) => {
    const regexInfo = new RegExp(`^info depth ${depth} .* multipv 1`);
    let result: RawEval;

    worker.onmessage = ({ data }: { data: string }) => {
      // Info best line
      if (regexInfo.test(data)) {
        const match = data.match(/score (\w+) (-?\d+).*wdl (\d+) (\d+) (\d+).*pv (.*)/);
        result = {
          type: match?.at(1)! as "cp" | "mate",
          score: parseInt(match?.at(2)!),
          pv: match?.at(6)!,
          wdl: {
            w: parseInt(match?.at(3)!),
            d: parseInt(match?.at(4)!),
            l: parseInt(match?.at(5)!)
          },
          data
        };
      }

      // Last message
      if (data.startsWith('bestmove')) {
        resolve(result);
      }
    };

    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${depth}`);
  });
}

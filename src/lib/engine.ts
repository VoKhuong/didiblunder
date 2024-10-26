import type { RawEval } from '$models/Engine';
import { EVAL_CHECKMATE_BLACK, EVAL_CHECKMATE_WHITE, type Evaluation } from '$models/Evaluation';
import Label from '$models/Label';
import type { Chess, Move } from 'chess.js';
import Stockfish from 'stockfish/src/stockfish-nnue-16.js?worker';
import { computeWinChanceLost, isBestMove, isForced, isNextMoveCrucial, haveOnlyOneGoodMove, isSacrifice } from './evaluation';

const NB_LINES = 3;

export function init() {
  const worker = new Stockfish();
  worker.onmessage = ({ data }) => console.log(`page got message: ${data}`);
  worker.onerror = (ev) => console.log(`page got error: ${ev.message}`);

  worker.postMessage(`setoption name Threads value ${window.navigator.hardwareConcurrency}`);
  worker.postMessage(`setoption name MultiPV value ${NB_LINES}`);
  worker.postMessage('setoption name UCI_ShowWDL value true');

  worker.postMessage('isready');
  worker.postMessage('uci');
  worker.postMessage('ucinewgame');

  return worker;
}

export async function analyze_game(worker: Worker, history: Move[], chess: Chess, depth: number): Promise<Evaluation[]> {
  const evaluations: Evaluation[] = [];
  let mayBeGreat = false;

  for (const move of history) {
    mayBeGreat = isNextMoveCrucial(move.color, evaluations.at(-2), evaluations.at(-1)) || haveOnlyOneGoodMove(move.color, evaluations.at(-1));
    evaluations.push(await analyze_move(worker, move, chess, evaluations.at(-1), mayBeGreat, depth));
  }
  return evaluations;
}

export async function analyze_move(worker: Worker, move: Move, chess: Chess, previousEval: Evaluation | undefined, mayBeGreat: boolean, depth: number): Promise<Evaluation> {
  chess.load(move.after);
  const turn = chess.turn();

  if (chess.isCheckmate()) {
    return turn === 'b' ? EVAL_CHECKMATE_WHITE : EVAL_CHECKMATE_BLACK;
  }

  let result = await evaluate(worker, move.after, depth);

  // Reverse when black
  result.score = turn === 'w'
    ? result.score
    : -result.score;
  result.altLines = result.altLines.map(x => ({ ...x, score: turn === 'w' ? x.score : -x.score }));

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

  return {
    ...result,
    label,
    winChance: winChanceLost
  };
}

export async function evaluate(worker: Worker, fen: string, depth: number): Promise<RawEval> {
  return new Promise((resolve) => {
    const regexInfo = new RegExp(`^info depth ${depth} .* multipv`);
    let result: any = {
      altLines: []
    };

    worker.onmessage = ({ data }: { data: string }) => {

      if (regexInfo.test(data)) {
        const match = data.match(/multipv (\d+) score (\w+) (-?\d+).*wdl (\d+) (\d+) (\d+).*pv (.*)/);
        const line = parseInt(match?.at(1)!);

        // Info best line
        if (line === 1) {
          result = {
            ...result,
            type: match?.at(2)!,
            score: parseInt(match?.at(3)!),
            pv: match?.at(7)!,
            wdl: {
              w: parseInt(match?.at(4)!),
              d: parseInt(match?.at(5)!),
              l: parseInt(match?.at(6)!)
            },
            data
          };
        } else {
          // Alt lines
          result.altLines.push({
            score: parseInt(match?.at(3)!),
            type: match?.at(2)!,
            pv: match?.at(7)!,
          });
        }
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

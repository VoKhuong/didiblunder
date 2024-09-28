import type { RawEval } from '$models/Engine';
import type { Evaluation } from '$models/Evaluation';
import Label from '$models/Label';
import type { Move } from 'chess.js';
import Stockfish from 'stockfish/src/stockfish-nnue-16.js?worker';

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

export async function analyze_game(worker: Worker, history: Move[], depth: number) {
  for (const move in history) {
    // TODO
  }
}

export async function analyze_move(worker: Worker, fen: string, depth: number): Promise<Evaluation> {
  let result = await evaluate(worker, fen, depth);
  console.log('result => ', result);

  return {
    ...result,
    label: Label.BOOK
  };
}

export async function evaluate(worker: Worker, fen: string, depth: number): Promise<RawEval> {
  return new Promise((resolve) => {
    const messages: string[] = [];

    const regexInfo = new RegExp(`^info depth ${depth} .* multipv 1`);
    let result: RawEval;

    worker.onmessage = ({ data }: { data: string }) => {
      messages.push(data);

      // Info best line
      if (regexInfo.test(data)) {
        const match = data.match(/score (\w+) (-?\d+).*pv (.*)/);
        console.log('data => ', data);
        result = {
          type: match?.at(1)! as "cp" | "mate",
          score: parseInt(match?.at(2)!),
          pv: match?.at(3)!
        };
      }

      // Last message
      if (data.startsWith('bestmove')) {
        console.log(messages);

        resolve(result);
      }
    };

    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${depth}`);
  });
}

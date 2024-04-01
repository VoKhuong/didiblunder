import Stockfish from 'stockfish/src/stockfish-nnue-16.js?worker';

export function init() {
  const worker = new Stockfish();
  worker.onmessage = ({ data }) => console.log(`page got message: ${data}`);
  worker.onerror = (ev) => console.log(`page got error: ${ev.message}`);

  worker.postMessage('ucinewgame');
  worker.postMessage('isready');
  worker.postMessage('uci');

  worker.postMessage(`setoption name Threads value ${window.navigator.hardwareConcurrency}`);
  worker.postMessage('setoption name MultiPV value 3');
  return worker;
}

export async function analyze(worker: Worker, fen: string, depth: number) {
  let result = await evaluate(worker, fen, depth);
  console.log('result => ', result);
}

export async function evaluate(worker: Worker, fen: string, depth: number): Promise<string[]> {
  return new Promise((resolve) => {
    const messages: string[] = [];
    worker.onmessage = ({ data }: { data: string }) => {
      messages.push(data);

      // Last message
      if (data.startsWith('bestmove')) {
        resolve(messages);
      }
    };

    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${depth}`);
  });
}

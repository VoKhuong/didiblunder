export type EngineId = 'lite-single' | 'lite-multi' | 'large-single' | 'large-multi';

type WorkerModule = { default: new () => Worker };

export type Engine = {
  label: string;
  load: () => Promise<WorkerModule>;
  threads: boolean;
  selectable: boolean;
  help: {
    name: string;
    description: string;
  };
};

export const ENGINES: Record<EngineId, Engine> = {
  'lite-single': {
    label: 'Lite single-thread ⚡',
    load: () => import('stockfish/src/stockfish-16.1-lite-single.js?worker'),
    threads: false,
    selectable: true,
    help: {
      name: 'Lite Single-Threaded Engine',
      description:
        "This version is moderately strong, very fast, and small in size (approximately 6MB), making it the best choice for most cases, including browsers that can't handle multiple threads."
    }
  },
  'lite-multi': {
    label: 'Lite multi-thread 🚀',
    load: () => import('stockfish/src/stockfish-16.1-lite.js?worker'),
    threads: true,
    selectable: true,
    help: {
      name: 'Lite Multi-Threaded Engine',
      description:
        'This version is moderately strong, fast, and much smaller in size (approximately 6MB), making it well-suited for most cases.'
    }
  },
  'large-multi': {
    label: 'Large multi-thread 🚄',
    load: () => import('stockfish/src/stockfish-16.1.js?worker'),
    threads: true,
    selectable: false,
    help: {
      name: 'Large Multi-Threaded Engine',
      description:
        'This is the strongest version of the engine but also the largest (approximately 66MB), best suited for powerful browsers and desktops, though it can take quite some time to load.'
    }
  },
  'large-single': {
    label: 'Large single-thread 🚂',
    load: () => import('stockfish/src/stockfish-16.1-single.js?worker'),
    threads: false,
    selectable: false,
    help: {
      name: 'Large Single-Threaded Engine',
      description:
        "This version is also strong and fast but slightly less powerful than the multi-threaded one, with a large file size of approximately 66MB, ideal for browsers that can't handle multiple threads, though it can take quite some time to load."
    }
  }
};

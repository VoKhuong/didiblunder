import type { RawEval, ScoreBound } from '$models/Engine';
import { log } from '$lib/log';

export const ENGINE_TIMEOUT_MS = 30_000;

export type ParsedScore = {
  type: 'cp' | 'mate';
  value: number;
  bound?: ScoreBound;
};

export type ParsedInfo = {
  depth?: number;
  seldepth?: number;
  multipv?: number;
  score?: ParsedScore;
  pv?: string;
  tbhits?: number;
};

const INTEGER = /^-?\d+$/;

const INTEGER_FIELDS = {
  depth: 'depth',
  seldepth: 'seldepth',
  multipv: 'multipv',
  tbhits: 'tbhits'
} as const;

function isIntegerField(token: string): token is keyof typeof INTEGER_FIELDS {
  return Object.prototype.hasOwnProperty.call(INTEGER_FIELDS, token);
}

export function parseInfoLine(line: string): ParsedInfo | null {
  const tokens = line.trim().split(/\s+/);
  if (tokens[0] !== 'info') return null;

  const info: ParsedInfo = {};
  let recognized = false;

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === 'pv') {
      const pv = tokens.slice(i + 1).join(' ');
      if (!pv) return null;
      info.pv = pv;
      recognized = true;
      break;
    }

    if (token === 'score') {
      const type = tokens[i + 1];
      const rawValue = tokens[i + 2];
      if ((type !== 'cp' && type !== 'mate') || rawValue === undefined || !INTEGER.test(rawValue)) {
        return null;
      }

      const score: ParsedScore = { type, value: Number(rawValue) };
      const bound = tokens[i + 3];
      if (bound === 'lowerbound' || bound === 'upperbound') {
        score.bound = bound;
        i += 1;
      }
      info.score = score;
      recognized = true;
      i += 2;
      continue;
    }

    if (isIntegerField(token)) {
      const rawValue = tokens[i + 1];
      if (rawValue === undefined || !INTEGER.test(rawValue)) return null;
      info[token] = Number(rawValue);
      recognized = true;
      i += 1;
    }
  }

  return recognized ? info : null;
}

type PendingRequest = {
  fen: string;
  depth: number;
  resolve: (value: RawEval) => void;
  reject: (reason?: unknown) => void;
  result: RawEval;
  timer: ReturnType<typeof setTimeout> | null;
  signal?: AbortSignal;
  onAbort?: () => void;
  settled: boolean;
};

function abortError(): Error {
  const error = new Error('Evaluation aborted');
  error.name = 'AbortError';
  return error;
}

export class EngineClient {
  private readonly worker: Worker;
  private readonly queue: PendingRequest[] = [];
  private current: PendingRequest | null = null;
  private terminated = false;

  constructor(worker: Worker) {
    this.worker = worker;
    this.worker.onmessage = this.handleMessage;
    this.worker.onerror = this.handleError;
  }

  get isTerminated(): boolean {
    return this.terminated;
  }

  evaluate(fen: string, depth: number, signal?: AbortSignal): Promise<RawEval> {
    if (this.terminated) {
      return Promise.reject(new Error('Engine client terminated'));
    }

    return new Promise<RawEval>((resolve, reject) => {
      if (signal?.aborted) {
        reject(abortError());
        return;
      }

      const request: PendingRequest = {
        fen,
        depth,
        resolve,
        reject,
        result: {} as RawEval,
        timer: null,
        signal,
        settled: false
      };

      if (signal) {
        request.onAbort = () => this.abort(request);
        signal.addEventListener('abort', request.onAbort, { once: true });
      }

      this.queue.push(request);
      this.startNext();
    });
  }

  terminate(): void {
    this.fail(new Error('Engine client terminated'));
  }

  private startNext = (): void => {
    if (this.terminated || this.current || this.queue.length === 0) return;

    const request = this.queue.shift()!;
    this.current = request;
    request.timer = setTimeout(() => this.onTimeout(), ENGINE_TIMEOUT_MS);

    try {
      this.worker.postMessage(`position fen ${request.fen}`);
      this.worker.postMessage(`go depth ${request.depth}`);
    } catch (error) {
      this.fail(error instanceof Error ? error : new Error(String(error)));
    }
  };

  private handleMessage = ({ data }: MessageEvent<string>): void => {
    const message = typeof data === 'string' ? data : String(data);
    log(`page got message: ${message}`);

    if (this.terminated) return;

    if (message.startsWith('bestmove')) {
      this.onBestMove();
      return;
    }

    const info = parseInfoLine(message);
    if (!info || !this.current) return;

    this.applyInfo(this.current, info, message);
  };

  private handleError = (event: ErrorEvent): void => {
    log(`page got error: ${event.message}`);
    this.fail(new Error(event.message || 'Engine worker error'));
  };

  private applyInfo(request: PendingRequest, info: ParsedInfo, data: string): void {
    if (!info.score) return;

    if (info.multipv === 2) {
      request.result.altLine = {
        type: info.score.type,
        score: info.score.value,
        pv: info.pv ?? '',
        bound: info.score.bound
      };
      return;
    }

    if (info.multipv !== undefined && info.multipv !== 1) return;

    request.result = {
      ...request.result,
      type: info.score.type,
      score: info.score.value,
      pv: info.pv ?? request.result.pv ?? '',
      bound: info.score.bound,
      data
    };
  }

  private onBestMove(): void {
    const request = this.current;
    if (!request) return;

    this.current = null;
    this.settle(request, () => request.resolve(request.result));
    this.startNext();
  }

  private onTimeout(): void {
    this.fail(new Error(`Engine timed out after ${ENGINE_TIMEOUT_MS} ms`));
  }

  private abort(request: PendingRequest): void {
    if (this.terminated || request.settled) return;

    if (this.current === request) {
      this.worker.postMessage('stop');
      this.settle(request, () => request.reject(abortError()));
      request.timer = setTimeout(() => this.onTimeout(), ENGINE_TIMEOUT_MS);
      return;
    }

    const index = this.queue.indexOf(request);
    if (index !== -1) this.queue.splice(index, 1);
    this.settle(request, () => request.reject(abortError()));
  }

  private fail(error: Error): void {
    if (this.terminated) return;
    this.terminated = true;

    const active = this.current;
    this.current = null;
    if (active) {
      this.settle(active, () => active.reject(error));
    }

    for (const request of this.queue.splice(0)) {
      this.settle(request, () => request.reject(error));
    }

    this.worker.terminate();
  }

  private settle(request: PendingRequest, action: () => void): void {
    if (request.timer !== null) {
      clearTimeout(request.timer);
      request.timer = null;
    }

    if (request.signal && request.onAbort) {
      request.signal.removeEventListener('abort', request.onAbort);
    }

    if (request.settled) return;
    request.settled = true;
    action();
  }
}

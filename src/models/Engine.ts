export type ScoreBound = 'lowerbound' | 'upperbound';

export type RawEval = {
  score: number;
  type: 'cp' | 'mate';
  pv: string;
  bound?: ScoreBound;
  data?: string;
  altLine?: AltEval;
};

export type AltEval = {
  score: number;
  type: 'cp' | 'mate';
  pv: string;
  bound?: ScoreBound;
};

export type RawEval = {
  score: number;
  type: 'cp' | 'mate';
  pv: string;
  data?: string;
  altLines: AltEval[];
};

export type AltEval = {
  score: number;
  type: 'cp' | 'mate';
  pv: string;
};

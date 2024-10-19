export type RawEval = {
  score: number;
  type: "cp" | "mate";
  pv: string;
  wdl: Wdl;
  data?: string;
  altLines: AltEval[];
}

export type Wdl = {
  w: number;
  d: number;
  l: number;
}

export type AltEval = {
  score: number;
  type: "cp" | "mate";
  pv: string;
}

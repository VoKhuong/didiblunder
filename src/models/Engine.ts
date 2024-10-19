export type RawEval = {
  score: number;
  type: "cp" | "mate";
  pv: string;
  wdl: Wdl;
  data?: string;
  altLines: {
    score: number;
    type: "cp" | "mate";
    pv: string;
  }[];
}

export type Wdl = {
  w: number;
  d: number;
  l: number;
}

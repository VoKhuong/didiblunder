import type { RawEval } from './Engine';
import Label from './Label';

export type Evaluation = RawEval & {
  label: Label;
  opening?: string;
};

export const EVAL_CHECKMATE_WHITE: Evaluation = {
  score: Infinity,
  type: 'mate',
  pv: '',
  label: Label.CHECKMATE
};

export const EVAL_CHECKMATE_BLACK: Evaluation = {
  score: -Infinity,
  type: 'mate',
  pv: '',
  label: Label.CHECKMATE
};

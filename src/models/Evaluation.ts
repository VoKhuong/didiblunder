import type { RawEval } from './Engine';
import type Label from './Label';

export type Evaluation = RawEval & {
  label: Label;
};

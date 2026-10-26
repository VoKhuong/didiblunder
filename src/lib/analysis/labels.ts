import Label from '$models/Label';

export type LabelInput = {
  label?: Label;
  best?: string;
  winChanceLost: number;
  moveLan: string;
  isForced: boolean;
  isSacrifice: boolean;
  mayBeGreat: boolean;
  previousLabel?: Label;
  opponentBadPlay: boolean;
  opening?: string;
};

export type LabelResult = {
  label: Label;
  opening?: string;
  best?: string;
};

export function resolveLabel(input: LabelInput): LabelResult {
  const {
    label,
    best,
    winChanceLost,
    moveLan,
    isForced,
    isSacrifice,
    mayBeGreat,
    previousLabel,
    opponentBadPlay,
    opening
  } = input;

  if ((previousLabel === undefined || previousLabel === Label.BOOK) && opening) {
    return { label: Label.BOOK, opening };
  }

  let resolved = label;

  if (moveLan === best) {
    resolved = Label.BEST;
  }

  if (resolved === undefined) {
    if (winChanceLost <= 2) {
      resolved = Label.EXCELLENT;
    } else if (winChanceLost <= 5) {
      resolved = Label.GOOD;
    } else if (winChanceLost <= 10) {
      resolved = Label.INACCURACY;
    } else if (winChanceLost <= 20) {
      resolved = Label.MISTAKE;
    } else {
      resolved = Label.BLUNDER;
    }
  }

  if (resolved === Label.BEST) {
    if (isForced) {
      resolved = Label.FORCED;
    } else if (isSacrifice) {
      resolved = Label.BRILLIANT;
    } else if (mayBeGreat) {
      resolved = Label.GREAT;
    }
  }

  const previousWasBad =
    opponentBadPlay || previousLabel === Label.BLUNDER || previousLabel === Label.MISTAKE;

  if (previousWasBad && winChanceLost >= 5) {
    resolved = Label.MISSED;
  }

  return { label: resolved, best };
}

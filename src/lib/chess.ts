import MoveType from '$models/MoveType';

export function getMoveType(san: string): MoveType {
  if (san.endsWith('#')) {
    return MoveType.CHECKMATE;
  } else if (san.endsWith('+')) {
    return MoveType.CHECK;
  } else if (san.includes('=')) {
    return MoveType.PROMOTION;
  } else if (san.includes('x')) {
    return MoveType.CAPTURE;
  } else if (san === 'O-O' || san === 'O-O-O') {
    return MoveType.CASTLE;
  }
  return MoveType.MOVE;
}

import MoveType from '$models/MoveType';

const audioMap = new Map();

export function preloadAudio(id: string, src: string) {
  const audio = new Audio(src);
  audio.preload = 'auto';
  audioMap.set(id, audio);
}

function playMedia(id: string) {
  const audio = audioMap.get(id);
  audio.currentTime=0;
  audio.play();
}

export function playMoveTypeSound(mt: MoveType) {
  switch (mt) {
    case MoveType.CHECKMATE:
      playMedia('sfx-checkmate');
      break;
    case MoveType.CHECK:
      playMedia('sfx-check');
      break;
    case MoveType.PROMOTION:
      playMedia('sfx-promotion');
      break;
    case MoveType.CAPTURE:
      playMedia('sfx-capture');
      break;
    default:
      playMedia('sfx-move');
      break;
  }
}

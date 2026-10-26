import MoveType from '$models/MoveType';
import { AUDIO_IDS, type AudioId } from '$lib/constants';

const audioMap = new Map<AudioId, HTMLAudioElement>();

export function preloadAudio(id: AudioId, src: string) {
  const audio = new Audio(src);
  audio.preload = 'auto';
  audioMap.set(id, audio);
}

function playMedia(id: AudioId) {
  const audio = audioMap.get(id)!;
  audio.currentTime = 0;
  audio.play();
}

export function playMoveTypeSound(mt: MoveType) {
  switch (mt) {
    case MoveType.CHECKMATE:
      playMedia(AUDIO_IDS.CHECKMATE);
      break;
    case MoveType.CHECK:
      playMedia(AUDIO_IDS.CHECK);
      break;
    case MoveType.PROMOTION:
      playMedia(AUDIO_IDS.PROMOTION);
      break;
    case MoveType.CAPTURE:
      playMedia(AUDIO_IDS.CAPTURE);
      break;
    default:
      playMedia(AUDIO_IDS.MOVE);
      break;
  }
}

export type TabName = 'load' | 'report' | 'settings';

export const TABS: ReadonlyArray<{ value: TabName; label: string }> = [
  { value: 'load', label: '💾 Load' },
  { value: 'report', label: '📊 Report' },
  { value: 'settings', label: '🛠️ Settings' }
];

export const AUDIO_IDS = {
  MOVE: 'sfx-move',
  CAPTURE: 'sfx-capture',
  CHECK: 'sfx-check',
  PROMOTION: 'sfx-promotion',
  CHECKMATE: 'sfx-checkmate'
} as const;

export type AudioId = (typeof AUDIO_IDS)[keyof typeof AUDIO_IDS];

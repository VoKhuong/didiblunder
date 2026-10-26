import type { EngineId } from '$lib/engines';

export type Settings = {
  orientation: 'w' | 'b';
  depth: number;
  engine: EngineId;
  theme: 'light' | 'dark';
};

import { describe, expect, it } from 'vitest';

import { ENGINES, type EngineId } from '$lib/engines';

const ENGINE_IDS: EngineId[] = ['lite-single', 'lite-multi', 'large-single', 'large-multi'];

describe('ENGINES', () => {
  it('covers every engine id', () => {
    expect(Object.keys(ENGINES).sort()).toEqual([...ENGINE_IDS].sort());
  });

  it('has unique labels', () => {
    const labels = Object.values(ENGINES).map((engine) => engine.label);

    expect(new Set(labels).size).toBe(labels.length);
  });

  it('only exposes the lite engines as selectable', () => {
    const selectable = Object.entries(ENGINES)
      .filter(([, engine]) => engine.selectable)
      .map(([id]) => id)
      .sort();

    expect(selectable).toEqual(['lite-multi', 'lite-single']);
  });
});

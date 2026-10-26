import { describe, expect, it } from 'vitest';

import { getLabelClassColor, getLabelHexColor, LABEL_CONFIG, shouldShowBest } from '$lib/label';
import Label from '$models/Label';

const expectedConfig = {
  [Label.BRILLIANT]: { className: 'text-teal-400', hex: '#2dd4bf', showBest: false },
  [Label.GREAT]: { className: 'text-sky-500', hex: '#0ea5e9', showBest: false },
  [Label.BEST]: { className: 'text-emerald-500', hex: '#10b981', showBest: false },
  [Label.EXCELLENT]: { className: 'text-lime-500', hex: '#84cc16', showBest: true },
  [Label.GOOD]: { className: 'text-success-700', hex: '#639911', showBest: true },
  [Label.BOOK]: { className: 'text-stone-500', hex: '#78716c', showBest: false },
  [Label.INACCURACY]: { className: 'text-warning-400', hex: '#f0ca52', showBest: true },
  [Label.MISTAKE]: { className: 'text-orange-400', hex: '#fb923c', showBest: true },
  [Label.MISSED]: { className: 'text-error-500', hex: '#d41976', showBest: true },
  [Label.BLUNDER]: { className: 'text-red-600', hex: '#dc2626', showBest: true },
  [Label.FORCED]: { className: 'text-neutral-500', hex: '#737373', showBest: false },
  [Label.CHECKMATE]: { className: 'text-white', hex: '#000000', showBest: false },
  [Label.UNDEFINED]: { className: '', hex: 'none', showBest: true }
} satisfies Record<Label, { className: string; hex: string; showBest: boolean }>;

describe('LABEL_CONFIG', () => {
  it('covers every Label enum member', () => {
    for (const label of Object.values(Label)) {
      expect(LABEL_CONFIG[label]).toBeDefined();
    }
  });

  it('preserves the exact presentation values', () => {
    expect(LABEL_CONFIG).toEqual(expectedConfig);
  });
});

describe('label presentation functions', () => {
  it('match the config map', () => {
    for (const label of Object.values(Label)) {
      expect(getLabelClassColor(label)).toBe(LABEL_CONFIG[label].className);
      expect(getLabelHexColor(label)).toBe(LABEL_CONFIG[label].hex);
      expect(shouldShowBest(label)).toBe(LABEL_CONFIG[label].showBest);
    }
  });

  it('falls back to defaults for unknown labels', () => {
    const unknown = 'Unknown' as Label;
    expect(getLabelClassColor(unknown)).toBe('');
    expect(getLabelHexColor(unknown)).toBe('none');
    expect(shouldShowBest(unknown)).toBe(true);
  });
});

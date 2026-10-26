import Label from '$models/Label';

interface LabelPresentation {
  className: string;
  hex: string;
  showBest: boolean;
}

const DEFAULT_LABEL_CONFIG: LabelPresentation = {
  className: '',
  hex: 'none',
  showBest: true
};

export const LABEL_CONFIG: Record<Label, LabelPresentation> = {
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
  [Label.UNDEFINED]: DEFAULT_LABEL_CONFIG
};

function getLabelConfig(label: Label): LabelPresentation {
  return LABEL_CONFIG[label] ?? DEFAULT_LABEL_CONFIG;
}

export function getLabelClassColor(label: Label): string {
  return getLabelConfig(label).className;
}

export function getLabelHexColor(label: Label): string {
  return getLabelConfig(label).hex;
}

export function shouldShowBest(label: Label): boolean {
  return getLabelConfig(label).showBest;
}

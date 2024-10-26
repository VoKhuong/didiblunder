import Label from '$models/Label';

export function getLabelClassColor(label: Label): string {
  switch (label) {
    case Label.BRILLIANT:
      return 'text-teal-400';
    case Label.GREAT:
      return 'text-sky-500';
    case Label.BEST:
      return 'text-emerald-500';
    case Label.EXCELLENT:
      return 'text-lime-500';
    case Label.GOOD:
      return 'text-success-700';
    case Label.BOOK:
      return 'text-stone-500';
    case Label.INACCURACY:
      return 'text-warning-400';
    case Label.MISTAKE:
      return 'text-orange-400';
    case Label.MISSED:
      return 'text-error-500';
    case Label.BLUNDER:
      return 'text-red-600';
    case Label.FORCED:
      return 'text-neutral-500';
    case Label.CHECKMATE:
      return 'text-white';
    default:
      return '';
  }
}

export function getLabelHexColor(label: Label): string {
  switch (label) {
    case Label.BRILLIANT:
      return '#2dd4bf';
    case Label.GREAT:
      return '#0ea5e9';
    case Label.BEST:
      return '#10b981';
    case Label.EXCELLENT:
      return '#84cc16';
    case Label.GOOD:
      return '#639911';
    case Label.BOOK:
      return '#78716c';
    case Label.INACCURACY:
      return '#f0ca52';
    case Label.MISTAKE:
      return '#fb923c';
    case Label.MISSED:
      return '#d41976';
    case Label.BLUNDER:
      return '#dc2626';
    case Label.FORCED:
      return '#737373';
    case Label.CHECKMATE:
      return '#000000';
    default:
      return 'none';
  }
}

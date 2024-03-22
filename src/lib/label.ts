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
    default:
      return '';
  }
}

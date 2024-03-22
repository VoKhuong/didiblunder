import Evaluation from '$models/Evaluation';

export function getEvaluationClassColor(evaluation: Evaluation): string {
  switch (evaluation) {
    case Evaluation.BRILLIANT:
      return 'text-teal-400';
    case Evaluation.GREAT:
      return 'text-sky-500';
    case Evaluation.BEST:
      return 'text-emerald-500';
    case Evaluation.EXCELLENT:
      return 'text-lime-500';
    case Evaluation.GOOD:
      return 'text-success-700';
    case Evaluation.BOOK:
      return 'text-stone-500';
    case Evaluation.INACCURACY:
      return 'text-warning-400';
    case Evaluation.MISTAKE:
      return 'text-orange-400';
    case Evaluation.MISSED:
      return 'text-error-500';
    case Evaluation.BLUNDER:
      return 'text-red-600';
    case Evaluation.FORCED:
      return 'text-neutral-500';
    default:
      return '';
  }
}

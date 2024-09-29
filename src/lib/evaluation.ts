import type { Evaluation } from "$models/Evaluation";

export function formatScore(evaluation: Evaluation) {
    console.log('format => ', evaluation);
    if (evaluation.type === "mate") {
        return `M${Math.abs(evaluation.score)}`;
    } else {
        return (evaluation.score / 100).toLocaleString(undefined, {
            signDisplay: 'always',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })
    }
}

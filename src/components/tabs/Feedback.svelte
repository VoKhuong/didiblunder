<script lang="ts">
  import { getEvaluationClassColor } from '$lib/evaluation';
  import Evaluation from '$models/Evaluation';
  import EvaluationIcon from '../EvaluationIcon.svelte';

  export let san: string;
  export let evaluation: Evaluation;
  export let score: string;
</script>

<div class="flex justify-center items-center {getEvaluationClassColor(evaluation)}">
  <EvaluationIcon {evaluation} class="w-8 h-8" />
  <strong class="h3 font-semibold ml-2 mr-8">{san}</strong>
  <span class="chip variant-filled cursor-default">{score}</span>
</div>
<p class="mt-4 text-center text-lg bg-red-400 card variant-ghost p-2">{evaluation}</p>

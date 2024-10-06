<script lang="ts">
  import { toEvaluationHeight } from '$lib/evaluation';
  import type { Evaluation } from '$models/Evaluation';

  export let evaluation: Evaluation;

  let barHeight = 0.5;

  $: barHeight = toEvaluationHeight(evaluation);
</script>

<div class="relative w-6 bg-black">
  <div
    style:height="{barHeight * 100}%"
    class="absolute duration-200 bg-white left-0 right-0 bottom-0 h-1/2"
  ></div>
</div>

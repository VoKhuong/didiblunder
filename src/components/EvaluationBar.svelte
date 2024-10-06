<script lang="ts">
  import type { Evaluation } from '$models/Evaluation';

  export let evaluation: Evaluation;

  // score is in centipawns
  const MIN: number = -1000;
  const MAX: number = 1000;

  let barHeight = 0.5;

  function mapToPercentage(value: number) {
    const rootValue = Math.sign(value) * Math.pow(Math.abs(value), 0.6);
    const rootLimit = Math.pow(Math.abs(MAX), 0.6);
    return Math.min(0.95, Math.max(0.05, (rootValue + rootLimit) / (2 * rootLimit)));
  }

  $: {
    barHeight =
      evaluation.type === 'cp'
        ? mapToPercentage(evaluation.score)
        : Math.sign(evaluation.score) > 0
          ? 1
          : 0;
    console.log(barHeight);
  }
</script>

<div class="relative w-6 bg-black">
  <div
    style:height="{barHeight * 100}%"
    class="absolute duration-200 bg-white left-0 right-0 bottom-0 h-1/2"
  ></div>
</div>

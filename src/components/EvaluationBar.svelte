<script lang="ts">
  import type { Evaluation } from '$models/Evaluation';

  export let evaluation: Evaluation;

  // score is in centipawns
  const MIN: number = -1000;
  const MAX: number = 1000;

  let score = 0;

  function mapToPercentage(value: number) {
    const rootValue = Math.sign(value) * Math.pow(Math.abs(value), 0.6);
    const rootLimit = Math.pow(Math.abs(MAX), 0.6);
    return (rootValue + rootLimit) / (2 * rootLimit);
  }

  $: {
    score = evaluation.type === 'cp' ? evaluation.score : Math.sign(evaluation.score) * MAX;
    console.log('score ', score);
    console.log('mapToLogScale ', mapToPercentage(score));
  }
</script>

<div class="relative w-6 bg-black">
  <div
    style:height="{mapToPercentage(score) * 100}%"
    class="absolute duration-200 bg-white left-0 right-0 bottom-0 h-1/2"
  ></div>
</div>

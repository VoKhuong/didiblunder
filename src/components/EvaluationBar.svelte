<script lang="ts">
  export let score: number = 5;

  const MIN: number = -10;
  const MAX: number = 10;

  const toPercentage = (score: number): number => ((score - MIN) / (MAX - MIN)) * 100;
</script>

<div class="relative w-6 bg-black">
  <div
    style:height="{toPercentage(score)}%"
    class="absolute duration-200 bg-white left-0 right-0 bottom-0 h-1/2"
  ></div>
</div>

<script lang="ts">
  import { Progress } from '@skeletonlabs/skeleton-svelte';

  let {
    onClick,
    isLoading = false,
    progress = 0
  }: {
    onClick: (event: MouseEvent) => void;
    isLoading?: boolean;
    progress?: number;
  } = $props();
</script>

<button
  type="button"
  class="btn btn-lg preset-filled w-full"
  onclick={onClick}
  disabled={isLoading}
>
  {#if isLoading}
    <Progress value={progress} class="w-fit">
      <Progress.Circle class="[--size:--spacing(7)]">
        <Progress.CircleTrack />
        <Progress.CircleRange />
      </Progress.Circle>
    </Progress>
    <span class="w-8 text-right">{progress}%</span>
  {:else}
    🚀 Analyze
  {/if}
</button>

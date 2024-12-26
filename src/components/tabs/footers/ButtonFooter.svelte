<script lang="ts">
  import { ProgressRadial } from '@skeletonlabs/skeleton';

  export let onClick: (event: MouseEvent) => void = () => console.log('onClick event fired');
  export let isLoading: boolean = false;
  export let progress: number = 0;
</script>

<button
  type="button"
  class="btn btn-lg variant-filled w-full"
  on:click={onClick}
  disabled={isLoading}
>
  {#if isLoading}
    <ProgressRadial
      width="w-7"
      stroke={75}
      meter="stroke-primary-500"
      track="stroke-primary-300"
      value={progress}
    />
    <span class="w-8 text-right text-primary-700">{progress}%</span>
  {:else}
    🚀 Analyze
  {/if}
</button>

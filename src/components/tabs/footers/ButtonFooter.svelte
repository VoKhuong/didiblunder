<script lang="ts">
  import { ProgressRadial } from '@skeletonlabs/skeleton';

  interface Props {
    onClick?: (event: MouseEvent) => void;
    isLoading?: boolean;
    progress?: number;
  }

  let { onClick = () => console.log('onClick event fired'), isLoading = false, progress = 0 }: Props = $props();
</script>

<button
  type="button"
  class="btn btn-lg variant-filled w-full"
  onclick={onClick}
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

<script lang="ts">
  import { ProgressRadial } from "@skeletonlabs/skeleton";

  export let onClick: (event: MouseEvent) => void = () => console.log('onClick event fired');
  export let isLoading: boolean = false;
</script>

<button type="button" class="btn btn-lg variant-filled w-full" on:click={onClick} disabled={isLoading} >
  {#if isLoading}
    <ProgressRadial width="w-7" />
  {:else}
    🚀 Analyze
  {/if}
</button>

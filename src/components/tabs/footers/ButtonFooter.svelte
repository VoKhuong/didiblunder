<script lang="ts">
  export let onClick: (event: MouseEvent) => void = () => console.log('onClick event fired');
</script>

<button type="button" class="btn btn-lg variant-filled w-full" on:click={onClick}>
  🚀 Analyze
</button>

<script lang="ts">
  import Label from '$models/Label';
  import LabelPath from './LabelPath.svelte';

  let { label, class: className = 'w-6 h-6' }: { label: Label; class?: string } = $props();
</script>

<svg
  class={className}
  aria-hidden="true"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  fill="currentColor"
  viewBox="0 0 24 24"
>
  <LabelPath {label} />
</svg>

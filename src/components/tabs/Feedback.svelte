<script lang="ts">
  import { getLabelClassColor } from '$lib/label';
  import Label from '$models/Label';
  import LabelIcon from '../LabelIcon.svelte';

  export let san: string;
  export let label: Label;
  export let score: string;
  export let opening: string | undefined;
</script>

<div class="flex justify-center items-center {getLabelClassColor(label)}">
  <LabelIcon {label} class="w-8 h-8" />
  <strong class="h3 font-semibold ml-2 mr-8">{san}</strong>
  <span class="chip variant-filled cursor-default">{score}</span>
</div>
<p class="mt-4 text-center text-lg bg-red-400 card variant-ghost p-2">{opening ?? label}</p>

<script lang="ts">
  import { getLabelClassColor, shouldShowBest } from '$lib/label';
  import Label from '$models/Label';
  import LabelIcon from '../LabelIcon.svelte';

  let {
    san,
    label,
    score,
    opening,
    best
  }: {
    san: string;
    label: Label;
    score: string;
    opening: string | undefined;
    best: string | undefined;
  } = $props();
</script>

<div class="flex justify-center items-center {getLabelClassColor(label)}">
  <LabelIcon {label} class="w-8 h-8 shrink-0" />
  <strong class="h3 font-semibold ml-2 mr-8 w-20 leading-8 text-center">{san}</strong>
  <span class="chip preset-filled cursor-default w-16 shrink-0">{score}</span>
</div>
<div
  class="mt-4 text-center card preset-tonal p-2 h-24 flex flex-col justify-center overflow-hidden"
>
  <p class="text-lg font-semibold line-clamp-2">{opening ?? label}</p>
  <p class="text-sm font-semibold text-primary-400 line-clamp-1">
    {best && shouldShowBest(label) ? `best was ${best}` : '...'}
  </p>
</div>

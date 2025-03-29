<script lang="ts">
  import { getLabelClassColor, shouldShowBest } from '$lib/label';
  import Label from '$models/Label';
  import LabelIcon from '../LabelIcon.svelte';

  interface Props {
    san: string;
    label: Label;
    score: string;
    opening: string | undefined;
    best: string | undefined;
  }

  let {
    san,
    label,
    score,
    opening,
    best
  }: Props = $props();
</script>

<div class="flex justify-center items-center {getLabelClassColor(label)}">
  <LabelIcon {label} class="w-8 h-8" />
  <strong class="h3 font-semibold ml-2 mr-8">{san}</strong>
  <span class="chip variant-filled cursor-default">{score}</span>
</div>
<div class="mt-4 text-center card variant-ghost p-2">
  <p class="text-lg">{opening ?? label}</p>
  <p class="text-sm text-primary-400">{best && shouldShowBest(label) ? `best was ${best}` : "..."}</p>
</div>

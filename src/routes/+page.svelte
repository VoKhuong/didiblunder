<script lang="ts">
  import { setContext } from 'svelte';
  import { Chess, DEFAULT_POSITION } from 'chess.js';

  import { RangeSlider } from '@skeletonlabs/skeleton';
  import Chessboard from '../components/Chessboard.svelte';
  import EvaluationBar from '../components/EvaluationBar.svelte';
  import Panel from '../components/Panel.svelte';
  import { writable } from 'svelte/store';

  setContext('engine', new Chess());
  const position = writable(DEFAULT_POSITION);
  setContext('position', position);

  let value = 0;
</script>

<div class="flex flex-wrap justify-center my-6 gap-6">
  <div class="size-4/5 md:size-1/2 flex gap-x-4">
    <EvaluationBar score={value} />
    <div class="grow">
      <Chessboard />
    </div>
  </div>
  <div class="w-4/5 md:w-1/4">
    <Panel />
  </div>
</div>

<RangeSlider name="range-slider" bind:value min={-10} max={10} step={1} />
<p>{$position}</p>

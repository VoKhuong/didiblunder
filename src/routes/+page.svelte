<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { Chess, DEFAULT_POSITION, type Move } from 'chess.js';

  import Chessboard from '../components/Chessboard.svelte';
  import EvaluationBar from '../components/EvaluationBar.svelte';
  import Panel from '../components/Panel.svelte';
  import { readonly, writable, type Writable } from 'svelte/store';
  import type { Evaluation } from '$models/Evaluation';
  import Label from '$models/Label';
  import { init, analyze_move } from '$lib/engine';

  onMount(() => {
    engine.set(init());
  });
  setContext('chess', new Chess());
  const history: Writable<Move[]> = writable([]);
  setContext('history', history);
  const position = writable(DEFAULT_POSITION);
  setContext('position', position);
  const move = writable(-1);
  setContext('move', move);
  const evaluation: Writable<Evaluation> = writable({ label: Label.UNDEFINED, score: 0, type: "cp", pv: "" });
  setContext('evaluation', evaluation);
  const engine: Writable<Worker> = writable();
  const exposedEngine = readonly(engine);
  setContext('engine', exposedEngine);

  $: evaluation.set({
    label: Object.values(Label)[$move % Object.keys(Label).length],
    score: Math.random() * 10,
    type: "cp",
    pv: ""
  });

  let command = '';
</script>

<div class="flex flex-wrap justify-center my-6 gap-6">
  <div class="size-4/5 md:size-3/5 lg:size-2/5 flex gap-x-4">
    <EvaluationBar score={$evaluation.score} />
    <div class="grow">
      <Chessboard />
    </div>
  </div>
  <div class="w-4/5 md:w-1/4">
    <Panel />
  </div>
</div>
<p>{$position}</p>
<input class="input" type="text" bind:value={command} />
<button class="btn" type="button" on:click={() => $exposedEngine?.postMessage(command)}>RUN COMMAND</button>

<button class="btn" type="button" on:click={() => $exposedEngine ? analyze_move($exposedEngine, $position, 15) : null}>GO</button>

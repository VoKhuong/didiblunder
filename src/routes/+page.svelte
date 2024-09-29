<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { Chess, DEFAULT_POSITION, type Move } from 'chess.js';

  import Chessboard from '../components/Chessboard.svelte';
  import EvaluationBar from '../components/EvaluationBar.svelte';
  import Panel from '../components/Panel.svelte';
  import { derived, readonly, writable, type Writable } from 'svelte/store';
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
  const evaluations: Writable<Evaluation[]> = writable([]);
  setContext('evaluations', evaluations);
  const engine: Writable<Worker> = writable();
  const exposedEngine = readonly(engine);
  setContext('engine', exposedEngine);
  const evaluation = derived([evaluations, move], ([$evaluations, $move]) => {
    if ($move >= 0 && $evaluations.length > $move) return $evaluations[$move];
    else return {
      score: 0,
      type: "cp",
      pv: "",
      label: Label.UNDEFINED
    };
  });
  setContext('evaluation', evaluation);

  let command = '';
</script>

<div class="flex flex-wrap justify-center my-6 gap-6">
  <div class="size-4/5 md:size-3/5 lg:size-2/5 flex gap-x-4">
    <EvaluationBar score={$evaluation.score / 100} />
    <div class="grow">
      <Chessboard />
    </div>
  </div>
  <div class="w-4/5 md:w-1/4">
    <Panel />
  </div>
</div>
<p>{$evaluation.type} {$evaluation.score} {$evaluation.pv}</p>
<p>{$position}</p>
<input class="input" type="text" bind:value={command} />
<button class="btn" type="button" on:click={() => $exposedEngine?.postMessage(command)}>RUN COMMAND</button>

<button class="btn" type="button" on:click={() => $exposedEngine ? analyze_move($exposedEngine, $position, 15) : null}>GO</button>

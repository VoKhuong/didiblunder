<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { Chess, DEFAULT_POSITION, type Move } from 'chess.js';

  import Chessboard from '../components/Chessboard.svelte';
  import EvaluationBar from '../components/EvaluationBar.svelte';
  import Panel from '../components/Panel.svelte';
  import { derived, readonly, writable, type Writable } from 'svelte/store';
  import type { Evaluation } from '$models/Evaluation';
  import Label from '$models/Label';
  import { init } from '$lib/engine';
  import type { Settings } from '$models/Settings';

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
    else
      return {
        score: 0,
        type: 'cp',
        pv: '',
        label: Label.UNDEFINED
      } as Evaluation;
  });
  setContext('evaluation', evaluation);
  const settings: Writable<Settings> = writable({
    orientation: 'w',
    depth: 10
  });
  setContext('settings', settings)
</script>

<div class="flex flex-wrap justify-center my-6 md:my-16 gap-6">
  <div class="size-4/5 md:size-3/5 lg:size-5/12 flex gap-x-4">
    <EvaluationBar evaluation={$evaluation} />
    <div class="grow">
      <Chessboard />
    </div>
  </div>
  <div class="w-4/5 md:w-1/4">
    <Panel />
  </div>
</div>
<p>type: {$evaluation.type}</p>
<p>score: {$evaluation.score}</p>
{#each $evaluation?.altLines || [] as alt}
  <p>alt: {alt.type} {alt.score} {alt.pv}</p>
{/each}
<p>{$evaluation.pv}</p>
<p>{$evaluation.data}</p>
<p>{$position}</p>

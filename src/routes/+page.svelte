<script lang="ts">
  import { setContext } from 'svelte';
  import { Chess, DEFAULT_POSITION } from 'chess.js';

  import Chessboard from '../components/Chessboard.svelte';
  import EvaluationBar from '../components/EvaluationBar.svelte';
  import Panel from '../components/Panel.svelte';
  import { writable, type Writable } from 'svelte/store';
  import type { Evaluation } from '$models/Evaluation';
  import Label from '$models/Label';

  setContext('chess', new Chess());
  const history = writable([]);
  setContext('history', history);
  const position = writable(DEFAULT_POSITION);
  setContext('position', position);
  const move = writable(-1);
  setContext('move', move);
  const evaluation: Writable<Evaluation> = writable({ label: Label.UNDEFINED, score: 0 });
  setContext('evaluation', evaluation);

  $: evaluation.set({
    label: Object.values(Label)[$move % Object.keys(Label).length],
    score: Math.random() * 10
  });
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

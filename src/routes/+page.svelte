<script lang="ts">
  import { setContext, untrack } from 'svelte';
  import { browser, dev } from '$app/environment';

  import Chessboard from '../components/Chessboard.svelte';
  import EvaluationBar from '../components/EvaluationBar.svelte';
  import Panel from '../components/Panel.svelte';
  import { Game } from '$lib/game.svelte';

  const game = new Game();
  setContext('game', game);

  $effect(() => {
    const engine = game.settings.engine;
    if (browser) {
      untrack(() => game.initEngine(engine));
    }
  });
</script>

<div class="flex flex-wrap justify-center my-6 md:my-16 gap-6">
  <div class="size-4/5 md:size-3/5 lg:size-5/12 flex gap-x-4">
    <EvaluationBar evaluation={game.evaluation} />
    <div class="grow">
      <Chessboard />
    </div>
  </div>
  <div class="w-4/5 md:w-1/4">
    <Panel />
  </div>
</div>
{#if dev}
  <p>type: {game.evaluation.type}</p>
  <p>score: {game.evaluation.score}</p>
  {#if game.evaluation.altLine}
    <p>
      alt: {game.evaluation.altLine.type}
      {game.evaluation.altLine.score}
      {game.evaluation.altLine.pv}
    </p>
  {/if}
  <p>{game.evaluation.pv}</p>
  <p>{game.evaluation.data}</p>
  <p>{game.position}</p>
{/if}

<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { browser, dev } from '$app/environment';

  import Chessboard from '../components/Chessboard.svelte';
  import EvaluationBar from '../components/EvaluationBar.svelte';
  import Panel from '../components/Panel.svelte';
  import { Game } from '$lib/game.svelte';
  import { setGame } from '$lib/game-context';

  const game = new Game();
  setGame(game);

  let themeInitialized = $state(false);

  onMount(() => {
    game.settings.theme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    themeInitialized = true;
  });

  $effect(() => {
    const engine = game.settings.engine;
    if (browser) {
      untrack(() => game.initEngine(engine));
    }
  });

  $effect(() => {
    if (browser && themeInitialized) {
      document.documentElement.classList.toggle('dark', game.settings.theme === 'dark');
    }
  });
</script>

<div class="flex flex-wrap justify-center my-6 md:my-16 gap-6">
  <div class="size-[90%] md:size-3/5 lg:size-5/12 flex gap-x-4">
    <EvaluationBar evaluation={game.evaluation} />
    <div class="grow">
      <Chessboard />
    </div>
  </div>
  <div class="w-[90%] md:w-1/4">
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

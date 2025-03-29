<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { isDraw, userWon } from '$lib/api';
  import { getRelativeTimeFromNowString } from '$lib/date';

  const modalStore = getModalStore();

  const games = $modalStore[0].meta.games.reverse();
  const username = $modalStore[0].meta.username;
  const setDisabled = $modalStore[0].meta.setDisabledSearchUsername;
  const onGameSelected = $modalStore[0].meta.onGameSelected;
  const analyze = $modalStore[0].meta.analyze;

  const onClose = () => {
    setDisabled(false);
    parent.onClose();
  };

  const onClick = (game: any) => {
    const orientation = game.white.username === username ? 'w' : 'b';
    onGameSelected(game, orientation);
    setDisabled(false);
    analyze();
    parent.onClose();
  };

  const onKeyDown = (e: KeyboardEvent, game: any) => {
    if (e.key === 'Enter') {
      onClick(game);
    }
  };

  interface Props {
    parent: SvelteComponent;
  }

  let { parent }: Props = $props();
</script>

<div class="card mt-8 mb-4 p-4 w-modal relative shadow-xl space-y-4">
  <header class="text-2xl font-bold">Recent games</header>
  <main class="space-y-2">
    {#each games as game, index}
      <div
        onclick={() => onClick(game)}
        onkeydown={(e) => onKeyDown(e, game)}
        role="link"
        class="card p-4 hover:font-bold hover:cursor-pointer {isDraw(game)
          ? 'variant-ghost-warning'
          : userWon(username, game)
            ? 'variant-ghost-primary'
            : 'variant-ghost-error'}"
        tabindex={index}
      >
        <p>
          <span class={game.white.username === username ? 'font-bold' : ''}>
            ⚪ <span class="italic">({game.white.rating})</span>
            {game.white.username}
          </span>
          vs
          <span class={game.black.username === username ? 'font-bold' : ''}>
            {game.black.username} <span class="italic">({game.black.rating})</span> ⚫
          </span>
        </p>
        <p class="text-sm italic">
          {getRelativeTimeFromNowString(new Date(game.end_time * 1000))}
        </p>
      </div>
    {/each}
  </main>
  <footer class="flex justify-center">
    <button
      class="btn-icon variant-filled md:absolute md:-top-5 md:-right-5 font-bold shadow-xl"
      onclick={onClose}>✕</button
    >
  </footer>
</div>

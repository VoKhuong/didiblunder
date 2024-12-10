<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { userWon } from '$lib/api';
  import { getRelativeTimeFromNowString } from '$lib/date';

  const modalStore = getModalStore();

  const games = $modalStore[0].meta.games.reverse();
  const username = $modalStore[0].meta.username;

  export let parent: SvelteComponent;
</script>

<div class="card mt-8 mb-4 p-4 w-modal relative shadow-xl space-y-4">
  <header class="text-2xl font-bold">Recent games</header>
  <main class="space-y-2">
    {#each games as game}
      <div
        class="card p-4 hover:font-bold {userWon(username, game) ? 'variant-ghost-primary' : 'variant-ghost-error'}"
      >
        <p>
          <span class={game.white.username === username ? 'font-bold' : ''}>
            ⚪ {game.white.username}
          </span>
          vs
          <span class={game.black.username === username ? 'font-bold' : ''}>
            {game.black.username} ⚫
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
      on:click={parent.onClose}>✕</button
    >
  </footer>
</div>

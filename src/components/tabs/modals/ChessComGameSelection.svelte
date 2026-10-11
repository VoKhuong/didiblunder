<script lang="ts">
  import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
  import { isDraw, userWon, type ChessComGame } from '$lib/api';
  import { getRelativeTimeFromNowString } from '$lib/date';

  let {
    games,
    username,
    onGameSelected,
    analyze,
    onClose
  }: {
    games: ChessComGame[];
    username: string;
    onGameSelected: (game: ChessComGame, orientation: 'w' | 'b') => void;
    analyze: () => void;
    onClose: () => void;
  } = $props();

  const sortedGames = $derived([...games].reverse());

  const onClick = (game: ChessComGame) => {
    const orientation = game.white.username === username ? 'w' : 'b';
    onGameSelected(game, orientation);
    analyze();
    onClose();
  };

  const onKeyDown = (e: KeyboardEvent, game: ChessComGame) => {
    if (e.key === 'Enter') {
      onClick(game);
    }
  };
</script>

<Dialog defaultOpen onOpenChange={(details) => !details.open && onClose()}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center p-4">
      <Dialog.Content
        class="card bg-surface-100-900 mt-8 mb-4 p-4 w-full max-w-xl relative shadow-xl space-y-4"
      >
        <header class="text-2xl font-bold">Recent games</header>
        <main class="space-y-2">
          {#each sortedGames as game, index (index)}
            <div
              onclick={() => onClick(game)}
              onkeydown={(e) => onKeyDown(e, game)}
              role="link"
              class="card p-4 hover:font-bold hover:cursor-pointer {isDraw(game)
                ? 'preset-tonal-warning'
                : userWon(username, game)
                  ? 'preset-tonal-primary'
                  : 'preset-tonal-error'}"
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
          <Dialog.CloseTrigger
            class="btn-icon preset-filled md:absolute md:-top-5 md:-right-5 font-bold shadow-xl"
          >
            ✕
          </Dialog.CloseTrigger>
        </footer>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

<script lang="ts">
  import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';

  import { isDraw, isUsername, userWon, type ChessComGame } from '$lib/api';
  import { getRelativeTimeFromNowString } from '$lib/date';

  let {
    games,
    username,
    onGameSelected,
    analyze,
    isAnalyzing = false,
    onClose
  }: {
    games: ChessComGame[];
    username: string;
    onGameSelected: (game: ChessComGame, orientation: 'w' | 'b') => void;
    analyze: () => void;
    isAnalyzing?: boolean;
    onClose: () => void;
  } = $props();

  const sortedGames = $derived([...games].reverse());

  const onClick = (game: ChessComGame) => {
    if (isAnalyzing) return;

    const orientation = isUsername(username, game.white.username) ? 'w' : 'b';
    onGameSelected(game, orientation);
    analyze();
    onClose();
  };
</script>

<Dialog defaultOpen onOpenChange={(details) => !details.open && onClose()}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center p-4">
      <Dialog.Content
        class="card preset-filled-surface-100-900 p-4 w-full max-w-xl shadow-xl flex flex-col max-h-[85vh] gap-4"
      >
        <header class="flex justify-between items-center">
          <Dialog.Title class="text-2xl font-bold">Recent games</Dialog.Title>
          <Dialog.CloseTrigger class="btn-icon hover:preset-tonal" aria-label="Close">
            ✕
          </Dialog.CloseTrigger>
        </header>
        <main class="space-y-2 grow overflow-y-auto min-h-0">
          {#each sortedGames as game}
            <button
              type="button"
              onclick={() => onClick(game)}
              disabled={isAnalyzing}
              class="card p-4 w-full text-left {isDraw(game)
                ? 'bg-warning-500/35 text-warning-950-50'
                : userWon(username, game)
                  ? 'bg-secondary-500/35 text-secondary-950-50'
                  : 'bg-error-500/35 text-error-950-50'}"
            >
              <p>
                <span class={isUsername(username, game.white.username) ? 'font-bold' : ''}>
                  ⚪ <span class="italic">({game.white.rating})</span>
                  {game.white.username}
                </span>
                vs
                <span class={isUsername(username, game.black.username) ? 'font-bold' : ''}>
                  {game.black.username} <span class="italic">({game.black.rating})</span> ⚫
                </span>
              </p>
              <p class="text-sm italic">
                {getRelativeTimeFromNowString(new Date(game.end_time * 1000))}
              </p>
            </button>
          {/each}
        </main>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

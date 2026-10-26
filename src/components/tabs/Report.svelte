<script lang="ts">
  import Feedback from './Feedback.svelte';
  import { formatScore } from '$lib/evaluation';
  import { toTableRows } from '$lib/table';
  import { getGame } from '$lib/game-context';

  const game = getGame();

  const rows = $derived(toTableRows(game.history));
  const san = $derived(game.history[game.move]?.san);
  const score = $derived(formatScore(game.evaluation));

  const selectMove = (index: number) => game.goTo(index);
</script>

<div class="h-28 md:h-32 lg:h-56 mb-2 overflow-y-auto">
  <div class="table-wrap">
    <table class="table">
      <tbody class="[&>tr]:hover:preset-tonal-primary">
        {#each rows as row, r (r)}
          <tr>
            <td class="opacity-60">{row[0]}</td>
            <td class="cursor-pointer">
              <button
                type="button"
                class="w-full text-left"
                onclick={() => selectMove(r * 2)}
                aria-current={game.move === r * 2 ? 'true' : undefined}
              >
                {row[1]}
              </button>
            </td>
            {#if row[2]}
              <td class="cursor-pointer">
                <button
                  type="button"
                  class="w-full text-left"
                  onclick={() => selectMove(r * 2 + 1)}
                  aria-current={game.move === r * 2 + 1 ? 'true' : undefined}
                >
                  {row[2]}
                </button>
              </td>
            {:else}
              <td>&nbsp;</td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
<Feedback
  {san}
  {score}
  label={game.evaluation.label}
  opening={game.evaluation.opening}
  best={game.evaluation.best}
/>

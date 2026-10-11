<script lang="ts">
  import { toTableRows } from '$lib/table';
  import type { Move } from 'chess.js';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import Feedback from './Feedback.svelte';
  import type { Evaluation } from '$models/Evaluation';
  import { formatScore } from '$lib/evaluation';

  const history: Writable<Move[]> = getContext('history');
  const move: Writable<number> = getContext('move');
  const position: Writable<string> = getContext('position');
  const evaluation: Writable<Evaluation> = getContext('evaluation');

  const rows = $derived(toTableRows($history));
  const san = $derived($history[$move]?.san);
  const score = $derived(formatScore($evaluation));

  const selectMove = (index: number) => {
    if (index < 0 || index >= $history.length) return;
    move.set(index);
    position.set($history[index].after);
  };
</script>

<div class="h-28 md:h-32 lg:h-56 mb-2 overflow-y-auto">
  <div class="table-wrap">
    <table class="table">
      <tbody class="[&>tr]:hover:preset-tonal-primary">
        {#each rows as row, r (r)}
          <tr>
            <td class="opacity-60">{row[0]}</td>
            <td
              class="cursor-pointer"
              role="button"
              tabindex="0"
              onclick={() => selectMove(r * 2)}
              onkeydown={(e) => e.key === 'Enter' && selectMove(r * 2)}
            >
              {row[1]}
            </td>
            {#if row[2]}
              <td
                class="cursor-pointer"
                role="button"
                tabindex="0"
                onclick={() => selectMove(r * 2 + 1)}
                onkeydown={(e) => e.key === 'Enter' && selectMove(r * 2 + 1)}
              >
                {row[2]}
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
  label={$evaluation.label}
  opening={$evaluation.opening}
  best={$evaluation.best}
/>

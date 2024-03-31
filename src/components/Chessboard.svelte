<script lang="ts">
  // @ts-expect-error
  import { Chessboard } from 'cm-chessboard/src/Chessboard';
  import { DEFAULT_POSITION, type Move } from 'chess.js';

  import { getContext, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { Evaluation } from '$models/Evaluation';
  import { EvaluationMarkerExtension } from '$lib/extension';

  let boardElement: HTMLDivElement;

  let board: Chessboard;

  const position: Writable<string> = getContext('position');
  const evaluation: Writable<Evaluation> = getContext('evaluation');
  const move: Writable<number> = getContext('move');
  const history: Writable<Move[]> = getContext('history');

  onMount(async () => {
    board = new Chessboard(boardElement, {
      position: DEFAULT_POSITION,
      assetsUrl: '/',
      animationDuration: 50,
      style: {
        pieces: {
          file: 'standard.svg'
        }
      },
      extensions: [
        {
          class: EvaluationMarkerExtension
        }
      ]
    });
  });

  $: board?.setPosition($position, true);
  $: {
    if ($history.length > 0 && $move >= 0) {
      board?.setMarkers([
        {
          square: $history[$move].from,
          showIcon: false,
          label: $evaluation.label
        },
        {
          square: $history[$move].to,
          showIcon: true,
          label: $evaluation.label
        }
      ]);
    } else {
      board?.setMarkers([]);
    }
  }
</script>

<div class="w-full" bind:this={boardElement}></div>

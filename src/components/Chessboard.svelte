<script lang="ts">
  // @ts-expect-error: no declaration file as it was written in JS
  import { Chessboard } from 'cm-chessboard/src/Chessboard';
  import { DEFAULT_POSITION, type Move } from 'chess.js';

  import { getContext, onMount } from 'svelte';
  import { derived, type Writable } from 'svelte/store';
  import type { Evaluation } from '$models/Evaluation';
  import { EvaluationMarkerExtension } from '$lib/extension';
  import type { Settings } from '$models/Settings';
  import { playMoveTypeSound } from '$lib/media';
  import { getMoveType } from '$lib/chess';

  let boardElement: HTMLDivElement;

  let board: Chessboard;

  const position: Writable<string> = getContext('position');
  const evaluation: Writable<Evaluation> = getContext('evaluation');
  const move: Writable<number> = getContext('move');
  const history: Writable<Move[]> = getContext('history');
  const settings: Writable<Settings> = getContext('settings');
  const orientation = derived(settings, ($settings) => $settings.orientation);

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

  orientation.subscribe((value) => {
    board?.setOrientation(value);
    // TODO: quick fix
    board?.setMarkers([]);
  });
  $: board?.setPosition($position, true);
  $: {
    if ($history.length > 0 && $move >= 0) {
      playMoveTypeSound(getMoveType($history[$move].san));
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

<script lang="ts">
  // @ts-expect-error: no declaration file as it was written in JS
  import { Chessboard } from 'cm-chessboard/src/Chessboard';
  import { DEFAULT_POSITION } from 'chess.js';

  import { getContext, onMount } from 'svelte';
  import { EvaluationMarkerExtension } from '$lib/extension';
  import type { Game } from '$lib/game.svelte';
  import { playMoveTypeSound } from '$lib/media';
  import { getMoveType } from '$lib/chess';

  const game = getContext<Game>('game');

  let boardElement: HTMLDivElement | undefined = $state();
  let board: Chessboard | undefined = $state.raw();

  onMount(() => {
    board = new Chessboard(boardElement!, {
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

  $effect(() => {
    board?.setOrientation(game.settings.orientation);
    // TODO: quick fix
    board?.setMarkers([]);
  });

  $effect(() => {
    board?.setPosition(game.position, true);
  });

  $effect(() => {
    if (game.history.length > 0 && game.move >= 0) {
      playMoveTypeSound(getMoveType(game.history[game.move].san));
      board?.setMarkers([
        {
          square: game.history[game.move].from,
          showIcon: false,
          label: game.evaluation.label
        },
        {
          square: game.history[game.move].to,
          showIcon: true,
          label: game.evaluation.label
        }
      ]);
    } else {
      board?.setMarkers([]);
    }
  });
</script>

<div class="w-full" bind:this={boardElement}></div>

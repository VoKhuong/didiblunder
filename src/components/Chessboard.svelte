<script lang="ts">
  // @ts-expect-error
  import { Chessboard } from 'cm-chessboard/src/Chessboard';
  import { DEFAULT_POSITION } from 'chess.js';

  import { getContext, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { Evaluation } from '$models/Evaluation';
  import { EvaluationMarkerExtension } from '$lib/extension';

  let boardElement: HTMLDivElement;

  let board: Chessboard;

  const position: Writable<string> = getContext('position');
  const evaluation: Writable<Evaluation> = getContext('evaluation');

  onMount(async () => {
    board = new Chessboard(boardElement, {
      position: DEFAULT_POSITION,
      assetsUrl: '../../node_modules/cm-chessboard/assets/',
      animationDuration: 50,
      extensions: [{
        class: EvaluationMarkerExtension
      }]
    });
  });

  position.subscribe((x) => board?.setPosition(x, true));
</script>

<div class="w-full" bind:this={boardElement}></div>

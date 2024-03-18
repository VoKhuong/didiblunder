<script lang="ts">
  // @ts-ignore
  import { Chessboard } from 'cm-chessboard/src/Chessboard';
  import { DEFAULT_POSITION } from 'chess.js';

  import { getContext, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';

  let boardElement: HTMLDivElement;
  let board: Chessboard;

  const position: Writable<string> = getContext('position');

  onMount(async () => {
    board = new Chessboard(boardElement, {
      position: DEFAULT_POSITION,
      assetsUrl: '../../node_modules/cm-chessboard/assets/',
      animationDuration: 50
    });
  });

  position.subscribe((x) => board?.setPosition(x, true));
</script>

<div class="w-full" bind:this={boardElement}></div>

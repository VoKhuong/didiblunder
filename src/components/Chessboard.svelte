<script lang="ts">
  // @ts-ignore
  import {Chessboard, FEN} from "cm-chessboard/src/Chessboard";

  import { onMount } from 'svelte';

  let boardElement: HTMLDivElement;

  onMount(async () => {
    const board = new Chessboard(boardElement, {
    position: FEN.start,
    assetsUrl: "../../node_modules/cm-chessboard/assets/"
  })
  });
</script>

<div class="w-96" bind:this={boardElement}></div>

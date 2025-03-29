<script lang="ts">
  import type { Move } from 'chess.js';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';

  const move: Writable<number> = getContext('move');
  const position: Writable<string> = getContext('position');

  const history: Writable<Move[]> = getContext('history');
  const nbMoves = $history.length;

  const clickBackward = () => {
    position.set($history[0].before);
    move.set(-1);
  };

  const clickPrevious = () => {
    position.set($history[$move].before);
    move.set($move - 1);
  };

  const clickNext = () => {
    move.set($move + 1);
    position.set($history[$move].after);
  };

  const clickForward = () => {
    move.set(nbMoves - 1);
    position.set($history[$move].after);
  };
</script>

<div class="flex gap-2">
  <button
    type="button"
    class="btn-icon btn-icon-lg variant-filled rounded-md grow"
    onclick={clickBackward}
    disabled={$move < 0}
  >
    <svg
      class="w-6 h-6"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        fill-rule="evenodd"
        d="M7 6a1 1 0 0 1 2 0v4l6.4-4.8A1 1 0 0 1 17 6v12a1 1 0 0 1-1.6.8L9 14v4a1 1 0 1 1-2 0V6Z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
  <button
    type="button"
    class="btn-icon btn-icon-lg variant-filled rounded-md grow"
    onclick={clickPrevious}
    disabled={$move < 0}
  >
    <svg
      class="w-6 h-6"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m15 19-7-7 7-7"
      />
    </svg>
  </button>
  <button
    type="button"
    class="btn-icon btn-icon-lg variant-filled rounded-md grow"
    onclick={clickNext}
    disabled={$move >= nbMoves - 1}
  >
    <svg
      class="w-6 h-6"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m9 5 7 7-7 7"
      />
    </svg>
  </button>
  <button
    type="button"
    class="btn-icon btn-icon-lg variant-filled rounded-md grow"
    onclick={clickForward}
    disabled={$move >= nbMoves - 1}
  >
    <svg
      class="w-6 h-6"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        fill-rule="evenodd"
        d="M17 6a1 1 0 1 0-2 0v4L8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8L15 14v4a1 1 0 1 0 2 0V6Z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</div>

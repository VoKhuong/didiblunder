<script lang="ts">
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { Chess } from 'chess.js';
  import { FileButton } from '@skeletonlabs/skeleton';
  import { type Move } from 'chess.js';

  export function load(): void {
    if (loader === 'pgn') {
      engine.loadPgn(strPgn);
      history.set(engine.history({verbose: true}));
      move.set(0);
      position.set($history[0].before);
    }
  }

  const engine: Chess = getContext('engine');
  const position: Writable<string> = getContext('position');
  const move: Writable<number> = getContext('move');
  const history: Writable<Move[]> = getContext('history');

  let loader: string = 'pgn';

  // PGN fields
  let strPgn: string;
  let disabled: boolean = false;
  let filename: string = '';
  let filesPgn: FileList;

  $: {
    if (filesPgn && filesPgn.length > 0) {
      filesPgn
        .item(0)
        ?.text()
        .then((txt) => {
          strPgn = txt;
          filename = filesPgn.item(0)?.name ?? '';
          disabled = true;
        });
    }
  }

  $: console.log(loader);
</script>

<div class="flex items-center">
  <p>Load game from&nbsp</p>
  <select bind:value={loader} class="select w-fit">
    <option value="pgn">PGN</option>
    <option value="chesscom">chess.com</option>
    <option value="lichess">lichess.org</option>
  </select>
</div>

<div class="my-8">
  {#if loader === 'pgn'}
    <textarea
      bind:value={strPgn}
      class="textarea"
      rows="4"
      placeholder="1. e4 Nc6 2. Bc4 Nf6 3. Nc3 e6 4. Nf3 d5 5. e5 Nd7..."
      {disabled}
    />
    <hr class="my-4" />
    <div class="flex items-center gap-2">
      <FileButton
        bind:files={filesPgn}
        accept=".pgn, .txt"
        name="pgnfile"
        button="btn variant-ghost"
      >
        Import PGN file
      </FileButton>
      <p class="truncate">{filename}</p>
    </div>
  {:else if loader === 'chesscom'}
    chess.com
  {:else if loader === 'lichess'}
    lichess.org
  {/if}
</div>

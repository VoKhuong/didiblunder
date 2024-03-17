<script lang="ts">
  import { FileButton } from '@skeletonlabs/skeleton';

  let loader: string = 'pgn';

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
      class="textarea"
      rows="4"
      placeholder="1. e4 Nc6 2. Bc4 Nf6 3. Nc3 e6 4. Nf3 d5 5. e5 Nd7..."
    />
    <hr class="my-4" />
    <FileButton name="pgnfile" button="btn variant-ghost">Import PGN file</FileButton>
  {:else if loader === 'chesscom'}
    chess.com
  {:else if loader === 'lichess'}
    lichess.org
  {/if}
</div>
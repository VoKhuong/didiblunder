<script lang="ts">
  import { FileButton } from '@skeletonlabs/skeleton';

  export let onChange: (pgn: string) => void = (pgn) => console.log('pgn => ', pgn);

  let loader: string = 'pgn';
  let strPgn: string = '';

  // PGN fields
  let disabled: boolean = false;
  let filename: string = '';
  let filesPgn: FileList;

  // chess.com fields
  let username = '';

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

  $: onChange(strPgn);
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
  <label class="label">
    <span>Username</span>
    <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
      <input type="text" class="pl-4" placeholder="magnuscarlsen" />
      <button class="py-2 variant-filled">🔎</button>
    </div>
  </label>
  {:else if loader === 'lichess'}
    lichess.org
  {/if}
</div>

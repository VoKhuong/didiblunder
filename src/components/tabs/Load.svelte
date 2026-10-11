<script lang="ts">
  import { loadRecentGames, type ChessComGame } from '$lib/api';
  import type { Settings } from '$models/Settings';
  import { FileUpload } from '@skeletonlabs/skeleton-svelte';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import ChessComGameSelection from './modals/ChessComGameSelection.svelte';

  let {
    onChange = (pgn: string) => console.log('pgn => ', pgn),
    analyze,
    isLoading
  }: {
    onChange?: (pgn: string) => void;
    analyze: () => void;
    isLoading: boolean;
  } = $props();

  const settings: Writable<Settings> = getContext('settings');

  let loader: string = $state('chesscom');
  let strPgn: string = $state('');

  // PGN fields
  let disabledImportPgn: boolean = $state(false);
  let filename: string = $state('');

  // chess.com fields
  let disabledSearchUsername = $state(false);
  let username = $state('');
  let gameSelection: { games: ChessComGame[]; username: string } | null = $state(null);

  const onClick = async () => {
    // trim trailing spaces
    username = username.trim();
    // validate username
    const regex = /^[A-Za-z0-9_]{3,}$/;
    if (regex.test(username)) {
      disabledSearchUsername = true;
      const games = await loadRecentGames(username);

      if (games?.length) {
        gameSelection = { games, username };
      } else {
        alert('No game found or username is invalid.');
        disabledSearchUsername = false;
      }
    } else {
      alert('Username is invalid.');
    }
  };

  const onKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      await onClick();
    }
  };

  const onGameSelected = (game: ChessComGame, orientation: 'w' | 'b') => {
    strPgn = game.pgn;
    onChange(strPgn);
    settings.update((s) => ({ ...s, orientation }));
  };

  const closeGameSelection = () => {
    gameSelection = null;
    disabledSearchUsername = false;
  };

  const onFileAccept = (details: { files: File[] }) => {
    const file = details.files[0];
    if (!file) return;
    disabledImportPgn = true;
    filename = file.name;
    file.text().then((txt) => {
      strPgn = txt;
    });
  };

  $effect(() => {
    onChange(strPgn);
  });
</script>

<div class="flex items-center">
  <label for="loader">Load game from&nbsp</label>
  <select name="loader" bind:value={loader} class="select w-fit">
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
      disabled={disabledImportPgn || isLoading}
    ></textarea>
    <hr class="my-4" />
    <div class="flex items-center gap-2">
      <FileUpload
        class="w-fit"
        name="pgnfile"
        accept={{ 'text/plain': ['.pgn', '.txt'] }}
        disabled={isLoading}
        {onFileAccept}
      >
        <FileUpload.Trigger class="btn preset-tonal">Import PGN file</FileUpload.Trigger>
        <FileUpload.HiddenInput />
      </FileUpload>
      <p class="truncate">{filename}</p>
    </div>
  {:else if loader === 'chesscom'}
    <label class="label">
      <span class="label-text">Username</span>
      <div class="field-group grid-cols-[1fr_auto]">
        <input
          bind:value={username}
          type="text"
          class="input"
          placeholder="magnuscarlsen"
          onkeydown={onKeyDown}
        />
        <button
          class="btn preset-filled"
          onclick={onClick}
          disabled={disabledSearchUsername || isLoading}
        >
          {disabledSearchUsername ? '🚥' : '🔎'}
        </button>
      </div>
    </label>
  {:else if loader === 'lichess'}
    <h3 class="h3 text-center">🚧 Sorry, WIP 🚧</h3>
  {/if}
</div>

{#if gameSelection}
  <ChessComGameSelection
    games={gameSelection.games}
    username={gameSelection.username}
    {onGameSelected}
    {analyze}
    onClose={closeGameSelection}
  />
{/if}

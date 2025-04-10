<script lang="ts">
  import { loadRecentGames } from '$lib/api';
  import type { Settings } from '$models/Settings';
  import { FileButton, type ModalSettings } from '@skeletonlabs/skeleton';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';

  export let onChange: (pgn: string) => void = (pgn) => console.log('pgn => ', pgn);
  export let analyze: () => void;
  export let isLoading;

  const settings: Writable<Settings> = getContext('settings');

  const modalStore = getModalStore();
  let loader: string = 'chesscom';
  let strPgn: string = '';

  // PGN fields
  let disabledImportPgn: boolean = false;
  let filename: string = '';
  let filesPgn: FileList;

  // chess.com fields
  let disabledSearchUsername = false;
  let username = '';

  const onClick = async () => {
    // trim trailing spaces
    username = username.trim();
    // validate username
    const regex = /^[A-Za-z0-9_]{3,}$/;
    if (regex.test(username)) {
      disabledSearchUsername = true;
      const games = await loadRecentGames(username);

      if (games?.length) {
        const modal: ModalSettings = {
          type: 'component',
          component: 'chessComGameSelection',
          meta: { games, username, onGameSelected, setDisabledSearchUsername, analyze }
        };
        modalStore.trigger(modal);
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

  const onGameSelected = (game: any, orientation: 'w' | 'b') => {
    strPgn = game.pgn;
    onChange(strPgn);
    $settings.orientation = orientation;
  };

  const setDisabledSearchUsername = (disabled: boolean) => (disabledSearchUsername = disabled);

  $: {
    if (filesPgn && filesPgn.length > 0) {
      filesPgn
        .item(0)
        ?.text()
        .then((txt) => {
          disabledImportPgn = true;
          strPgn = txt;
          filename = filesPgn.item(0)?.name ?? '';
        });
    }
  }

  $: onChange(strPgn);
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
      class="textarea p-2"
      rows="4"
      placeholder="1. e4 Nc6 2. Bc4 Nf6 3. Nc3 e6 4. Nf3 d5 5. e5 Nd7..."
      disabled={disabledImportPgn || isLoading}
    />
    <hr class="my-4" />
    <div class="flex items-center gap-2">
      <FileButton
        bind:files={filesPgn}
        accept=".pgn, .txt"
        name="pgnfile"
        button="btn variant-ghost"
        disabled={isLoading}
      >
        Import PGN file
      </FileButton>
      <p class="truncate">{filename}</p>
    </div>
  {:else if loader === 'chesscom'}
    <label class="label">
      <span>Username</span>
      <div class="input-group input-group-divider flex">
        <input
          bind:value={username}
          type="text"
          class="pl-4 grow"
          placeholder="magnuscarlsen"
          on:keydown={onKeyDown}
        />
        <button
          class="py-2 variant-filled"
          on:click={onClick}
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

<script lang="ts">
  import { FileUpload } from '@skeletonlabs/skeleton-svelte';
  import { getContext } from 'svelte';

  import ChessComGameSelection from './modals/ChessComGameSelection.svelte';
  import {
    CHESSCOM_PAGE_SIZE,
    ChessComApiError,
    chessComGameKey,
    fetchGamesPage,
    type ChessComCursor,
    type ChessComGame
  } from '$lib/api';
  import type { Game } from '$lib/game.svelte';

  let {
    onChange = (pgn: string) => console.log('pgn => ', pgn),
    analyze,
    isLoading
  }: {
    onChange?: (pgn: string) => void;
    analyze: () => void;
    isLoading: boolean;
  } = $props();

  const game = getContext<Game>('game');

  let loader: string = $state('chesscom');
  let strPgn: string = $state('');

  // PGN fields
  let disabledImportPgn: boolean = $state(false);
  let filename: string = $state('');

  // chess.com fields
  let disabledSearchUsername = $state(false);
  let username = $state('');
  let gameSelection: {
    username: string;
    games: ChessComGame[];
    nextCursor: ChessComCursor | null;
    isLoadingMore: boolean;
    loadError: string | null;
  } | null = $state(null);

  const describeLoadError = (error: unknown) => {
    if (error instanceof ChessComApiError && error.status === 429) {
      return 'chess.com is rate limiting requests. Please wait a moment and try again.';
    }
    return 'Could not load games from chess.com. Please try again.';
  };

  const onClick = async () => {
    if (disabledSearchUsername) return;
    // trim trailing spaces
    username = username.trim();
    // validate username
    const regex = /^[A-Za-z0-9_]{3,}$/;
    if (!regex.test(username)) {
      alert('Username is invalid.');
      return;
    }

    disabledSearchUsername = true;
    try {
      const page = await fetchGamesPage(username, null, CHESSCOM_PAGE_SIZE);

      if (page.games.length) {
        gameSelection = {
          username,
          games: page.games,
          nextCursor: page.nextCursor,
          isLoadingMore: false,
          loadError: null
        };
      } else {
        alert('No games found in the last 12 months for this username.');
        disabledSearchUsername = false;
      }
    } catch (error) {
      alert(describeLoadError(error));
      disabledSearchUsername = false;
    }
  };

  const onKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      await onClick();
    }
  };

  const onGameSelected = (selected: ChessComGame, orientation: 'w' | 'b') => {
    strPgn = selected.pgn;
    onChange(strPgn);
    game.settings.orientation = orientation;
  };

  const loadMore = async () => {
    const selection = gameSelection;
    if (!selection || selection.isLoadingMore || !selection.nextCursor) return;

    // The button reads "Try again" while an error is shown; clicking it retries.
    selection.loadError = null;
    selection.isLoadingMore = true;

    try {
      const page = await fetchGamesPage(
        selection.username,
        selection.nextCursor,
        CHESSCOM_PAGE_SIZE
      );
      if (gameSelection !== selection) return;

      const seen = new Set(selection.games.map(chessComGameKey));
      const games = [...selection.games];
      for (const game of page.games) {
        const key = chessComGameKey(game);
        if (seen.has(key)) continue;
        seen.add(key);
        games.push(game);
      }

      gameSelection = {
        ...selection,
        games,
        nextCursor: page.nextCursor,
        isLoadingMore: false,
        loadError: null
      };
    } catch (error) {
      if (gameSelection !== selection) return;
      gameSelection = {
        ...selection,
        isLoadingMore: false,
        loadError: describeLoadError(error)
      };
    }
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
    hasMore={gameSelection.nextCursor !== null}
    isLoadingMore={gameSelection.isLoadingMore}
    loadError={gameSelection.loadError}
    onLoadMore={loadMore}
    {onGameSelected}
    {analyze}
    onClose={closeGameSelection}
  />
{/if}

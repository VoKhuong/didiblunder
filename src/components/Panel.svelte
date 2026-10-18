<script lang="ts">
  import { Tabs } from '@skeletonlabs/skeleton-svelte';
  import { getContext } from 'svelte';

  import Load from './tabs/Load.svelte';
  import ButtonFooter from './tabs/footers/ButtonFooter.svelte';
  import NavigationFooter from './tabs/footers/NavigationFooter.svelte';
  import Report from './tabs/Report.svelte';
  import Settings from './tabs/Settings.svelte';
  import { analyze_game } from '$lib/engine';
  import type { Game } from '$lib/game.svelte';
  import { log } from '$lib/log';

  const game = getContext<Game>('game');

  let currentTab: string = $state('load');
  let strPgn: string = $state('');
  let isLoading: boolean = $state(false);
  let progress = $state(0);

  const setProgress = (n: number) => (progress = n);
  const onChangeStrPgn = (newPgn: string) => (strPgn = newPgn);

  const isAbortError = (error: unknown) =>
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';

  const analyze = async () => {
    const run = game.beginAnalysis();
    if (!run) return;

    const { signal, generation } = run;
    isLoading = true;

    // add a line break after last comment for chess.com mobile PGN export
    strPgn = strPgn.replace(/](?![\s\S]*\])(?!\n\n)/, ']\n');

    log(strPgn);
    try {
      const engine = game.engine;
      if (!engine) throw new Error('Engine is not ready');

      game.chess.loadPgn(strPgn);
      game.history = game.chess.history({ verbose: true });
      game.move = -1;
      game.position = game.history[0].before;
      const report = await analyze_game(
        engine,
        game.history,
        game.chess,
        game.settings.depth,
        setProgress,
        signal
      );

      if (signal.aborted || !game.isCurrentAnalysis(generation)) return;

      log(report);
      game.evaluations = report;
      currentTab = 'report';
    } catch (e) {
      if (!signal.aborted && !isAbortError(e)) {
        alert('An error occured, please try again.');
        log(e);
      }
    } finally {
      game.endAnalysis(generation);
      if (game.isCurrentAnalysis(generation)) {
        isLoading = false;
        progress = 0;
      }
    }
  };
</script>

<div
  class="card preset-filled-surface-100-900 max-md:bg-transparent! p-0 md:p-4 h-full flex flex-col"
>
  <section class="mb-4 grow">
    <Tabs value={currentTab} onValueChange={(details) => (currentTab = details.value ?? 'load')}>
      <Tabs.List class="justify-center">
        <Tabs.Trigger value="load">💾 Load</Tabs.Trigger>
        <Tabs.Trigger value="report">📊 Report</Tabs.Trigger>
        <Tabs.Trigger value="settings">🛠️ Settings</Tabs.Trigger>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Content value="load">
        <Load onChange={onChangeStrPgn} {analyze} {isLoading} />
      </Tabs.Content>
      <Tabs.Content value="report">
        <Report />
      </Tabs.Content>
      <Tabs.Content value="settings">
        <Settings />
      </Tabs.Content>
    </Tabs>
  </section>
  <footer class="pt-4">
    {#if currentTab === 'load' || currentTab === 'settings'}
      <ButtonFooter onClick={analyze} {isLoading} {progress} />
    {:else if currentTab === 'report'}
      <NavigationFooter />
    {/if}
  </footer>
</div>

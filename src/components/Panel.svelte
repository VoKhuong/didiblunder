<script lang="ts">
  import { Tabs } from '@skeletonlabs/skeleton-svelte';
  import Load from './tabs/Load.svelte';
  import ButtonFooter from './tabs/footers/ButtonFooter.svelte';
  import NavigationFooter from './tabs/footers/NavigationFooter.svelte';
  import Report from './tabs/Report.svelte';
  import Settings from './tabs/Settings.svelte';
  import { getContext } from 'svelte';
  import type { Chess, Move } from 'chess.js';
  import type { Readable, Writable } from 'svelte/store';
  import { analyze_game } from '$lib/engine';
  import type { Evaluation } from '$models/Evaluation';
  import type { Settings as SettingsType } from '$models/Settings';
  import { log } from '$lib/log';

  let currentTab: string = $state('load');

  // Load
  let strPgn: string = $state('');
  let isLoading: boolean = $state(false);
  let progress = $state(0);

  const setProgress = (n: number) => {
    progress = n;
  };

  const onChangeStrPgn = (newPgn: string) => {
    strPgn = newPgn;
  };

  const analyze = async () => {
    isLoading = true;

    // add a line break after last comment for chess.com mobile PGN export
    strPgn = strPgn.replace(/](?![\s\S]*\])(?!\n\n)/, ']\n');

    log(strPgn);
    try {
      chess.loadPgn(strPgn);
      history.set(chess.history({ verbose: true }));
      move.set(-1);
      position.set($history[0].before);
      const report = await analyze_game($engine, $history, chess, $settings.depth, setProgress);
      log(report);
      evaluations.set(report);
      currentTab = 'report';
    } catch (e) {
      alert('An error occured, please try again.');
      throw e;
    } finally {
      isLoading = false;
      progress = 0;
    }
  };

  const chess: Chess = getContext('chess');
  const position: Writable<string> = getContext('position');
  const move: Writable<number> = getContext('move');
  const history: Writable<Move[]> = getContext('history');
  const engine: Readable<Worker> = getContext('engine');
  const evaluations: Writable<Evaluation[]> = getContext('evaluations');
  const settings: Writable<SettingsType> = getContext('settings');
</script>

<div class="card bg-surface-100-900 p-4 h-full flex flex-col">
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

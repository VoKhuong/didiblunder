<script lang="ts">
  import { TabGroup, Tab } from '@skeletonlabs/skeleton';
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
  import type { Settings as SettingsType } from "$models/Settings";

  let currentTab: string = 'load';

  // Load
  let strPgn: string = '';
  let isLoading: boolean = false;

  const onChangeStrPgn = (newPgn: string) => {
    strPgn = newPgn;
  };

  const analyze = async () => {
    isLoading = true;
    console.log(strPgn);
    chess.loadPgn(strPgn);
    history.set(chess.history({ verbose: true }));
    move.set(-1);
    position.set($history[0].before);
    const report = await analyze_game($engine, $history, chess, $settings.depth);
    console.log(report);
    evaluations.set(report);
    currentTab = 'report';
    isLoading = false;
  };

  const chess: Chess = getContext('chess');
  const position: Writable<string> = getContext('position');
  const move: Writable<number> = getContext('move');
  const history: Writable<Move[]> = getContext('history');
  const engine: Readable<Worker> = getContext('engine');
  const evaluations: Writable<Evaluation[]> = getContext('evaluations');
  const settings: Writable<SettingsType> = getContext('settings');
</script>

<div class="card p-4 h-full flex flex-col">
  <section class="mb-4 grow">
    <TabGroup justify="justify-center">
      <Tab bind:group={currentTab} name="load" value="load">💾 Load</Tab>
      <Tab bind:group={currentTab} name="report" value="report">📊 Report</Tab>
      <Tab bind:group={currentTab} name="settings" value="settings">🛠️ Settings</Tab>
      <svelte:fragment slot="panel">
        {#if currentTab === 'load'}
          <Load onChange={onChangeStrPgn} analyze={analyze} />
        {:else if currentTab === 'report'}
          <Report />
        {:else if currentTab === 'settings'}
          <Settings />
        {/if}
      </svelte:fragment>
    </TabGroup>
  </section>
  <footer class="card-footer">
    {#if currentTab === 'load' || currentTab === 'settings'}
      <ButtonFooter onClick={analyze} {isLoading} />
    {:else if currentTab === 'report'}
      <NavigationFooter />
    {/if}
  </footer>
</div>

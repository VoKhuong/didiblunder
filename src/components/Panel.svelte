<script lang="ts">
  import { Tabs } from '@skeletonlabs/skeleton-svelte';

  import Load from './tabs/Load.svelte';
  import ButtonFooter from './tabs/footers/ButtonFooter.svelte';
  import NavigationFooter from './tabs/footers/NavigationFooter.svelte';
  import Report from './tabs/Report.svelte';
  import Settings from './tabs/Settings.svelte';
  import { analyze_game } from '$lib/engine';
  import { TABS, type TabName } from '$lib/constants';
  import { getGame } from '$lib/game-context';
  import { log } from '$lib/log';

  const game = getGame();

  let currentTab: TabName = $state('load');
  let strPgn: string = $state('');
  let isLoading: boolean = $state(false);
  let progress = $state(0);

  const setProgress = (n: number) => (progress = n);
  const onChangeStrPgn = (newPgn: string) => (strPgn = newPgn);

  const analyze = async () => {
    isLoading = true;

    // add a line break after last comment for chess.com mobile PGN export
    strPgn = strPgn.replace(/](?![\s\S]*\])(?!\n\n)/, ']\n');

    log(strPgn);
    try {
      game.chess.loadPgn(strPgn);
      game.history = game.chess.history({ verbose: true });
      game.startFen = game.history[0]?.before ?? game.chess.fen();
      game.first();
      const report = await analyze_game(
        game.engine!,
        game.history,
        game.chess,
        game.settings.depth,
        setProgress
      );
      log(report);
      game.evaluations = report;
      currentTab = 'report';
    } catch (e) {
      alert('An error occured, please try again.');
      throw e;
    } finally {
      isLoading = false;
      progress = 0;
    }
  };
</script>

<div
  class="card preset-filled-surface-100-900 max-md:bg-transparent! p-0 md:p-4 h-full flex flex-col"
>
  <section class="mb-4 grow">
    <Tabs
      value={currentTab}
      onValueChange={(details) => (currentTab = (details.value as TabName | undefined) ?? 'load')}
    >
      <Tabs.List class="justify-center">
        {#each TABS as tab (tab.value)}
          <Tabs.Trigger value={tab.value}>{tab.label}</Tabs.Trigger>
        {/each}
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

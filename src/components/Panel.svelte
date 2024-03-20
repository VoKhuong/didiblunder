<script lang="ts">
  import { TabGroup, Tab } from '@skeletonlabs/skeleton';
  import Load from './tabs/Load.svelte';
  import ButtonFooter from './tabs/footers/ButtonFooter.svelte';
  import NavigationFooter from './tabs/footers/NavigationFooter.svelte';
  import Report from './tabs/Report.svelte';

  let currentTab: string = 'load';

  let load: () => void = () => {};
</script>

<div class="card p-4 h-full flex flex-col">
  <section class="mb-4 grow">
    <TabGroup justify="justify-center">
      <Tab bind:group={currentTab} name="load" value="load">💾 Load</Tab>
      <Tab bind:group={currentTab} name="report" value="report">📊 Report</Tab>
      <Tab bind:group={currentTab} name="settings" value="settings">🛠️ Settings</Tab>
      <svelte:fragment slot="panel">
        {#if currentTab === 'load'}
          <Load bind:load />
        {:else if currentTab === 'report'}
          <Report />
        {:else if currentTab === 'settings'}
          (tab panel 3 contents)
        {/if}
      </svelte:fragment>
    </TabGroup>
  </section>
  <footer class="card-footer">
    {#if currentTab === 'load' || currentTab === 'settings'}
      <ButtonFooter onClick={load} />
    {:else if currentTab === 'report'}
      <NavigationFooter />
    {/if}
  </footer>
</div>

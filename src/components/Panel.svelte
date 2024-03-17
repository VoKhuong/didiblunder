<script lang="ts">
  import { TabGroup, Tab } from '@skeletonlabs/skeleton';

  let currentTab: string = "load";
</script>

<div class="card p-4 h-full flex flex-col">
  <header class="card-header">
    <h3 class="h3 text-center">🔎 Analysis</h3>
  </header>
  <section class="my-4 grow">
    <TabGroup justify="justify-center">
      <Tab bind:group={currentTab} name="load" value="load">💾 Load</Tab>
      <Tab bind:group={currentTab} name="report" value="report">📊 Report</Tab>
      <Tab bind:group={currentTab} name="settings" value="settings">🛠️ Settings</Tab>
      <svelte:fragment slot="panel">
          (tab panel 1 contents)
        {#if currentTab === "load"}
        {:else if currentTab === "report"}
          (tab panel 2 contents)
        {:else if currentTab === "settings"}
          (tab panel 3 contents)
        {/if}
      </svelte:fragment>
    </TabGroup>
  </section>
</div>

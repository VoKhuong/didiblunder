<script lang="ts">
  import { TabGroup, Tab } from '@skeletonlabs/skeleton';

  let currentTab: number = 0;
</script>

<div class="card p-4">
  <header class="card-header">
    <h3 class="h3 text-center">🔎 Analysis</h3>
  </header>
  <section class="my-4">
    <TabGroup justify="justify-center">
      <Tab bind:group={currentTab} name="tab1" value={0}>(label 1)</Tab>
      <Tab bind:group={currentTab} name="tab2" value={1}>(label 2)</Tab>
      <Tab bind:group={currentTab} name="tab3" value={2}>(label 3)</Tab>
      <svelte:fragment slot="panel">
        {#if currentTab === 0}
          (tab panel 1 contents)
        {:else if currentTab === 1}
          (tab panel 2 contents)
        {:else if currentTab === 2}
          (tab panel 3 contents)
        {/if}
      </svelte:fragment>
    </TabGroup>
  </section>
</div>
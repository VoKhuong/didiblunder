<script lang="ts">
  import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
  import { ENGINES } from '$lib/engines';

  const engines = Object.values(ENGINES);
</script>

<Dialog>
  <Dialog.Trigger class="ml-1 badge-icon preset-filled-surface-500">?</Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center p-4">
      <Dialog.Content
        class="card preset-filled-surface-100-900 p-4 w-full max-w-md shadow-xl space-y-4"
      >
        <header class="flex justify-between items-center">
          <Dialog.Title class="text-2xl font-bold">Engine</Dialog.Title>
          <Dialog.CloseTrigger class="btn-icon hover:preset-tonal" aria-label="Close">
            ✕
          </Dialog.CloseTrigger>
        </header>
        <article>
          <ul class="space-y-4">
            {#each engines as engine}
              <li>
                <strong>{engine.help.name}</strong>: {engine.help.description}
              </li>
            {/each}
          </ul>
        </article>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

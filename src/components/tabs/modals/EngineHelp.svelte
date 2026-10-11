<script lang="ts">
  import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
</script>

<Dialog>
  <Dialog.Trigger class="ml-1 badge-icon preset-filled-surface-500 inline-flex">?</Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center p-4">
      <Dialog.Content
        class="card bg-surface-100-900 p-4 w-full max-w-md relative shadow-xl space-y-4"
      >
        <header class="text-2xl font-bold">Engine</header>
        <article>
          <ul class="space-y-4">
            <li>
              <strong>Lite Single-Threaded Engine</strong>: This version is moderately strong, very
              fast, and small in size (approximately 6MB), making it the best choice for most cases,
              including browsers that can't handle multiple threads.
            </li>
            <li>
              <strong>Lite Multi-Threaded Engine</strong>: This version is moderately strong, fast,
              and much smaller in size (approximately 6MB), making it well-suited for most cases.
            </li>
            <li>
              <strong>Large Multi-Threaded Engine</strong>: This is the strongest version of the
              engine but also the largest (approximately 66MB), best suited for powerful browsers
              and desktops, though it can take quite some time to load.
            </li>
            <li>
              <strong>Large Single-Threaded Engine</strong>: This version is also strong and fast
              but slightly less powerful than the multi-threaded one, with a large file size of
              approximately 66MB, ideal for browsers that can't handle multiple threads, though it
              can take quite some time to load.
            </li>
          </ul>
        </article>
        <footer class="flex justify-center">
          <Dialog.CloseTrigger
            class="btn-icon preset-filled md:absolute md:-top-5 md:-right-5 font-bold shadow-xl"
          >
            ✕
          </Dialog.CloseTrigger>
        </footer>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

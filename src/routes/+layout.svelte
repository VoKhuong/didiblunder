<script lang="ts">
  import '../app.postcss';
  import 'cm-chessboard/assets/chessboard.css';

  import { initializeStores, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';

  initializeStores();

  const drawerStore = getDrawerStore();
</script>

<slot />
<Drawer>
  <h2 class="h2 ml-4 mt-4">Engine</h2>
  <ul class="m-4 space-y-4">
    <li>
      <strong>Lite Single-Threaded Engine</strong>: This version is moderately strong, very fast,
      and small in size (approximately 6MB), making it the best choice for most cases, including
      browsers that can't handle multiple threads.
    </li>
    <li>
      <strong>Lite Multi-Threaded Engine</strong>: This version is moderately strong, fast, and much
      smaller in size (approximately 6MB), making it well-suited for most cases.
    </li>
    <li>
      <strong>Large Multi-Threaded Engine</strong>: This is the strongest version of the engine but
      also the largest (approximately 66MB), best suited for powerful browsers and desktops, though
      it can take quite some time to load.
    </li>
    <li>
      <strong>Large Single-Threaded Engine</strong>: This version is also strong and fast but
      slightly less powerful than the multi-threaded one, with a large file size of approximately
      66MB, ideal for browsers that can't handle multiple threads, though it can take quite some
      time to load.
    </li>
  </ul>
  <button
    type="button"
    class="md:hidden absolute bottom-0 justify-self-center mb-4 ml-4 btn-icon btn-icon-lg text-xl variant-filled"
    on:click={drawerStore.close}
  >
    &#x2715;
  </button
  >
</Drawer>

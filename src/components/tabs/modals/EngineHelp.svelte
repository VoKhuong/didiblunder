<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  interface Props {
    parent: SvelteComponent;
  }

  let { parent }: Props = $props();
</script>

<div class="card p-4 w-modal relative shadow-xl space-y-4">
  <header class="text-2xl font-bold">Engine</header>
  <article>
    <ul class="space-y-4">
      <li>
        <strong>Lite Single-Threaded Engine</strong>: This version is moderately strong, very fast,
        and small in size (approximately 6MB), making it the best choice for most cases, including
        browsers that can't handle multiple threads.
      </li>
      <li>
        <strong>Lite Multi-Threaded Engine</strong>: This version is moderately strong, fast, and
        much smaller in size (approximately 6MB), making it well-suited for most cases.
      </li>
      <li>
        <strong>Large Multi-Threaded Engine</strong>: This is the strongest version of the engine
        but also the largest (approximately 66MB), best suited for powerful browsers and desktops,
        though it can take quite some time to load.
      </li>
      <li>
        <strong>Large Single-Threaded Engine</strong>: This version is also strong and fast but
        slightly less powerful than the multi-threaded one, with a large file size of approximately
        66MB, ideal for browsers that can't handle multiple threads, though it can take quite some
        time to load.
      </li>
    </ul>
  </article>
  <footer class="flex justify-center">
    <button
      class="btn-icon variant-filled md:absolute md:-top-5 md:-right-5 font-bold shadow-xl"
      onclick={parent.onClose}>✕</button
    >
  </footer>
</div>

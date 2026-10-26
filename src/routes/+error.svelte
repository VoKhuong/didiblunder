<script lang="ts">
  import { page } from '$app/state';

  const message = $derived(page.error?.message || 'Something went wrong.');
</script>

<svelte:head>
  <title>{page.status} · didiblunder</title>
</svelte:head>

<main class="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
  <h1 class="h1">{page.status}</h1>
  <p class="max-w-md text-surface-600-400">{message}</p>
  <a class="btn preset-filled" href="/">Back to the board</a>
</main>

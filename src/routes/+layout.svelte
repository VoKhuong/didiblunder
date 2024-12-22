<script lang="ts">
  import '../app.postcss';
  import 'cm-chessboard/assets/chessboard.css';

  import { initializeStores, Modal, type ModalComponent } from '@skeletonlabs/skeleton';
  import EngineHelp from '../components/tabs/modals/EngineHelp.svelte';
  import ChessComGameSelection from '../components/tabs/modals/ChessComGameSelection.svelte';
  import { onMount } from 'svelte';
  import { preloadAudio } from '$lib/media';
  import posthog from 'posthog-js';
  import { PUBLIC_POSTHOG_TOKEN, PUBLIC_POSTHOG_URL } from "$env/static/public";

  initializeStores();

  const registry: Record<string, ModalComponent> = {
    engineHelp: { ref: EngineHelp },
    chessComGameSelection: { ref: ChessComGameSelection }
  };

  onMount(() => {
    posthog.init(PUBLIC_POSTHOG_TOKEN, {
      api_host: PUBLIC_POSTHOG_URL,
      person_profiles: 'identified_only'
    });
    preloadAudio('sfx-move', '/media/move.webm');
    preloadAudio('sfx-capture', '/media/capture.webm');
    preloadAudio('sfx-check', '/media/check.webm');
    preloadAudio('sfx-promotion', '/media/promotion.webm');
    preloadAudio('sfx-checkmate', '/media/checkmate.webm');
  });
</script>

<slot />
<Modal components={registry} />

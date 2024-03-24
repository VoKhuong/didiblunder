<script lang="ts">
  import '../app.postcss';
  import 'cm-chessboard/assets/chessboard.css';

  import { initializeStores, Modal, type ModalComponent } from '@skeletonlabs/skeleton';
  import EngineHelp from '../components/tabs/modals/EngineHelp.svelte';
  import ChessComGameSelection from '../components/tabs/modals/ChessComGameSelection.svelte';
  import { onMount } from 'svelte';
  import { preloadAudio } from '$lib/media';

  initializeStores();

  const registry: Record<string, ModalComponent> = {
    engineHelp: { ref: EngineHelp },
    chessComGameSelection: { ref: ChessComGameSelection }
  };

  onMount(() => {
    preloadAudio('sfx-move', '/media/move.webm');
    preloadAudio('sfx-capture', '/media/capture.webm');
    preloadAudio('sfx-check', '/media/check.webm');
    preloadAudio('sfx-promotion', '/media/promotion.webm');
    preloadAudio('sfx-checkmate', '/media/checkmate.webm');
  });
</script>

<slot />
<Modal components={registry} />

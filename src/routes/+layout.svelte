<script lang="ts">
  import '../app.postcss';
  import 'cm-chessboard/assets/chessboard.css';

  import { initializeStores, Modal, type ModalComponent } from '@skeletonlabs/skeleton';
  import EngineHelp from '../components/tabs/modals/EngineHelp.svelte';
  import ChessComGameSelection from '../components/tabs/modals/ChessComGameSelection.svelte';

  initializeStores();

  const registry: Record<string, ModalComponent> = {
    engineHelp: { ref: EngineHelp },
    chessComGameSelection: { ref: ChessComGameSelection }
  };
</script>

<slot />
<Modal components={registry} />

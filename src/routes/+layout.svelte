<script lang="ts">
  import '../app.postcss';
  import 'cm-chessboard/assets/chessboard.css';

  import { initializeStores, Modal, type ModalComponent } from '@skeletonlabs/skeleton';
  import EngineHelp from '../components/modals/EngineHelp.svelte';

  initializeStores();

  const registry: Record<string, ModalComponent> = {
    engineHelp: { ref: EngineHelp }
  };
</script>

<slot />
<Modal components={registry} />

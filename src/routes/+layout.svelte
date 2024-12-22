<script lang="ts">
  import '../app.postcss';
  import 'cm-chessboard/assets/chessboard.css';

  import { initializeStores, Modal, type ModalComponent } from '@skeletonlabs/skeleton';
  import EngineHelp from '../components/tabs/modals/EngineHelp.svelte';
  import ChessComGameSelection from '../components/tabs/modals/ChessComGameSelection.svelte';
  import { onMount } from 'svelte';
  import { preloadAudio } from '$lib/media';
  import posthog from 'posthog-js';
  import * as Sentry from '@sentry/browser';
  import {
    PUBLIC_POSTHOG_TOKEN,
    PUBLIC_POSTHOG_URL,
    PUBLIC_SENTRY_DSN,
    PUBLIC_SENTRY_ORG,
    PUBLIC_SENTRY_PROJECT_ID
  } from '$env/static/public';

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

    Sentry.init({
      dsn: PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      integrations: [
        posthog.sentryIntegration({
          organization: PUBLIC_SENTRY_ORG,
          projectId: parseInt(PUBLIC_SENTRY_PROJECT_ID),
          severityAllowList: ['error', 'info']
        })
      ]
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

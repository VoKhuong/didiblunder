import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte'],
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [vitePreprocess()],

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter({
      // Cloudflare rejects overlapping `_routes.json` rules. By default the adapter
      // appends each `_redirects` source to the exclude list, but ours all live under
      // `/_app/immutable/*` which the `<build>` rule already excludes. Opt out of the
      // redundant `<redirects>` expansion to avoid the overlap error.
      routes: {
        include: ['/*'],
        exclude: ['<build>', '<files>', '<prerendered>']
      }
    }),
    alias: {
      $models: 'src/models',
      $node_modules: 'node_modules'
    }
  }
};
export default config;

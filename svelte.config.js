import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte'],
  preprocess: [vitePreprocess()],

  kit: {
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
      $models: 'src/models'
    }
  }
};
export default config;

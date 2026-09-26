import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({ pages: 'build', assets: 'build', fallback: null }),
		prerender: {
			handleHttpError: ({ path, message }) => {
				if (path.startsWith('/assets/') || path.startsWith('/chess/') || path.startsWith('/app/')) { console.warn('prerender skip', path); return; }
				throw new Error(message);
			}
		},
		paths: { base: '' }
	}
};

export default config;

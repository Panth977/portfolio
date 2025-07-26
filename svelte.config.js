import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: { adapter: adapter() }
};
// const config = {
// ssr: false,
// 	kit: {
// 		adapter: require('@sveltejs/adapter-static')(),
// 		prerender: { entries: ['*'] }
// 	}
// };

export default config;

// import adapter from '@sveltejs/adapter-cloudflare';
// import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// const config = {
// 	preprocess: vitePreprocess(),
// 	kit: { adapter: adapter() }
// };
// // const config = {
// // ssr: false,
// // 	kit: {
// // 		adapter: require('@sveltejs/adapter-static')(),
// // 		prerender: { entries: ['*'] }
// // 	}
// // };

// export default config;

import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// default options are usually fine:
			pages: 'build', // output dir for HTML, CSS, JS
			assets: 'build', // same as above
			fallback: null // can be 'index.html' for SPA routing
		}),
		paths: {
			base: ''
		}
	}
};

export default config;

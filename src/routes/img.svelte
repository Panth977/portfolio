<script lang="ts">
	import { onMount } from 'svelte';
	import { generatePreviewUrl, getAssetsPath, type WSRVOptions } from './utils.svelte';
	type Src =
		| 'Panth-logo.svg'
		| 'ai1-cheap.png'
		| 'react-logo.svg'
		| 'react-bits-logo.svg'
		| 'svelte-logo.svg'
		| 'JavaScript-logo.png'
		| 'Typescript-logo.svg'
		| 'nodejs-logo.svg'
		| 'deno-logo.svg'
		| 'GoLang-logo.svg'
		| 'python-logo.svg'
		| 'RLang-logo.svg'
		| 'dart-logo.svg'
		| 'flutter-logo.svg'
		| 'expressjs-logo.svg'
		| 'hono-logo.svg'
		| 'PostgreSQL-logo.svg'
		| 'Cassandra-logo.svg'
		| 'Influxdb-logo.svg'
		| 'Redis-logo.svg'
		| 'MongoDB-logo.svg'
		| 'firestore-logo.svg'
		| 'axiom-logo.svg'
		| 'Google-Cloud-logo.svg'
		| 'DigitalOcean-logo.svg'
		| 'docker-logo.svg'
		| 'portainer-logo.png'
		| 'nodered-logo.svg'
		| 'mqtt-logo.svg'
		| 'kafka-logo.png'
		| 'oizom-logo.png'
		| 'begenuin-logo.svg'
		| 'tech-crista-logo.png'
		| 'vdp-logo.svg'
		| 'jsr-logo.svg'
		| 'hashnode-logo.svg'
		| 'youtube-logo.png'
		| 'PDF-icon.svg'
		| 'github-logo.svg'
		| 'GitHub-logo.png'
		| 'LinkedIn-logo.png'
		| 'email-icon.svg'
		| 'phone-icon.svg'
		| 'whatsapp-logo.svg'
		| 'communicate.png';
	// type WithHeight = WSRVOptions & Required<Pick<WSRVOptions, 'height'>>;
	let {
		src,
		skip,
		class: className,
		...options
	}: WSRVOptions & { skip?: boolean; class: string; src: Src | (string & {}) } = $props();
	const originalUrl = getAssetsPath(src);
	const cheapUrl = generatePreviewUrl(originalUrl, { ...options, height: 401, webp: true });
	const initialUrl = skip ? originalUrl : cheapUrl;
	const finalUrl = generatePreviewUrl(
		getAssetsPath(src),
		Object.keys(options).length ? options : { webp: true, height: 401 }
	);
	let url = $state<string>(initialUrl);

	let img: HTMLImageElement;
	onMount(() => {
		if (skip) return;
		if (!img) return;
		if (img.complete) {
			url = finalUrl;
			return;
		}
		let settled = false;
		img.onload = () => {
			if (settled) return;
			setTimeout(() => {
				url = finalUrl;
			}, 1000);
			settled = true;
		};
		img.onerror = () => {
			if (settled) return;
			url = originalUrl;
			settled = true;
		};
	});
</script>

<img bind:this={img} src={skip ? originalUrl : url} alt={src} class={className} />

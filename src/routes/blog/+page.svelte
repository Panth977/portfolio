<script lang="ts">
	import { onMount } from 'svelte';
	import Squares from '$lib/Squares.svelte';
	import DecryptedText from '$lib/DecryptedText.svelte';

	let { data } = $props();
	let Splash: any = $state(null);
	onMount(async () => {
		const fine = matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (fine) Splash = (await import('$lib/SplashCursor.svelte')).default;
	});
	const site = 'https://panth.vardayinitech.in';
	let q = $state('');
	const norm = (s: string) => s.toLowerCase();
	const hits = $derived(
		q.trim().length < 2
			? null
			: data.posts.filter((p) => {
					const hay = norm(p.title + ' ' + p.description + ' ' + p.tags.join(' '));
					return q.trim().toLowerCase().split(/\s+/).every((w) => hay.includes(w));
				})
	);
	const [latest, ...older] = data.posts;
	const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
</script>

<svelte:head>
	<title>Blog · Panth Patel</title>
	<meta name="description" content="Notes from building Envizom at Oizom: developer tooling, agent-driven pipelines, backend and platform engineering." />
	<link rel="canonical" href="{site}/blog" />
	<link rel="alternate" type="application/rss+xml" title="Panth Patel" href="{site}/rss.xml" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Blog · Panth Patel" />
	<meta property="og:description" content="Developer tooling, agent-driven pipelines, backend and platform engineering." />
	<meta property="og:url" content="{site}/blog" />
	<meta property="og:image" content="{site}/assets/blog/pipeline_og_1200x628.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@panthXYZ" />
</svelte:head>

{#if Splash}<Splash />{/if}

<header class="relative overflow-hidden">
	<div class="absolute inset-0 z-0 opacity-35"><Squares /></div>
	<div class="fade" aria-hidden="true"></div>
	<div class="wrap relative z-10 px-4 pt-8 pb-12 md:px-10 md:pb-16">
		<nav class="flex items-baseline justify-between font-mono text-sm text-gray-400">
			<a class="pink-link" href="/">← Meet Panth</a>
			<a class="pink-link" href="/rss.xml">RSS</a>
		</nav>
		<h1 class="mt-16 font-mono text-6xl leading-none sm:text-7xl md:mt-24 md:text-8xl">
			<DecryptedText text="Blog" animateOn="view" sequential speed={70} maxIterations={14} encryptedClassName="text-[deeppink]" />
		</h1>
		<p class="mt-5 max-w-xl text-lg text-gray-400 sm:text-xl">
			Working notes from building Envizom at Oizom. Developer tooling, agent-driven pipelines, the backend underneath, and what I got wrong on the way.
		</p>
	</div>
</header>

<main class="wrap relative z-10 px-4 pb-24 md:px-10">
	<form class="search" role="search" onsubmit={(e) => e.preventDefault()}>
		<label class="sr-only" for="q">Search posts</label>
		<span class="font-mono text-[deeppink]" aria-hidden="true">&gt;</span>
		<input id="q" type="search" bind:value={q} placeholder="search titles, tags, summaries" autocomplete="off" spellcheck="false" />
		{#if hits}<span class="font-mono text-sm text-gray-500">{hits.length} of {data.posts.length}</span>{/if}
	</form>

	{#if hits}
		{#if hits.length}
			<ol class="ledger mt-6">
				{#each hits as p}
					<li>
						<a href="/blog/{p.slug}" class="row group">
							<img class="thumb" src={p.cover ?? '/assets/blog/pipeline_og_1200x628.png'} alt="" loading="lazy" />
							<div>
								<span class="font-mono text-sm text-gray-500">{fmt(p.date)} <span class="mx-2 text-gray-700">/</span> {p.readingTime} min</span>
								<span class="title mt-1 block font-mono text-xl leading-snug text-white sm:text-2xl">{p.title}</span>
								<span class="mt-2 block text-gray-400">{p.description}</span>
							</div>
						</a>
					</li>
				{/each}
			</ol>
		{:else}
			<p class="mt-8 font-mono text-sm text-gray-500">Nothing matches "{q}". Try a tag like node-js, cache or devops.</p>
		{/if}
	{:else}
	{#if latest}
		<a href="/blog/{latest.slug}" class="poster group block">
			<img class="poster-img" src={latest.poster ?? latest.cover ?? '/assets/blog/pipeline_og_1200x628.png'} alt="" loading="eager" />
			<div class="poster-body">
				<p class="font-mono text-sm text-[deeppink]">Latest{#if latest.video}, with a 2-minute film{/if}</p>
				<h2 class="mt-3 max-w-3xl font-mono text-2xl leading-tight text-white sm:text-4xl md:text-5xl">{latest.title}</h2>
				<p class="mt-4 hidden max-w-2xl text-base text-gray-300 sm:block md:text-lg">{latest.description}</p>
				<p class="mt-5 font-mono text-sm text-gray-400">
					{fmt(latest.date)} <span class="mx-2 text-gray-600">/</span> {latest.readingTime} min read
					<span class="mx-2 text-gray-600">/</span> {latest.tags.join(', ')}
				</p>
			</div>
		</a>
		<p class="mt-4 text-gray-400 sm:hidden">{latest.description}</p>
	{/if}

	{#if older.length}
		<h2 class="mt-24 font-mono text-xl text-gray-400">Earlier</h2>
		<ol class="ledger mt-4">
			{#each older as p}
				<li>
					<a href="/blog/{p.slug}" class="row group">
						<img class="thumb" src={p.cover ?? '/assets/blog/pipeline_og_1200x628.png'} alt="" loading="lazy" />
						<div>
							<span class="font-mono text-sm text-gray-500">{fmt(p.date)} <span class="mx-2 text-gray-700">/</span> {p.readingTime} min</span>
							<span class="title mt-1 block font-mono text-xl leading-snug text-white sm:text-2xl">{p.title}</span>
							<span class="mt-2 block text-gray-400">{p.description}</span>
						</div>
					</a>
				</li>
			{/each}
		</ol>
	{:else}
		<p class="mt-16 font-mono text-sm text-gray-500">More every couple of weeks. The RSS link above is the reliable way to catch them.</p>
	{/if}
	{/if}
</main>

<style>
	.wrap { margin-inline: auto; max-width: 1040px; }
	.pink-link { border-bottom: 2px dashed deeppink; }
	.fade { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 55%, #000 100%); }

	.poster { display: block; border: 2px dashed deeppink; border-radius: 4px; overflow: hidden; background: #060010; }
	.poster-img { display: block; width: 100%; aspect-ratio: 1000 / 420; object-fit: cover; object-position: center; filter: saturate(0.85); transition: transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1), filter 0.7s; }
	.poster:hover .poster-img, .poster:focus-visible .poster-img { transform: scale(1.02); filter: saturate(1); }
	.poster-body { padding: 1.25rem; border-top: 1px dashed rgba(255, 20, 147, 0.4); }
	@media (min-width: 640px) { .poster-body { padding: 1.75rem 2rem 2rem; } }
	.poster:focus-visible { outline: 2px dashed deeppink; outline-offset: 8px; }

	.search { display: flex; align-items: center; gap: 0.75rem; margin: 0 0 2.5rem; padding: 0.6rem 0.9rem; border: 1px dashed rgba(255, 20, 147, 0.5); border-radius: 4px; background: #060010; }
	.search input { flex: 1; min-width: 0; background: transparent; border: 0; outline: 0; color: #fff; font: 500 1rem 'IBM Plex Mono', ui-monospace, monospace; }
	.search input::placeholder { color: #6b6b7a; }
	.search:focus-within { border-color: deeppink; }
	.ledger { border-top: 1px dashed rgba(255, 20, 147, 0.4); }
	.ledger li { border-bottom: 1px dashed rgba(255, 20, 147, 0.4); }
	.row { display: grid; grid-template-columns: 1fr; gap: 1rem; padding: 1.5rem 0; }
	@media (min-width: 640px) { .row { grid-template-columns: 260px 1fr; gap: 1.5rem; align-items: start; } }
	.thumb { display: block; width: 100%; aspect-ratio: 1200 / 628; object-fit: cover; border: 2px dashed rgba(255, 20, 147, 0.6); border-radius: 4px; background: #060010; filter: saturate(0.8); transition: filter 0.3s, border-color 0.3s, transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1); }
	.row:hover .thumb, .row:focus-visible .thumb { filter: saturate(1); border-color: deeppink; transform: translateY(-2px); }
	.title { transition: color 0.2s; }
	.row:hover .title, .row:focus-visible .title { color: deeppink; }
	.row:focus-visible { outline: 2px dashed deeppink; outline-offset: 6px; }
	@media (prefers-reduced-motion: reduce) { .poster-img, .thumb { transition: none; } }
</style>

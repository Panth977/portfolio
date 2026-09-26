<script lang="ts">
	import Squares from '$lib/Squares.svelte';
	import DecryptedText from '$lib/DecryptedText.svelte';

	let { data } = $props();
	const site = 'https://panth.whiteloves.in';
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

<header class="relative overflow-hidden">
	<div class="absolute inset-0 z-0 opacity-35"><Squares /></div>
	<div class="fade" aria-hidden="true"></div>
	<div class="wrap relative z-10 px-4 pt-8 pb-16 md:px-10 md:pb-24">
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

<main class="wrap px-4 pb-24 md:px-10">
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
					<a href="/blog/{p.slug}" class="ledger-row group">
						<span class="font-mono text-sm text-gray-500">{fmt(p.date)}</span>
						<span class="ledger-title font-mono text-xl text-white sm:text-2xl">{p.title}</span>
						<span class="hidden font-mono text-sm text-gray-500 sm:block">{p.readingTime} min</span>
					</a>
					<p class="ledger-desc text-gray-400">{p.description}</p>
				</li>
			{/each}
		</ol>
	{:else}
		<p class="mt-16 font-mono text-sm text-gray-500">More every couple of weeks. The RSS link above is the reliable way to catch them.</p>
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

	.ledger { border-top: 1px dashed rgba(255, 20, 147, 0.4); }
	.ledger li { border-bottom: 1px dashed rgba(255, 20, 147, 0.4); padding: 1.25rem 0; }
	.ledger-row { display: grid; grid-template-columns: 8.5rem 1fr auto; gap: 1rem; align-items: baseline; }
	@media (max-width: 640px) { .ledger-row { grid-template-columns: 1fr; gap: 0.25rem; } }
	.ledger-title { transition: color 0.2s; }
	.ledger-row:hover .ledger-title, .ledger-row:focus-visible .ledger-title { color: deeppink; }
	.ledger-desc { margin-top: 0.5rem; }
	@media (min-width: 641px) { .ledger-desc { margin-left: 9.5rem; } }

	@media (prefers-reduced-motion: reduce) { .poster-img { transition: none; } }
</style>

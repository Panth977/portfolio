<script lang="ts">
	import Squares from '$lib/Squares.svelte';
	import DecryptedText from '$lib/DecryptedText.svelte';
	import GradientText from '$lib/GradientText.svelte';

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

<div class="relative overflow-hidden">
	<div class="absolute inset-0 z-0 opacity-50">
		<Squares />
	</div>

	<div class="wrap relative z-10 px-4 pt-8 pb-24 md:px-10">
		<nav class="flex items-baseline justify-between font-mono text-sm text-gray-400">
			<a class="pink-link" href="/">← Meet Panth</a>
			<a class="pink-link" href="/rss.xml">RSS</a>
		</nav>

		<header class="mt-16 md:mt-24">
			<h1 class="font-mono text-5xl leading-none sm:text-7xl md:text-8xl">
				<DecryptedText text="Blog" animateOn="view" sequential speed={70} maxIterations={14} encryptedClassName="text-[deeppink]" />
			</h1>
			<p class="mt-5 max-w-xl text-lg text-gray-400 sm:text-xl">
				Working notes from building Envizom at Oizom. Developer tooling, agent-driven pipelines, the backend underneath, and what I got wrong on the way.
			</p>
		</header>

		{#if latest}
			<a href="/blog/{latest.slug}" class="poster group mt-16 block md:mt-24">
				<div class="poster-img">
					<img src={latest.cover ?? '/assets/blog/pipeline_og_1200x628.png'} alt="" loading="eager" />
				</div>
				<div class="poster-body">
					<p class="font-mono text-sm text-[deeppink]">Latest {#if latest.video}&nbsp;/&nbsp;with a 2-minute film{/if}</p>
					<h2 class="mt-3 font-mono text-2xl leading-tight text-white sm:text-4xl md:text-5xl">
						<GradientText className="poster-title">{latest.title}</GradientText>
					</h2>
					<p class="mt-4 max-w-2xl text-base text-gray-300 sm:text-lg">{latest.description}</p>
					<p class="mt-6 font-mono text-sm text-gray-400">
						{fmt(latest.date)} <span class="mx-2 text-gray-600">/</span> {latest.readingTime} min read
						<span class="mx-2 text-gray-600">/</span> {latest.tags.join(', ')}
					</p>
					<p class="mt-6 font-mono text-base text-white"><span class="pink-link">Read it</span></p>
				</div>
			</a>
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
			<p class="mt-24 font-mono text-sm text-gray-500">More every couple of weeks. The RSS link above is the reliable way to catch them.</p>
		{/if}
	</div>
</div>

<style>
	.wrap { margin-inline: auto; max-width: 1040px; min-height: 100vh; }
	.pink-link { border-bottom: 2px dashed deeppink; }

	.poster { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
	@media (min-width: 900px) { .poster { grid-template-columns: 1.05fr 1fr; gap: 3rem; align-items: center; } }
	.poster-img { position: relative; border: 2px dashed deeppink; border-radius: 4px; overflow: hidden; background: #060010; }
	.poster-img::after { content: ''; position: absolute; inset: 0; box-shadow: inset 0 0 0 1px rgba(255, 20, 147, 0.25); pointer-events: none; }
	.poster-img img { display: block; width: 100%; aspect-ratio: 1200 / 628; object-fit: cover; transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1), filter 0.6s; filter: saturate(0.85); }
	.poster:hover .poster-img img, .poster:focus-visible .poster-img img { transform: scale(1.03); filter: saturate(1); }
	.poster:focus-visible { outline: 2px dashed deeppink; outline-offset: 8px; }
	:global(.poster-title) { max-width: none !important; margin: 0 !important; backdrop-filter: none !important; }

	.ledger { border-top: 1px dashed rgba(255, 20, 147, 0.4); }
	.ledger li { border-bottom: 1px dashed rgba(255, 20, 147, 0.4); padding: 1.25rem 0; }
	.ledger-row { display: grid; grid-template-columns: 8.5rem 1fr auto; gap: 1rem; align-items: baseline; }
	@media (max-width: 640px) { .ledger-row { grid-template-columns: 1fr; gap: 0.25rem; } }
	.ledger-title { transition: color 0.2s; }
	.ledger-row:hover .ledger-title, .ledger-row:focus-visible .ledger-title { color: deeppink; }
	.ledger-desc { margin-top: 0.5rem; }
	@media (min-width: 641px) { .ledger-desc { margin-left: 9.5rem; } }

	@media (prefers-reduced-motion: reduce) {
		.poster-img img { transition: none; }
	}
</style>

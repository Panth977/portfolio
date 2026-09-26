<script lang="ts">
	import { onMount } from 'svelte';
	import Squares from '$lib/Squares.svelte';

	let { data } = $props();
	const site = 'https://panth.whiteloves.in';
	const p = $derived(data.post);
	const url = $derived(`${site}/blog/${p.slug}`);
	const canonical = $derived(p.canonical ?? url);
	const cover = $derived(p.cover ? (p.cover.startsWith('http') ? p.cover : site + p.cover) : `${site}/assets/blog/pipeline_og_1200x628.png`);
	const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	const ld = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: p.title,
			description: p.description,
			datePublished: p.date,
			dateModified: p.updated ?? p.date,
			image: cover,
			url,
			mainEntityOfPage: canonical,
			keywords: p.tags.join(', '),
			author: { '@type': 'Person', name: 'Panth Patel', url: site, sameAs: ['https://www.linkedin.com/in/panth-patel-447a88240/', 'https://x.com/panthXYZ', 'https://dev.to/panthpatel', 'https://github.com/Panth977'] },
			publisher: { '@type': 'Person', name: 'Panth Patel' },
			...(p.video ? { video: { '@type': 'VideoObject', name: p.title, description: p.description, thumbnailUrl: cover, uploadDate: p.date, embedUrl: p.video.replace('youtu.be/', 'www.youtube.com/embed/') } } : {})
		})
	);

	let progress = $state(0);
	let article: HTMLElement;
	onMount(() => {
		const onScroll = () => {
			const r = article.getBoundingClientRect();
			const total = r.height - window.innerHeight;
			progress = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
	const share = $derived(`https://x.com/intent/post?text=${encodeURIComponent(p.title)}&url=${encodeURIComponent(url)}&via=panthXYZ`);
	const shareLi = $derived(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
</script>

<svelte:head>
	<title>{p.title} · Panth Patel</title>
	<meta name="description" content={p.description} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={p.title} />
	<meta property="og:description" content={p.description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={cover} />
	<meta property="article:published_time" content={p.date} />
	<meta property="article:author" content="Panth Patel" />
	{#each p.tags as t}<meta property="article:tag" content={t} />{/each}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@panthXYZ" />
	<meta name="twitter:creator" content="@panthXYZ" />
	<meta name="twitter:title" content={p.title} />
	<meta name="twitter:description" content={p.description} />
	<meta name="twitter:image" content={cover} />
	<link rel="alternate" type="application/rss+xml" title="Panth Patel" href="{site}/rss.xml" />
	{@html `<script type="application/ld+json">${ld}</script>`}
</svelte:head>

<div class="progress" style="transform: scaleX({progress})" aria-hidden="true"></div>

<header class="relative overflow-hidden">
	<div class="absolute inset-0 z-0 opacity-35"><Squares /></div>
	<div class="fade" aria-hidden="true"></div>
	<div class="wrap relative z-10 px-4 pt-8 pb-14 md:px-10 md:pb-20">
		<nav class="flex items-baseline justify-between font-mono text-sm text-gray-400">
			<a class="pink-link" href="/blog">← Blog</a>
			<a class="pink-link" href="/">Meet Panth</a>
		</nav>
		<h1 class="mt-14 max-w-4xl font-mono text-3xl leading-[1.1] text-white sm:text-5xl md:mt-20 md:text-6xl">{p.title}</h1>
		<p class="mt-6 font-mono text-sm text-gray-400">
			Panth Patel <span class="mx-2 text-gray-600">/</span> {fmt(p.date)} <span class="mx-2 text-gray-600">/</span> {p.readingTime} min read
			{#if p.canonical && !p.canonical.startsWith(site)}<span class="mx-2 text-gray-600">/</span> first on <a class="pink-link" href={p.canonical}>dev.to</a>{/if}
		</p>
	</div>
</header>

<article bind:this={article} class="wrap px-4 pb-10 md:px-10">
	{#if p.cover && !p.video}
		<img class="hero" src={p.cover} alt="" loading="eager" />
	{/if}
	<div class="post">{@html p.html}</div>

	<footer class="mt-16 border-t border-dashed border-[deeppink]/40 pt-8 font-mono text-sm text-gray-400">
		<p>{p.tags.join(', ')}</p>
		<p class="mt-4">
			Share on <a class="pink-link" href={share}>X</a> or <a class="pink-link" href={shareLi}>LinkedIn</a>.
			Questions go on <a class="pink-link" href={p.canonical ?? 'https://dev.to/panthpatel'}>dev.to</a> or <a class="pink-link" href="https://www.linkedin.com/in/panth-patel-447a88240/">LinkedIn</a>; I answer all of them and collect the good ones into a follow-up.
		</p>
		<div class="mt-10 grid gap-6 sm:grid-cols-2">
			{#if data.older}<a href="/blog/{data.older.slug}" class="block"><span class="text-gray-500">Earlier</span><br /><span class="pink-link text-white">{data.older.title}</span></a>{:else}<span></span>{/if}
			{#if data.newer}<a href="/blog/{data.newer.slug}" class="block sm:text-right"><span class="text-gray-500">Newer</span><br /><span class="pink-link text-white">{data.newer.title}</span></a>{/if}
		</div>
	</footer>
</article>

<style>
	.wrap { margin-inline: auto; max-width: 780px; }
	.pink-link { border-bottom: 2px dashed deeppink; }
	.fade { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, #000 100%); }
	.hero { display: block; width: 100%; aspect-ratio: 1200 / 628; object-fit: cover; border: 2px dashed deeppink; border-radius: 4px; margin: 0 0 2.5rem; background: #060010; }
	.progress { position: fixed; top: 0; left: 0; height: 3px; width: 100%; background: deeppink; transform-origin: left; z-index: 50; }

	/* prose, in the site's voice */
	.post { font-size: 1.125rem; line-height: 1.75; color: #d6d9de; }
	.post :global(p) { margin: 1.25em 0; }
	.post :global(h2) { font-family: 'IBM Plex Mono', ui-monospace, monospace; font-weight: 500; font-size: 1.75rem; line-height: 1.2; color: #fff; margin: 2.75em 0 0.9em; }
	.post :global(h3) { font-family: 'IBM Plex Mono', ui-monospace, monospace; font-weight: 500; font-size: 1.25rem; color: #fff; margin: 2em 0 0.6em; }
	.post :global(h2::before) { content: '#'; color: deeppink; margin-right: 0.5em; }
	.post :global(a) { color: #fff; border-bottom: 2px dashed deeppink; }
	.post :global(a:hover) { color: deeppink; }
	.post :global(strong) { color: #fff; font-weight: 600; }
	.post :global(em) { color: #e8eaee; }
	.post :global(ul) { list-style: disc; padding-left: 1.4em; margin: 1.25em 0; }
	.post :global(ol) { list-style: decimal; padding-left: 1.6em; margin: 1.25em 0; }
	.post :global(ol li::marker) { font-family: 'IBM Plex Mono', ui-monospace, monospace; color: deeppink; }
	.post :global(li) { margin: 0.4em 0; }
	.post :global(li::marker) { color: deeppink; }
	.post :global(blockquote) { border-left: 3px solid deeppink; padding-left: 1.2em; color: #aeb4bc; margin: 1.5em 0; }
	.post :global(code) { font-family: 'IBM Plex Mono', ui-monospace, monospace; font-size: 0.9em; background: #12081a; padding: 0.1em 0.4em; border-radius: 3px; }
	.post :global(pre) { background: #060010; border: 1px dashed rgba(255, 165, 0, 0.5); border-radius: 4px; padding: 1.1em 1.25em; overflow-x: auto; margin: 1.5em 0; }
	.post :global(pre code) { background: none; padding: 0; font-size: 0.9rem; }
	.post :global(hr) { border: 0; border-top: 1px dashed rgba(255, 20, 147, 0.4); margin: 3em 0; }
	.post :global(img) { border-radius: 4px; border: 2px dashed deeppink; }
	.post :global(.video) { position: relative; padding-top: 56.25%; margin: 0 0 2rem; border: 2px dashed deeppink; border-radius: 4px; overflow: hidden; background: #060010; }
	.post :global(.video iframe) { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }

	@media (max-width: 640px) { .post { font-size: 1.0625rem; } .post :global(h2) { font-size: 1.4rem; } }
	@media (prefers-reduced-motion: reduce) { .progress { transition: none; } }
</style>

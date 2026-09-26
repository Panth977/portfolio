<script lang="ts">
	let { data } = $props();
	const site = 'https://panth.whiteloves.in';
	const p = $derived(data.post);
	const url = $derived(`${site}/blog/${p.slug}`);
	const canonical = $derived(p.canonical ?? url);
	const cover = $derived(p.cover ? (p.cover.startsWith('http') ? p.cover : site + p.cover) : `${site}/assets/blog/pipeline_og_1200x628.png`);
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

<article class="page-block mx-auto max-w-3xl p-4 md:px-10">
	<nav class="mt-6 text-sm text-gray-500"><a class="pink-link" href="/blog">← Blog</a></nav>
	<h1 class="mt-6 text-3xl leading-tight sm:text-5xl">{p.title}</h1>
	<p class="mt-3 text-sm text-gray-500">
		Panth Patel · {p.date} · {p.readingTime} min read
		{#if p.canonical && !p.canonical.startsWith(site)} · <span>first published on <a class="pink-link" href={p.canonical}>dev.to</a></span>{/if}
	</p>
	<div class="prose prose-invert prose-pink mt-8 max-w-none prose-headings:font-normal prose-a:text-[deeppink] prose-img:rounded-lg">
		{@html p.html}
	</div>
	<footer class="mt-12 border-t border-gray-800 pt-6 text-sm text-gray-400">
		<p>Tags: {p.tags.join(', ')}</p>
		<p class="mt-2">
			Discuss on <a class="pink-link" href="https://www.linkedin.com/in/panth-patel-447a88240/">LinkedIn</a>,
			<a class="pink-link" href="https://x.com/panthXYZ">X</a>, or reply on
			<a class="pink-link" href={p.canonical ?? 'https://dev.to/panthpatel'}>dev.to</a>.
		</p>
	</footer>
</article>

<style>
	:global(.video) { position: relative; padding-top: 56.25%; margin: 1.5rem 0; }
	:global(.video iframe) { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; border-radius: 12px; }
</style>

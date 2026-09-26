<script lang="ts">
	let { data } = $props();
	const site = 'https://panth.whiteloves.in';
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

<div class="page-block mx-auto max-w-3xl p-4 md:px-10">
	<nav class="mt-6 text-sm text-gray-500"><a class="pink-link" href="/">← Meet Panth</a></nav>
	<h1 class="mt-6 text-4xl sm:text-5xl">Blog</h1>
	<p class="mt-2 text-gray-400">
		Notes from building Envizom at Oizom: developer tooling, agent-driven pipelines, backend and platform engineering.
		<a class="pink-link" href="/rss.xml">RSS</a>
	</p>
	<ul class="mt-10 space-y-8">
		{#each data.posts as p}
			<li>
				<a href="/blog/{p.slug}" class="block">
					<h2 class="text-2xl text-white hover:text-[deeppink] sm:text-3xl">{p.title}</h2>
				</a>
				<p class="mt-1 text-sm text-gray-500">{p.date} · {p.readingTime} min read · {p.tags.join(', ')}</p>
				<p class="mt-2 text-gray-300">{p.description}</p>
			</li>
		{/each}
	</ul>
</div>

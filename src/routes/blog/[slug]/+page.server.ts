import { error } from '@sveltejs/kit';
import { posts, getPost } from '$lib/posts';

export const prerender = true;

export function entries() {
	return posts.map((p) => ({ slug: p.slug }));
}

export function load({ params }) {
	const post = getPost(params.slug);
	if (!post) error(404, 'Not found');
	const i = posts.findIndex((p) => p.slug === post.slug);
	const strip = (p?: (typeof posts)[number]) => (p ? { slug: p.slug, title: p.title, date: p.date } : null);
	const score = (q: (typeof posts)[number]) => q.tags.filter((t) => post.tags.includes(t)).length * 10 + (q.date < post.date ? 1 : 0);
	const related = posts
		.filter((q) => q.slug !== post.slug)
		.sort((a, b) => score(b) - score(a) || (a.date < b.date ? 1 : -1))
		.slice(0, 3)
		.map((q) => ({ slug: q.slug, title: q.title, date: q.date, description: q.description, cover: q.cover, readingTime: q.readingTime }));
	return { post, newer: strip(posts[i - 1]), older: strip(posts[i + 1]), related };
}

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
	return { post, newer: strip(posts[i - 1]), older: strip(posts[i + 1]) };
}

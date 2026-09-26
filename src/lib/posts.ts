import matter from 'gray-matter';
import { marked } from 'marked';

export interface Post {
	slug: string;
	title: string;
	date: string;
	updated?: string;
	description: string;
	tags: string[];
	canonical?: string;
	cover?: string;
	poster?: string;
	video?: string;
	readingTime: number;
	html: string;
}

const SITE = 'https://panth.whiteloves.in';

const files = import.meta.glob('/src/posts/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

marked.setOptions({ gfm: true, breaks: false });

function build(): Post[] {
	const out: Post[] = [];
	for (const [path, raw] of Object.entries(files)) {
		const { data, content } = matter(raw);
		const slug = data.slug ?? path.split('/').pop()!.replace(/\.md$/, '');
		const iso = (d: unknown) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10));
		const words = content.split(/\s+/).length;
		out.push({
			slug,
			title: data.title,
			date: iso(data.date),
			updated: data.updated ? iso(data.updated) : undefined,
			description: data.description ?? '',
			tags: data.tags ?? [],
			canonical: data.canonical,
			cover: data.cover,
			poster: data.poster,
			video: data.video,
			readingTime: data.readingTime ?? Math.max(1, Math.round(words / 220)),
			html: marked.parse(content) as string
		});
	}
	return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const posts = build();
export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
export const absolute = (path: string) => (path.startsWith('http') ? path : SITE + path);
export { SITE };

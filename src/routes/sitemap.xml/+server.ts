import { posts, SITE } from '$lib/posts';

export const prerender = true;

export function GET() {
	const urls = [
		{ loc: `${SITE}/`, lastmod: posts[0]?.date, priority: '1.0' },
		{ loc: `${SITE}/blog`, lastmod: posts[0]?.date, priority: '0.9' },
		...posts.map((p) => ({ loc: `${SITE}/blog/${p.slug}`, lastmod: p.updated ?? p.date, priority: '0.8' }))
	];
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
	return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

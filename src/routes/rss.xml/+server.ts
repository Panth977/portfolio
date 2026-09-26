import { posts, SITE } from '$lib/posts';

export const prerender = true;

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);

export function GET() {
	const items = posts
		.map(
			(p) => `<item>
  <title>${esc(p.title)}</title>
  <link>${SITE}/blog/${p.slug}</link>
  <guid isPermaLink="true">${SITE}/blog/${p.slug}</guid>
  <pubDate>${new Date(p.date).toUTCString()}</pubDate>
  <description>${esc(p.description)}</description>
  ${p.tags.map((t) => `<category>${esc(t)}</category>`).join('')}
  <content:encoded><![CDATA[${p.html}]]></content:encoded>
</item>`
		)
		.join('\n');
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>Panth Patel</title>
  <link>${SITE}/blog</link>
  <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
  <description>Developer tooling, agent-driven pipelines, backend and platform engineering. Notes from building Envizom at Oizom.</description>
  <language>en</language>
  ${items}
</channel>
</rss>`;
	return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}

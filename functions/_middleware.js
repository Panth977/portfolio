// Host-based redirects. Pages `_redirects` only matches paths, not hosts, so
// this runs first for every request.
// - blogs.whiteloves.in (the decommissioned Hashnode blog) goes to the same post
//   on the portfolio blog.
// - panth.whiteloves.in (the old portfolio host, whiteloves.in is not being
//   renewed) goes to the same path on panth.vardayinitech.in.
const ORIGIN = 'https://panth.vardayinitech.in';
const OLD_BLOG_HOST = 'blogs.whiteloves.in';
const OLD_SITE_HOST = 'panth.whiteloves.in';
const FIXED = { '/': '/blog', '/archive': '/blog', '/members': '/blog', '/rss.xml': '/rss.xml', '/sitemap.xml': '/sitemap.xml', '/newsletter': '/blog' };

export async function onRequest({ request, next }) {
	const url = new URL(request.url);
	if (url.hostname === OLD_SITE_HOST) return Response.redirect(ORIGIN + url.pathname + url.search, 301);
	if (url.hostname !== OLD_BLOG_HOST) return next();
	const path = url.pathname.replace(/\/+$/, '') || '/';
	const target = FIXED[path] ?? '/blog' + path;
	return Response.redirect(ORIGIN + target, 301);
}

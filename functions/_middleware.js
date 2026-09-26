// Host-based redirects for the decommissioned Hashnode blog. Pages `_redirects`
// only matches paths, not hosts, so this runs first for every request and sends
// anything on blogs.whiteloves.in to the same post on the portfolio blog.
const OLD_HOST = 'blogs.whiteloves.in';
const NEW_ORIGIN = 'https://panth.whiteloves.in';
const FIXED = { '/': '/blog', '/archive': '/blog', '/members': '/blog', '/rss.xml': '/rss.xml', '/sitemap.xml': '/sitemap.xml', '/newsletter': '/blog' };

export async function onRequest({ request, next }) {
	const url = new URL(request.url);
	if (url.hostname !== OLD_HOST) return next();
	const path = url.pathname.replace(/\/+$/, '') || '/';
	const target = FIXED[path] ?? '/blog' + path;
	return Response.redirect(NEW_ORIGIN + target, 301);
}

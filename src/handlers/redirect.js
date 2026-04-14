/**
 * Handles /{slug} → redirect to original URL.
 * Also increments the click counter in KV.
 */
export async function handleRedirect(request, env) {
  const url = new URL(request.url);
  const slug = url.pathname.slice(1); // remove leading "/"

  if (!slug) {
    return new Response('Not found', { status: 404 });
  }

  const raw = await env.URLS.get(`link:${slug}`);
  if (!raw) {
    return new Response('Link not found or expired', { status: 404 });
  }

  const link = JSON.parse(raw);

  // Fire-and-forget click increment — do NOT await so bots can't exhaust KV write quota
  // by holding the worker open; the redirect still happens instantly.
  link.clicks = (link.clicks || 0) + 1;
  env.URLS.put(`link:${slug}`, JSON.stringify(link)); // intentionally no await

  return Response.redirect(link.url, 301);
}

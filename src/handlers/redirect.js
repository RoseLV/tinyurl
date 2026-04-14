/**
 * Handles /{slug} → redirect to original URL.
 * Also increments the click counter in D1.
 */
export async function handleRedirect(request, env, ctx) {
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

  if (link.expireAt && link.expireAt <= Date.now()) {
    await env.URLS.delete(`link:${slug}`);
    return new Response('Link not found or expired', { status: 404 });
  }

  // Atomic click increment via D1 — no lost updates under concurrency.
  const clickPromise = env.DB.prepare(
    'INSERT INTO clicks (slug, count) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET count = count + 1'
  ).bind(slug).run();

  if (ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil(clickPromise);
  } else {
    await clickPromise;
  }

  // 301 can be cached aggressively by browsers and break click tracking.
  // Also disable caching on the redirect response itself.
  return new Response(null, {
    status: 302,
    headers: {
      Location: link.url,
      'Cache-Control': 'no-store',
    },
  });
}

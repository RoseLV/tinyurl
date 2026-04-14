import { generateSlug } from '../utils/slug.js';
import { validateUrl } from '../utils/validate.js';

// ─── Helpers ──────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function checkAuth(request, env) {
  const header = request.headers.get('Authorization') || '';
  return header === `Bearer ${env.API_KEY}`;
}

const LIST_KEY = 'links:list';

async function getList(env) {
  const raw = await env.URLS.get(LIST_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveList(env, list) {
  await env.URLS.put(LIST_KEY, JSON.stringify(list));
}

// ─── Route handler ────────────────────────────────────────────

export async function handleApi(request, env) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  // ── POST /api/shorten ──────────────────────────────────────
  if (url.pathname === '/api/shorten' && request.method === 'POST') {
    if (!checkAuth(request, env)) return json({ error: 'Unauthorized' }, 401);

    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Invalid JSON body' }, 400); }

    const {
      url: longUrl,
      customSlug,
      expireAt,      // ISO date string e.g. "2025-06-01" — optional
      notifyEmail,   // email address for expiry reminder — optional
    } = body;

    if (!longUrl || !validateUrl(longUrl)) {
      return json({ error: 'Invalid or missing URL' }, 400);
    }

    // Validate expiry date if provided
    let expireTs = null;
    if (expireAt) {
      expireTs = new Date(expireAt).getTime();
      if (isNaN(expireTs) || expireTs <= Date.now()) {
        return json({ error: 'expireAt must be a future date' }, 400);
      }
    }

    // Determine slug
    let slug;
    if (customSlug) {
      if (!/^[a-zA-Z0-9_-]{1,20}$/.test(customSlug)) {
        return json({ error: 'Custom slug: 1-20 alphanumeric chars only' }, 400);
      }
      if (await env.URLS.get(`link:${customSlug}`)) {
        return json({ error: 'Slug already taken' }, 409);
      }
      slug = customSlug;
    } else {
      slug = generateSlug();
      let attempts = 0;
      while ((await env.URLS.get(`link:${slug}`)) && attempts < 10) {
        slug = generateSlug();
        attempts++;
      }
    }

    const linkData = {
      slug,
      url: longUrl,
      created: Date.now(),
      clicks: 0,
      ...(body.campaign && { campaign: body.campaign.trim() }),
      ...(body.channel  && { channel: body.channel }),
      ...(expireTs    && { expireAt: expireTs }),
      ...(notifyEmail && { notifyEmail }),
      notified: false,
    };

    // If expiry is set, also set KV TTL so the key auto-deletes
    const putOptions = expireTs
      ? { expiration: Math.floor(expireTs / 1000) }
      : {};

    await env.URLS.put(`link:${slug}`, JSON.stringify(linkData), putOptions);

    // Keep master list (no TTL on list entry — we clean on read)
    const list = await getList(env);
    list.unshift(slug);
    if (list.length > 200) list.pop();
    await saveList(env, list);

    const reqUrl = new URL(request.url);
    return json({
      slug,
      shortUrl: `${reqUrl.protocol}//${reqUrl.host}/${slug}`,
      originalUrl: longUrl,
      created: linkData.created,
      expireAt: expireTs || null,
    });
  }

  // ── POST /api/shorten/batch ────────────────────────────────
  if (url.pathname === '/api/shorten/batch' && request.method === 'POST') {
    if (!checkAuth(request, env)) return json({ error: 'Unauthorized' }, 401);

    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Invalid JSON body' }, 400); }

    const { url: baseUrl, campaign, channels, expireAt, notifyEmail } = body;

    if (!baseUrl || !validateUrl(baseUrl)) {
      return json({ error: 'Invalid or missing URL' }, 400);
    }
    if (!campaign || typeof campaign !== 'string' || !campaign.trim()) {
      return json({ error: 'Campaign name is required for batch creation' }, 400);
    }
    if (!Array.isArray(channels) || channels.length === 0) {
      return json({ error: 'At least one channel is required' }, 400);
    }
    if (channels.length > 50) {
      return json({ error: 'Maximum 50 channels per batch' }, 400);
    }

    let expireTs = null;
    if (expireAt) {
      expireTs = new Date(expireAt).getTime();
      if (isNaN(expireTs) || expireTs <= Date.now()) {
        return json({ error: 'expireAt must be a future date' }, 400);
      }
    }

    const putOptions = expireTs ? { expiration: Math.floor(expireTs / 1000) } : {};
    const list = await getList(env);
    const reqUrl = new URL(request.url);
    const results = [];
    const campaignName = campaign.trim();

    for (const ch of channels) {
      // Build URL with UTM params for this channel
      const parsed = new URL(baseUrl);
      ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(p => parsed.searchParams.delete(p));
      if (ch.source) parsed.searchParams.set('utm_source', ch.source);
      if (ch.medium) parsed.searchParams.set('utm_medium', ch.medium);
      parsed.searchParams.set('utm_campaign', campaignName);
      if (ch.content) parsed.searchParams.set('utm_content', ch.content);

      let slug = generateSlug();
      let attempts = 0;
      while ((await env.URLS.get(`link:${slug}`)) && attempts < 10) {
        slug = generateSlug();
        attempts++;
      }

      const linkData = {
        slug,
        url: parsed.toString(),
        created: Date.now(),
        clicks: 0,
        campaign: campaignName,
        channel: ch.label || '',
        ...(expireTs && { expireAt: expireTs }),
        ...(notifyEmail && { notifyEmail }),
        notified: false,
      };

      await env.URLS.put(`link:${slug}`, JSON.stringify(linkData), putOptions);
      list.unshift(slug);

      results.push({
        slug,
        shortUrl: `${reqUrl.protocol}//${reqUrl.host}/${slug}`,
        channel: ch.label || '',
        originalUrl: parsed.toString(),
        created: linkData.created,
        expireAt: expireTs || null,
      });
    }

    if (list.length > 200) list.length = 200;
    await saveList(env, list);

    return json({ campaign: campaignName, links: results });
  }

  // ── GET /api/links ─────────────────────────────────────────
  if (url.pathname === '/api/links' && request.method === 'GET') {
    if (!checkAuth(request, env)) return json({ error: 'Unauthorized' }, 401);

    const list = await getList(env);
    const links = (
      await Promise.all(
        list.map(async (s) => {
          const raw = await env.URLS.get(`link:${s}`);
          return raw ? JSON.parse(raw) : null;
        })
      )
    ).filter(Boolean);

    // Prune dead slugs from the list (expired KV entries return null)
    const aliveSlugs = links.map((l) => l.slug);
    if (aliveSlugs.length !== list.length) {
      await saveList(env, aliveSlugs);
    }

    // Merge click counts from D1
    if (aliveSlugs.length > 0) {
      const placeholders = aliveSlugs.map(() => '?').join(',');
      const { results } = await env.DB.prepare(
        `SELECT slug, count FROM clicks WHERE slug IN (${placeholders})`
      ).bind(...aliveSlugs).all();
      const countMap = Object.fromEntries(results.map((r) => [r.slug, r.count]));
      for (const link of links) {
        link.clicks = countMap[link.slug] || 0;
      }
    }

    return json(links);
  }

  // ── DELETE /api/links/:slug ────────────────────────────────
  const deleteMatch = url.pathname.match(/^\/api\/links\/([a-zA-Z0-9_-]+)$/);
  if (deleteMatch && request.method === 'DELETE') {
    if (!checkAuth(request, env)) return json({ error: 'Unauthorized' }, 401);

    const slug = deleteMatch[1];
    await Promise.all([
      env.URLS.delete(`link:${slug}`),
      env.DB.prepare('DELETE FROM clicks WHERE slug = ?').bind(slug).run(),
    ]);

    const list = await getList(env);
    await saveList(env, list.filter((s) => s !== slug));

    return json({ success: true });
  }

  return json({ error: 'Not found' }, 404);
}

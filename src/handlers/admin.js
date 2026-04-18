// ─── Admin (tenant management) endpoints ──────────────────────
//
// Bootstrap auth: uses env.API_KEY as the admin key until the full
// multi-tenant auth migration lands (see MULTI_TENANT_PLAN.md §0, §5).
//
// Data model (matches MULTI_TENANT_PLAN.md §1):
//   tenant:{id}                              → tenant JSON
//   apikey:{sha256(apiKey + KEY_PEPPER)}     → tenantId
//
// Scope of this MVP:
//   - GET    /api/tenants        list tenants (no hashes, no keys)
//   - POST   /api/tenants        create tenant, returns apiKey ONCE
//   - DELETE /api/tenants/:id    delete tenant + revoke all its keys

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

function checkAdminAuth(request, env) {
  const header = request.headers.get('Authorization') || '';
  return header === `Bearer ${env.API_KEY}`;
}

async function sha256Hex(input) {
  const buf = new TextEncoder().encode(input);
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashApiKey(env, apiKey) {
  const pepper = env.KEY_PEPPER || '';
  return sha256Hex(apiKey + pepper);
}

function generateApiKey(tenantId) {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  const rand = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `utq_${tenantId}_${rand}`;
}

function validateTenantId(id) {
  return typeof id === 'string' && /^[a-z0-9_-]{2,32}$/.test(id);
}

function sanitizeTenant(t) {
  // Strip hashes before returning to client
  const { apiKeyHashes, ...rest } = t;
  return { ...rest, keyCount: (apiKeyHashes || []).length };
}

async function listTenants(env) {
  const out = [];
  let cursor;
  do {
    const page = await env.URLS.list({ prefix: 'tenant:', cursor });
    for (const k of page.keys) {
      const raw = await env.URLS.get(k.name);
      if (raw) {
        try { out.push(JSON.parse(raw)); } catch { /* skip corrupt */ }
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return out;
}

// ─── Route handler ────────────────────────────────────────────

export async function handleAdmin(request, env) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  if (!checkAdminAuth(request, env)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // ── GET /api/tenants ───────────────────────────────────────
  if (url.pathname === '/api/tenants' && request.method === 'GET') {
    const tenants = await listTenants(env);
    tenants.sort((a, b) => (b.created || 0) - (a.created || 0));
    return json({ tenants: tenants.map(sanitizeTenant) });
  }

  // ── POST /api/tenants ──────────────────────────────────────
  if (url.pathname === '/api/tenants' && request.method === 'POST') {
    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Invalid JSON body' }, 400); }

    const { id, name, role = 'owner', contact, quota } = body;

    if (!validateTenantId(id)) {
      return json({ error: 'id must be 2-32 chars of [a-z0-9_-]' }, 400);
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return json({ error: 'name is required' }, 400);
    }
    if (role !== 'admin' && role !== 'owner') {
      return json({ error: 'role must be "admin" or "owner"' }, 400);
    }

    if (await env.URLS.get(`tenant:${id}`)) {
      return json({ error: 'Tenant id already exists' }, 409);
    }

    const maxLinks = Number.isInteger(quota?.maxLinks) && quota.maxLinks > 0
      ? quota.maxLinks : 200;
    const maxLinksPerDay = Number.isInteger(quota?.maxLinksPerDay) && quota.maxLinksPerDay > 0
      ? quota.maxLinksPerDay : 30;

    const apiKey = generateApiKey(id);
    const hash = await hashApiKey(env, apiKey);

    const tenant = {
      id,
      name: name.trim(),
      role,
      apiKeyHashes: [hash],
      created: Date.now(),
      ...(role === 'owner' && { quota: { maxLinks, maxLinksPerDay } }),
      ...(contact && typeof contact === 'string' && { contact: contact.trim() }),
    };

    await Promise.all([
      env.URLS.put(`tenant:${id}`, JSON.stringify(tenant)),
      env.URLS.put(`apikey:${hash}`, id),
    ]);

    // Return apiKey ONCE — server only stores the hash
    return json({
      tenant: sanitizeTenant(tenant),
      apiKey,
      notice: 'Store this apiKey now — it will never be shown again.',
    });
  }

  // ── DELETE /api/tenants/:id ────────────────────────────────
  const deleteMatch = url.pathname.match(/^\/api\/tenants\/([a-z0-9_-]+)$/);
  if (deleteMatch && request.method === 'DELETE') {
    const id = deleteMatch[1];
    const raw = await env.URLS.get(`tenant:${id}`);
    if (!raw) return json({ error: 'Not found' }, 404);

    const tenant = JSON.parse(raw);
    const hashes = tenant.apiKeyHashes || [];

    await Promise.all([
      env.URLS.delete(`tenant:${id}`),
      ...hashes.map((h) => env.URLS.delete(`apikey:${h}`)),
    ]);

    return json({ success: true, revokedKeys: hashes.length });
  }

  return json({ error: 'Not found' }, 404);
}

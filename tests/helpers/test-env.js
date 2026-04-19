class MockKV {
  constructor(initial = {}) {
    this.store = new Map();
    this.putCalls = [];
    this.deleteCalls = [];

    for (const [key, value] of Object.entries(initial)) {
      if (value && typeof value === 'object' && 'value' in value) {
        this.store.set(key, {
          value: value.value,
          expiration: value.expiration ?? null,
        });
        continue;
      }

      this.store.set(key, { value, expiration: null });
    }
  }

  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiration != null && entry.expiration <= Math.floor(Date.now() / 1000)) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async put(key, value, options = {}) {
    this.store.set(key, {
      value,
      expiration: options.expiration ?? null,
    });
    this.putCalls.push({ key, value, options });
  }

  async delete(key) {
    this.store.delete(key);
    this.deleteCalls.push(key);
  }

  getJson(key) {
    const entry = this.store.get(key);
    return entry ? JSON.parse(entry.value) : null;
  }
}

class MockDB {
  constructor({ clickCounts = {} } = {}) {
    this.clicks = new Map(Object.entries(clickCounts));
  }

  prepare(sql) {
    return {
      bind: (...params) => ({
        run: async () => this.#run(sql, params),
        first: async () => this.#first(sql, params),
        all: async () => this.#all(sql, params),
      }),
    };
  }

  getCount(slug) {
    return this.clicks.get(slug) ?? 0;
  }

  async #run(sql, params) {
    const normalized = normalizeSql(sql);

    if (normalized.startsWith('INSERT INTO clicks')) {
      const [slug, increment = 1] = params;
      const next = (this.clicks.get(slug) ?? 0) + increment;
      this.clicks.set(slug, next);
      return { success: true };
    }

    if (normalized.startsWith('DELETE FROM clicks WHERE slug = ?')) {
      this.clicks.delete(params[0]);
      return { success: true };
    }

    throw new Error(`Unsupported DB run query: ${sql}`);
  }

  async #first(sql, params) {
    const normalized = normalizeSql(sql);

    if (normalized.startsWith('SELECT count FROM clicks WHERE slug = ?')) {
      const count = this.clicks.get(params[0]);
      return count == null ? null : { count };
    }

    throw new Error(`Unsupported DB first query: ${sql}`);
  }

  async #all(sql, params) {
    const normalized = normalizeSql(sql);

    if (normalized.startsWith('SELECT slug, count FROM clicks WHERE slug IN (')) {
      const results = params
        .filter((slug) => this.clicks.has(slug))
        .map((slug) => ({ slug, count: this.clicks.get(slug) }));
      return { results };
    }

    throw new Error(`Unsupported DB all query: ${sql}`);
  }
}

function normalizeSql(sql) {
  return sql.replace(/\s+/g, ' ').trim();
}

export function createEnv({
  apiKey = 'test-api-key',
  kv = {},
  clickCounts = {},
  resendApiKey = '',
  notifyFrom = '',
  baseUrl = 'https://urlteq.com',
} = {}) {
  return {
    API_KEY: apiKey,
    RESEND_API_KEY: resendApiKey,
    NOTIFY_FROM: notifyFrom,
    BASE_URL: baseUrl,
    URLS: new MockKV(kv),
    DB: new MockDB({ clickCounts }),
  };
}

export function createJsonRequest(
  url,
  {
    method = 'POST',
    auth,
    body,
    headers = {},
  } = {}
) {
  const requestHeaders = new Headers(headers);

  if (auth) {
    requestHeaders.set('Authorization', `Bearer ${auth}`);
  }

  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  return new Request(url, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function readJson(response) {
  return response.json();
}

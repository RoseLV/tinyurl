import assert from 'node:assert/strict';
import test from 'node:test';

import { handleRedirect } from '../src/handlers/redirect.js';
import { createEnv } from './helpers/test-env.js';

test('GET /:slug redirects and increments the click counter through waitUntil', async () => {
  const env = createEnv({
    kv: {
      'link:demo': JSON.stringify({
        slug: 'demo',
        url: 'https://example.com/demo',
        created: 1710000000000,
        notified: false,
      }),
    },
  });
  const pending = [];
  const ctx = {
    waitUntil(promise) {
      pending.push(promise);
    },
  };

  const response = await handleRedirect(new Request('https://urlteq.com/demo'), env, ctx);
  await Promise.all(pending);

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('Location'), 'https://example.com/demo');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(env.DB.getCount('demo'), 1);
});

test('GET /:slug deletes expired links instead of redirecting', async () => {
  const env = createEnv({
    kv: {
      'link:expired': JSON.stringify({
        slug: 'expired',
        url: 'https://example.com/expired',
        created: 1710000000000,
        expireAt: Date.now() - 10_000,
        notified: false,
      }),
    },
  });

  const response = await handleRedirect(new Request('https://urlteq.com/expired'), env);

  assert.equal(response.status, 404);
  assert.equal(await response.text(), 'Link not found or expired');
  assert.equal(await env.URLS.get('link:expired'), null);
  assert.equal(env.DB.getCount('expired'), 0);
});


import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';

import { handleCron } from '../src/handlers/cron.js';
import { createEnv } from './helpers/test-env.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('cron sends one reminder for links expiring within 24 hours and marks them notified', async () => {
  const now = Date.now();
  const env = createEnv({
    resendApiKey: 'resend-key',
    notifyFrom: 'noreply@urlteq.com',
    kv: {
      'links:list': JSON.stringify(['due-soon', 'already-notified', 'later']),
      'link:due-soon': JSON.stringify({
        slug: 'due-soon',
        url: 'https://example.com/due',
        created: 1710000000000,
        expireAt: now + 60 * 60 * 1000,
        notifyEmail: 'owner@example.com',
        notified: false,
      }),
      'link:already-notified': JSON.stringify({
        slug: 'already-notified',
        url: 'https://example.com/done',
        created: 1710000000000,
        expireAt: now + 60 * 60 * 1000,
        notifyEmail: 'owner@example.com',
        notified: true,
      }),
      'link:later': JSON.stringify({
        slug: 'later',
        url: 'https://example.com/later',
        created: 1710000000000,
        expireAt: now + 48 * 60 * 60 * 1000,
        notifyEmail: 'owner@example.com',
        notified: false,
      }),
    },
    clickCounts: {
      'due-soon': 3,
    },
  });

  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url, init });
    return new Response(null, { status: 202 });
  };

  await handleCron(env);

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://api.resend.com/emails');

  const body = JSON.parse(requests[0].init.body);
  assert.deepEqual(body.to, ['owner@example.com']);
  assert.match(body.subject, /due-soon/);
  assert.match(body.html, /Clicks so far: <strong>3<\/strong>/);

  assert.equal(env.URLS.getJson('link:due-soon').notified, true);
  assert.equal(env.URLS.getJson('link:already-notified').notified, true);
  assert.equal(env.URLS.getJson('link:later').notified, false);
});

test('cron exits early when resend is not configured', async () => {
  const env = createEnv({
    kv: {
      'links:list': JSON.stringify(['due-soon']),
      'link:due-soon': JSON.stringify({
        slug: 'due-soon',
        url: 'https://example.com/due',
        created: 1710000000000,
        expireAt: Date.now() + 60 * 60 * 1000,
        notifyEmail: 'owner@example.com',
        notified: false,
      }),
    },
  });
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response(null, { status: 202 });
  };

  await handleCron(env);

  assert.equal(called, false);
  assert.equal(env.URLS.getJson('link:due-soon').notified, false);
});

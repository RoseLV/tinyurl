import assert from 'node:assert/strict';
import test from 'node:test';

import { handleApi } from '../src/handlers/api.js';
import { createEnv, createJsonRequest, readJson } from './helpers/test-env.js';

test('POST /api/shorten rejects unauthorized requests', async () => {
  const env = createEnv();
  const request = createJsonRequest('https://urlteq.com/api/shorten', {
    body: { url: 'https://example.com' },
  });

  const response = await handleApi(request, env);

  assert.equal(response.status, 401);
  assert.deepEqual(await readJson(response), { error: 'Unauthorized' });
});

test('POST /api/shorten stores the link and appends it to the master list', async () => {
  const env = createEnv();
  const request = createJsonRequest('https://urlteq.com/api/shorten', {
    auth: env.API_KEY,
    body: {
      url: 'https://example.com/product',
      customSlug: 'launch-2026',
      campaign: 'spring-launch',
      channel: 'wechat',
      notifyEmail: 'ops@example.com',
      expireAt: '2099-06-01',
    },
  });

  const response = await handleApi(request, env);
  const payload = await readJson(response);

  assert.equal(response.status, 200);
  assert.equal(payload.slug, 'launch-2026');
  assert.equal(payload.shortUrl, 'https://urlteq.com/launch-2026');

  assert.deepEqual(env.URLS.getJson('link:launch-2026'), {
    slug: 'launch-2026',
    url: 'https://example.com/product',
    created: payload.created,
    clicks: 0,
    campaign: 'spring-launch',
    channel: 'wechat',
    expireAt: new Date('2099-06-01').getTime(),
    notifyEmail: 'ops@example.com',
    notified: false,
  });
  assert.deepEqual(JSON.parse(await env.URLS.get('links:list')), ['launch-2026']);
});

test('POST /api/shorten/batch creates one link per channel with cleaned UTM params', async () => {
  const env = createEnv();
  const request = createJsonRequest('https://urlteq.com/api/shorten/batch', {
    auth: env.API_KEY,
    body: {
      url: 'https://example.com/signup?utm_source=old&utm_campaign=stale',
      campaign: 'summer-push',
      channels: [
        { label: 'WeChat', source: 'wechat', medium: 'social', content: 'hero' },
        { label: 'Email', source: 'email', medium: 'newsletter' },
      ],
    },
  });

  const response = await handleApi(request, env);
  const payload = await readJson(response);

  assert.equal(response.status, 200);
  assert.equal(payload.campaign, 'summer-push');
  assert.equal(payload.links.length, 2);
  assert.equal(JSON.parse(await env.URLS.get('links:list')).length, 2);

  const wechatUrl = new URL(payload.links[0].originalUrl);
  assert.equal(wechatUrl.searchParams.get('utm_source'), 'wechat');
  assert.equal(wechatUrl.searchParams.get('utm_medium'), 'social');
  assert.equal(wechatUrl.searchParams.get('utm_campaign'), 'summer-push');
  assert.equal(wechatUrl.searchParams.get('utm_content'), 'hero');

  const emailUrl = new URL(payload.links[1].originalUrl);
  assert.equal(emailUrl.searchParams.get('utm_source'), 'email');
  assert.equal(emailUrl.searchParams.get('utm_medium'), 'newsletter');
  assert.equal(emailUrl.searchParams.get('utm_campaign'), 'summer-push');
  assert.equal(emailUrl.searchParams.get('utm_content'), null);
});

test('GET /api/links merges D1 counts and prunes stale slugs from the list', async () => {
  const env = createEnv({
    kv: {
      'links:list': JSON.stringify(['alive', 'missing']),
      'link:alive': JSON.stringify({
        slug: 'alive',
        url: 'https://example.com/alive',
        created: 1710000000000,
        clicks: 0,
        notified: false,
      }),
    },
    clickCounts: {
      alive: 7,
    },
  });
  const request = createJsonRequest('https://urlteq.com/api/links', {
    method: 'GET',
    auth: env.API_KEY,
  });

  const response = await handleApi(request, env);
  const payload = await readJson(response);

  assert.equal(response.status, 200);
  assert.deepEqual(payload, [
    {
      slug: 'alive',
      url: 'https://example.com/alive',
      created: 1710000000000,
      clicks: 7,
      notified: false,
    },
  ]);
  assert.deepEqual(JSON.parse(await env.URLS.get('links:list')), ['alive']);
});

test('DELETE /api/links/:slug removes KV state, click count, and list membership', async () => {
  const env = createEnv({
    kv: {
      'links:list': JSON.stringify(['keep', 'remove-me']),
      'link:remove-me': JSON.stringify({
        slug: 'remove-me',
        url: 'https://example.com/remove',
        created: 1710000000000,
        clicks: 0,
        notified: false,
      }),
    },
    clickCounts: {
      'remove-me': 5,
    },
  });
  const request = createJsonRequest('https://urlteq.com/api/links/remove-me', {
    method: 'DELETE',
    auth: env.API_KEY,
  });

  const response = await handleApi(request, env);

  assert.equal(response.status, 200);
  assert.deepEqual(await readJson(response), { success: true });
  assert.equal(await env.URLS.get('link:remove-me'), null);
  assert.equal(env.DB.getCount('remove-me'), 0);
  assert.deepEqual(JSON.parse(await env.URLS.get('links:list')), ['keep']);
});


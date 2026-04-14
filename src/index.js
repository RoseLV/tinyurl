import { handleRedirect } from './handlers/redirect.js';
import { handleApi }      from './handlers/api.js';
import { handleCron }     from './handlers/cron.js';
import { getHtml }        from './frontend/index.js';

export default {
  // ── HTTP requests ─────────────────────────────────────────
  async fetch(request, env, ctx) {
    const url  = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith('/api/')) return handleApi(request, env);

    if (path === '/' || path === '') {
      return new Response(getHtml(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return handleRedirect(request, env, ctx);
  },

  // ── Cron trigger (daily expiry reminders) ─────────────────
  async scheduled(_event, env) {
    await handleCron(env);
  },
};

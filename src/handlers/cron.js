/**
 * Cron handler — runs daily at 09:00 UTC (configured in wrangler.toml).
 * Scans all links and sends Resend email reminders for links expiring
 * within the next 24 hours that haven't been notified yet.
 */
export async function handleCron(env) {
  if (!env.RESEND_API_KEY) {
    console.log('[cron] RESEND_API_KEY not set — skipping email reminders');
    return;
  }

  const raw = await env.URLS.get('links:list');
  if (!raw) return;

  const slugs = JSON.parse(raw);
  const now = Date.now();
  const in24h = now + 24 * 60 * 60 * 1000;

  for (const slug of slugs) {
    const linkRaw = await env.URLS.get(`link:${slug}`);
    if (!linkRaw) continue;

    const link = JSON.parse(linkRaw);

    // Only process links that have expiry + email + haven't been notified
    if (!link.expireAt || !link.notifyEmail || link.notified) continue;

    // Send reminder if expiry is within next 24 hours
    if (link.expireAt > now && link.expireAt <= in24h) {
      const sent = await sendExpiryEmail(env, link);
      if (sent) {
        link.notified = true;
        await env.URLS.put(`link:${slug}`, JSON.stringify(link), {
          expiration: Math.floor(link.expireAt / 1000),
        });
        console.log(`[cron] Sent expiry reminder for /${slug} → ${link.notifyEmail}`);
      }
    }
  }
}

// ─── Resend email helper ──────────────────────────────────────

async function sendExpiryEmail(env, link) {
  const baseUrl  = env.BASE_URL || 'https://urlteq.com';
  const shortUrl = `${baseUrl}/${link.slug}`;
  const expireDate = new Date(link.expireAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = `
    <div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
      <div style="font-size:22px;font-weight:800;margin-bottom:24px;">
        URL<span style="color:#52C99B">teq</span>
      </div>
      <p style="font-size:16px;color:#1F2937;margin-bottom:8px;">
        Your short link is expiring soon.
      </p>
      <p style="font-size:14px;color:#6B7280;margin-bottom:24px;">
        The following link will stop working on <strong>${expireDate}</strong>:
      </p>
      <div style="background:#E9F8F1;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <div style="font-size:18px;font-weight:800;color:#2A9B72;">${shortUrl}</div>
        <div style="font-size:12px;color:#6B7280;margin-top:6px;word-break:break-all;">
          → ${link.url.slice(0, 80)}${link.url.length > 80 ? '…' : ''}
        </div>
      </div>
      <p style="font-size:13px;color:#6B7280;">
        Clicks so far: <strong>${link.clicks || 0}</strong>
      </p>
      <hr style="border:none;border-top:1px solid #EAECEF;margin:24px 0;" />
      <p style="font-size:12px;color:#B0B7C3;">
        You received this because you set a notification email for this link.
        Visit <a href="${baseUrl}" style="color:#52C99B;">${baseUrl}</a> to manage your links.
      </p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.NOTIFY_FROM || 'noreply@urlteq.com',
        to: [link.notifyEmail],
        subject: `Your link /${link.slug} expires tomorrow — URLteq`,
        html,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error('[cron] Resend error:', e.message);
    return false;
  }
}

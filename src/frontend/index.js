export function getHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>URLteq — Smart Link Shortener</title>
  <style>
    :root {
      --g-bg:     #E9F8F1;
      --g-accent: #52C99B;
      --g-dark:   #2A9B72;
      --p-bg:     #FEF0EE;
      --p-accent: #F08080;
      --p-dark:   #C95B55;
      --white:    #FFFFFF;
      --gray-100: #F8F9FA;
      --gray-200: #EAECEF;
      --gray-400: #B0B7C3;
      --gray-600: #6B7280;
      --gray-800: #1F2937;
      --radius:   18px;
      --radius-sm:10px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--white);
      color: var(--gray-800);
      min-height: 100vh;
    }

    /* ── Header ─────────────────────────────── */
    header {
      padding: 18px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--gray-200);
    }
    .logo { font-size: 20px; font-weight: 800; letter-spacing: -.5px; }
    .logo em { font-style: normal; color: var(--g-accent); }
    .btn-ghost {
      background: none;
      border: 1.5px solid var(--gray-200);
      padding: 6px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      color: var(--gray-600);
    }
    .btn-ghost:hover { border-color: var(--gray-400); }

    /* ── Main ───────────────────────────────── */
    main { max-width: 980px; margin: 0 auto; padding: 48px 24px 80px; }

    .hero { text-align: center; margin-bottom: 44px; }
    .hero h1 {
      font-size: 36px; font-weight: 800;
      letter-spacing: -1px; line-height: 1.2;
      margin-bottom: 12px;
    }
    .hero p { font-size: 15px; color: var(--gray-600); }
    .ag { color: var(--g-accent); }
    .ap { color: var(--p-accent); }

    /* ── Grid ───────────────────────────────── */
    .grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 20px;
      align-items: start;
    }
    .card { padding: 28px; border-radius: var(--radius); }
    .card-green { background: var(--g-bg); }
    .card-pink  { background: var(--p-bg); }

    .card-num {
      font-size: 11px; font-weight: 700;
      letter-spacing: 2px; text-transform: uppercase;
      margin-bottom: 6px;
    }
    .card-green .card-num { color: var(--g-accent); }
    .card-pink  .card-num { color: var(--p-accent); }

    .card h2 { font-size: 20px; font-weight: 800; margin-bottom: 18px; letter-spacing: -.3px; }
    .card-green h2 { color: var(--g-dark); }
    .card-pink  h2 { color: var(--p-dark); }

    /* ── Input shared ───────────────────────── */
    .field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
    .field label {
      font-size: 10px; font-weight: 700;
      letter-spacing: .8px; text-transform: uppercase;
      color: var(--gray-600);
    }
    .inp {
      width: 100%;
      padding: 11px 14px;
      border: 2px solid transparent;
      border-radius: var(--radius-sm);
      font-size: 14px;
      background: var(--white);
      outline: none;
      transition: border-color .2s, box-shadow .2s;
      color: var(--gray-800);
    }
    .inp::placeholder { color: var(--gray-400); }
    .card-green .inp:focus { border-color: var(--g-accent); box-shadow: 0 0 0 3px rgba(82,201,155,.1); }
    .card-pink  .inp:focus { border-color: var(--p-accent); box-shadow: 0 0 0 3px rgba(240,128,128,.1); }

    /* ── UTM section ────────────────────────── */
    .collapsible {
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      transition: max-height .35s ease, opacity .25s ease;
    }
    .collapsible.open { max-height: 800px; opacity: 1; }

    .notice {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 13px;
      background: var(--white);
      border-radius: 8px;
      font-size: 13px; font-weight: 500;
      margin-bottom: 12px;
    }
    .card-green .notice { color: var(--g-dark); }
    .card-pink  .notice { color: var(--p-dark); }
    .pulse { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; animation: pulse 2s infinite; }
    .card-green .pulse { background: var(--g-accent); }
    .card-pink  .pulse  { background: var(--p-accent); }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

    .section-label {
      font-size: 10px; font-weight: 700;
      letter-spacing: .8px; text-transform: uppercase;
      color: var(--gray-600); margin: 12px 0 8px;
    }

    /* Chips */
    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .chip {
      padding: 5px 12px; border-radius: 20px;
      font-size: 12px; font-weight: 600;
      cursor: pointer; border: 1.5px solid transparent;
      background: var(--white); transition: all .15s;
      user-select: none;
    }
    .card-green .chip { color: var(--g-dark);  border-color: var(--g-accent); }
    .card-green .chip:hover  { background: rgba(82,201,155,.15); }
    .card-green .chip.active { background: var(--g-accent); color: var(--white); }
    .card-pink  .chip { color: var(--p-dark);  border-color: var(--p-accent); }
    .card-pink  .chip:hover  { background: rgba(240,128,128,.12); }
    .card-pink  .chip.active { background: var(--p-accent); color: var(--white); }

    /* 2-col UTM fields */
    .fields-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .fields-2 .span2 { grid-column: 1 / -1; }

    /* Divider */
    .divider {
      border: none; border-top: 1px solid rgba(0,0,0,.08);
      margin: 14px 0;
    }

    /* ── Buttons ────────────────────────────── */
    .btn {
      width: 100%; padding: 12px;
      border: none; border-radius: var(--radius-sm);
      font-size: 14px; font-weight: 700;
      cursor: pointer; margin-top: 14px;
      transition: opacity .2s, transform .1s;
    }
    .btn:hover  { opacity: .88; }
    .btn:active { transform: scale(.99); }
    .card-green .btn { background: var(--g-accent); color: var(--white); }
    .card-pink  .btn { background: var(--p-accent); color: var(--white); }

    /* ── Result ─────────────────────────────── */
    .result {
      display: none;
      margin-top: 14px; padding: 16px;
      background: var(--white); border-radius: var(--radius-sm);
    }
    .result.show { display: block; }
    .short-link {
      font-size: 18px; font-weight: 800;
      letter-spacing: -.3px; margin-bottom: 10px;
      word-break: break-all;
    }
    .card-green .short-link { color: var(--g-dark); }
    .result-row { display: flex; gap: 8px; margin-bottom: 12px; }
    .btn-sm {
      padding: 7px 14px; border-radius: 8px;
      font-size: 12px; font-weight: 700;
      cursor: pointer; border: none;
    }
    .btn-sm:hover { opacity: .8; }
    .card-green .btn-copy { background: var(--g-bg); color: var(--g-dark); }
    .btn-dl { background: var(--gray-200); color: var(--gray-800); }
    .qr-wrap { display: flex; justify-content: center; padding: 4px 0; }

    /* ── History ────────────────────────────── */
    .history { display: flex; flex-direction: column; gap: 2px; }
    .hitem {
      padding: 11px 8px; border-radius: 10px;
      transition: background .15s;
    }
    .hitem:hover { background: rgba(192,90,85,.06); }
    .hitem-top {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 2px;
    }
    .hslug {
      font-size: 14px; font-weight: 800;
      color: var(--p-dark); text-decoration: none;
    }
    .hslug:hover { text-decoration: underline; }
    .hmeta { font-size: 11px; color: var(--gray-400); }
    .hurl {
      font-size: 11px; color: var(--gray-400);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      max-width: 100%; margin-bottom: 5px;
    }
    .hbot { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .badge {
      font-size: 11px; font-weight: 700;
      padding: 2px 8px; border-radius: 10px;
    }
    .badge-click { background: var(--p-bg); color: var(--p-dark); }
    .badge-expiry { background: #FFF3CD; color: #856404; }
    .badge-expired { background: #F8D7DA; color: #842029; }
    .btn-del {
      background: none; border: none; cursor: pointer;
      font-size: 11px; color: var(--gray-400);
      transition: color .15s; padding: 0;
    }
    .btn-del:hover { color: var(--p-dark); }
    .empty { font-size: 13px; color: var(--p-accent); opacity: .7; }

    /* ── Auth modal ─────────────────────────── */
    .overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.35);
      backdrop-filter: blur(3px);
      display: flex; align-items: center; justify-content: center;
      z-index: 999;
    }
    .modal {
      background: var(--white);
      padding: 36px 32px; border-radius: var(--radius);
      width: 380px; box-shadow: 0 4px 32px rgba(0,0,0,.12);
    }
    .modal h3 { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
    .modal p  { font-size: 13px; color: var(--gray-600); margin-bottom: 20px; }
    .modal .inp { margin-bottom: 10px; }
    .modal-btn {
      width: 100%; padding: 13px;
      background: var(--g-accent); color: var(--white);
      border: none; border-radius: var(--radius-sm);
      font-size: 14px; font-weight: 700; cursor: pointer;
    }
    .modal-btn:hover { opacity: .88; }

    @media (max-width: 680px) {
      .grid { grid-template-columns: 1fr; }
      header { padding: 14px 18px; }
      main { padding: 28px 16px 60px; }
      .hero h1 { font-size: 26px; }
      .fields-2 { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

<!-- Auth modal -->
<div class="overlay" id="authModal">
  <div class="modal">
    <h3>🔑 API Key</h3>
    <p>Enter your API key to access URLteq.</p>
    <input class="inp" type="password" id="apiKeyInput" placeholder="Enter API key…" />
    <button class="modal-btn" onclick="saveKey()">Continue →</button>
  </div>
</div>

<!-- Header -->
<header>
  <div class="logo">URL<em>teq</em></div>
  <button class="btn-ghost" onclick="showKeyModal()">Change Key</button>
</header>

<main>
  <div class="hero">
    <h1>Short Links · <span class="ag">UTM Tracking</span><br/>QR Codes · <span class="ap">Expiry Reminders</span></h1>
    <p>Paste a URL, set campaign params, expiry date — get a short link and QR code instantly.</p>
  </div>

  <div class="grid">

    <!-- ── LEFT: Shorten form ── -->
    <div class="card card-green">
      <div class="card-num">01</div>
      <h2>Shorten &amp; Track</h2>

      <!-- URL -->
      <div class="field">
        <label>Destination URL *</label>
        <input class="inp" type="url" id="urlInput"
          placeholder="Paste your landing page URL here…"
          oninput="onUrl()" onpaste="setTimeout(onUrl,30)" />
      </div>

      <!-- Custom slug (optional) -->
      <div class="field">
        <label>Custom short code (optional)</label>
        <input class="inp" type="text" id="customSlug"
          placeholder="e.g. summer-sale  (leave blank to auto-generate)" />
      </div>

      <!-- UTM section -->
      <div class="collapsible" id="utmSection">
        <div class="notice">
          <div class="pulse"></div>
          <span id="utmNotice">No UTM params detected — add campaign tracking below.</span>
        </div>

        <div class="section-label">Channel preset — select one (none by default)</div>
        <div class="chips" id="chips"></div>

        <div class="fields-2">
          <div class="field">
            <label>Source *</label>
            <input class="inp" type="text" id="utm_source" placeholder="e.g. google" oninput="clearChips()" />
          </div>
          <div class="field">
            <label>Medium *</label>
            <input class="inp" type="text" id="utm_medium" placeholder="e.g. cpc" oninput="clearChips()" />
          </div>
          <div class="field span2">
            <label>Campaign</label>
            <input class="inp" type="text" id="utm_campaign" placeholder="e.g. spring_promo_2025" />
          </div>
          <div class="field">
            <label>Content</label>
            <input class="inp" type="text" id="utm_content" placeholder="e.g. banner_a" />
          </div>
          <div class="field">
            <label>Term</label>
            <input class="inp" type="text" id="utm_term" placeholder="e.g. running+shoes" />
          </div>
        </div>
      </div>

      <hr class="divider" />

      <!-- Expiry + email -->
      <div class="fields-2">
        <div class="field">
          <label>Expiry date (optional)</label>
          <input class="inp" type="date" id="expireAt" />
        </div>
        <div class="field">
          <label>Remind email (optional)</label>
          <input class="inp" type="email" id="notifyEmail" placeholder="you@example.com" />
        </div>
      </div>

      <button class="btn" id="genBtn" onclick="doShorten()">Generate Short Link →</button>

      <!-- Result -->
      <div class="result" id="result">
        <div class="short-link" id="shortDisplay"></div>
        <div class="result-row">
          <button class="btn-sm btn-copy" onclick="copyLink(event)">Copy Link</button>
          <button class="btn-sm btn-dl"   onclick="downloadQR()">Download QR</button>
        </div>
        <div class="qr-wrap" id="qrWrap"></div>
      </div>
    </div>

    <!-- ── RIGHT: History ── -->
    <div class="card card-pink">
      <div class="card-num">02</div>
      <h2>Recent Links</h2>
      <div class="history" id="history">
        <p class="empty">Your recently created links will appear here.</p>
      </div>
      <button class="btn" onclick="loadLinks()" style="margin-top:18px;">Refresh ↻</button>
    </div>

  </div>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

<script>
// ── UTM Presets ───────────────────────────────────────────────
const PRESETS = [
  // China
  {l:'微信公众号', s:'wechat',       m:'social'},
  {l:'小红书',     s:'xiaohongshu',  m:'social'},
  {l:'抖音',       s:'douyin',       m:'video'},
  {l:'微博',       s:'weibo',        m:'social'},
  {l:'知乎',       s:'zhihu',        m:'social'},
  {l:'B站',        s:'bilibili',     m:'video'},
  // Global social
  {l:'Instagram',  s:'instagram',    m:'social'},
  {l:'TikTok',     s:'tiktok',       m:'video'},
  {l:'Facebook',   s:'facebook',     m:'social'},
  {l:'Twitter/X',  s:'twitter',      m:'social'},
  {l:'LinkedIn',   s:'linkedin',     m:'social'},
  {l:'Reddit',     s:'reddit',       m:'social'},
  {l:'YouTube',    s:'youtube',      m:'video'},
  {l:'Pinterest',  s:'pinterest',    m:'social'},
  {l:'Threads',    s:'threads',      m:'social'},
  {l:'Snapchat',   s:'snapchat',     m:'social'},
  // Paid
  {l:'Google Ads', s:'google',       m:'cpc'},
  {l:'Meta Ads',   s:'meta',         m:'cpc'},
  // Other
  {l:'邮件营销',   s:'email',        m:'email'},
  {l:'线下物料',   s:'offline',      m:'qrcode'},
];

// ── State ─────────────────────────────────────────────────────
let apiKey        = localStorage.getItem('urlteq_key') || '';
let currentShort  = '';
let activeChip    = null;

// ── Boot ──────────────────────────────────────────────────────
function boot() {
  renderChips();
  // Set min date for expiry picker to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('expireAt').min = tomorrow.toISOString().split('T')[0];

  if (apiKey) {
    document.getElementById('authModal').style.display = 'none';
    loadLinks();
  }
}

// ── Auth ──────────────────────────────────────────────────────
function saveKey() {
  const v = document.getElementById('apiKeyInput').value.trim();
  if (!v) return;
  apiKey = v;
  localStorage.setItem('urlteq_key', v);
  document.getElementById('authModal').style.display = 'none';
  loadLinks();
}
function showKeyModal() {
  document.getElementById('apiKeyInput').value = '';
  document.getElementById('authModal').style.display = 'flex';
}
document.getElementById('apiKeyInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') saveKey();
});

// ── Chip render ───────────────────────────────────────────────
function renderChips() {
  const c = document.getElementById('chips');
  PRESETS.forEach(p => {
    const el = document.createElement('div');
    el.className = 'chip';
    el.textContent = p.l;
    el.onclick = () => selectChip(el, p);
    c.appendChild(el);
  });
}
function selectChip(el, p) {
  if (activeChip === el) {
    el.classList.remove('active');
    activeChip = null;
    document.getElementById('utm_source').value = '';
    document.getElementById('utm_medium').value = '';
    return;
  }
  if (activeChip) activeChip.classList.remove('active');
  el.classList.add('active');
  activeChip = el;
  document.getElementById('utm_source').value = p.s;
  document.getElementById('utm_medium').value = p.m;
}
function clearChips() {
  if (activeChip) { activeChip.classList.remove('active'); activeChip = null; }
}

// ── URL input → detect UTM ────────────────────────────────────
function onUrl() {
  const raw = document.getElementById('urlInput').value.trim();
  const sec = document.getElementById('utmSection');
  if (!raw) { sec.classList.remove('open'); return; }
  let parsed;
  try { parsed = new URL(raw); } catch { sec.classList.remove('open'); return; }

  const hasUtm = parsed.searchParams.has('utm_source');
  if (hasUtm) {
    document.getElementById('utm_source').value   = parsed.searchParams.get('utm_source')   || '';
    document.getElementById('utm_medium').value   = parsed.searchParams.get('utm_medium')   || '';
    document.getElementById('utm_campaign').value = parsed.searchParams.get('utm_campaign') || '';
    document.getElementById('utm_content').value  = parsed.searchParams.get('utm_content')  || '';
    document.getElementById('utm_term').value     = parsed.searchParams.get('utm_term')     || '';
    document.getElementById('utmNotice').textContent = '✓ UTM params detected and pre-filled.';
  } else {
    document.getElementById('utmNotice').textContent = 'No UTM params detected — add campaign tracking below.';
  }
  sec.classList.add('open');
}

// ── Build final URL with UTM ──────────────────────────────────
function buildUrl() {
  const parsed = new URL(document.getElementById('urlInput').value.trim());
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(f => {
    const v = document.getElementById(f).value.trim();
    if (v) parsed.searchParams.set(f, v);
    else   parsed.searchParams.delete(f);
  });
  return parsed.toString();
}

// ── Shorten ───────────────────────────────────────────────────
async function doShorten() {
  let finalUrl;
  try { finalUrl = buildUrl(); } catch { alert('Please enter a valid URL.'); return; }

  const btn = document.getElementById('genBtn');
  btn.textContent = 'Generating…'; btn.disabled = true;

  const body = { url: finalUrl };
  const slug = document.getElementById('customSlug').value.trim();
  if (slug) body.customSlug = slug;
  const exp = document.getElementById('expireAt').value;
  if (exp) body.expireAt = exp;
  const email = document.getElementById('notifyEmail').value.trim();
  if (email) body.notifyEmail = email;

  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify(body),
    });
    if (res.status === 401) { showKeyModal(); return; }
    const data = await res.json();
    if (data.error) { alert('Error: ' + data.error); return; }
    currentShort = data.shortUrl;
    showResult(data.shortUrl);
    loadLinks();
  } catch(e) {
    alert('Request failed: ' + e.message);
  } finally {
    btn.textContent = 'Generate Short Link →'; btn.disabled = false;
  }
}

// ── Show result + QR ──────────────────────────────────────────
function showResult(shortUrl) {
  document.getElementById('shortDisplay').textContent = shortUrl;
  document.getElementById('result').classList.add('show');
  const wrap = document.getElementById('qrWrap');
  wrap.innerHTML = '';
  new QRCode(wrap, {
    text: shortUrl, width: 160, height: 160,
    colorDark: '#2A9B72', colorLight: '#FFFFFF',
    correctLevel: QRCode.CorrectLevel.M,
  });
}
function copyLink(e) {
  navigator.clipboard.writeText(currentShort).then(() => {
    e.target.textContent = '✓ Copied!';
    setTimeout(() => e.target.textContent = 'Copy Link', 2000);
  });
}
function downloadQR() {
  const c = document.querySelector('#qrWrap canvas');
  if (!c) { alert('Generate a link first.'); return; }
  const a = document.createElement('a');
  a.download = 'urlteq-qr.png'; a.href = c.toDataURL(); a.click();
}

// ── History ───────────────────────────────────────────────────
async function loadLinks() {
  if (!apiKey) return;
  try {
    const res = await fetch('/api/links', {
      headers: { 'Authorization': 'Bearer ' + apiKey },
    });
    if (!res.ok) return;
    render(await res.json());
  } catch {}
}

function render(links) {
  const el = document.getElementById('history');
  if (!links.length) {
    el.innerHTML = '<p class="empty">No links yet — create your first one!</p>';
    return;
  }
  const origin = window.location.origin;
  const now    = Date.now();

  el.innerHTML = links.slice(0, 15).map(lk => {
    const date = new Date(lk.created).toLocaleDateString('en-US', { month:'short', day:'numeric' });
    const urlTrim = lk.url.length > 52 ? lk.url.slice(0,52)+'…' : lk.url;

    let expiryBadge = '';
    if (lk.expireAt) {
      const diff = lk.expireAt - now;
      const days = Math.ceil(diff / 86400000);
      if (diff < 0) {
        expiryBadge = '<span class="badge badge-expired">Expired</span>';
      } else if (days <= 3) {
        expiryBadge = '<span class="badge badge-expiry">Expires in ' + days + 'd</span>';
      } else {
        const d = new Date(lk.expireAt).toLocaleDateString('en-US',{month:'short',day:'numeric'});
        expiryBadge = '<span class="badge badge-expiry">Exp ' + d + '</span>';
      }
    }

    return \`<div class="hitem">
      <div class="hitem-top">
        <a class="hslug" href="\${origin}/\${lk.slug}" target="_blank">/\${lk.slug}</a>
        <span class="hmeta">\${date}</span>
      </div>
      <div class="hurl" title="\${lk.url}">\${urlTrim}</div>
      <div class="hbot">
        <span class="badge badge-click">\${lk.clicks||0} clicks</span>
        \${expiryBadge}
        <button class="btn-del" onclick="del('\${lk.slug}')">Delete</button>
      </div>
    </div>\`;
  }).join('');
}

async function del(slug) {
  if (!confirm('Delete /' + slug + '?')) return;
  await fetch('/api/links/' + slug, {
    method: 'DELETE', headers: { 'Authorization': 'Bearer ' + apiKey },
  });
  loadLinks();
}

boot();
</script>
</body>
</html>`;
}

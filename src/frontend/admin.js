export function getAdminHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>URLteq — Admin</title>
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

    header {
      padding: 18px 40px;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid var(--gray-200);
    }
    .logo { font-size: 20px; font-weight: 800; letter-spacing: -.5px; }
    .logo em { font-style: normal; color: var(--g-accent); }
    .logo .tag {
      font-size: 11px; font-weight: 700; letter-spacing: 2px;
      text-transform: uppercase; color: var(--p-accent); margin-left: 10px;
    }
    .btn-ghost {
      background: none; border: 1.5px solid var(--gray-200);
      padding: 6px 16px; border-radius: 8px; cursor: pointer;
      font-size: 12px; color: var(--gray-600);
    }
    .btn-ghost:hover { border-color: var(--gray-400); }

    main { max-width: 1040px; margin: 0 auto; padding: 40px 24px 80px; }

    .hero { text-align: center; margin-bottom: 36px; }
    .hero h1 {
      font-size: 30px; font-weight: 800;
      letter-spacing: -1px; line-height: 1.2; margin-bottom: 8px;
    }
    .hero p { font-size: 14px; color: var(--gray-600); }

    .grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 20px; align-items: start; }
    .card { padding: 26px; border-radius: var(--radius); }
    .card-green { background: var(--g-bg); }
    .card-pink  { background: var(--p-bg); }
    .card-num {
      font-size: 11px; font-weight: 700;
      letter-spacing: 2px; text-transform: uppercase;
      margin-bottom: 6px;
    }
    .card-green .card-num { color: var(--g-accent); }
    .card-pink  .card-num { color: var(--p-accent); }
    .card h2 { font-size: 20px; font-weight: 800; margin-bottom: 16px; letter-spacing: -.3px; }
    .card-green h2 { color: var(--g-dark); }
    .card-pink  h2 { color: var(--p-dark); }

    .field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
    .field label {
      font-size: 10px; font-weight: 700;
      letter-spacing: .8px; text-transform: uppercase; color: var(--gray-600);
    }
    .inp {
      width: 100%; padding: 11px 14px;
      border: 2px solid transparent; border-radius: var(--radius-sm);
      font-size: 14px; background: var(--white); outline: none;
      transition: border-color .2s, box-shadow .2s; color: var(--gray-800);
    }
    .inp::placeholder { color: var(--gray-400); }
    .card-green .inp:focus { border-color: var(--g-accent); box-shadow: 0 0 0 3px rgba(82,201,155,.1); }
    .card-pink  .inp:focus { border-color: var(--p-accent); box-shadow: 0 0 0 3px rgba(240,128,128,.1); }

    .fields-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .fields-2 .span2 { grid-column: 1 / -1; }

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

    .divider { border: none; border-top: 1px solid rgba(0,0,0,.08); margin: 14px 0; }

    /* Auth modal */
    .overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.45); z-index: 100;
      display: none; align-items: center; justify-content: center;
    }
    .overlay.show { display: flex; }
    .modal {
      background: var(--white); padding: 32px; border-radius: var(--radius);
      max-width: 420px; width: calc(100% - 32px);
    }
    .modal h3 { font-size: 20px; margin-bottom: 10px; }
    .modal p  { font-size: 13px; color: var(--gray-600); margin-bottom: 16px; line-height: 1.5; }
    .modal-btn {
      width: 100%; padding: 12px; margin-top: 12px;
      background: var(--g-accent); color: var(--white);
      border: none; border-radius: var(--radius-sm);
      font-size: 14px; font-weight: 700; cursor: pointer;
    }
    .modal-btn:hover { opacity: .88; }

    /* Tenant table */
    .tenant-row {
      background: var(--white); border-radius: var(--radius-sm);
      padding: 14px 16px; margin-bottom: 8px;
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
    }
    .tenant-meta { flex: 1; min-width: 0; }
    .tenant-name {
      font-size: 15px; font-weight: 700; color: var(--gray-800);
      margin-bottom: 2px;
    }
    .tenant-id {
      font-size: 12px; color: var(--gray-600); font-family: monospace;
    }
    .tenant-badges {
      display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;
    }
    .badge {
      font-size: 10px; font-weight: 700; letter-spacing: .5px;
      text-transform: uppercase; padding: 3px 8px;
      border-radius: 6px;
    }
    .badge-admin { background: rgba(240,128,128,.15); color: var(--p-dark); }
    .badge-owner { background: rgba(82,201,155,.18); color: var(--g-dark); }
    .badge-neutral { background: var(--gray-200); color: var(--gray-600); }
    .btn-del {
      padding: 7px 14px; border-radius: 8px;
      font-size: 12px; font-weight: 700; cursor: pointer;
      background: var(--gray-200); color: var(--p-dark); border: none;
    }
    .btn-del:hover { background: var(--p-bg); }
    .empty { font-size: 13px; color: var(--gray-600); padding: 10px 0; }

    /* New-key reveal */
    .key-reveal {
      background: var(--white); border-radius: var(--radius-sm);
      padding: 14px; margin-top: 12px;
      border: 2px dashed var(--p-accent);
    }
    .key-reveal .section-label {
      font-size: 10px; font-weight: 700; letter-spacing: .8px;
      text-transform: uppercase; color: var(--p-dark); margin-bottom: 6px;
    }
    .key-value {
      font-family: monospace; font-size: 13px; font-weight: 700;
      color: var(--gray-800); word-break: break-all; margin-bottom: 8px;
    }
    .key-hint { font-size: 12px; color: var(--gray-600); }
    .btn-copy {
      padding: 6px 12px; border-radius: 8px; border: none;
      background: var(--p-bg); color: var(--p-dark);
      font-size: 12px; font-weight: 700; cursor: pointer;
    }

    .error-msg { font-size: 13px; color: var(--p-dark); margin-top: 8px; display: none; }
    .error-msg.show { display: block; }

    @media (max-width: 720px) {
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

<!-- Auth modal -->
<div class="overlay" id="authModal">
  <div class="modal">
    <h3>Admin Key</h3>
    <p>This page manages tenant accounts. Enter the platform admin key
    (the <code>API_KEY</code> secret from your Worker) to continue.<br><br>
    The key is stored locally in this browser only.</p>
    <div class="error-msg" id="authError">Incorrect admin key.</div>
    <input class="inp" type="password" id="adminKeyInput" placeholder="Enter admin key…" />
    <button class="modal-btn" onclick="saveKey()">Continue</button>
  </div>
</div>

<header>
  <div class="logo">URL<em>teq</em><span class="tag">Admin</span></div>
  <div>
    <a class="btn-ghost" href="/" style="text-decoration:none;margin-right:8px;">Dashboard</a>
    <button class="btn-ghost" onclick="showKeyModal()">Change Key</button>
  </div>
</header>

<main>
  <div class="hero">
    <h1>Tenant Management</h1>
    <p>Create and manage tenant accounts. API keys are shown only once on creation.</p>
  </div>

  <div class="grid">

    <!-- ── LEFT: Create tenant form ── -->
    <div class="card card-green">
      <div class="card-num">01</div>
      <h2>Create Tenant</h2>

      <div class="field">
        <label>Tenant ID *</label>
        <input class="inp" type="text" id="tId"
          placeholder="e.g. acme  (a-z, 0-9, _ -)"/>
      </div>
      <div class="field">
        <label>Display Name *</label>
        <input class="inp" type="text" id="tName" placeholder="e.g. Acme Corp" />
      </div>
      <div class="field">
        <label>Role</label>
        <select class="inp" id="tRole">
          <option value="owner">owner — creates/manages its own links</option>
          <option value="admin">admin — manages tenant records only</option>
        </select>
      </div>
      <div class="fields-2">
        <div class="field">
          <label>Max Links</label>
          <input class="inp" type="number" id="tMaxLinks" value="200" min="1" />
        </div>
        <div class="field">
          <label>Max / Day</label>
          <input class="inp" type="number" id="tMaxDay" value="30" min="1" />
        </div>
      </div>
      <div class="field">
        <label>Contact email (optional)</label>
        <input class="inp" type="email" id="tContact" placeholder="ops@acme.com" />
      </div>

      <button class="btn" onclick="doCreate()">Create Tenant</button>

      <div class="error-msg" id="createError"></div>
      <div class="key-reveal" id="keyReveal" style="display:none;">
        <div class="section-label">API key (shown once)</div>
        <div class="key-value" id="keyValue"></div>
        <button class="btn-copy" onclick="copyKey()">Copy</button>
        <div class="key-hint" style="margin-top:8px;">
          Server stored only its hash — closing this dismisses the key forever.
        </div>
      </div>
    </div>

    <!-- ── RIGHT: Tenant list ── -->
    <div class="card card-pink">
      <div class="card-num">02</div>
      <h2>Tenants</h2>
      <div id="tenantList">
        <p class="empty">Loading…</p>
      </div>
      <button class="btn" onclick="loadTenants()" style="margin-top:14px;">Refresh</button>
    </div>

  </div>
</main>

<script>
var adminKey = localStorage.getItem('urlteq_admin_key') || '';

function showKeyModal() {
  document.getElementById('authError').classList.remove('show');
  document.getElementById('adminKeyInput').value = adminKey;
  document.getElementById('authModal').classList.add('show');
  setTimeout(function(){ document.getElementById('adminKeyInput').focus(); }, 50);
}
function hideKeyModal() {
  document.getElementById('authModal').classList.remove('show');
}
function saveKey() {
  var v = document.getElementById('adminKeyInput').value.trim();
  if (!v) return;
  adminKey = v;
  localStorage.setItem('urlteq_admin_key', v);
  hideKeyModal();
  loadTenants();
}

async function api(method, path, body) {
  var opts = {
    method: method,
    headers: {
      'Authorization': 'Bearer ' + adminKey,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  var r = await fetch(path, opts);
  var data;
  try { data = await r.json(); } catch { data = {}; }
  return { ok: r.ok, status: r.status, data: data };
}

async function loadTenants() {
  var list = document.getElementById('tenantList');
  if (!adminKey) { list.innerHTML = '<p class="empty">Enter admin key to load tenants.</p>'; return; }
  list.innerHTML = '<p class="empty">Loading…</p>';

  var res = await api('GET', '/api/tenants');
  if (res.status === 401) {
    showKeyModal();
    document.getElementById('authError').classList.add('show');
    list.innerHTML = '<p class="empty">Unauthorized.</p>';
    return;
  }
  if (!res.ok) {
    list.innerHTML = '<p class="empty">Error: ' + escapeHtml(res.data.error || 'unknown') + '</p>';
    return;
  }

  var tenants = res.data.tenants || [];
  if (tenants.length === 0) {
    list.innerHTML = '<p class="empty">No tenants yet. Create one on the left.</p>';
    return;
  }

  list.innerHTML = tenants.map(function(t) {
    var quotaBadge = t.quota
      ? '<span class="badge badge-neutral">quota ' + t.quota.maxLinks + ' / ' + t.quota.maxLinksPerDay + 'd</span>'
      : '';
    var roleBadge = t.role === 'admin'
      ? '<span class="badge badge-admin">admin</span>'
      : '<span class="badge badge-owner">owner</span>';
    var keyBadge = '<span class="badge badge-neutral">' + (t.keyCount || 0) + ' key' + ((t.keyCount||0)===1?'':'s') + '</span>';
    var contact = t.contact ? '<div class="tenant-id">' + escapeHtml(t.contact) + '</div>' : '';
    return (
      '<div class="tenant-row">' +
        '<div class="tenant-meta">' +
          '<div class="tenant-name">' + escapeHtml(t.name || t.id) + '</div>' +
          '<div class="tenant-id">' + escapeHtml(t.id) + '</div>' +
          contact +
          '<div class="tenant-badges">' + roleBadge + keyBadge + quotaBadge + '</div>' +
        '</div>' +
        '<button class="btn-del" onclick="doDelete(\\'' + t.id + '\\')">Delete</button>' +
      '</div>'
    );
  }).join('');
}

async function doCreate() {
  var err = document.getElementById('createError');
  err.classList.remove('show'); err.textContent = '';

  var id   = document.getElementById('tId').value.trim();
  var name = document.getElementById('tName').value.trim();
  var role = document.getElementById('tRole').value;
  var maxLinks = parseInt(document.getElementById('tMaxLinks').value, 10);
  var maxDay   = parseInt(document.getElementById('tMaxDay').value, 10);
  var contact  = document.getElementById('tContact').value.trim();

  if (!id || !name) {
    err.textContent = 'Tenant ID and display name are required.';
    err.classList.add('show'); return;
  }

  var body = {
    id: id, name: name, role: role,
    quota: { maxLinks: maxLinks, maxLinksPerDay: maxDay },
  };
  if (contact) body.contact = contact;

  var res = await api('POST', '/api/tenants', body);
  if (res.status === 401) { showKeyModal(); return; }
  if (!res.ok) {
    err.textContent = res.data.error || ('Error ' + res.status);
    err.classList.add('show');
    return;
  }

  // Reveal once-visible key
  document.getElementById('keyValue').textContent = res.data.apiKey;
  document.getElementById('keyReveal').style.display = 'block';

  // Reset form
  document.getElementById('tId').value = '';
  document.getElementById('tName').value = '';
  document.getElementById('tContact').value = '';

  loadTenants();
}

async function doDelete(id) {
  if (!confirm('Delete tenant "' + id + '"?\\n\\nThis revokes all its API keys. Link data in KV/D1 is not touched.')) return;
  var res = await api('DELETE', '/api/tenants/' + encodeURIComponent(id));
  if (res.status === 401) { showKeyModal(); return; }
  if (!res.ok) {
    alert('Delete failed: ' + (res.data.error || res.status));
    return;
  }
  loadTenants();
}

function copyKey() {
  var v = document.getElementById('keyValue').textContent;
  navigator.clipboard.writeText(v).then(function(){
    var btn = event.target;
    var prev = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(function(){ btn.textContent = prev; }, 1200);
  });
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Bootstrap
if (adminKey) {
  loadTenants();
} else {
  showKeyModal();
}

document.getElementById('adminKeyInput').addEventListener('keydown', function(e){
  if (e.key === 'Enter') saveKey();
});
</script>

</body>
</html>`;
}

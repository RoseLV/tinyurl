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

    /* ── Collapsible section ─────────────────── */
    .collapsible {
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      transition: max-height .35s ease, opacity .25s ease;
    }
    .collapsible.open { max-height: 2000px; opacity: 1; }

    .section-label {
      font-size: 10px; font-weight: 700;
      letter-spacing: .8px; text-transform: uppercase;
      color: var(--gray-600); margin: 12px 0 8px;
    }

    /* Chips (multi-select) */
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

    /* 2-col fields */
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
    .qr-palette {
      margin-top: 14px; padding: 14px;
      background: rgba(255,255,255,.65);
      border-radius: var(--radius-sm);
    }
    .qr-palette .section-label { margin: 0 0 8px; }
    .qr-palette-top {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; margin-bottom: 10px;
    }
    .qr-current-label {
      font-size: 12px; font-weight: 700; color: var(--g-dark);
    }
    .qr-current-value {
      font-size: 12px; font-weight: 800; color: var(--g-dark);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .qr-swatches { display: flex; flex-wrap: wrap; gap: 8px; }
    .qr-swatch {
      width: 28px; height: 28px; border-radius: 999px;
      border: 2px solid transparent; cursor: pointer;
      box-shadow: inset 0 0 0 1px rgba(0,0,0,.08);
      transition: transform .12s, border-color .12s, box-shadow .12s;
    }
    .qr-swatch:hover { transform: translateY(-1px); }
    .qr-swatch.active {
      border-color: var(--g-dark);
      box-shadow: inset 0 0 0 2px rgba(255,255,255,.8);
    }
    .qr-custom {
      display: flex; align-items: center; gap: 8px;
      margin-top: 12px;
    }
    .qr-custom-label {
      font-size: 12px; font-weight: 700; color: var(--g-dark);
    }
    .qr-color-input {
      width: 44px; height: 32px; padding: 0; cursor: pointer;
      border: none; background: transparent;
    }

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

    /* ── Add channel row ───────────────────── */
    .add-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .add-inp { flex: 1 !important; }
    .btn-add {
      width: 42px; flex-shrink: 0; border-radius: var(--radius-sm);
      border: 2px solid var(--g-accent); background: var(--white);
      color: var(--g-accent); font-size: 20px; font-weight: 700;
      cursor: pointer; transition: background .15s;
    }
    .btn-add:hover { background: var(--g-bg); }

    /* ── Tags (removable) ──────────────────── */
    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .tag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 8px 4px 10px; border-radius: 14px;
      font-size: 12px; font-weight: 600;
      background: var(--g-accent); color: var(--white);
    }
    .tag-x { cursor: pointer; font-size: 14px; opacity: .7; line-height: 1; }
    .tag-x:hover { opacity: 1; }
    .sel-summary {
      font-size: 12px; font-weight: 600; color: var(--g-dark);
      margin: 6px 0; line-height: 1.4;
    }

    /* ── Batch result ──────────────────────── */
    .batch-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 10px;
    }
    .batch-item { padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,.06); }
    .batch-item:last-child { border-bottom: none; }
    .batch-item-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .batch-channel {
      font-size: 11px; font-weight: 700; color: var(--g-dark);
      background: rgba(82,201,155,.15); padding: 2px 8px; border-radius: 8px;
    }
    .batch-url {
      font-size: 14px; font-weight: 800; color: var(--g-dark);
      flex: 1; word-break: break-all;
    }
    .batch-qr { display: none; padding: 8px 0; justify-content: center; }
    .batch-qr.show { display: flex; }

    /* ── Campaign groups (history) ──────────── */
    .campaign-group { margin-bottom: 12px; }
    .campaign-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px; border-radius: 8px; cursor: pointer;
      background: rgba(192,90,85,.06); margin-bottom: 2px;
    }
    .campaign-header:hover { background: rgba(192,90,85,.10); }
    .campaign-name { font-size: 14px; font-weight: 800; color: var(--p-dark); }
    .campaign-meta { font-size: 11px; color: var(--gray-400); }
    .campaign-links.collapsed { display: none; }
    .ch-item { padding: 2px 0 6px; }
    .ch-link {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 8px 5px 16px; font-size: 13px;
    }
    .ch-label {
      font-size: 11px; font-weight: 600; color: var(--gray-600);
      background: var(--gray-100); padding: 1px 6px; border-radius: 6px;
      white-space: nowrap;
    }
    .ch-slug { color: var(--p-dark); font-weight: 700; text-decoration: none; }
    .ch-slug:hover { text-decoration: underline; }
    .ch-clicks { font-size: 11px; color: var(--p-accent); font-weight: 700; margin-left: auto; }
    .btn-link {
      background: none; border: none; cursor: pointer;
      font-size: 11px; font-weight: 700; color: var(--p-accent);
      padding: 0;
    }
    .btn-link:hover { color: var(--p-dark); }
    .history-qr {
      display: none; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 4px 8px 6px 16px;
    }
    .history-qr.show { display: flex; }
    .history-qr-code {
      display: flex; align-items: center; justify-content: center;
      min-width: 136px; min-height: 136px;
      background: var(--white); border-radius: 12px; padding: 8px;
      box-shadow: inset 0 0 0 1px rgba(0,0,0,.05);
    }

    /* ── Poster & Copy Template ────────────── */
    .poster-upload-area {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 10px;
    }
    .poster-upload-area label.btn-upload {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: var(--radius-sm);
      background: var(--white); border: 2px dashed var(--g-accent);
      color: var(--g-dark); font-size: 12px; font-weight: 700;
      cursor: pointer; transition: background .15s;
      text-transform: none; letter-spacing: 0;
    }
    .poster-upload-area label.btn-upload:hover { background: var(--g-bg); }
    .poster-upload-area .poster-preview {
      width: 48px; height: 68px; border-radius: 6px;
      object-fit: cover; border: 1px solid var(--gray-200);
      display: none;
    }
    .poster-upload-area .poster-filename {
      font-size: 12px; color: var(--gray-600); flex: 1;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .copy-template {
      width: 100%; min-height: 100px; max-height: 200px;
      padding: 11px 14px; border: 2px solid transparent;
      border-radius: var(--radius-sm); font-size: 13px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--white); outline: none; resize: vertical;
      transition: border-color .2s, box-shadow .2s;
      color: var(--gray-800); line-height: 1.5;
    }
    .copy-template:focus { border-color: var(--g-accent); box-shadow: 0 0 0 3px rgba(82,201,155,.1); }
    .copy-template::placeholder { color: var(--gray-400); }
    .tpl-hint {
      font-size: 11px; color: var(--gray-400); margin-top: 2px;
    }

    /* ── Poster + Copy result cards ────────── */
    .poster-results {
      display: none; margin-top: 16px;
    }
    .poster-results.show { display: block; }
    .poster-results-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px;
    }
    .poster-results-header h3 {
      font-size: 16px; font-weight: 800; color: var(--g-dark);
    }
    .poster-card {
      background: var(--white); border-radius: var(--radius-sm);
      padding: 14px; margin-bottom: 10px;
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
    }
    .poster-card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 10px;
    }
    .poster-card-channel {
      font-size: 12px; font-weight: 700; color: var(--g-dark);
      background: rgba(82,201,155,.15); padding: 3px 10px; border-radius: 8px;
    }
    .poster-card-link {
      font-size: 12px; font-weight: 700; color: var(--gray-600);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .poster-card-body { display: flex; gap: 14px; }
    .poster-card-img-wrap {
      flex-shrink: 0; width: 120px;
    }
    .poster-card-img-wrap img {
      width: 100%; border-radius: 6px;
      box-shadow: 0 1px 4px rgba(0,0,0,.1);
      cursor: pointer;
    }
    .poster-card-copy {
      flex: 1; min-width: 0;
    }
    .poster-card-copy pre {
      font-size: 11px; line-height: 1.5; white-space: pre-wrap;
      word-break: break-all; color: var(--gray-800);
      background: var(--gray-100); padding: 8px 10px;
      border-radius: 8px; max-height: 160px; overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
    }
    .poster-card-actions {
      display: flex; gap: 6px; margin-top: 8px;
    }
    .poster-card-actions .btn-sm { font-size: 11px; }
    .btn-green-sm {
      padding: 6px 12px; border-radius: 8px; font-size: 11px;
      font-weight: 700; cursor: pointer; border: none;
      background: var(--g-bg); color: var(--g-dark);
    }
    .btn-green-sm:hover { opacity: .8; }

    @media (max-width: 680px) {
      .poster-card-body { flex-direction: column; }
      .poster-card-img-wrap { width: 100%; max-width: 200px; }
    }
  </style>
</head>
<body>

<!-- Auth modal -->
<div class="overlay" id="authModal">
  <div class="modal">
    <h3>API Key</h3>
    <p>This app is private — only authorized users can create or manage links.<br><br>
    Enter the API key you configured when deploying URLteq.<br>
    Your key is stored locally in this browser and never sent anywhere except your own Worker.</p>
    <div id="authError" style="display:none;color:#C95B55;font-size:13px;margin-bottom:8px;">Incorrect API key. Please try again.</div>
    <input class="inp" type="password" id="apiKeyInput" placeholder="Enter API key…" />
    <button class="modal-btn" onclick="saveKey()">Continue</button>
  </div>
</div>

<!-- Header -->
<header>
  <div class="logo">URL<em>teq</em></div>
  <button class="btn-ghost" onclick="showKeyModal()">Change Key</button>
</header>

<main>
  <div class="hero">
    <h1>Short Links · <span class="ag">Multi-Channel UTM</span><br/>QR Codes · <span class="ap">Campaign Analytics</span></h1>
    <p>Create campaign-tracked short links for multiple channels at once.</p>
  </div>

  <div class="grid">

    <!-- ── LEFT: Shorten form ── -->
    <div class="card card-green">
      <div class="card-num">01</div>
      <h2>Shorten & Track</h2>

      <!-- URL -->
      <div class="field">
        <label>Destination URL *</label>
        <input class="inp" type="url" id="urlInput"
          placeholder="Paste your landing page URL here…"
          oninput="onUrl()" onpaste="setTimeout(onUrl,30)" />
      </div>

      <!-- Custom slug (single-link only) -->
      <div class="field" id="slugField">
        <label>Custom short code (optional, single-link only)</label>
        <input class="inp" type="text" id="customSlug"
          placeholder="e.g. summer-sale  (leave blank to auto-generate)" />
      </div>

      <!-- Channel section -->
      <div class="collapsible" id="channelSection">
        <div class="field">
          <label>Campaign Name</label>
          <input class="inp" type="text" id="campaignName"
            placeholder="e.g. openclaw-roundtable-3" />
        </div>

        <div class="section-label" style="cursor:pointer;user-select:none;" onclick="var t=document.getElementById('presetsWrap');t.classList.toggle('open');this.dataset.open=t.classList.contains('open')?'1':'0';this.querySelector('.toggle-arrow').textContent=t.classList.contains('open')?'▾':'▸'">
          <span class="toggle-arrow">▸</span> Channel presets (multi-select)
        </div>
        <div class="collapsible" id="presetsWrap">
          <div class="chips" id="chips"></div>
        </div>

        <hr class="divider" />

        <div class="section-label">Add WeChat Groups</div>
        <div class="add-row">
          <input class="inp add-inp" type="text" id="groupInput"
            placeholder="Enter group name, e.g. AI爱好者" />
          <button class="btn-add" onclick="addCustom('group')">+</button>
        </div>
        <div class="tags" id="groupTags"></div>

        <div class="section-label">Add WeChat Moments</div>
        <div class="add-row">
          <input class="inp add-inp" type="text" id="momentsInput"
            placeholder="Enter person name, e.g. Andrew" />
          <button class="btn-add" onclick="addCustom('moments')">+</button>
        </div>
        <div class="tags" id="momentsTags"></div>

        <div class="sel-summary" id="selSummary"></div>

        <hr class="divider" />

        <div class="section-label">Poster & Copy Template (optional)</div>
        <div class="poster-upload-area">
          <label class="btn-upload">
            Upload Poster
            <input type="file" accept="image/*" id="posterFile" onchange="onPosterUpload(this)" style="display:none" />
          </label>
          <img class="poster-preview" id="posterPreview" />
          <span class="poster-filename" id="posterFilename">No poster uploaded</span>
        </div>
        <div class="field">
          <label>Copywriting Template</label>
          <textarea class="copy-template" id="copyTemplate"
            placeholder="Paste your copy here, use ${'$'}{link} where the short link should go.&#10;&#10;Example:&#10;🚀 Event Title&#10;🔗 Register: ${'$'}{link}"></textarea>
          <div class="tpl-hint">Use <strong>${'$'}{link}</strong> as placeholder — it will be replaced with each channel's short link.</div>
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

      <button class="btn" id="genBtn" onclick="doShorten()">Generate Short Link</button>

      <div class="qr-palette">
        <div class="section-label">QR Palette</div>
        <div class="qr-palette-top">
          <span class="qr-current-label">Current QR color</span>
          <span class="qr-current-value" id="qrColorValue">#2A9B72</span>
        </div>
        <div class="qr-swatches" id="qrSwatches"></div>
        <div class="qr-custom">
          <label class="qr-custom-label" for="qrColorPicker">Custom</label>
          <input class="qr-color-input" type="color" id="qrColorPicker" value="#2A9B72" />
        </div>
      </div>

      <!-- Result (populated by JS) -->
      <div class="result" id="result"></div>

      <!-- Poster + Copy results (populated by JS) -->
      <div class="poster-results" id="posterResults"></div>
    </div>

    <!-- ── RIGHT: History ── -->
    <div class="card card-pink">
      <div class="card-num">02</div>
      <h2>Recent Links</h2>
      <div class="history" id="history">
        <p class="empty">Your recently created links will appear here.</p>
      </div>
      <button class="btn" onclick="loadLinks()" style="margin-top:18px;">Refresh</button>
    </div>

  </div>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

<script>
// ── UTM Presets ───────────────────────────────────────────────
var PRESETS = [
  {l:'微信公众号', s:'wechat',       m:'social'},
  {l:'小红书',     s:'xiaohongshu',  m:'social'},
  {l:'抖音',       s:'douyin',       m:'video'},
  {l:'微博',       s:'weibo',        m:'social'},
  {l:'知乎',       s:'zhihu',        m:'social'},
  {l:'B站',        s:'bilibili',     m:'video'},
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
  {l:'Google Ads', s:'google',       m:'cpc'},
  {l:'Meta Ads',   s:'meta',         m:'cpc'},
  {l:'邮件营销',   s:'email',        m:'email'},
  {l:'线下物料',   s:'offline',      m:'qrcode'},
];

var QR_PRESETS = ['#2A9B72', '#F08080', '#2563EB', '#0F172A', '#D97706', '#0F766E'];

// ── State ─────────────────────────────────────────────────────
var apiKey         = localStorage.getItem('urlteq_key') || '';
var selectedPresets = new Set();
var customGroups   = JSON.parse(localStorage.getItem('urlteq_groups') || '[]');
var customMoments  = JSON.parse(localStorage.getItem('urlteq_moments') || '[]');
var batchData      = null;
var currentShort   = '';
var qrColorDark    = normalizeHexColor(localStorage.getItem('urlteq_qr_color') || '#2A9B72');

// ── Boot ──────────────────────────────────────────────────────
function boot() {
  renderChips();
  renderQrSwatches();
  syncQrPalette();
  // Render persisted tags
  if (customGroups.length) renderTags('group');
  if (customMoments.length) renderTags('moments');
  updateSummary();
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('expireAt').min = tomorrow.toISOString().split('T')[0];

  document.getElementById('groupInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addCustom('group');
  });
  document.getElementById('momentsInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addCustom('moments');
  });
  document.getElementById('groupTags').addEventListener('click', function(e) {
    if (e.target.classList.contains('tag-x')) removeCustom('group', e.target.dataset.name);
  });
  document.getElementById('momentsTags').addEventListener('click', function(e) {
    if (e.target.classList.contains('tag-x')) removeCustom('moments', e.target.dataset.name);
  });
  document.getElementById('qrColorPicker').addEventListener('input', function(e) {
    setQrColor(e.target.value);
  });

  if (apiKey) {
    document.getElementById('authModal').style.display = 'none';
    loadLinks();
  }
}

function normalizeHexColor(value) {
  var color = (value || '').trim().toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(color)) return '#2A9B72';
  return color;
}

function renderQrSwatches() {
  var el = document.getElementById('qrSwatches');
  el.innerHTML = QR_PRESETS.map(function(color) {
    return '<button class="qr-swatch" type="button" data-color="' + color + '" style="background:' + color + ';" title="' + color + '" onclick="setQrColor(\\'' + color + '\\')"></button>';
  }).join('');
}

function syncQrPalette() {
  var color = normalizeHexColor(qrColorDark);
  document.getElementById('qrColorPicker').value = color;
  document.getElementById('qrColorValue').textContent = color;
  Array.prototype.forEach.call(document.querySelectorAll('.qr-swatch'), function(btn) {
    btn.classList.toggle('active', btn.dataset.color === color);
  });
}

function setQrColor(color) {
  qrColorDark = normalizeHexColor(color);
  localStorage.setItem('urlteq_qr_color', qrColorDark);
  syncQrPalette();
  rerenderExistingQrs();
}

// ── Auth ──────────────────────────────────────────────────────
function saveKey() {
  var v = document.getElementById('apiKeyInput').value.trim();
  if (!v) return;
  apiKey = v;
  localStorage.setItem('urlteq_key', v);
  document.getElementById('authModal').style.display = 'none';
  loadLinks();
}
function showKeyModal(showError) {
  document.getElementById('apiKeyInput').value = '';
  document.getElementById('authError').style.display = showError ? 'block' : 'none';
  document.getElementById('authModal').style.display = 'flex';
}
document.getElementById('apiKeyInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') saveKey();
});

// ── Chip render (multi-select) ───────────────────────────────
function renderChips() {
  var c = document.getElementById('chips');
  PRESETS.forEach(function(p, i) {
    var el = document.createElement('div');
    el.className = 'chip';
    el.textContent = p.l;
    el.onclick = function() { toggleChip(el, i); };
    c.appendChild(el);
  });
}
function toggleChip(el, idx) {
  if (selectedPresets.has(idx)) {
    selectedPresets.delete(idx);
    el.classList.remove('active');
  } else {
    selectedPresets.add(idx);
    el.classList.add('active');
  }
  updateSummary();
}

// ── Custom channels ──────────────────────────────────────────
function addCustom(type) {
  var inputId = type === 'group' ? 'groupInput' : 'momentsInput';
  var arr = type === 'group' ? customGroups : customMoments;
  var name = document.getElementById(inputId).value.trim().replace(/[<>"]/g, '');
  if (!name) return;
  if (arr.indexOf(name) !== -1) return;
  arr.push(name);
  document.getElementById(inputId).value = '';
  saveTags(type);
  renderTags(type);
  updateSummary();
}
function removeCustom(type, name) {
  var arr = type === 'group' ? customGroups : customMoments;
  var idx = arr.indexOf(name);
  if (idx !== -1) arr.splice(idx, 1);
  saveTags(type);
  renderTags(type);
  updateSummary();
}
function saveTags(type) {
  if (type === 'group') localStorage.setItem('urlteq_groups', JSON.stringify(customGroups));
  else localStorage.setItem('urlteq_moments', JSON.stringify(customMoments));
}
function renderTags(type) {
  var arr = type === 'group' ? customGroups : customMoments;
  var containerId = type === 'group' ? 'groupTags' : 'momentsTags';
  var prefix = type === 'group' ? '微信群' : '朋友圈';
  var el = document.getElementById(containerId);
  el.innerHTML = arr.map(function(name) {
    return '<div class="tag">' + prefix + '-' + name +
      '<span class="tag-x" data-name="' + name.replace(/"/g, '') + '">x</span></div>';
  }).join('');
}

// ── Channel aggregation ──────────────────────────────────────
function getChannels() {
  var channels = [];
  selectedPresets.forEach(function(idx) {
    var p = PRESETS[idx];
    channels.push({ label: p.l, source: p.s, medium: p.m, content: '' });
  });
  customGroups.forEach(function(name) {
    var safe = name.toLowerCase().replace(/[^a-z0-9\\u4e00-\\u9fff_-]/g, '_');
    channels.push({ label: '微信群-' + name, source: safe + '_group', medium: 'group', content: safe });
  });
  customMoments.forEach(function(name) {
    var safe = name.toLowerCase().replace(/[^a-z0-9\\u4e00-\\u9fff_-]/g, '_');
    channels.push({ label: '朋友圈-' + name, source: safe + '_moments', medium: 'moments', content: safe });
  });
  return channels;
}
function updateSummary() {
  var channels = getChannels();
  var n = channels.length;
  var btn = document.getElementById('genBtn');
  var summary = document.getElementById('selSummary');
  var slugField = document.getElementById('slugField');
  if (n === 0) {
    btn.textContent = 'Generate Short Link';
    summary.textContent = '';
    slugField.style.display = '';
  } else {
    btn.textContent = 'Generate ' + n + ' Short Links';
    summary.textContent = n + ' channels: ' + channels.map(function(c) { return c.label; }).join(', ');
    slugField.style.display = n > 1 ? 'none' : '';
  }
}

// ── URL input ────────────────────────────────────────────────
function onUrl() {
  var raw = document.getElementById('urlInput').value.trim();
  var sec = document.getElementById('channelSection');
  if (!raw) { sec.classList.remove('open'); return; }
  try { new URL(raw); } catch(e) { sec.classList.remove('open'); return; }
  sec.classList.add('open');
}

// ── Shorten ──────────────────────────────────────────────────
function doShorten() {
  var raw = document.getElementById('urlInput').value.trim();
  if (!raw) { alert('Please enter a URL.'); return; }
  try { new URL(raw); } catch(e) { alert('Please enter a valid URL.'); return; }

  var channels = getChannels();
  var btn = document.getElementById('genBtn');
  btn.disabled = true;
  btn.textContent = 'Generating...';

  var promise;
  if (channels.length === 0) {
    promise = doShortenSingle(raw);
  } else {
    promise = doShortenBatch(raw, channels);
  }
  promise.then(function() {
    loadLinks();
  }).catch(function(e) {
    if (e.message !== 'Unauthorized') alert('Error: ' + e.message);
  }).finally(function() {
    updateSummary();
    btn.disabled = false;
  });
}

function doShortenSingle(finalUrl) {
  var body = { url: finalUrl };
  var slug = document.getElementById('customSlug').value.trim();
  if (slug) body.customSlug = slug;
  var campaign = document.getElementById('campaignName').value.trim();
  if (campaign) body.campaign = campaign;
  var exp = document.getElementById('expireAt').value;
  if (exp) body.expireAt = exp;
  var email = document.getElementById('notifyEmail').value.trim();
  if (email) body.notifyEmail = email;

  return fetch('/api/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify(body),
  }).then(function(res) {
    if (res.status === 401) { showKeyModal(true); throw new Error('Unauthorized'); }
    return res.json();
  }).then(function(data) {
    if (data.error) throw new Error(data.error);
    currentShort = data.shortUrl;
    showSingleResult(data.shortUrl);
  });
}

function doShortenBatch(baseUrl, channels) {
  var campaign = document.getElementById('campaignName').value.trim();
  if (!campaign) { alert('Campaign name is required for multi-channel mode.'); return Promise.reject(new Error('Campaign name required')); }

  var body = { url: baseUrl, campaign: campaign, channels: channels };
  var exp = document.getElementById('expireAt').value;
  if (exp) body.expireAt = exp;
  var email = document.getElementById('notifyEmail').value.trim();
  if (email) body.notifyEmail = email;

  return fetch('/api/shorten/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify(body),
  }).then(function(res) {
    if (res.status === 401) { showKeyModal(true); throw new Error('Unauthorized'); }
    return res.json();
  }).then(function(data) {
    if (data.error) throw new Error(data.error);
    batchData = data;
    showBatchResult(data);
  });
}

// ── Results ──────────────────────────────────────────────────
function showSingleResult(shortUrl) {
  var el = document.getElementById('result');
  el.innerHTML = '<div class="short-link">' + shortUrl + '</div>' +
    '<div class="result-row">' +
    '<button class="btn-sm btn-copy" data-url="' + shortUrl + '" onclick="copyOne(this)">Copy Link</button>' +
    '<button class="btn-sm btn-dl" onclick="downloadQR()">Download QR</button>' +
    '</div>' +
    '<div class="qr-wrap" id="qrWrap"></div>';
  el.classList.add('show');
  renderQr(document.getElementById('qrWrap'), shortUrl, 160);
}

function showBatchResult(data) {
  var el = document.getElementById('result');
  var html = '<div class="batch-header">' +
    '<div class="short-link">' + data.campaign + ' (' + data.links.length + ' links)</div>' +
    '<button class="btn-sm btn-copy" onclick="copyAll(this)">Copy All</button>' +
    '</div>';
  data.links.forEach(function(lk) {
    html += '<div class="batch-item"><div class="batch-item-top">' +
      '<span class="batch-channel">' + lk.channel + '</span>' +
      '<span class="batch-url">' + lk.shortUrl + '</span>' +
      '<button class="btn-sm btn-copy" data-url="' + lk.shortUrl + '" onclick="copyOne(this)">Copy</button>' +
      '<button class="btn-sm btn-dl" data-slug="' + lk.slug + '" data-url="' + lk.shortUrl + '" onclick="toggleBatchQR(this)">QR</button>' +
      '</div><div class="batch-qr" id="qr-' + lk.slug + '"></div></div>';
  });
  el.innerHTML = html;
  el.classList.add('show');

  // Generate poster + copy cards if templates provided
  generatePosterCards(data.links);
}

function copyOne(btn) {
  navigator.clipboard.writeText(btn.dataset.url).then(function() {
    var orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = orig; }, 1500);
  });
}
function copyAll(btn) {
  if (!batchData) return;
  var text = batchData.links.map(function(l) { return l.channel + ': ' + l.shortUrl; }).join('\\n');
  navigator.clipboard.writeText(text).then(function() {
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = 'Copy All'; }, 2000);
  });
}
function toggleBatchQR(btn) {
  var slug = btn.dataset.slug;
  var url = btn.dataset.url;
  var el = document.getElementById('qr-' + slug);
  if (el.classList.contains('show')) { el.classList.remove('show'); return; }
  if (!el.hasChildNodes()) {
    renderQr(el, url, 120);
  }
  el.classList.add('show');
}
function downloadQR() {
  downloadQrFromContainer(document.getElementById('qrWrap'), 'urlteq-qr.png');
}

function renderQr(el, url, size) {
  el.innerHTML = '';
  el.dataset.qrUrl = url;
  el.dataset.qrSize = String(size);
  new QRCode(el, {
    text: url,
    width: size,
    height: size,
    colorDark: qrColorDark,
    colorLight: '#FFFFFF',
    correctLevel: QRCode.CorrectLevel.M,
  });
}

function ensureQr(el, url, size) {
  var needsRerender = !el.hasChildNodes() || el.dataset.qrUrl !== url || el.dataset.qrSize !== String(size);
  el.dataset.qrUrl = url;
  el.dataset.qrSize = String(size);
  if (needsRerender) renderQr(el, url, size);
}

function getQrDataUrl(el) {
  var canvas = el.querySelector('canvas');
  if (canvas) return canvas.toDataURL('image/png');
  var img = el.querySelector('img');
  if (img && img.src) return img.src;
  return '';
}

function downloadQrFromContainer(el, filename) {
  var dataUrl = getQrDataUrl(el);
  if (!dataUrl) return;
  var a = document.createElement('a');
  a.download = filename;
  a.href = dataUrl;
  a.click();
}

function rerenderExistingQrs() {
  Array.prototype.forEach.call(document.querySelectorAll('[data-qr-url]'), function(el) {
    if (!el.hasChildNodes()) return;
    renderQr(el, el.dataset.qrUrl, parseInt(el.dataset.qrSize || '120', 10));
  });
}

function formatShare(clicks, total) {
  if (!total) return '0%';
  return Math.round((clicks / total) * 100) + '%';
}

function historyQrMarkup(slug, shortUrl) {
  return '<div class="history-qr" id="history-qr-' + slug + '">' +
    '<div class="history-qr-code" id="history-qr-code-' + slug + '"></div>' +
    '<button class="btn-sm btn-dl" data-slug="' + slug + '" data-url="' + shortUrl + '" onclick="downloadHistoryQR(this)">Download QR</button>' +
    '</div>';
}

function toggleHistoryQR(btn) {
  var slug = btn.dataset.slug;
  var url = btn.dataset.url;
  var wrap = document.getElementById('history-qr-' + slug);
  var qrEl = document.getElementById('history-qr-code-' + slug);
  if (!wrap || !qrEl) return;

  if (wrap.classList.contains('show')) {
    wrap.classList.remove('show');
    btn.textContent = 'QR';
    return;
  }

  ensureQr(qrEl, url, 120);
  wrap.classList.add('show');
  btn.textContent = 'Hide QR';
}

function downloadHistoryQR(btn) {
  var slug = btn.dataset.slug;
  var url = btn.dataset.url;
  var qrEl = document.getElementById('history-qr-code-' + slug);
  if (!qrEl) return;
  ensureQr(qrEl, url, 160);
  downloadQrFromContainer(qrEl, 'urlteq-' + slug + '-qr.png');
}

// ── History ──────────────────────────────────────────────────
function loadLinks() {
  if (!apiKey) return;
  fetch('/api/links', {
    headers: { 'Authorization': 'Bearer ' + apiKey },
  }).then(function(res) {
    if (!res.ok) return;
    return res.json();
  }).then(function(data) {
    if (data) render(data);
  }).catch(function() {});
}

function render(links) {
  var el = document.getElementById('history');
  if (!links.length) {
    el.innerHTML = '<p class="empty">No links yet — create your first one!</p>';
    return;
  }
  var origin = window.location.origin;
  var now = Date.now();

  // Sort newest first
  links = links.slice().sort(function(a, b) { return b.created - a.created; });

  // Group by campaign
  var campaignMap = {};
  var campaignOrder = [];
  var ungrouped = [];

  links.forEach(function(lk) {
    if (lk.campaign) {
      if (!campaignMap[lk.campaign]) {
        campaignMap[lk.campaign] = [];
        campaignOrder.push(lk.campaign);
      }
      campaignMap[lk.campaign].push(lk);
    } else {
      ungrouped.push(lk);
    }
  });

  // Build base-campaign totals: e.g. "roundtable4-1","roundtable4-2" → base "roundtable4"
  // Strip trailing "-<number>" to find the base campaign name
  function getBaseCampaign(name) {
    var m = name.match(/^(.+)-(\\d+)$/);
    return m ? m[1] : name;
  }
  var baseCampaignClicks = {};
  campaignOrder.forEach(function(name) {
    var base = getBaseCampaign(name);
    if (!baseCampaignClicks[base]) baseCampaignClicks[base] = 0;
    campaignMap[name].forEach(function(lk) {
      baseCampaignClicks[base] += (lk.clicks || 0);
    });
  });

  // Build a unified list of render items (campaigns + ungrouped) sorted by created desc
  var items = [];
  campaignOrder.forEach(function(name) {
    var cLinks = campaignMap[name];
    items.push({ type: 'campaign', name: name, links: cLinks, created: cLinks[0].created });
  });
  ungrouped.slice(0, 15).forEach(function(lk) {
    items.push({ type: 'link', link: lk, created: lk.created });
  });
  items.sort(function(a, b) { return b.created - a.created; });

  var html = '';
  var fmtDate = function(ts) {
    return new Date(ts).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', hour12: false });
  };

  items.forEach(function(item) {
    if (item.type === 'campaign') {
      var cLinks = item.links;
      var total = cLinks.reduce(function(s, l) { return s + (l.clicks || 0); }, 0);
      var baseName = getBaseCampaign(item.name);
      var baseTotal = baseCampaignClicks[baseName] || total;
      html += '<div class="campaign-group">' +
        '<div class="campaign-header" onclick="this.nextElementSibling.classList.toggle(\\'collapsed\\')">' +
        '<div><span class="campaign-name">' + item.name + '</span>' +
        '<span class="campaign-meta"> &middot; ' + cLinks.length + ' channels &middot; ' + total + ' total clicks' +
        (baseTotal !== total ? ' &middot; ' + baseName + ' total: ' + baseTotal : '') + '</span></div>' +
        '<span class="hmeta">' + fmtDate(item.created) + '</span></div>' +
        '<div class="campaign-links">';
      cLinks.forEach(function(lk) {
        var shortUrl = origin + '/' + lk.slug;
        var clicks = lk.clicks || 0;
        html += '<div class="ch-item"><div class="ch-link">' +
          '<span class="ch-label">' + (lk.channel || '—') + '</span>' +
          '<a class="ch-slug" href="' + shortUrl + '" target="_blank">/' + lk.slug + '</a>' +
          '<span class="ch-clicks">' + clicks + ' clicks &middot; ' + formatShare(clicks, baseTotal) + '</span>' +
          '<button class="btn-link" data-slug="' + lk.slug + '" data-url="' + shortUrl + '" onclick="toggleHistoryQR(this)">QR</button>' +
          '<button class="btn-del" onclick="del(\\'' + lk.slug + '\\')">Delete</button>' +
          '</div>' + historyQrMarkup(lk.slug, shortUrl) + '</div>';
      });
      // Regenerate poster button (only if poster/template available)
      var linksJson = JSON.stringify(cLinks.map(function(lk) {
        return { channel: lk.channel || '', slug: lk.slug, shortUrl: origin + '/' + lk.slug };
      })).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
      html += '<div style="padding:6px 8px;">' +
        '<button class="btn-link" onclick="regeneratePosters(this)" data-links="' + linksJson + '" ' +
        'style="font-size:12px;">Regenerate Posters</button></div>';
      html += '</div></div>';
    } else {
      var lk = item.link;
      var shortUrl = origin + '/' + lk.slug;
      var urlTrim = lk.url.length > 52 ? lk.url.slice(0,52) + '...' : lk.url;
      var expiryBadge = '';
      if (lk.expireAt) {
        var diff = lk.expireAt - now;
        var days = Math.ceil(diff / 86400000);
        if (diff < 0) expiryBadge = '<span class="badge badge-expired">Expired</span>';
        else if (days <= 3) expiryBadge = '<span class="badge badge-expiry">Expires in ' + days + 'd</span>';
        else {
          var d = new Date(lk.expireAt).toLocaleDateString('en-US',{month:'short',day:'numeric'});
          expiryBadge = '<span class="badge badge-expiry">Exp ' + d + '</span>';
        }
      }
      html += '<div class="hitem">' +
        '<div class="hitem-top">' +
        '<a class="hslug" href="' + shortUrl + '" target="_blank">/' + lk.slug + '</a>' +
        '<span class="hmeta">' + fmtDate(lk.created) + '</span></div>' +
        '<div class="hurl" title="' + lk.url + '">' + urlTrim + '</div>' +
        '<div class="hbot">' +
        '<span class="badge badge-click">' + (lk.clicks||0) + ' clicks</span>' +
        expiryBadge +
        '<button class="btn-link" data-slug="' + lk.slug + '" data-url="' + shortUrl + '" onclick="toggleHistoryQR(this)">QR</button>' +
        '<button class="btn-del" onclick="del(\\'' + lk.slug + '\\')">Delete</button>' +
        '</div>' + historyQrMarkup(lk.slug, shortUrl) + '</div>';
    }
  });

  el.innerHTML = html;
}

function del(slug) {
  if (!confirm('Delete /' + slug + '?')) return;
  fetch('/api/links/' + slug, {
    method: 'DELETE', headers: { 'Authorization': 'Bearer ' + apiKey },
  }).then(function() { loadLinks(); });
}

// ── Poster & Copy Template ─────────────────────────────────
var posterDataUrl = null;

function onPosterUpload(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    posterDataUrl = e.target.result;
    var preview = document.getElementById('posterPreview');
    preview.src = posterDataUrl;
    preview.style.display = 'block';
    document.getElementById('posterFilename').textContent = file.name;
  };
  reader.readAsDataURL(file);
}

function generatePosterCards(batchLinks) {
  var template = document.getElementById('copyTemplate').value;
  var container = document.getElementById('posterResults');

  // If no poster and no template, hide
  if (!posterDataUrl && !template.trim()) {
    container.classList.remove('show');
    return;
  }

  var html = '<div class="poster-results-header">' +
    '<h3>Ready to Share (' + batchLinks.length + ')</h3>' +
    '</div>';

  batchLinks.forEach(function(lk, idx) {
    var copyText = template ? template.replace(/\\$\\{link\\}/g, lk.shortUrl) : lk.shortUrl;
    var escapedCopy = copyText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    html += '<div class="poster-card" id="pcard-' + idx + '">' +
      '<div class="poster-card-header">' +
      '<span class="poster-card-channel">' + lk.channel + '</span>' +
      '<span class="poster-card-link">' + lk.shortUrl + '</span>' +
      '</div>' +
      '<div class="poster-card-body">';

    if (posterDataUrl) {
      html += '<div class="poster-card-img-wrap">' +
        '<canvas id="pcanvas-' + idx + '" style="display:none"></canvas>' +
        '<img id="pimg-' + idx + '" alt="poster" />' +
        '</div>';
    }

    html += '<div class="poster-card-copy">' +
      '<pre>' + escapedCopy + '</pre>' +
      '<div class="poster-card-actions">' +
      '<button class="btn-green-sm" onclick="copyCardText(this,' + idx + ')">Copy Text</button>';

    if (posterDataUrl) {
      html += '<button class="btn-green-sm" onclick="downloadPoster(' + idx + ',\\'' + (lk.channel || lk.slug).replace(/'/g,'') + '\\')">Download Poster</button>';
    }

    html += '</div></div></div></div>';
  });

  container.innerHTML = html;
  container.classList.add('show');

  // Now render each poster with QR composited
  if (posterDataUrl) {
    batchLinks.forEach(function(lk, idx) {
      compositePoster(idx, lk.shortUrl);
    });
  }
}

function compositePoster(idx, shortUrl) {
  var posterImg = new Image();
  posterImg.onload = function() {
    var pw = posterImg.naturalWidth;
    var ph = posterImg.naturalHeight;

    // QR size: ~18% of poster width, positioned bottom-right
    var qrSize = Math.round(pw * 0.18);
    var qrMarginRight = Math.round(pw * 0.05);
    var qrMarginBottom = Math.round(ph * 0.04);
    var qrX = pw - qrSize - qrMarginRight;
    var qrY = ph - qrSize - qrMarginBottom;

    // Generate QR into a temp off-screen div
    var tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    new QRCode(tempDiv, {
      text: shortUrl,
      width: qrSize,
      height: qrSize,
      colorDark: '#000000',
      colorLight: '#FFFFFF',
      correctLevel: QRCode.CorrectLevel.M,
    });

    // Wait for QR canvas to render
    setTimeout(function() {
      var qrCanvas = tempDiv.querySelector('canvas');
      var canvas = document.getElementById('pcanvas-' + idx);
      canvas.width = pw;
      canvas.height = ph;
      var ctx = canvas.getContext('2d');

      // Draw poster
      ctx.drawImage(posterImg, 0, 0, pw, ph);

      // Draw white background for QR (with padding)
      var pad = Math.round(qrSize * 0.08);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      var r = Math.round(qrSize * 0.05);
      var bx = qrX - pad, by = qrY - pad, bw = qrSize + pad * 2, bh = qrSize + pad * 2;
      ctx.moveTo(bx + r, by);
      ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
      ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
      ctx.arcTo(bx, by + bh, bx, by, r);
      ctx.arcTo(bx, by, bx + bw, by, r);
      ctx.closePath();
      ctx.fill();

      // Draw QR
      if (qrCanvas) {
        ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
      }

      // Export to img tag
      var dataUrl = canvas.toDataURL('image/png');
      var imgEl = document.getElementById('pimg-' + idx);
      imgEl.src = dataUrl;

      document.body.removeChild(tempDiv);
    }, 100);
  };
  posterImg.src = posterDataUrl;
}

function copyCardText(btn, idx) {
  var template = document.getElementById('copyTemplate').value;
  var shortUrl = batchData.links[idx].shortUrl;
  var text = template ? template.replace(/\\$\\{link\\}/g, shortUrl) : shortUrl;
  navigator.clipboard.writeText(text).then(function() {
    var orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = orig; }, 1500);
  });
}

function regeneratePosters(btn) {
  if (!posterDataUrl && !document.getElementById('copyTemplate').value.trim()) {
    alert('Please upload a poster image or enter a copy template first, then click Regenerate.');
    return;
  }
  var linksData;
  try { linksData = JSON.parse(btn.dataset.links); } catch(e) { return; }
  generatePosterCards(linksData);
  // Scroll to poster results
  var el = document.getElementById('posterResults');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function downloadPoster(idx, channelName) {
  var canvas = document.getElementById('pcanvas-' + idx);
  if (!canvas) return;
  canvas.toBlob(function(blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.download = 'poster-' + channelName + '.png';
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

boot();
</script>
</body>
</html>`;
}

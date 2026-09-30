// Per-provider brief pages. Pure functions: rows in, HTML strings out. No I/O.
//
// One static page per providers.json row, generated at build into dist/p/{id}.html
// and served at /p/{id}. The look matches index.html (same CSS variables, Inter,
// localStorage/data-theme theme toggle).

import { EVIDENCE_FIELDS } from './v2-fields.mjs';
import { logoMap } from './logos.mjs';

export const SITE = 'https://privacywatch.wyrdwerk.com';

// Same badge colours/labels as index.html.
const RATING = {
  clean: { emoji: '🟢', label: 'Clean' },
  guarded: { emoji: '🟡', label: 'Guarded' },
  caution: { emoji: '🟠', label: 'Caution' },
  'high-risk': { emoji: '🔴', label: 'High Risk' },
  unverified: { emoji: '⚫', label: 'Unverified' },
};

const COMPLIANCE_LABEL = { dpa: 'DPA', soc2: 'SOC 2', hipaaBaa: 'HIPAA BAA' };

const COMPLIANCE_VALUE = {
  dpa: { public: 'Published publicly', 'on-request': 'Available on request', enterprise: 'Enterprise plans', none: 'Not offered', silent: 'Not documented' },
  soc2: { type1: 'Type 1', type2: 'Type 2', none: 'None', silent: 'Not documented' },
  hipaaBaa: { available: 'Available', enterprise: 'Enterprise plans', none: 'None', silent: 'Not documented' },
};

const REGION_LABEL = {
  AE: 'the UAE', AU: 'Australia', BR: 'Brazil', CA: 'Canada', CN: 'China',
  DE: 'Germany', ES: 'Spain', EU: 'the EU/EEA', FI: 'Finland', FR: 'France',
  GB: 'the UK', GLOBAL: 'anywhere (global)', HK: 'Hong Kong', ID: 'Indonesia',
  IN: 'India', JP: 'Japan', KR: 'South Korea', MY: 'Malaysia', NL: 'the Netherlands',
  SG: 'Singapore', US: 'the US',
};

// ── Plain English ─────────────────────────────────────────────────────────────
// One entry per value in VOCAB (plus the location.regions cases). Each entry is a
// function of the row so retention can use its `days`. `null` means "nothing worth
// saying" (e.g. training is already off, so an opt-out clause is noise).
export const PLAIN = {
  'training.default': {
    off: () => 'Does not train on your data by default',
    on: () => 'Trains on your data by default',
    'opt-in': () => 'Only trains on your data if you opt in',
    'tier-dependent': () => 'Whether they train on your data depends on your plan tier',
    silent: () => "Documents don't say whether they train on your data",
    conflicting: () => 'Documents conflict on whether they train on your data',
  },
  'training.optOut': {
    setting: () => 'you can opt out in settings',
    'api-param': () => 'you can opt out with an API parameter',
    email: () => 'you can opt out by email',
    contract: () => 'opting out requires a contract',
    'not-needed': () => null,
    none: () => 'there is no opt-out',
    silent: () => "documents don't say how to opt out",
  },
  'retention.kind': {
    none: () => 'Does not keep your data',
    transient: () => 'Keeps your data only while your request is in flight',
    fixed: (row) => `Keeps your data for ${row.retention.days} days`,
    'until-deleted': () => 'Keeps your data until you delete it',
    indefinite: () => 'Keeps your data indefinitely',
    silent: () => "Documents don't say how long your data is kept",
  },
  'zdr.access': {
    default: () => 'Zero data retention: on by default',
    'self-serve': () => 'Zero data retention: switch it on yourself',
    approval: () => 'Zero data retention: requires their approval',
    enterprise: () => 'Zero data retention: enterprise plans only',
    none: () => 'No zero data retention option',
    silent: () => "Documents don't say whether zero data retention is available",
  },
  'compliance.dpa': {
    public: () => 'Data processing addendum published publicly',
    'on-request': () => 'Data processing addendum available on request',
    enterprise: () => 'Data processing addendum for enterprise plans',
    none: () => 'No data processing addendum offered',
    silent: () => "Documents don't say whether a data processing addendum is offered",
  },
  'compliance.soc2': {
    type1: () => 'SOC 2 Type 1 report',
    type2: () => 'SOC 2 Type 2 report',
    none: () => 'No SOC 2 report',
    silent: () => "Documents don't say whether they hold SOC 2",
  },
  'compliance.hipaaBaa': {
    available: () => 'HIPAA BAA available',
    enterprise: () => 'HIPAA BAA for enterprise plans',
    none: () => 'No HIPAA BAA',
    silent: () => "Documents don't say whether a HIPAA BAA is available",
  },
  'incidents.type': {
    breach: () => 'breach',
    regulatory: () => 'regulatory action',
    ban: () => 'government ban',
    allegation: () => 'allegation of misconduct',
  },
};

const TRAINED_DEFAULTS = new Set(['on', 'tier-dependent', 'conflicting']);

function say(entry, row) {
  if (typeof entry !== 'function') return null;
  return entry(row) || null;
}

export function formatMonth(value) {
  const m = /^(\d{4})-(\d{2})/.exec(String(value ?? ''));
  if (!m) return String(value ?? '');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const name = months[Number(m[2]) - 1];
  return name ? `${name} ${m[1]}` : m[0];
}

export function formatDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''));
  if (!m) return String(value ?? '');
  return formatMonth(value) + ` ${Number(m[3])}`;
}

function regionPhrase(regions) {
  if (!Array.isArray(regions) || regions.length === 0) return 'Processing location not disclosed';
  const names = regions.map((r) => REGION_LABEL[r] ?? r);
  return `Processing location: ${names.join(', ')}`;
}

// Short sentences for the "At a glance" box, built from the structured fields.
export function plainEnglish(row) {
  const out = [];
  const training = row.training ?? {};

  const primary = say(PLAIN['training.default'][training.default], row);
  if (primary) {
    let sentence = primary;
    if (TRAINED_DEFAULTS.has(training.default)) {
      const clause = say(PLAIN['training.optOut'][training.optOut], row);
      if (clause) sentence += `; ${clause}`;
    }
    out.push(sentence);
  }

  const retention = say(PLAIN['retention.kind'][row.retention?.kind], row);
  if (retention) out.push(retention);

  const zdr = say(PLAIN['zdr.access'][row.zdr?.access], row);
  if (zdr) out.push(zdr);

  if (row.location && 'regions' in row.location) out.push(regionPhrase(row.location.regions));

  for (const key of ['dpa', 'soc2', 'hipaaBaa']) {
    const value = row.compliance?.[key];
    const sentence = say(PLAIN[`compliance.${key}`][value], row);
    if (sentence) out.push(sentence);
  }

  for (const inc of row.incidents ?? []) {
    const type = say(PLAIN['incidents.type'][inc.type], row);
    if (!type) continue;
    const status = inc.confirmed ? 'Confirmed' : 'Alleged';
    out.push(`${status} ${type} (${formatMonth(inc.date)})`);
  }

  return out;
}

// ── HTML ──────────────────────────────────────────────────────────────────────

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  if (value == null) return '';
  return String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

function attr(value) {
  return escapeHtml(value);
}

function ratingBadge(row) {
  const r = RATING[row.rating];
  const label = r ? `${r.emoji} ${r.label}` : escapeHtml(row.rating);
  const cls = RATING[row.rating] ? row.rating : 'unverified';
  const flag = row.incident
    ? ' <span class="incident-flag" title="Confirmed security incident or government action" aria-label="Confirmed security incident or government action">🚩</span>'
    : '';
  return `<span class="badge badge-${cls}">${label}</span>${flag}`;
}

function logoHtml(row) {
  const slug = logoMap()[row.name];
  if (!slug) return '';
  return `<img class="brief-logo" src="/assets/logos/${attr(slug)}.png" alt="${attr(row.name)} logo" width="44" height="44" onerror="this.style.display='none'">`;
}

function fieldSection(title, label, detail) {
  if (!label && !detail) return '';
  const labelHtml = label ? `<div class="field-label">${escapeHtml(label)}</div>` : '';
  const detailHtml = detail ? `<p class="field-detail">${escapeHtml(detail)}</p>` : '';
  return `<section class="brief-section">
      <h2>${escapeHtml(title)}</h2>
      ${labelHtml}
      ${detailHtml}
    </section>`;
}

function complianceSection(row) {
  const keys = Object.keys(COMPLIANCE_LABEL).filter((k) => row.compliance?.[k] !== undefined);
  if (!keys.length) return '';
  const items = keys.map((k) => {
    const value = row.compliance[k];
    const text = COMPLIANCE_VALUE[k]?.[value] ?? value;
    return `<li><span class="compliance-key">${escapeHtml(COMPLIANCE_LABEL[k])}</span> <span class="compliance-value">${escapeHtml(text)}</span></li>`;
  }).join('\n        ');
  return `<section class="brief-section">
      <h2>Compliance</h2>
      <ul class="compliance-list">
        ${items}
      </ul>
    </section>`;
}

function incidentsSection(row) {
  const incidents = row.incidents ?? [];
  const background = row.incidentDetail
    ? `<p class="incident-background">${escapeHtml(row.incidentDetail)}</p>`
    : '';
  if (!incidents.length) {
    return background ? `<section class="brief-section"><h2>Incidents</h2>${background}</section>` : '';
  }
  const items = incidents.map((inc) => {
    const type = PLAIN['incidents.type'][inc.type];
    const typeText = typeof type === 'function' ? type(row) : inc.type;
    const status = inc.confirmed ? 'Confirmed' : 'Alleged';
    return `<li class="incident-item">
        <div class="incident-head">
          <span class="incident-date">${escapeHtml(formatMonth(inc.date))}</span>
          <span class="badge ${inc.confirmed ? 'badge-high-risk' : 'badge-unverified'}">${escapeHtml(status)}</span>
          <span class="incident-type">${escapeHtml(typeText)}</span>
        </div>
        <p>${escapeHtml(inc.summary)}</p>
        <a class="source-link" href="${attr(inc.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source ↗</a>
      </li>`;
  }).join('\n      ');
  return `<section class="brief-section">
      <h2>Incidents</h2>
      <ul class="incident-list">
      ${items}
      </ul>
      ${background}
    </section>`;
}

const EVIDENCE_TITLE = {
  training: 'Training',
  retention: 'Retention',
  zdr: 'Zero data retention',
  location: 'Location',
  compliance: 'Compliance',
  incidents: 'Incidents',
};

function evidenceSection(row) {
  const evidence = row.evidence ?? [];
  if (!evidence.length) return '';
  const groups = EVIDENCE_FIELDS
    .map((field) => ({ field, entries: evidence.filter((e) => e.field === field) }))
    .filter((g) => g.entries.length);
  const blocks = groups.map(({ field, entries }) => {
    const quotes = entries.map((e) => {
      const quote = e.quote && e.quote.trim()
        ? `<blockquote>${escapeHtml(e.quote)}</blockquote>`
        : '<p class="evidence-empty">No verbatim quote — documents are silent on this field.</p>';
      return `<div class="evidence-entry">
          ${quote}
          <div class="evidence-meta"><a class="source-link" href="${attr(e.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(e.url)}</a> · retrieved ${escapeHtml(formatDate(e.retrieved))}</div>
        </div>`;
    }).join('\n        ');
    const heading = EVIDENCE_TITLE[field] ?? field;
    return `<div class="evidence-group">
        <h3>${escapeHtml(heading)}</h3>
        ${quotes}
      </div>`;
  }).join('\n      ');
  return `<section class="brief-section">
      <h2>Evidence</h2>
      <p class="section-note">Verbatim quotes from the provider's own documents, with the date we retrieved them.</p>
      ${blocks}
    </section>`;
}

function glanceBox(row) {
  const sentences = plainEnglish(row);
  if (!sentences.length) return '';
  const items = sentences.map((s) => `<li>${escapeHtml(s)}</li>`).join('\n        ');
  return `<section class="glance" aria-label="At a glance">
      <h2>At a glance</h2>
      <ul>
        ${items}
      </ul>
    </section>`;
}

function head(row, meta) {
  const site = meta.site || SITE;
  const canonical = `${site}/p/${row.id}`;
  const title = `${row.name} ${row.surface} — privacy brief — PrivacyWatch`;
  const description = `${row.name} ${row.surface}: model training, data retention, zero data retention and processing location, with sources. Last verified ${row.sourceDate}.`;
  return `  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${attr(description)}" />
  <link rel="canonical" href="${attr(canonical)}" />
  <meta property="og:title" content="${attr(title)}" />
  <meta property="og:description" content="${attr(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${attr(canonical)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="theme-color" content="#F8F5F0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />`;
}

const THEME_SCRIPT = `  <script>
    (function () {
      try {
        var t = localStorage.getItem('pw-theme');
        document.documentElement.dataset.theme = (t === 'dark') ? 'dark' : 'light';
      } catch (_) {
        document.documentElement.dataset.theme = 'light';
      }
    })();
  </script>`;

const HEADER = `<!-- HEADER -->
<header class="header">
  <div class="header-inner">
    <a href="/" class="logo">
      <svg class="logo-mark" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="6" fill="var(--logo-mark-bg)"/>
        <path d="M6 22L14 6L22 22M9 16H19" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span class="logo-wordmark">Privacy<span>Watch</span></span>
    </a>
    <div class="header-meta">
      <a href="/">All providers</a>
      <a href="https://github.com/WyrdWerk/PrivacyWatch" target="_blank" rel="noopener">GitHub ↗</a>
      <button type="button" class="theme-toggle" id="themeToggle" aria-label="Switch to light mode" title="Switch theme">
        <svg class="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 14.3A9 9 0 1 1 9.7 3 7 7 0 0 0 21 14.3z"/></svg>
        <svg class="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
      </button>
    </div>
  </div>
</header>`;

const THEME_JS = `<script>
(function () {
  function currentTheme() {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  }
  function sync() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    btn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    btn.title = 'Switch to ' + next + ' mode';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', currentTheme() === 'dark' ? '#0D1725' : '#F8F5F0');
  }
  sync();
  document.getElementById('themeToggle').addEventListener('click', function () {
    var theme = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('pw-theme', theme); } catch (_) { /* ignore */ }
    sync();
  });
})();
</script>`;

const STYLE = `<style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      color-scheme: light;
      /* WyrdWerk light palette — shared with index.html */
      --bg: #F8F5F0;
      --surface: #FFFFFF;
      --surface-hover: #F3F7FB;
      --border: #E0D6CA;
      --border-light: #EDE6DC;
      --text-primary: #0D1725;
      --text-secondary: #486680;
      --text-muted: #486680;
      --accent: #1E6E8E;
      --accent-hover: #2A7A9A;
      --accent-faint: rgba(30,110,142,.12);
      --clean-bg: #dcfce7; --clean-text: #15803d;
      --guarded-bg: #fef9c3; --guarded-text: #854d0e;
      --caution-bg: #ffedd5; --caution-text: #9a3412;
      --high-risk-bg: #fee2e2; --high-risk-text: #991b1b;
      --unverified-bg: #EDE6DC; --unverified-text: #486680;
      --api-badge-bg: #E4F1F6; --api-badge-text: #1E6E8E;
      --consumer-badge-bg: #ede9fe; --consumer-badge-text: #6b21a8;
      --detail-bg: #F3EEE7;
      --notes-bg: #fff8e1; --notes-border: #fde68a; --notes-text: #92400e;
      --incident-bg: #fff1f2; --incident-border: #fecdd3; --incident-text: #9f1239;
      --input-bg: #FFFFFF;
      --logo-mark-bg: #0D1725;
      --font: 'Inter', -apple-system, sans-serif;
      --radius: 6px;
      --shadow-sm: 0 1px 3px rgba(13,23,37,.08), 0 1px 2px rgba(13,23,37,.05);
    }

    body { font-family: var(--font); background: var(--bg); color: var(--text-primary); font-size: 14px; line-height: 1.5; }

    /* ── HEADER ── */
    .header { background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
    .header-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 56px; }
    .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .logo-mark { width: 28px; height: 28px; }
    .logo-wordmark { font-size: 15px; font-weight: 700; color: var(--text-primary); letter-spacing: -.3px; }
    .logo-wordmark span { color: var(--accent); }
    .header-meta { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 12px; }
    .header-meta a { color: var(--text-muted); text-decoration: none; }
    .header-meta a:hover { color: var(--accent); }
    .theme-toggle {
      display: inline-flex; align-items: center; justify-content: center;
      flex: 0 0 32px; width: 32px; height: 32px; min-width: 32px;
      border-radius: 6px; border: 1px solid var(--border);
      background: var(--surface); color: var(--text-primary); cursor: pointer;
    }
    .theme-toggle:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-faint); }
    .theme-toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    .theme-toggle .icon-sun, html[data-theme="dark"] .theme-toggle .icon-moon { display: none; }
    html[data-theme="dark"] .theme-toggle .icon-sun { display: block; }

    /* ── LAYOUT ── */
    .wrap { max-width: 860px; margin: 0 auto; padding: 24px 24px 48px; }
    .back { display: inline-block; font-size: 12px; color: var(--accent); text-decoration: none; margin-bottom: 16px; }
    .back:hover { text-decoration: underline; }

    .brief-head { display: flex; align-items: flex-start; gap: 14px; flex-wrap: wrap; }
    .brief-logo { width: 44px; height: 44px; border-radius: 9px; flex-shrink: 0; }
    .brief-title { min-width: 0; }
    .brief-title h1 { font-size: 22px; font-weight: 700; line-height: 1.2; }
    .brief-sub { margin-top: 6px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; color: var(--text-secondary); }

    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
    .badge-clean { background: var(--clean-bg); color: var(--clean-text); }
    .badge-guarded { background: var(--guarded-bg); color: var(--guarded-text); }
    .badge-caution { background: var(--caution-bg); color: var(--caution-text); }
    .badge-high-risk { background: var(--high-risk-bg); color: var(--high-risk-text); }
    .badge-unverified { background: var(--unverified-bg); color: var(--unverified-text); }
    .badge-api { background: var(--api-badge-bg); color: var(--api-badge-text); }
    .badge-consumer { background: var(--consumer-badge-bg); color: var(--consumer-badge-text); }
    .incident-flag { font-size: 12px; cursor: help; }

    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; box-shadow: var(--shadow-sm); }
    .glance { margin-top: 20px; padding: 16px 18px; background: var(--detail-bg); border: 1px solid var(--border); border-radius: 10px; }
    .glance h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--text-muted); margin-bottom: 8px; }
    .glance ul { list-style: none; display: grid; gap: 6px; }
    .glance li { position: relative; padding-left: 18px; font-size: 13px; color: var(--text-primary); }
    .glance li::before { content: '•'; position: absolute; left: 4px; color: var(--accent); }

    .brief-section { margin-top: 24px; }
    .brief-section h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--text-muted); margin-bottom: 8px; }
    .brief-section h3 { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin: 14px 0 6px; }
    .field-label { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
    .field-detail { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .section-note { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }

    .compliance-list { list-style: none; display: grid; gap: 6px; }
    .compliance-list li { font-size: 13px; color: var(--text-secondary); }
    .compliance-key { font-weight: 600; color: var(--text-primary); }

    .incident-list { list-style: none; display: grid; gap: 12px; }
    .incident-item { padding: 12px 14px; background: var(--incident-bg); border: 1px solid var(--incident-border); border-radius: var(--radius); }
    .incident-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
    .incident-date { font-size: 12px; font-weight: 700; color: var(--incident-text); }
    .incident-type { font-size: 12px; color: var(--incident-text); text-transform: capitalize; }
    .incident-item p { font-size: 13px; color: var(--incident-text); line-height: 1.55; margin-bottom: 6px; }
    .incident-background { margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.55; }

    .evidence-entry { margin-bottom: 10px; }
    blockquote { margin: 0 0 4px; padding: 10px 14px; border-left: 3px solid var(--accent); background: var(--surface); border-radius: 0 var(--radius) var(--radius) 0; font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .evidence-meta { font-size: 11px; color: var(--text-muted); word-break: break-word; }
    .evidence-empty { font-size: 12px; color: var(--text-muted); font-style: italic; margin-bottom: 4px; }

    .source-link { color: var(--accent); font-size: 11px; text-decoration: none; word-break: break-word; }
    .source-link:hover { text-decoration: underline; }

    .brief-notes { margin-top: 24px; padding: 12px 14px; background: var(--notes-bg); border: 1px solid var(--notes-border); border-radius: var(--radius); font-size: 12px; color: var(--notes-text); line-height: 1.55; }

    .brief-meta { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-muted); display: grid; gap: 6px; }
    .brief-meta .links { display: flex; gap: 12px; flex-wrap: wrap; }
    .not-legal { margin-top: 20px; font-size: 12px; color: var(--text-muted); }

    footer { border-top: 1px solid var(--border); background: var(--surface); }
    .footer-inner { max-width: 860px; margin: 0 auto; padding: 20px 24px; font-size: 12px; color: var(--text-muted); }
    .footer-inner a { color: var(--text-muted); text-decoration: none; }
    .footer-inner a:hover { color: var(--accent); }

    /* ── DARK MODE ── */
    html[data-theme="dark"] {
      color-scheme: dark;
      --bg: #0D1725;
      --surface: #152233;
      --surface-hover: #1A2B3F;
      --border: #2A3F55;
      --border-light: #1A2B3F;
      --text-primary: #F8F5F0;
      --text-secondary: #9BB3C4;
      --text-muted: #7A93A8;
      --accent: #4BA3C3;
      --accent-hover: #6BB5CE;
      --accent-faint: rgba(75,163,195,.18);
      --clean-bg: #14532d; --clean-text: #86efac;
      --guarded-bg: #422006; --guarded-text: #fcd34d;
      --caution-bg: #431407; --caution-text: #fdba74;
      --high-risk-bg: #450a0a; --high-risk-text: #fca5a5;
      --unverified-bg: #1A2B3F; --unverified-text: #9BB3C4;
      --api-badge-bg: #16384A; --api-badge-text: #8EC9DC;
      --consumer-badge-bg: #2e1065; --consumer-badge-text: #ddd6fe;
      --detail-bg: #152233;
      --notes-bg: #422006; --notes-border: #78350f; --notes-text: #fcd34d;
      --incident-bg: #4c0519; --incident-border: #881337; --incident-text: #fda4af;
      --input-bg: #1A2B3F;
      --logo-mark-bg: #0D1725;
      --shadow-sm: 0 1px 3px rgba(0,0,0,.3), 0 1px 2px rgba(0,0,0,.2);
    }

    @media (prefers-color-scheme: dark) {
      html:not([data-theme]) {
        color-scheme: dark;
        --bg: #0D1725;
        --surface: #152233;
        --surface-hover: #1A2B3F;
        --border: #2A3F55;
        --border-light: #1A2B3F;
        --text-primary: #F8F5F0;
        --text-secondary: #9BB3C4;
        --text-muted: #7A93A8;
        --accent: #4BA3C3;
        --accent-hover: #6BB5CE;
        --accent-faint: rgba(75,163,195,.18);
        --clean-bg: #14532d; --clean-text: #86efac;
        --guarded-bg: #422006; --guarded-text: #fcd34d;
        --caution-bg: #431407; --caution-text: #fdba74;
        --high-risk-bg: #450a0a; --high-risk-text: #fca5a5;
        --unverified-bg: #1A2B3F; --unverified-text: #9BB3C4;
        --api-badge-bg: #16384A; --api-badge-text: #8EC9DC;
        --consumer-badge-bg: #2e1065; --consumer-badge-text: #ddd6fe;
        --detail-bg: #152233;
        --notes-bg: #422006; --notes-border: #78350f; --notes-text: #fcd34d;
        --incident-bg: #4c0519; --incident-border: #881337; --incident-text: #fda4af;
        --input-bg: #1A2B3F;
        --logo-mark-bg: #0D1725;
        --shadow-sm: 0 1px 3px rgba(0,0,0,.3), 0 1px 2px rgba(0,0,0,.2);
      }
    }

    @media (max-width: 640px) {
      .header-inner, .wrap, .footer-inner { padding-left: 16px; padding-right: 16px; }
      .header-meta a:first-child { display: none; }
    }
  </style>`;

function body(row) {
  const id = escapeHtml(row.id);
  const surfaceClass = row.surfaceType === 'api' ? 'badge-api' : 'badge-consumer';
  const related = Array.isArray(row.relatedUrls) && row.relatedUrls.length
    ? `<div class="links">Related: ${row.relatedUrls.map((u) => `<a class="source-link" href="${attr(u)}" target="_blank" rel="noopener noreferrer">${escapeHtml(u)}</a>`).join(' · ')}</div>`
    : '';
  const notes = row.notes ? `<div class="brief-notes">📌 ${escapeHtml(row.notes)}</div>` : '';

  return `<body>
${HEADER}

<main class="wrap">
  <a class="back" href="/">← Back to tracker</a>

  <div class="brief-head">
    ${logoHtml(row)}
    <div class="brief-title">
      <h1>${escapeHtml(row.name)}</h1>
      <div class="brief-sub">
        <span class="badge ${surfaceClass}">${escapeHtml(row.surface)}</span>
        <span>${escapeHtml(row.categoryLabel)}</span>
        ${ratingBadge(row)}
      </div>
    </div>
  </div>

  ${glanceBox(row)}

  ${fieldSection('Training', row.training?.label, row.training?.detail)}
  ${fieldSection('Retention', row.retention?.label, row.retention?.detail)}
  ${fieldSection('Zero data retention', row.zdr?.label, row.zdr?.detail)}
  ${fieldSection('Location', row.location?.label, row.location?.detail)}

  ${complianceSection(row)}
  ${incidentsSection(row)}
  ${evidenceSection(row)}

  ${notes}

  <div class="brief-meta">
    <div><strong>Last verified:</strong> ${escapeHtml(formatDate(row.sourceDate))}</div>
    <div class="links">
      <a class="source-link" href="/">Back to tracker</a>
      <a class="source-link" href="/api/v1/providers/${id}">JSON ↗</a>
      <a class="source-link" href="${attr(row.sourceUrl)}" target="_blank" rel="noopener noreferrer">Official source ↗</a>
      ${row.privacyUrl ? `<a class="source-link" href="${attr(row.privacyUrl)}" target="_blank" rel="noopener noreferrer">Privacy policy ↗</a>` : ''}
    </div>
    ${related}
  </div>

  <p class="not-legal">Not legal advice. This is a good-faith summary of public documents; policies change, so always verify with the primary sources linked above.</p>
</main>

<footer>
  <div class="footer-inner">
    Maintained by <a href="https://wyrdwerk.com" target="_blank" rel="noopener">WyrdWerk</a> ·
    <a href="https://github.com/WyrdWerk/PrivacyWatch" target="_blank" rel="noopener">GitHub</a> ·
    Not legal advice · Policies change — always verify with primary sources
  </div>
</footer>

${THEME_JS}
</body>`;
}

// Full standalone HTML document for one provider row.
export function renderBrief(row, meta = {}) {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
${head(row, meta)}
${THEME_SCRIPT}
${STYLE}
</head>
${body(row)}
</html>
`;
}

// Sitemap covering the tracker root and every brief page.
export function renderSitemap(providers, meta = {}) {
  const site = meta.site || SITE;
  const rootLastmod = meta.lastUpdated || '';
  const urls = [`  <url>\n    <loc>${escapeHtml(site)}/</loc>\n    <lastmod>${escapeHtml(rootLastmod)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`];
  for (const p of providers) {
    urls.push(`  <url>\n    <loc>${escapeHtml(site)}/p/${escapeHtml(p.id)}</loc>\n    <lastmod>${escapeHtml(p.sourceDate || rootLastmod)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

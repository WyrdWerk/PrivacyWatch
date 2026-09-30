import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderBrief, renderSitemap, plainEnglish, PLAIN, escapeHtml, SITE } from '../scripts/lib/briefs.mjs';
import { VOCAB } from '../scripts/lib/v2-fields.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataset = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'providers.json'), 'utf-8'));
const rows = dataset.providers;
const meta = { lastUpdated: dataset.meta.lastUpdated };

const base = () => ({
  id: 'x-api',
  name: 'X',
  surface: 'API',
  surfaceType: 'api',
  category: 'inference',
  categoryLabel: 'Inference',
  rating: 'clean',
  incident: false,
  training: { label: 'Off', detail: 'd', default: 'off', optOut: 'not-needed' },
  retention: { label: '30 days', detail: 'd', kind: 'fixed', days: 30 },
  zdr: { label: 'Yes', detail: 'd', status: 'full', access: 'default' },
  location: { label: 'US', flag: '🇺🇸', detail: 'd', regions: ['US'] },
  sourceUrl: 'https://x.example/terms',
  privacyUrl: 'https://x.example/privacy',
  sourceDate: '2026-09-30',
  incidents: [],
  evidence: [],
});

test('every providers.json row renders a brief with no undefined/null text', () => {
  for (const row of rows) {
    const html = renderBrief(row, meta);
    assert.ok(html.startsWith('<!DOCTYPE html>'), `${row.id}: not a full document`);
    assert.ok(!/undefined/.test(html), `${row.id}: rendered "undefined"`);
    assert.ok(!/\bnull\b/.test(html), `${row.id}: rendered "null"`);
    assert.ok(html.includes(`<link rel="canonical" href="${SITE}/p/${row.id}" />`), `${row.id}: missing canonical`);
    assert.ok(html.includes(`href="/api/v1/providers/${row.id}"`), `${row.id}: missing JSON link`);
    assert.ok(html.includes('Not legal advice'), `${row.id}: missing not-legal-advice line`);
    assert.ok(html.includes('Back to tracker'), `${row.id}: missing back link`);
  }
});

test('escapes every value from the row', () => {
  const row = base();
  row.training = { label: '<b>Off</b>', detail: '<script>alert(1)</script>', default: 'off', optOut: 'not-needed' };
  row.name = 'Evil <img src=x onerror=alert(2)>';
  row.notes = 'a "quoted" & <i>note</i>';
  row.incidents = [{
    date: '2026-01',
    type: 'breach',
    confirmed: true,
    summary: '<script>alert(3)</script>',
    sourceUrl: 'https://x.example/a?b=1&c=2',
  }];
  row.evidence = [{ field: 'training', url: 'https://x.example/a?b=1&c=2', quote: '<script>alert(4)</script>', retrieved: '2026-09-30' }];
  row.compliance = { dpa: 'public' };
  const html = renderBrief(row, meta);
  assert.ok(!/<script>alert/.test(html), 'raw script tag leaked into output');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'detail not escaped');
  assert.ok(html.includes('&lt;script&gt;alert(3)&lt;/script&gt;'), 'incident summary not escaped');
  assert.ok(html.includes('&lt;script&gt;alert(4)&lt;/script&gt;'), 'evidence quote not escaped');
  assert.ok(html.includes('Evil &lt;img src=x onerror=alert(2)&gt;'), 'name not escaped');
  assert.ok(html.includes('a &quot;quoted&quot; &amp; &lt;i&gt;note&lt;/i&gt;'), 'notes not escaped');
  assert.ok(html.includes('href="https://x.example/a?b=1&amp;c=2"'), 'url not attribute-escaped');
  assert.equal(escapeHtml('<&>"\''), '&lt;&amp;&gt;&quot;&#39;');
  assert.equal(escapeHtml(null), '');
});

test('plainEnglish phrases every VOCAB value without undefined/null', () => {
  const builders = {
    'training.default': (v) => { const r = base(); r.training.default = v; r.training.optOut = 'setting'; return r; },
    'training.optOut': (v) => { const r = base(); r.training.default = 'on'; r.training.optOut = v; return r; },
    'retention.kind': (v) => { const r = base(); r.retention = { label: 'l', detail: 'd', kind: v }; if (v === 'fixed') r.retention.days = 7; return r; },
    'zdr.access': (v) => { const r = base(); r.zdr.access = v; return r; },
    'compliance.dpa': (v) => { const r = base(); r.compliance = { dpa: v }; return r; },
    'compliance.soc2': (v) => { const r = base(); r.compliance = { soc2: v }; return r; },
    'compliance.hipaaBaa': (v) => { const r = base(); r.compliance = { hipaaBaa: v }; return r; },
    'incidents.type': (v) => { const r = base(); r.incidents = [{ date: '2026-01', type: v, confirmed: true, summary: 's', sourceUrl: 'https://x.example/i' }]; return r; },
  };
  for (const [field, values] of Object.entries(VOCAB)) {
    assert.ok(builders[field], `no test builder for ${field}`);
    assert.deepEqual(Object.keys(PLAIN[field]).sort(), [...values].sort(), `${field}: PLAIN does not cover the vocabulary`);
    for (const value of values) {
      assert.equal(typeof PLAIN[field][value], 'function', `${field}.${value}: no phrase`);
      const sentences = plainEnglish(builders[field](value));
      assert.ok(sentences.length > 0, `${field}.${value}: no sentence produced`);
      const text = sentences.join(' ');
      assert.ok(!/undefined|\bnull\b/.test(text), `${field}.${value}: "${text}"`);
      assert.ok(text.trim().length > 0);
    }
  }
});

test('plainEnglish reads the structured fields', () => {
  const row = base();
  assert.deepEqual(plainEnglish(row), [
    'Does not train on your data by default',
    'Keeps your data for 30 days',
    'Zero data retention: on by default',
    'Processing location: the US',
  ]);

  row.training = { label: 'On', detail: 'd', default: 'on', optOut: 'setting' };
  assert.equal(plainEnglish(row)[0], 'Trains on your data by default; you can opt out in settings');

  row.training = { label: 'Off', detail: 'd', default: 'off', optOut: 'setting' };
  assert.equal(plainEnglish(row)[0], 'Does not train on your data by default');

  row.zdr = { label: 'l', detail: 'd', status: 'none', access: 'self-serve' };
  assert.ok(plainEnglish(row).includes('Zero data retention: switch it on yourself'));

  row.location = { label: 'l', flag: '❓', detail: 'd', regions: [] };
  assert.ok(plainEnglish(row).includes('Processing location not disclosed'));

  row.training = { label: 'l', detail: 'd', default: 'silent', optOut: 'silent' };
  assert.ok(plainEnglish(row).some((s) => s.includes("Documents don't say")));
});

test('incident background renders inside the Incidents section', () => {
  const withIncidents = rows.find((r) => r.incidents.length && r.incidentDetail);
  const html = renderBrief(withIncidents, meta);
  const marker = 'class="incident-background"';
  assert.ok(html.includes(marker), 'missing incident background');
  assert.ok(html.indexOf('<h2>Incidents</h2>') < html.indexOf(marker), 'background is outside the Incidents section');

  const onlyBackground = base();
  onlyBackground.incidentDetail = 'Mar 2023: something happened.';
  const bare = renderBrief(onlyBackground, meta);
  assert.ok(bare.includes('<h2>Incidents</h2>'));
  assert.ok(bare.includes('Mar 2023: something happened.'));
});

test('sitemap lists the tracker root, /api-docs and every brief page', () => {
  const xml = renderSitemap(rows, meta);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.equal(locs.length, 98);
  assert.ok(locs.includes(`${SITE}/api-docs`));
  assert.equal(locs.length, 2 + rows.length);
  assert.equal(locs[0], `${SITE}/`);
  for (const row of rows) {
    assert.ok(locs.includes(`${SITE}/p/${row.id}`), `${row.id}: missing from sitemap`);
    assert.ok(xml.includes(`<loc>${SITE}/p/${row.id}</loc>\n    <lastmod>${row.sourceDate}</lastmod>`), `${row.id}: lastmod is not sourceDate`);
  }
});

test('long incident histories collapse to one at-a-glance line', () => {
  const r = structuredClone(rows.find((x) => x.id === 'deepseek-api'));
  const lines = plainEnglish(r).filter((l) => /incident|allegation|Confirmed|Alleged/.test(l));
  assert.equal(lines.length, 1);
  assert.match(lines[0], /^\d+ confirmed incidents \(.+ – .+\); see Incidents below$/);
});

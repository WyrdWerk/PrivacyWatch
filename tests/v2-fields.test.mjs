import test from 'node:test';
import assert from 'node:assert/strict';
import { validateV2, coverage } from '../scripts/lib/v2-fields.mjs';

const base = () => ({
  id: 'x-api',
  incident: false,
  training: { label: 'Off', detail: 'd' },
  retention: { label: '30 days', detail: 'd' },
  zdr: { label: 'Yes', detail: 'd', status: 'full' },
  location: { label: 'US', flag: '🇺🇸', detail: 'd' },
});

const ev = (field) => ({ field, url: 'https://x.example/terms', quote: 'q', retrieved: '2026-09-30' });

test('v1-only rows pass (all v2 fields are optional)', () => {
  assert.deepEqual(validateV2(base()), []);
});

test('a fully structured row passes', () => {
  const p = base();
  p.training.default = 'off';
  p.training.optOut = 'not-needed';
  p.retention.kind = 'fixed';
  p.retention.days = 30;
  p.zdr.access = 'approval';
  p.location.regions = ['US', 'EU'];
  p.compliance = { dpa: 'public', soc2: 'type2', hipaaBaa: 'enterprise' };
  p.incidents = [];
  p.evidence = [ev('training'), ev('retention'), ev('zdr'), ev('location'), ev('compliance')];
  assert.deepEqual(validateV2(p), []);
});

test('rejects values outside the closed vocabularies', () => {
  const p = base();
  p.training.default = 'mostly-off';
  p.training.optOut = 'carrier-pigeon';
  p.retention.kind = 'forever';
  p.zdr.access = 'maybe';
  p.compliance = { dpa: 'yes', soc2: 'type3', hipaaBaa: 'sure' };
  p.evidence = [ev('training'), ev('retention'), ev('zdr'), ev('compliance')];
  const errs = validateV2(p);
  for (const f of ['training.default', 'training.optOut', 'retention.kind', 'zdr.access', 'compliance.dpa', 'compliance.soc2', 'compliance.hipaaBaa']) {
    assert.ok(errs.some((e) => e.includes(f)), `expected error for ${f}: ${errs.join(' | ')}`);
  }
});

test('retention.days is required for kind=fixed and forbidden otherwise', () => {
  const p = base();
  p.retention.kind = 'fixed';
  p.evidence = [ev('retention')];
  assert.ok(validateV2(p).some((e) => e.includes('retention.days')));
  p.retention.days = 0;
  assert.ok(validateV2(p).some((e) => e.includes('retention.days')));
  p.retention.days = 30;
  assert.deepEqual(validateV2(p), []);
  p.retention.kind = 'indefinite';
  assert.ok(validateV2(p).some((e) => e.includes('retention.days')));
});

test('location.regions must be ISO alpha-2 codes, EU, or GLOBAL', () => {
  const p = base();
  p.location.regions = ['US', 'usa', 'Europe'];
  p.evidence = [ev('location')];
  const errs = validateV2(p);
  assert.ok(errs.some((e) => e.includes('usa')));
  assert.ok(errs.some((e) => e.includes('Europe')));
  p.location.regions = ['US', 'EU', 'GLOBAL', 'CN'];
  assert.deepEqual(validateV2(p), []);
});

test('a structured value needs at least one evidence entry for its field', () => {
  const p = base();
  p.training.default = 'off';
  p.zdr.access = 'self-serve';
  p.evidence = [ev('training')];
  const errs = validateV2(p);
  assert.ok(errs.some((e) => e.includes('zdr') && e.includes('evidence')));
  assert.ok(!errs.some((e) => e.includes('training') && e.includes('evidence')));
});

test('evidence entries are well-formed', () => {
  const p = base();
  p.evidence = [
    { field: 'vibes', url: 'https://x.example', retrieved: '2026-09-30' },
    { field: 'training', url: 'http://insecure.example', retrieved: '2026-09-30' },
    { field: 'training', url: 'https://x.example', retrieved: 'last week' },
  ];
  const errs = validateV2(p);
  assert.ok(errs.some((e) => e.includes('vibes')));
  assert.ok(errs.some((e) => e.includes('https')));
  assert.ok(errs.some((e) => e.includes('retrieved')));
});

test('quote is required unless the value is silent', () => {
  const p = base();
  p.training.default = 'silent';
  p.evidence = [{ field: 'training', url: 'https://x.example/tos', retrieved: '2026-09-30' }];
  assert.deepEqual(validateV2(p), []);
  p.training.default = 'on';
  assert.ok(validateV2(p).some((e) => e.includes('quote')));
});

test('incident flag must agree with confirmed, non-allegation incidents', () => {
  const p = base();
  p.incidents = [{ date: '2026-02', type: 'allegation', confirmed: false, summary: 's', sourceUrl: 'https://n.example' }];
  assert.deepEqual(validateV2(p), []);
  p.incident = true;
  assert.ok(validateV2(p).some((e) => e.includes('incident')));
  p.incidents.push({ date: '2025-01', type: 'breach', confirmed: true, summary: 's', sourceUrl: 'https://n.example' });
  assert.deepEqual(validateV2(p), []);
});

test('incident entries are well-formed', () => {
  const p = base();
  p.incident = true;
  p.incidents = [{ date: 'Jan 2025', type: 'hack', confirmed: 'yes', summary: '', sourceUrl: 'nope' }];
  const errs = validateV2(p);
  for (const f of ['date', 'type', 'confirmed', 'summary', 'sourceUrl']) {
    assert.ok(errs.some((e) => e.includes(`incidents[0].${f}`)), `expected error for ${f}`);
  }
});

test('coverage counts structured core fields per row', () => {
  const a = base();
  a.training.default = 'off';
  a.retention.kind = 'silent';
  const b = base();
  const c = coverage([a, b]);
  assert.equal(c.total, 2);
  assert.equal(c.fields['training.default'], 1);
  assert.equal(c.fields['retention.kind'], 1);
  assert.equal(c.fields['zdr.access'], 0);
  assert.equal(c.complete, 0);
});

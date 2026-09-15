import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logoMap, PROVIDER_LOGOS } from '../scripts/lib/logos.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

test('every provider family has a mapped local PNG', () => {
  const providers = JSON.parse(fs.readFileSync(path.join(root, 'providers.json'), 'utf-8')).providers;
  const map = logoMap();
  const missing = [];
  for (const name of [...new Set(providers.map((p) => p.name))]) {
    const slug = map[name];
    if (!slug) {
      missing.push(`${name}: no mapping`);
      continue;
    }
    const pngPath = path.join(root, 'assets', 'logos', `${slug}.png`);
    if (!fs.existsSync(pngPath)) missing.push(`${name}: missing ${slug}.png`);
    else {
      const buf = fs.readFileSync(pngPath);
      if (buf.length < 32 || !buf.subarray(0, 4).equals(PNG_SIG)) {
        missing.push(`${name}: ${slug}.png is not a PNG`);
      }
    }
  }
  assert.deepEqual(missing, []);
});

test('logo slugs are unique and catalog matches PROVIDER_LOGOS', () => {
  const slugs = Object.values(PROVIDER_LOGOS).map((e) => e.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.equal(Object.keys(logoMap()).length, Object.keys(PROVIDER_LOGOS).length);
});

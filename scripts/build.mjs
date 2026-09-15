#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildManifest } from './lib/manifest.mjs';
import { logoMap } from './lib/logos.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

const FILES = [
  'index.html',
  'providers.json',
  'robots.txt',
  'sitemap.xml',
  '_headers',
  '_redirects',
];

const DIRS = ['assets'];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

function injectLogoMap(html) {
  const json = JSON.stringify(logoMap());
  const needle = /const LOGO_MAP = \/\*LOGO_MAP\*\/[\s\S]*?;/;
  if (!needle.test(html)) {
    console.error('Failed to inject LOGO_MAP into index.html (marker missing)');
    process.exit(1);
  }
  return html.replace(needle, `const LOGO_MAP = /*LOGO_MAP*/ ${json};`);
}

for (const file of FILES) {
  const src = path.join(root, file);
  if (!fs.existsSync(src)) {
    console.error(`Missing required file: ${file}`);
    process.exit(1);
  }
  if (file === 'index.html') {
    fs.writeFileSync(path.join(dist, file), injectLogoMap(fs.readFileSync(src, 'utf-8')));
  } else {
    fs.copyFileSync(src, path.join(dist, file));
  }
}

for (const dir of DIRS) {
  const src = path.join(root, dir);
  if (!fs.existsSync(src)) {
    console.error(`Missing required directory: ${dir}`);
    process.exit(1);
  }
  copyDir(src, path.join(dist, dir));
}

// Derived watch manifest for the watcher Worker — always in sync with providers.json.
const providers = JSON.parse(fs.readFileSync(path.join(root, 'providers.json'), 'utf-8')).providers || [];
const manifest = buildManifest(providers);
fs.writeFileSync(path.join(dist, 'watch-urls.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log(`Built production artifact in dist/ (${FILES.length} files + ${DIRS.length} dirs, watch manifest: ${manifest.urls.length} distinct URLs)`);

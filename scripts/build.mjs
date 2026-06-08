#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

for (const file of FILES) {
  const src = path.join(root, file);
  if (!fs.existsSync(src)) {
    console.error(`Missing required file: ${file}`);
    process.exit(1);
  }
  fs.copyFileSync(src, path.join(dist, file));
}

for (const dir of DIRS) {
  const src = path.join(root, dir);
  if (!fs.existsSync(src)) {
    console.error(`Missing required directory: ${dir}`);
    process.exit(1);
  }
  copyDir(src, path.join(dist, dir));
}

console.log(`Built production artifact in dist/ (${FILES.length} files + ${DIRS.length} dirs)`);

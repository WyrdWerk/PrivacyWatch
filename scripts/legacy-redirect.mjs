#!/usr/bin/env node
/**
 * Deploy a 301 redirect from the pre-migration Cloudflare Pages project to production.
 * Run after custom domain is live: npm run deploy:legacy-redirect
 *
 * Requires LEGACY_PAGES_PROJECT in the environment (see .env.example).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const TARGET = process.env.PRIVACYWATCH_URL || process.env.POLICYWATCH_URL || 'https://privacywatch.wyrdwerk.com';
const LEGACY_PAGES_PROJECT = process.env.LEGACY_PAGES_PROJECT;

if (!LEGACY_PAGES_PROJECT) {
  console.error('LEGACY_PAGES_PROJECT is required. Copy .env.example → .env and set the legacy Pages project name.');
  process.exit(1);
}

const tmp = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.legacy-redirect');
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, '_redirects'), `/* ${TARGET}/:splat 301\n`);

console.log(`Deploying legacy Pages redirect (${LEGACY_PAGES_PROJECT}) → ${TARGET}…`);
execSync(
  `npx wrangler pages deploy "${tmp}" --project-name ${LEGACY_PAGES_PROJECT} --commit-dirty=true`,
  { stdio: 'inherit' }
);

#!/usr/bin/env node
/**
 * Deploy a 301 redirect from the legacy modelwatch Pages project to production.
 * Run after custom domain is live: npm run deploy:legacy-redirect
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const TARGET = process.env.POLICYWATCH_URL || 'https://policywatch.wyrdwerk.com';
const tmp = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.legacy-redirect');
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, '_redirects'), `/* ${TARGET}/:splat 301\n`);

console.log(`Deploying modelwatch → ${TARGET} redirect…`);
execSync(
  `npx wrangler pages deploy "${tmp}" --project-name modelwatch --commit-dirty=true`,
  { stdio: 'inherit' }
);

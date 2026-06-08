#!/usr/bin/env node
/**
 * Configure account-level Cloudflare Bulk Redirect:
 *   PAGES_DEV_HOST/* -> POLICYWATCH_URL/:splat (301)
 *
 * Requires API token permissions:
 *   - Account Filter Lists Edit
 *   - Account Rulesets Write (or Mass URL Redirects Write)
 *
 * Run locally or via: npm run setup:bulk-redirect
 * GitHub Actions: workflow_dispatch on .github/workflows/bulk-redirect.yml
 */
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const PAGES_DEV_HOST = (process.env.PAGES_DEV_HOST || 'policywatch-8j7.pages.dev').replace(/^https?:\/\//, '').replace(/\/$/, '');
const TARGET = (process.env.POLICYWATCH_URL || 'https://policywatch.wyrdwerk.com').replace(/\/$/, '');
const LIST_NAME = 'policywatch_pages_dev_redirect';
const RULE_REF = 'policywatch_pages_dev_redirect_rule';

if (!ACCOUNT_ID || !TOKEN) {
  console.error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required.');
  process.exit(1);
}

const API = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}`;

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await res.json();
  if (!body.success) {
    const msg = body.errors?.map((e) => e.message).join('; ') || res.statusText;
    throw new Error(`Cloudflare API ${path}: ${msg}`);
  }
  return body.result;
}

async function waitForBulkOp(operationId) {
  for (let i = 0; i < 30; i++) {
    const result = await api(`/rules/lists/bulk_operations/${operationId}`);
    if (result.status === 'completed') return;
    if (result.status === 'failed') throw new Error(`Bulk operation failed: ${operationId}`);
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Bulk operation timed out: ${operationId}`);
}

async function findOrCreateList() {
  const lists = await api('/rules/lists');
  const existing = lists.find((l) => l.name === LIST_NAME && l.kind === 'redirect');
  if (existing) {
    console.log(`Using existing redirect list: ${LIST_NAME} (${existing.id})`);
    return existing.id;
  }

  const created = await api('/rules/lists', {
    method: 'POST',
    body: JSON.stringify({
      name: LIST_NAME,
      description: 'Redirect PolicyWatch Pages fallback hostname to custom domain',
      kind: 'redirect',
    }),
  });
  console.log(`Created redirect list: ${LIST_NAME} (${created.id})`);
  return created.id;
}

async function syncListItems(listId) {
  const items = [
    {
      redirect: {
        source_url: `${PAGES_DEV_HOST}/`,
        target_url: `${TARGET}/`,
        status_code: 301,
        preserve_query_string: true,
        preserve_path_suffix: true,
      },
    },
    {
      redirect: {
        source_url: `${PAGES_DEV_HOST}`,
        target_url: TARGET,
        status_code: 301,
        preserve_query_string: true,
      },
    },
  ];

  const op = await api(`/rules/lists/${listId}/items`, {
    method: 'POST',
    body: JSON.stringify(items),
  });

  if (op.operation_id) {
    console.log(`Waiting for list item bulk operation ${op.operation_id}…`);
    await waitForBulkOp(op.operation_id);
  }
  console.log(`Redirect list items synced for ${PAGES_DEV_HOST} -> ${TARGET}`);
}

async function ensureBulkRedirectRule() {
  let ruleset;
  try {
    ruleset = await api('/rulesets/phases/http_request_redirect/entrypoint');
  } catch {
    ruleset = null;
  }

  const newRule = {
    ref: RULE_REF,
    expression: `http.request.full_uri in $${LIST_NAME}`,
    description: 'PolicyWatch: redirect Pages fallback hostname to custom domain',
    action: 'redirect',
    enabled: true,
    action_parameters: {
      from_list: {
        name: LIST_NAME,
        key: 'http.request.full_uri',
      },
    },
  };

  if (!ruleset) {
    const created = await api('/rulesets', {
      method: 'POST',
      body: JSON.stringify({
        name: 'PolicyWatch bulk redirects',
        kind: 'root',
        phase: 'http_request_redirect',
        rules: [newRule],
      }),
    });
    console.log(`Created http_request_redirect ruleset (${created.id})`);
    return;
  }

  const rules = ruleset.rules || [];
  const hasRule = rules.some(
    (r) => r.ref === RULE_REF || r.expression === newRule.expression
  );

  if (hasRule) {
    console.log('Bulk redirect rule already present; skipping ruleset update.');
    return;
  }

  const updated = await api(`/rulesets/${ruleset.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: ruleset.name || 'PolicyWatch bulk redirects',
      kind: ruleset.kind || 'root',
      phase: 'http_request_redirect',
      rules: [...rules, newRule],
    }),
  });
  console.log(`Updated http_request_redirect ruleset (${updated.id}) with PolicyWatch redirect rule`);
}

async function main() {
  console.log(`Configuring bulk redirect: ${PAGES_DEV_HOST} -> ${TARGET}`);
  const listId = await findOrCreateList();
  await syncListItems(listId);
  await ensureBulkRedirectRule();
  console.log('Bulk redirect setup complete.');
  console.log(`Verify: curl -sI https://${PAGES_DEV_HOST}/ | grep -i location`);
}

main().catch((err) => {
  console.error(err.message);
  console.error('\nIf the API token lacks Bulk Redirect permissions, use the dashboard steps in README.md.');
  process.exit(1);
});

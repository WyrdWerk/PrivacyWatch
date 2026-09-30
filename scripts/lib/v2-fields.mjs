// Structured ("v2") provider fields. All optional and additive: v1 rows with only
// label/detail text stay valid. When a structured value is present it must use
// the closed vocabulary below and be backed by at least one evidence entry.
//
// "silent" = we read the document and it does not address this.
// A missing field = not researched yet. Never conflate the two.

export const VOCAB = {
  'training.default': ['off', 'on', 'opt-in', 'tier-dependent', 'silent', 'conflicting'],
  'training.optOut': ['setting', 'api-param', 'email', 'contract', 'not-needed', 'none', 'silent'],
  'retention.kind': ['none', 'transient', 'fixed', 'until-deleted', 'indefinite', 'silent'],
  'zdr.access': ['default', 'self-serve', 'approval', 'enterprise', 'none', 'silent'],
  'compliance.dpa': ['public', 'on-request', 'enterprise', 'none', 'silent'],
  'compliance.soc2': ['type1', 'type2', 'none', 'silent'],
  'compliance.hipaaBaa': ['available', 'enterprise', 'none', 'silent'],
  'incidents.type': ['breach', 'regulatory', 'ban', 'allegation'],
};

export const EVIDENCE_FIELDS = ['training', 'retention', 'zdr', 'location', 'compliance', 'incidents'];

// Core fields that make a row "structured" for coverage reporting.
const CORE = ['training.default', 'retention.kind', 'zdr.access', 'location.regions'];

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH = /^\d{4}-\d{2}(-\d{2})?$/;
const REGION = /^([A-Z]{2}|EU|GLOBAL)$/;

function isHttps(url) {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

function get(p, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), p);
}

// Values a field group carries, used to decide whether evidence is required and
// whether a quote can be omitted (only when every value in the group is "silent").
function groupValues(p, field) {
  switch (field) {
    case 'training': return [p.training?.default, p.training?.optOut];
    case 'retention': return [p.retention?.kind];
    case 'zdr': return [p.zdr?.access];
    case 'location': return p.location?.regions ? [p.location.regions.length ? 'set' : 'silent'] : [];
    case 'compliance': return p.compliance ? Object.values(p.compliance) : [];
    default: return [];
  }
}

export function validateV2(p) {
  const id = p.id || '?';
  const errors = [];
  const err = (msg) => errors.push(`${id}: ${msg}`);

  for (const [path, allowed] of Object.entries(VOCAB)) {
    if (path.startsWith('incidents.')) continue;
    const v = get(p, path);
    if (v !== undefined && !allowed.includes(v)) err(`${path} "${v}" not in [${allowed.join(', ')}]`);
  }
  if (p.compliance) {
    for (const k of Object.keys(p.compliance)) {
      if (!VOCAB[`compliance.${k}`]) err(`compliance.${k} is not a known field`);
    }
  }

  const { kind, days } = p.retention ?? {};
  if (kind === 'fixed' && !(Number.isInteger(days) && days > 0)) err('retention.days must be a positive integer when retention.kind is "fixed"');
  if (kind !== undefined && kind !== 'fixed' && days != null) err('retention.days is only allowed when retention.kind is "fixed"');

  const regions = p.location?.regions;
  if (regions !== undefined) {
    if (!Array.isArray(regions)) err('location.regions must be an array');
    else for (const r of regions) if (!REGION.test(r)) err(`location.regions "${r}" must be an ISO 3166-1 alpha-2 code, EU, or GLOBAL`);
  }

  const evidence = p.evidence ?? [];
  if (!Array.isArray(evidence)) err('evidence must be an array');
  evidence.forEach((e, i) => {
    if (!EVIDENCE_FIELDS.includes(e.field)) err(`evidence[${i}].field "${e.field}" not in [${EVIDENCE_FIELDS.join(', ')}]`);
    if (!isHttps(e.url)) err(`evidence[${i}].url must be an absolute https URL`);
    if (!DATE.test(e.retrieved ?? '')) err(`evidence[${i}].retrieved must be YYYY-MM-DD`);
  });

  for (const field of EVIDENCE_FIELDS) {
    const values = groupValues(p, field).filter((v) => v !== undefined);
    if (!values.length) continue;
    const refs = evidence.filter((e) => e.field === field);
    if (!refs.length) {
      err(`${field} has structured values but no evidence entry`);
      continue;
    }
    const allSilent = values.every((v) => v === 'silent');
    if (!allSilent && !refs.some((e) => e.quote && e.quote.trim())) err(`${field} evidence needs a quote unless the value is "silent"`);
  }

  if (p.incidents !== undefined) {
    if (!Array.isArray(p.incidents)) {
      err('incidents must be an array');
    } else {
      p.incidents.forEach((inc, i) => {
        if (!MONTH.test(inc.date ?? '')) err(`incidents[${i}].date must be YYYY-MM or YYYY-MM-DD`);
        if (!VOCAB['incidents.type'].includes(inc.type)) err(`incidents[${i}].type "${inc.type}" not in [${VOCAB['incidents.type'].join(', ')}]`);
        if (typeof inc.confirmed !== 'boolean') err(`incidents[${i}].confirmed must be a boolean`);
        if (!inc.summary || !inc.summary.trim()) err(`incidents[${i}].summary is required`);
        if (!isHttps(inc.sourceUrl)) err(`incidents[${i}].sourceUrl must be an absolute https URL`);
      });
      const flagged = p.incidents.some((inc) => inc.confirmed === true && inc.type !== 'allegation');
      if (Boolean(p.incident) !== flagged) err(`incident (${Boolean(p.incident)}) must equal whether any confirmed, non-allegation incident exists (${flagged})`);
    }
  }

  return errors;
}

export function coverage(providers) {
  const fields = Object.fromEntries(CORE.map((f) => [f, 0]));
  let complete = 0;
  for (const p of providers) {
    let all = true;
    for (const f of CORE) {
      if (get(p, f) !== undefined) fields[f] += 1;
      else all = false;
    }
    if (all) complete += 1;
  }
  return { total: providers.length, complete, fields };
}

'use strict';

// Provider definition parsing and correlation (BUILD-SPEC 11.3, 11.4).
// Classification is BY CONTENT, never by host or path: provider endpoints move, and the
// fixture suite serves definitions from localhost.

const MAX_FIELDS = 400;
const MAX_NAME = 200;
const MAX_LABEL = 200;
const MAX_DEFAULT = 300;
const MAX_NODES = 50000;

const GUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const JSONP_RE = /^[^(]*\(([\s\S]*)\)\s*;?\s*$/;

function cut(value, max) {
  if (typeof value !== 'string') return null;
  return value.length > max ? value.slice(0, max) : value;
}

function originAndPath(url) {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return String(url || '').split('?')[0].slice(0, 300);
  }
}

// Iterative walk with a node budget and a cycle guard. Returns false if the budget blew.
function walkTree(root, visit) {
  const stack = [root];
  const seen = new Set();
  let count = 0;
  while (stack.length) {
    const node = stack.pop();
    if (node === null || typeof node !== 'object') continue;
    if (seen.has(node)) continue;
    seen.add(node);
    if (++count > MAX_NODES) return false;
    if (visit(node) === false) return true;
    // Push children in reverse so popping yields document order.
    const kids = [];
    if (Array.isArray(node)) {
      for (const v of node) if (v && typeof v === 'object') kids.push(v);
    } else {
      for (const k of Object.keys(node)) {
        const v = node[k];
        if (v && typeof v === 'object') kids.push(v);
      }
    }
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
  }
  return true;
}

function parseBody(body, contentType) {
  const text = String(body);
  try {
    return { value: JSON.parse(text), jsonp: false };
  } catch { /* fall through to the JSONP shape */ }
  const m = JSONP_RE.exec(text.trim());
  if (m) {
    try {
      return { value: JSON.parse(m[1]), jsonp: true };
    } catch { /* not a definition */ }
  }
  void contentType;
  return null;
}

function looksHubspot(root) {
  let hit = false;
  walkTree(root, (node) => {
    if (Array.isArray(node)) return undefined;
    if (Object.hasOwn(node, 'formFieldGroups') || Object.hasOwn(node, 'fieldGroups')) {
      hit = true;
      return false;
    }
    return undefined;
  });
  return hit;
}

function looksMarketo(root) {
  let hit = false;
  walkTree(root, (node) => {
    if (Array.isArray(node)) return undefined;
    if (typeof node.Name === 'string' && typeof node.Datatype === 'string') {
      hit = true;
      return false;
    }
    return undefined;
  });
  return hit;
}

function typeformHiddenNames(root) {
  let names = null;
  walkTree(root, (node) => {
    if (Array.isArray(node) || names) return undefined;
    const v = node.hidden;
    if (Array.isArray(v) && v.length > 0 && v.every((s) => typeof s === 'string')) {
      names = v;
      return false;
    }
    return undefined;
  });
  return names;
}

function hubspotFields(root) {
  const fields = [];
  walkTree(root, (node) => {
    if (Array.isArray(node) || fields.length >= MAX_FIELDS) return undefined;
    if (typeof node.name !== 'string') return undefined;
    const hasType = typeof node.fieldType === 'string';
    const hasHidden = typeof node.hidden === 'boolean';
    if (!hasType && !hasHidden) return undefined;
    let def = null;
    if (typeof node.defaultValue === 'string') def = node.defaultValue;
    else if (Array.isArray(node.selectedOptions) && typeof node.selectedOptions[0] === 'string') {
      def = node.selectedOptions[0];
    }
    fields.push({
      name: cut(node.name, MAX_NAME),
      label: cut(node.label, MAX_LABEL),
      fieldType: hasType ? cut(node.fieldType, MAX_NAME) : null,
      hidden: hasHidden ? node.hidden === true : null,
      defaultValue: cut(def, MAX_DEFAULT),
      required: typeof node.required === 'boolean' ? node.required : null,
      autofill: null,
    });
    return undefined;
  });
  return fields;
}

function marketoFields(root) {
  const fields = [];
  walkTree(root, (node) => {
    if (Array.isArray(node) || fields.length >= MAX_FIELDS) return undefined;
    if (typeof node.Name !== 'string' || typeof node.Datatype !== 'string') return undefined;
    const channel = node.InputSourceChannel;
    fields.push({
      name: cut(node.Name, MAX_NAME),
      label: cut(node.Label, MAX_LABEL),
      fieldType: cut(node.Datatype, MAX_NAME),
      hidden: node.Datatype === 'hidden',
      defaultValue: cut(node.InputInitialValue, MAX_DEFAULT),
      required: typeof node.Required === 'boolean' ? node.Required : null,
      autofill: typeof channel === 'string' && channel
        ? { channel: cut(channel, MAX_NAME), selector: cut(node.InputSourceSelector, MAX_NAME) }
        : null,
    });
    return undefined;
  });
  return fields;
}

function firstGuid(root, url) {
  let found = null;
  if (root && typeof root === 'object' && !Array.isArray(root)) {
    for (const key of ['guid', 'formId', 'id']) {
      const v = root[key];
      if (typeof v === 'string') {
        const m = GUID_RE.exec(v);
        if (m) { found = m[0]; break; }
      }
    }
  }
  if (!found) {
    const m = GUID_RE.exec(String(url || ''));
    if (m) found = m[0];
  }
  return found;
}

function marketoFormId(root, url) {
  try {
    const q = new URL(url).searchParams.get('form');
    if (q) return cut(q, MAX_NAME);
  } catch { /* relative or malformed url */ }
  if (root && typeof root === 'object' && !Array.isArray(root)) {
    if (typeof root.Id === 'string') return cut(root.Id, MAX_NAME);
    if (typeof root.Id === 'number') return String(root.Id);
  }
  return null;
}

// Returns a DefinitionResult, or null when the body is not a definition at all.
// Never throws.
function parseDefinitionBody({ url, body, contentType } = {}) {
  if (typeof body !== 'string' || body.length === 0) return null;
  const parsed = parseBody(body, contentType);
  if (!parsed) return null;
  const root = parsed.value;
  if (root === null || typeof root !== 'object') return null;

  const base = { sourceUrl: originAndPath(url), parseStatus: 'ok', truncated: false };

  try {
    if (looksHubspot(root)) {
      const fields = hubspotFields(root);
      return {
        ...base, provider: 'hubspot', providerFormId: firstGuid(root, url),
        truncated: fields.length >= MAX_FIELDS, fields,
        parseStatus: fields.length ? 'ok' : 'partial',
      };
    }
    if (looksMarketo(root)) {
      const fields = marketoFields(root);
      return {
        ...base, provider: 'marketo', providerFormId: marketoFormId(root, url),
        truncated: fields.length >= MAX_FIELDS, fields,
        parseStatus: fields.length ? 'ok' : 'partial',
      };
    }
    const tf = typeformHiddenNames(root);
    if (tf) {
      const names = tf.slice(0, MAX_FIELDS);
      return {
        ...base, provider: 'typeform', providerFormId: null,
        truncated: tf.length > names.length,
        fields: names.map((name) => ({
          name: cut(name, MAX_NAME), label: null, fieldType: null,
          hidden: true, defaultValue: null, required: null, autofill: null,
        })),
      };
    }
  } catch {
    return { ...base, provider: 'generic', providerFormId: null, parseStatus: 'failed', fields: [] };
  }
  return null;
}

// Typeform embed attributes on the PARENT page also declare hidden fields.
// data-tf-hidden="a=1,b=2" and data-tf-transitive-search-params="x,y".
function definitionsFromEmbedContainers(containers) {
  const out = [];
  for (const container of Array.isArray(containers) ? containers : []) {
    const data = (container && container.data) || {};
    const names = [];
    const hidden = data['tf-hidden'];
    if (typeof hidden === 'string') {
      for (const pair of hidden.split(',')) {
        const name = pair.split('=')[0].trim();
        if (name) names.push(name);
      }
    }
    const transitive = data['tf-transitive-search-params'];
    if (typeof transitive === 'string') {
      for (const name of transitive.split(',')) {
        const trimmed = name.trim();
        if (trimmed) names.push(trimmed);
      }
    }
    if (!names.length) continue;
    const seen = new Set();
    const fields = [];
    for (const name of names) {
      const key = name.toLowerCase();
      if (seen.has(key) || fields.length >= MAX_FIELDS) continue;
      seen.add(key);
      fields.push({
        name: cut(name, MAX_NAME), label: null, fieldType: null,
        hidden: true, defaultValue: null, required: null, autofill: null,
      });
    }
    out.push({
      provider: 'typeform',
      sourceUrl: 'embed-container',
      providerFormId: typeof data['tf-widget'] === 'string' ? cut(data['tf-widget'], MAX_NAME) : null,
      parseStatus: 'ok', truncated: false, fields,
    });
  }
  return out;
}

// forms: [{ formIndex, provider, providerFormId }]. Never guesses across multiple embeds.
function correlateDefinitions(forms, definitions) {
  const attached = new Map();
  const usedForms = new Set();
  const unmatched = [];
  const formList = Array.isArray(forms) ? forms : [];
  const defList = Array.isArray(definitions) ? definitions : [];

  const pending = [];
  for (const def of defList) {
    let hit = null;
    if (def.providerFormId) {
      const want = String(def.providerFormId).toLowerCase();
      const cands = formList.filter((f) => f.provider === def.provider && f.providerFormId &&
        String(f.providerFormId).toLowerCase() === want && !usedForms.has(f.formIndex));
      if (cands.length === 1) hit = cands[0];
    }
    if (hit) {
      attached.set(hit.formIndex, def);
      usedForms.add(hit.formIndex);
    } else {
      pending.push(def);
    }
  }

  for (const def of pending) {
    const formsOfProvider = formList.filter((f) => f.provider === def.provider && !usedForms.has(f.formIndex));
    const defsOfProvider = defList.filter((d) => d.provider === def.provider);
    if (formsOfProvider.length === 1 && defsOfProvider.length === 1) {
      attached.set(formsOfProvider[0].formIndex, def);
      usedForms.add(formsOfProvider[0].formIndex);
    } else {
      unmatched.push(def);
    }
  }

  return { attached, unmatched };
}

module.exports = {
  parseDefinitionBody, definitionsFromEmbedContainers, correlateDefinitions,
  MAX_FIELDS, MAX_NAME, MAX_DEFAULT,
};

'use strict';

// Attribution keys, sentinel values, run URLs and name matching (BUILD-SPEC 8, 12, Appendix A).

const ATTRIBUTION_KEYS = Object.freeze([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid', 'li_fat_id', 'ttclid',
]);

// Sentinel value = 'fitest-' + key with underscores turned into hyphens.
const SENTINELS = Object.freeze(Object.fromEntries(
  ATTRIBUTION_KEYS.map((k) => [k, `fitest-${k.replace(/_/g, '-')}`]),
));

const SENTINEL_LIST = Object.freeze(ATTRIBUTION_KEYS.map((k) => [k, SENTINELS[k]]));

// baselineUrl strips all twelve keys; probeUrl puts all twelve sentinels on. Every key is
// therefore always tested, and a pre-tagged requested URL cannot make a working capture
// read as a constant.
function buildRunUrls(requestedUrl) {
  const url = new URL(requestedUrl);
  let hadAttribution = false;
  for (const key of ATTRIBUTION_KEYS) {
    if (url.searchParams.has(key)) {
      hadAttribution = true;
      url.searchParams.delete(key);
    }
  }
  const baseline = new URL(url.toString());
  const probe = new URL(url.toString());
  for (const key of ATTRIBUTION_KEYS) probe.searchParams.set(key, SENTINELS[key]);
  return { baselineUrl: baseline.toString(), probeUrl: probe.toString(), hadAttribution };
}

function decodeOnce(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// Substring, not equality: providers wrap values (_fbc becomes fb.1.<ts>.fitest-fbclid).
// Returns every key whose sentinel is present, in contract key order. More than one means
// the field stores the landing URL rather than a single value.
function findSentinels(value) {
  if (typeof value !== 'string' || value.length === 0) return [];
  const hay = decodeOnce(value).toLowerCase();
  const found = [];
  for (const [key, sentinel] of SENTINEL_LIST) {
    if (hay.includes(sentinel)) found.push(key);
  }
  return found;
}

function findSentinel(value) {
  const all = findSentinels(value);
  return all.length ? all[0] : null;
}

function normalize(candidate) {
  return String(candidate).toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Needle -> key. Longest needle first so msclkid resolves before gclid is tried.
const NEEDLES = (() => {
  const pairs = ATTRIBUTION_KEYS.map((k) => [normalize(k), k]);
  pairs.push(['googleclickid', 'gclid'], ['facebookclickid', 'fbclid'], ['microsoftclickid', 'msclkid']);
  pairs.sort((a, b) => b[0].length - a[0].length);
  return Object.freeze(pairs);
})();

// Independent of population: does this string NAME an attribution key?
function matchKey(candidate) {
  if (candidate === null || candidate === undefined) return null;
  const norm = normalize(candidate);
  if (!norm) return null;
  for (const [needle, key] of NEEDLES) {
    if (norm.includes(needle)) return key;
  }
  return null;
}

// First non-null match over several candidate strings, in the order given.
function matchKeyOf(...candidates) {
  for (const c of candidates) {
    const key = matchKey(c);
    if (key) return key;
  }
  return null;
}

const UTM_KEYS = Object.freeze(ATTRIBUTION_KEYS.filter((k) => k.startsWith('utm_')));
const CLICK_ID_KEYS = Object.freeze(ATTRIBUTION_KEYS.filter((k) => !k.startsWith('utm_')));

module.exports = {
  ATTRIBUTION_KEYS, UTM_KEYS, CLICK_ID_KEYS, SENTINELS,
  buildRunUrls, findSentinels, findSentinel, matchKey, matchKeyOf, normalize,
};

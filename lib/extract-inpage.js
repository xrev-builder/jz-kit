'use strict';

// The function evaluated inside EVERY frame (BUILD-SPEC section 9).
//
// It must be self contained: Playwright ships its source into the page, so it closes over
// nothing from Node. It returns RAW FACTS as a JSON string, or null. All classification
// happens in Node, where it is unit testable.
//
// Everything in here runs in the page's own realm, where the page can have replaced any
// built-in. The bounds applied below are a courtesy that keeps ordinary pages small. The
// real controls are the length gate on the string that leaves the page, and the trusted
// rebuild in lib/sanitize.js.

/* eslint-disable no-var, vars-on-top */
function extractInPage(limits) {
  var L = limits || {};
  var MAX_NAME = L.maxName || 200;
  var MAX_CLASS_TOKEN = L.maxClassToken || 60;
  var MAX_LABEL = L.maxLabel || 120;
  var MAX_DATA = L.maxDataValue || 200;
  var MAX_TYPE = L.maxType || 30;
  var MAX_FIELDS_PER_FRAME = L.maxFieldsPerFrame || 1500;
  var MAX_FORMS = L.maxForms || 50;
  var MAX_FIELDS_PER_FORM = L.maxFieldsPerForm || 400;
  var MAX_SCRIPTS = L.maxScripts || 200;
  var MAX_VALUE = L.valueMax || 2000;
  var MAX_JSON = L.maxExtractionChars || 3000000;

  var BOT_MARKERS = ['cf-chl', 'px-captcha', 'captcha-delivery', 'cf-browser-verification',
    'challenge-platform', 'awswaf', 'incapsula-resource'];
  var EMBED_SELECTOR = '[data-form-id][data-portal-id], .hs-form-frame, .hs-form-html,' +
    ' [data-tf-widget], [data-tf-live], [data-tf-hidden],' +
    ' [data-tf-transitive-search-params], [data-form-block-id], [data-form-api-url]';
  var ORPHAN_GROUP_SELECTOR = '[role=form], .hs-form, .mktoForm, [class*="form" i]';
  var PROBED_GLOBALS = ['hbspt', 'MktoForms2', 'piTracker', '_elqQ', 'gform', 'JotForm'];
  var CUSTOM_CONTROL_TYPES = { checkbox: 1, radio: 1, file: 1 };

  var fieldBudget = MAX_FIELDS_PER_FRAME;

  function cut(value, max) {
    if (typeof value !== 'string') return null;
    return value.length > max ? value.substring(0, max) : value;
  }

  function attr(el, name) {
    try {
      var v = el.getAttribute(name);
      return typeof v === 'string' ? v : null;
    } catch (e) { return null; }
  }

  function lower(value) {
    return typeof value === 'string' ? value.toLowerCase() : '';
  }

  function styleOf(el) {
    try { return window.getComputedStyle(el); } catch (e) { return null; }
  }

  function rectOf(el) {
    try { return el.getBoundingClientRect(); } catch (e) { return null; }
  }

  // Parent walking crosses shadow boundaries.
  function parentOf(node) {
    if (!node) return null;
    try {
      if (node.parentElement) return node.parentElement;
      var root = node.getRootNode ? node.getRootNode() : null;
      if (root && root !== node && root.host) return root.host;
    } catch (e) { /* detached or hostile node */ }
    return null;
  }

  // querySelectorAll plus recursion into every shadow root found underneath.
  function deepQueryAll(root, selector) {
    var out = [];
    var stack = [root];
    var guard = 0;
    while (stack.length && guard++ < 5000) {
      var node = stack.pop();
      var found;
      try { found = node.querySelectorAll(selector); } catch (e) { found = null; }
      if (found) {
        for (var i = 0; i < found.length; i++) out.push(found[i]);
      }
      var all;
      try { all = node.querySelectorAll('*'); } catch (e) { all = null; }
      if (all) {
        for (var j = 0; j < all.length; j++) {
          try { if (all[j].shadowRoot) stack.push(all[j].shadowRoot); } catch (e) { /* closed */ }
        }
      }
    }
    return out;
  }

  function classTokens(el) {
    var raw = attr(el, 'class');
    if (!raw) return [];
    var parts = String(raw).split(/\s+/);
    var out = [];
    for (var i = 0; i < parts.length && out.length < 30; i++) {
      if (parts[i]) out.push(cut(parts[i], MAX_CLASS_TOKEN));
    }
    return out;
  }

  function isOffscreen(el) {
    var st = styleOf(el);
    if (!st) return false;
    var r = rectOf(el);
    if (!r) return false;
    if (st.position === 'absolute' || st.position === 'fixed') {
      var docLeft = r.left + (window.pageXOffset || 0);
      var docTop = r.top + (window.pageYOffset || 0);
      if (r.right < 0 || r.bottom < 0 || docLeft < -500 || docTop < -500) return true;
    }
    if (r.width <= 1 && r.height <= 1 && st.overflow === 'hidden') return true;
    return false;
  }

  function displayHidden(el) {
    var st = styleOf(el);
    if (st && st.display === 'none') return true;
    if (st && parseFloat(st.opacity) === 0) return true;
    try { if (el.hasAttribute && el.hasAttribute('hidden')) return true; } catch (e) { /* hostile */ }
    return false;
  }

  function visibilityHidden(el) {
    var st = styleOf(el);
    return !!st && (st.visibility === 'hidden' || st.visibility === 'collapse');
  }

  function formIsVisible(form) {
    var node = form;
    var guard = 0;
    while (node && node.nodeType === 1 && guard++ < 200) {
      if (displayHidden(node)) return false;
      if (visibilityHidden(node)) return false;
      node = parentOf(node);
    }
    var r = rectOf(form);
    if (r && r.width === 0 && r.height === 0) return false;
    return true;
  }

  function countFieldsUnder(el) {
    try { return deepQueryAll(el, 'input, select, textarea').length; } catch (e) { return 0; }
  }

  // Section 9.1, applied to a chain that runs [el, parent, ... up to but excluding the form].
  function findOrigin(chain, formVisible) {
    var i;
    // display:none, opacity 0 and the hidden attribute do NOT inherit: nearest node wins.
    for (i = 0; i < chain.length; i++) {
      if (displayHidden(chain[i])) return { node: chain[i], kind: 'css_hidden' };
    }
    if (!formVisible) return null;
    // visibility DOES inherit: the topmost hidden node is the real origin.
    for (i = chain.length - 1; i >= 0; i--) {
      if (visibilityHidden(chain[i])) return { node: chain[i], kind: 'css_hidden' };
    }
    for (i = 0; i < chain.length; i++) {
      if (isOffscreen(chain[i])) return { node: chain[i], kind: 'offscreen' };
    }
    return null;
  }

  function classifyHidden(el, formEl, formVisible, tag, type) {
    var notes = [];
    if (tag === 'input' && type === 'hidden') {
      return { hiddenKind: 'type_hidden', hiddenBy: 'self', notes: notes };
    }

    var chain = [];
    var node = el;
    var guard = 0;
    while (node && node !== formEl && node.nodeType === 1 && guard++ < 200) {
      chain.push(node);
      node = parentOf(node);
    }
    if (!formVisible) notes.push('form not visible; field visibility judged by display only');

    var origin = findOrigin(chain, formVisible);

    // Custom-control exemption: styled checkboxes, radios, files and selects routinely hide
    // the native element and show a stand-in. Only a wrapper or a section counts for them.
    var exempt = tag === 'select' || (tag === 'input' && CUSTOM_CONTROL_TYPES[type] === 1);
    if (origin && exempt && origin.node === el) {
      origin = findOrigin(chain.slice(1), formVisible);
    }
    if (!origin) return { hiddenKind: null, hiddenBy: null, notes: notes };

    var hiddenBy;
    if (origin.node === el) hiddenBy = 'self';
    else hiddenBy = countFieldsUnder(origin.node) <= 3 ? 'wrapper' : 'section';
    return { hiddenKind: origin.kind, hiddenBy: hiddenBy, notes: notes };
  }

  function labelFor(el) {
    try {
      var labels = el.labels;
      if (labels && labels.length && labels[0]) {
        var text = labels[0].innerText || labels[0].textContent;
        if (text && String(text).trim()) return cut(String(text).trim(), MAX_LABEL);
      }
    } catch (e) { /* hostile labels getter */ }
    var aria = attr(el, 'aria-label');
    if (aria && aria.trim()) return cut(aria.trim(), MAX_LABEL);
    var by = attr(el, 'aria-labelledby');
    if (by) {
      try {
        var target = (el.getRootNode ? el.getRootNode() : document).getElementById(by.split(/\s+/)[0]);
        if (target) {
          var t = target.innerText || target.textContent;
          if (t && String(t).trim()) return cut(String(t).trim(), MAX_LABEL);
        }
      } catch (e) { /* missing id */ }
    }
    var placeholder = attr(el, 'placeholder');
    if (placeholder && placeholder.trim()) return cut(placeholder.trim(), MAX_LABEL);
    return null;
  }

  function wrapperClassesOf(el) {
    var out = [];
    var node = parentOf(el);
    var guard = 0;
    while (node && node.nodeType === 1 && out.length < 3 && guard++ < 10) {
      out.push(classTokens(node));
      node = parentOf(node);
    }
    return out;
  }

  function ancestorClassesOf(el) {
    var out = [];
    var node = parentOf(el);
    var guard = 0;
    while (node && node.nodeType === 1 && out.length < 4 && guard++ < 12) {
      out.push(classTokens(node));
      node = parentOf(node);
    }
    return out;
  }

  // The nearest embed container ABOVE this form. A form-level signal, unlike the frame-wide
  // container list, which only ever feeds page-level providers.
  function embedAncestorOf(el) {
    var node = parentOf(el);
    var guard = 0;
    while (node && node.nodeType === 1 && guard++ < 30) {
      try {
        if (node.matches && node.matches(EMBED_SELECTOR)) {
          return { tag: lower(node.tagName), className: cut(attr(node, 'class'), MAX_NAME), data: dataAttributes(node) };
        }
      } catch (e) { /* no matches support */ }
      node = parentOf(node);
    }
    return null;
  }

  function selectorFor(el) {
    var parts = [];
    var node = el;
    var guard = 0;
    while (node && node.nodeType === 1 && guard++ < 6) {
      var part = lower(node.tagName);
      var id = attr(node, 'id');
      if (id) { parts.unshift(part + '#' + cut(id, 60)); break; }
      var tokens = classTokens(node);
      if (tokens.length) part += '.' + tokens[0];
      var parent = parentOf(node);
      try {
        if (parent && parent.children && parent.children.length > 1) {
          var same = 0;
          var index = 0;
          for (var i = 0; i < parent.children.length; i++) {
            if (parent.children[i].tagName === node.tagName) {
              same++;
              if (parent.children[i] === node) index = same;
            }
          }
          if (same > 1 && index > 0) part += ':nth-of-type(' + index + ')';
        }
      } catch (e) { /* hostile children */ }
      parts.unshift(part);
      node = parent;
    }
    return cut(parts.join(' > '), 200);
  }

  function readField(el, formEl, formVisible) {
    var tag = lower(el.tagName);
    var type = cut(lower(attr(el, 'type')), MAX_TYPE);
    if (tag === 'input' && !type) type = 'text';
    var hidden = classifyHidden(el, formEl, formVisible, tag, type);

    // The privacy rule at its source: a value is read ONLY for a hidden-kind field, and
    // never for a password input. Node enforces this again on everything handed over.
    var value = null;
    var valueTruncated = false;
    if (hidden.hiddenKind !== null && type !== 'password') {
      try {
        var raw = el.value;
        if (typeof raw === 'string') {
          if (raw.length > MAX_VALUE) { value = raw.substring(0, MAX_VALUE); valueTruncated = true; }
          else value = raw;
        }
      } catch (e) { /* hostile value accessor */ }
    }

    var checked = null;
    try { if (typeof el.checked === 'boolean') checked = el.checked; } catch (e) { /* ignore */ }

    return {
      tag: tag === 'input' || tag === 'select' || tag === 'textarea' ? tag : null,
      type: type,
      name: cut(attr(el, 'name'), MAX_NAME),
      id: cut(attr(el, 'id'), MAX_NAME),
      label: labelFor(el),
      required: !!attr(el, 'required'),
      autocomplete: cut(lower(attr(el, 'autocomplete')), MAX_TYPE),
      tabindex: cut(attr(el, 'tabindex'), 10),
      ariaHidden: attr(el, 'aria-hidden') === 'true',
      wrapperClasses: wrapperClassesOf(el),
      hiddenKind: hidden.hiddenKind,
      hiddenBy: hidden.hiddenBy,
      value: value,
      valueTruncated: valueTruncated,
      checked: checked,
      notes: hidden.notes,
    };
  }

  function fieldsOfForm(formEl, formVisible) {
    var seen = [];
    var out = [];
    function add(el) {
      if (out.length >= MAX_FIELDS_PER_FORM || fieldBudget <= 0) return;
      for (var i = 0; i < seen.length; i++) if (seen[i] === el) return;
      seen.push(el);
      fieldBudget--;
      out.push(readField(el, formEl, formVisible));
    }
    var direct = deepQueryAll(formEl, 'input, select, textarea');
    for (var i = 0; i < direct.length; i++) add(direct[i]);
    // form.elements also catches fields bound with the form="id" attribute.
    try {
      var elements = formEl.elements;
      if (elements) {
        for (var j = 0; j < elements.length; j++) {
          var el = elements[j];
          var tag = lower(el && el.tagName);
          if (tag === 'input' || tag === 'select' || tag === 'textarea') add(el);
        }
      }
    } catch (e) { /* not a real form element */ }
    return { fields: out, elements: seen };
  }

  function dataAttributes(el) {
    var out = {};
    try {
      var attrs = el.attributes;
      for (var i = 0; i < attrs.length && i < 40; i++) {
        var name = attrs[i].name;
        if (name.indexOf('data-') !== 0) continue;
        out[cut(name.substring(5), MAX_NAME)] = cut(String(attrs[i].value), MAX_DATA);
      }
    } catch (e) { /* hostile attributes */ }
    return out;
  }

  // Globals are tested with `name in window`. `typeof window[name]` would run a
  // page-defined getter.
  function hasGlobal(name) {
    try { return name in window; } catch (e) { return false; }
  }

  // A data property is what a real library defines. An accessor is page code: never run it.
  function safeGlobal(name) {
    try {
      if (!(name in window)) return null;
      var d = Object.getOwnPropertyDescriptor(window, name);
      if (!d || typeof d.get === 'function') return null;
      return d.value;
    } catch (e) { return null; }
  }

  function marketoProbe() {
    var api = safeGlobal('MktoForms2');
    if (!api || typeof api.allForms !== 'function') return null;
    try {
      var all = api.allForms();
      var length = all && typeof all.length === 'number' ? all.length : 0;
      if (length > 50) length = 50;
      var out = [];
      for (var i = 0; i < length; i++) {
        var form = all[i];
        if (!form) continue;
        var id = null;
        try { id = cut(String(form.getId()), MAX_NAME); } catch (e) { /* no id */ }
        var names = [];
        try {
          // NAMES ONLY. The value map never leaves the page: it carries visible-field
          // values, which the result contract forbids reading.
          var keys = Object.keys(form.getValues() || {});
          for (var k = 0; k < keys.length && k < 400; k++) names.push(cut(keys[k], MAX_NAME));
        } catch (e) { /* no values */ }
        out.push({ id: id, names: names });
      }
      return out;
    } catch (e) { return null; }
  }

  // ---- collection -------------------------------------------------------------------

  var formEls = deepQueryAll(document, 'form').slice(0, MAX_FORMS);
  var forms = [];
  var claimed = [];
  var i;

  for (i = 0; i < formEls.length; i++) {
    var formEl = formEls[i];
    var visible = formIsVisible(formEl);
    var collected = fieldsOfForm(formEl, visible);
    for (var c = 0; c < collected.elements.length; c++) claimed.push(collected.elements[c]);
    forms.push({
      attrs: {
        id: cut(attr(formEl, 'id'), MAX_NAME),
        name: cut(attr(formEl, 'name'), MAX_NAME),
        className: cut(attr(formEl, 'class'), MAX_NAME),
        action: cut(attr(formEl, 'action'), 500),
        method: cut(lower(attr(formEl, 'method')), MAX_TYPE),
        role: cut(lower(attr(formEl, 'role')), MAX_TYPE),
      },
      selector: selectorFor(formEl),
      ancestorClasses: ancestorClassesOf(formEl),
      embedAncestor: embedAncestorOf(formEl),
      inShadowDom: (function (el) {
        try {
          var root = el.getRootNode ? el.getRootNode() : null;
          return !!(root && root !== document && root.host);
        } catch (e) { return false; }
      })(formEl),
      visible: visible,
      classList: classTokens(formEl),
      pseudoForm: false,
      fields: collected.fields,
    });
  }

  // Orphans: fields that belong to no form at all.
  var allFields = deepQueryAll(document, 'input, select, textarea');
  var orphans = [];
  for (i = 0; i < allFields.length; i++) {
    var isClaimed = false;
    for (var q = 0; q < claimed.length; q++) if (claimed[q] === allFields[i]) { isClaimed = true; break; }
    if (!isClaimed) orphans.push(allFields[i]);
  }

  var groups = [];
  function groupFor(container) {
    for (var g = 0; g < groups.length; g++) if (groups[g].container === container) return groups[g];
    var made = { container: container, members: [] };
    groups.push(made);
    return made;
  }
  for (i = 0; i < orphans.length && forms.length + groups.length < MAX_FORMS; i++) {
    var container = null;
    var node = parentOf(orphans[i]);
    var guard = 0;
    while (node && node.nodeType === 1 && guard++ < 30) {
      try { if (node.matches && node.matches(ORPHAN_GROUP_SELECTOR)) { container = node; break; } }
      catch (e) { /* bad selector support */ }
      node = parentOf(node);
    }
    groupFor(container).members.push(orphans[i]);
  }

  for (i = 0; i < groups.length && forms.length < MAX_FORMS; i++) {
    var group = groups[i];
    var container = group.container;
    var groupVisible = container ? formIsVisible(container) : true;
    var fields = [];
    var hasHidden = false;
    var hasEmail = false;
    for (var m = 0; m < group.members.length && fields.length < MAX_FIELDS_PER_FORM; m++) {
      if (fieldBudget <= 0) break;
      fieldBudget--;
      var field = readField(group.members[m], container, groupVisible);
      if (field.hiddenKind !== null) hasHidden = true;
      if (field.type === 'email') hasEmail = true;
      fields.push(field);
    }
    // A group is only a form when it holds a hidden-kind field or an email input.
    if (!hasHidden && !hasEmail) continue;
    forms.push({
      attrs: {
        id: container ? cut(attr(container, 'id'), MAX_NAME) : null,
        name: null,
        className: container ? cut(attr(container, 'class'), MAX_NAME) : null,
        action: null,
        method: null,
        role: container ? cut(lower(attr(container, 'role')), MAX_TYPE) : null,
      },
      selector: container ? selectorFor(container) : 'document',
      ancestorClasses: container ? ancestorClassesOf(container) : [],
      embedAncestor: container ? embedAncestorOf(container) : null,
      inShadowDom: false,
      visible: groupVisible,
      classList: container ? classTokens(container) : [],
      pseudoForm: true,
      fields: fields,
    });
  }

  var scripts = [];
  var scriptEls = deepQueryAll(document, 'script[src]');
  for (i = 0; i < scriptEls.length && scripts.length < MAX_SCRIPTS; i++) {
    var src = attr(scriptEls[i], 'src');
    if (src) scripts.push(cut(src, 500));
  }

  var iframes = [];
  var iframeEls = deepQueryAll(document, 'iframe');
  for (i = 0; i < iframeEls.length && iframes.length < 60; i++) {
    iframes.push({
      src: cut(attr(iframeEls[i], 'src'), 500),
      id: cut(attr(iframeEls[i], 'id'), MAX_NAME),
      className: cut(attr(iframeEls[i], 'class'), MAX_NAME),
    });
  }

  var embedContainers = [];
  var embedEls = deepQueryAll(document, EMBED_SELECTOR);
  for (i = 0; i < embedEls.length && embedContainers.length < 30; i++) {
    embedContainers.push({
      tag: lower(embedEls[i].tagName),
      className: cut(attr(embedEls[i], 'class'), MAX_NAME),
      data: dataAttributes(embedEls[i]),
    });
  }

  var globals = {};
  for (i = 0; i < PROBED_GLOBALS.length; i++) globals[PROBED_GLOBALS[i]] = hasGlobal(PROBED_GLOBALS[i]);

  var generator = null;
  try {
    var meta = document.querySelector('meta[name="generator" i]');
    if (meta) generator = cut(attr(meta, 'content'), MAX_DATA);
  } catch (e) { /* no head */ }

  var bodySample = '';
  try {
    var text = (document.body && (document.body.innerText || document.body.textContent)) || '';
    bodySample = cut(String(text).replace(/\s+/g, ' ').trim(), 300) || '';
  } catch (e) { bodySample = ''; }

  var markup = '';
  try { markup = String(document.documentElement.outerHTML || '').substring(0, 400000); } catch (e) { markup = ''; }
  var botMarkers = [];
  for (i = 0; i < BOT_MARKERS.length; i++) {
    if (markup.indexOf(BOT_MARKERS[i]) !== -1) botMarkers.push(BOT_MARKERS[i]);
  }

  // Markers used by the site-stack catalog. A fixed list, filtered again in Node.
  var DOM_MARKERS = [
    ['wp-content', /\/wp-content\//], ['wp-includes', /\/wp-includes\//],
    ['drupal-settings', /drupal-settings-json/], ['joomla', /\/media\/system\/js\//],
    ['shopify', /cdn\.shopify\.com/], ['wix', /static\.parastorage\.com/],
    ['squarespace', /static1\.squarespace\.com/], ['webflow', /data-wf-page/],
    ['ghost', /ghost-|\/assets\/built\//], ['sitecore-media', /\/-\/media\//],
    ['sitecore-jss', /\/-\/jssmedia\/|__JSS_STATE__/], ['typo3', /typo3temp|typo3conf/],
    ['craft', /\/cpresources\//], ['elementor', /elementor-(?:frontend|widget)/],
    ['aem', /\/etc\.clientlibs\/|\/content\/dam\//], ['next-data', /__NEXT_DATA__/],
    ['nuxt-data', /__NUXT__/], ['hubspot-cms', /hs_cos_wrapper|hubspotusercontent/],
  ];
  var domMarkers = [];
  for (i = 0; i < DOM_MARKERS.length; i++) {
    try { if (DOM_MARKERS[i][1].test(markup)) domMarkers.push(DOM_MARKERS[i][0]); }
    catch (e) { /* regex unavailable */ }
  }

  var result = {
    frameUrl: (function () { try { return cut(String(location.href), 2000); } catch (e) { return null; } })(),
    title: (function () { try { return cut(String(document.title), MAX_LABEL); } catch (e) { return null; } })(),
    bodySample: bodySample,
    generator: generator,
    botMarkers: botMarkers,
    domMarkers: domMarkers,
    scripts: scripts,
    globals: globals,
    iframes: iframes,
    embedContainers: embedContainers,
    forms: forms,
    marketo: marketoProbe(),
    truncated: fieldBudget <= 0,
  };

  // The gate. typeof, the length of a primitive string and <= are language operators: a page
  // cannot replace them. Anything else returns null and the frame counts as an error.
  var json;
  try { json = JSON.stringify(result); } catch (e) { return null; }
  if (typeof json === 'string' && json.length <= MAX_JSON) return json;
  return null;
}
/* eslint-enable no-var, vars-on-top */

module.exports = { extractInPage };

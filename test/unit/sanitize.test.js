'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeFrame, DEFAULTS } = require('../../lib/sanitize');

const frameOf = (over = {}) => JSON.stringify({
  frameUrl: 'http://127.0.0.1:4101/p', title: 't', bodySample: 'b', botMarkers: [], domMarkers: [],
  scripts: [], globals: {}, iframes: [], embedContainers: [], forms: [], marketo: null,
  truncated: false, ...over,
});

const formOf = (fields, over = {}) => ({
  attrs: { id: 'f', name: null, className: null, action: '/a', method: 'post' },
  selector: 'form#f', inShadowDom: false, visible: true, classList: [], pseudoForm: false,
  fields, ...over,
});

const fieldOf = (over = {}) => ({
  tag: 'input', type: 'hidden', name: 'x', id: null, label: null, required: false,
  autocomplete: null, tabindex: null, ariaHidden: false, wrapperClasses: [],
  hiddenKind: 'type_hidden', hiddenBy: 'self', value: 'v', valueTruncated: false,
  checked: null, notes: [], ...over,
});

test('a well formed frame comes through', () => {
  const out = sanitizeFrame(frameOf({ forms: [formOf([fieldOf()])] }));
  assert.equal(out.ok, true);
  assert.equal(out.frame.forms.length, 1);
  assert.equal(out.frame.forms[0].fields[0].value, 'v');
});

test('non-strings, bad JSON and bad shapes are frame errors, never exceptions', () => {
  for (const input of [null, undefined, 42, {}, [], '', 'not json', '"a string"', '42', 'null', '[]']) {
    const out = sanitizeFrame(input);
    assert.equal(out.ok, false, JSON.stringify(input));
    assert.equal(typeof out.reason, 'string');
  }
});

test('the size gate is checked again on this side of the boundary', () => {
  const big = frameOf({ bodySample: 'x'.repeat(200) });
  assert.equal(sanitizeFrame(big, { maxExtractionChars: 50 }).ok, false);
  assert.equal(sanitizeFrame(big, { maxExtractionChars: 50 }).reason, 'extraction exceeded the size gate');
});

test('privacy: a value survives only for a hidden field that is not a password', () => {
  const out = sanitizeFrame(frameOf({ forms: [formOf([
    fieldOf({ name: 'visible', hiddenKind: null, hiddenBy: null, value: 'SECRET' }),
    fieldOf({ name: 'pw', type: 'password', hiddenKind: 'css_hidden', value: 'hunter2' }),
    fieldOf({ name: 'hidden', hiddenKind: 'type_hidden', value: 'kept' }),
  ])] }));
  const byName = Object.fromEntries(out.frame.forms[0].fields.map((f) => [f.name, f]));
  assert.equal(byName.visible.value, null, 'a visible field never carries a value');
  assert.equal(byName.pw.value, null, 'a password never carries a value');
  assert.equal(byName.hidden.value, 'kept');
});

test('a page that defeats its own string cut still yields bounded strings', () => {
  // String.prototype.slice made a no-op in the page: a 10,000 character name arrives whole.
  const out = sanitizeFrame(frameOf({ forms: [formOf([fieldOf({
    name: 'n'.repeat(10000), id: 'i'.repeat(10000), label: 'l'.repeat(10000),
    type: 't'.repeat(500), value: 'v'.repeat(10000), valueTruncated: false,
  })])] }));
  const field = out.frame.forms[0].fields[0];
  assert.equal(field.name.length, DEFAULTS.maxName);
  assert.equal(field.id.length, DEFAULTS.maxName);
  assert.equal(field.label.length, DEFAULTS.maxLabel);
  assert.equal(field.type.length, DEFAULTS.maxType);
  assert.equal(field.value.length, DEFAULTS.valueMax);
  assert.equal(field.valueTruncated, true, 'the cut is recorded');
});

test('enums are coerced to their allowed set', () => {
  const out = sanitizeFrame(frameOf({ forms: [formOf([
    fieldOf({ tag: 'script', hiddenKind: 'invented', hiddenBy: 'everything' }),
    fieldOf({ tag: 'select', hiddenKind: 'offscreen', hiddenBy: 'nonsense' }),
  ])] }));
  const [a, b] = out.frame.forms[0].fields;
  assert.equal(a.tag, null);
  assert.equal(a.hiddenKind, null);
  assert.equal(a.hiddenBy, null, 'a null hiddenKind forces a null hiddenBy');
  assert.equal(a.value, null, 'and with no hiddenKind there is no value');
  assert.equal(b.tag, 'select');
  assert.equal(b.hiddenKind, 'offscreen');
  assert.equal(b.hiddenBy, null);
});

test('data maps are prototype free and reject prototype keys', () => {
  const out = sanitizeFrame(frameOf({ embedContainers: [
    { tag: 'div', className: 'hs-form-frame', data: { 'form-id': 'g', __proto__: { polluted: 1 }, constructor: 'x' } },
  ] }));
  const data = out.frame.embedContainers[0].data;
  assert.equal(Object.getPrototypeOf(data), null);
  assert.equal(data['form-id'], 'g');
  assert.equal(data.polluted, undefined);
  assert.equal(data.constructor, undefined);
  assert.equal({}.polluted, undefined, 'the global prototype is untouched');
});

test('markers are filtered to the known catalog', () => {
  const out = sanitizeFrame(frameOf({
    botMarkers: ['cf-chl', 'invented-marker', 42],
    domMarkers: ['wp-content', 'made-up', null],
  }));
  assert.deepEqual(out.frame.botMarkers, ['cf-chl']);
  assert.deepEqual(out.frame.domMarkers, ['wp-content']);
});

test('globals are rebuilt as booleans over the fixed probe list', () => {
  const out = sanitizeFrame(frameOf({ globals: { hbspt: true, gform: 'yes', invented: true } }));
  assert.equal(out.frame.globals.hbspt, true);
  assert.equal(out.frame.globals.gform, false, 'only an exact true counts');
  assert.equal(out.frame.globals.invented, undefined, 'unlisted globals are dropped');
  assert.equal(Object.getPrototypeOf(out.frame.globals), null);
});

test('the per-frame character budget stops a page of maximum-length strings', () => {
  const fields = [];
  for (let i = 0; i < 100; i++) fields.push(fieldOf({ name: `n${i}`, value: 'v'.repeat(2000) }));
  const out = sanitizeFrame(frameOf({ forms: [formOf(fields)] }), { maxFrameChars: 10000 });
  assert.equal(out.ok, true);
  assert.ok(out.frame.charsKept <= 10000, `kept ${out.frame.charsKept}`);
  assert.ok(out.frame.forms[0].fields.length < 100, 'fields stop being kept');
  assert.equal(out.frame.truncated, true);
});

test('list caps hold and mark the frame truncated', () => {
  const fields = [];
  for (let i = 0; i < 500; i++) fields.push(fieldOf({ name: `n${i}`, value: '' }));
  const out = sanitizeFrame(frameOf({ forms: [formOf(fields)] }));
  assert.equal(out.frame.forms[0].fields.length, DEFAULTS.maxFieldsPerForm);
  assert.equal(out.frame.truncated, true);

  const forms = [];
  for (let i = 0; i < 80; i++) forms.push(formOf([]));
  const many = sanitizeFrame(frameOf({ forms }));
  assert.equal(many.frame.forms.length, DEFAULTS.maxForms);
  assert.equal(many.frame.truncated, true);
});

test('the Marketo probe is rebuilt to names only', () => {
  const out = sanitizeFrame(frameOf({ marketo: [
    { id: '1234', names: ['Email', 'utm_source'], values: { Email: 'leak@example.com' } },
    'garbage',
    { id: 5678, names: ['a', 42, null] },
  ] }));
  assert.equal(out.frame.marketo.length, 2);
  assert.deepEqual(out.frame.marketo[0], { id: '1234', names: ['Email', 'utm_source'] });
  assert.equal(out.frame.marketo[0].values, undefined, 'values never survive');
  assert.deepEqual(out.frame.marketo[1], { id: null, names: ['a'] });
  assert.equal(sanitizeFrame(frameOf({ marketo: 'nope' })).frame.marketo, null);
});

test('field notes are filtered to the known set', () => {
  const out = sanitizeFrame(frameOf({ forms: [formOf([fieldOf({
    notes: ['form not visible; field visibility judged by display only', 'injected note'],
  })])] }));
  assert.deepEqual(out.frame.forms[0].fields[0].notes,
    ['form not visible; field visibility judged by display only']);
});

test('a 4 MB hidden value is refused at the gate', () => {
  const huge = frameOf({ forms: [formOf([fieldOf({ value: 'x'.repeat(4_000_000) })])] });
  assert.equal(sanitizeFrame(huge).ok, false);
});

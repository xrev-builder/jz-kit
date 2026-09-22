'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  parseDefinitionBody, definitionsFromEmbedContainers, correlateDefinitions, MAX_FIELDS,
} = require('../../lib/definitions');

const GUID = '59c583fe-8f0b-4310-aead-5127f01d8aab';

test('HubSpot style: formFieldGroups anywhere in the tree', () => {
  const body = JSON.stringify({
    guid: GUID,
    formFieldGroups: [{ fields: [
      { name: 'utm_source', label: 'UTM Source', fieldType: 'text', hidden: true, defaultValue: '' },
      { name: 'lifecyclestage', fieldType: 'text', hidden: true, defaultValue: 'lead' },
      { name: 'email', label: 'Email', fieldType: 'email', hidden: false, required: true },
    ] }],
  });
  const def = parseDefinitionBody({ url: 'http://127.0.0.1:4102/hs/definition.json', body });
  assert.equal(def.provider, 'hubspot');
  assert.equal(def.providerFormId, GUID);
  assert.equal(def.parseStatus, 'ok');
  assert.equal(def.sourceUrl, 'http://127.0.0.1:4102/hs/definition.json', 'query dropped, path kept');
  assert.deepEqual(def.fields.map((f) => f.name), ['utm_source', 'lifecyclestage', 'email']);
  assert.equal(def.fields[0].hidden, true);
  assert.equal(def.fields[1].defaultValue, 'lead');
  assert.equal(def.fields[2].required, true);
});

test('HubSpot style: the fieldGroups variant and selectedOptions defaults', () => {
  const body = JSON.stringify({
    id: GUID,
    fieldGroups: [{ fields: [{ name: 'country', fieldType: 'select', selectedOptions: ['US'] }] }],
  });
  const def = parseDefinitionBody({ url: 'https://x/f.json', body });
  assert.equal(def.provider, 'hubspot');
  assert.equal(def.fields[0].defaultValue, 'US');
});

test('HubSpot style: the GUID falls back to the URL', () => {
  const body = JSON.stringify({ formFieldGroups: [{ fields: [{ name: 'a', fieldType: 'text' }] }] });
  const def = parseDefinitionBody({ url: `https://x/embed/v3/form/123/${GUID}/json`, body });
  assert.equal(def.providerFormId, GUID);
});

test('Marketo style: plain JSON', () => {
  const body = JSON.stringify({ Id: 1234, result: [
    { Name: 'utm_campaign__c', Datatype: 'hidden', InputInitialValue: '',
      InputSourceChannel: 'url', InputSourceSelector: 'utm_campaign' },
    { Name: 'Industry', Datatype: 'select' },
  ] });
  const def = parseDefinitionBody({ url: 'http://127.0.0.1:4101/index.php/form/getForm', body });
  assert.equal(def.provider, 'marketo');
  assert.equal(def.providerFormId, '1234');
  assert.deepEqual(def.fields.map((f) => f.name), ['utm_campaign__c', 'Industry']);
  assert.equal(def.fields[0].hidden, true);
  assert.deepEqual(def.fields[0].autofill, { channel: 'url', selector: 'utm_campaign' });
  assert.equal(def.fields[1].hidden, false);
  assert.equal(def.fields[1].autofill, null);
});

test('Marketo style: the JSONP wrapper is stripped and the form query parameter wins', () => {
  const body = 'MktoForms2.whatever({"Id":999,"result":[{"Name":"a","Datatype":"hidden"}]});';
  const def = parseDefinitionBody({
    url: 'http://127.0.0.1:4101/index.php/form/getForm?munchkinId=x&form=1234&callback=cb',
    body,
    contentType: 'application/javascript',
  });
  assert.equal(def.provider, 'marketo');
  assert.equal(def.providerFormId, '1234');
  assert.equal(def.fields.length, 1);
});

test('Typeform style: a hidden key holding an array of strings', () => {
  const def = parseDefinitionBody({ url: 'https://x/t.json', body: JSON.stringify({ hidden: ['utm_source', 'gclid'] }) });
  assert.equal(def.provider, 'typeform');
  assert.deepEqual(def.fields.map((f) => f.name), ['utm_source', 'gclid']);
  assert.ok(def.fields.every((f) => f.hidden === true));
});

test('a HubSpot boolean hidden key is not mistaken for a Typeform definition', () => {
  const body = JSON.stringify({ formFieldGroups: [{ fields: [{ name: 'a', hidden: true }] }] });
  assert.equal(parseDefinitionBody({ url: 'https://x/f.json', body }).provider, 'hubspot');
});

test('the recorded HubSpot 403 body is ignored quietly', () => {
  const body = fs.readFileSync(path.join(__dirname, '../recorded/hubspot-v3-definition-403.json'), 'utf8');
  assert.equal(parseDefinitionBody({ url: 'https://forms.hsforms.com/embed/v3/form/1/2/json', body }), null);
});

test('garbage and non-definitions are ignored, never thrown', () => {
  for (const body of ['<html>nope', '', 'null', '"a string"', '42', '[]', '{}',
    JSON.stringify({ status: 'ok', data: [1, 2, 3] }),
    JSON.stringify({ hidden: true }), JSON.stringify({ hidden: [] }),
    JSON.stringify({ hidden: [1, 2] })]) {
    assert.equal(parseDefinitionBody({ url: 'https://x/a.json', body }), null, JSON.stringify(body).slice(0, 40));
  }
  assert.equal(parseDefinitionBody({}), null);
  assert.equal(parseDefinitionBody({ url: 'https://x', body: null }), null);
});

test('field counts and string lengths are bounded', () => {
  const fields = [];
  for (let i = 0; i < MAX_FIELDS + 50; i++) fields.push({ name: `f${i}`, fieldType: 'text' });
  fields[0].name = 'x'.repeat(5000);
  fields[0].label = 'y'.repeat(5000);
  fields[0].defaultValue = 'z'.repeat(5000);
  const def = parseDefinitionBody({ url: 'https://x/f.json', body: JSON.stringify({ formFieldGroups: [{ fields }] }) });
  assert.equal(def.fields.length, MAX_FIELDS);
  assert.equal(def.truncated, true);
  assert.equal(def.fields[0].name.length, 200);
  assert.equal(def.fields[0].label.length, 200);
  assert.equal(def.fields[0].defaultValue.length, 300);
});

test('a deeply nested or cyclic body does not hang', () => {
  let nested = { name: 'deep', fieldType: 'text' };
  for (let i = 0; i < 2000; i++) nested = { wrap: nested };
  nested.formFieldGroups = [];
  const def = parseDefinitionBody({ url: 'https://x/f.json', body: JSON.stringify(nested) });
  assert.ok(def === null || def.provider === 'hubspot');
});

test('Typeform embed attributes on the parent page declare hidden fields', () => {
  const defs = definitionsFromEmbedContainers([
    { data: { 'tf-widget': 'abc123', 'tf-hidden': 'utm_source=x,gclid=y' } },
    { data: { 'tf-transitive-search-params': 'utm_medium, utm_campaign' } },
    { data: { 'form-id': GUID } },
  ]);
  assert.equal(defs.length, 2);
  assert.deepEqual(defs[0].fields.map((f) => f.name), ['utm_source', 'gclid']);
  assert.equal(defs[0].providerFormId, 'abc123');
  assert.deepEqual(defs[1].fields.map((f) => f.name), ['utm_medium', 'utm_campaign']);
});

const form = (formIndex, provider, providerFormId = null) => ({ formIndex, provider, providerFormId });
const def = (provider, providerFormId = null) => ({ provider, providerFormId, fields: [] });

test('rule 1: same provider and equal providerFormId attaches', () => {
  const { attached, unmatched } = correlateDefinitions(
    [form(0, 'hubspot', GUID), form(1, 'hubspot', 'other-guid')],
    [def('hubspot', GUID)],
  );
  assert.equal(attached.get(0).providerFormId, GUID);
  assert.equal(attached.has(1), false);
  assert.deepEqual(unmatched, []);
});

test('rule 1 is case insensitive on the id', () => {
  const { attached } = correlateDefinitions([form(0, 'hubspot', GUID.toUpperCase())], [def('hubspot', GUID)]);
  assert.ok(attached.has(0));
});

test('rule 2: exactly one form and one definition of that provider attaches', () => {
  const { attached, unmatched } = correlateDefinitions(
    [form(0, 'generic'), form(1, 'marketo', null)],
    [def('marketo', null)],
  );
  assert.ok(attached.has(1));
  assert.deepEqual(unmatched, []);
});

test('rule 3: never guess across multiple embeds', () => {
  const { attached, unmatched } = correlateDefinitions(
    [form(0, 'hubspot', null), form(1, 'hubspot', null)],
    [def('hubspot', null)],
  );
  assert.equal(attached.size, 0);
  assert.equal(unmatched.length, 1);
});

test('two embeds with different GUIDs each land on their own form', () => {
  const a = '11111111-1111-1111-1111-111111111111';
  const b = '22222222-2222-2222-2222-222222222222';
  const { attached, unmatched } = correlateDefinitions(
    [form(0, 'hubspot', a), form(1, 'hubspot', b)],
    [def('hubspot', b), def('hubspot', a)],
  );
  assert.equal(attached.get(0).providerFormId, a);
  assert.equal(attached.get(1).providerFormId, b);
  assert.deepEqual(unmatched, []);
});

test('a definition with no form of its provider is unmatched', () => {
  const { attached, unmatched } = correlateDefinitions([form(0, 'gravity_forms', '13')], [def('hubspot', GUID)]);
  assert.equal(attached.size, 0);
  assert.equal(unmatched.length, 1);
});

test('correlate tolerates empty and bad input', () => {
  assert.deepEqual(correlateDefinitions([], []).unmatched, []);
  assert.deepEqual(correlateDefinitions(null, null).unmatched, []);
});

'use strict';

// Multi-origin fixture server (BUILD-SPEC 16.1).
//   origin A  127.0.0.1:4101
//   origin B  127.0.0.1:4102   (a different port is a different origin)
//   collector 127.0.0.1:4103   counts every request and WebSocket upgrade it receives
//   forbidden 127.0.0.1:4104   a second counter that is NEVER in the allow list

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT_A = 4101;
const PORT_B = 4102;
const PORT_COLLECTOR = 4103;
const PORT_FORBIDDEN = 4104;

const RECORDED = path.join(__dirname, '..', 'recorded');
const recorded = (name) => fs.readFileSync(path.join(RECORDED, name), 'utf8');

const html = (body, head = '') =>
  `<!doctype html><html><head><meta charset="utf-8"><title>fixture</title>${head}</head><body>${body}</body></html>`;

// --- pages on origin A -------------------------------------------------------------

const P01 = html(`
<form id="w2l" action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8" method="POST">
  <input type=hidden name="oid" value="00D5e000001AbCd">
  <input type=hidden name="retURL" value="https://example.com/thanks">
  <input type=hidden name="lead_source" value="Website">
  <input type=hidden name="00N5e00000AbCdE" id="utmsrc" value="">
  <label for="email">Email</label><input id="email" type="email" name="email" value="prefilled@example.com">
  <label for="first">First name</label><input id="first" type="text" name="first_name">
  <label for="last">Last name</label><input id="last" type="text" name="last_name">
  <input type="submit" value="Submit">
</form>
<script>
  var p = new URLSearchParams(location.search);
  if (p.get('utm_source')) document.getElementById('utmsrc').value = p.get('utm_source');
</script>`);

const P02 = html(`
<style>
  li.always-hidden { display: none; }
  .offscreen { position: absolute; left: -9999px; }
  #step2 { display: none; }
  .styled-check input { opacity: 0; }
</style>
<form id="css-hidden" action="/submit">
  <ul>
    <li class="always-hidden"><input type="text" name="q12_utmMedium" value=""></li>
  </ul>
  <p class="offscreen"><input type="text" name="website" tabindex="-1" autocomplete="off" value=""></p>
  <div id="step2">
    <input type="text" name="s1"><input type="text" name="s2"><input type="text" name="s3">
    <input type="text" name="s4"><input type="text" name="s5">
  </div>
  <span class="styled-check"><input type="checkbox" name="agree"></span>
  <input type="email" name="email"><input type="text" name="company"><input type="tel" name="phone">
  <button type="submit">Send</button>
</form>`);

// The iframe src carries the page's own query, the way a same-origin embed normally does.
const P03 = html('<iframe id="f" width="600" height="400"></iframe>' +
  '<script>document.getElementById("f").src = "/form-in-frame" + location.search;</script>');
const P03_INNER = html(`
<form id="inner" action="/submit">
  <input type=hidden name="gclid_field" id="g" value="">
  <input type="email" name="email">
</form>
<script>
  var p = new URLSearchParams(location.search);
  if (p.get('gclid')) document.getElementById('g').value = p.get('gclid');
</script>`);

const P04 = html(`<iframe src="http://127.0.0.1:${PORT_B}/pardot" width="800" height="600"></iframe>`);

const shadowPage = (mode) => html(`
<my-form></my-form>
<script>
class MyForm extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: '${mode}' });
    root.innerHTML = '<form id="shadow-form" action="/submit">' +
      '<input type=hidden name="gclid_field" id="g" value="">' +
      '<input type="email" name="email">' +
      '</form>';
    const p = new URLSearchParams(location.search);
    const g = root.getElementById ? root.getElementById('g') : root.querySelector('#g');
    if (p.get('gclid') && g) g.value = p.get('gclid');
  }
}
customElements.define('my-form', MyForm);
</script>`);

const P07 = html(`
<div id="mktoForm_host"></div>
<script src="/js/forms2/js/forms2.min.js"></script>
<script>
  MktoForms2.loadForm('', '', 1234);
</script>`);

const P07_FORMS2 = `
window.MktoForms2 = {
  _forms: [],
  loadForm: function (a, b, id) {
    var s = document.createElement('script');
    s.src = '/index.php/form/getForm?munchkinId=abc&form=' + id + '&callback=__mktoCb';
    document.body.appendChild(s);
  },
  allForms: function () { return window.MktoForms2._forms; }
};
window.__mktoCb = function (descriptor) {
  var host = document.getElementById('mktoForm_host');
  var params = new URLSearchParams(location.search);
  var v = params.get('utm_campaign') || '';
  host.innerHTML = '<form id="mktoForm_1234" class="mktoForm" action="/submit">' +
    '<input type=hidden name="utm_campaign__c" value="' + v.replace(/"/g, '') + '">' +
    '<input type="email" name="Email">' +
    '</form>';
  window.MktoForms2._forms = [{ getId: function () { return 1234; },
    getValues: function () { return { Email: 'visible-value-must-not-leak', utm_campaign__c: v }; } }];
};`;

const P07_DESCRIPTOR = `__mktoCb({"Id":1234,"result":[
  {"Name":"utm_campaign__c","Datatype":"hidden","InputInitialValue":"","InputSourceChannel":"url","InputSourceSelector":"utm_campaign"},
  {"Name":"Email","Datatype":"email"},
  {"Name":"Industry","Datatype":"select"}]});`;

const HS_GUID = '59c583fe-8f0b-4310-aead-5127f01d8aab';
const HS_GUID_B = '11111111-2222-3333-4444-555555555555';

const P08 = html(`
<div class="hs-form-frame" data-region="na1" data-form-id="${HS_GUID}" data-portal-id="485822"></div>
<script>
  var f = document.createElement('iframe');
  f.src = 'http://127.0.0.1:${PORT_B}/hs/form?guid=${HS_GUID}' + location.search.replace('?', '&');
  document.querySelector('.hs-form-frame').appendChild(f);
</script>`);

const P08B = html(`
<div class="hs-form-frame" data-form-id="${HS_GUID}" data-portal-id="1"></div>
<div class="hs-form-frame" data-form-id="${HS_GUID_B}" data-portal-id="1"></div>
<div id="a"></div><div id="b"></div>
<script>
  fetch('/hs/definition.json?guid=${HS_GUID}').then(r => r.json()).then(() => {
    document.getElementById('a').innerHTML =
      '<form id="hsForm_${HS_GUID}" class="hs-form" action="/submit"><input type="email" name="email"><input type=hidden name="hs_context" value="{\\"pageUrl\\":\\"x\\"}"></form>';
  });
  fetch('/hs/definition.json?guid=${HS_GUID_B}').then(r => r.json()).then(() => {
    document.getElementById('b').innerHTML =
      '<form id="hsForm_${HS_GUID_B}" class="hs-form" action="/submit"><input type="email" name="email2"></form>';
  });
</script>`);

const P09 = html(`
<div style="height: 3000px">scroll</div>
<div id="slot"></div>
<script>
  var target = document.getElementById('slot');
  new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      target.innerHTML = '<form id="lazy" action="/submit"><input type=hidden name="lazy_gclid" value=""><input type="email" name="email"></form>';
      var p = new URLSearchParams(location.search);
      if (p.get('gclid')) document.querySelector('[name=lazy_gclid]').value = p.get('gclid');
    }
  }).observe(target);
</script>`);

const P10 = html(`
<div id="banner" class="cookie-consent"><button id="onetrust-accept-btn-handler">Accept all</button></div>
<form id="consent-gated" action="/submit">
  <input type=hidden name="utm_source_field" id="u" value="">
  <input type="email" name="email">
</form>
<script>
  document.getElementById('onetrust-accept-btn-handler').addEventListener('click', function () {
    document.getElementById('banner').style.display = 'none';
    var p = new URLSearchParams(location.search);
    if (p.get('utm_source')) document.getElementById('u').value = p.get('utm_source');
  });
</script>`);

const P11 = html(`
<form id="cookie-populate" action="/submit">
  <input type=hidden name="src" id="s" value="">
  <input type=hidden name="ts" id="t" value="">
  <input type=hidden name="csrf_token" id="c" value="">
  <input type="email" name="email">
</form>
<script>
  var p = new URLSearchParams(location.search);
  if (p.get('utm_source')) document.cookie = 'fi_src=' + p.get('utm_source') + '; path=/';
  var m = document.cookie.match(/fi_src=([^;]+)/);
  if (m) document.getElementById('s').value = m[1];
  document.getElementById('t').value = String(Date.now());
  document.getElementById('c').value = Math.random().toString(36).slice(2);
</script>`);

const P13 = html('<h1>A page with no form at all</h1><p>Nothing here.</p>');

const P14 = html('<h1>Just a moment...</h1><div id="cf-chl-widget">checking your browser</div>');

const P15 = html(`
<div class="signup-form">
  <input type=hidden name="pseudo_gclid" id="g" value="">
  <input type="email" name="email">
  <button id="go">Go</button>
</div>
<script>
  var p = new URLSearchParams(location.search);
  if (p.get('gclid')) document.getElementById('g').value = p.get('gclid');
</script>`);

const P16 = html(`
<div class="hs-form-frame" data-form-id="${HS_GUID}" data-portal-id="1">
  <iframe src="/does-not-exist-404"></iframe>
</div>`);

const R01 = recorded('gravityforms-form.html');

const G01 = html(`
<form id="guarded" action="http://127.0.0.1:${PORT_COLLECTOR}/collect" method="POST">
  <input type="email" name="email"><button type="submit">Send</button>
</form>
<button id="open-modal">Open</button>`);

const G02 = html(`
<form id="agree-form" action="http://127.0.0.1:${PORT_COLLECTOR}/collect" method="POST">
  <input type="email" name="email"><button type="submit">Agree</button>
</form>`);

const G03 = html(`
<form id="auto" action="http://127.0.0.1:${PORT_COLLECTOR}/collect" method="POST">
  <input type=hidden name="h" value="v"><input type="email" name="email">
</form>
<script>
  var f = document.getElementById('auto');
  setTimeout(function () {
    try { f.submit(); } catch (e) {}
    try { f.requestSubmit(); } catch (e) {}
  }, 100);
</script>`);

const G04 = html(`
<form id="tamper" action="http://127.0.0.1:${PORT_COLLECTOR}/collect" method="POST">
  <input type=hidden name="h" value="v"><input type="email" name="email">
</form>
<script>
  window.__fiAllowSubmit = true;
  var f = document.getElementById('tamper');
  setTimeout(function () {
    try { f.submit(); } catch (e) {}
    try {
      var frame = document.createElement('iframe');
      document.body.appendChild(frame);
      var native = frame.contentWindow.HTMLFormElement.prototype.submit;
      native.call(f);
    } catch (e) {}
    try { f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); } catch (e) {}
  }, 100);
</script>`);

const S06 = html(`
<script>
  var base = 'http://127.0.0.1:${PORT_FORBIDDEN}';
  new Image().src = base + '/img';
  fetch(base + '/fetch').catch(function () {});
  try { navigator.sendBeacon(base + '/beacon', 'x'); } catch (e) {}
  try { new WebSocket('ws://127.0.0.1:${PORT_FORBIDDEN}/ws'); } catch (e) {}
</script>
<form id="s06" action="/submit"><input type="email" name="email"></form>`);

const TRUST_SLICE = html(`
<form id="trust" action="/submit">
  <input type=hidden id="huge" value="x">
</form>
<script>
  String.prototype.slice = function () { return this; };
  String.prototype.substring = function () { return this; };
  var el = document.getElementById('huge');
  el.setAttribute('name', 'n'.repeat(10000));
</script>`);

// A 4 MB hidden value AND a neutered in-page cut, so the string really does reach the gate.
// Cutting inside the page is a courtesy; the gate and the Node rebuild are the control.
const TRUST_HUGE = html(`
<form id="huge-form" action="/submit"><input type=hidden name="big" id="b" value=""></form>
<script>
  document.getElementById('b').value = 'x'.repeat(4000000);
  String.prototype.substring = function () { return this; };
  String.prototype.slice = function () { return this; };
</script>`);

const TRUST_GETTERS = html(`
<script>
  window.__probeHits = 0;
  ['hbspt', 'MktoForms2', 'piTracker', '_elqQ', 'gform', 'JotForm'].forEach(function (name) {
    Object.defineProperty(window, name, {
      configurable: true,
      get: function () {
        window.__probeHits++;
        new Image().src = 'http://127.0.0.1:${PORT_COLLECTOR}/getter?' + name;
        return {};
      }
    });
  });
</script>
<form id="getters" action="/submit"><input type="email" name="email"></form>`);

const ST2 = html('<div>stack page</div><script src="/wp-content/themes/x/app.js"></script>' +
  `<iframe src="http://127.0.0.1:${PORT_B}/netlify-frame"></iframe>`,
'<meta name="generator" content="WordPress 6.4.2">');

const ST_REWRITE = html('<div>rewritten</div>', '<meta name="generator" content="WordPress 6.4.2">') +
  '<script>history.replaceState({}, "", "/st-rewritten?x=1");</script>';

const PAGES_A = {
  '/p01': { body: P01 },
  '/p02': { body: P02 },
  '/p03': { body: P03 },
  '/form-in-frame': { body: P03_INNER },
  '/p04': { body: P04 },
  '/p05': { body: shadowPage('open') },
  '/p06': { body: shadowPage('closed') },
  '/p07': { body: P07 },
  '/js/forms2/js/forms2.min.js': { body: P07_FORMS2, type: 'application/javascript' },
  '/index.php/form/getForm': { body: P07_DESCRIPTOR, type: 'application/javascript' },
  '/p08': { body: P08 },
  '/p08b': { body: P08B },
  '/p09': { body: P09 },
  '/p10': { body: P10 },
  '/p11': { body: P11 },
  '/p13': { body: P13 },
  '/p14': { body: P14, status: 403 },
  '/p15': { body: P15 },
  '/p16': { body: P16 },
  '/r01': { body: R01 },
  '/g01': { body: G01 },
  '/g02': { body: G02 },
  '/g03': { body: G03 },
  '/g04': { body: G04 },
  '/s06': { body: S06 },
  '/trust-slice': { body: TRUST_SLICE },
  '/trust-huge': { body: TRUST_HUGE },
  '/trust-getters': { body: TRUST_GETTERS },
  '/st2': { body: ST2, headers: { 'cf-ray': '8abc', server: 'cloudflare', 'x-powered-by': 'PHP/8.2' } },
  '/st-rewrite': { body: ST_REWRITE, headers: { 'cf-ray': '8abc', server: 'cloudflare' } },
  '/wp-content/themes/x/app.js': { body: '/* theme */', type: 'application/javascript' },
};

function hubspotDefinition(guid) {
  return JSON.stringify({
    guid,
    formFieldGroups: [{ fields: [
      { name: 'utm_source', label: 'UTM Source', fieldType: 'text', hidden: true, defaultValue: '' },
      { name: 'lifecyclestage', fieldType: 'text', hidden: true, defaultValue: 'lead' },
      { name: 'email', label: 'Email', fieldType: 'email', hidden: false, required: true },
    ] }],
  });
}

const PAGES_B = {
  '/pardot': { body: recorded('pardot-landing-form.html') },
  '/netlify-frame': { body: html('<p>frame</p>'), headers: { 'x-nf-request-id': 'nf1' } },
};

function createFixtureServer() {
  const counters = { collector: 0, forbidden: 0, collectorPaths: [], forbiddenPaths: [] };

  const serve = (pages, extra) => http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (extra && extra(req, res, url)) return;
    const page = pages[url.pathname];
    if (!page) { res.writeHead(404, { 'content-type': 'text/html' }); res.end('<h1>404</h1>'); return; }
    res.writeHead(page.status || 200, {
      'content-type': page.type || 'text/html; charset=utf-8',
      ...(page.headers || {}),
    });
    res.end(page.body);
  });

  const serverA = serve(PAGES_A, (req, res, url) => {
    if (url.pathname === '/hs/definition.json') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(hubspotDefinition(url.searchParams.get('guid') || HS_GUID));
      return true;
    }
    if (url.pathname === '/st') {
      res.writeHead(302, { location: '/st2', 'x-vercel-id': 'hop1' });
      res.end();
      return true;
    }
    if (url.pathname === '/st-204') { res.writeHead(204, { 'x-vercel-id': 'v204' }); res.end(); return true; }
    if (url.pathname === '/p17') {
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(P01);
      return true;
    }
    if (url.pathname === '/redirect-to-forbidden') {
      res.writeHead(302, { location: `http://127.0.0.1:${PORT_FORBIDDEN}/landed` });
      res.end();
      return true;
    }
    return false;
  });

  const serverB = serve(PAGES_B, (req, res, url) => {
    if (url.pathname === '/hs/form') {
      const guid = url.searchParams.get('guid') || HS_GUID;
      const params = new URLSearchParams(url.search);
      // The embed fetches its own definition, then renders. The definition is served from a
      // NON-HubSpot host on purpose: capture is by content, never by host.
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(html(`
        <form id="hsForm_${guid}" class="hs-form" action="/submit">
          <input type=hidden name="utm_source" value="">
          <input type=hidden name="lifecyclestage" value="lead">
          <input type=hidden name="hs_context" value='{"pageUrl":"http://127.0.0.1","pageName":"fixture"}'>
          <input type="email" name="email">
        </form>
        <script>
          fetch('/hs/definition.json?guid=${guid}').then(function (r) { return r.json(); });
          var v = ${JSON.stringify(params.get('utm_source') || '')};
          void v;
        </script>`));
      return true;
    }
    if (url.pathname === '/hs/definition.json') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(hubspotDefinition(url.searchParams.get('guid') || HS_GUID));
      return true;
    }
    return false;
  });

  const count = (key) => http.createServer((req, res) => {
    counters[key] += 1;
    counters[`${key}Paths`].push(req.url);
    res.writeHead(204);
    res.end();
  });

  const collector = count('collector');
  const forbidden = count('forbidden');
  for (const [server, key] of [[collector, 'collector'], [forbidden, 'forbidden']]) {
    server.on('upgrade', (req, socket) => {
      counters[key] += 1;
      counters[`${key}Paths`].push(`ws:${req.url}`);
      socket.destroy();
    });
  }

  const listen = (server, port) => new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => { server.removeListener('error', reject); resolve(); });
  });
  const close = (server) => new Promise((resolve) => server.close(() => resolve()));

  return {
    counters,
    resetCounters() {
      counters.collector = 0; counters.forbidden = 0;
      counters.collectorPaths = []; counters.forbiddenPaths = [];
    },
    async start() {
      await Promise.all([
        listen(serverA, PORT_A), listen(serverB, PORT_B),
        listen(collector, PORT_COLLECTOR), listen(forbidden, PORT_FORBIDDEN),
      ]);
    },
    async stop() {
      await Promise.all([close(serverA), close(serverB), close(collector), close(forbidden)]);
    },
  };
}

module.exports = {
  createFixtureServer, PORT_A, PORT_B, PORT_COLLECTOR, PORT_FORBIDDEN, HS_GUID, HS_GUID_B,
  A: `http://127.0.0.1:${PORT_A}`,
  B: `http://127.0.0.1:${PORT_B}`,
};

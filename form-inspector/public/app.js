'use strict';

// Web UI. No framework, no inline script, no innerHTML: every node is built here and every
// string from an inspected page reaches the DOM through textContent only.

(function () {
  const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid', 'li_fat_id', 'ttclid'];

  const $ = (id) => document.getElementById(id);
  const views = {
    login: $('login-view'), neu: $('new-view'), audit: $('audit-view'),
  };

  let maxUrls = 5;
  let poller = null;

  // ---- tiny DOM helpers ------------------------------------------------------------

  function el(tag, opts = {}, children = []) {
    const node = document.createElement(tag);
    if (opts.className) node.className = opts.className;
    if (opts.text !== undefined) node.textContent = String(opts.text);
    if (opts.href) node.href = opts.href;
    if (opts.title) node.title = String(opts.title);
    if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, String(v));
    for (const child of children) if (child) node.appendChild(child);
    return node;
  }

  const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); };

  function badge(text, kind) {
    return el('span', { className: `badge badge-${kind || text}`, text });
  }

  // ---- api ------------------------------------------------------------------------

  async function api(method, path, body) {
    const res = await fetch(path, {
      method,
      headers: {
        'X-FI-CSRF': '1',
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* not json */ }
    if (!res.ok) {
      const message = json && json.error ? json.error.message : `request failed (${res.status})`;
      const error = new Error(message);
      error.status = res.status;
      throw error;
    }
    return json;
  }

  // ---- views -----------------------------------------------------------------------

  function show(which) {
    for (const [name, node] of Object.entries(views)) node.hidden = name !== which;
  }

  async function boot() {
    const session = await api('GET', '/ui/session');
    maxUrls = session.maxUrls;
    $('url-hint').textContent = `Up to ${maxUrls} URLs per audit.`;
    $('signout').hidden = !session.authenticated;
    if (!session.authenticated) { show('login'); return; }
    route();
  }

  function route() {
    const hash = location.hash || '#/';
    const match = /^#\/audits\/(aud_[a-z2-7]{20})$/.exec(hash);
    if (poller) { clearInterval(poller); poller = null; }
    if (match) { show('audit'); openAudit(match[1]); return; }
    show('neu');
    loadRecent();
  }

  // ---- sign in ----------------------------------------------------------------------

  $('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = $('login-error');
    error.hidden = true;
    try {
      await api('POST', '/ui/login', { passcode: $('passcode').value });
      $('passcode').value = '';
      await boot();
    } catch (e) {
      error.textContent = e.message;
      error.hidden = false;
    }
  });

  $('signout').addEventListener('click', async () => {
    await api('POST', '/ui/logout').catch(() => {});
    location.hash = '#/';
    show('login');
    $('signout').hidden = true;
  });

  // ---- new audit ----------------------------------------------------------------------

  $('audit-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = $('audit-error');
    error.hidden = true;
    const urls = $('urls').value.split('\n').map((line) => line.trim()).filter(Boolean);
    if (!urls.length) {
      error.textContent = 'Enter at least one URL.';
      error.hidden = false;
      return;
    }
    const body = {
      urls,
      options: { probe: $('probe').checked, consent: $('consent').value },
    };
    if ($('label').value.trim()) body.label = $('label').value.trim();

    $('start').disabled = true;
    try {
      const created = await api('POST', '/api/v1/audits', body);
      location.hash = `#/audits/${created.audit.id}`;
    } catch (e) {
      error.textContent = e.message;
      error.hidden = false;
    } finally {
      $('start').disabled = false;
    }
  });

  async function loadRecent() {
    const target = $('recent');
    clear(target);
    try {
      const { audits } = await api('GET', '/api/v1/audits?limit=10');
      if (!audits.length) { target.appendChild(el('p', { className: 'muted', text: 'No audits yet.' })); return; }
      for (const audit of audits) {
        const head = el('div', { className: 'card-head' }, [
          el('h3', {}, [el('a', { href: `#/audits/${audit.id}`, text: audit.label || audit.id })]),
          badge(audit.status, audit.status === 'complete' ? 'ok' : audit.status === 'failed' ? 'failed' : 'partial'),
        ]);
        const line = `${audit.pagesProcessed} of ${audit.totalPages} pages, ` +
          `${audit.formsFound} forms, ${audit.hiddenFieldsFound} hidden fields`;
        target.appendChild(el('div', { className: 'card' }, [
          head,
          el('p', { className: 'muted', text: line }),
          el('p', { className: 'muted', text: new Date(audit.createdAt).toLocaleString() }),
        ]));
      }
    } catch (e) {
      target.appendChild(el('p', { className: 'error', text: e.message }));
    }
  }

  // ---- one audit ------------------------------------------------------------------------

  async function openAudit(id) {
    $('audit-title').textContent = id;
    $('audit-meta').textContent = '';
    clear($('pages'));
    $('audit-progress').textContent = 'Loading...';

    const tick = async () => {
      let audit;
      try {
        ({ audit } = await api('GET', `/api/v1/audits/${id}`));
      } catch (e) {
        $('audit-progress').textContent = e.message;
        if (poller) { clearInterval(poller); poller = null; }
        return;
      }
      $('audit-title').textContent = audit.label || 'Audit';
      $('audit-meta').textContent = `${audit.id} · started ${new Date(audit.createdAt).toLocaleString()}`;
      $('audit-progress').textContent =
        `${audit.status} · ${audit.pagesProcessed} of ${audit.totalPages} pages · ` +
        `${audit.formsFound} forms · ${audit.hiddenFieldsFound} hidden fields`;

      await renderPages(id);

      if (audit.status === 'complete' || audit.status === 'failed') {
        if (poller) { clearInterval(poller); poller = null; }
      }
    };

    await tick();
    if (!poller) poller = setInterval(tick, 4000);
  }

  async function renderPages(id) {
    let pages;
    try {
      ({ pages } = await api('GET', `/api/v1/audits/${id}/pages?view=hidden&limit=50`));
    } catch { return; }
    const target = $('pages');
    clear(target);
    for (const page of pages) target.appendChild(pageCard(page, id));
  }

  function pageCard(page, auditId) {
    const result = page.result;
    const outcomeKind = { ok: 'ok', partial: 'partial', empty: 'partial', blocked: 'blocked', failed: 'failed' }[result.outcome] || 'partial';
    const card = el('div', { className: 'card' }, [
      el('div', { className: 'card-head' }, [
        el('h3', { text: page.url }),
        badge(result.outcome, outcomeKind),
      ]),
    ]);

    if (result.outcomeReason) {
      card.appendChild(el('p', { className: 'muted', text: result.outcomeReason.replace(/_/g, ' ') }));
    }
    if (result.providers && result.providers.length) {
      card.appendChild(el('p', { className: 'muted',
        text: `Page providers: ${result.providers.map((p) => p.provider).join(', ')}` }));
    }
    if (result.stack) card.appendChild(stackLine(result.stack));

    for (const finding of (result.findings || []).filter((f) => f.formIndex === null)) {
      card.appendChild(findingRow(finding));
    }

    for (const form of result.forms || []) card.appendChild(formCard(form, result));

    card.appendChild(observedDisclosure(result));
    card.appendChild(el('p', {}, [
      el('a', {
        href: `/api/v1/audits/${auditId}/pages?view=full&limit=5&cursor=${page.position}`,
        text: 'Raw JSON for this page',
        attrs: { rel: 'noreferrer' },
      }),
    ]));
    return card;
  }

  function stackLine(stack) {
    const parts = [];
    const named = (list) => (list || []).map((h) => h.name).join(', ');
    for (const [label, list] of [['Edge', stack.edgeCdn], ['Hosting', stack.hosting],
      ['CMS', stack.cms], ['Server', stack.server]]) {
      if (list && list.length) parts.push(`${label}: ${named(list)}`);
    }
    return el('p', { className: 'muted', text: parts.length ? parts.join(' · ') : 'Site stack: nothing distinctive reported' });
  }

  function formCard(form, result) {
    const wrap = el('div', { className: 'card' }, [
      el('div', { className: 'card-head' }, [
        el('h3', { text: `Form ${form.formIndex + 1}: ${form.provider.provider}` }),
        badge(form.kind, form.kind === 'lead' ? 'ok' : undefined),
        form.frame && form.frame.crossOrigin ? badge('cross-origin iframe') : null,
        form.pseudoForm ? badge('no form element') : null,
      ]),
      el('p', { className: 'muted', text: form.kindReason }),
    ]);

    if (form.coverage) {
      const chips = el('div', { className: 'chips' });
      for (const key of ATTRIBUTION_KEYS) {
        const state = form.coverage[key];
        chips.appendChild(el('span', {
          className: `chip chip-${state}`,
          text: `${key}: ${state.replace(/_/g, ' ')}`,
          title: state,
        }));
      }
      wrap.appendChild(chips);
    }

    const rows = (form.fields || []).filter((f) => !f.noise);
    if (rows.length) wrap.appendChild(fieldTable(rows));

    const plumbing = (form.fields || []).filter((f) => f.noise);
    if (plumbing.length) {
      const list = plumbing.map((f) => `${f.name || 'unnamed'} (${f.noise})`).join(', ');
      wrap.appendChild(el('details', {}, [
        el('summary', { text: `${plumbing.length} plumbing fields ignored` }),
        el('p', { text: list }),
      ]));
    }
    if (form.counts && form.counts.sectionHidden) {
      wrap.appendChild(el('p', { className: 'muted',
        text: `${form.counts.sectionHidden} more fields sit in later steps or conditional blocks and were not listed.` }));
    }

    for (const finding of (result.findings || []).filter((f) => f.formIndex === form.formIndex)) {
      wrap.appendChild(findingRow(finding));
    }
    return wrap;
  }

  const READINGS = {
    url_param: 'filled from the landing URL',
    constant: 'always the same value',
    dynamic: 'changes between loads',
    empty: 'empty on both loads',
    unknown: 'could not be compared',
  };

  function fieldTable(fields) {
    const table = el('table');
    const head = el('tr');
    for (const label of ['Field', 'Recovered name', 'Hidden by', 'Plain load', 'Tagged load', 'Reading']) {
      head.appendChild(el('th', { text: label }));
    }
    table.appendChild(el('thead', {}, [head]));

    const body = el('tbody');
    for (const field of fields) {
      const keys = field.populatedKeys || [];
      let reading = READINGS[field.population] || field.population;
      // A field holding several test values stores the landing URL, not a single value.
      if (keys.length > 1) reading = 'stores the landing URL';
      else if (keys.length === 1) reading = `filled from ${keys[0]}`;
      if (field.source !== 'dom') reading += ` (${field.source === 'definition' ? 'from the provider definition' : 'from the form script API'})`;

      const row = el('tr', {}, [
        el('td', { className: 'mono', text: field.name || field.id || 'unnamed', attrs: { 'data-label': 'Field' } }),
        el('td', { className: 'mono', text: field.leakedName || '', attrs: { 'data-label': 'Recovered name' } }),
        el('td', { text: field.hiddenKind ? `${field.hiddenKind.replace(/_/g, ' ')} / ${field.hiddenBy || ''}` : 'visible', attrs: { 'data-label': 'Hidden by' } }),
        el('td', { className: 'mono', text: field.baselineValue === null ? '' : field.baselineValue, attrs: { 'data-label': 'Plain load' } }),
        el('td', { className: 'mono', text: field.probeValue === null ? '' : field.probeValue, attrs: { 'data-label': 'Tagged load' } }),
        el('td', { text: reading, attrs: { 'data-label': 'Reading' } }),
      ]);
      body.appendChild(row);
    }
    table.appendChild(body);
    return table;
  }

  function findingRow(finding) {
    return el('div', { className: 'finding' }, [
      badge(finding.severity, finding.severity),
      el('div', {}, [
        el('strong', { text: finding.title }),
        el('p', { text: finding.detail || '' }),
      ]),
    ]);
  }

  function observedDisclosure(result) {
    const items = [];
    if (result.scope) {
      items.push(el('p', { text: result.scope.note }));
      items.push(el('p', {
        text: `Cookie banner: ${result.scope.consentBannerDetected ? 'detected' : 'none detected'}, ` +
          `mode ${result.scope.consentMode}. Tagged second load: ${result.scope.probe ? 'yes' : 'no'}.`,
      }));
    }
    for (const note of (result.limits && result.limits.notes) || []) {
      items.push(el('p', { text: note }));
    }
    return el('details', {}, [el('summary', { text: 'How this page was observed' }), ...items]);
  }

  window.addEventListener('hashchange', route);
  boot().catch((error) => {
    $('audit-progress').textContent = error.message;
    show('login');
  });
})();

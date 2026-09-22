'use strict';

// The storage seam (BUILD-SPEC 14.7). Everything above this seam uses only the methods
// exported here, so a Postgres adapter can implement the same contract.

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const BASE32 = 'abcdefghijklmnopqrstuvwxyz234567';

// Opaque and unguessable. Integrators must never be able to walk the id space.
function newAuditId() {
  const bytes = crypto.randomBytes(20);
  let out = '';
  for (const byte of bytes) out += BASE32[byte % 32];
  return `aud_${out}`;
}

const UPDATABLE = new Set(['status', 'pages_processed', 'forms_found', 'hidden_fields_found',
  'summary', 'error', 'started_at', 'completed_at']);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS audits (
  id TEXT PRIMARY KEY,
  label TEXT,
  status TEXT NOT NULL,
  urls TEXT NOT NULL,
  options TEXT NOT NULL,
  total_pages INTEGER NOT NULL,
  pages_processed INTEGER NOT NULL DEFAULT 0,
  forms_found INTEGER NOT NULL DEFAULT 0,
  hidden_fields_found INTEGER NOT NULL DEFAULT 0,
  summary TEXT,
  error TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  started_at TEXT,
  completed_at TEXT,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS audits_created ON audits (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS audits_status ON audits (status);

CREATE TABLE IF NOT EXISTS audit_pages (
  audit_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  url TEXT NOT NULL,
  outcome TEXT,
  result TEXT NOT NULL,
  PRIMARY KEY (audit_id, position)
);

CREATE TABLE IF NOT EXISTS idempotency (
  principal TEXT NOT NULL,
  key TEXT NOT NULL,
  body_hash TEXT NOT NULL,
  audit_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (principal, key)
);

CREATE TABLE IF NOT EXISTS admissions (
  created_at TEXT NOT NULL,
  principal TEXT NOT NULL,
  urls INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS admissions_time ON admissions (created_at);
`;

function createStorage(options = {}) {
  const file = options.file || ':memory:';
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);

  const rowToAudit = (row) => row && ({
    id: row.id,
    label: row.label,
    status: row.status,
    urls: JSON.parse(row.urls),
    options: JSON.parse(row.options),
    totalPages: row.total_pages,
    pagesProcessed: row.pages_processed,
    formsFound: row.forms_found,
    hiddenFieldsFound: row.hidden_fields_found,
    summary: row.summary ? JSON.parse(row.summary) : null,
    error: row.error,
    createdBy: row.created_by,
    createdAt: row.created_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    expiresAt: row.expires_at,
  });

  return {
    createAudit(audit) {
      db.prepare(`INSERT INTO audits
        (id, label, status, urls, options, total_pages, pages_processed, forms_found,
         hidden_fields_found, summary, error, created_by, created_at, started_at, completed_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, NULL, NULL, ?, ?, NULL, NULL, ?)`)
        .run(audit.id, audit.label ?? null, audit.status, JSON.stringify(audit.urls),
          JSON.stringify(audit.options), audit.totalPages, audit.createdBy, audit.createdAt, audit.expiresAt);
      return this.getAudit(audit.id);
    },

    getAudit(id) {
      return rowToAudit(db.prepare('SELECT * FROM audits WHERE id = ?').get(id));
    },

    // Column allow list. Nothing else may be written through this seam.
    updateAudit(id, patch) {
      const columns = [];
      const values = [];
      for (const [key, value] of Object.entries(patch)) {
        if (!UPDATABLE.has(key)) throw new Error(`updateAudit: column ${key} is not updatable`);
        columns.push(`${key} = ?`);
        values.push(key === 'summary' && value !== null && typeof value === 'object'
          ? JSON.stringify(value) : value);
      }
      if (!columns.length) return this.getAudit(id);
      db.prepare(`UPDATE audits SET ${columns.join(', ')} WHERE id = ?`).run(...values, id);
      return this.getAudit(id);
    },

    // Ordered by (createdAt, id) descending; the cursor encodes that pair.
    listAudits({ limit = 20, cursor = null, label = null } = {}) {
      const where = [];
      const params = [];
      if (label !== null) { where.push('label = ?'); params.push(label); }
      if (cursor) {
        where.push('(created_at < ? OR (created_at = ? AND id < ?))');
        params.push(cursor.createdAt, cursor.createdAt, cursor.id);
      }
      const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const rows = db.prepare(
        `SELECT * FROM audits ${clause} ORDER BY created_at DESC, id DESC LIMIT ?`,
      ).all(...params, limit + 1);
      const page = rows.slice(0, limit).map(rowToAudit);
      const next = rows.length > limit
        ? { createdAt: page[page.length - 1].createdAt, id: page[page.length - 1].id }
        : null;
      return { audits: page, nextCursor: next };
    },

    upsertPage(auditId, page) {
      db.prepare(`INSERT INTO audit_pages (audit_id, position, url, outcome, result)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT (audit_id, position) DO UPDATE SET url = excluded.url,
          outcome = excluded.outcome, result = excluded.result`)
        .run(auditId, page.position, page.url, page.outcome ?? null, JSON.stringify(page.result));
    },

    getPages(auditId, { limit = 20, offset = 0 } = {}) {
      const rows = db.prepare(
        'SELECT position, url, outcome, result FROM audit_pages WHERE audit_id = ? ORDER BY position LIMIT ? OFFSET ?',
      ).all(auditId, limit + 1, offset);
      const page = rows.slice(0, limit).map((row) => ({
        position: row.position, url: row.url, outcome: row.outcome, result: JSON.parse(row.result),
      }));
      const nextCursor = rows.length > limit ? String(offset + limit) : null;
      return { pages: page, nextCursor };
    },

    deleteAudit(id) {
      db.prepare('DELETE FROM audit_pages WHERE audit_id = ?').run(id);
      const info = db.prepare('DELETE FROM audits WHERE id = ?').run(id);
      return info.changes > 0;
    },

    countQueued() {
      const row = db.prepare("SELECT COUNT(*) AS n FROM audits WHERE status IN ('queued','running')").get();
      return row.n;
    },

    // Written at admission, independent of the audits table, so deleting a finished audit
    // never refunds budget.
    recordAdmission(principal, urls, at) {
      db.prepare('INSERT INTO admissions (created_at, principal, urls) VALUES (?, ?, ?)')
        .run(at, principal, urls);
    },

    urlsAdmittedSince(since, principal = null) {
      if (principal) {
        const row = db.prepare('SELECT COALESCE(SUM(urls), 0) AS n FROM admissions WHERE created_at >= ? AND principal = ?')
          .get(since, principal);
        return row.n;
      }
      const row = db.prepare('SELECT COALESCE(SUM(urls), 0) AS n FROM admissions WHERE created_at >= ?').get(since);
      return row.n;
    },

    auditsAdmittedSince(since, principal) {
      const row = db.prepare('SELECT COUNT(*) AS n FROM admissions WHERE created_at >= ? AND principal = ?')
        .get(since, principal);
      return row.n;
    },

    // Crash-only recovery: nothing may sit in a non-terminal state forever.
    failInterrupted(at) {
      const info = db.prepare(
        `UPDATE audits SET status = 'failed', error = 'interrupted by a restart', completed_at = ?
         WHERE status IN ('queued','running')`,
      ).run(at);
      return info.changes;
    },

    purgeExpired(now) {
      const expired = db.prepare("SELECT id FROM audits WHERE expires_at < ? AND status IN ('complete','failed')").all(now);
      for (const row of expired) this.deleteAudit(row.id);
      const cutoff = new Date(Date.parse(now) - 24 * 3600 * 1000).toISOString();
      db.prepare('DELETE FROM idempotency WHERE created_at < ?').run(cutoff);
      const admissionCutoff = new Date(Date.parse(now) - 48 * 3600 * 1000).toISOString();
      db.prepare('DELETE FROM admissions WHERE created_at < ?').run(admissionCutoff);
      return expired.length;
    },

    getIdempotency(principal, key) {
      return db.prepare('SELECT * FROM idempotency WHERE principal = ? AND key = ?').get(principal, key) || null;
    },

    putIdempotency(principal, key, bodyHash, auditId, at) {
      db.prepare(`INSERT INTO idempotency (principal, key, body_hash, audit_id, created_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT (principal, key) DO NOTHING`).run(principal, key, bodyHash, auditId, at);
    },

    transaction(fn) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const out = fn();
        db.exec('COMMIT');
        return out;
      } catch (error) {
        try { db.exec('ROLLBACK'); } catch { /* already rolled back */ }
        throw error;
      }
    },

    close() { try { db.close(); } catch { /* already closed */ } },
  };
}

module.exports = { createStorage, newAuditId };

export const meta = {
  name: 'pressure-test',
  description: 'Adversarial multi-lens pressure test of a built artifact: diverse lenses probe in parallel → dedupe → independent skeptics confirm each high-severity finding → severity-gated verdict',
  phases: [
    { title: 'Probe', detail: 'one adversarial agent per lens, each trying to break the work' },
    { title: 'Confirm', detail: 'independent skeptic reproduces each high-severity finding to kill false positives' },
    { title: 'Gate', detail: 'severity-based pass/fail verdict with blocking findings' },
  ],
}

// Run with: Workflow({ scriptPath: "~/.claude/workflows/pressure-test.js",
//   args: { repoDir, specPath, buildSummary, lenses: [{key,prompt}], failHighThreshold } })
const repoDir = (args && args.repoDir) || '.'
const specPath = (args && args.specPath) || 'SPEC.md'
const buildSummary = (args && args.buildSummary) || '(no build summary provided)'
const lenses = (args && args.lenses && args.lenses.length) ? args.lenses : [
  { key: 'correctness', prompt: 'Does the implementation actually satisfy every acceptance criterion? Find logic bugs, unhandled edge cases, and criteria that are silently unmet.' },
  { key: 'security', prompt: 'Find security holes: injection, authz/authn gaps, secrets in code, unsafe input handling, vulnerable dependencies.' },
  { key: 'does-it-run', prompt: 'Actually build and boot it. Run typecheck and tests, hit the key path. Report anything that does not run as claimed.' },
  { key: 'robustness', prompt: 'Attack failure modes: error handling, race conditions, resource leaks, what breaks under bad input or load.' },
]
// CRITICAL findings always fail. failHighThreshold = how many confirmed HIGHs are tolerated before failing.
const failHighThreshold = (args && typeof args.failHighThreshold === 'number') ? args.failHighThreshold : 1
const usingDefaultLenses = !(args && args.lenses && args.lenses.length)

// Fail-LOUD visibility. A misconfigured run (args not received → wrong repo/lenses/no summary)
// previously burned a full swarm reviewing the wrong target without ever flagging it. Log the
// RESOLVED config up front so a mis-target is obvious in the first progress line, not after 275k tokens.
log(`pressure-test config → repoDir="${repoDir}" · specPath="${specPath}" · lenses=[${lenses.map((l) => l.key).join(', ')}]${usingDefaultLenses ? ' (DEFAULTS — args.lenses not received?)' : ''} · buildSummary=${buildSummary === '(no build summary provided)' ? 'MISSING' : 'present'}`)
// Hard abort BEFORE spawning any agent if every input is a default — that means args never
// reached the workflow, and a full swarm would otherwise burn ~275k tokens reviewing the cwd
// with generic lenses (this actually happened once). A real run always supplies at least one of
// lenses / buildSummary / a non-cwd repoDir, so this never trips a legitimately-configured run.
if (repoDir === '.' && specPath === 'SPEC.md' && usingDefaultLenses && buildSummary === '(no build summary provided)') {
  log('⛔ Aborting before spawn: every input is a default — args did not reach the workflow. Nothing reviewed.')
  return { pass: false, aborted: true, verdict: 'NOT RUN — args not received (all inputs defaulted); re-invoke with args' }
}

const FINDINGS_SCHEMA = {
  type: 'object',
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'severity', 'evidence'],
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          evidence: { type: 'string', description: 'concrete proof: file:line, command output, or repro steps' },
          location: { type: 'string' },
          fix: { type: 'string', description: 'concrete suggested remediation' },
        },
      },
    },
  },
}

const CONFIRM_SCHEMA = {
  type: 'object',
  required: ['confirmed', 'reason'],
  properties: {
    confirmed: { type: 'boolean', description: 'true only if the finding is real and reproducible' },
    reason: { type: 'string' },
    adjustedSeverity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
  },
}

phase('Probe')
const probes = await parallel(lenses.map((lens) => () =>
  agent(
    `You are an adversarial reviewer applying the "${lens.key}" lens. The work is in ${repoDir}; acceptance criteria are in ${specPath}.\n\n` +
    `Build summary claimed:\n${buildSummary}\n\n` +
    `Your job: ${lens.prompt}\n\n` +
    `Be adversarial — assume the work is broken until proven otherwise. Cite concrete evidence (file:line, command output, repro steps). ` +
    `Only report REAL findings; an empty list is a valid, honest result. Do not invent issues to look thorough.`,
    { label: `probe:${lens.key}`, phase: 'Probe', schema: FINDINGS_SCHEMA }
  ).then((r) => ({ lens: lens.key, findings: (r && r.findings) || [] }))
))

// Barrier justified: dedupe across ALL lenses before the expensive confirm pass.
// Collision-resistant key — NEVER merge on a truncated title prefix (that silently dropped
// distinct findings). With a location: key on location + full title (merges the same issue
// found by different lenses). Without one: key on full title + evidence head, so two findings
// that merely share an opening phrase stay separate.
const all = probes.filter(Boolean).flatMap((p) => p.findings.map((f) => ({ ...f, lens: p.lens })))
const seen = new Set()
const deduped = all.filter((f) => {
  const loc = (f.location || '').trim()
  const title = String(f.title || '').toLowerCase()
  const k = loc
    ? `loc:${loc}|${title}`
    : `nol:${title}|${String(f.evidence || '').slice(0, 160).toLowerCase()}`
  if (seen.has(k)) return false
  seen.add(k); return true
})
const highPlus = deduped.filter((f) => f.severity === 'critical' || f.severity === 'high')
log(`${deduped.length} unique findings (${highPlus.length} high+); confirming high-severity ones`)

phase('Confirm')
// Spend confirm budget only on high+ findings; medium/low pass through as advisory.
// FAIL CLOSED: if the confirmer errors, times out, or returns no usable verdict, the finding
// (already high/critical) is KEPT as blocking — a broken confirmer must never silently clear a
// real critical. Only an explicit `confirmed:false` from a working confirmer downgrades it.
const confirmedHigh = await parallel(highPlus.map((f) => async () => {
  try {
    const v = await agent(
      `Independently verify this ${f.severity} finding is REAL, working in ${repoDir}:\n\n` +
      `Title: ${f.title}\nLocation: ${f.location || 'n/a'}\nClaimed evidence: ${f.evidence}\n\n` +
      `Reproduce it yourself. Default to confirmed:false unless you can prove it. If it is real but mis-rated, set adjustedSeverity.`,
      { label: `confirm:${String(f.title).slice(0, 30)}`, phase: 'Confirm', schema: CONFIRM_SCHEMA }
    )
    if (!v || typeof v.confirmed !== 'boolean') {
      return { ...f, confirmed: true, confirmerErrored: true, confirmReason: 'confirmer returned no usable verdict — failing closed' }
    }
    return { ...f, severity: v.adjustedSeverity || f.severity, confirmed: v.confirmed, confirmReason: v.reason }
  } catch (e) {
    return { ...f, confirmed: true, confirmerErrored: true, confirmReason: `confirmer threw (${e && e.message ? e.message : 'error'}) — failing closed` }
  }
}))

phase('Gate')
const real = confirmedHigh.filter(Boolean).filter((f) => f.confirmed)
const blockingCritical = real.filter((f) => f.severity === 'critical')
const blockingHigh = real.filter((f) => f.severity === 'high')
const advisory = deduped.filter((f) => f.severity === 'medium' || f.severity === 'low')
const pass = blockingCritical.length === 0 && blockingHigh.length < failHighThreshold
const erroredConfirmers = real.filter((f) => f.confirmerErrored).length
if (erroredConfirmers) log(`⚠️  ${erroredConfirmers} confirmer(s) failed — those findings kept as blocking (fail-closed)`)

return {
  pass,
  verdict: pass ? 'SURVIVED pressure test' : 'FAILED pressure test — fix blocking findings and rebuild',
  blocking: [...blockingCritical, ...blockingHigh].map((f) => ({ severity: f.severity, title: f.title, location: f.location, evidence: f.evidence, fix: f.fix, lens: f.lens, confirmerErrored: f.confirmerErrored || false })),
  advisory: advisory.map((f) => ({ severity: f.severity, title: f.title, lens: f.lens, fix: f.fix })),
  lensesRun: lenses.map((l) => l.key),
  configWarning: (repoDir === '.' && usingDefaultLenses && buildSummary === '(no build summary provided)') ? 'ran on defaults — args likely not received; verify target' : undefined,
}

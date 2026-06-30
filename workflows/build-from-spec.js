export const meta = {
  name: 'build-from-spec',
  description: 'Build from a locked SPEC.md: decompose → parallel build (worktree-isolated) → verify each → report acceptance-criteria coverage',
  phases: [
    { title: 'Decompose', detail: 'read SPEC.md → ordered build tasks mapped to acceptance criteria' },
    { title: 'Build & Verify', detail: 'each task built in an isolated worktree, then proven against its criteria' },
    { title: 'Report', detail: 'acceptance-criteria pass/fail + build verdict' },
  ],
}

// Run with: Workflow({ scriptPath: "~/.claude/workflows/build-from-spec.js", args: { specPath, repoDir } })
const specPath = (args && args.specPath) || 'SPEC.md'
const repoDir = (args && args.repoDir) || '.'

const TASKS_SCHEMA = {
  type: 'object',
  required: ['tasks'],
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'work', 'criteria'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          work: { type: 'string', description: 'concrete implementation instructions' },
          criteria: { type: 'array', items: { type: 'string' }, description: 'acceptance criteria this task must satisfy' },
          dependsOn: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['pass', 'summary'],
  properties: {
    pass: { type: 'boolean' },
    summary: { type: 'string' },
    failing: { type: 'array', items: { type: 'string' } },
    evidence: { type: 'string', description: 'typecheck/test/boot output proving the verdict' },
  },
}

phase('Decompose')
const plan = await agent(
  `Read ${specPath} in ${repoDir}. Decompose its acceptance criteria into the smallest ordered set of build tasks. ` +
  `Each task: concrete work instructions and which acceptance criteria it satisfies. Respect the golden path (~/.claude/templates/GOLDEN-PATH.md) and the AGENT-STANDARD. Do not write code — only plan.`,
  { schema: TASKS_SCHEMA, label: 'decompose' }
)
const tasks = (plan && plan.tasks) || []
log(`${tasks.length} build tasks derived from ${specPath}`)
if (!tasks.length) return { error: 'No tasks derived — is SPEC.md present and specific?' }

phase('Build & Verify')
const results = await pipeline(
  tasks,
  // Stage 1 — build in an isolated worktree so parallel tasks don't collide
  (t) => agent(
    `Implement build task "${t.title}" in ${repoDir}.\n\nWork: ${t.work}\n\nFollow the golden path + AGENT-STANDARD. Make focused, idiomatic changes that match surrounding code. Return a concise summary of what you changed (files + why).`,
    { label: `build:${t.id}`, phase: 'Build & Verify', isolation: 'worktree' }
  ).then((changes) => ({ t, changes })),
  // Stage 2 — adversarially verify against THIS task's acceptance criteria
  (built) => built && agent(
    `Verify task "${built.t.title}" is actually done. Acceptance criteria:\n- ${built.t.criteria.join('\n- ')}\n\n` +
    `Changes claimed:\n${built.changes}\n\nRun the real checks (npx tsc --noEmit, tests if present, boot the app and hit the key route). ` +
    `Be adversarial — default to pass:false unless the evidence proves it. Report evidence.`,
    { label: `verify:${built.t.id}`, phase: 'Build & Verify', schema: VERDICT_SCHEMA }
  ).then((v) => ({ ...built, verdict: v }))
)

phase('Report')
const done = results.filter(Boolean)
const passed = done.filter((r) => r.verdict && r.verdict.pass)
const failed = done.filter((r) => !r.verdict || !r.verdict.pass)
// Tasks whose build returned falsy were dropped by filter(Boolean) above — they produced
// NOTHING. They MUST count as failures, never silently vanish into a false "ALL CRITERIA MET".
const doneIds = new Set(done.map((r) => r.t && r.t.id))
const lost = tasks.filter((t) => !doneIds.has(t.id))
log(`${passed.length}/${tasks.length} tasks verified passing (${failed.length} failed, ${lost.length} produced nothing)`)

const allFailed = [
  ...failed.map((r) => ({ title: r.t.title, why: r.verdict ? r.verdict.failing : 'verifier error' })),
  ...lost.map((t) => ({ title: t.title, why: 'build produced no result (agent errored or returned empty) — task silently dropped' })),
]
return {
  spec: specPath,
  total: tasks.length,
  passed: passed.map((r) => r.t.title),
  failed: allFailed,
  verdict: (failed.length === 0 && lost.length === 0) ? 'ALL CRITERIA MET' : 'INCOMPLETE — see failed[]',
}

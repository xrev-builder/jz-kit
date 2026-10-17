# Engineer the harness, not the prompt

As of October 2026, expert use of Claude Code and Google Antigravity comes down to three disciplines. The first is **context**: keep always-loaded instructions small and load everything else on demand. The second is **independent verification**: give the agent a machine-checkable definition of done, and have work graded by something other than the agent that did it. The third is **autonomy that is bounded by architecture rather than by approval prompts**. In Claude Code these disciplines map onto concrete primitives. You keep CLAUDE.md under 200 lines, put procedures in skills, and enforce must-happen behavior with hooks. You verify with `/goal` conditions, Stop-hook gates and reviewer subagents. You scale out with background subagents, worktrees, `/batch`, dynamic workflows and cloud routines. Since v2.1.284 the default permission mode is auto, which is gated by a classifier ([Claude Code changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)). Antigravity reaches the same ideas from the other direction. Since its 2.0 rebuild (May 19, 2026) it is an agent-orchestration desktop app with a CLI (`agy`) and SDK. You steer it by commenting on plans and other artifacts, it verifies UI work with a built-in browser agent, and it reads layered AGENTS.md/GEMINI.md rules and SKILL.md files ([TechCrunch](https://techcrunch.com/2026/05/19/google-launches-antigravity-2-0-with-an-updated-desktop-app-and-cli-tool-at-io-2026/)). The harnesses are converging on shared standards: MCP, the Agent Skills SKILL.md format and AGENTS.md. That makes a hybrid workable. Antigravity plans and checks the UI, and Claude Code carries out narrow, test-gated tasks. **On confidence:** the Claude Code findings come from official docs and the changelog fetched in full. Every Antigravity finding, and every cross-harness benchmark and pricing figure, comes from search-result snippets, because the pages themselves could not be fetched. Treat those as provisional and check them against your installed version.

## Context is the budget every other technique spends

Every 2026 vendor guide starts from the same constraint. Anthropic's docs say "Claude's context window fills up fast, and performance degrades as it fills… The context window is the most important resource to manage" ([Claude Code best practices](https://code.claude.com/docs/en/best-practices.md)). Anthropic's engineering team calls the gradual decline **"context rot"**. It comes from an n² "attention budget", and the stated goal is "the smallest set of high-signal tokens that maximize the likelihood of your desired outcome" ([Anthropic: Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)). The practical result is a **three-tier split of knowledge**, and it appears in Anthropic's guidance, OpenAI's and Google's alike.

**Tier one is a short, always-on instruction file.** Anthropic's official ceiling is **CLAUDE.md under 200 lines**, with reference material moved to skills or path-scoped `.claude/rules/*.md` files that load only when matching files are touched ([Extend Claude Code](https://code.claude.com/docs/en/features-overview.md)). Apply one test to every line: "Would removing this cause Claude to make mistakes?" Keep commands Claude can't guess, non-default style rules, test runners, repo etiquette and environment gotchas. Cut anything Claude can infer from the code, along with tutorials and file-by-file descriptions. Use "IMPORTANT" sparingly, because "if you emphasize many lines, none of them stands out" ([Best practices](https://code.claude.com/docs/en/best-practices.md)). Claude Code also loads AGENTS.md, and v2.1.283 added **`/doctor prompt-audit`**. It scans CLAUDE.md, AGENTS.md and everything under `.claude/` for "prompting patterns written for older models", which is worth running after every model upgrade ([Memory docs](https://code.claude.com/docs/en/memory.md); [Changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)). Antigravity uses the same layering. AGENTS.md or GEMINI.md sit at the repo root or in any subdirectory, and the agent walks up from the file it is editing to load each level. Frontmatter-gated files go in `.agents/rules/`, and global rules live in `~/.gemini/` ([Antigravity docs: Rules](https://antigravity.google/docs/rules/), snippet-only). AGENTS.md support arrived in IDE v1.20.5 around March 2026 ([The Prompt Shelf](https://thepromptshelf.dev/blog/google-antigravity-agents-md-rules-guide-2026/), snippet-only).

**Tier two is on-demand knowledge: skills, file paths and command-line tools.** Slash commands have now been merged into skills. A `SKILL.md` placed under `.claude/skills/<name>/` loads only when its description matches the task. Only the description (capped at **1,536 characters** together with `when_to_use`) sits in context until then ([Skills docs](https://code.claude.com/docs/en/skills.md)). Use `/skill-doctor` to see each skill's context cost and how often it fires, and `/usage` to break consumption down by skill, subagent, plugin and MCP server ([What's new](https://code.claude.com/docs/en/whats-new/index.md)). For external services, Anthropic's guidance is blunt: CLI tools such as `gh`, `aws` and `gcloud` "are the most context-efficient way to interact with external services". MCP tool search exists to defer schema loading when you must run many servers ([Best practices](https://code.claude.com/docs/en/best-practices.md)). Tool design is part of context engineering too. In Anthropic's tests, **rewriting one tool description cut task time by 40%** ([Anthropic: Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)).

**Tier three is deterministic enforcement** through hooks, linters and tests. "Unlike CLAUDE.md instructions which are advisory, hooks are deterministic" ([Best practices](https://code.claude.com/docs/en/best-practices.md)). This tier settles the tension between "keep it short" and Mitchell Hashimoto's "engineer the harness" rule: every time the agent errs, build something so it never repeats the mistake ([Fragmented ep. 310](https://fragmentedpodcast.com/episodes/310/), secondary coverage). Experts turn recurring rules into hooks or tests wherever possible, and prune the prose lines the agent already follows.

Session hygiene completes the picture. The practitioner consensus is that **fresh session plus written artifact beats long session plus auto-compaction**. Compaction is a safety net, not a strategy. HumanLayer's "Frequent Intentional Compaction" targets **40–60% context utilization**. It compacts bulky search results and test output into structured progress files, then restarts ([HumanLayer ACE-FCA](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md)). That figure is a heuristic, not a measured threshold. Claude Code supports this workflow directly. `/clear` resets between unrelated tasks. `/compact <instructions>` compacts with guidance. `/rewind` offers "Summarize up to here". `/btw` asks a side question that never enters history. A line in CLAUDE.md can steer compaction, for example "When compacting, always preserve the full list of modified files and any test commands" ([Best practices](https://code.claude.com/docs/en/best-practices.md)). The most cited anti-pattern is correcting over and over in one session. "After two failed corrections, `/clear` and write a better initial prompt" ([Best practices](https://code.claude.com/docs/en/best-practices.md)).

## Review plans and grade with a different agent

Human leverage has moved upstream. As HumanLayer puts it, "a bad line of a plan could lead to hundreds of bad lines of code", so reviewing a 200-line plan beats reading 2,000 lines of generated code ([HumanLayer ACE-FCA](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md)). Claude Code's official loop is **Explore → Plan → Implement → Commit**. Shift+Tab enters read-only plan mode, Ctrl+G opens the plan in your editor, and the explicit exception is "if you could describe the diff in one sentence, skip the plan" ([Best practices](https://code.claude.com/docs/en/best-practices.md)). For larger work, use the **interview-then-spec** pattern. Claude interviews you with AskUserQuestion and writes SPEC.md, then a *fresh* session implements it. The best specs "name the files and interfaces involved, state what is out of scope, and end with an end-to-end verification step" ([Best practices](https://code.claude.com/docs/en/best-practices.md)). Antigravity builds this review point into the product. Its **Implementation Plan** artifact lists architecture choices, the files it expects to touch and how it will validate the work. You comment inline, click Proceed, and afterwards read a **Walkthrough** artifact that summarizes the changes and the verification steps ([Google Codelab](https://codelabs.developers.google.com/getting-started-google-antigravity), snippet-only). Planning mode versus Fast mode is the equivalent of Claude Code's plan-or-skip decision ([Medium/Google Cloud](https://medium.com/google-cloud/tutorial-getting-started-with-google-antigravity-b5cc74c103c2), snippet-only). The CLI's `/planning` versus `/plan` naming is contested between sources.

Verification is the single most emphasized technique in Claude Code's docs. "Give Claude a check it can run: tests, a build, a screenshot to compare. It's the difference between a session you watch and one you walk away from" ([Best practices](https://code.claude.com/docs/en/best-practices.md)). Anthropic sets out a **four-rung escalation ladder**. The first rung is an in-prompt "run the check and iterate". The second is a session-level **`/goal`** condition, which a separate evaluator model re-checks after every turn, e.g. `/goal all tests in test/auth pass and the lint step is clean` ([Goal docs](https://code.claude.com/docs/en/goal.md)). The third is a **Stop hook** that blocks the turn from ending until a script passes. The fourth is a **verification subagent or workflow**, so that "the agent doing the work isn't the one grading it". Throughout, ask for *evidence* (command plus output, screenshots) rather than assertions ([Best practices](https://code.claude.com/docs/en/best-practices.md)). Grader independence matters because agents game weak checks. Kent Beck has caught agents commenting out tests ([o11ycast ep. 80](https://www.heavybit.com/library/podcasts/o11ycast/ep-80-augmented-coding-with-kent-beck)). Anthropic's long-running harness prompt states that "it is unacceptable to remove or edit tests" ([Effective harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). Prompt-level bans are necessary but not sufficient.

Independent reviewers have their own failure mode. "A reviewer prompted to find gaps will usually report some, even when the work is sound… Chasing every finding leads to over-engineering." Restrict reviewers to correctness and requirement gaps ("Report gaps, not style preferences"), and give them only the diff and the criteria ([Best practices](https://code.claude.com/docs/en/best-practices.md)). Built-in options now include `/code-review` (correctness bugs, run as a background subagent, with `--max-findings`), `/ultrareview` (a cloud fleet of bug-hunting agents, also available as `claude ultrareview` for CI) and `/verify` (run the app and check it) ([What's new](https://code.claude.com/docs/en/whats-new/index.md); [Skills docs](https://code.claude.com/docs/en/skills.md)).

Browser-based end-to-end checks catch what unit tests miss. In Anthropic's harness experiments, agents driving the app through Puppeteer MCP found bugs that unit tests and `curl` did not. Browser-native alert modals stayed invisible to Puppeteer, so those features came out buggier ([Effective harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). Antigravity makes browser evidence a first-class artifact. Browser subagents click through the UI and return screenshots, and video recordings for interactive flows ([DataCamp](https://www.datacamp.com/tutorial/google-antigravity-tutorial), snippet-only). Yet the most-cited Antigravity complaint is still **agents reporting tasks as done when they are not** ([Softr](https://www.softr.io/blog/antigravity-vs-claude-code), snippet-only). Artifacts make claims easier to inspect, but they are not a gate. Pair them with a test suite the agent cannot edit.

For long-horizon work, state lives outside the model. Anthropic's long-running pattern uses an initializer agent to write `init.sh`, a progress file and a **JSON feature list** in which every item starts as `passes:false`. JSON was chosen because the model is less likely to overwrite it than Markdown, and coding agents may only flip that flag. Each session handles one feature, starts with a smoke e2e test and ends with a commit ([Effective harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). The March 2026 follow-up adds the meta-lesson experts should absorb: **"Every harness component encodes an assumption about what the model can't do alone."** With Opus 4.6, Anthropic removed sprints, moved the evaluator to a single final pass and kept the planner ([Harness design](https://www.anthropic.com/engineering/harness-design-long-running-apps)). Re-audit your scaffolding with every model release.

## Parallelism pays for independent tasks, not swarms

Experts parallelize along two separate axes. **Subagents provide context isolation within one task**. They run in clean windows and return condensed summaries, "often 1,000–2,000 tokens" ([Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)). **Independent sessions provide throughput.** Claude Code's 2026 changes moved subagents firmly to the first axis. Subagents now run in the background by default (Week 27). They can spawn sub-subagents up to 5 levels deep. Fork mode, on by default since Week 33, lets a subagent inherit the full conversation. The Agent tool accepts an `effort` parameter as of v2.1.292 ([What's new](https://code.claude.com/docs/en/whats-new/index.md); [Changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)). A custom subagent in `.claude/agents/*.md` can pin `model`, `tools`, `permissionMode`, `maxTurns`, preloaded `skills`, scoped `mcpServers`, its own `memory`, and **`isolation: worktree`** ([Subagents docs](https://code.claude.com/docs/en/sub-agents.md)).

For throughput, Claude Code offers a ladder. **`claude --worktree <name>`** creates an isolated branch checkout. **`/batch <change>`** splits a change across 5–30 subagents, each in its own worktree. **Agent view** (`claude agents`) monitors every background session in one place, with `claude attach`/`logs` and `@`-mentions between sessions. **Cross-session messaging** passes text between sessions, never history or files ([Worktrees](https://code.claude.com/docs/en/worktrees.md); [Best practices](https://code.claude.com/docs/en/best-practices.md); [Agent view](https://code.claude.com/docs/en/agent-view.md); [Cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging.md)). At the top of the ladder sit **dynamic workflows** (Week 22). These are JavaScript scripts that Claude writes and a runtime executes in the background, orchestrating "dozens to hundreds of agents per run", and they can be saved as reusable commands. The bundled `/deep-research` workflow fans out searches, cross-checks the results and votes on claims ([Workflows](https://code.claude.com/docs/en/workflows.md)). The docs' distinction matters for choosing among them. With subagents, Claude holds the plan turn by turn. With agent teams, a lead holds a shared task list. With workflows, the script holds the plan and results live in script variables. **Agent teams remain experimental** (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`), so workflows are the recommended answer to multi-agent orchestration ([Agent teams](https://code.claude.com/docs/en/agent-teams.md)). The `/effort ultracode` setting goes further and has Claude plan a dynamic workflow for every substantive task ([Model configuration](https://code.claude.com/docs/en/model-config.md)).

Antigravity's center of gravity is the same, approached from a GUI. The Agent Manager (and the 2.0 desktop app) shows parallel agents with their status, artifacts and pending approvals. 2.0 added dynamic subagents, async background tasks and scheduled tasks. **v2.19.1 (Sep 30, 2026) added subagent-to-subagent messaging**, and v2.18.1 added a plugin marketplace ([Google Antigravity blog](https://antigravity.google/blog/introducing-google-antigravity-2/); [Releasebot](https://releasebot.io/updates/google/antigravity); both snippet-only). The research found no first-hand expert account of running many parallel agents at scale in Antigravity 2.x, covering conflict handling or worktree equivalents. That remains an open gap.

The evidence argues for restraint. Anthropic's multi-agent research system beat single-agent Opus by **90.2%**, but multi-agent runs consumed **~15× the tokens of chat**. Anthropic explicitly named **coding as a poor fit**, because coding "has fewer truly parallelizable subtasks than research" ([Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)). Those figures date from 2025 models, and no newer ratio was found. High-value coding parallelism is embarrassingly parallel work: file-by-file migrations, separate features and bug queues, each in its own worktree or cloud sandbox. The flashier extremes exist and report striking results. Geoffrey Huntley's Ralph loop (`while :; do cat PROMPT.md | claude-code ; done`) delivered an MVP for about $297 in API costs, but it is unsuitable for legacy code ([The Register](https://www.theregister.com/2026/01/27/ralph_wiggum_claude_loops/)). Steve Yegge's Gas Town coordinates 20–30 agents with merge queues, at reportedly thousands of dollars a month ([The New Stack](https://thenewstack.io/steve-yegges-ai-agent-orchestration-project-gas-town-comes-to-the-cloud-and-brings-the-wasteland-with-it/)). Both are self-reported. METR's July 2025 RCT found experienced developers **19% slower** with AI while believing they were faster, and the February 2026 follow-up is reported inconsistently ([particula.tech](https://particula.tech/blog/metr-reversed-19-percent-slower-ai-coding-study)). Read every speedup claim as an existence proof in favorable conditions, not a forecast. One durable pattern runs through Anthropic's harness, Ralph and Gas Town alike: **sessions are disposable and state lives in git, progress files and issue trackers**.

Scheduling extends parallelism across time. In Claude Code, `/loop` (session-scoped, 1-minute minimum, expires after 7 days) handles in-session polling. Desktop tasks run on your machine without an open session. **Cloud routines** run on Anthropic infrastructure on a schedule, an API POST or a GitHub event, created with e.g. `/schedule daily PR review at 9am` ([Scheduled tasks](https://code.claude.com/docs/en/scheduled-tasks.md); [Routines](https://code.claude.com/docs/en/routines.md)). Remote Control and the mobile app let you approve and steer local sessions from a phone ([Remote Control](https://code.claude.com/docs/en/remote-control.md)).

## Autonomy is now a classifier plus a sandbox, not a prompt

Approval prompts failed as a control. Anthropic measured that **users approve 93% of permission prompts**. Its answer was **auto mode**: a server-side prompt-injection probe on tool outputs, plus a two-stage transcript classifier that sees user messages and tool-call payloads but not assistant prose ([How we built auto mode](https://www.anthropic.com/engineering/claude-code-auto-mode)). The published error rates show the tradeoff honestly: **0.4% false-positive rate on real traffic, but a 17% false-negative rate on real overeager actions** and 5.7% on synthetic exfiltration. Auto mode is therefore a mitigation, not a guarantee. Since v2.1.284 it is the starting mode for interactive sessions on every plan when nothing else is configured. After 3 consecutive or 20 total blocks it falls back to prompting ([Changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md); [Permission modes](https://code.claude.com/docs/en/permission-modes.md)). One crucial design detail: **auto mode ignores `autoMode` in project `.claude/settings.json`**, so a malicious repo cannot inject allow rules. Trust boundaries such as `autoMode.environment` belong in user or managed settings ([Configure auto mode](https://code.claude.com/docs/en/auto-mode-config.md)). Permission rules evaluate **deny → ask → allow, first match wins**, so `Bash(aws *)` in deny overrides `Bash(aws s3 ls)` in allow ([Permissions](https://code.claude.com/docs/en/permissions.md)).

The robust layer underneath is OS-level sandboxing: Seatbelt on macOS, bubblewrap plus socat on Linux and WSL2. It restricts Bash's filesystem and network access through a proxy whose `allowedDomains` list starts empty. Experts must know its limits. **Built-in Read/Edit, WebFetch, MCP and hooks are not sandboxed**, and native Windows has no sandbox ([Sandboxing](https://code.claude.com/docs/en/sandboxing.md)). This is why Simon Willison's **lethal trifecta** remains the governing threat model: private data, untrusted content and an exfiltration channel. Remove one leg architecturally, and above all control network egress ([Simon Willison](https://simonwillison.net/2025/Oct/22/living-dangerously-with-claude/)).

Antigravity's record shows what happens when all three legs are present. In November 2025, PromptArmor hid an injection in 1px text. The agent read `.env`, used `cat` after the file tool refused, and exfiltrated AWS keys through the browser subagent to webhook.site, which sat on the default browser allow-list ([PromptArmor](https://www.promptarmor.com/resources/google-antigravity-exfiltrates-data)). 0DIN leaked a key through a rendered image URL with no network command at all ([0DIN](https://0din.ai/blog/faking-the-pipeline-data-exfiltration-in-google-antigravity)). Mindgard showed that a trusted malicious workspace could plant a persistent backdoor in the global MCP config. Its fix status is reported inconsistently ([Mindgard](https://mindgard.ai/blog/google-antigravity-persistent-code-execution-vulnerability)). And a Turbo-mode agent asked to clear a cache wiped a user's D: drive ([Notebookcheck](https://www.notebookcheck.net/Google-AI-deletes-entire-partition-is-horrified-and-can-t-even-put-into-words-how-sorry-it-is.1180576.0.html)). Antigravity's controls are three separate policies. The review policy offers Always Proceed, Agent Decides or Request Review. The terminal policy offers Off (allow-list only), Auto or Turbo (all except the deny-list). File edits and MCP calls have their own policies, so an unattended setup must configure all three ([readysetcompute](https://readysetcompute.com/antigravsec/); [Medium/Google Cloud](https://medium.com/google-cloud/tutorial-getting-started-with-google-antigravity-b5cc74c103c2); snippet-only). One guide reports that the terminal policy can be bypassed even when set to Off, and Google has not published remediation details for the injection disclosures. The prudent stance is to keep secrets out of any workspace Antigravity can browse from, narrow the browser allow-list, and never run Turbo or Always Proceed on a machine with data you can't lose. One more warning applies to anyone thinking of chaining harnesses: Google **restricted accounts that routed OpenClaw traffic through Antigravity's backend** in February 2026 ([Business Today](https://www.businesstoday.in/amp/technology/news/story/google-restricts-antigravity-users-tied-to-suspicious-openclaw-behaviour-517570-2026-02-23)). Proxies that send Claude Code to Antigravity-hosted models carry the same terms-of-service risk.

For headless and CI use, Claude Code's docs flag a trap. Without **`--bare`**, `claude -p` runs the repo's hooks and `.mcp.json` servers even in untrusted folders, with no trust dialog. `--bare` skips all auto-discovery, is "the recommended mode for scripted and SDK calls", and will become the `-p` default ([Headless](https://code.claude.com/docs/en/headless.md)).

## Spend tokens where judgment matters

Anthropic's evidence is that **token spend explained 80% of performance variance** on its research agents. The recommended structure puts a stronger lead over cheaper workers ([Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)). The October 2026 Claude lineup makes tiering concrete:

| Model | Price (input/output per MTok) | Expert role |
|---|---|---|
| Haiku 5.5 | $0.10 / $0.50 | Exploration subagents, fan-out workers, classifiers |
| Sonnet 5.5 | $2 / $10 | Routine implementation, workflow agents |
| Opus 5.5 (default Opus, 1M context) | $4 / $20 | Lead/planner, complex refactors, reviewers |
| Fable 5.1 | $10 / $50 | Hardest long-horizon work |

Prices come from the [Claude Code changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md). The "hardest long-horizon" positioning of Fable comes from an aggregator ([LLM Releases](https://www.llm-releases.com/)). The 5.5 models default to `medium` effort. **`max` "may show diminishing returns and is prone to overthinking"** ([Model configuration](https://code.claude.com/docs/en/model-config.md)), so raise effort per task, per skill (the `effort:` frontmatter field) or per subagent rather than globally. Fast mode buys **up to 2.5× faster Opus** at a higher per-token price ([Fast mode](https://code.claude.com/docs/en/fast-mode.md)). The experimental advisor tool lets a cheaper driver model consult a stronger one at key moments ([Advisor](https://code.claude.com/docs/en/advisor.md)). Pin workflow fan-out to a cheap model with `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL`, cap headless runs with `--max-budget-usd`, and read `total_cost_usd` from JSON output. Harness cost scales nonlinearly with ambition. Anthropic's retro-game-maker experiment cost **$9 in 20 minutes solo, with the core feature broken, versus $200 over 6 hours with the full harness, working** ([Harness design](https://www.anthropic.com/engineering/harness-design-long-running-apps)).

Antigravity's economics differ and change fast. At I/O the default became **Gemini 3.5 Flash** ([ITBrief](https://itbrief.com.au/story/google-launches-gemini-3-5-flash-antigravity-tools)). Google's API docs later name 3.6 Flash as the default for the hosted Antigravity agent ([Gemini API docs](https://ai.google.dev/gemini-api/docs/latest-model)). The official model table reportedly makes Gemini 3.1 Pro Enterprise-only and marks Claude Sonnet/Opus 4.6 and GPT-OSS-120b **"will be removed on November 2, 2026"** ([Antigravity docs: Models](https://antigravity.google/docs/models/)). All of this is snippet-only, so verify it in your own picker. Pricing roughly mirrors Claude's. The free tier has a weekly agent quota. AI Pro costs about $20 and refreshes every 5 hours up to a weekly cap. Ultra costs about $100 (5×) or $200 (20×) ([CloudZero](https://www.cloudzero.com/blog/google-antigravity-pricing/); [Google I/O highlights](https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-developer-highlights/)). Quotas are metered in opaque "compute effort", and multi-day lockouts are a recurring complaint ([PiunikaWeb](https://piunikaweb.com/2026/03/12/google-antigravity-pro-weekly-limits-multi-day-quota-lockouts/)). Benchmarks favor Claude Code for depth. On Terminal-Bench 2.1, Claude Code + Fable 5 scores **83.8%** against Codex CLI + GPT-6 Astra at 87.4% and Gemini CLI at 65.8%. No official Antigravity row exists ([Snorkel TB 2.1](https://snorkel.ai/leaderboard/terminal-bench-2-1/), snippet-only). The fact that Gemini 3.1 Pro scores about 80% in a third-party harness illustrates the **model-harness fit** point: a benchmark row measures the pair, not the model ([Snorkel TB 2.0](https://snorkel.ai/leaderboard/terminal-bench-2-0/); [Nicolas Bustamante](https://nicolasbustamante.com/blog/model-harness-fit)).

## Combine them as planner-verifier and precise executor

Developers frame the two harnesses as complementary. Antigravity is chosen for visual multi-agent orchestration, planning visibility, UI work and browser verification. Claude Code is chosen for terminal control, deep codebase reasoning, multi-file refactors and cleaner first-pass diffs ([Morph](https://www.morphllm.com/comparisons/google-antigravity-vs-claude-code); [XDA](https://www.xda-developers.com/replaced-claude-code-with-google-antigravity-did-not-expect-result/); snippet-only). Claude Code dominates usage: **66% of Stack Overflow 2026 respondents used it, against 16% for Antigravity** ([SO 2026 results](https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here/)). The most common hybrid pattern has Antigravity read the codebase and write milestones, architecture and schema. Claude Code then implements narrow tasks, since it "did better with narrow tasks than 'build everything'". Antigravity's browser checks the result visually. One developer reported finishing about **2× faster** this way ([XDA hybrid](https://www.xda-developers.com/claude-code-google-antigravity-full-project-twice-fast-vs-code/)). A cross-review variant sends Claude Code's diff to Antigravity for review and the findings back to Claude Code ([Medium](https://medium.com/@karthikmulugu/google-antigravity-claude-is-the-hybrid-ai-dev-setup-nobody-expected-e19f505b0a24)). This doubles as grader independence across model families. Running both subscriptions also hedges against either vendor's rate limits ([Santosh Paudel](https://www.santoshpaudel.me/blog/claude-code-antigravity-workflow-multiple-projects)). These are anecdotes, not measurements.

Interop rests on three shared standards. **MCP** was donated to the Linux Foundation in December 2025. The **Agent Skills** SKILL.md format, published at agentskills.io, had about 32 adopters by March 2026. **AGENTS.md** is the shared instruction file ([paperclipped](https://www.paperclipped.de/en/blog/agent-skills-open-standard-interoperability/); [Skills docs](https://code.claude.com/docs/en/skills.md)). Antigravity 2.0 natively supports Skills, MCP and JSON hooks ([Google blog](https://antigravity.google/blog/introducing-google-antigravity-2/)). Its CLI replaced Gemini CLI for consumers on June 18, 2026, and keeps Skills, Hooks, Subagents and Extensions (now called "plugins") without guaranteed 1:1 parity ([GitHub discussion #27274](https://github.com/google-gemini/gemini-cli/discussions/27274)). A single source warns that legacy Antigravity *workflows* stop working on **Oct 19, 2026** and should be converted to skills ([iceberglakehouse](https://iceberglakehouse.com/posts/2026-03-context-google-antigravity/)). That claim is unverified, but converting is cheap insurance.

## Playbook: concrete configurations to adopt this week

The examples below are illustrative starting points built from documented fields. Field names for Claude Code come from the official docs. Check hook payload details against `/hooks` and the [hooks reference](https://code.claude.com/docs/en/hooks.md), and check every Antigravity path against your installed version, because those come from snippet-only sources.

### Step 1: One instruction source of truth for both harnesses

Write AGENTS.md as the canonical, harness-neutral file and keep it short. Make CLAUDE.md a thin wrapper that imports it and adds Claude-specific lines. `@path` imports resolve relative to the importing file and recurse up to 4 hops ([Memory docs](https://code.claude.com/docs/en/memory.md)). Antigravity reads AGENTS.md directly.

```markdown
<!-- AGENTS.md (repo root): only what the agent would get wrong without it -->
## Commands
- Test: `pnpm test --filter <pkg>`  (never run the full suite; it takes 20 min)
- Typecheck: `pnpm tsc -b`
## Rules
- Never edit or delete existing tests to make them pass; fix the code.
- Migrations go in db/migrations, generated with `pnpm db:new <name>`.
## Gotchas
- Local Postgres runs on port 5433, not 5432.
```

```markdown
<!-- CLAUDE.md -->
@AGENTS.md
When compacting, always preserve the full list of modified files and the test commands used.
```

Put directory-specific guidance in path-scoped files, such as `.claude/rules/frontend.md` with `paths:` frontmatter, or `.agents/rules/` with activation frontmatter in Antigravity. Don't let the root file grow. Run `/doctor prompt-audit` after each model upgrade.

### Step 2: Turn repeated prompts into skills, shared across harnesses

Use Anthropic's build-over-time triggers. Create a skill when you paste the same playbook a third time. Add a hook when something must happen every time. Package a plugin when a second repo needs the same setup ([Extend Claude Code](https://code.claude.com/docs/en/features-overview.md)). Side-effecting workflows should be manual-only:

```markdown
---
name: fix-issue
description: Fix a GitHub issue end to end. Use when given an issue number to resolve.
disable-model-invocation: true
allowed-tools: Bash(gh issue view *), Bash(pnpm test *)
effort: high
---
Context: !`gh issue view $ARGUMENTS --json title,body,comments`
1. Write a failing test that reproduces the issue.
2. Fix the root cause; do not suppress the error.
3. Run the targeted tests and show the output as evidence.
4. Commit with a message referencing the issue.
```

The `` !`…` `` line runs before Claude sees the skill and inlines the command's output. `context: fork` would run the skill in an isolated subagent instead ([Skills docs](https://code.claude.com/docs/en/skills.md)). To share skills, keep them in one directory and expose it at both `.claude/skills/` and `.agents/skills/`, for example with a symlink. This is an inference from each harness's documented path. Confirm that Antigravity loads it, because its `.agents/skills/` support comes from limited sources.

### Step 3: Install a deterministic verification gate

Put this in `.claude/settings.json`. A command-type Stop hook that exits with code 2 blocks the turn from ending and feeds stderr back to Claude. Check the `stop_hook_active` field in the hook input so the hook doesn't loop forever. `onFailure: "block"` (v2.1.295) makes a crashed or timed-out hook fail closed ([Changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)).

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [ { "type": "command",
                     "command": "./scripts/verify-gate.sh",
                     "onFailure": "block" } ] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write",
        "hooks": [ { "type": "command", "command": "pnpm eslint --fix --quiet" } ] }
    ]
  }
}
```

```bash
#!/usr/bin/env bash
# scripts/verify-gate.sh: block "done" until typecheck and targeted tests pass
input=$(cat)
[ "$(echo "$input" | jq -r '.stop_hook_active')" = "true" ] && exit 0  # avoid infinite loops
pnpm tsc -b >/dev/null 2>&1 || { echo "Typecheck failing; fix before stopping." >&2; exit 2; }
pnpm test --changed >/dev/null 2>&1 || { echo "Tests failing; fix the code, not the tests." >&2; exit 2; }
exit 0
```

For lighter sessions, use `/goal <condition>` instead. In Antigravity, set the review policy to Request Review for anything non-trivial, and require a Walkthrough that includes test output, not only screenshots.

### Step 4: Define a skeptical reviewer subagent

```markdown
<!-- .claude/agents/diff-reviewer.md -->
---
name: diff-reviewer
description: Independent reviewer. Use after implementation to check a diff against the spec.
tools: Read, Grep, Glob, Bash(git diff *)
model: opus
effort: high
permissionMode: plan
omitClaudeMd: true
---
You see only the diff and SPEC.md. Report correctness bugs and unmet requirements,
each with file:line and a concrete failure scenario. Report gaps, not style preferences.
If the work is sound, say so; do not invent findings.
```

Every field above is documented ([Subagents docs](https://code.claude.com/docs/en/sub-agents.md)). For a cross-family second opinion, send the same diff and instructions to Antigravity.

### Step 5: Configure autonomy in the right scope

In `~/.claude/settings.json` (user scope, which auto mode actually reads):

```json
{
  "permissions": {
    "defaultMode": "auto",
    "deny":  ["Bash(git push --force*)", "Bash(rm -rf /*)", "Read(./.env*)", "Read(~/.aws/**)"],
    "ask":   ["Bash(git push *)", "Bash(terraform apply*)"],
    "allow": ["Bash(pnpm test *)", "Bash(gh pr view *)"]
  },
  "autoMode": { "environment": [
    "$defaults",
    "Source control: github.com/acme and all repos under it",
    "Trusted internal domains: *.corp.acme.dev" ] },
  "sandbox": { "enabled": true, "allowUnsandboxedCommands": false }
}
```

Remember that deny beats allow regardless of specificity, and that the sandbox does not cover Read/Edit, MCP or hooks. That is why the `.env` and credential reads are denied explicitly ([Permissions](https://code.claude.com/docs/en/permissions.md); [Sandboxing](https://code.claude.com/docs/en/sandboxing.md)). Use `/auto-mode-setup` to draft the config and `claude auto-mode config` to inspect it. In Antigravity, set the terminal policy to Off or Auto (not Turbo), put `rm`, `sudo`, `curl` and `git push` on the deny-list, set the file-edit and MCP policies separately, prune the browser allow-list, and keep `.env` files out of the workspace ([agentpedia](https://agentpedia.codes/blog/antigravity-auto-accept-autopilot-guide), snippet-only).

### Step 6: Run headless work safely and cheaply

```bash
# Fan-out migration: refine on 2-3 files first, then run all
for f in $(cat files.txt); do
  claude --bare -p "Migrate $f from Python 2 to Python 3. Run its tests. Return OK or FAIL." \
    --allowedTools "Read,Edit,Bash(pytest *),Bash(git commit *)" \
    --permission-mode dontAsk --max-budget-usd 2 \
    --output-format json | jq -r '.result, .total_cost_usd'
done
```

Add `--json-schema '{...}'` when downstream code needs `structured_output`. In GitHub Actions, use `anthropics/claude-code-action` (set up with `/install-github-app`; it needs `id-token: write`) ([Headless](https://code.claude.com/docs/en/headless.md); [GitHub Actions](https://code.claude.com/docs/en/github-actions.md)). For in-session fan-out, `/batch <change>` gives each subagent its own worktree. For repeatable large jobs, have Claude write a dynamic workflow and save it as a command.

### Step 7: Tier models and effort deliberately

Pin roles rather than raising the global setting. Give exploration subagents `model: haiku`. Use Sonnet 5.5 for workflow workers via `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL`, Opus 5.5 at `medium` for the main loop, and `effort: high` or `xhigh` only on planning and review skills or subagents. Reserve Fable 5.1 or `/effort ultracode` for long-horizon tasks whose value justifies multiples of the cost. Add a status line script (`statusLine.command`) that shows context percentage and cost, so you `/clear` at 40–60% instead of drifting into compaction. Check `/usage` weekly to find which skills, subagents and MCP servers consume your limits ([Status line](https://code.claude.com/docs/en/statusline.md); [What's new](https://code.claude.com/docs/en/whats-new/index.md)).

### Step 8: The daily loop

Start non-trivial work in plan mode, or in Antigravity Planning mode. Review and annotate the plan, since that is where your attention is worth the most. Implement in a fresh session or worktree against a gate (Stop hook or `/goal`). Run the reviewer subagent or a cross-harness review. Commit in small revertible steps. Then file one harness improvement for each repeated mistake: a hook, a test, a skill or one AGENTS.md line. After two failed corrections, rewrite the prompt instead of arguing with the agent.

## Conclusion

The striking shift of 2026 is that expertise has moved from prompting into systems design. The tools reward people who think like build engineers: they define pass/fail contracts, separate the grader from the worker, push state into git and structured files, and put trust boundaries in user or managed configuration rather than in the repo. A corollary that few users have absorbed is that **harness scaffolding depreciates**. Anthropic's own experience is that each model generation makes some planners, sprint structures and context resets unnecessary. The right habit is to audit the setup after every model release, starting with `/doctor prompt-audit`, removing components one at a time and re-measuring. Adding complexity without that audit is the wrong habit.

The comparison also yields a less obvious conclusion. The harnesses' differences now lie less in capability than in **where they put the human checkpoint**. Antigravity puts it on artifacts across many agents, and Claude Code puts it on gates and transcripts. The most robust expert setups use both kinds of checkpoint. The binding uncertainty is on Google's side. Antigravity's model lineup, quotas, naming conventions and security posture were all in flux in October 2026, and nearly everything known about it here comes from secondary snippets. A pragmatic expert should therefore make Claude Code (or any harness with deterministic hooks and an OS sandbox) the place where unattended work runs. Antigravity is best used where its browser-verified, artifact-driven review adds signal, and kept away from secrets.

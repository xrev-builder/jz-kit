# Claude Code Features and Expert Usage Patterns (state as of October 2026)

Research date: 2026-10-17. Primary sources: the official docs at code.claude.com/docs (fetched as raw `.md` on 2026-10-17), the Claude Code CHANGELOG on GitHub (latest entry v2.1.302), the weekly "What's new" digest in the docs (Weeks 13–37 of 2026), and the Anthropic engineering blog.

How versions map to dates: the CHANGELOG has no dates. The weekly digest tags each week with a version range, which gives these anchors: Week 13 (Mar 23–27, 2026) = v2.1.83–85; Week 16 (Apr 13–17) = v2.1.105–113; Week 22 (May 25–29) = v2.1.150–157; Week 27 (Jun 29–Jul 3) = v2.1.195–201; Week 30 (Jul 20–24) = v2.1.214–219; Week 32 (Aug 3–7) = v2.1.220–224; Week 37 (Sep 7–11) = v2.1.263–269. Versions v2.1.270–v2.1.302 therefore date from roughly mid-September to mid-October 2026. That last range is my inference, because the digest index stops at Week 37. — [What's new index](https://code.claude.com/docs/en/whats-new/index.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

Key changelog URL used below: CHANGELOG = https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md

---

## Q1. Core extensibility primitives and recommended expert practices

### Takeaway
Claude Code has a layered extension model. CLAUDE.md, rules and output styles are always-on context. Skills are loaded on demand, and slash commands have been merged into skills. Subagents and dynamic workflows provide isolated contexts. Hooks give deterministic automation. MCP connects external tools. Plugins and marketplaces package all of it, and the new "Mods" extend the UI and behavior. Experts keep always-on context small (CLAUDE.md under about 200 lines). They push procedures into skills, enforce must-happen behavior with hooks rather than prose, and route context-heavy side work into subagents. As of v2.1.283–284, auto mode (a classifier-gated permission mode) is the default starting permission mode for interactive sessions.

### Cited Findings

**Overall model / when to use what**
- The official feature map has these parts. CLAUDE.md is persistent context loaded every session. Output styles set role, tone and format. Skills are reusable knowledge and invocable workflows. Code intelligence is LSP. MCP connects external services. Subagents are isolated loops that return summaries. Dynamic workflows are many subagents run from a script Claude writes. Cross-session messaging connects sessions. Hooks are a script, HTTP request, MCP tool call, prompt or subagent fired on lifecycle events. Plugins and marketplaces handle packaging and distribution, and artifacts publish session output as web pages. — [Extend Claude Code](https://code.claude.com/docs/en/features-overview.md)
- The official "build your setup over time" triggers are:
  - Claude gets a convention wrong twice → add it to CLAUDE.md.
  - You keep typing the same prompt → make a user-invocable skill.
  - You paste the same playbook a third time → make a skill.
  - You copy data from a browser tab → add an MCP server.
  - Claude reads many files to find symbols → install a code-intelligence plugin.
  - A side task floods context → use a subagent.
  - You want something to happen every time → write a hook.
  - A second repo needs the same setup → make a plugin.

  — [Extend Claude Code](https://code.claude.com/docs/en/features-overview.md)
- The official rule of thumb is to keep CLAUDE.md under 200 lines and move reference content into skills or `.claude/rules/` files. Skills and subagents combine: a subagent can preload skills (`skills:` field), and a skill can run isolated with `context: fork`. — [Extend Claude Code](https://code.claude.com/docs/en/features-overview.md)
- The official blog post "Steering Claude Code: when to use CLAUDE.md, skills, hooks, and subagents" is linked from the docs. I did not fetch it. — [Extend Claude Code](https://code.claude.com/docs/en/features-overview.md)

**CLAUDE.md / memory / rules**
- CLAUDE.md and AGENTS.md files give persistent instructions. **Auto memory** is notes Claude writes itself from your corrections; it loads every session (first 200 lines or 25KB). Subagents can keep their own auto memory. — [Memory docs](https://code.claude.com/docs/en/memory.md)
- Memory scopes:
  - Managed policy file: `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS), `/etc/claude-code/CLAUDE.md` (Linux/WSL), `C:\Program Files\ClaudeCode\CLAUDE.md` (Windows).
  - User file: `~/.claude/CLAUDE.md`, with `~/.claude/rules/`.
  - Project file: `./CLAUDE.md` or `.claude/CLAUDE.md`, with `.claude/rules/*.md`.
  - Local file: `CLAUDE.local.md`, which should be gitignored.

  Files in parent directories load at launch. Files in subdirectories load lazily, when Claude touches a file in that subdirectory. — [Memory docs](https://code.claude.com/docs/en/memory.md)
- Imports use `@path/to/file`. Relative paths resolve from the importing file, and recursion goes at most 4 hops. Imports inside code spans or fences are ignored. Imports from outside the project trigger a one-time approval dialog. For personal instructions shared across worktrees, import a file from the home directory, because a gitignored CLAUDE.local.md exists only in one worktree. — [Memory docs](https://code.claude.com/docs/en/memory.md)
- Path-scoped rules in `.claude/rules/` load every session or only when matching files are opened (`paths:` frontmatter). Use them for language- or directory-specific guidance. — [Extend Claude Code](https://code.claude.com/docs/en/features-overview.md); [Memory docs](https://code.claude.com/docs/en/memory.md)
- Best-practice guidance:
  - Run `/init` to start a CLAUDE.md.
  - For each line ask "Would removing this cause Claude to make mistakes?" and cut it if not.
  - Include Bash commands Claude can't guess, non-default style rules, test runners, repo etiquette, env quirks and gotchas.
  - Exclude anything inferable from code, standard conventions, long tutorials and file-by-file descriptions.
  - Use "IMPORTANT" emphasis sparingly.
  - Check the file into git.
  - You can steer compaction from CLAUDE.md, e.g. "When compacting, always preserve the full list of modified files and any test commands".

  — [Best practices](https://code.claude.com/docs/en/best-practices.md)
- `/doctor prompt-audit` (v2.1.283) audits CLAUDE.md files, skills, agents and commands for "prompting patterns written for older models". It covers CLAUDE.md, CLAUDE.local.md, AGENTS.md and everything under `.claude/` and `~/.claude/`. — [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md); [Memory docs](https://code.claude.com/docs/en/memory.md)
- The `InstructionsLoaded` hook fires when a CLAUDE.md or rules file loads, including lazy loads. — [Hooks reference](https://code.claude.com/docs/en/hooks.md)

**Skills (and slash commands, now merged)**
- "Custom commands have been merged into skills." Both `.claude/commands/deploy.md` and `.claude/skills/deploy/SKILL.md` create `/deploy`. Command files still work, but skills add a directory for supporting files, frontmatter, and auto-invocation. If both exist, the skill wins. — [Skills docs](https://code.claude.com/docs/en/skills.md)
- Skills follow the cross-tool **Agent Skills open standard** (agentskills.io). Claude Code extends it with invocation control, subagent execution and other features. — [Skills docs](https://code.claude.com/docs/en/skills.md)
- SKILL.md frontmatter fields:
  - `name` and `description`. The combined `description` and `when_to_use` text is truncated at 1,536 chars, so put the key use case first.
  - `argument-hint` and `arguments` (named `$name` substitution).
  - `disable-model-invocation: true` makes the skill manual-only; use it for side-effecting workflows.
  - `user-invocable: false` makes it Claude-only background knowledge.
  - `allowed-tools`: per-turn pre-approval. `disallowed-tools`: e.g. remove `AskUserQuestion` for background loops.
  - `model` and `effort` (`low`/`medium`/`high`/`xhigh`/`max`).
  - `context: fork` runs the skill in a subagent, together with `agent` and `background`.
  - `hooks`: skill-scoped hooks.
  - `paths`: glob-gated auto-activation.
  - `shell`: `bash` or `powershell`.
  - `metadata`, `license`, `compatibility`: Agent Skills spec fields.

  — [Skills docs](https://code.claude.com/docs/en/skills.md)
- Dynamic context injection: a line like `` !`git diff HEAD` `` in a skill runs the command before Claude sees the skill and inlines its output. — [Skills docs](https://code.claude.com/docs/en/skills.md)
- Bundled skills and commands include `/doctor` (setup checkup, alias `/checkup`), `/verify` (run and verify the app), a pre-commit checks skill, `/code-review`, `/simplify`, `/loop`, `/batch`, `/deep-research`, and `/claude-api`. `/claude-api` has subcommands `migrate`, `upgrade`, `prompt-audit`, `cost-optimize`, `build-eval`, `hillclimb` and `managed-agents-onboard`. — [Skills docs](https://code.claude.com/docs/en/skills.md); [Best practices](https://code.claude.com/docs/en/best-practices.md); [Workflows docs](https://code.claude.com/docs/en/workflows.md)
- `/skill-doctor` (Week 36, v2.1.251–261) shows each skill's context cost and usage frequency. `/usage` breaks down limit consumption by skill, subagent, plugin and MCP server (Week 21). — [What's new index](https://code.claude.com/docs/en/whats-new/index.md)
- Example manual workflow skill from the official docs:
  ```markdown
  ---
  name: fix-issue
  description: Fix a GitHub issue
  disable-model-invocation: true
  ---
  Analyze and fix the GitHub issue: $ARGUMENTS.
  1. Use `gh issue view` ... 5. Write and run tests ... 8. Push and create a PR
  ```
  — [Best practices](https://code.claude.com/docs/en/best-practices.md)
- Engineering background: "Equipping agents for the real world with Agent Skills" (Oct 16, 2025). — [Anthropic Engineering index](https://www.anthropic.com/engineering)

**Hooks**
- Hook types are `"command"`, `"http"`, `"mcp_tool"`, `"prompt"` and `"agent"`. — [Hooks reference](https://code.claude.com/docs/en/hooks.md)
- Hook events as of Oct 2026:
  - Session lifecycle: SessionStart, Setup (`--init-only`, `--init`/`--maintenance` in `-p`), SessionEnd.
  - Prompts: UserPromptSubmit, UserPromptExpansion.
  - Tools: PreToolUse (can block), PermissionRequest, PermissionDenied (auto-mode denials; may return `retry: true`), PostToolUse, PostToolUseFailure, PostToolBatch.
  - Display and notification: Notification, MessageDisplay.
  - Subagents and tasks: SubagentStart, SubagentStop, TaskCreated, TaskCompleted, TeammateIdle.
  - Turn end: Stop, StopFailure.
  - Configuration and filesystem: InstructionsLoaded, ConfigChange, CwdChanged, DirectoryAdded, FileChanged, WorktreeCreate, WorktreeRemove.
  - Compaction: PreCompact, PostCompact.
  - Model switches: PreModelSwitch (can block), PostModelSwitch.
  - MCP elicitation: Elicitation, ElicitationResult.

  SessionStart matchers include `startup`, `resume`, `clear`, `compact` and `fork`. — [Hooks reference](https://code.claude.com/docs/en/hooks.md)
- Recent hook additions:
  - Conditional `if` hooks (Week 13).
  - Hooks see `effort.level` and `$CLAUDE_EFFORT` (Week 19).
  - `onFailure: "block"` for command and HTTP hooks (v2.1.295): a hook that fails to start, times out, or exits unexpectedly blocks the action, i.e. fail-closed.

  — [What's new index](https://code.claude.com/docs/en/whats-new/index.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- Expert framing: hooks are deterministic, whereas CLAUDE.md is advisory. "Use hooks for actions that must happen every time with zero exceptions." Claude can write hooks for you, e.g. "Write a hook that runs eslint after every file edit". `/hooks` browses the configured hooks. — [Best practices](https://code.claude.com/docs/en/best-practices.md)
- A **Stop hook** can serve as a deterministic verification gate: it blocks the turn from ending until a check passes, with a cap on consecutive blocks. — [Best practices](https://code.claude.com/docs/en/best-practices.md)

**Subagents**
- Subagents are defined in `.claude/agents/*.md` (project) or at user scope. Frontmatter fields:
  - `name` (required) and `description` (required).
  - `tools` and `disallowedTools`.
  - `model`: `sonnet`, `opus`, `haiku`, `fable`, a full ID such as `claude-opus-5-5`, or `inherit`.
  - `permissionMode`: `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan` or `manual`.
  - `maxTurns`; `autoCompactWindow` (v2.1.296).
  - `skills` (preloads full skill content) and `mcpServers` (named or inline).
  - `hooks`.
  - `memory`: `user` → `~/.claude/agent-memory/`, `project` → `.claude/agent-memory/`, `local` → `.claude/agent-memory-local/`.
  - `background`, `omitClaudeMd`, `effort`.
  - `isolation: worktree`.
  - `color`, `initialPrompt`, and `experimental.cacheTtl` (`5m`/`1h`).

  — [Subagents docs](https://code.claude.com/docs/en/sub-agents.md)
- Built-in subagents include general-purpose, Explore and Plan. They inherit the parent's permission rules and mostly run with restricted tool sets. — [Subagents docs](https://code.claude.com/docs/en/sub-agents.md); matcher list in [Hooks reference](https://code.claude.com/docs/en/hooks.md)
- 2026 timeline:
  - Subagents can spawn sub-subagents; background chains are capped at 5 levels (Week 24).
  - Subagents run in the background by default (Week 27).
  - Background subagents surface permission prompts in the main session instead of auto-denying (Week 26).
  - **Fork mode** is on by default in interactive sessions (Week 33), so a subagent can inherit the full conversation.
  - The Agent tool takes an `effort` parameter (v2.1.292).
  - The Task tool's `mode` parameter is deprecated; subagents inherit the parent permission mode.

  — [What's new index](https://code.claude.com/docs/en/whats-new/index.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- Expert patterns:
  - "Use subagents to investigate X" keeps exploration out of the main context.
  - A Writer/Reviewer split across sessions.
  - An adversarial review subagent that sees only the diff and the criteria, told to "Report gaps, not style preferences" to avoid over-engineering.

  — [Best practices](https://code.claude.com/docs/en/best-practices.md)

**Plugins, marketplaces, and Mods**
- A plugin is a directory with `.claude-plugin/plugin.json`. It bundles skills, hooks, subagents, MCP servers and output styles, and plugin skills are namespaced (`/my-plugin:review`). A marketplace is a repo or directory with `.claude-plugin/marketplace.json`; it is "a catalog, not a hosted store". Official marketplaces are `claude-plugins-official` and the demo `claude-code-plugins`. — [Plugins overview](https://code.claude.com/docs/en/plugins/overview.md); [Extend Claude Code](https://code.claude.com/docs/en/features-overview.md)
- Plugin tooling in 2026:
  - Plugins load from `.zip` and URLs: `--plugin-dir x.zip`, `--plugin-url` (Week 19).
  - `/plugin list` (Week 23).
  - `claude plugin eval` and `claude plugin eval init` (Week 37) score a plugin on test cases against a no-plugin baseline.
  - `claude plugin install --marketplace <source>` (v2.1.292).
  - `claude plugin configure` (v2.1.285).
  - `claude plugin validate` checks MCP config (v2.1.281).
  - Code-intelligence (LSP) plugins give symbol navigation and post-edit diagnostics.

  — [What's new index](https://code.claude.com/docs/en/whats-new/index.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md); [Best practices](https://code.claude.com/docs/en/best-practices.md)
- **Claude Mods** (v2.1.287): "plugins may now modify deeper behavior". A mod can draw UI (panes, prompt decorations, `virtualText`), hook events (`agent.spawn`, `tool.check`, `prompt.submit`, `skill.prompt`, `turn.step`), and register tools (`$.tool.register`, with an `isDeferred` option). There is a built-in "You should know" mod, a side agent that flags issues. — [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md); [Mods docs index](https://code.claude.com/docs/llms.txt)

**MCP servers**
- Add a server with `claude mcp add --transport http notion https://mcp.notion.com/mcp`. `claude mcp login` and `claude mcp logout` (Week 26) authenticate from the shell. `/mcp reconnect all` was added in v2.1.284. You can override MCP result size per tool up to 500K (Week 14). URL-mode elicitation is supported on the 2026-07-28 protocol (v2.1.281). — [Best practices](https://code.claude.com/docs/en/best-practices.md); [What's new index](https://code.claude.com/docs/en/whats-new/index.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- Official guidance is that CLI tools (`gh`, `aws`, `gcloud`, `sentry-cli`) are "the most context-efficient way to interact with external services". — [Best practices](https://code.claude.com/docs/en/best-practices.md)
- Tool search defers MCP tool schemas so many tools can scale. It has an Agent SDK page, "Scale to many tools with tool search". — [Docs index](https://code.claude.com/docs/llms.txt)

**Output styles**
- There are 4 built-in styles besides the default. The **Concise** style, added Week 34, leads with the result. Custom style frontmatter has `name`, `description`, `keep-coding-instructions` (keep the SWE system-prompt section) and `force-for-plugin`. An output style is instructions, not enforcement. — [Output styles](https://code.claude.com/docs/en/output-styles.md); [What's new index](https://code.claude.com/docs/en/whats-new/index.md)
- History, flagged as an older state: output styles were deprecated, then un-deprecated after community feedback. The `/output-style` command is deprecated in favor of `/config`, and the style is fixed at session start for prompt caching. — [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

**Status line**
- The status line runs any shell script, which receives session JSON on stdin (context usage, cost, git and so on). Config:
  ```json
  { "statusLine": { "type": "command", "command": "~/.claude/statusline.sh", "padding": 2 } }
  ```
  A separate `subagentStatusLine` payload exists and gained `agentType` in v2.1.293. `rate_limits.spend_limit` shows gateway spend. — [Status line docs](https://code.claude.com/docs/en/statusline.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

**Permission modes, settings, and auto mode**
- Modes:
  - `default`, labeled "Manual"; `manual` is an alias.
  - `acceptEdits`: edits plus common filesystem commands inside the working dirs.
  - `plan`: read-only exploration. If auto mode is available, classifier-approved commands also run.
  - `auto`: a background classifier reviews actions.
  - `dontAsk`: auto-deny anything not pre-approved.
  - `bypassPermissions`: skips prompts, except actions no mode auto-approves.

  — [Permissions](https://code.claude.com/docs/en/permissions.md)
- Rule evaluation order is **deny → ask → allow**, and the first match wins regardless of specificity. A deny rule `Bash(aws *)` beats an allow rule `Bash(aws s3 ls)`. Parameter matching arrived in Week 25: `Agent(model:opus)`, `Agent(isolation:worktree)`, `Bash(run_in_background:true)`. Primary content fields such as Bash `command` can't be parameter-matched, to prevent compound-command bypass. — [Permissions](https://code.claude.com/docs/en/permissions.md); [What's new index](https://code.claude.com/docs/en/whats-new/index.md)
- Auto mode timeline:
  - Research preview in Week 13 (Mar 23–27, 2026).
  - Pro plan plus Sonnet 4.6 support in Week 21.
  - Bedrock, Vertex and Foundry in Week 23.
  - Default for new sessions on Pro, Max and Team from Aug 14, 2026 (Week 32).
  - v2.1.284: "interactive terminal and VS Code sessions start in auto mode when no permission mode is configured, on every plan and provider". `permissions.defaultMode` overrides it.
  - A server-side classifier is the default for API, Enterprise and cloud providers (v2.1.278); it carries no classifier charge.
  - `CLAUDE_CODE_AUTO_MODE_MODEL` (v2.1.302) chooses the client-side classifier model.

  — [What's new index](https://code.claude.com/docs/en/whats-new/index.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md); [Best practices](https://code.claude.com/docs/en/best-practices.md)
- Auto mode design, from the Mar 25, 2026 engineering post:
  - Users approve 93% of permission prompts, which shows approval fatigue.
  - The pipeline has a server-side prompt-injection probe on tool outputs, plus a transcript classifier on Sonnet 4.6 that runs before each action.
  - Two stages: stage 1 is a fast filter biased toward blocking; stage 2 is chain-of-thought, run only when stage 1 flags.
  - The classifier is "reasoning-blind" by design: it sees user messages and tool-call payloads, but not assistant prose or tool outputs.
  - Error rates for the full pipeline: 0.4% FPR on real traffic, 17% FNR on real overeager actions, 5.7% FNR on synthetic exfiltration. Stage 1 alone: 8.5% FPR, 6.6% FNR, 1.8% FNR.
  - There are 20+ default block rules: destroy or exfiltrate data, degrade security, cross trust boundaries, bypass review.

  — [How we built Claude Code auto mode](https://www.anthropic.com/engineering/claude-code-auto-mode)
- Fallback behavior: after 3 consecutive or 20 total blocks, auto mode pauses and prompting resumes. Denied actions appear in `/permissions` → Recently denied, where you can retry with `r`. In `-p` mode, current docs say repeated blocks don't stop the run (see "when auto mode falls back"). The Mar 2026 blog said headless "terminates", so behavior has changed since. — [Permission modes](https://code.claude.com/docs/en/permission-modes.md); [Best practices](https://code.claude.com/docs/en/best-practices.md); contrast with [auto mode blog](https://www.anthropic.com/engineering/claude-code-auto-mode)
- Auto mode configuration:
  - `autoMode.environment` is a list of prose descriptions of trusted infrastructure. By default only the working dir and the repo's remotes are trusted. Example:
    ```json
    { "autoMode": { "environment": [
      "$defaults",
      "Source control: github.example.com/acme-corp and all repos under it",
      "Trusted cloud buckets: s3://acme-build-artifacts, gs://acme-ml-datasets",
      "Trusted internal domains: *.corp.example.com, api.internal.example.com" ] } }
    ```
  - `autoMode.allow`, `soft_deny` and `hard_deny` lists also exist. Hard deny rules were added Week 19.
  - Auto mode **does not read `autoMode` from project `.claude/settings.json`**, which prevents repo-injected allow rules.
  - Supporting commands: `/auto-mode-setup` drafts the config, `claude auto-mode config` shows the effective rules, and `claude auto-mode defaults` shows the baseline.

  — [Configure auto mode](https://code.claude.com/docs/en/auto-mode-config.md); [auto mode blog](https://www.anthropic.com/engineering/claude-code-auto-mode)
- Auto mode safety additions: it blocks destructive git commands when you didn't ask to discard work (Week 25), blocks transcript tampering, and asks before `rm -rf` on unresolved variables (Week 28). `acceptEdits` prompts before writing files that can run code (Week 23). — [What's new index](https://code.claude.com/docs/en/whats-new/index.md)

**Plan mode**
- Enter plan mode with Shift+Tab until "⏸ plan mode on", or `claude --permission-mode plan`. Ctrl+G opens the plan in your editor. The recommended flow is Explore → Plan → Implement → Commit. Skip planning "if you could describe the diff in one sentence". — [Best practices](https://code.claude.com/docs/en/best-practices.md)
- "Ultraplan" was a cloud plan-drafting feature: early preview in Week 15 (v2.1.92–101), then **removed in v2.1.222** (early Aug 2026). This is DEPRECATED. — [What's new index](https://code.claude.com/docs/en/whats-new/index.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

**Effort / models (context for configuration)**
- Effort levels are low, medium, high, xhigh and max. Opus 5.5, Sonnet 5.5 and Haiku 5.5 default to `medium`, Opus 4.7 to `xhigh`, and others to `high`. `max` "may show diminishing returns and is prone to overthinking". **Ultracode** is a Claude Code setting, not an effort level: Claude plans a dynamic workflow for each substantive task. Turn it on with `/effort ultracode`, or with `--effort ultracode`, which also sets the level to xhigh. — [Model configuration](https://code.claude.com/docs/en/model-config.md)
- Model releases in the changelog:
  - Opus 5 (`claude-opus-5`, v2.1.219, Week 30): 1M context.
  - Fable 5.1 (`claude-fable-5-1`, v2.1.257): $10/$50 per MTok.
  - Opus 5.5 (`claude-opus-5-5`, v2.1.280): new default Opus, 1M context, $4/$20 per MTok.
  - Sonnet 5.5 (v2.1.284): $2/$10.
  - Haiku 5.5 (v2.1.293): $0.10/$0.50.

  Earlier in 2026: Opus 4.7 (Week 16), Opus 4.8 (Week 22), Sonnet 5 (Week 27). — [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md); [What's new index](https://code.claude.com/docs/en/whats-new/index.md)
- Related settings: `fallbackModel` takes up to 3 fallbacks (Week 24), plus `maxEffortLevel` (Week 37), `modelPicker` (Week 35) and `ANTHROPIC_DEFAULT_MODEL` (Week 34). — [What's new index](https://code.claude.com/docs/en/whats-new/index.md)

### Inferences
- The center of gravity has moved from "write a good CLAUDE.md and approve prompts" to "minimal always-on context, on-demand skills, classifier-gated autonomy, and deterministic gates (Stop hooks, `/goal`) for verification".
- Slash commands should now be authored as skills. Placing `autoMode` in project settings is ignored by design, so org trust boundaries belong in user or managed settings.
- Docs for Mods and the advisor tool exist, but these are newest and least battle-tested. Treat them as early-adopter features.

### Gaps
- I did not fetch the claude.com blog post "Steering Claude Code..." or the Plugins "create" and "marketplace" reference pages in full. Plugin manifest fields beyond name, version and description are not catalogued here.
- No primary source found on how many skills or what description budget fits before skill descriptions get truncated in context, beyond the 1,536-character per-skill limit.

---

## Q2. What's new in 2026 (background agents, cloud/web, workflows, worktrees, /loop, scheduling, SDK, surfaces, remote control, fast mode)

### Takeaway
2026 turned Claude Code from one terminal agent into a multi-surface, multi-agent platform. Agents now run in the background and are managed from agent view (`claude agents`). Dynamic workflows (JS scripts orchestrating dozens to hundreds of subagents) arrived in Week 22, and agent teams remain experimental. Sessions can message each other, run in worktrees, and run in the cloud via Anthropic-managed or self-hosted environments. Routines, `/loop`, Desktop tasks and `/goal` cover scheduled and autonomous work. Remote Control and mobile let you drive local sessions from a phone, and channels push external events in. Fast mode now runs on Opus 4.8, 5 and 5.5.

### Cited Findings

**Background / parallel agents**
- **Agent view** (Week 20, v2.1.139–142; research preview): `claude agents` is one screen for all background sessions, showing running, blocked and done. Each row is a full Claude Code session. Agent view runs on your machine. — [Agent view](https://code.claude.com/docs/en/agent-view.md); [What's new](https://code.claude.com/docs/en/whats-new/index.md)
- Related session features:
  - Background sessions appear in `/resume` and stay alive when pinned (Week 21).
  - `/fork` copies the conversation into a new background session (Week 29).
  - `claude attach <name>` and `claude logs <name>` (v2.1.290).
  - `@`-mention another session by name (Week 33).

  — [What's new](https://code.claude.com/docs/en/whats-new/index.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- **Dynamic workflows** (Week 22, v2.1.150–157): "A dynamic workflow is a JavaScript script that orchestrates many subagents at once. Claude writes the script... a runtime executes it in the background". They scale to "dozens to hundreds of agents per run", can resume in the same session, and can be saved for reuse as commands. The bundled `/deep-research` workflow fans out searches, cross-checks and votes on claims. `/workflows` shows progress. On Pro, enable them in `/config`. — [Workflows](https://code.claude.com/docs/en/workflows.md)
- Official comparison of who holds the plan:
  - Subagents and skills: Claude, turn by turn.
  - Agent teams: a lead agent with a shared task list.
  - Workflows: the script, with results kept in script variables.

  — [Workflows](https://code.claude.com/docs/en/workflows.md)
- `/batch <change>` splits a change across 5–30 subagents, each in its own worktree. — [Best practices](https://code.claude.com/docs/en/best-practices.md)
- `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL` (v2.1.296) pins the model for workflow agents. — [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- **Agent teams** are still "experimental and disabled by default". Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. A lead coordinates teammates, each with its own context, and they message each other directly. The `TeamCreate` and `TeamDelete` tools were removed; there is one implicit team, and teammates are spawned via the Agent tool's `name` parameter. — [Agent teams](https://code.claude.com/docs/en/agent-teams.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- **Cross-session messaging** (Week 32): requires v2.1.224+ on macOS and Linux, or v2.1.234+ on native Windows, and is on by default. A message is text only, never history or files. — [Cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging.md)
- **Worktrees**: `claude --worktree <name>` (or `-w`) creates `.claude/worktrees/<name>/` on branch `worktree-<name>`. `worktree.baseRef` chooses the remote default or local HEAD (Week 19). WorktreeCreate and WorktreeRemove hooks support non-git VCS. Subagents can set `isolation: worktree`. GitLab MR URLs work with `--worktree` (Week 33). — [Worktrees](https://code.claude.com/docs/en/worktrees.md); [What's new](https://code.claude.com/docs/en/whats-new/index.md)
- **Projects** (public beta, Pro and Max only): one ongoing conversation where Claude spawns and coordinates threads, usually cloud sessions, for a stream of work. — [Projects](https://code.claude.com/docs/en/claude-projects.md)

**Cloud / web / desktop / mobile**
- Cloud sessions run on Anthropic-managed infrastructure or an org's **self-hosted environment** (public beta for Team and Enterprise, Week 32). They keep running after your laptop closes and start from claude.ai/code, the mobile Code tab and other surfaces. Available on Pro, Max and Team, and on Enterprise premium seats. — [Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web.md); [What's new](https://code.claude.com/docs/en/whats-new/index.md)
- The web was redesigned in Week 17, and PR auto-fix landed on the web in Week 13. `/autofix-pr` arrived in Week 15. — [What's new](https://code.claude.com/docs/en/whats-new/index.md)
- Desktop app timeline:
  - Computer use (Week 13); background computer use on macOS (Week 36).
  - In-app browser (Week 28).
  - iOS Simulator pane (Week 30).
  - Linux beta (Week 27).
  - `/resume` of CLI sessions (Week 35).
  - Pop-out panes (Week 37).
  - Auto-continue after usage limit (Week 33).
  - `claude --desktop` opens the app (v2.1.285).

  — [What's new](https://code.claude.com/docs/en/whats-new/index.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- Computer use in the CLI was a research preview in Week 14. Claude in Chrome went GA on all direct plans in Week 27. — [What's new](https://code.claude.com/docs/en/whats-new/index.md)
- **Remote Control** connects claude.ai/code or the iOS and Android app to a session running locally. Code stays local, and the session is synced across devices, including subagent and workflow progress. Since Week 34, any machine running `claude remote-control` shows as a device card on the phone. Mobile push notifications arrived in Week 16. — [Remote Control](https://code.claude.com/docs/en/remote-control.md); [What's new](https://code.claude.com/docs/en/whats-new/index.md)
- **Channels** (research preview): an MCP server that pushes events into a running session, optionally two-way. Telegram, Discord and iMessage are included, and they are installed as plugins. Not available on Bedrock, Vertex or Foundry. — [Channels](https://code.claude.com/docs/en/channels.md)
- **Artifacts** (Week 25 beta, Team and Enterprise) publish session output as live pages on claude.ai. Since Week 29 they can call viewers' MCP connectors. — [What's new](https://code.claude.com/docs/en/whats-new/index.md)
- Other surfaces listed in the docs: VS Code (Focus view, Week 32), JetBrains, Slack, "Claude Tag", GitLab CI/CD and GitHub Enterprise Server. — [Docs index](https://code.claude.com/docs/llms.txt); [What's new](https://code.claude.com/docs/en/whats-new/index.md)

**Scheduling and autonomy**
- Three scheduling options:

  | | Cloud routines | Desktop tasks | `/loop` |
  |---|---|---|---|
  | Runs on | Cloud | Your machine | Your machine |
  | Machine must be on | No | Yes | Yes |
  | Session must be open | No | No | Yes |
  | Minimum interval | 1 hour | 1 minute | 1 minute |

  `/loop` tasks are session-scoped, restored on `--resume`, and expire after 7 days. — [Scheduled tasks](https://code.claude.com/docs/en/scheduled-tasks.md)
- `/loop` usage:
  - `/loop 5m check the deploy` runs on a fixed interval.
  - `/loop 20m /review-pr 1234` re-runs a skill each time.
  - A bare `/loop` self-paces (added Week 15).
  - `loop.md` customizes the default prompt.
  - Esc cancels a pending self-paced wakeup.

  — [Scheduled tasks](https://code.claude.com/docs/en/scheduled-tasks.md); [What's new](https://code.claude.com/docs/en/whats-new/index.md)
- **Routines** (research preview, Week 16) are a saved prompt, repos and connectors, run in the cloud. Triggers can be scheduled, API (HTTP POST with a bearer token) or GitHub events. Create them at claude.ai/code/routines or with `/schedule`, e.g. `/schedule daily PR review at 9am`. Routines are per-account and count against usage. — [Routines](https://code.claude.com/docs/en/routines.md)
- **`/goal`** (Week 20): sets a completion condition, e.g. `/goal all tests in test/auth pass and the lint step is clean`. After each turn, an evaluator model checks the condition and Claude continues until it holds. — [Goal](https://code.claude.com/docs/en/goal.md)
- The **Monitor** tool (Week 15) streams background events and logs into the conversation. — [What's new](https://code.claude.com/docs/en/whats-new/index.md)

**Fast mode, advisor, review tools**
- **Fast mode** (research preview): up to 2.5× faster Opus at a higher per-token price. It is the same model with a different API configuration. Supported on Opus 5.5, Opus 5 and Opus 4.8; fast mode for Opus 4.7 was deprecated Jun 25 and removed Jul 24, 2026. Toggle with `/fast`, which is saved to the `fastMode` setting. Opus 4.8 and Opus 5 fast mode cost $10/$50 per MTok. — [Fast mode](https://code.claude.com/docs/en/fast-mode.md); [What's new](https://code.claude.com/docs/en/whats-new/index.md)
- **Advisor tool** (experimental, Anthropic API only): Claude consults a second, stronger model server-side at key moments, with the full transcript. Configure with `/advisor`, `advisorModel` or `--advisor`. — [Advisor](https://code.claude.com/docs/en/advisor.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- Review tools:
  - `/ultrareview` (Week 17 research preview): a cloud fleet of bug-hunting agents. `claude ultrareview` for CI followed in Week 18.
  - `/code-review` (Week 21) reports correctness bugs and runs as a background subagent (Week 30). `--max-findings` was added in v2.1.288.
  - Security-guidance plugin (Week 22) and Claude Security plugin (Week 30).

  — [What's new](https://code.claude.com/docs/en/whats-new/index.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

**Other notable 2026 changes**
- Native binaries (Week 16).
- Windows without Git Bash, using PowerShell (Week 18).
- `/cd` (Week 24).
- `--safe-mode` (Week 24).
- `--restricted` for eval harnesses (Week 35).
- `/config key=value`, including in `-p` (Week 25).
- `/rewind` with "Summarize up to here" (Week 20).
- `/btw` side questions that never enter context.
- Idle compaction (v2.1.299): a 200K+ token conversation idle for about 54 minutes is compacted before its 1h cache expires.
- `/design` research preview (Week 34). Standalone Claude Design closes Dec 14, 2026 (v2.1.302).

— [What's new](https://code.claude.com/docs/en/whats-new/index.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md); [Best practices](https://code.claude.com/docs/en/best-practices.md)

### Inferences
- The parallelism ladder for experts runs: subagents (in-session) → `/batch` and worktrees → agent view background sessions → dynamic workflows (scripted, adversarially cross-checked) → cloud routines and Projects. Cross-session messaging is the glue between them.
- Workflows are now the recommended answer to "multi-agent orchestration". Agent teams remain experimental and are positioned as heavier.

### Gaps
- The digest index stops at Week 37 (Sep 11), and Weeks 31 and 38+ aren't listed. Features in v2.1.270–302 (Opus 5.5, Sonnet 5.5, Haiku 5.5, Mods, idle compaction) come only from the CHANGELOG and lack exact dates.
- I did not find a primary source quantifying adoption or performance of workflows versus subagents.

---

## Q3. Official Anthropic guidance (best practices, engineering blog)

### Takeaway
Anthropic's guidance consistently says context is the scarce resource and that the model needs a way to verify its work. The recommended habits are explore→plan→code, specific prompts, aggressive `/clear` and subagent use, and independent review. For long-running agents, the engineering posts recommend structured external state (feature-list JSON, progress files, git), one feature per session, and end-to-end testing. Harnesses should start simple, with components removed as models improve.

### Cited Findings
- The core constraint: "Claude's context window fills up fast, and performance degrades as it fills… The context window is the most important resource to manage." — [Best practices](https://code.claude.com/docs/en/best-practices.md)
- The top practice is "Give Claude a way to verify its work". Gating escalates from a prompt, to a `/goal` condition, to a Stop hook (deterministic), to a verification subagent or workflow. "Have Claude show evidence rather than asserting success." — [Best practices](https://code.claude.com/docs/en/best-practices.md)
- Interview pattern: "Interview me in detail using the AskUserQuestion tool… write a complete spec to SPEC.md". Then start a fresh session to implement. — [Best practices](https://code.claude.com/docs/en/best-practices.md)
- Failure patterns listed: the kitchen-sink session, correcting over and over (after 2 failed corrections, `/clear`), an over-specified CLAUDE.md, the trust-then-verify gap, and infinite exploration. — [Best practices](https://code.claude.com/docs/en/best-practices.md)
- Checkpoints: every prompt creates one, and Esc Esc or `/rewind` restores code and/or conversation. They don't track Bash-side changes, so they are "not a replacement for git". — [Best practices](https://code.claude.com/docs/en/best-practices.md)
- Engineering blog posts relevant here:
  - "Claude Code: Best practices for agentic coding" (Apr 18, 2025). This is the OLDER version; the docs page supersedes it.
  - "Effective context engineering for AI agents" (Sep 29, 2025).
  - "Equipping agents… with Agent Skills" (Oct 16, 2025).
  - "Beyond permission prompts" (sandboxing, Oct 20, 2025).
  - "Code execution with MCP" (Nov 4, 2025).
  - "Effective harnesses for long-running agents" (Nov 26, 2025).
  - "Building a C compiler with a team of parallel Claudes" (Feb 5, 2026).
  - "Harness design for long-running application development" (Mar 24, 2026).
  - "How we built Claude Code auto mode" (Mar 25, 2026).
  - "Scaling Managed Agents" (Apr 8, 2026).
  - "An update on recent Claude Code quality reports" (Apr 23, 2026).
  - "How we contain Claude across products" (May 25, 2026).

  — [Anthropic Engineering index](https://www.anthropic.com/engineering)
- "Effective harnesses for long-running agents":
  - An initializer agent creates `init.sh`, `claude-progress.txt` and an initial git commit.
  - A **JSON feature list** has 200+ end-to-end features for a claude.ai clone, each with steps and a `passes:false` flag. JSON was chosen because the model is less likely to overwrite it than Markdown.
  - Coding agents may only flip `passes`.
  - Each session does one feature and ends with a commit and progress notes.
  - The startup routine is: `pwd`, git log, progress file, feature list, start the server via `init.sh`, then a smoke e2e test.
  - E2E testing goes through Puppeteer MCP.

  — [Effective harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- "Harness design for long-running application development" (Mar 24, 2026):
  - A GAN-inspired planner/generator/evaluator setup, with the evaluator driving the app via Playwright MCP.
  - "Sprint contracts" are negotiated before each sprint; one sprint had 27 criteria.
  - Context resets were essential for Sonnet 4.5's "context anxiety". Opus 4.5 largely removed it, so v2 used one continuous session with auto-compaction.
  - Cost: retro game maker solo was 20 min/$9 (core feature broken) versus full harness 6 hr/$200 (functional). A DAW on Opus 4.6 took 3 hr 50 min and cost $124.70.
  - With Opus 4.6, sprints were removed and the evaluator moved to one final pass; the planner was kept.
  - Lesson: "Every harness component encodes an assumption about what the model can't do alone"; re-examine the harness with each new model and remove components one at a time.

  — [Harness design](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- A team-lead perspective, from third-party summaries of Boris Cherny, creator of Claude Code:
  - Parallel sessions: about 5 terminal sessions plus 5–10 web sessions.
  - Verification loops are emphasized as improving quality "2–3×", with UI testing via the Chrome extension.
  - Pre-approve safe commands via `/permissions` (checked in, shared) rather than `--dangerously-skip-permissions`, except in sandboxes.
  - A "surprisingly vanilla" setup.

  These are SECONDARY sources; I could not reach the InfoQ write-up (Jan 2026) or the original X threads. — [Push to Prod summary](https://getpushtoprod.substack.com/p/how-the-creator-of-claude-code-actually); [InfoQ (unreachable)](https://infoq.com/news/2026/01/claude-code-creator-workflow/)

### Inferences
- There is a clear progression. In 2025 the advice was mostly about prompting and CLAUDE.md hygiene plus external state files. In 2026 it is about built-in verification gates (`/goal`, Stop hooks, `/code-review`, workflows with adversarial verifiers) and classifier-gated autonomy. The harness posts justify stripping scaffolding as models improve.
- The docs best-practices page, updated continuously and referencing v2.1.283, is the authoritative current guidance. The Apr 2025 blog post is a historical baseline.

### Gaps
- I did not fetch "Effective context engineering", "Code execution with MCP", "Building a C compiler", the April 2026 quality postmortem or "How we contain Claude" in full. Their specific techniques are not captured here.
- No primary-source talk from Cat Wu was found in this pass.
- The Boris Cherny claims are unverified against primary posts, and sources conflict on whether he still uses plan mode.

---

## Q4. Headless/CI usage, SDK, permission configuration, sandboxing

### Takeaway
Use `claude -p` with `--bare` (recommended for scripts, and slated to become the default), `--output-format json`/`stream-json`, `--json-schema`, `--allowedTools`, and `--permission-mode dontAsk` or `auto` for unattended runs. GitHub Actions runs via `anthropics/claude-code-action` (set up with `/install-github-app`). The Agent SDK (Python/TS) embeds the Claude Code loop, and Managed Agents is the hosted option. The OS-level Bash sandbox (Seatbelt on macOS, bubblewrap+socat on Linux/WSL2) restricts shell filesystem and network access. It does not cover the file tools, MCP or hooks.

### Cited Findings
- `--bare` skips auto-discovery of hooks, skills, commands, subagents, plugins, MCP, auto memory and CLAUDE.md. It is "the recommended mode for scripted and SDK calls, and will become the default for `-p` in a future release." Without `--bare`, `-p` runs the project's hooks and `.mcp.json` servers even in untrusted folders, with no trust dialog. This is a security consideration for CI. — [Headless](https://code.claude.com/docs/en/headless.md)
- Structured output uses `--output-format json --json-schema '{...}'`, and the result appears in `structured_output`. JSON output includes `total_cost_usd` and a per-model cost breakdown. `--max-budget-usd` caps spend. `--no-session-persistence` disables resumable sessions. — [Headless](https://code.claude.com/docs/en/headless.md); [Best practices](https://code.claude.com/docs/en/best-practices.md)
- Fan-out pattern from the docs:
  ```bash
  for file in $(cat files.txt); do
    claude -p "Migrate $file from Python 2 to Python 3. Return OK or FAIL." \
      --allowedTools "Edit,Bash(git commit *)" --permission-mode dontAsk
  done
  ```
  Refine the prompt on 2–3 files first. You can also run `claude --permission-mode auto -p "fix all lint errors"`. — [Best practices](https://code.claude.com/docs/en/best-practices.md)
- Default mode for `-p` and the SDK: `default` in sessions that fetch feature flags, otherwise `auto` on recent versions. — [Permission modes](https://code.claude.com/docs/en/permission-modes.md)
- The `Setup` hook event fires for `--init`, `--maintenance` and `--init-only` in CI. — [Hooks reference](https://code.claude.com/docs/en/hooks.md)
- Unattended retry: `CLAUDE_CODE_RETRY_WATCHDOG` with `..._MAX_WAIT_MS` (v2.1.295) and `..._MAX_USAGE_LIMIT_WAIT_MS` (v2.1.301). — [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- GitHub Actions:
  - `anthropics/claude-code-action`; mention `@claude` in PRs and issues.
  - Quick setup with `/install-github-app` (github.com only); the example workflow is `examples/claude.yml`.
  - The workflow needs `id-token: write` for the federation exchange.
  - There is an optional review workflow, `claude-code-review.yml`, and pages for cloud providers.
  - GitLab CI/CD is supported separately.

  — [GitHub Actions](https://code.claude.com/docs/en/github-actions.md)
- Managed Code Review product pages and `claude ultrareview` cover CI review. — [Docs index](https://code.claude.com/docs/llms.txt); [What's new](https://code.claude.com/docs/en/whats-new/index.md)
- Agent SDK: "the same tools, agent loop, and context management that power Claude Code, programmable in Python and TypeScript". It runs the Claude Code binary and has permissions, sessions, hooks, skills, plugins, subagents, structured outputs, session storage and OpenTelemetry. Other languages can use the CLI `-p` with JSON output. Managed Agents is the Anthropic-hosted harness. The legacy SDK entrypoint was removed; migrate to `@anthropic-ai/claude-agent-sdk`. The TypeScript "V2 session API" preview is marked removed. — [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview.md); [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md); [Docs index](https://code.claude.com/docs/llms.txt)
- Sandbox basics:
  - OS-enforced limits on Bash, PowerShell and Monitor commands and their children.
  - Off by default; turn on with `/sandbox` or `sandbox.enabled`.
  - Network goes through a local proxy with `network.allowedDomains`, which starts empty.
  - Excluded commands run unsandboxed.
  - Built-in Read, Edit, WebFetch, MCP and hooks are NOT covered.
  - Supported on macOS (Seatbelt), Linux and WSL2 (bubblewrap + socat). Native Windows is unsandboxed.
  - Strict example: `claude --settings '{"sandbox": {"enabled": true, "allowUnsandboxedCommands": false}}'`.

  — [Sandboxing](https://code.claude.com/docs/en/sandboxing.md)
- The `--sandbox` and `--no-sandbox` flags on `claude remote-control` were removed in v2.1.300. Use `sandbox.enabled` in settings instead. — [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- Enterprise controls:
  - Managed settings and server-managed settings.
  - `allowedProviders` (v2.1.285).
  - `availableModels`, `availableModelsMatch: "exact"` and `deniedModels` (v2.1.283).
  - Version requirements (Week 23).
  - Managed MCP.
  - Claude apps gateway, with spend limits and audit.
  - OpenTelemetry `tool_decision` events, which include `classifier_verdict` (v2.1.301).

  — [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md); [Docs index](https://code.claude.com/docs/llms.txt)

### Inferences
- An expert CI recipe as of Oct 2026 has these parts:
  - `claude --bare -p`, so untrusted repo hooks and MCP don't run.
  - Explicit `--allowedTools` plus `--permission-mode dontAsk`, or `auto` with `autoMode.environment` set at user or managed scope.
  - `--json-schema` for machine-readable output.
  - `--max-budget-usd` as a cost guard.
  - The sandbox enabled with `allowUnsandboxedCommands: false` when running on a shared host.

### Gaps
- I did not fetch the full CLI reference, the settings-reference sections on `permissions.defaultMode` and `additionalDirectories` beyond what is quoted, or the GitHub Action's input names (`claude_args`, `prompt`).
- The exact current major version of `anthropics/claude-code-action` was not confirmed.

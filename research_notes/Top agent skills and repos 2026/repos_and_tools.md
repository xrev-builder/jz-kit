# AI Coding-Agent Repos and Tooling Dominating Attention (as of 2026-10-17)

**Method note.** All star/fork counts below were pulled live from the GitHub Search API (via the GitHub MCP `search_repositories` tool) on **2026-10-17 (~21:50 UTC)**. They are first-party GitHub data, not snippets. Growth is shown as stars ÷ age only where creation date is known (a rough average, not a measured trajectory; star-history.com was not fetched). Qualitative praise/criticism comes from web search; most of it was read as search-result summaries rather than full pages, which is flagged **[snippet]**. SKILL.md skill packs are excluded per scope, but a few "framework" repos that blur the line (superpowers, ECC, gstack) are noted for context.

Canonical source for every star count in this file: [GitHub Search API, queried 2026-10-17](https://github.com/search?q=stars%3A%3E5000+topic%3Aclaude-code&type=repositories).

---

## Ranked list: most influential agent tooling repos (non-skill-pack)

Ranked by a blend of absolute stars, 2026 growth, and how often practitioners discuss them. Stars as of 2026-10-17.

| # | Repo | Category | Stars | Forks | Created | Notes |
|---|------|----------|-------|-------|---------|-------|
| 1 | [openclaw/openclaw](https://github.com/openclaw/openclaw) | Personal/general agent ("the AI that really does things") | 392,284 | 82,461 | 2025-11-24 | ~1,100 stars/day average over its life; 9,370 open issues |
| 2 | [anomalyco/opencode](https://github.com/anomalyco/opencode) (formerly sst/opencode) | Open-source terminal coding agent | 215,163 | 28,858 | 2025-04-30 | Out-starred Claude Code |
| 3 | [anthropics/claude-code](https://github.com/anthropics/claude-code) | Reference harness (issues repo; product is proprietary) | 151,654 | 26,870 | 2025-02-22 | 15,210 open issues |
| 4 | [github/spec-kit](https://github.com/github/spec-kit) | Spec-driven development toolkit | 141,669 | 12,675 | 2025-08-21 | ~2,100 stars/day avg |
| 5 | [openai/codex](https://github.com/openai/codex) | Terminal coding agent (Rust) | 129,639 | 20,405 | 2025-04-13 | 23,194 open issues |
| 6 | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | Terminal coding agent | 107,425 | 14,729 | 2025-04-17 | |
| 7 | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | Cross-session memory plugin for agents | 101,404 | 8,891 | 2025-08-31 | Supports Claude Code, OpenClaw, Codex, Gemini, OpenCode |
| 8 | [paperclipai/paperclip](https://github.com/paperclipai/paperclip) | Agent orchestration/management app | 103,604 | 17,321 | 2026-03-02 | 2026 breakout |
| 9 | [stablyai/orca](https://github.com/stablyai/orca) | Agent fleet IDE/"ADE" (worktrees, desktop+mobile, YC-backed) | 95,308 | 6,103 | 2026-03-17 | 2026 breakout; 8,540 open issues |
| 10 | [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | Awesome list | 96,522 | 17,879 | 2024-11-30 | |
| 11 | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | Reference MCP servers | 91,330 | 11,802 | 2024-11-19 | |
| 12 | [OpenHands/OpenHands](https://github.com/OpenHands/OpenHands) | Autonomous dev agent platform | 91,139 | 12,089 | 2024-03-13 | |
| 13 | [ruvnet/ruflo](https://github.com/ruvnet/ruflo) (formerly claude-flow) | Multi-agent "swarm" harness | 76,009 | 9,001 | 2025-06-02 | Renamed from claude-flow |
| 14 | [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) | Spec-driven development | 72,244 | 4,939 | 2025-08-05 | |
| 15 | [cline/cline](https://github.com/cline/cline) | IDE agent / SDK / CLI | 70,468 | 7,694 | 2024-07-06 | Octoverse 2025 fastest-growing by contributors |
| 16 | [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) | Meta-prompting / SDD system for Claude Code | 64,281 | 5,431 | 2025-12-14 | **Archived** as of 2026-10-17 |
| 17 | [upstash/context7](https://github.com/upstash/context7) | Up-to-date docs MCP | 63,205 | 3,106 | 2025-03-26 | |
| 18 | [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | Awesome list | 55,900 | 4,831 | 2025-04-19 | |
| 19 | [aaif-goose/goose](https://github.com/aaif-goose/goose) (formerly block/goose) | Extensible open agent (Rust, MCP/ACP) | 55,373 | 6,454 | 2024-08-23 | Moved out of Block's org |
| 20 | [bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) | Agile multi-persona SDD method | 54,266 | 6,098 | 2025-04-13 | |
| 21 | [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Browser debugging MCP | 53,729 | 6,858 | 2025-09-11 | Fastest-growing first-party MCP server |
| 22 | [Aider-AI/aider](https://github.com/Aider-AI/aider) | Terminal pair programmer (veteran) | 49,599 | 5,068 | 2023-05-09 | |
| 23 | [herdrdev/herdr](https://github.com/herdrdev/herdr) | Agent runtime / terminal multiplexer (Rust) | 44,507 | 3,537 | 2026-03-27 | 2026 breakout |
| 24 | [wshobson/agents](https://github.com/wshobson/agents) | Multi-harness plugin/subagent marketplace | 40,970 | 4,349 | 2025-07-24 | |
| 25 | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | Browser automation MCP | 38,285 | 3,275 | 2025-03-21 | Only 3 open issues |
| 26 | [musistudio/claude-code-router](https://github.com/musistudio/claude-code-router) | Model router/proxy for Claude Code | 37,720 | 3,165 | 2025-02-25 | |
| 27 | [continuedev/continue](https://github.com/continuedev/continue) | Open-source coding agent | 36,235 | 5,482 | 2023-05-24 | |
| 28 | [github/github-mcp-server](https://github.com/github/github-mcp-server) | Official GitHub MCP | 33,696 | 5,274 | 2025-03-04 | |
| 29 | [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates) | Config/monitoring CLI | 32,714 | 3,784 | 2025-07-04 | |
| 30 | [oraios/serena](https://github.com/oraios/serena) | Semantic code retrieval/editing MCP (LSP-based) | 30,347 | 2,160 | 2025-03-23 | |
| 31 | [charmbracelet/crush](https://github.com/charmbracelet/crush) | TUI coding agent (Go) | 28,687 | 2,340 | 2025-05-21 | |
| 32 | [qwenlm/qwen-code](https://github.com/QwenLM/qwen-code) | Terminal coding agent | 28,546 | 3,217 | 2025-06-26 | |
| 33 | [BloopAI/vibe-kanban](https://github.com/BloopAI/vibe-kanban) | Kanban orchestrator for Claude Code/Codex/etc. | 28,386 | 3,033 | 2025-06-14 | |
| 34 | [eyaltoledano/claude-task-master](https://github.com/eyaltoledano/claude-task-master) | PRD-to-task management for agents | 28,237 | 2,621 | 2025-03-04 | |
| 35 | [gastownhall/beads](https://github.com/gastownhall/beads) (Steve Yegge) | Git-backed issue tracker/memory for agents | 27,968 | 1,894 | 2025-10-12 | 1,489 open issues |
| 36 | [Kilo-Org/kilocode](https://github.com/Kilo-Org/kilocode) | Agentic engineering platform (Cline/Roo lineage) | 27,640 | 3,270 | 2025-03-10 | |
| 37 | [agentsmd/agents.md](https://github.com/agentsmd/agents.md) | AGENTS.md open format | 24,973 | 1,910 | 2025-08-19 | |
| 38 | [RooCodeInc/Roo-Code](https://github.com/RooCodeInc/Roo-Code) | IDE multi-mode agent | 24,272 | 3,425 | 2024-10-31 | **Archived** as of 2026-10-17 |
| 39 | [SuperClaude-Org/SuperClaude_Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework) | Claude Code command/persona config framework | 23,905 | 1,992 | 2025-06-22 | |
| 40 | [coleam00/Archon](https://github.com/coleam00/Archon) | "Harness builder" / workflow engine | 23,704 | 3,542 | 2025-02-07 | |
| 41 | [winfunc/opcode](https://github.com/winfunc/opcode) | GUI for Claude Code (Tauri) | 22,409 | 1,789 | 2025-06-19 | |
| 42 | [snarktank/ralph](https://github.com/snarktank/ralph) | Ralph loop (run until PRD items complete) | 21,993 | 2,096 | 2026-01-07 | Top Ralph implementation |
| 43 | [gastownhall/gastown](https://github.com/gastownhall/gastown) (Steve Yegge) | Multi-agent workspace manager | 18,401 | 1,688 | 2025-12-16 | |
| 44 | [siteboon/claudecodeui](https://github.com/siteboon/claudecodeui) | Web/mobile UI for CLI agents | 14,152 | 2,043 | 2025-06-25 | |
| 45 | [humanlayer/humanlayer](https://github.com/humanlayer/humanlayer) | Context engineering/HITL for hard codebases | 11,704 | 1,030 | 2024-08-05 | |
| 46 | [frankbria/ralph-claude-code](https://github.com/frankbria/ralph-claude-code) | Ralph loop w/ exit detection | 9,706 | 742 | 2025-08-27 | |
| 47 | [smtg-ai/claude-squad](https://github.com/smtg-ai/claude-squad) | tmux/worktree multi-agent manager | 8,618 | 632 | 2025-03-09 | |
| 48 | [automazeio/ccpm](https://github.com/automazeio/ccpm) | GitHub Issues + worktrees PM for agents | 8,412 | 851 | 2025-08-18 | |
| 49 | [stravu/crystal](https://github.com/stravu/crystal) | Parallel worktree desktop app | 3,132 | 198 | 2025-06-05 | Now "Nimbalyst" |
| 50 | [Dicklesworthstone/mcp_agent_mail](https://github.com/Dicklesworthstone/mcp_agent_mail) | Inbox/lease coordination layer for agents | 2,209 | 239 | 2025-10-23 | |

Context-only (skill/methodology packs, covered elsewhere but dwarf most tooling): [obra/superpowers](https://github.com/obra/superpowers) 301,176; [affaan-m/ECC](https://github.com/affaan-m/ECC) 282,398 (created 2026-01-18); [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) 220,607 (single CLAUDE.md; created 2026-01-27); [garrytan/gstack](https://github.com/garrytan/gstack) 136,777 (created 2026-03-11). All as of 2026-10-17.

---

## Orchestration / multi-agent tools for Claude Code, Codex, Antigravity etc.

### Takeaway
The orchestration layer fragmented into three tiers: (a) general/open agent harnesses that out-starred the vendor CLIs (OpenClaw 392k, OpenCode 215k), (b) 2026-born "agent fleet" managers (Paperclip 104k, Orca 95k, herdr 45k) that overtook 2025's first-wave worktree tools (vibe-kanban 28k, Claude Squad 8.6k, Crystal 3k), and (c) high-concept, heavily debated experiments (Yegge's Gas Town 18k / Beads 28k, ruflo/claude-flow 76k). Several 2025 favorites were renamed, re-homed, or archived during 2026.

### Cited Findings
- OpenClaw: 392,284 stars, 82,461 forks, created 2025-11-24; description "The AI that really does things. Any OS. Any Platform." (2026-10-17) — [GitHub](https://github.com/openclaw/openclaw)
- OpenClaw reportedly gained ~60k stars in 72 hours during an early viral spike and crossed 310k stars by April 2026; described as one of the fastest-growing repos GitHub has hosted **[snippet; secondary, figures vary by source]** — [NewsBytes](https://www.newsbytesapp.com/news/science/openclaw-project-hits-over-148000-github-stars-amid-security-concerns/tldr); [Tech Insider](https://tech-insider.org/what-shipped-in-openclaw-2-0/)
- OpenClaw criticism: CertiK (2026-03-31) warned of unauthorized actions, data breaches and crypto theft, citing 280 GitHub security advisories and ~100 CVEs; a polemical blog counts ~413–433 CVE records in five months **[snippet]** — [Let's Data Science](https://letsdatascience.com/news/openclaw-exposes-users-to-crypto-theft-aad10137); [Flying Penguin (opinion)](https://www.flyingpenguin.com/?p=80271)
- OpenClaw 2.0 (v2026.8.1, 2026-08-31) framed as response to security criticism, with credential lockdown **[snippet]** — [Tech Insider](https://tech-insider.org/what-shipped-in-openclaw-2-0/)
- OpenCode (now under `anomalyco` org; 215,163 stars as of 2026-10-17). February 2026 comparison had OpenCode at 112K vs Claude Code 71K stars, with Claude Code leading usage; OpenCode praised for open source + ~75 providers + desktop app **[snippet]** — [GitHub](https://github.com/anomalyco/opencode); [MorphLLM](https://www.morphllm.com/comparisons/opencode-vs-claude-code)
- Anthropic reportedly blocked third-party use of Claude Pro/Max OAuth by OpenCode around 2026-01-09, and an OpenCode commit reportedly cited a legal request from Anthropic when removing Claude OAuth support **[snippet; weakly sourced, no Anthropic statement found]** — [Let's Data Science](https://letsdatascience.com/news/anthropic-blocks-opencode-identity-in-claude-3ca723fe); [Dave Swift](https://daveswift.com/claude-oauth-update/)
- Gas Town (gastownhall/gastown, 18,401 stars, created 2025-12-16) and Beads (gastownhall/beads, 27,968 stars, created 2025-10-12) moved from Yegge's personal account to a `gastownhall` org (2026-10-17) — [GitHub gastown](https://github.com/gastownhall/gastown); [GitHub beads](https://github.com/gastownhall/beads)
- Gas Town praise: worth taking seriously as a signal of where development is heading; core idea is a "colony" of workers coordinated by durable work records (Beads); operational roles + external memory avoid pitfalls of role-play SDLC agent setups **[snippet]** — [Maggie Appleton](https://maggieappleton.com/gastown); [Developers Digest](https://www.developersdigest.tech/blog/yegge-coding-agent-colony); [paddo.dev](https://paddo.dev/blog/gastown-two-kinds-of-multi-agent)
- Gas Town criticism: "entirely vibecoded," burns API budgets, not a working tool for today's developers (Appleton); "uses AI in the most aggressive, expensive, and explosive ways possible" (Benn Stancil); HN commenters say no serious software to show, and Beads has grown so large no human fully understands it, with Yegge saying he's never looked at its code; an unaffiliated meme coin attached to the hype **[snippet]** — [Maggie Appleton](https://maggieappleton.com/gastown); [Benn Stancil](https://benn.substack.com/p/gas-town); [HN thread 46624883](https://hn.nuxt.dev/item/46624883)
- ruflo (formerly claude-flow): 76,009 stars; now self-describes as "The original agent harness" with swarms, self-learning, federation and native Claude Code / Codex / Hermes integration (2026-10-17) — [GitHub](https://github.com/ruvnet/ruflo)
- Paperclip: 103,604 stars, created 2026-03-02, "The open-source app everyone uses to manage agents at work"; 6,092 open issues (2026-10-17) — [GitHub](https://github.com/paperclipai/paperclip)
- Orca: 95,308 stars, created 2026-03-17, YC-backed, runs a "fleet of agents" with your own subscription across desktop/mobile/remote, worktree-based (2026-10-17) — [GitHub](https://github.com/stablyai/orca)
- herdr: 44,507 stars, created 2026-03-27, "the runtime your coding agents live on" — Rust terminal multiplexer/workspace manager (2026-10-17) — [GitHub](https://github.com/herdrdev/herdr)
- vibe-kanban 28,386; Claude Squad 8,618; Crystal 3,132 and now renamed Nimbalyst (2026-10-17) — [vibe-kanban](https://github.com/BloopAI/vibe-kanban); [claude-squad](https://github.com/smtg-ai/claude-squad); [crystal](https://github.com/stravu/crystal)
- Ralph loop: Geoffrey Huntley's technique ("Ralph is a bash loop"), first described ~May 2025; Anthropic shipped an official Claude Code plugin (~Dec 2025) implementing it as a Stop hook with `/ralph-loop --completion-promise ... --max-iterations`; caveats are API cost, permissions/sandboxing; Huntley criticized compaction in long sessions **[snippet]** — [VentureBeat](https://venturebeat.com/ai/how-ralph-wiggum-went-from-the-simpsons-to-the-biggest-name-in-ai-right-now); [Cyrus](https://www.atcyrus.com/stories/ralph-wiggum-technique-claude-code-autonomous-loops); [DreamHost](https://www.dreamhost.com/blog/ralph-wiggum/)
- Top Ralph repos: snarktank/ralph 21,993 (created 2026-01-07); frankbria/ralph-claude-code 9,706 (2026-10-17) — [snarktank/ralph](https://github.com/snarktank/ralph); [ralph-claude-code](https://github.com/frankbria/ralph-claude-code)
- Agent CLIs/IDE agents: Cline 70,468; Kilo 27,640; Roo Code 24,272 and **archived**; Crush 28,687; Goose 55,373 now at `aaif-goose` org; OpenHands 91,139; Aider 49,599; Qwen Code 28,546 (2026-10-17) — [cline](https://github.com/cline/cline); [kilocode](https://github.com/Kilo-Org/kilocode); [Roo-Code](https://github.com/RooCodeInc/Roo-Code); [crush](https://github.com/charmbracelet/crush); [goose](https://github.com/aaif-goose/goose); [OpenHands](https://github.com/OpenHands/OpenHands); [aider](https://github.com/Aider-AI/aider)
- Supporting infra: claude-mem 101,404; claude-code-router 37,720; mcp_agent_mail 2,209 (async inboxes + advisory file leases for coordinating agents); ccpm 8,412 (2026-10-17) — [claude-mem](https://github.com/thedotmack/claude-mem); [claude-code-router](https://github.com/musistudio/claude-code-router); [mcp_agent_mail](https://github.com/Dicklesworthstone/mcp_agent_mail); [ccpm](https://github.com/automazeio/ccpm)

### Inferences
- The biggest 2026 story is agent-agnostic harnesses: almost every rising repo's description lists multiple agents (Claude Code, Codex, OpenCode, Hermes, Pi, Antigravity), suggesting engineers resist lock-in, possibly accelerated by the reported Anthropic OAuth restrictions.
- Roo Code being archived while Kilo (a fork in the Cline/Roo lineage) remains active suggests consolidation in the VS Code agent-extension segment; the reason for archiving was not researched.
- Goose moving from `block/goose` to `aaif-goose` likely reflects a foundation donation (the "AAIF" name suggests the Agentic AI Foundation), but I did not verify this.
- Gas Town has outsized mindshare relative to its star count (18k); its influence is conceptual (durable work records, role-based agent "towns") more than adoption.

### Gaps
- Conductor (Melty Labs' Mac app for parallel Claude Code/Codex agents) is closed-source, so it has no GitHub star count; I found no 2026 data on it in this pass.
- Google Antigravity-specific orchestrators were not found as standalone high-star repos; Antigravity appears mainly as a supported target in multi-harness repos (e.g., wshobson/agents).
- No star-history time series was fetched, so growth rates are lifetime averages, not 2026-specific curves.
- The reason Roo Code and get-shit-done are archived is unknown.

---

## Spec-driven / context tooling (Spec Kit, BMAD, Task Master, HumanLayer, Context7, Serena, AGENTS.md)

### Takeaway
Spec-driven development (SDD) became a top-tier category: GitHub Spec Kit (142k) is the most-starred, followed by OpenSpec (72k), GSD (64k, now archived) and BMAD (54k). Context tooling is led by Context7 (63k) and Serena (30k), and AGENTS.md (25k) is the de facto cross-agent instructions format. The main critique, from Thoughtworks' Birgitta Böckeler, is that most SDD tools are "spec-first" only and risk combining the rigidity of model-driven development with LLM non-determinism.

### Cited Findings
- Spec Kit: 141,669 stars, created 2025-08-21; ~2,100 stars/day lifetime average (2026-10-17) — [GitHub](https://github.com/github/spec-kit)
- OpenSpec 72,244; BMAD-METHOD 54,266; get-shit-done 64,281 (created 2025-12-14, archived); Task Master 28,237; HumanLayer 11,704 (2026-10-17) — [OpenSpec](https://github.com/Fission-AI/OpenSpec); [BMAD](https://github.com/bmad-code-org/BMAD-METHOD); [GSD](https://github.com/gsd-build/get-shit-done); [Task Master](https://github.com/eyaltoledano/claude-task-master); [HumanLayer](https://github.com/humanlayer/humanlayer)
- Context7 63,205 ("Up-to-date docs for AI agents"); Serena 30,347 ("semantic retrieval and editing… the IDE for your agent", built on language servers) (2026-10-17) — [Context7](https://github.com/upstash/context7); [Serena](https://github.com/oraios/serena)
- AGENTS.md repo 24,973 stars, "a simple, open format for guiding coding agents" (2026-10-17) — [GitHub](https://github.com/agentsmd/agents.md)
- Böckeler (Oct 2025, martinfowler.com) defines spec-first / spec-anchored / spec-as-source; says all SDD approaches she found are spec-first, but not all aim higher; Spec Kit is spec-first only (branch per spec, spec lives for a change request, not a feature); Tessl is her spec-as-source example; concern that spec-as-source "might end up with the downsides of both MDD and LLMs: inflexibility and non-determinism" **[snippet; quotes via secondary summaries]** — [Martin Fowler / Böckeler](https://www.martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
- A 2026 arXiv paper builds on this framework and classifies Kiro as spec-first (specs deleted after the feature ships) **[snippet]** — [arXiv 2606.27045](https://arxiv.org/pdf/2606.27045)
- Codebase-graph context tools exploded in 2026: Graphify 127,745 (created 2026-04-03), codegraph 74,333, codebase-memory-mcp 46,772, Understand-Anything 86,788; token-compression proxies rtk 83,750 and headroom 75,585 (2026-10-17) — [graphify](https://github.com/Graphify-Labs/graphify); [codegraph](https://github.com/colbymchenry/codegraph); [codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp); [rtk](https://github.com/rtk-ai/rtk); [headroom](https://github.com/headroomlabs-ai/headroom)

### Inferences
- "Context engineering" moved past docs lookups (Context7) toward pre-indexed code knowledge graphs and token-cost reduction (rtk, headroom, caveman), which suggests cost and context-window pressure from long-running multi-agent workflows.
- SDD star counts likely overstate real usage: Spec Kit's critique (spec-first only) and GSD's archiving suggest churn, though I found no usage data.

### Gaps
- No full-page practitioner reviews of BMAD, Task Master or HumanLayer were fetched; praise/criticism for these is not sourced here.
- HumanLayer's "12-factor agents" / "Research-Plan-Implement" influence was not verified in this pass.

---

## Most-starred MCP servers and awesome lists

### Takeaway
Among MCP servers, the reference repo (modelcontextprotocol/servers, 91k) and docs server Context7 (63k) lead. Chrome DevTools MCP (54k, launched Sept 2025) has overtaken Playwright MCP (38k) and GitHub MCP (34k). punkpeye/awesome-mcp-servers (97k) and awesome-claude-code (56k) are the dominant curated lists.

### Cited Findings
- modelcontextprotocol/servers 91,330; Context7 63,205; chrome-devtools-mcp 53,729 (created 2025-09-11); playwright-mcp 38,285 (3 open issues); github-mcp-server 33,696; Serena 30,347; codebase-memory-mcp 46,772 (2026-10-17) — [servers](https://github.com/modelcontextprotocol/servers); [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp); [playwright-mcp](https://github.com/microsoft/playwright-mcp); [github-mcp-server](https://github.com/github/github-mcp-server)
- Awesome lists: punkpeye/awesome-mcp-servers 96,522; hesreallyhim/awesome-claude-code 55,900 (2026-10-17) — [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers); [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- Supply-chain risk: Cloud Security Alliance (July 2026) described a "FakeGit" malware campaign creating AI-themed repos to bait demand for Claude Skills and MCP servers, warning that agent-driven installs are an unvetted supply chain **[snippet]** — [CSA research note](https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/07/CSA_research_note_fakegit-agentbaiting-mcp-supply-chain_20260721-csa-styled.pdf)

### Inferences
- Chrome DevTools MCP grew ~2x faster than Playwright MCP per day of existence, likely because it gives agents debugging and performance data, not just browser automation.

### Gaps
- No per-server usage/download data was gathered; rankings are stars only.

---

## Which repos trended hardest in 2026 (GitHub trending, Octoverse, star-history)

### Takeaway
The 2026-created repos with the largest star totals are dominated by OpenClaw-era agent harnesses, agent-fleet managers, and Claude Code add-ons. The Octoverse 2025 report confirmed AI infrastructure (including Cline) dominated contributor growth. Star counts in this space are increasingly distrusted because of documented fake-star campaigns, so raw totals need caveats.

### Cited Findings
- Octoverse 2025 (Oct 28, 2025): 6 of the top 10 fastest-growing OSS repos by contributors were AI infrastructure; vllm, cline, home-assistant, ragflow, sglang named among fastest-growing; 4.3M+ AI-related repos **[snippet; secondary coverage]** — [GitHub Blog](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/); [It's FOSS](https://itsfoss.com/news/github-octoverse-2025/)
- Highest-starred repos created in 2026 with "claude-code" in name/description/topics (2026-10-17): morluto/rea 306,568 (reverse engineering with agents, created 2026-04-14); ECC 282,398; andrej-karpathy-skills 220,607; ponytail 166,164 (created 2026-06-12); gstack 136,777; Graphify 127,745; caveman 113,275; Paperclip 103,604; Orca 95,308; rtk 83,750; OmniRoute 77,700 (AI gateway); headroom 75,585; codegraph 74,333; herdr 44,507 — [GitHub search](https://github.com/search?q=claude-code+created%3A%3E2025-12-31+stars%3A%3E5000&type=repositories&s=stars)
- Fake stars: CMU study (ICSE 2026) found ~6M suspected fake stars across 18,617 repos; AI/LLM repos were the largest non-malicious category (~177k fake stars); stars sell for ~$0.03–$0.85; fork-to-star ratio below ~0.05 is a suggested red flag (secondary heuristic) **[snippet]** — [arXiv 2412.13459](https://arxiv.org/abs/2412.13459); [BuildMVPFast](https://www.buildmvpfast.com/blog/github-fake-stars-agent-seo-open-source-ai-2026)

### Inferences
- By the fork-ratio heuristic, the top repos above look organic: OpenClaw 0.21, rea 0.25, OpenCode 0.13, Spec Kit 0.09, Orca 0.064, herdr 0.079. Context7 (0.049) and Serena (0.071) are near the low end, but MCP servers are naturally forked less. This is a heuristic, not proof.
- Some 2026 viral repos with very large totals (e.g., rea at 306k in six months, ponytail at 166k in four months) are far above established tools; treat their engineering influence as unproven until there is independent practitioner coverage, which I did not find.
- The 2026 pattern was "agent add-ons go viral": memory (claude-mem), token savings (rtk, caveman, headroom), code graphs (Graphify, codegraph), and fleet managers (Paperclip, Orca, herdr), more than new standalone agents.

### Gaps
- Octoverse 2026 is not yet published as of 2026-10-17 (normally late October/November); no 2026 Octoverse data.
- GitHub Trending snapshots and star-history.com curves were not fetched; "trended hardest" is inferred from stars ÷ age.
- HN front-page thread rankings for 2026 were not systematically collected beyond the Gas Town thread.

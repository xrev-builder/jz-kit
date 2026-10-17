# Most Popular and Most Praised Agent Skills (SKILL.md) and Claude Code Plugins, as of October 2026

Research date: 2026-10-17. Here is where each kind of evidence comes from:
- **GitHub star and fork counts** come from live GitHub repository search API results pulled on 2026-10-17 (the `updated_at` timestamp on each repo was 2026-10-17). They are linked to the repo pages. These are the most reliable numbers in these notes.
- **Official plugin install counts** were fetched directly from claude.com/plugins/<name> pages on 2026-10-17. The pages show no "as of" date, so read them as live counts on that day.
- **skills.sh leaderboard figures** come from search snippets only, quoting a third-party snapshot from July 2026. The skills.sh, dev.to, news.ycombinator.com and vibecoding.app domains could not be fetched (DNS failure), so those numbers are unverified.
- Caveat on stars: several community repos show very large star counts (200k–300k) that rose fast in 2026. Stars measure attention or bookmarking, not active use. Repos with a cross-agent audience (Codex, Cursor, OpenClaw and others) collect stars from outside the Claude Code ecosystem.

## Q1: Which official Anthropic skills and official plugins are most used and praised?

### Takeaway
Anthropic's `frontend-design` is the single most-installed item in the whole ecosystem. It is #1 in the official Claude plugin directory at about 1.13M installs, and it was #2 overall on the cross-agent skills.sh leaderboard in a July 2026 snapshot. Next among official plugins come code-review (about 439k), code-simplifier (about 347k), claude-md-management (about 287k), feature-dev (about 256k), security-guidance (about 242k) and ralph-loop (about 197k). The `anthropics/skills` repo (which holds docx/pptx/xlsx/pdf, skill-creator, frontend-design, webapp-testing and others) has about 182k stars, and `anthropics/claude-plugins-official` has about 41.6k stars.

### Cited Findings
**Repos (GitHub API, 2026-10-17)**
- `anthropics/skills` ("Public repository for Agent Skills"): 181,779 stars, 21,528 forks, 1,426 open issues. Created 2025-09-22. — [GitHub](https://github.com/anthropics/skills)
- `anthropics/claude-plugins-official` ("Official, Anthropic-managed directory of high quality Claude Code Plugins"): 41,646 stars, 4,455 forks, 1,166 open issues. Created 2025-11-20. — [GitHub](https://github.com/anthropics/claude-plugins-official)
- `anthropics/claude-plugins-community` (a community marketplace that is a read-only mirror; submissions go through clau.de/plugin-directory-submission): 4,683 stars. — [GitHub](https://github.com/anthropics/claude-plugins-community)
- Other official Anthropic skill repos from 2026: `defending-code-reference-harness` (skills for threat modeling, scanning, triage and patching) with 7,597 stars; `launch-your-agent` with 1,062 stars; `k12-teacher-skills` with 569 stars. — [GitHub](https://github.com/anthropics/defending-code-reference-harness), [GitHub](https://github.com/anthropics/launch-your-agent), [GitHub](https://github.com/anthropics/k12-teacher-skills)

**Official directory listing (claude.com/plugins, fetched 2026-10-17)**
- The directory shows "341 plugins". The default display order, which looks like a popularity order but is not labeled as one, is: Frontend Design, Superpowers, Code Review, Context7, Code Simplifier, Playwright, GitHub, CLAUDE.md Management, Feature Dev, Security Guidance, Vercel, TypeScript LSP, Ralph Loop, Claude Code Setup, Commit Commands, Figma, Supabase, PR Review Toolkit, Pyright LSP, Chrome DevTools, telegram, Atlassian, Slack, Serena. — [claude.com/plugins](https://claude.com/plugins)
- Earlier counts of the marketplace size: 291 plugins on 8 Sep 2026 and 276 on 31 Jul 2026. These are search snippets from third-party rankings. — [vibecoding.app](https://vibecoding.app/blog/best-claude-code-plugins), [buildthisnow](https://www.buildthisnow.com/blog/guide/mechanics/best-claude-code-plugins-2026)

**Install counts fetched from claude.com plugin pages on 2026-10-17**
| Rank (by installs) | Plugin | Maker | Installs | What it does (quoted from the listing) |
|---|---|---|---|---|
| 1 | Frontend Design | Anthropic (verified) | 1,134,112 | "Craft production-grade frontends with distinctive design… avoids generic AI aesthetics" — [page](https://claude.com/plugins/frontend-design) |
| 2 | Superpowers | Jesse Vincent (community) | 1,009,371 | "brainstorming, subagent development with code review, debugging, TDD, and skill authoring" — [page](https://claude.com/plugins/superpowers) |
| 3 | Code Review | Anthropic | 438,525 | "Automates pull request code review using multiple specialized agents working in parallel"; 5 reviewers, a 0–100 confidence score per finding, and only findings scored ≥80 get posted — [page](https://claude.com/plugins/code-review) |
| 4 | Context7 | Upstash | 417,801 | "MCP server for live docs lookup" — [page](https://claude.com/plugins/context7) |
| 5 | Code Simplifier | Anthropic (verified) | 346,763 | "simplifies and refines recently modified code while preserving functionality" — [page](https://claude.com/plugins/code-simplifier) |
| 6 | Playwright | Microsoft | 319,887 | "Browser automation and end-to-end testing MCP server" — [page](https://claude.com/plugins/playwright) |
| 7 | GitHub | GitHub | 319,381 | "Official GitHub MCP server for repo management" — [page](https://claude.com/plugins/github) |
| 8 | CLAUDE.md Management | Anthropic (verified) | 287,247 | "audit quality, capture learnings, and keep project memory current" — [page](https://claude.com/plugins/claude-md-management) |
| 9 | Feature Dev | Anthropic | 256,017 | "A structured 7-phase workflow for building features systematically" (exploration, design and review agents) — [page](https://claude.com/plugins/feature-dev) |
| 10 | Security Guidance | Anthropic (verified) | 241,800 | "A security reminder hook that automatically warns about potential security vulnerabilities when Claude edits files" — [page](https://claude.com/plugins/security-guidance) |
| 11 | Ralph Loop | Anthropic (verified) | 196,527 | "Interactive AI loops for iterative development using the Ralph Wiggum technique" — [page](https://claude.com/plugins/ralph-loop) |

- Earlier third-party snapshots roughly agree: frontend-design at 1,110,438 and later 1.13M, code-review at 430,450, GitHub MCP at 261,988. Feature-dev figures conflict across sources, ranging from about 89k to 253k. These are search snippets only. — [buildthisnow](https://www.buildthisnow.com/blog/guide/mechanics/best-claude-code-plugins-2026), [vibecoding.app](https://vibecoding.app/blog/best-claude-code-plugins)
- On the skills.sh cross-agent leaderboard (July 2026 snapshot, all-time installs, search snippet only), Anthropic holds one top-10 slot: frontend-design at about 715,763 installs, ranked #2. The article's headline: "The entire Claude Code skills top 10 belongs to three authors; Anthropic holds one slot." The author runs a skill directory, so they have a commercial interest. — [dev.to / Skillselion](https://dev.to/skillselion/the-entire-claude-code-skills-top-10-belongs-to-three-authors-anthropic-holds-one-slot-27jc)
- History: Claude's document-creation features (PDF/DOCX/XLSX/PPTX), launched September 2025, were reportedly built on the Skills architecture. This comes via a secondary summary of Simon Willison. — [claudeskills.info summary](https://claudeskills.info/blog/claude-skills-bigger-deal-than-mcp/)
- Simon Willison's October 2025 post, "Claude Skills are awesome, maybe a bigger deal than MCP", praised how efficient skills are: metadata costs "a few dozen extra tokens" and full details load only when relevant. He predicted a "Cambrian explosion in Skills". I saw this only through secondary summaries and did not fetch the original. — [beri.net summary](https://www.beri.net/learning/simonwillison-claude-skills-bigger-than-mcp), [claudeskills.info](https://claudeskills.info/blog/claude-skills-bigger-deal-than-mcp/)
- An Anthropic-built API skill reportedly used more than 200,000 tokens to load. Anthropic says Claude Code v2.1.234 cut this to about 25,000. — [The New Stack](https://thenewstack.io/claude-code-token-reduction/) (search snippet)

### Inferences
- The most-used official plugins are workflow and quality tools: design quality, PR review, simplification, CLAUDE.md hygiene and security hooks. The document skills (docx/pptx/xlsx/pdf) mostly ship built into Claude.ai and Cowork, so they show up less in plugin-install rankings, even though they are central to `anthropics/skills`.
- Third-party MCP plugins (Context7, Playwright, GitHub) sit inside the official top 10, so "plugins" in practice covers MCP distribution as well as skills.

### Gaps
- I found no install counts for individual skills in `anthropics/skills`, such as skill-creator, webapp-testing or docx/xlsx usage. Anthropic does not publish them.
- I did not fetch install counts for pr-review-toolkit, commit-commands, typescript-lsp or claude-code-setup. They rank above Ralph Loop in display order but below it in installs, so their counts are unknown.
- The security-review command is built into Claude Code as a bundled skill, so it has no directory install count.

## Q2: Which community skills and plugin packs dominate?

### Takeaway
Among community packs, obra/superpowers is clearly the leader. It has about 301k GitHub stars and 1.01M official-directory installs, putting it #2 in the directory behind frontend-design. mattpocock/skills (about 295k stars; grill-me was a top-3 skill on skills.sh), affaan-m/ECC ("Everything Claude Code", about 282k stars), claude-mem (about 101k), ui-ux-pro-max (about 137k) and Vercel's `npx skills` / skills.sh ecosystem (find-skills was #1 on skills.sh at about 2.7M installs) make up the rest of the dominant tier. wshobson/agents (about 41k) and Every's compound-engineering (about 25.6k) are influential but much smaller.

### Cited Findings
**GitHub stars (live API, 2026-10-17), community repos ranked**
| Repo | Maker | Stars | Forks | Created | What it is |
|---|---|---|---|---|---|
| obra/superpowers | Jesse Vincent | 301,176 | 26,889 | 2025-10-09 | "An agentic skills framework & software development methodology that works" — [GitHub](https://github.com/obra/superpowers) |
| mattpocock/skills | Matt Pocock | 295,016 | 24,743 | 2026-02-03 | "Skills for Real Engineers. Straight from my .agents directory." — [GitHub](https://github.com/mattpocock/skills) |
| affaan-m/ECC | Affaan Mustafa | 282,397 | 41,974 | 2026-01-18 | "agent harness performance optimization system. Skills, instincts, memory, security…" — [GitHub](https://github.com/affaan-m/ECC) |
| multica-ai/andrej-karpathy-skills | multica-ai | 220,607 | 22,166 | 2026-01-27 | A single CLAUDE.md derived from Karpathy's observations on LLM coding pitfalls. It is not strictly a SKILL.md pack. — [GitHub](https://github.com/multica-ai/andrej-karpathy-skills) |
| nextlevelbuilder/ui-ux-pro-max-skill | nextlevelbuilder | 136,874 | 14,543 | 2025-11-30 | "design intelligence for building professional UI/UX" — [GitHub](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| Graphify-Labs/graphify | Graphify Labs | 127,744 | 12,310 | 2026-04-03 | A /graphify skill that turns a codebase into a knowledge graph — [GitHub](https://github.com/Graphify-Labs/graphify) |
| JuliusBrussee/caveman | Julius Brussee | 113,274 | 6,553 | 2026-04-04 | A viral skill that "cuts 65% of tokens by talking like a caveman" — [GitHub](https://github.com/JuliusBrussee/caveman) |
| thedotmack/claude-mem | thedotmack | 101,404 | 8,891 | 2025-08-31 | Persistent memory across sessions; compresses agent activity with AI and injects it back — [GitHub](https://github.com/thedotmack/claude-mem) |
| tt-a1i/archify | tt-a1i | 84,835 | 5,743 | 2026-04-15 | A diagram-generation skill — [GitHub](https://github.com/tt-a1i/archify) |
| ComposioHQ/awesome-claude-skills | Composio | 77,306 | 9,168 | 2025-10-17 | Curated list — [GitHub](https://github.com/ComposioHQ/awesome-claude-skills) |
| mvanhorn/last30days-skill | Matt Van Horn | 64,584 | — | 2026-01-23 | Research skill covering Reddit, X, HN and others — [GitHub](https://github.com/mvanhorn/last30days-skill) |
| blader/humanizer | blader | 57,817 | — | 2026-01-18 | Removes signs of AI writing — [GitHub](https://github.com/blader/humanizer) |
| hesreallyhim/awesome-claude-code | hesreallyhim | 55,900 | — | 2025-04-19 | Curated list — [GitHub](https://github.com/hesreallyhim/awesome-claude-code) |
| coreyhaines31/marketingskills | Corey Haines | 55,248 | — | 2026-01-15 | Marketing skills — [GitHub](https://github.com/coreyhaines31/marketingskills) |
| K-Dense-AI/scientific-agent-skills | K-Dense | 52,188 | — | 2025-10-19 | 177 science skills; the repo claims "250,000+ scientists" — [GitHub](https://github.com/K-Dense-AI/scientific-agent-skills) |
| kepano/obsidian-skills | Steph Ango (Obsidian CEO) | 49,692 | — | 2026-01-02 | Obsidian skills — [GitHub](https://github.com/kepano/obsidian-skills) |
| sickn33/agentic-awesome-skills | sickn33 | 47,776 | — | 2026-01-14 | Catalog of 2,600+ skills — [GitHub](https://github.com/sickn33/agentic-awesome-skills) |
| wshobson/agents | Seth Hobson | 40,970 | 4,349 | 2025-07-24 | "Multi-harness agentic plugin marketplace" (Claude Code, Codex, Cursor and others) — [GitHub](https://github.com/wshobson/agents) |
| VoltAgent/awesome-agent-skills | VoltAgent | 35,894 | — | 2025-10-28 | 1000+ skills list — [GitHub](https://github.com/VoltAgent/awesome-agent-skills) |
| vercel-labs/skills | Vercel | 35,365 | 3,015 | 2026-01-14 | "The open agent skills tool - npx skills" — [GitHub](https://github.com/vercel-labs/skills) |
| openai/codex-plugin-cc | OpenAI | 34,339 | — | 2026-03-30 | Use Codex from Claude Code to review code or delegate tasks — [GitHub](https://github.com/openai/codex-plugin-cc) |
| vercel-labs/agent-skills | Vercel | 32,564 | 2,843 | 2025-12-08 | Vercel's official skill collection — [GitHub](https://github.com/vercel-labs/agent-skills) |
| zarazhangrui/frontend-slides | Zara Zhang | 30,813 | — | 2026-01-28 | Slide-deck skill — [GitHub](https://github.com/zarazhangrui/frontend-slides) |
| jarrodwatts/claude-hud | Jarrod Watts | 28,611 | — | 2026-01-02 | Plugin showing context usage, active tools and agents — [GitHub](https://github.com/jarrodwatts/claude-hud) |
| alirezarezvani/claude-skills | Alireza Rezvani | 28,330 | — | 2025-10-19 | 380+ skills — [GitHub](https://github.com/alirezarezvani/claude-skills) |
| OthmanAdi/planning-with-files | Othman Adi | 27,492 | — | 2026-01-03 | Manus-style persistent file-based planning — [GitHub](https://github.com/OthmanAdi/planning-with-files) |
| EveryInc/compound-engineering-plugin | Every (Kieran Klaassen, Dan Shipper) | 25,572 | 2,080 | 2025-10-09 | "Official Compound Engineering plugin for Claude Code, Codex, Cursor" — [GitHub](https://github.com/EveryInc/compound-engineering-plugin) |

**skills.sh (Vercel) leaderboard: search snippets only, not verified live**
- Vercel launched the `skills` CLI and skills.sh on 20 Jan 2026. The leaderboard ranks skills by all-time installs reported to the registry. — [ToolWorthy](https://www.toolworthy.ai/tool/skills-sh), [dev.to/Skillselion](https://dev.to/skillselion/the-entire-claude-code-skills-top-10-belongs-to-three-authors-anthropic-holds-one-slot-27jc)
- July 2026 snapshot: #1 find-skills (Vercel Labs) 2,723,091; #2 frontend-design (Anthropic) 715,763; #3 grill-me (Matt Pocock) 690,693; #4 agent-browser (Vercel Labs) 591,076. Three authors hold the whole top 10 (Vercel, Matt Pocock, Anthropic). — [dev.to/Skillselion](https://dev.to/skillselion/the-entire-claude-code-skills-top-10-belongs-to-three-authors-anthropic-holds-one-slot-27jc)
- For scale: the top skill had just over 26,000 installs in January 2026. — [ToolWorthy](https://www.toolworthy.ai/tool/skills-sh)
- Note on the find-skills count: find-skills is a meta-skill for discovering and installing other skills, and the skills CLI may suggest it by default. Its #1 spot probably reflects how the tool distributes it rather than engineers choosing it. This is my inference.

**Matt Pocock's skills**
- grill-me is the flagship at about 508k installs, followed by grill-with-docs (424k) and tdd (400k). An earlier star count was about 258k in Sep 2026. These come from third-party wiki and guide sites, so treat them as approximate. grill-me is described as getting "relentlessly interviewed about a plan or design until every branch of the decision tree is resolved". v1.1 (July 2026) renamed /to-prd to /to-spec. — [skillselion guide](https://skillselion.com/guide/matt-pocock-skills-map), [mcp.directory](https://mcp.directory/blog/matt-pocock-skills-the-npm-moment-explained-2026)
- The official Claude directory listing "Matt Pocock's Skills" ("21 composable agent skills that embed real software engineering discipline") shows only 1,745 installs (fetched 2026-10-17). Most people install it through `npx skills add mattpocock/skills`, not through the Claude plugin directory. — [claude.com](https://claude.com/plugins/mattpocock-skills)

**Every's compound-engineering**
- Created by Kieran Klaassen and Dan Shipper at Every. It runs a plan → work → review → compound loop, where `/workflows:compound` writes reusable learnings (for example to docs/solutions/). About 33 skills and about 24.5k stars as of August 2026, per an operator guide. — [aibuilderclub](https://www.aibuilderclub.com/blog/compound-engineering-claude-code), [developertoolkit.ai](https://developertoolkit.ai/en/method/principles/compound-engineering/)

**ECC (Everything Claude Code)**
- It grew out of an Anthropic hackathon win: Affaan Mustafa's team built zenith.chat with Claude Code in 8 hours. Sources disagree on the city and date. Star snapshots run from 82k to 118k to 214,429 (13 Jun 2026) to 282k (2026-10-17, GitHub API). A Medium piece says it is "dividing the developer community" on r/ClaudeCode, with opinions on both sides. — [Medium](https://medium.com/@tentenco/everything-claude-code-inside-the-82k-star-agent-harness-thats-dividing-the-developer-community-4fe54feccbc1), [pasqualepillitteri.it](https://pasqualepillitteri.it/en/news/4878/everything-claude-code-ecc-agent-harness-os)

### Inferences
- **Ranking for "dominating", combining installs, stars and leaderboard presence:**
  1. obra/superpowers
  2. Anthropic frontend-design
  3. mattpocock/skills (grill-me, tdd)
  4. Vercel skills.sh tooling and its skills (find-skills, agent-browser, React best-practices)
  5. ECC
  6. Anthropic code-review and code-simplifier
  7. claude-mem
  8. ui-ux-pro-max
  9. Context7, Playwright and GitHub MCP plugins
  10. wshobson/agents and compound-engineering (influential, smaller)
- Distribution has split in two. The Claude plugin directory (`/plugin install`) favors Anthropic and its partners. `npx skills` / skills.sh is cross-agent and favors Vercel and Pocock. A pack can be huge in one channel and small in the other (Pocock: 1,745 directory installs against hundreds of thousands on skills.sh).
- Many top-starred 2026 repos are viral single-purpose skills (caveman, humanizer, archify, graphify, karpathy CLAUDE.md). Stars are inflated by cross-agent audiences (Codex, OpenClaw, Cursor), so stars and actual Claude Code usage can differ a lot.

### Gaps
- I could not fetch the live skills.sh leaderboard (DNS failure), so I have no October 2026 install counts for it.
- I found no install counts for claude-mem, ECC, ui-ux-pro-max or wshobson/agents in the official directory. I did not check whether they are listed there.
- I could not separate organic stars from star inflation. No source audited this.
- skillsmp.com and agentskills.io: I gathered no ranking metrics for these in this pass.

## Q3: What do engineers praise, and what do they criticize?

### Takeaway
The workflow packs (Superpowers, Pocock's grill-me/tdd, compound-engineering) get the most praise for discipline that forces Claude to clarify, plan, test and review before coding. frontend-design is praised for avoiding "generic AI aesthetics". The criticisms that keep coming up are: (1) context and token bloat from many installed skills, (2) unreliable auto-triggering, where descriptions get silently dropped past a character budget, (3) churn and heavy opinionation in large packs, and (4) supply-chain security, with hundreds of malicious skills found in open registries.

### Cited Findings
**Praise**
- Superpowers' brainstorming is a Socratic back-and-forth that refines what you actually want. The framework "refuses to write code" until it has asked clarifying questions and proposed a design. — [Marc Nuri](https://blog.marcnuri.com/superpowers-claude-code-skills-framework), [DataCamp](https://www.datacamp.com/tutorial/claude-code-superpowers) (search snippets)
- HN "A Rave Review of Superpowers": the brainstorming skill is great, and the subagents' adversarial review of its own spec and plan "has caught several things I would've missed." — [Hacker News](https://news.ycombinator.com/item?id=47623101) (search snippet; the thread itself could not be fetched)
- TDD-by-default and mandatory review are "exactly the disciplines that erode first under deadline pressure," and Superpowers makes them structural. — [search snippet, source among Superpowers guides](https://agentskit.co/blog/claude-code-superpowers)
- Compound engineering: Klaassen came up with the idea after Claude Code cited its own earlier reviews in a PR and applied "three months of review taste" unprompted. — [developertoolkit.ai](https://developertoolkit.ai/en/method/principles/compound-engineering/)
- Willison praised skills as a format: cheap metadata loaded only when needed, likely "a bigger deal than MCP". — [beri.net summary](https://www.beri.net/learning/simonwillison-claude-skills-bigger-than-mcp)
- frontend-design's own pitch is that it "avoids generic AI aesthetics". Its 1.13M installs are the strongest revealed-preference signal in the directory. — [claude.com](https://claude.com/plugins/frontend-design)

**Criticism**
- Superpowers: an HN commenter says it is "not really TDD"; instead it "makes a plan with acceptance tests and then can tweak its output until the tests pass." — [Hacker News](https://news.ycombinator.com/item?id=47623101) (search snippet)
- Superpowers removed its subagent review loops in favor of inline self-review to cut execution time (from about 25 minutes). This trades independent review for speed. — [search snippet, Superpowers guide](https://www.developersdigest.tech/blog/claude-code-superpowers-plugin-guide)
- "Nothing in Superpowers requires the plugin specifically": every skill is a plain markdown file you could write by hand. — [Marc Nuri](https://blog.marcnuri.com/superpowers-claude-code-skills-framework) (search snippet)
- Compound-engineering is "churny", with a near-daily release cadence and a full command rename (/workflows:* to /ce-*). It is also "opinionated" and assumes you want Every's workflow. — [rywalker.com](https://rywalker.com/research/compound-engineering-plugin) (search snippet)
- Trigger reliability: Claude Code builds a list of skill names and descriptions at session start. Past a default budget (about 15,000 characters, or about 4k tokens), descriptions are silently dropped. You can adjust the budget with `SLASH_COMMAND_TOOL_CHAR_BUDGET`. — [blog.fsck.com (Jesse Vincent, Dec 2025)](https://blog.fsck.com/2025/12/17/claude-code-skills-not-triggering/), [dev.to](https://dev.to/lizechengnet/why-claude-code-skills-dont-trigger-and-how-to-fix-them-in-2026-o7h)
- One developer reports only about 50% autonomous triggering even after fixing the budget. This is a single unverified post. — [dev.to](https://dev.to/lizechengnet/why-claude-code-skills-dont-trigger-and-how-to-fix-them-in-2026-o7h) (search snippet)
- Token bloat: "every skill you install injects its name and description into the model's context on every turn — used or not." — [dev.to/haoli](https://dev.to/haoli/your-claude-code-skills-are-being-silently-demoted-i-built-a-cli-to-catch-it-454e), [MindStudio](https://www.mindstudio.ai/blog/context-rot-claude-code-skills-bloated-files) (search snippets)
- The Anthropic API skill consumed more than 200k tokens before v2.1.234 cut it to about 25k. — [The New Stack](https://thenewstack.io/claude-code-token-reduction/) (search snippet)
- Token-saving skills have become a popular category in their own right: caveman claims 65% savings and has 113k stars. — [GitHub](https://github.com/JuliusBrussee/caveman)

**Security of third-party skills**
- A scan of 98,380 skills found 157 confirmed malicious ones, including data thieves and agent hijackers. — [MalSkills arXiv 2603.27204](https://arxiv.org/html/2603.27204)
- MalSkills flagged 620 skills across 150,108 skills from 7 registries, and 400 were confirmed on manual review. It reports 93% F1 for detection. — [arXiv](https://arxiv.org/html/2603.27204)
- Koi Security found 341 malicious skills on ClawHub (11.9% of 2,857). The Cloud Security Alliance reports more than 1,184 malicious ClawHub skills distributing Atomic macOS Stealer between Feb and May 2026. These figures cover the OpenClaw registry, not the Claude directory. — [CSA research note](https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-skill-supply-chain-attacks-20260624-csa/)
- 26.1% of 42,447 skills scanned had at least one vulnerability, across 14 patterns. — [arXiv 2603.00195](https://arxiv.org/html/2603.00195v1) (search snippet; the attribution of this figure to this paper is unconfirmed)
- Metadata-only manipulation can steer skill selection and evade governance classifiers in 36.5–100% of cases. VirusTotal misses most agent-targeted malware. — [arXiv 2605.11418](https://arxiv.org/html/2605.11418v1), [SkillSieve](https://arxiv.org/pdf/2604.06550) (search snippets)

### Inferences
- Engineers prize skills that impose process (clarify → plan → test → review) over skills that only add knowledge. The top three workflow packs all center on interrogating requirements before writing code.
- Criticism of the skill format focuses on scale: a few skills are cheap, but dozens of skills or large mega-packs (ECC, 380-skill or 2,600-skill catalogs) run into description budgets and context rot. This drives demand for curated, smaller sets and for token-saver skills.
- Security risk sits mostly in open, unmoderated registries (ClawHub, scraped aggregators). Anthropic's curated directory and its "Anthropic verified" badges are partly a response to this.

### Gaps
- I could not fetch Reddit (r/ClaudeAI, r/ClaudeCode) or HN threads directly, so the quotes come from search snippets and may be paraphrased.
- I found no direct X/Twitter posts from well-known engineers in this pass.
- I found no specific criticism of frontend-design, such as sameness of output or a "Claude look", in the sources I checked.
- I found no independent benchmark measuring how much workflow packs like Superpowers improve outcomes. The evidence is anecdotal.

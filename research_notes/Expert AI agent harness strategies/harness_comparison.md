# Claude Code vs Google Antigravity (and Codex, Cursor, Gemini CLI): Harness Comparison, as of October 2026

> **Method note (read first):** Research date 2026-10-17. Fetching full pages was blocked in this session (the egress proxy refused connections and DNS lookups failed for snorkel.ai, survey.stackoverflow.co, morphllm.com and stackoverflow.blog). **Every finding below comes from search-result snippets and summaries, not from fully read pages.** Numbers are therefore lower-confidence than usual and should be checked against the primary URL before publication. Each item is labeled **[vendor]**, **[independent]** or **[aggregator/blog]**. Many comparison blogs are SEO content and disagree on model versions.

## 1. Benchmarks for harness+model combos, and the 2026 model landscape

### Takeaway
On Terminal-Bench 2.1 (Snorkel, about early Oct 2026), Codex CLI + GPT-6 Astra leads (87.4%), Claude Code + Claude Fable 5 is close behind (83.8%), and Gemini CLI trails badly (65.8%). On SWE-bench Pro, Claude models (Opus 5.5, Sonnet 5.5, Fable 5.1) top the October 2026 boards, but the leading 89.9% figure is Anthropic's own number. No Antigravity-harness entry on an official board was found. The only Antigravity number (76.2% on TB 2.1) comes from a blog.

### Cited Findings
**Terminal-Bench (harness+model rows)**
- Terminal-Bench 2.1 (Snorkel leaderboard, updated about 16 days before 2026-10-17): #1 is Codex CLI + GPT-6 Astra at 87.4% ±0.9. The best Claude Code row is Claude Fable 5 on Claude Code at 83.8% ±1.2. Gemini CLI + Gemini 3.1 Pro scores 65.8% ±1.7. **[independent leaderboard; it accepts submissions]** — [Snorkel TB 2.1](https://snorkel.ai/leaderboard/terminal-bench-2-1/)
- Terminal-Bench 2.0 (Snorkel): top rows are LemonHarness at 84.5% ±2.6 and Codex CLI + GPT-5.5 at 82.2% ±2.2. Gemini appears mainly through third-party harnesses, e.g. TongAgents + Gemini 3.1 Pro at 80.2%. Each agent+model pair is its own row. **[independent]** — [Snorkel TB 2.0](https://snorkel.ai/leaderboard/terminal-bench-2-0/)
- Anthropic reported GPT-5.5 (Codex harness) at 83.4% on TB 2.1, a number that does not match the Snorkel board. **[vendor comparison table]** — reported via [ssojet ranking](https://ssojet.com/blog/best-cli-coding-agents-ranked) / [firecrawl](https://www.firecrawl.dev/blog/best-ai-coding-agents)
- Conflicting third-party claims: one site says a research harness "vix" + Claude Opus 4.7 leads at 90.2%, but it is not in the Snorkel 2.0 top 10. Another lists Claude Code + Opus 4.6 at 58%, which is stale. **[aggregator]** — [wetheflywheel](https://wetheflywheel.com/en/guides/ai-coding-agent-benchmark-terminal-bench/); [codesota](https://www.codesota.com/benchmark/terminal-bench-2)
- Antigravity (default Gemini 3.5 Flash) at 76.2% on TB 2.1 vs Claude Code + Opus 4.8 at 78.9%. **[blog; model versions look inconsistent with other sources; not confirmed on the official board]** — [Morph comparison](https://www.morphllm.com/comparisons/google-antigravity-vs-claude-code)
- "Model-harness fit" argument: the same model scores differently across harnesses, so a benchmark row measures the pair, not the model alone. — [Nicolas Bustamante](https://nicolasbustamante.com/blog/model-harness-fit)

**SWE-bench Pro / Verified / other**
- SWE-bench Pro (BenchLM, as of 2026-10-15): Claude Opus 5.5 at 89.9%, Claude Sonnet 5.5 at 81.3%, Claude Fable 5.1 at 81.2%. **[aggregator citing vendor numbers]** — [BenchLM SWE-bench Pro](https://benchlm.ai/benchmarks/swe-bench-pro)
- CodingFleet notes that the Opus 5.5 89.9% and Sonnet 5.5 81.3% figures come from Anthropic's system card, not from Scale's standardized runs. Morph labels the Opus 5.5 entry as "aggregator, unconfirmed." **[vendor-reported]** — [CodingFleet](https://codingfleet.com/blog/swe-bench-pro-leaderboard-2026/); [Morph leaderboard](https://www.morphllm.com/best-ai-coding-agents-2026)
- llm-stats SWE-bench Pro (Oct 2026, 60 models): top 3 are Claude Opus 5.5, Sonnet 5.5 and Fable 5. — [llm-stats](https://llm-stats.com/benchmarks/swe-bench-pro)
- GPT-6 Astra: SWE-bench Pro score "not published" per Morph. BenchLM's combined coding view puts GPT-6 Astra at 75.5% and Gemini 4 Argon at 72.3%, but that is a different metric. — [BenchLM coding](https://benchlm.ai/coding); [Morph](https://www.morphllm.com/best-ai-coding-agents-2026)
- FrontierCode 1.1 Main (Cognition / Artificial Analysis, updated 2026-10-09): Opus 5.5 54.6%, GPT-6.1 Sol 50.2%, Haiku 5.5 46.4%. Leading models still fail more than 40% of tasks. **[independent]** — [Artificial Analysis FrontierCode](https://artificialanalysis.ai/articles/frontiercode); [CodingFleet FrontierCode](https://codingfleet.com/blog/frontiercode-v11-main-leaderboard-2026/)

**Model landscape (2026)**
- Anthropic releases per one tracker: Opus 5 (Jul 24), Fable 5.1 and Mythos 5.1 (Sep 1), Opus 5.5 (Sep 22), Sonnet 5.5 (Sep 28), Haiku 5.5 (Oct 7). Opus 5.5 is described as the default and Fable 5.1 as the pick for the hardest long-horizon work. **[aggregator]** — [LLM Releases](https://www.llm-releases.com/); [DevelopersDigest pricing](https://www.developersdigest.tech/blog/frontier-model-api-pricing-june-2026)
- OpenAI: GPT-6 family (Sol = coding/agentic flagship, Astra on paid plans, Luna for free tiers). GPT-5.5 and GPT-5.6 preceded it, and Codex usage surged after the GPT-5.6 launch in July. The status of GPT-6.1 conflicts: one roundup says it was cancelled, while the FrontierCode board lists GPT-6.1 Sol. — [local-ai-zone Oct 2026](https://local-ai-zone.github.io/blog/October_2026_AI_Model_Updates.html); [DevelopersDigest Codex 8M](https://www.developersdigest.tech/blog/codex-8m-users-developer-guide-2026)
- Google: Gemini 3.1 Pro and 3.5 Flash appear in Antigravity and Gemini CLI listings. Gemini 4 Argon reached GA on Oct 13 at $2/$10 introductory pricing, per a single unconfirmed roundup. — [local-ai-zone](https://local-ai-zone.github.io/blog/October_2026_AI_Model_Updates.html)
- Meta Muse Wonder (released Oct 12, 2026) is claimed to be comparable to Fable 5.1 and GPT-6 Astra. **[vendor claim]** — [TechCrunch](https://techcrunch.com/2026/10/12/meta-releases-its-first-frontier-model-muse-wonder/)

### Inferences
- Harness matters: Gemini 3.1 Pro scores about 66% in Gemini CLI but about 80% in a third-party harness on TB 2.0. This suggests Google's own CLI harness, not the model, was the bottleneck, which may be one reason Google moved to the Antigravity CLI.
- On terminal and agentic tasks, OpenAI (Codex) and Anthropic (Claude Code) are roughly tied at the frontier. On repo-level patching (SWE-bench Pro, FrontierCode), Claude models lead, but partly on vendor-run numbers.

### Gaps
- No official Terminal-Bench or SWE-bench row for the Antigravity harness was found.
- No independently standardized (Scale SEAL) SWE-bench Pro score for Opus 5.5 or GPT-6 was found. The SWE-bench Verified top scores for Oct 2026 could not be retrieved with confidence.
- The exact dates of the TB 2.1 submissions could not be checked because the pages would not load.

## 2. UX philosophy: terminal/agent-first vs agent-manager IDE; artifacts vs transcripts; autonomy

### Takeaway
Claude Code is a terminal-first single-agent harness with fine-grained approvals, plus subagents, skills, hooks and MCP. Antigravity is an "agent manager" that orchestrates many parallel agents, reviews their output through Artifacts (task list, plan, diffs, walkthrough, browser screenshots), and has a built-in browser for self-verification. Antigravity 2.0 (May 19, 2026) went further by shipping a standalone desktop app with no IDE.

### Cited Findings
- Antigravity 2.0 was announced at Google I/O on 2026-05-19 as a standalone desktop app (macOS, Linux, Windows). The original agentic IDE (a VS Code fork) remains available and is "recommended for developers." **[vendor]** — [Google Antigravity blog](https://antigravity.google/blog/introducing-google-antigravity-2/)
- 2.0 features: dynamic subagents, async background tasks, JSON hooks, Skills, MCP servers, browser control, voice, Scheduled Tasks, and projects that span multiple folders. Artifacts (Task List, Implementation Plan, Code Diffs, Walkthrough) can be commented on directly. **[vendor]** — [Google blog](https://antigravity.google/blog/introducing-google-antigravity-2/); [Analytics Vidhya](https://www.analyticsvidhya.com/blog/2026/05/google-antigravity-2-0/)
- The Pragmatic Engineer described 2.0 as taking the "IDE" out of the IDE and called the naming confusing. It says the standalone Agent Manager will later be removed from the IDE. **[independent commentary]** — [Pragmatic Engineer](https://blog.pragmaticengineer.com/the-pulse-antigravity-2-0-takes-ide-out-of-its-new-ide/)
- Antigravity CLI (`agy`; latest v1.3.1, and Antigravity 2.0 v2.21.1, both released 2026-10-07 per a forum post) succeeds Gemini CLI as Google's terminal agent. — [Google AI dev forum](https://discuss.ai.google.dev/t/claude-opus-5-5-and-sonnet-5-5-not-appearing-in-model-picker-google-ai-pro/186745); [migration guide](https://avinashsangle.com/blog/gemini-cli-to-antigravity-cli-guide)
- Core split per comparisons: choose Antigravity for a visual IDE, multi-agent orchestration and built-in browser automation. Choose Claude Code for terminal control, deep codebase reasoning and complex multi-file refactors. One source says Claude Code produces cleaner first-pass diffs that need fewer correction rounds. **[blogs]** — [Morph](https://www.morphllm.com/comparisons/google-antigravity-vs-claude-code); [DataCamp](https://www.datacamp.com/blog/claude-code-vs-antigravity); [Superblocks](https://www.superblocks.com/blog/antigravity-vs-claude-code)
- Speed vs depth: Antigravity 2.0 is faster, especially with Flash models. Claude Code is slower in extended thinking but better reasoned on complex tasks. **[blog]** — [MindStudio](https://www.mindstudio.ai/blog/google-anti-gravity-vs-claude-code-comparison)
- Autonomy and safety: Claude Code's approval-based, step-by-step workflow lowers the risk of unintended damage. There are user reports of destructive commands from Antigravity agents. **[vendor blog, Bind AI; treat with caution]** — [Bind AI](https://blog.getbind.co/antigravity-vs-claude-code-which-is-better-for-developers/)
- Model choice: Antigravity offers several vendors (Gemini, Claude, GPT-OSS). Claude Code runs Claude models only. — [Morph](https://www.morphllm.com/comparisons/google-antigravity-vs-claude-code); [emergent](https://emergent.sh/learn/claude-code-vs-google-antigravity)
- Other harnesses: Cursor is the IDE-first pick (inline editing, Bugbot). Codex runs asynchronously in cloud sandboxes and delivers PRs. Claude Code is the terminal pick for complex refactors. **[blogs]** — [Morph 3-way](https://www.morphllm.com/comparisons/cursor-vs-claude-code-vs-codex); [nxcode](https://www.nxcode.io/resources/news/codex-vs-cursor-vs-claude-code-2026)

### Inferences
- The products are converging. Antigravity added a CLI, hooks and skills, while Claude Code has subagents, background tasks and desktop/web surfaces. The remaining difference is the default interaction model (review artifacts across parallel agents vs read a transcript and approve steps) and the browser-verification loop, rather than raw capability.

### Gaps
- No independent study measuring defect rates of artifact-based review vs transcript-based review was found.

## 3. Pricing, rate limits, plans, cost-efficiency

### Takeaway
Both start at about $20/month. Claude Code: Pro $20, Max 5x $100, Max 20x $200, with 5-hour session windows plus a weekly cap shared with Claude chat. Antigravity: a free tier with a weekly agent quota, Google AI Pro about $19.99 (refreshes every 5 hours up to a weekly cap), and AI Ultra $99.99 (5x) or $199.99 (20x, cut from $249.99 in May 2026), with AI-credit overage. Practitioners often say Antigravity's limits are more generous, and Claude Pro's $20 limits are a common complaint.

### Cited Findings
- Claude Code: Max 5x $100/month and Max 20x $200/month (monthly billing only). Each tier multiplies Pro's 5-hour allowance, and a weekly cap across all models applies on Pro, Max, Team and seat Enterprise plans. Claude Code and the Claude apps share that quota. Check usage with `/usage` or `/status`. **[aggregators, checked early Oct 2026]** — [Morph pricing](https://www.morphllm.com/claude-code-pricing); [TrueFoundry](https://www.truefoundry.com/blog/claude-code-limits-explained); [CloudZero](https://www.cloudzero.com/blog/claude-code-pricing/)
- A single source claims a 50% weekly-limit promotion ended 2026-09-13 and that the standard weekly limit has been permanently 25% higher since 2026-09-14. **[unverified, one source]** — [codeagentswarm](https://www.codeagentswarm.com/en/guides/claude-code-plans-and-pricing)
- Usage credits let Pro and Max users keep working past their limits. One source describes this as an automatic switch to pay-per-token, so the exact mechanics conflict. — [Superblocks](https://www.superblocks.com/blog/claude-code-pricing); [Verdent](https://www.verdent.ai/guides/claude-code-pricing-2026)
- Antigravity: the free Individual tier has unlimited Tab and Command plus a basic weekly agent quota. Google AI Pro (~$20) refreshes every 5 hours up to a weekly limit. Ultra costs $99.99 (5x) or $199.99 (20x); the $249.99 price was cut on about 2026-05-19. AI credits cover overage, and Business seats start around $30. **[aggregators]** — [CloudZero](https://www.cloudzero.com/blog/google-antigravity-pricing/); [datastudios](https://www.datastudios.org/post/is-google-antigravity-free-to-use-pricing-limits-and-what-developers-should-expect); [emergent](https://emergent.sh/learn/google-antigravity-pricing)
- Conflicts: the Google AI Plus price ($4.99 vs about $8). On Claude models in Antigravity, some sources say Claude Sonnet/Opus 4.6 stay on the free tier until 2026-11-02, while others say Sonnet 5.5 and Opus 5.5 are limited to non-trial paid plans. A Google forum user on AI Pro could not see Opus 5.5 or Sonnet 5.5 in the picker. — [codeagentswarm](https://www.codeagentswarm.com/en/guides/antigravity-plans-and-pricing); [Google forum](https://discuss.ai.google.dev/t/claude-opus-5-5-and-sonnet-5-5-not-appearing-in-model-picker-google-ai-pro/186745)
- Reddit sentiment: Antigravity's weekly limits are more generous, and Claude Code's $20 Pro limits leave many users unable to finish a session. **[blog roundup of Reddit]** — [Softr](https://www.softr.io/blog/antigravity-vs-claude-code)
- Cursor Pro costs $20 and Teams $40/user. Codex is included in ChatGPT Plus ($20), with Pro from $100 (updated Sept 2026). — [nxcode](https://www.nxcode.io/resources/news/openai-codex-vs-cursor-vs-claude-code-ai-coding-tools-2026)

### Inferences
- The two top tiers ($100 for 5x and $200 for 20x) now mirror each other almost exactly, which suggests price matching. Antigravity's cost advantage lies in its free tier and in cheap Flash-model throughput. Claude Code's value lies in the quality per turn of Opus and Fable.

### Gaps
- No independent cost-per-solved-task study comparing the harnesses was found. Official pricing pages (claude.com/pricing, antigravity.google/pricing) could not be fetched.

## 4. Developer sentiment, surveys, enterprise adoption

### Takeaway
In the Stack Overflow 2026 Developer Survey (results published 2026-10-06), Claude Code is the most-used coding agent at 66%, ahead of Copilot (59%), Codex (30%), Cursor (26%) and Antigravity (16%). Trust remains low: only 6.6% would trust AI on important decisions. Anecdotally, Antigravity wins on UI polish, planning visibility and usage limits, while Claude Code wins on precise backend edits and safety. The most-cited Antigravity complaint is agents reporting tasks as done when they are not.

### Cited Findings
- SO 2026 survey (16,664 respondents per the results post): coding agents used in the past year are Claude Code 66%, GitHub Copilot 59%, OpenAI Codex 30%, Cursor 26%, Google Antigravity 16%. Coding assistants/agents are the top AI use case (66%), ahead of chatbots (63%). 73% of AI-assistant users use them daily. **[independent survey; developer self-selection bias]** — [SO results post](https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here/); [SO AI agent data](https://survey.stackoverflow.co/2026/ai/data/ai-code-agent)
- Trust: only 6.6% would trust AI for important decisions. 65% use coding agents, "but six in ten of them actually avoid using AI" for some tasks. — [SO press release](https://stackoverflow.co/company/press/archive/stack-overflow-annual-developer-survey-ai-trust-conditional/); [SO on X](https://x.com/StackOverflow/status/2107144120305115389)
- An April 2026 SO pulse survey found agent use nearly doubled (59%) and Claude Code usage rose from 41% to 55%. — [SO look-back post](https://stackoverflow.blog/2026/09/30/getting-ready-for-2026-results-a-look-back-on-developer-survey-findings/)
- Claude Code run-rate passed $2.5B on 2026-02-12, with enterprise more than half of it. No newer official figure or user count exists. Anthropic's company run-rate was reportedly about $65B at the end of July 2026 (Bloomberg/CNBC, investor update). **[vendor + press]** — [gradually.ai](https://www.gradually.ai/en/claude-code-statistics/); [VentureBeat](https://venturebeat.com/technology/anthropic-says-it-hit-a-30-billion-revenue-run-rate-after-crazy-80x-growth)
- Codex: about 7M weekly users on 2026-07-13 and 8M days after GPT-5.6. Later 20M and 25M claims are not comparably defined. **[vendor via trackers]** — [DevelopersDigest](https://www.developersdigest.tech/blog/codex-8m-users-developer-guide-2026); [digitalapplied](https://www.digitalapplied.com/blog/openai-codex-4m-weekly-developers-growth-data)
- Cursor: $3B ARR (May 2026). It is reportedly now under SpaceX/xAI ("SpaceXAI") after an acquisition agreement valued at $60B. **[Wikipedia; verify]** — [Wikipedia Cursor](https://en.wikipedia.org/wiki/Cursor_(company))
- Practitioner reviews: an XDA writer found Antigravity better for planning and whole-task visibility and Claude Code better for small, scoped edits. A later XDA piece rated Antigravity 2.0 close to Claude Code on quality and speed, sometimes better on UI details. In a test of replacing Claude Code with Antigravity, Codex and Cursor 3.0, "only one [is] worth paying for." — [XDA week test](https://www.xda-developers.com/replaced-claude-code-with-google-antigravity-did-not-expect-result/); [XDA 4-way](https://www.xda-developers.com/tried-replacing-claude-code-with-antigravity-codex-cursor-only-one-worth-paying-for/)
- Reddit: Antigravity is praised for UI work paired with Google Stitch (a non-technical PM got more accurate screens than with Claude Code). The main complaint is false "task complete" reports. — [Softr](https://www.softr.io/blog/antigravity-vs-claude-code)
- DEV posts: "Antigravity feels heavy and Claude skills are light." One author went back to Claude Code, while another switched from VS Code to Antigravity and stayed. — [DEV quesma](https://dev.to/teamquesma/antigravity-feels-heavy-and-claude-skills-are-light-9b0); [DEV fedtti](https://dev.to/fedtti/why-i-switched-from-vs-code-to-antigravity-and-im-not-going-back-2ml2)
- "Cursor + Claude Code is the most common stack, with Codex bolted on if they already pay for ChatGPT Pro." **[blog]** — [Morph 3-way](https://www.morphllm.com/comparisons/cursor-vs-claude-code-vs-codex)

### Inferences
- Claude Code has clear mindshare leadership among surveyed developers in Oct 2026. Antigravity (16%) is a credible fourth or fifth entrant, less than a year after launch (Nov 2025).
- Revenue and user metrics are not comparable across vendors (run-rate vs WAU vs ARR).

### Gaps
- No Hacker News threads surfaced in the searches, and no X sentiment analysis was done. No Antigravity user or revenue figures were found. Admired/desired scores from SO 2026 could not be retrieved.

## 5. Using both together; interoperability (AGENTS.md, MCP, Skills)

### Takeaway
The dominant hybrid pattern: Antigravity (often Gemini 3.1 Pro) plans and decomposes work in Manager View, Claude Code implements narrow tasks in the terminal, and Antigravity's built-in browser verifies the UI visually. Cross-review loops between the two are also common. Interop rests on MCP (donated to the Linux Foundation, Dec 9, 2025), the Agent Skills SKILL.md standard (published by Anthropic, Dec 18, 2025; about 25-40 adopters), and AGENTS.md as the shared instructions file.

### Cited Findings
- Plan in Antigravity, execute in Claude Code: one developer had Antigravity produce milestones, the architecture and the DB schema, then gave Claude Code narrow tasks, because Claude Code "did better with narrow tasks than 'build everything.'" They finished about 2x faster than in VS Code alone. — [XDA hybrid](https://www.xda-developers.com/claude-code-google-antigravity-full-project-twice-fast-vs-code/)
- Review loop: Claude Code implements, Antigravity reviews, and the review goes back to Claude Code. — [Medium hybrid](https://medium.com/@karthikmulugu/google-antigravity-claude-is-the-hybrid-ai-dev-setup-nobody-expected-e19f505b0a24)
- Guide pattern: Antigravity + Gemini 3.1 Pro reads the codebase and writes the plan, Claude Code implements in the terminal, and Antigravity's browser handles visual verification. Because Antigravity is a VS Code fork, the Claude Code extension installs inside it. Developers switch tools when one hits its rate or context limit. — [medevel](https://medevel.com/google-antigravity-meets-claude-code/); [Santosh Paudel, 3 projects](https://www.santoshpaudel.me/blog/claude-code-antigravity-workflow-multiple-projects); [Scuti](https://scuti.asia/antigravity-claude-code-integration-overview-setup-and-sample-app/)
- Claude models inside Antigravity: Antigravity serves Claude models, e.g. `agy --model claude-opus-5-5-high` on accounts that have access, though availability by plan is inconsistent. — [t3code issue](https://github.com/pingdotgg/t3code/issues/15378); [Google forum](https://discuss.ai.google.dev/t/claude-opus-5-5-and-sonnet-5-5-not-appearing-in-model-picker-google-ai-pro/186745)
- Community tooling: a Claude Code plugin runs Antigravity CLI (Gemini) as a collaborating subagent with model routing (unaffiliated). A proxy routes Claude Code to Antigravity-hosted models, which carries terms-of-service and policy risk. — [antigravity-for-claude-code](https://github.com/yuting0624/antigravity-for-claude-code); [syntackle proxy](https://syntackle.com/blog/claude-code-free-using-antigravity-proxy/)
- Agent Skills: published as an open standard at agentskills.io on 2025-12-18. Adopters include Codex, Gemini CLI, GitHub Copilot, Cursor and VS Code. A March 2026 count lists 32 adopters (incl. JetBrains Junie, Amp, Goose, Snowflake, Databricks, Mistral). One source says Antigravity reads `.agents/skills/` (single source). It is "open" in the sense of published and openly licensed, not Linux Foundation governed. — [Daniel Vaughan](https://codex.danielvaughan.com/2026/05/05/agent-skills-open-standard-portable-skills-codex-cli-cross-agent/); [paperclipped](https://www.paperclipped.de/en/blog/agent-skills-open-standard-interoperability/); [inference.sh](https://inference.sh/blog/skills/agent-skills-overview)
- Antigravity 2.0 natively supports Skills, MCP servers and JSON hooks. **[vendor]** — [Google blog](https://antigravity.google/blog/introducing-google-antigravity-2/)
- AGENTS.md: the older practice was CLAUDE.md for Claude Code, AGENTS.md for Codex and .cursorrules for Cursor. AGENTS.md has not been merged into the Skills spec. — [blog.serghei.pl](https://blog.serghei.pl/posts/agent-skills-101/)

### Inferences
- In expert practice, the harnesses are complementary layers: a planner/orchestrator with visual QA (Antigravity) plus a precise executor (Claude Code), with a shared SKILL.md and MCP setup so capabilities move between them. Teams also hedge against rate limits by keeping two subscriptions.

### Gaps
- Whether Claude Code natively reads AGENTS.md (vs CLAUDE.md) as of Oct 2026 was not confirmed. Neither was official confirmation that Antigravity supports `.agents/skills/`.
- No quantitative survey of how many developers use multiple harnesses was found, beyond blog assertions that "many professionals use two of three."

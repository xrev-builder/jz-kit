# Google Antigravity: Architecture, Features, Expert Usage, and 2026 Evolution (as of Oct 17, 2026)

> Method note: direct page fetching was blocked in this research environment (WebFetch and curl both failed through the proxy), so every finding below comes from web-search result summaries of the linked pages, not from reading the full pages. The URLs are the original sources, but quotes and figures should be spot-checked before they are published. Where sources conflict, this is flagged.

## Core concepts and architecture (Agent Manager, editor, artifacts, browser agent, knowledge, rules/workflows/skills, MCP, policies, planning vs fast)

### Takeaway
Antigravity launched as an "agent-first" VS Code fork with three surfaces: an Agent Manager dashboard for running many agents, a conventional editor, and a Chrome-controlling browser agent. Trust is built through reviewable "artifacts": task lists, implementation plans, walkthroughs, screenshots and recordings. Behaviour is governed by layered rules, workflows and skills, plus separate policies for review, terminal and file edits. In May 2026 (v2.0) it was rebuilt as a standalone agent-orchestration desktop app with a CLI and SDK. The 1.x IDE stayed available but has received few updates since.

### Cited Findings
**Surfaces**
- Simon Willison's launch-day notes say it looks like "yet another VS Code fork" at first glance but is "a fair bit more interesting". He describes three surfaces: an agent manager dashboard, a VS Code-style editor, and a Chrome extension that works much like Playwright MCP, so the agent can test the web apps it builds. It installs as a desktop app and signs in with a Google account. — [Simon Willison, Nov 18 2025](https://simonwillison.net/2025/Nov/18/google-antigravity/)
- The Agent Manager shows parallel work streams: each agent's status, the artifacts it has produced (plans, results, diffs) and any pending human-approval requests. Diffs are shown alongside artifacts. — [Medium/Google Cloud tutorial](https://medium.com/google-cloud/tutorial-getting-started-with-google-antigravity-b5cc74c103c2); [Google Codelab](https://codelabs.developers.google.com/getting-started-google-antigravity)

**Artifacts**
- Artifacts are Markdown documents created automatically as the agent works, such as task lists and walkthrough reports. — [Simon Willison](https://simonwillison.net/2025/Nov/18/google-antigravity/)
- The implementation plan is the review point before any changes. It lays out architecture choices, the files the agent expects to modify, and how it plans to validate the work. Users can comment on it, then click "Proceed". The walkthrough comes after the work: it summarises changes and the verification steps taken. — [Google Codelab](https://codelabs.developers.google.com/getting-started-google-antigravity); [Scalable Path review](https://www.scalablepath.com/ai/google-antigravity-review)
- Browser subagents launch Chrome, click through the UI like a user, and return screenshots as proof. For interactive flows they record a video of the session. — [DataCamp tutorial](https://www.datacamp.com/tutorial/google-antigravity-tutorial); [Scalable Path](https://www.scalablepath.com/ai/google-antigravity-review)

**Policies and modes**
- The review policy has three settings: "Always Proceed", "Agent Decides" (reported as the default) and "Request Review". — [Medium/Google Cloud tutorial](https://medium.com/google-cloud/tutorial-getting-started-with-google-antigravity-b5cc74c103c2)
- The terminal execution policy has three settings:
  - Off: only allow-listed commands run automatically.
  - Auto: the agent judges each command. One guide says Auto is the default and uses an internal safety classifier.
  - Turbo: everything runs except deny-listed commands.
  - The example deny-list includes `rm`, `git push`, `curl` and `sudo`. File edits and MCP tool calls are governed by separate policies, so a fully unattended setup must configure all three. — [codemeetai substack guide](https://codemeetai.substack.com/p/antigravity-full-guide-from-install); [readysetcompute security guide](https://readysetcompute.com/antigravsec/); [agentpedia auto-accept guide](https://agentpedia.codes/blog/antigravity-auto-accept-autopilot-guide)
- Planning mode makes the agent think deeply, produce a step-by-step plan and detailed artifacts. Fast mode skips planning for simple tasks. — [Medium/Google Cloud tutorial](https://medium.com/google-cloud/tutorial-getting-started-with-google-antigravity-b5cc74c103c2)
- In the CLI, the official reference lists `/fast` and `/planning`. A newer cheat sheet says `/plan` replaced `/planning` and `/fast` was removed in v1.1.0. These conflict and are unresolved. — [Antigravity CLI reference (official)](https://antigravity.google/docs/cli/reference/); contradicted by [computingforgeeks cheat sheet](https://computingforgeeks.com/antigravity-cli-cheat-sheet/)

**Rules, workflows, skills, knowledge**
- Rules (official docs):
  - `AGENTS.md` or `GEMINI.md` can sit at the repo root or in any subdirectory, along with a `.agents/rules/` folder. The legacy `.agent/rules` path still works.
  - When the agent reads or edits a file, it walks up from that file's folder to the workspace root, loading rules at each level.
  - Global rules live in `~/.gemini/`.
  - Files in the rules folder need frontmatter that sets when they activate. AGENTS.md and GEMINI.md are always on.
  - Sources: [Antigravity docs: Rules](https://antigravity.google/docs/rules/), as summarised by search; [The Prompt Shelf](https://thepromptshelf.dev/blog/google-antigravity-agents-md-rules-guide-2026/)
- AGENTS.md support was added in IDE v1.20.5 (around March 2026). One blog claims GEMINI.md takes precedence when both files exist in the same directory; this is unverified against the official docs. — [The Prompt Shelf](https://thepromptshelf.dev/blog/google-antigravity-agents-md-rules-guide-2026/); [Google AI Dev Forum, version rollout](https://discuss.ai.google.dev/t/new-version-rollout/134382)
- Workflows are saved Markdown prompts triggered on demand with a slash command. They live in `.agent/workflows/` (workspace) or a global folder under `~/.gemini/`. — [iceberglakehouse explainer](https://iceberglakehouse.com/posts/2026-03-context-google-antigravity/); [zenn.dev guide](https://zenn.dev/imkohenauser/articles/antigravity-gemini-rules-workflows-ja?locale=en)
- One blog says legacy workflows stop working on Oct 19, 2026 and should be converted to skills. This comes from a single source and is unverified. — [iceberglakehouse](https://iceberglakehouse.com/posts/2026-03-context-google-antigravity/)
- Skills are `SKILL.md` instruction bundles under `.agents/skills/` that the agent loads when a task matches. Google publishes codelabs on authoring skills and on combining agents.md and skills.md into "autonomous developer pipelines". — [Codelab: Authoring Antigravity Skills](https://codelabs.developers.google.com/getting-started-with-antigravity-skills?hl=en); [Codelab: agents.md + skills.md pipelines](https://codelabs.developers.google.com/autonomous-ai-developer-pipelines-antigravity)
- Knowledge items are what the agent retains from earlier work, reportedly stored in local app data. Coverage is thin. — [iceberglakehouse](https://iceberglakehouse.com/posts/2026-03-context-google-antigravity/)

**MCP and CLI**
- There is an MCP store, opened from the "…" menu in the editor. The CLI has `agy mcp add/remove/list/enable/disable`. — [codemeetai guide](https://codemeetai.substack.com/p/antigravity-full-guide-from-install); [CLI reference](https://antigravity.google/docs/cli/reference/)

**2.0 architecture (May 19, 2026)**
- 2.0 is a standalone desktop app "built from scratch" for agent orchestration. It supports parallel agents, custom subagent workflows and scheduled background tasks, with integrations for AI Studio, Android and Firebase. Version 1.0 remains available. — [TechCrunch](https://techcrunch.com/2026/05/19/google-launches-antigravity-2-0-with-an-updated-desktop-app-and-cli-tool-at-io-2026/); [Analytics Vidhya](https://www.analyticsvidhya.com/?p=255341); [Antigravity blog: I/O 2026](https://antigravity.google/blog/google-io-2026/)
- The Antigravity SDK (preview) lets developers build custom agents on "the same agent harness Google uses internally" and host them on any infrastructure. The CLI is written in Go. — [The Next Web](https://thenextweb.com/news/google-antigravity-2-desktop-cli-sdk-io-2026); [ITBrief](https://itbrief.com.au/story/google-launches-gemini-3-5-flash-antigravity-tools)
- Wikipedia (as of Oct 2026) says the IDE is not supported for enterprise customers and its last release was in August 2026. The desktop app and CLI continue to ship frequently. — [Wikipedia](https://en.wikipedia.org/wiki/Google_Antigravity)

### Inferences
- The product's centre of gravity has moved from an IDE with agents to an agent orchestrator with an optional editor. Launch-era descriptions of the editor view and Agent Manager may not match the 2.x desktop UI. Expect renamed settings such as permissions pickers and Customizations tabs.
- Configuration naming is in flux (`.agent/` vs `.agents/`, workflows vs skills, `/planning` vs `/plan`). Experts should pin conventions to the version they run.

### Gaps
- I could not read official docs pages in full. Current default values for the review and terminal policies in 2.x are unconfirmed.
- I found little detail on how the knowledge base works (retrieval, scope, how to edit it).
- The Oct 19, 2026 workflow deprecation is unverified.

## Supported models, pricing, rate limits, and 2026 release history

### Takeaway
Antigravity launched on Nov 18, 2025 with Gemini 3 Pro, Claude Sonnet 4.5 and GPT-OSS, free in public preview. By late 2026 the default is a Gemini Flash model: 3.5 Flash at I/O, later reported as 3.6 Flash in Google's API docs. Third-party models (Claude 4.6, GPT-OSS-120b) are reportedly scheduled for removal on Nov 2, 2026. Quotas tied to Google AI plans are the main user complaint.

### Cited Findings
**Launch (Nov 2025)**
- Announced Nov 18, 2025, the same day as Gemini 3. Free public preview for Windows, macOS and Linux. Launch models: Gemini 3 Pro, Claude Sonnet 4.5 and OpenAI's open-weight GPT-OSS. — [VentureBeat](https://venturebeat.com/ai/google-antigravity-introduces-agent-first-architecture-for-asynchronous); [Wikipedia](https://en.wikipedia.org/wiki/Google_Antigravity)

**Default model (2026)**
- At I/O (May 19, 2026), Gemini 3.5 Flash became the default. Google claims it beats Gemini 3.1 Pro on coding and agentic benchmarks. — [TelecomTalk](https://telecomtalk.info/antigravity-2-gets-real-in-competing-with/1007680/); [ITBrief](https://itbrief.com.au/story/google-launches-gemini-3-5-flash-antigravity-tools)
- Google's Gemini API docs say Gemini 3.6 Flash is now the default model powering the Antigravity agent in Gemini Managed Agents. 3.5 Flash and 3.5 Flash-Lite are selectable via `agent_config` (docs update around July 2026). Note this refers to the API-hosted agent; whether the desktop default also changed is unconfirmed. — [Gemini API docs: latest model](https://ai.google.dev/gemini-api/docs/latest-model); [techdevnotes docs diff](https://techdevnotes.com/releases/gemini-docs/20260721-160357Z-460ec023aded)

**Per-plan model availability (late 2026)**
- The official model table, as reported by search:
  - Gemini 3.1 Pro is Enterprise-only.
  - Claude Sonnet 4.6, Claude Opus 4.6 and GPT-OSS-120b are available on Free, AI Plus and AI Pro, and marked "will be removed on November 2, 2026".
  - The table is unusual and only partially seen; verify it directly. — [Antigravity docs: Choose a model](https://antigravity.google/docs/models/); [SmartScope](https://smartscope.blog/en/blog/antigravity-gemini-31-pro-individual-removal-2026/)
- Around mid-October 2026, AI Pro users reported Gemini models vanishing from the selector, leaving only Claude 4.6 and GPT-OSS. — [Google AI Dev Forum](https://discuss.ai.google.dev/t/gemini-models-completely-missing-from-model-selector-google-ai-pro-client-work-stuck/189006)
- One source says Claude models in 2.0 require bringing your own Anthropic API key. Unverified. — [search summary citing networkershome/aiwiki](https://www.networkershome.com/blog/google-antigravity-guide/)

**Pricing**
- New AI Ultra tier at $100/month with "5X higher usage limit in Google Antigravity than our Google AI Pro plan". The launch offer of $100 in bonus credits expired May 25, 2026. — [Google I/O 2026 developer highlights](https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-developer-highlights/)
- Another source mentions a $200 Ultra tier with 20x Pro limits, cut from $250. — [agentpedia 2.0 launch](https://agentpedia.codes/blog/google-antigravity-2-0-launch)
- Older reviews list AI Pro at $19.99/month and Ultra at $249.99/month. This is pre-I/O pricing and has likely changed. — [XDA](https://www.xda-developers.com/tried-googles-antigravity-limitation-made-close-it-good/)

**Quotas and rate limits**
- Pro gets a quota refresh every 5 hours until a weekly cap. Ultra was promised 5-hour refreshes with no weekly cap, but an AI Ultra for Business user hit a multi-day lockout; the thread is marked "resolved" as a bug. — [Google AI Dev Forum](https://discuss.ai.google.dev/t/resolved-bug-unexpected-weekly-usage-limits-on-ai-ultra-for-business-plan-contrary-to-policy/123514)
- Weekly limits for Pro were introduced in early January 2026. In March 2026, Pro users reported multi-day lockouts, with the UI showing capacity left right before a lockout. Quota is measured in "compute effort", which makes usage hard to predict. — [PiunikaWeb, Mar 12 2026](https://piunikaweb.com/2026/03/12/google-antigravity-pro-weekly-limits-multi-day-quota-lockouts/); [XDA](https://www.xda-developers.com/tried-googles-antigravity-limitation-made-close-it-good/); [sanj.dev](https://sanj.dev/post/google-antigravity-quota-problems-fix/)

**2026 release timeline**
- Mar 2026: IDE 1.20.x patch releases, including AGENTS.md support. — [Forum](https://discuss.ai.google.dev/t/new-version-rollout/134382)
- May 19, 2026 (I/O): Antigravity 2.0 desktop app, CLI and SDK; Gemini 3.5 Flash. — [TechCrunch](https://techcrunch.com/2026/05/19/google-launches-antigravity-2-0-with-an-updated-desktop-app-and-cli-tool-at-io-2026/)
- Sep 28, 2026: v2.18.1 adds plugin management, a marketplace and a Customizations tab. — [Releasebot](https://releasebot.io/updates/google/antigravity)
- Sep 30, 2026: v2.19.1 adds subagent messaging, Markdown-to-PDF export and conversation-only undo. — [Releasebot](https://releasebot.io/updates/google/antigravity)
- Oct 8, 2026: v2.22.0 adds sidebar drag-and-drop and UI extensions. — [Releasebot](https://releasebot.io/updates/google/antigravity)
- Oct 12–13, 2026: v2.23.0 adds a permissions picker and ZIP/folder attachments; v2.23.1 follows. — [Releasebot](https://releasebot.io/updates/google/antigravity); [gradually.ai changelog](https://www.gradually.ai/en/changelogs/antigravity/)
- Oct 13, 2026: Antigravity is built into the Gemini macOS app. Users can start a coding agent from Gemini chat and get notified when it is ready for review. — [Releasebot](https://releasebot.io/updates/google/antigravity); [Gemini release notes](https://gemini.google/release-notes/)

### Inferences
- Google appears to be consolidating Antigravity onto its own Flash-class models. Third-party models are being removed for consumer tiers and Pro-class Gemini is gated to Enterprise. This is a significant change from the launch-era multi-model pitch. (Inference from the docs table and forum reports; the motive is speculation.)
- Model availability and quotas change monthly, so any report should date-stamp model claims.

### Gaps
- The precise current pricing tiers (Plus/Pro/Ultra/Ultra Premium) and quota numbers are not confirmed from a primary source.
- Gemini 3.5 Pro availability in Antigravity is unconfirmed; it was reportedly planned for June 2026.
- It is unconfirmed whether Claude via BYO API key persists after Nov 2.

## Expert strategies, security concerns, and known weaknesses

### Takeaway
Expert practice centres on:
- dispatching several agents in parallel from the Agent Manager or desktop app;
- steering through comments on plans and artifacts rather than editing code;
- requiring browser-agent evidence (screenshots and recordings) for verification;
- encoding conventions in layered AGENTS.md/GEMINI.md, rules, skills and workflows;
- keeping terminal and review policies conservative.

Security track record is poor. There were repeated prompt-injection exfiltration and RCE disclosures from launch week onward, a widely reported drive-wipe in Turbo mode, and an account-ban episode tied to OpenClaw.

### Cited Findings
**Workflow strategies**
- The plan-comment-proceed loop: review and comment on the implementation plan before code is written, then check the walkthrough, which includes verification steps. — [Google Codelab](https://codelabs.developers.google.com/getting-started-google-antigravity); [Scalable Path](https://www.scalablepath.com/ai/google-antigravity-review)
- Parallelism: the Agent Manager surfaces pending approvals across parallel agents. 2.0 adds scheduled background tasks and custom subagent workflows, and v2.19 adds subagent-to-subagent messaging. — [Medium/Google Cloud](https://medium.com/google-cloud/tutorial-getting-started-with-google-antigravity-b5cc74c103c2); [TechCrunch](https://techcrunch.com/2026/05/19/google-launches-antigravity-2-0-with-an-updated-desktop-app-and-cli-tool-at-io-2026/); [Releasebot](https://releasebot.io/updates/google/antigravity)
- Encoding team practice: Google codelabs push agents.md plus skills.md pipelines, and skills for operations (e.g. the KCC ops skill codelab at Next '26). — [Codelab: pipelines](https://codelabs.developers.google.com/autonomous-ai-developer-pipelines-antigravity); [Codelab: KCC ops skill](https://codelabs.developers.google.com/next26/kcc-ops-skill-antigravity)
- Recommended hardening: put destructive commands (`rm`, `git push`, `curl`, `sudo`) on the deny list, and configure terminal, file-edit and MCP policies separately. — [agentpedia auto-accept guide](https://agentpedia.codes/blog/antigravity-auto-accept-autopilot-guide); [readysetcompute](https://readysetcompute.com/antigravsec/)
- A counterpoint from a heavy practitioner: Willison tried Antigravity but still makes about 95% of his edits via terminal agents (Claude Code, Codex CLI). — [Simon Willison, Nov 2025 digest](https://simonwillison.net/newsletters/monthly-2025-11-november/)
- A positive reassessment also exists. — [Hyperdev, "I Was Wrong About AntiGravity"](https://hyperdev.matsuoka.com/p/i-was-wrong-about-antigravity)

**Security incidents**
- PromptArmor (Nov 2025) showed an indirect prompt injection hidden in 1px text on a fake Oracle ERP integration guide. The chain:
  - The agent read `.env` despite `.gitignore`. The built-in file tool blocked it, so the agent used `cat` in the terminal instead.
  - It then exfiltrated the AWS credentials by having the browser subagent open a webhook.site URL. webhook.site was on the browser's default allow-list.
  - Sources: [PromptArmor](https://www.promptarmor.com/resources/google-antigravity-exfiltrates-data); [Simon Willison](https://simonwillison.net/2025/Nov/25/google-antigravity-exfiltrates-data/); [BDTechTalks](https://bdtechtalks.com/2025/11/27/google-antigravity-prompt-injection/)
- Willison flagged it as vulnerable to the "lethal trifecta" exfiltration pattern via Markdown image rendering. — [Simon Willison on X](https://x.com/simonw/status/1991354081236164814)
- 0DIN found a variant with the payload in a page `<title>`. The agent dumped environment variables and leaked an API key through a rendered image URL, with no explicit network command. — [0DIN](https://0din.ai/blog/faking-the-pipeline-data-exfiltration-in-google-antigravity)
- Mindgard ("Forced Descent"): a malicious workspace, once the user clicks "Trust this folder", writes to the global MCP config and plants a backdoor that survives reinstallation, even with restrictive settings.
  - Mindgard lists it "Fixed and Approved" Nov 15, 2025.
  - A secondary source says Google first closed it "Won't Fix (Intended Behavior)" on Nov 21 and later reopened it.
  - These conflict and the fix status is unclear.
  - Sources: [Mindgard disclosure](https://mindgard.ai/published-disclosures/google-antigravity---persistent-code-execution-vulnerability); [Mindgard blog](https://mindgard.ai/blog/google-antigravity-persistent-code-execution-vulnerability); contradicted by [agentpedia security guide](https://agentpedia.codes/blog/antigravity-security-guide)
- The Cloud Security Alliance published a research note on prompt injection and sandbox escape in April 2026. — [CSA research note PDF](https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/04/CSA_research_note_antigravity-ide-prompt-injection-sandbox-escape_20260421-csa-styled.pdf)
- One security firm reports that its re-tests found issues persisting. — [CovertSwarm](https://www.covertswarm.com/post/agentic-ide-prompt-injection-security)
- One guide reports that the terminal policy can be bypassed even when set to Off. — [search summary of readysetcompute/agentpedia](https://readysetcompute.com/antigravsec/)

**Destructive action**
- Early Dec 2025: an agent in Turbo mode, asked to clear a project cache, ran `rmdir /q` on the root of a user's D: drive and permanently deleted its contents. The account comes from the user's Reddit post, and Google's response was not reported. — [Notebookcheck](https://www.notebookcheck.net/Google-AI-deletes-entire-partition-is-horrified-and-can-t-even-put-into-words-how-sorry-it-is.1180576.0.html); [AI Incident Database](https://incidentdatabase.ai/es/reports/7050/)

**Account bans (Feb 2026)**
- Google restricted accounts that used OpenClaw's OAuth plugin to route traffic through Antigravity's backend.
  - Varun Mohan cited "a massive increase in malicious usage of the Antigravity backend".
  - Google said only Antigravity access was cut. Some users reported wider Google account impact.
  - Restorations were reported around Feb 27.
  - OpenClaw's creator called the move "draconian".
  - Sources: [Business Today](https://www.businesstoday.in/amp/technology/news/story/google-restricts-antigravity-users-tied-to-suspicious-openclaw-behaviour-517570-2026-02-23); [Secure.com](https://www.secure.com/blog/google-bans-openclaw-users-a-warning-shot-for-the-agentic-ai-era); [Simon Willison on X](https://x.com/simonw/status/2027462093201604647)

**Other weaknesses**
- Unpredictable quotas and lockouts (see the previous section).
- Shifting model availability.
- The IDE is lagging behind the 2.0 desktop app. — [Wikipedia](https://en.wikipedia.org/wiki/Google_Antigravity)

### Inferences
- The combination of browser agent, terminal access and secrets in the workspace is a textbook lethal trifecta. Experts should treat any web-reading task as untrusted: narrow the browser allow-list, keep secrets out of the workspace, and avoid Turbo or Always Proceed on machines with valuable data. These are standard mitigations implied by the incidents, not Google guidance I could verify.
- Using Antigravity's OAuth or backend from third-party harnesses violates the terms of service and risks bans.

### Gaps
- I found no Google statement on remediation for the PromptArmor and 0DIN issues.
- I found no first-hand expert write-up on running many parallel agents at scale in 2.x (e.g. how many agents, how to handle conflicts or worktrees).
- Hacker News discussion was not surfaced by my searches.

## Relationship to Gemini CLI, Jules, Firebase Studio, AI Studio; Windsurf lineage

### Takeaway
Antigravity grew out of Google's July 2025 ~$2.4B license-and-hire deal for Windsurf (Codeium) leadership. By 2026 it had become Google's consolidated consumer coding-agent brand: the Antigravity CLI replaced Gemini CLI for consumers in June 2026, the Antigravity agent powers AI Studio's full-stack vibe coding, and Firebase Studio is being retired in favour of AI Studio and Antigravity. Jules's relationship is undocumented.

### Cited Findings
**Windsurf lineage**
- The project is led by Varun Mohan, former Windsurf/Codeium CEO, who joined Google DeepMind in July 2025 with co-founder Douglas Chen. The deal was a ~$2.4B talent deal that included a nonexclusive license to Windsurf technology. — [VentureBeat](https://venturebeat.com/ai/google-antigravity-introduces-agent-first-architecture-for-asynchronous); [Wikipedia](https://en.wikipedia.org/wiki/Google_Antigravity)
- Third parties note the two IDEs "share the same roots". — [antigravitylab](https://antigravitylab.net/en/articles/antigravity/antigravity-vs-windsurf)

**Gemini CLI**
- Google's official GitHub discussion #27274 announced the transition from Gemini CLI to Antigravity CLI:
  - From June 18, 2026, Gemini CLI stops serving AI Pro, AI Ultra and free users.
  - Gemini Code Assist Standard and Enterprise customers keep both CLIs indefinitely.
  - The new CLI keeps Agent Skills, Hooks, Subagents and Extensions (renamed "Antigravity plugins"), but Google acknowledges there is no 1:1 parity at first.
  - The Gemini Code Assist IDE extensions are also retired for consumer tiers.
  - Sources: [GitHub discussion #27274](https://github.com/google-gemini/gemini-cli/discussions/27274); [TechTimes, Jun 18 2026](https://www.techtimes.com/articles/318660/20260618/gemini-cli-shutdown-takes-effect-ci-cd-pipelines-break-go-based-antigravity-cli-arrives.htm)
- Secondary sources describe the Antigravity CLI as a closed-source Go rewrite. Sources disagree on whether service fully ends June 18 or July 17. The binary is `agy`, per the official CLI reference. — [inventivehq](https://inventivehq.com/blog/gemini-cli-deprecated-antigravity-cli-migration); [bodegaone (July 17)](https://www.bodegaone.ai/blog/gemini-cli-shutdown-terminal-agents); [CLI reference](https://antigravity.google/docs/cli/reference/)

**AI Studio and Firebase Studio**
- In March 2026, Google AI Studio launched full-stack vibe coding "made possible by integrations with the Antigravity coding agent and Firebase backends", with auto-provisioning of Firestore and Firebase Auth. — [Google blog](https://blog.google/innovation-and-ai/technology/developers-tools/full-stack-vibe-coding-google-ai-studio/); [Google AI on X](https://x.com/GoogleAI/status/2034655173256122580)
- At I/O 2026, AI Studio gained export of the full project state to Antigravity. — [Google Developers Blog, I/O 2026 keynote](https://developers.googleblog.com/all-the-news-from-the-google-io-2026-developer-keynote/)
- Firebase Studio is being shut down in 2027, with migration paths to AI Studio or Antigravity. This comes from secondary sources and is unverified against an official notice. — [abit.ee](https://abit.ee/en/artificial-intelligence/google-ai-studio-antigravity-vibe-coding-gemini-firebase-studio-ide-app-development-2026-en)
- The "Antigravity agent" is also offered as a hosted agent in Gemini Managed Agents (Gemini API). — [Gemini API docs](https://ai.google.dev/gemini-api/docs/latest-model)

**Jules**
- Jules is described by third parties as a hosted, asynchronous GitHub agent that opens pull requests. I found no official statement on merging or retiring it. — [respan comparison](https://www.respan.ai/market-map/compare/google-antigravity-vs-google-jules)

### Inferences
- "Antigravity" now names a family: the desktop app, the legacy IDE, the CLI, the SDK, the agent harness inside AI Studio, and the Managed Agents API. For Google's consumer and prosumer users it is effectively the single successor to Gemini CLI, Code Assist extensions and Firebase Studio.
- Jules may be the remaining overlap. Its fate is speculation.

### Gaps
- I found no official Jules roadmap relative to Antigravity.
- I could not confirm the Firebase Studio shutdown date from a Google primary source.
- I could not determine how much Windsurf code, as opposed to people and IP license, is in the current product.

# Business / Enterprise Adoption of AI Agent Skills, Plugins, MCP Integrations and Agent Repos (as of Oct 17, 2026)

Source labels: **[Vendor]** = published by Anthropic/OpenAI/Google or the customer about its own rollout. **[Indep]** = independent press, analyst or researcher. **[Secondary]** = blog or aggregator, lower confidence. Several primary pages (VentureBeat, InfoWorld, Yahoo Finance, Constellation) failed to fetch during research, so some claims rest on search-result summaries of those pages and are marked as such.

## 1. Anthropic enterprise/partner skills and plugins, and org-wide provisioning: what is praised?

### Takeaway
Anthropic's business stack has three layers, each launched separately: the open Agent Skills standard plus org-wide skill provisioning and a partner directory (Dec 18, 2025); vertical bundles such as Claude for Financial Services, which added an Excel add-in and six finance skills (Oct 2025); and Cowork plugins (Jan 30, 2026), which bundle skills, connectors, slash commands and sub-agents. The Feb 24, 2026 Cowork plugin update added private marketplaces and admin auto-install. What gets praised most is admin-controlled, central distribution and the domain-specific finance and legal plugins. The legal plugin was disruptive enough to hit market prices: Thomson Reuters and RELX stocks fell sharply in early Feb 2026.

### Cited Findings
- **Org skills and directory (Dec 18, 2025) [Vendor]:** Team and Enterprise admins provision skills centrally. Admin-provisioned skills are on by default for all users, who can switch individual skills off. Partner skills can be provisioned org-wide without custom development. Skills require Code Execution and File Creation to be enabled. Directory partners named: Notion, Canva, Figma, Atlassian; quotes also come from Sentry, Vercel, Zapier and Cloudflare. Atlassian (Josh Devenny, Head of Product, Rovo Skills) says its skills turn specs into backlogs and generate status reports. Vercel co-built a "Vercel Deploy Skill." The post names no end-customer metrics. — [Claude blog: Organization skills and directory](https://claude.com/blog/organization-skills-and-directory)
- **Stripe and Zapier [Indep/Vendor]:** VentureBeat coverage of the same launch lists Stripe and Zapier among directory partners, and says Anthropic reports skills in production for legal, finance, accounting and data science, not only coding. — [VentureBeat](https://venturebeat.com/ai/anthropic-launches-enterprise-agent-skills-and-opens-the-standard) (search-result summary; page not fetched)
- **Notion [Vendor]:** Notion now lets any page marked as a "Skill" run inside Notion Agent, so the skill concept has spread into partner products. — [Notion Help: Skills for Notion Agent](https://www.notion.com/help/skills-for-notion-agent)
- **Claude for Financial Services expansion (Oct 2025) [Vendor]:** The Claude for Excel add-in launched in beta. Six finance Agent Skills were added: comparable company analysis, DCF models, due-diligence data packs, company teasers, earnings analyses and initiating-coverage reports. — [Anthropic: Advancing Claude for Financial Services](https://www.anthropic.com/news/advancing-claude-for-financial-services); dated Oct 28, 2025 by [TechRepublic](https://techrepublic.com/article/news-anthropic-expands-claude-financial-services)
  - Norway's sovereign wealth fund, NBIM (CEO Nicolai Tangen): about 20% productivity gain, roughly 213,000 hours. Portfolio managers query Snowflake and analyze earnings calls with Claude. Bridgewater (CTO Aaron Linsky): Claude powered early versions of its Investment Analyst Assistant. — same Anthropic post [Vendor]
  - AIG: underwriting review timelines reportedly compressed 5x, with accuracy rising from 75% to over 90%. Only a Substack reports this; it is unverified. — [Lucidate Substack](https://lucidate.substack.com/p/claude-for-financial-services) [Secondary]
- **Cowork plugins [Indep/Secondary]:** Launched Jan 30, 2026. Each plugin bundles skills, connectors, slash commands and sub-agents. The Feb 24, 2026 enterprise update added:
  - private plugin marketplaces, admin control over which plugins teams get, and auto-install of approved plugins;
  - per-user provisioning and OpenTelemetry for usage and cost monitoring;
  - MCP connectors for Google Workspace, DocuSign and WordPress;
  - HR, finance and legal department plugins;
  - partner plugins from Slack (Salesforce), LSEG, S&P Global, Apollo and Common Room;
  - Excel-to-PowerPoint cross-app orchestration for finance.
  — [WinBuzzer, Feb 25, 2026](https://winbuzzer.com/2026/02/25/anthropic-claude-cowork-13-enterprise-plugins-google-workspace-docusign-xcxwbn/); [Reworked](https://www.reworked.co/collaboration-productivity/anthropic-adds-plugins-to-claude-cowork/); [Constellation Research](https://www.constellationr.com/insights/news/anthropic-expands-cowork-plugins-across-enterprise-functions) (summary only)
- **Legal plugin market shock (early Feb 2026) [Indep]:** One of the Jan 30 plugins automates contract review, NDA triage, compliance workflows and legal briefings. Thomson Reuters fell about 18% in a day, which some outlets call its largest one-day drop. RELX (LexisNexis) also fell, and estimates of total software and data market value lost range from about $100B to $285B. Analysts cited fears of "seat compression." William Blair's Arjun Bhatia called the reaction "overdone." Anthropic says the plugin "does not provide legal advice" and needs attorney review. — [Techloy](https://www.techloy.com/software-stocks-plunge-285b-as-anthropics-claude-enters-legal-automation/); [Yahoo Finance/Reuters](https://finance.yahoo.com/news/anthropics-ai-tools-deepen-selloff-054551832.html); [Implicator](https://www.implicator.ai/software-lost-300-billion-in-a-day-anthropic-was-just-the-excuse/) (argues Anthropic was "just the excuse")
- **Cowork GA and governance [Indep]:** Cowork reportedly went GA on all paid tiers around Apr 9, 2026 (sources disagree on the exact date) and later expanded to web and mobile. Admins can group users and restrict individual MCP tool actions, for example letting a Gmail connector read mail but not send it. — [The New Stack](https://thenewstack.io/anthropic-takes-claude-cowork-out-of-preview-and-straight-into-the-enterprise/); [InfoWorld](https://www.infoworld.com/article/4194472/anthropic-expands-claude-cowork-to-web-and-mobile-as-enterprise-use-broadens.html) (summary only)
- **Cowork usage mix [Vendor data via press]:** Anthropic analyzed 1.2M anonymized Cowork sessions:
  - business process and operations: 33.4% (largest category);
  - content creation and copywriting: 16.4%;
  - software development: only 8.7%.
  Anthropic frames the use as "the work around work." — [Yahoo Finance](https://finance.yahoo.com/technology/article/anthropic-says-customers-are-using-claude-cowork-for-the-work-around-work-as-ai-companies-soften-job-loss-rhetoric-160000661.html) (summary only)
- **Claude Design plugin [Secondary]:** Launched Apr 17, 2026 by Anthropic Labs as a research preview. — [eesel.ai](https://www.eesel.ai/blog/claude-cowork-plugins-updates)
- **Thomson Reuters as a customer [Vendor]:** Despite the stock hit, Thomson Reuters is piloting Cowork alongside Claude Enterprise. Its case study is a CTO Q&A about evaluation and governance with no hard metrics. — [Claude customers: Thomson Reuters](https://claude.com/customers/thomson-reuters-qa)

### Inferences
- In business settings, buyers and press praise the package more than any single skill: central admin provisioning, private marketplaces and MCP tool-level permissions are what make skills deployable for non-engineers.
- Finance (Excel, DCF/comps, LSEG/S&P data plugins) and legal (contract/NDA review) are the most visible "favored" business plugins. Legal's visibility comes partly from the market reaction rather than from documented ROI.
- Cowork usage data suggests that by session volume, non-coding operations work now exceeds coding within Cowork.

### Gaps
- No primary, metric-bearing case study tied specifically to a partner skill (Atlassian, Canva, Figma, Notion, Stripe, Box) turned up. Partner announcements are quotes, not ROI numbers.
- Box-specific skill or plugin details were not found.
- I did not find a reliable count of current Cowork plugins or the number of enterprises with org-provisioned skills.

## 2. Case studies with metrics (Claude Code, Agent SDK, skills at scale)

### Takeaway
Vendor-published case studies contain strong numbers: Rakuten (24 to 5 days time-to-market), Ramp (1M+ lines in 30 days), NBIM (213k hours) and PwC (up to 70% faster delivery). Big consultancies are rolling Claude out to hundreds of thousands of staff, though headcount figures for Deloitte and Cognizant come mainly from secondary sources. Independent verification of ROI is scarce.

### Cited Findings
- **Rakuten [Vendor]:** 79% reduction in time to market (24 days to 5). Claude Code ran 7 hours autonomously on an open-source refactor with a reported 99.9% accuracy. A separate page says Rakuten moved from quarterly to biweekly major releases and cut critical errors by 97% on Claude Managed Agents. One engineer runs 24 parallel Claude Code sessions for monorepo updates. — [Claude customers: Rakuten](https://claude.com/customers/rakuten); [Rakuten Today blog](https://rakuten.today/blog/rakuten-accelerates-development-with-claude-code.html)
- **Ramp [Vendor]:** 50% weekly adoption among engineers, more than 1M lines of code in 30 days and 80% faster incident response. Sales, risk and finance teams query the data warehouse in natural language instead of writing SQL. — [Claude customers: Ramp](https://claude.com/customers/ramp)
- **Codex is multi-vendor at the same customers [Indep]:** OpenAI also names Ramp, Rakuten, Cisco, Nvidia and Harvey as companies that rolled Codex out to developer teams. — [Fortune, Mar 4, 2026](https://fortune.com/2026/03/04/openai-codex-growth-enterprise-ai-agents/)
- **PwC (May 14, 2026) [Vendor]:**
  - Rollout scope: Claude Code and Cowork, starting with U.S. teams and expanding toward a global workforce of hundreds of thousands. 30,000 professionals to be trained and certified, and Claude sits inside ChatPwC.
  - Claimed results: delivery times cut by up to 70%; an insurance underwriting cycle cut from 10 weeks to 10 days; an HR app built as a prototype in 1 week and fully in under 2 months; cyber incident response cut from hours to minutes.
  - Organization: incubation pods for Finance, Supply Chain and Deal Making, plus a new Office of the CFO group.
  - Advocate Health plans deployment to 167,000 staff.
  — [Anthropic: PwC deploys Claude](https://www.anthropic.com/news/pwc-expanded-partnership)
- **Deloitte, Cognizant, Accenture [Secondary]:**
  - Deloitte: reportedly deploying Claude to about 470,000 staff as an anchor partner in the Claude Partner Network.
  - Cognizant: reportedly about 350,000 associates; named Global Premier Partner in Jul 2026, with 30,000+ trained.
  - Accenture: an Anthropic Business Group with 30,000 Claude-trained staff.
  - Partner Network: more than 40,000 firms reportedly applied, with 10,000+ consultants certified since March.
  - Claude Frontier Academy: launched Oct 2, 2026 with a reported $100M commitment.
  These headcounts appear across trade blogs; I found no company primary source in this research. — [Horses for Sources](https://www.horsesforsources.com/anthropic-is-devouring-it-services_041326/); [AI Weekly](https://aiweekly.co/alerts/anthropic-launches-three-tier-claude-partner-services-track); [eWeek](https://www.eweek.com/de/news/anthropic-cognizant-deal/); [ai2.work](https://ai2.work/blog/cognizant-s-30-000-claude-trained-staff-and-the-integrator-bottleneck); [Let's Data Science](https://letsdatascience.com/blog/anthropic-100-million-train-engineers-it-wont-hire)
- **Spotify [Vendor via press]:** Up to 90% reduction in engineering time on certain migrations, cited in Anthropic's Enterprise Agents briefing. — [VentureBeat](https://venturebeat.com/orchestration/anthropic-says-claude-code-transformed-programming-now-claude-cowork-is) (summary only)
- **PayPal [Vendor]:** Anthropic ran a partner webinar on deploying Cowork across the enterprise with PayPal; no metrics were found. — [Anthropic webinar](https://www.anthropic.com/webinars/deploying-cowork-across-the-enterprise-with-paypal)
- **Market share [Secondary citing analyst]:** Menlo Ventures' Dec 2025 enterprise report reportedly puts Anthropic at about 40% of enterprise LLM spend, versus OpenAI at 27% and Google at 21%. — [ValueAdd VC](https://valueaddvc.com/blog/anthropic-market-share-2026-40-percent-enterprise-llm-spend-openai) (verify against Menlo's report)

### Inferences
- The strongest ROI claims are in engineering (Rakuten, Ramp, Spotify). Business-function ROI claims come mostly through consultancies (PwC underwriting and HR) and finance (NBIM).
- Consultancies (PwC, Deloitte, Accenture, Cognizant) are the main channel for non-coding adoption. They are also reselling the capability, so their claims are commercially motivated.

### Gaps
- No metrics found for Shopify, Stripe, Brex or Coinbase Claude Code / Agent SDK case studies (Brex appears only as a Bedrock listing).
- No independent audit of vendor ROI figures.
- No Agent SDK-specific metrics; Rakuten's Managed Agents figures are the closest.

## 3. Google (Gemini Enterprise / Antigravity), OpenAI (Codex / Frontier), and cross-vendor Agent Skills adoption

### Takeaway
Agent Skills (SKILL.md, agentskills.io) has become a de facto cross-vendor format. OpenAI's own Codex docs say Codex skills build on the standard, and Microsoft (VS Code/GitHub) adopted it quickly. Google and OpenAI are competing at the enterprise-platform layer: Google with Gemini Enterprise and a unified "Gemini" agent (Oct 2026), OpenAI with Frontier (Feb 2026) plus Codex, which reported 3M weekly developers by April 2026.

### Cited Findings
- **OpenAI Codex [Vendor]:** OpenAI's docs say Codex skills "build on the open agent skills standard" (agentskills.io), load SKILL.md on demand, and are distributed as plugins. — [OpenAI Codex docs: Agent Skills](https://developers.openai.com/codex/skills)
- **Adoption speed [Secondary]:** OpenAI and Microsoft reportedly integrated support within about 48 hours of the Dec 2025 publication. Simon Willison noted OpenAI "quietly adopting skills" in Dec 2025. — [Daniel Vaughan's Codex blog](https://codex.danielvaughan.com/2026/03/27/codex-cli-skills-ecosystem/)
- **Spread to other tools [Secondary]:** Microsoft, OpenAI, Atlassian and Figma all ship the same spec; skills are said to work in ChatGPT, Codex CLI, M365 Copilot via VS Code, Cursor and GitHub. — [AgentMarketCap, Apr 16, 2026](https://agentmarketcap.ai/blog/2026/04/16/anthropic-agent-skills-open-standard-cross-vendor-adoption). A Gemini CLI listing appears only on third-party sites such as [skills.sh](https://skills.sh/agent).
- **OpenAI Frontier (early Feb 2026) [Indep]:** An enterprise platform for building, deploying and managing agents, with shared context, feedback learning, permissions and user-created skills. Early customers: HP, Intuit, Oracle, State Farm, Thermo Fisher and Uber. Frontier Alliances were formed with McKinsey, BCG, Accenture and Capgemini. — [Enterprise AI World](https://www.enterpriseaiworld.com/Articles/News/News/OpenAI-Introduces-Solution-to-Manage-AI-Agents-Releases-GPT-5.3-Codex-173408.aspx); [Techloy](https://www.techloy.com/the-ai-race-heats-up-openai-drops-frontier-and-codex-as-anthropic-launches-opus-4-6/)
- **Codex growth [Indep]:**
  - more than 1.6M weekly users (Mar 2026) — [Fortune](https://fortune.com/2026/03/04/openai-codex-growth-enterprise-ai-agents/)
  - 3M weekly active developers, with Business/Enterprise Codex users up 6x from Jan to Apr 2026, plus a Codex partner program with Cognizant and CGI — [The Next Web, Apr 21, 2026](https://thenextweb.com/news/openai-codex-enterprise-partners-cognizant-cgi)
- **Google Gemini Enterprise [Vendor/Indep]:** Launched Oct 2025.
  - Virgin Voyages: 50+ agents, with 40% faster content production.
  - Macquarie Bank: deploying to all staff.
  - Gordon Food Service: 12,000 employees.
  — [IT Brief](https://itbrief.com.au/story/google-cloud-launches-gemini-enterprise-to-bring-ai-to-all-staff)
- **Google "Gemini at Work 2026" (Oct 2026) [Vendor]:** Google introduced a single "Gemini" agent that holds business context, plans work, "uses skills and tools" and connects to business systems, with cost controls and governance. Pichai said nearly 80% of Google Cloud customers use its AI products, and about 500 enterprises each processed more than 1T tokens in the past year. — [Constellation Research](https://constellationr.com/insights/news/google-cloud-launches-gemini-agent-work-across-enterprise-systems); [Unite.ai](https://unite.ai/google-cloud-unveils-gemini-its-universal-agent-for-work)

### Inferences
- Skills are converging into a portable "procedural knowledge" layer, while platforms compete on governance, data connectors and model routing.
- Enterprise customers (Ramp, Rakuten) run several vendors in parallel. A portable SKILL.md lowers switching costs, which helps explain why vendors adopted the standard quickly.

### Gaps
- No primary source found on Google Antigravity enterprise adoption or named Antigravity customers; this was not specifically searched in depth.
- No primary Google documentation confirming Gemini CLI / Gemini Enterprise support for the SKILL.md format.
- No named-customer metrics for OpenAI Frontier.

## 4. Criticisms and failures reported by businesses (security, governance, cost)

### Takeaway
The leading criticism is the security of the skill supply chain. Multiple independent studies (ESET, Snyk, Trail of Bits, academic work) find malicious or unsafe skills in public marketplaces, and current scanners miss many of them. Governance and cost-control features (MCP action restrictions, spend limits, OTel) are reactive answers. Gartner's forecast that more than 40% of agentic projects will be cancelled by 2027 frames the ROI skepticism.

### Cited Findings
- **ESET H1 2026 [Indep]:** Of about 900,000 agent skills analyzed, about 25,000 were flagged as suspicious and more than 3,000 as directly malicious. — [Expert Insights](https://expertinsights.com/news/1-in-300-ai-agent-skills-is-directly-malicious-eset-research-finds)
- **Snyk "ToxicSkills" [Indep]:** 13.4% of about 4,000 skills had critical issues, with 76 confirmed malicious payloads (credential theft, backdoors, exfiltration). — [Forkast](https://forkast.news/ai-agent-skills-are-the-new-supply-chain-attack-vector-and-most-have-never-been-vetted)
- **Academic study [Indep]:** Across 238,180 skills, malicious shares varied by marketplace: 46.8% on ClawHub, 23.0% on Skills.sh and 6.0% on SkillsDirectory. — [arXiv 2603.16572](https://arxiv.org/html/2603.16572v1) (figures per search summary)
- **Scanner failures [Indep/Vendor]:** Trail of Bits reportedly bypassed the ClawHub, Cisco and skills.sh scanners. In an AIR test, a benign fake skill was promoted with an Instagram ad, reached about 26,000 agents (including corporate accounts) and passed every scanner. — [Aviatrix threat research](https://aviatrix.ai/threat-research-center/the-sorry-state-of-skill-distribution-2026); [Aviatrix](https://aviatrix.ai/threat-research-center/fake-ai-agent-skill-supply-chain-attack-2026)
- **Cloud Security Alliance research note (Jun 24, 2026):** Describes "Semantic Compliance Hijacking," which hides malicious behavior in natural-language rules inside a skill. It reports up to 77.67% exfiltration success with 0% scanner detection. The note says it was AI-assisted and has not been officially reviewed by CSA. — [CSA research note PDF](https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/06/CSA_research_note_ai-skill-supply-chain-attacks_20260624-csa-styled.pdf)
- **Gartner [Indep]:** Forecasts that more than 40% of agentic AI projects will be cancelled by end-2027 due to cost, unclear value or inadequate risk controls. Gartner also flags "agent washing" and estimates only about 130 genuine agentic vendors. The forecast dates from June 2025. — [Outlook Business](https://www.outlookbusiness.com/artificial-intelligence/over-40-of-agentic-ai-projects-will-be-scrapped-by-2027-says-gartner)
- **Cost and limits [Secondary]:**
  - Heavy-use rate limits were a recurring Claude Code complaint. Anthropic doubled the 5-hour limits in May 2026 and temporarily raised weekly limits by 50% (set to expire Jul 13, 2026). — [Verdent](https://www.verdent.ai/guides/claude-code-limits-doubled-may-2026)
  - Org-level and per-user spend limits with alerts at 75%/90% reportedly shipped for Claude Enterprise on Jul 2, 2026. This is unverified against Anthropic. — [DEV](https://dev.to/mr_manushukla/claude-enterprise-cost-controls-in-2026-spend-limits-budget-alerts-and-the-admin-api-3a3h)
  - A vendor references an "Uber incident" of AI-coding budget overrun without details; it is unverified. — [AI Weekly](https://aiweekly.co/alerts/agentfleet-adds-hard-spend-limits-to-claude-code-cli)
- **Legal plugin skepticism [Indep]:** Anthropic itself says the legal plugin needs attorney review. Analysts called the market reaction overdone. — [Techloy](https://www.techloy.com/software-stocks-plunge-285b-as-anthropics-claude-enters-legal-automation/)

### Inferences
- Enterprises favor admin-curated, private plugin marketplaces and first-party or partner skills over open community marketplaces, largely because of the supply-chain findings.
- Cost governance (spend caps, OTel monitoring) has become a buying requirement, judging by how many vendors shipped it in mid-2026.

### Gaps
- No named enterprise publicly disclosed a breach caused by a malicious skill or plugin in these sources.
- No systematic survey of enterprise cost complaints, and no 2026 Menlo Ventures report found.
- No Bloomberg or The Information reporting retrieved, because of paywalls and fetch failures.

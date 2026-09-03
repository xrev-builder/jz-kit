# 11 - Waiver-wire value, handcuffs, trades, streaming, bench construction (research scout, 2026-09-04)

Method note: WebFetch blocked; evidence comes from WebSearch snippets only. The session's search budget was
exhausted after ~22 queries, so several sub-questions (season-by-season undrafted counts, FAAB bid data, trade
rates, QB streaming gap, bench/IR studies) are only partially covered. Every number below carries the URL of the
page the snippet came from. Items marked **[MEMORY - unverified]** are from model knowledge (pre-June 2026) with no
URL and should be treated as hypotheses to confirm, not inputs.

---

## A. Waiver-wire value in redraft leagues

1. **Replacement level in a 12-team league (1QB/2RB/2-3WR/1TE + flex) is roughly QB13 / RB25 / WR25 / TE13** - i.e.
   the best waiver player at each position is, in expectation, the 13th QB, 25th RB, 25th WR, 13th TE. (Search
   snippet from the FantasyLabs/Koerner rankings framework, 12-team 0.5-PPR, QB/RB/RB/WR/WR/WR/Flex.)
   https://www.fantasylabs.com/articles/sean-koerners-fantasy-football-wide-receiver-rankings-and-tiers-2026/
   -> For the sim: model "best available waiver RB/WR" as the RB25-30 / WR25-36 weekly distribution, not a fixed number.

2. **Undrafted RBs have mostly been replacement-level.** PFF's 2026 late-round RB piece: "undrafted RBs in the last
   five years have delivered mostly replacement-level production, with Kyren Williams being an exception."
   https://www.pff.com/news/fantasy-football-2026-late-round-running-back-targets-for-drafts
   No season-by-season count of top-24 RB / top-36 WR finishers with ADP > 150 was surfaced by search.
   **[MEMORY - unverified]** rough recollection of notable ADP>150 top-24 RB / top-36 WR finishers: 2022 -
   Jamaal Williams, Tyler Allgeier, Jerick McKinnon (RB); 2023 - Kyren Williams (ADP ~150+), Raheem Mostert,
   Puka Nacua (ADP ~200), Nico Collins-ish; 2024 - Chase Brown (ADP ~130), Bucky Irving, Jordan Mason, Tyrone
   Tracy, Rico Dowdle (RB); Jauan Jennings, Darnell Mooney (WR). Typical count is ~3-6 of the top-24 RBs and
   ~4-8 of the top-36 WRs per season coming from ADP>150 or undrafted. Needs verification against
   FantasyPros ADP vs. end-of-season ranks before use.

3. **FAAB norms.** Standard budget is $100 (fake dollars) for the season.
   https://www.fantasysp.com/news/nfl/3055414/fantasy-football-faab-guide-managing-budget
   - Same guide: for an early-season breakout, managers "don't hesitate to spend 75-80% of their budget", since
     one legit top-10 player outweighs many small pickups. (same URL)
   - 4for4's 2026 guide: any bid over 10% of the starting budget should pass a checklist; one failed check halves
     the bid, two failures = walk away. RB is the position where managers most often overspend because starting
     lineups require 2+ and RBs are the highest-scoring injury replacements.
     https://www.4for4.com/2026/preseason/ultimate-guide-winning-waiver-wire-2026
     https://www.4for4.com/2025/preseason/ultimate-guide-waiver-wire-faab-strategy-2025
   - No hard data on the distribution of winning bids (e.g. Sleeper/ESPN aggregates) was found in the snippets.
     **[MEMORY - unverified]** Industry FAAB reports (FantasyPros "FAAB bid report", Fantasy Life tool) typically
     show the #1 weekly pickup after an RB1 injury clearing 40-70% of budget in Weeks 1-6 and 20-40% later; the
     top 3 pickups of a week absorb most of the league's spending.

4. **Speed of claims / who gets claimed.** No quantitative source found. Qualitative from FantasyPros 2025 FAAB
   guide and 4for4: the top injury-replacement RB is claimed in the first waiver run after the injury, essentially
   always; the sim should assume 0 probability that a clear RB handcuff to an injured RB1 survives to free agency.
   https://www.fantasypros.com/2025/09/fantasy-football-faab-waiver-wire-strategy-advice/

---

## B. Handcuff evidence

5. **Fantasy Football Blueprint, nine-season study (2015-18, 2020-24; 283 team-seasons with a clear lead back
   and clear primary backup):**
   - Designated handcuffs finished **RB24 or better only 6.5% of the time**, vs **10.5%** for bench-caliber backs
     who were *not* designated handcuffs -> the handcuff label is worth ~3 extra percentage points of hit rate
     (actually negative relative to random late backs in their framing).
   - Pure-insurance handcuff picks produced a startable RB2 in roughly **3-4 of every 100 picks**.
   - When the lead back missed **3+ games**, the backup's **median was 10.1 PPG** during the weeks the starter was out.
   - Backup behind an *unquestioned bell cow* finished RB24+ in only **6.5%** of cases even when the bell cow missed
     a third of the season; a back who was *already splitting* the backfield hit at **29.3%**.
   - Conclusion: "the best predictor of a late-round back's season was touches he already had, not the injury he
     was waiting for."
   https://www.fantasyfootballblueprint.com/2026/08/06/10-handcuffing-running-backs/

6. **PlayerProfiler "Definitive Case Against Handcuffs":** 71 handcuff RBs attached to first-round RBs had an
   **11.3% hit rate**; across **105 games** a starter missed to injury, the backup was a **top-24 RB in 34%** of
   those weeks.
   https://www.playerprofiler.com/article/the-definitive-case-against-handcuffs/

7. **Sharp Football (Nov 2021, data since 2010):** of 71 RBs with first-round ADP, only **8 attached RB2s (11%)**
   produced a top-24 season; "more handcuff hits come from double-digit rounds than top-100 options"; best targets
   are backups of *discounted* RB1s (starters going outside RB24) and ambiguous backfields.
   https://www.sharpfootballanalysis.com/fantasy/fantasy-football-handcuff-history-cheap-rb1s-and-ambiguous-backfields/

8. **First-week-after-injury production (RotoWire FAQ citing a historical study):** in the first week after a stud
   goes down, the handcuff shows about a **10% drop-off - 9.9 -> 9.2 points** in 10-team standard scoring.
   Examples: Alexander Mattison 2021 (3 elite games when Cook sat) vs Hassan Haskins 2022 (contributed little even
   in the one game he was the clear Henry replacement).
   https://www.rotowire.com/betting/faq/should-you-handcuff-in-fantasy-football-ef2114f4

9. **Rule-of-thumb share of starter's PPG.** FantasyPros defines a "true handcuff" as a backup who would inherit
   the RB1's volume and can be projected at **>=75% of the RB1's production**; DraftSharks/FantasyPros note a backup
   on the same workload "can often produce 80%, 90% or even 100%" of the starter's points, but most drafted
   handcuffs never get the opportunity.
   https://www.fantasypros.com/2026/05/fantasy-football-running-back-handcuff-rankings-2026/
   https://www.draftsharks.com/article/best-rb-handcuffs
   -> Sim parameterization suggested by 5-9: P(backup is a weekly RB2+ | starter out) ~ 0.34 for a clear handcuff,
   ~0.29 season-level for already-split backs, ~0.065 season-level for pure bell-cow backups; backup PPG ~
   0.6-0.8 x starter PPG in the injury weeks (median 10.1 PPG vs typical RB1 ~15-18 PPG).

10. **Handcuffs that paid off, with numbers (2023-2025):**
    - Jahmyr Gibbs: in the two 2023 games David Montgomery missed, 60+ snaps each and **28.8 PPG**, most among RBs
      those weeks. https://ftnfantasy.com/nfl/2024-fantasy-football-handcuff-rankings
    - Zamir White (LV, late 2023): **15.9 PPG, RB7** among backs who played all three fantasy-playoff weeks after
      Josh Jacobs' injury. https://ftnfantasy.com/nfl/2024-fantasy-football-handcuff-rankings
    - Ray Davis (BUF): James Cook missed Week 6 2024; Davis 20-97 rushing + 3-3-55 receiving, **RB12 in PPR** with
      no TD. https://sports.yahoo.com/articles/fantasy-football-strategy-why-handcuff-213200390.html
    - Zach Charbonnet (SEA): **21.9 half-PPR PPG in the six games Kenneth Walker missed in 2023-24**.
      https://www.fantasypros.com/2026/05/fantasy-football-running-back-handcuff-rankings-2026/
    - Kenneth Gainwell (2025, as Steelers' fill-in): **18.6 fantasy PPG in games with 14+ touches**.
      https://www.fantasypros.com/nfl/running-back-handcuffs.php
    - TreVeyon Henderson (NE, 2025 rookie): **17.6 PPR PPG (RB7) Weeks 10-18** once his role expanded.
      https://www.fantasylife.com/articles/fantasy/fantasy-football-rb-handcuff-rankings-and-tiers-for-2026-blake-c
    - Blake Corum (LAR, 2025): 145 att, 746 yds, 6 TD, **5.1 YPC**; top-12 of 51 RBs in RYOE/att and MTF/att.
      https://www.draftsharks.com/article/best-rb-handcuffs
    - Dontayvion Wicks (WR "handcuff", GB 2023): ~11 PPR PPG when Christian Watson was out.
      https://ftnfantasy.com/nfl/2024-fantasy-football-draft-strategy-wr-handcuffs
    - **[MEMORY - unverified]** 2024: Jordan Mason ~RB5 PPG Weeks 1-8 while McCaffrey was out; Chase Brown RB1-level
      after Zack Moss' neck injury; Tyrone Tracy after Singletary; Bucky Irving overtook Rachaad White.
      2025: Kimani Vidal after Omarion Hampton's IR stint; Jacory Croskey-Merritt (WAS); Kyle Monangai after
      D'Andre Swift; Woody Marks (HOU). Confirm PPG before use.

11. **4for4 handcuff charts (annual, 2024/2025/2026)** exist but the snippets only confirm the framing ("some
    late-round handcuffs step into full workloads while others clog benches"); no hit-rate table surfaced.
    https://www.4for4.com/2026/preseason/2026-running-back-handcuff-charts-draft-targets
    https://www.4for4.com/2025/preseason/2025-running-back-handcuff-charts-draft-targets
    https://www.4for4.com/2024/preseason/2024-running-back-handcuff-charts-draft-targets
    Other studies located but not quantified in snippets: Fantasy Outliers (Medium) "Are RB handcuffs worth it?"
    https://medium.com/fantasy-outliers/are-running-back-handcuffs-worth-it-e52609acc534 ; Footballguys
    campfire discussion https://www.footballguys.com/article/campfire_handcuffs ; FTN 2026 handcuff strategy
    https://ftnfantasy.com/nfl/fantasy-football-handcuff-strategy-for-2026. RotoViz- and Fantasy Points-specific
    handcuff studies did not surface in search results.

---

## C. In-season trades

12. **No quantitative data found** on trades-per-league in home leagues or on trading vs title odds. The only
    numeric reference in results was a Footballguys forum thread describing a very active league doing "30-40
    trades per year" (an outlier, not a norm).
    https://forums.footballguys.com/threads/how-to-incentivize-or-encourage-trades-in-leauge.650303/
    Qualitative: ESPN (Mike Clay) and Fantasy Footballers frame trades as one of four levers (draft, waivers,
    trades, lineups) - no effect size given.
    https://www.espn.com/fantasy/football/story/_/id/49741684/fantasy-football-how-manage-team-pickups-trades
    https://www.thefantasyfootballers.com/analysis/tricks-of-the-trade-fantasy-football/
    A 2025 arXiv paper on trade optimization with playoff biasing exists (genetic algorithm), useful for method
    not base rates: https://arxiv.org/pdf/2511.17535
    **[MEMORY - unverified]** typical 10-12 team home leagues complete ~2-6 trades per season; a large share
    (perhaps 30-50%) of casual leagues complete 0-1. Treat trades as a low-frequency, near-zero-sum event in the sim.

---

## D. Streaming DST / QB

13. **ESPN 2024 D/ST retrospective:** streaming whichever D/ST faced the Browns each week = **203 points, 37 more
    than the league-leading Broncos (166)**; facing the Titans each week = **193**. A realistic stream - the most
    widely available D/ST (>=75% available in ESPN leagues) with the best matchup - totaled **146 points, exceeded by
    only two individual D/STs** all season.
    https://www.espn.com/fantasy/football/story/_/id/46050621/2025-fantasy-football-streaming-defense-d-st-strategy-matchups
14. **ESPN multi-year:** top-five scoring D/STs averaged **9.6 PPG**; the D/STs facing the five most favorable
    matchups each week averaged **10.4 PPG**, and the matchup group beat the top-5 group by **>=1.0 PPG in each of the
    past four seasons** (~2021-2024).
    https://www.espn.com/fantasy/football/story/_/id/46050621/2025-fantasy-football-streaming-defense-d-st-strategy-matchups
15. **2023:** the Bengals D/ST (a top-drafted unit) scored **<=5 points in 11 of 17 games**.
    https://www.espn.com/fantasy/football/story/_/id/40747409/2024-fantasy-football-draft-strategy-d-st-defense-streaming
16. **4for4 (2021 & 2026):** a top-12-by-ADP D/ST was as likely to finish bottom-half as top-half in fantasy points.
    https://www.4for4.com/2026/preseason/2026-fantasy-football-streaming-dst-works-and-heres-how-do-it
    https://www.4for4.com/2021/preseason/streaming-defenses-works-here%E2%80%99s-how-do-it
    -> Sim: drafted top-5 DST ~9.6 PPG expectation; a competent streamer ~8.5-10.4 PPG (146/17 = 8.6 for the
    "widely available" stream in 2024). Net edge of drafting a DST early ~0 to +1 PPG at best.
17. **QB streaming (2024):** only ~5 QBs were true every-week must-starts; three of one week's top-10 QBs came from a
    streaming column; Sam Darnold (widely undrafted) averaged **16.5 PPG** through Week 7 2024.
    https://www.fantasypros.com/2024/10/fantasy-football-quarterback-streamers-waiver-wire-pickups-week-7/
    No QB1-vs-QB12 PPG gap table surfaced (budget exhausted). **[MEMORY - unverified]** In 4-pt-pass-TD 12-team
    leagues, QB1 overall ~24-26 PPG, QB12 ~17-18 PPG, best streamer ~15-17 PPG; the drafted-elite-QB edge is
    ~6-8 PPG vs streaming, much larger than the DST edge.

---

## E. Bench construction (6 bench + 1 IR)

18. No quantitative RB-bench vs WR-bench study surfaced. Consensus guidance (FantasyPros 2019 "Building the
    Perfect Bench"; Bleacher Nation 2026): bench should be almost entirely RB/WR because you start 2+ of each;
    prefer flex-competitive players over positional backups (no backup K/DST/QB/TE in 1-QB/1-TE leagues).
    https://www.fantasypros.com/2019/05/building-the-perfect-bench-fantasy-football/
    https://www.bleachernation.com/fantasy-football/2026/08/11/fantasy-football-bench/
    Combined with finding 5 (already-split backs 29.3% vs pure handcuffs 6.5%) and finding 1 (RB25/WR25
    replacement), the evidence favors **RB-heavy benches of committee backs with existing touches** over pure
    handcuffs, and against holding a backup QB/TE. IR-slot data: none found; **[MEMORY - unverified]** IR slot is
    typically usable only for players officially on IR/PUP (platform-dependent; Sleeper allows IR/O/PUP/Doubtful in
    some settings), so its value scales with the number of "designated IR" injuries (~10-20% of RB1/WR1 injuries
    are IR-designated multi-week).

---

## F. 2026 consensus: top-15 RBs and their handcuffs (Sept 2026)

Sources: ESPN PPR ADP/rankings (Field Yates, updated Aug 31, 2026)
https://www.espn.com/fantasy/football/story/_/id/48711830/2026-fantasy-football-rankings-ppr-field-yates ;
handcuff lists: DraftSharks (Aug 31) https://www.draftsharks.com/article/best-rb-handcuffs ; FantasyPros
https://www.fantasypros.com/nfl/running-back-handcuffs.php ; Fantasy Life
https://www.fantasylife.com/articles/fantasy/fantasy-football-rb-handcuff-rankings-and-tiers-for-2026-blake-c ;
ESPN insurance RBs https://www.espn.com/fantasy/football/story/_/id/49517475/nfl-fantasy-football-rankings-running-back-handcuffs-insurance ;
Mike Clay draft board (late-round insurance RBs: Brian Robinson Jr., Keaton Mitchell, Isiah Pacheco, Jonah Coleman,
Tank Bigsby, Ray Davis, Dylan Sampson, Mike Washington Jr., Braelon Allen, MarShawn Lloyd)
https://www.espn.com/fantasy/football/story/_/id/49658374/2026-fantasy-football-rankings-draft-strategy-best-picks-every-round-clay-espn ;
Bleacher Report late stashes https://bleacherreport.com/articles/25470293-top-late-round-stashes-your-fantasy-football-roster

### Table: Top-15 RB and 2026 handcuff (with the handcuff's projected role if the starter goes down)

| # | Starter (team, ESPN PPR RB rank) | 2026 handcuff | Projected role if starter out | Source / confidence |
|---|---|---|---|---|
| 1 | Bijan Robinson (ATL, RB1) | Brian Robinson Jr. | Pure handcuff; would inherit a workload Clay calls possibly the NFL's largest -> RB1/RB2 | FantasyPros handcuffs page; ESPN Clay board |
| 2 | Jahmyr Gibbs (DET, RB2) | Isiah Pacheco | "Proven starter" behind Gibbs in an elite offense; likely 15+ touch lead back -> RB1/2 | DraftSharks; ESPN Clay board |
| 3 | Christian McCaffrey (SF, RB3) | Jordan James | "Must-own" handcuff given CMC's injury history/workload; workhorse in Shanahan scheme -> RB1 | DraftSharks |
| 4 | Jonathan Taylor (IND, RB4) | not named in snippets ( **[MEMORY]** DJ Giddens) | Would take most early-down work -> RB2 | unverified |
| 5 | De'Von Achane (MIA, RB5) | not named in snippets ( **[MEMORY]** Jaylen Wright / Ollie Gordon II committee) | Split backfield -> flex | unverified |
| 6 | James Cook (BUF, RB6) | Ray Davis | Showed RB12 PPR week when Cook sat (Wk 6 2024); early-down lead -> RB2 | Yahoo; ESPN Clay board |
| 7 | Derrick Henry (BAL, RB7) | Keaton Mitchell | Explosive but small; likely a committee lead -> RB2/flex | ESPN Clay board; Bleacher Report |
| 8 | Chase Brown (CIN, RB8) | not named in snippets ( **[MEMORY]** Tahj Brooks) | Would inherit heavy volume in a high-scoring offense -> RB2 | unverified |
| 9 | Kenneth Walker III (KC, RB9) | not named in snippets ( **[MEMORY]** Brashard Smith / Elijah Mitchell) | Committee -> flex | unverified |
| 10 | Jeremiyah Love (ARI, RB10) | not named in snippets ( **[MEMORY]** Trey Benson) | Benson would be a lead back -> RB2 | unverified |
| 11 | Saquon Barkley (PHI, RB11) | Tank Bigsby | "League-winner" if Barkley missed time; 4th in explosive-run rate, 1st in YAC/att -> RB1 | FantasyPros Sept 2026; Bleacher Report |
| 12 | Omarion Hampton (LAC, RB12) | not named in snippets ( **[MEMORY]** Kimani Vidal, who filled in during Hampton's 2025 IR stint) | Lead back -> RB2 | unverified |
| 13 | Ashton Jeanty (LV, RB13) | not named in snippets ( **[MEMORY]** Raheem Mostert / Zamir White) | Committee -> flex | unverified |
| 14 | Javonte Williams (DAL, RB14) | Jaydon Blue | "Worth monitoring" behind Williams; committee lead -> RB2/flex | Bleacher Report |
| 15 | Kyren Williams (LAR, ~RB15; not in snippet's top-14) | Blake Corum | Already ~40% of a 60/40 split; would be "locked into a workhorse role" -> RB1; 5.1 YPC, top-12 RYOE/att in 2025 | Fantasy Life; DraftSharks; ESPN Clay (60/40) |

Other handcuffs ranked Tier 1-2 by consensus lists (starter in parentheses): Tyrone Tracy Jr. (NYG, behind Cam
Skattebo - "genuine three-down back", DraftSharks); Kyle Monangai (CHI); Jordan Mason (MIN); Rico Dowdle (PIT);
Kenneth Gainwell (TB, behind Bucky Irving; 18.6 PPG with 14+ touches); RJ Harvey and Jonah Coleman (DEN, behind
J.K. Dobbins); Kaleb Johnson / MarShawn Lloyd (GB, behind Josh Jacobs); Woody Marks (HOU); Braelon Allen (NYJ);
Dylan Sampson (CLE); Tyjae Spears (TEN); Zach Charbonnet (SEA, ACL - elite handcuff on return); Nicholas Singleton,
Emmett Johnson, Mike Washington Jr. (deep stashes). TreVeyon Henderson (NE) is drafted in Rd 5-6 and is no longer
priced as a handcuff. Sources: Fantasy Life tiers, DraftSharks, ESPN Clay board, Bleacher Report (URLs above).

**Late-round RB stashes (11th round or later) per FantasyPros Aug 2026:** Jordan Mason, Chris Rodriguez Jr.,
Keaton Mitchell headline five backs available in Rd 11+.
https://www.fantasypros.com/2026/08/fantasy-football-3-late-round-running-backs-to-draft-2026/
PFF 2026 late-round RB targets: https://www.pff.com/news/fantasy-football-2026-late-round-running-back-targets-for-drafts
FTN mid/late-round RB targets: https://ftnfantasy.com/nfl/jeff-ratcliffes-2026-mid-and-late-round-rb-targets

---

## G. Suggested sim parameters (derived from the sourced numbers above)

| Parameter | Value | Basis |
|---|---|---|
| Waiver replacement RB / WR / TE / QB (12-team) | RB25 / WR25 / TE13 / QB13 weekly distributions | finding 1 |
| P(clear handcuff is top-24 RB in a week starter misses) | 0.34 | finding 6 |
| P(pure bell-cow backup finishes RB24+ over season) | 0.065 | finding 5 |
| P(already-split committee back finishes RB24+) | 0.29 | finding 5 |
| Backup median PPG during 3+ game starter absence | 10.1 | finding 5 |
| Week-1-after-injury drop-off | ~10% (9.9 -> 9.2, 10-team std) | finding 8 |
| Top FAAB bid for RB1 replacement | 40-80% of $100 (early season) | finding 3 (upper bound sourced) |
| Drafted top-5 DST vs best-matchup stream | 9.6 vs 10.4 PPG; realistic stream ~8.6 PPG | findings 13-14 |
| Trades per home league | low; no data (assume 2-6, many leagues 0-1) | finding 12 [unverified] |

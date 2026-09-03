# 02 — 2026 ESPN ADP / ECR research notes

**Research date:** 2026-09-03. **Season start:** 2026-09-10.
**Lens:** 10-team full-PPR ESPN league (QB/2RB/2WR/TE/2FLEX/DST, 15 rounds).

## 0. Data-access limitations (read first)

- Every direct page fetch (WebFetch and curl) was blocked by the sandbox egress proxy (`EGRESS_BLOCKED` / `CONNECT tunnel failed, response 403`) for **all** hosts tried: fantasy.espn.com, espn.com, africa.espn.com, g.espncdn.com (ESPN PPR300 PDF), fantasypros.com, draftwizard.fantasypros.com, fantasyfootballcalculator.com (site and API), draftsharks.com, rotowire.com, 4for4.com, fantasysixpack.net, directv.com, drawpie.com, fftoolbox.fulltimefantasy.com, sports.yahoo.com, nbcsports.com, si.com, cbssports.com, clutchpoints.com, rotoballer.com, prizepicks.com, bleachernation.com, fftoday.com, lindyssports.com, draftwaiver.com, fantasylife.com, nfl.com, footballguys.com, seahawks.com, profootballnetwork.com, fantasysp.com, substack, wikipedia, api.sleeper.app.
- Only **WebSearch result snippets** were usable, and the session's shared web-search budget (200/200) ran out partway through.
- Consequence: **no full top-200 ESPN ADP table could be obtained.** The CSV contains ~90 players, of which only ONE has a verified actual ESPN ADP number (Chris Godwin, 146.8). Everything else is either (a) a numeric ADP from a non-ESPN proxy source quoted in a search snippet, or (b) an ESPN *staff ranking* (Clay / Yates / Karabell), which is a market proxy, not ADP.
- To complete this task properly, re-run with `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION` raised and/or with egress allowed for `fantasypros.com`, `fantasy.espn.com`, and `fantasyfootballcalculator.com`.

## 1. Sources actually used (all via search snippets, 2026 pages)

| Tag | Source | What it provided | Date signal |
|---|---|---|---|
| ESPN-Yates | https://www.espn.com/fantasy/football/story/_/id/48711830/2026-fantasy-football-rankings-ppr-field-yates | Field Yates PPR top-160 overall ranks (many players) | "Updated Aug. 31" (2026) |
| ESPN-Clay | https://www.espn.com/fantasy/football/story/_/id/47513496/2026-fantasy-football-rankings-ppr-mike-clay | Mike Clay PPR positional ranks (QB/RB/WR/TE) | "Latest update: Aug. 31" |
| ESPN-Karabell | https://www.espn.com/fantasy/football/story/_/id/49614875/2026-fantasy-football-rankings-running-back-tiers-rb ; https://www.espn.com/fantasy/football/story/_/id/47539664/2026-fantasy-football-rankings-flex-superflex-ppr-eric-karabell | RB tiers; Collins WR8, Herbert QB8 (superflex) | 2026 |
| ESPN-composite hub | https://www.espn.com/fantasy/football/story/_/page/FFPreseasonRank26main/fantasy-football-rankings-2026-draft-ppr | Confirms composite from Bowen, Clay, Cockcroft, Dopp, Karabell, Loza, Moody, Yates (Cockcroft = top 252). Contents NOT retrievable. | 2026 |
| ESPN PPR300 PDF | https://g.espncdn.com/s/ffldraftkit/26/NFL26_CS_PPR300.pdf | Exists ("300 players in order of overall draft value"). NOT retrievable. | 2026 |
| ESPN Live Draft Trends | https://fantasy.espn.com/football/livedraftresults | ESPN's own ADP page. NOT retrievable. | live |
| FP-ESPN-values (Aug) | https://www.fantasypros.com/2026/08/top-3-fantasy-football-draft-values-on-espn-2026-picks/ | ECR-vs-ESPN-ADP gaps (Herbert, Collins, Godwin, unnamed RB, WR/RB structural skew) | Aug 2026 |
| FP-ESPN-values (Jun) | https://www.fantasypros.com/2026/06/top-3-fantasy-football-draft-values-on-espn-2026/ | earlier version; "RBs (excluding one) selected 30% earlier on ESPN than ECR" | Jun 2026 |
| FP-ESPN-overvalued (Aug) | https://www.fantasypros.com/2026/08/overvalued-fantasy-football-draft-picks-to-avoid-espn-2026-picks/ | Jeremiyah Love most overvalued (67% gap); Aubrey (K) | Aug 2026 |
| FP-ESPN-overvalued (Jul) | https://www.fantasypros.com/2026/07/overvalued-fantasy-football-draft-picks-to-avoid-on-espn-2026-advice/ | earlier version | Jul 2026 |
| FP ADP composite | https://www.fantasypros.com/nfl/adp/ppr-overall.php | Only snippet: "Gibbs, Bijan and Jonathan Taylor with a spread of 1, and Ja'Marr Chase and JSN the same" (site-to-site spread). Table NOT retrievable. | live |
| FP ECR | https://www.fantasypros.com/nfl/rankings/ppr-cheatsheets.php | NOT retrievable (100+ experts, updated daily) | live |
| 4for4 ESPN cheat sheet | https://www.4for4.com/2026/preseason/experts-cheat-sheet-dominating-espn-fantasy-football-drafts | "ESPN pushes RBs up vs Sleeper/Yahoo"; "every one of the fifteen biggest gaps where the room moves before ESPN does is a WR, and every one of the six where [ESPN] rankings are higher than the room is a RB" | 2026 preseason |
| ESPN first mock | https://www.espn.com/fantasy/football/story/_/page/FFMockDraft-48610592/2026-fantasy-football-mock-draft-post-nfl-draft | R1 = 5 RB / 5 WR; RBs went 1-2-3 | post-NFL-draft (spring 2026) |
| FFC 10-team PPR | https://fantasyfootballcalculator.com/adp/ppr/10-team/all | "8,007 mock drafts Aug 26–Sep 2, 2026". Table NOT retrievable. | Sep 2, 2026 |
| FFC McMillan | https://fantasyfootballcalculator.com/players/tetairoa-mcmillan | ADP 40, WR18 | 2026 |
| seahawks.com WR | https://www.seahawks.com/news/fantasy-football-wr-rankings-and-analysis-for-2026 | Chase 4.1, Nacua 4.6, JSN 6.4, ASB 8.8, Lamb 14.7, Jefferson 15.7 ("early September 2026 ADP") | early Sep 2026 |
| seahawks.com RB | https://www.seahawks.com/news/fantasy-football-rb-rankings-and-analysis-for-2026 | Hampton 15.5, C.Brown 15.9, Walker 18.0, Hall 31.5 (attribution uncertain — numbers appeared in the same search result set) | 2026 |
| seahawks.com TE | https://www.seahawks.com/news/fantasy-football-rankings-and-analysis-for-2026-tight-ends-defenses-and-kickers | Loveland 41.0, Warren 52.5, Kraft 74.3, LaPorta 77.9, Kittle 97.8 | 2026 |
| CBS RB ADP review | https://www.cbssports.com/fantasy/football/news/fantasy-football-running-back-adp-rb-2026-best-values/ | CMC 7.75; Love ADP 27 PPR / 23 std; C.Rodriguez Jr. RB45; Achane NFFC 11.7 | 2026 |
| clutchpoints RB/WR | https://clutchpoints.com/fantasy-sports/5-overvalued-fantasy-football-running-backs-2026-adp ; .../5-overvalued-fantasy-football-wide-receivers-2026-adp | Achane ADP 11 PPR; Jacobs ADP 33 (RB15); Carnell Tate ADP 67 | 2026 |
| SI overvalued | https://www.si.com/onsi/fantasy/rankings/overvalued-adp-rankings-avoid-espn-kenyon-sadiq-2026 ; https://www.si.com/onsi/fantasy/nfl/cam-skattebo-and-3-overvalued-fantasy-football-adp-players-may-look-to-avoid | Sadiq overvalued in ESPN ranks; Skattebo overvalued ADP | 2026 |
| Yahoo PPR top-300 | https://sports.yahoo.com/fantasy/article/2026-fantasy-football-full-ppr-rankings-consensus-top-300-players-175205585.html | positional ranks for several RBs/WRs | 2026 |
| PrizePicks top-200 / CBS draft-prep | https://www.prizepicks.com/playbook-article/2026-ppr-fantasy-football-rankings-top-200-draft-cheat-sheet ; https://www.cbssports.com/fantasy/football/news/fantasy-football-2026-rankings-draft-prep-model-reveals-best-qb-rb-wr-te-picks-cheat-sheets-adp-tiers/ | Bowers "R2 P16", McBride "R2 P19", Allen ADP 19, Lamar pick 37, Daniels ADP 63 (attribution across these two uncertain) | 2026 |
| FP must-have QB/TE | https://www.fantasypros.com/2026/08/5-must-have-quarterbacks-tight-ends-2026-fantasy-football-picks/ | Juwan Johnson TE16 in ADP; Purdy "overlooked" | Aug 2026 |
| fantasylife ESPN strategy | https://www.fantasylife.com/articles/fantasy/espn-fantasy-football-draft-strategy-for-2026 | headline: "Is the Price Too High on Trey McBride?" (body not retrieved) | 2026 |

**Numbers that are actual ESPN ADP:** Chris Godwin 104.4 → 146.8 (FP-ESPN-values Aug). That is the only one.
**Numbers that are proxies:** every other ADP figure in the CSV (seahawks.com / CBS / clutchpoints / FFC / PrizePicks composites — mostly multi-site averages, not ESPN-specific).
**ESPN staff ranks:** Yates overall ranks and Clay positional ranks are from real 2026 ESPN pages (Aug 31 updates) but are rankings, not ADP.

## 2. ADP-vs-ECR gaps on ESPN (verified items only — far short of 25/25)

### Undervalued on ESPN (ESPN drafters take them LATER than ECR) — targets
1. **Justin Herbert, LAC QB** — ECR QB7 vs ESPN ADP QB15; 58-pick gap, largest in the top 300 (FP-ESPN-values Aug). ESPN's own Yates has him QB6; Clay QB14.
2. **Unnamed RB** — ECR RB6 but ESPN ADP RB13 (FP-ESPN-values Aug; snippet garbled the name — UNVERIFIED which player).
3. **Nico Collins, HOU WR** — ESPN ADP ~1 round / 12 picks later than ECR (FP-ESPN-values Aug). Proxy ADP 23.1; Yates #40, Karabell WR8.
4. **Chris Godwin, TB WR** — ESPN ADP fell 104.4 → 146.8; "potentially the biggest late-round bargain" (FP-ESPN-values Aug).
5. **Top-20 ECR WRs as a group** — go ~45% later on ESPN than ECR; of the top-50 ECR WRs only Davante Adams goes earlier on ESPN than his ECR (FP-ESPN-values Aug). "Most top-15 wideouts at least 25% cheaper on ESPN."
6. **Brock Purdy, SF QB** — "overlooked on draft day", favorable ADP (FP must-have QB/TE). No number.
7. 4for4 corroboration: all 15 biggest "room-before-ESPN" gaps are WRs → WRs are the value pocket on ESPN relative to other rooms.

### Overvalued on ESPN (ESPN drafters take them EARLIER than ECR) — fades
1. **Jeremiyah Love, ARI RB (rookie, 3rd overall NFL pick)** — most overvalued non-kicker on ESPN, 67% ECR-vs-ADP gap; ECR fell after reports Cardinals will ease him in (FP-ESPN-overvalued Aug). Clay still RB7, Yates RB10. Proxy PPR ADP 27.
2. **Running backs as a class** — RBs (excluding one) drafted ~30% earlier on ESPN than ECR (FP-ESPN-values Jun); ESPN pushes RBs up vs Sleeper/Yahoo; all 6 "ESPN-before-room" gaps are RBs (4for4).
3. **Kenyon Sadiq, NYJ TE** — overvalued in ESPN's rankings (SI). Clay TE20.
4. **Trey McBride, ARI TE** — fantasylife: "Is the price too high on ESPN?" (headline only; proxy ADP ~19).
5. **Davante Adams, LAR WR** — only top-50 WR taken before his ECR on ESPN (FP-ESPN-values Aug). Yates #51.
6. **Cam Skattebo, NYG RB** — overvalued ADP (SI; general market, not ESPN-specific). Proxy pick ~41.
7. **Josh Jacobs, GB RB** — ADP 33 / RB15 flagged overvalued for PPR (clutchpoints; general). Clay RB26 vs Yahoo RB11 — big expert split.
8. **De'Von Achane, MIA RB** — ADP 11 flagged (clutchpoints; general).
9. **Carnell Tate, TEN WR** — ADP 67 flagged (clutchpoints; general).
10. **Brandon Aubrey, K** — irrelevant (no K in this league).

Not verifiable in this session: the full 25/25 lists. FantasyPros' ESPN-specific articles (URLs above) contain them.

## 3. Positional structure by round (10-team) — DERIVED, not from an ESPN page

No ESPN round-by-round data was retrievable. Below is what can be stated:

- **ESPN's own spring mock (10-team, ESPN staff):** Round 1 = 5 RB / 5 WR, with RBs at picks 1-3 (ESPN first mock URL).
- **Derived from the proxy ADPs in the CSV (mixed sources, early Sept):**
  - R1 (picks 1–10): Gibbs, Bijan, Chase, Nacua, Taylor, JSN, CMC, ASB, Achane, Cook → **6 RB / 4 WR / 0 TE / 0 QB**.
  - R2 (11–20): Lamb, Hampton, Jefferson, C.Brown, Bowers, Walker, Allen, McBride, Henry, Barkley → **5 RB / 2 WR / 2 TE / 1 QB** (Henry/Barkley placement is staff-rank inference).
  - R3 (21–30): Jeanty, London, Collins, Rice, Love, Nabers, A.J. Brown, Javonte, Hall, Jacobs → **5 RB / 5 WR** (low confidence).
  - R4 (31–40): Kyren, Lamar, Etienne, McMillan, Loveland, Skattebo, Flowers, Waddle, Judkins, Tuten → **5 RB / 3 WR / 1 TE / 1 QB** (low confidence).
  - R5–R6 (41–60): Adams, Warren, Montgomery, Higgins, Daniels, Hubbard, Tate, Odunze, Metcalf, MHJ, Kraft, Watson, LaPorta, B.Thomas, Jamo, Sutton, Meyers, Kittle + others → roughly **3 RB / 11 WR / 3 TE / 1 QB** across the two rounds (very low confidence; many players in this range have no numeric ADP).
- **ESPN-specific skew to apply on top of the above:** ESPN rooms take RBs earlier and WRs later than the consensus above (FP + 4for4), so expect ESPN R1–R3 to be even more RB-heavy (likely 6–7 RB in R1) and WR1s such as Collins/Nabers/A.J. Brown to slide a half-round to a round later.
- QB: Allen is a round-2 pick; Lamar ~pick 37; Daniels ~63; Herbert falls to QB15 on ESPN. TE: Bowers/McBride round 2, Loveland round 4, Warren round 5, Kraft/LaPorta rounds 7–8, Kittle round 10.

## 4. Notable 2026 team changes surfaced in snippets (for name/team sanity)
Kenneth Walker III → KC; Jeremiyah Love → ARI (rookie); Travis Etienne → NO; A.J. Brown → NE; Mike Evans → SF; Jaylen Waddle → DEN; DK Metcalf → PIT; Rico Dowdle → PIT; David Montgomery → HOU; Chuba Hubbard → CAR; Davante Adams → LAR; Jordan Mason → MIN; Kenyon Sadiq → NYJ; Carnell Tate → TEN (rookie); Jadarian Price → SEA (rookie); Chris Rodriguez Jr. → JAC. All from 2026 ESPN/CBS/SI snippets cited in the CSV.

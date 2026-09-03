# Critique: news / status hallucination hunt (board_A.csv top 160)

Reviewed 2026-09-03. Scope: every non-DST player in board_A.csv ranks 1-160 (board_B differs only in rank order; notes and team_26 are identical) cross-checked against data/roster_2026.csv (status), data/depth_charts_2026.csv (latest dt 2026-09-02, pos_grp "3WR 1TE"), data/draft_picks.csv (season 2026), data/games.csv / data/sched_2026.csv, research/03-news.md, research/07-rookies.md, plus 15 web searches on the highest-impact uncertain claims.

Method notes: (1) team_26 matched the roster/depth chart for all 150 non-DST players in the top 160; (2) roster status was ACT for all except Jacobs (EXE), Tyson/Conner (RES R48), Charbonnet (RES R04), which the board already ranks as unavailable; (3) every "listed RB1/RB2/WR1/WR2/WR3/TE1" claim in a note matched the Sep 2 pos_rank except the two ARI rows and the MIA row flagged below; (4) all 8 DST "Wks 1-4" opponent lists match data/sched_2026.csv, Mahomes "Mon Sep 14" matches data/games.csv (DEN@KC 2026-09-14), Lamb "DAL allowed most points" and MIN DST "66.2/g fewest" match build/pts_allowed_2025.csv; (5) QB/coach citations verified: Tua ATL, Brissett ARI, Kyler MIN, Geno NYJ, Cousins LV, Shough NO, Watson CLE, Willis MIA, Dart NYG, D. Jones IND all QB1 on the Sep 2 chart; McDaniel LAC OC, Petzing DET OC, Daboll TEN OC, Bieniemy KC OC, Stefanski ATL, Harbaugh NYG, McCarthy PIT, Monken CLE, Minter/Doyle BAL confirmed by 03-news.md or search.

Severity key: critical = would cause a bad pick in rounds 1-8; high = rounds 9-15 or a wrong note on a top-50 player; medium/low otherwise.

---

1. **Jaxon Smith-Njigba (rank 5): "Same QB, same OC" is false — Seattle has a new OC.**
   Severity: high (wrong note on a top-5 player; rank itself is defensible).
   Evidence: research/03-news.md, Coaching changes: "LV: HC Klint Kubiak (ex-SEA OC)". Search 2026-09-03: seahawks.com "Offensive Coordinator Brian Fleury Brings Familiarity, Fresh Ideas To Seahawks Offense" (https://www.seahawks.com/news/offensive-coordinator-brian-fleury-brings-familiarity-fresh-ideas-to-seahawks-offense); fieldgulls.com "Seattle Seahawks finalize coaching staff for 2026" (https://www.fieldgulls.com/seattle-seahawks-coaching-staff/164607/seattle-seahawks-finalize-coaching-staff-nfl-2026). Fleury was SF run-game coordinator in 2025 (Shanahan tree, same family as Kubiak).
   Fix: replace "Same QB, same OC. Age 24." with "Same QB (Darnold); OC Kubiak left for LV HC, replaced by Brian Fleury (ex-SF run-game coordinator, same Shanahan-tree scheme). Age 24." No rank move. Also apply to Jadarian Price (52) if the "Super Bowl champion offense" phrasing is meant to imply scheme continuity.

2. **Breece Hall (rank 37): "Franchise tag year" is false — he signed a 3-yr/$45.75M extension in May.**
   Severity: high (wrong note, top-50 player; the contract-year motivation angle does not exist).
   Evidence: Search 2026-09-03: newyorkjets.com "Jets Sign RB Breece Hall to Multi-Year Extension" (https://www.newyorkjets.com/news/breece-hall-contract-extension-jets-05-11-2026, 2026-05-11); NFL.com "Jets RB Breece Hall signing three-year, $45.75 million contract" (https://www.nfl.com/news/nfl-network-jets-rb-breece-hall-signing-three-year-45-75-million-contract). The tag was applied Mar 3 and superseded. data/roster_2026.csv: NYJ, ACT; Sep 2 chart NYJ RB1.
   Fix: replace "Franchise tag year;" with "Signed 3-yr/$45.75M extension in May (locked-in RB1);". No rank move.

3. **Jeremiyah Love (43) and Tyler Allgeier (125): depth-chart claim conflicts with the ground-truth file, and the Week 1 status is now "50/50".**
   Severity: high (round 5 pick; note drives whether to take Love at 43 or Allgeier as a two-week starter).
   Evidence: data/depth_charts_2026.csv ARI RB, every dt from 2026-08-22 through 2026-09-02: Jeremiyah Love pos_rank 1, Tyler Allgeier 2, James Conner 4 (Conner RES R48 in roster). Board note 43 says "Allgeier listed first" and note 125 says "listed RB1 in ARI"; research/07-rookies.md says the same, sourced to the team's official release (NBC/PFT "Cardinals' depth chart lists Tyler Allgeier as No. 1 RB, Jeremiyah Love as No. 2", https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/cardinals-depth-chart-lists-tyler-allgeier-as-no-1-rb-jeremiyah-love-as-no-2). Latest status, search 2026-09-03: FantasyPros "Jeremiyah Love (ankle) 'about 50/50' to play in Week 1" (https://www.fantasypros.com/nfl/news/605322/jeremiyah-love-ankle-about-5050-to-play-week-1.php); ProFootballRumors "Cardinals RB Jeremiyah Love '50-50' For Week 1" (https://www.profootballrumors.com/2026/09/cardinals-rb-jeremiyah-love-50-50-for-week-1); HC LaFleur: "progressing really well"; if he misses Wk 1 he is expected back Wk 2-3.
   Fix (note 43): replace "High-ankle sprain Aug 13, 'trending' to Wk 1 but Allgeier listed first." with "High-ankle sprain (preseason opener); LaFleur says 'about 50/50' for Wk 1 (Sep 2), back by Wk 2-3 if he sits. Team's official chart lists Allgeier first; nflverse/ESPN chart lists Love RB1." Fix (note 125): replace "listed RB1 in ARI while Love (ankle) recovers" with "team's official chart lists him first while Love (ankle, 50/50 for Wk 1) recovers; nflverse chart has him RB2". Rank: hold Love at 43 in League A (Wks 15-17 only matter); in League B (6/10 playoffs, floor matters) move Love from 44 to ~50 (behind Adams/Irving) and keep Allgeier where he is.

4. **De'Von Achane (15): "Malik Willis and a rookie WR1" contradicts the Sep 2 depth chart.**
   Severity: high by rubric (top-50 note); draft impact low.
   Evidence: data/depth_charts_2026.csv MIA WR, every dt 2026-08-19 through 2026-09-02: WR1 Malik Washington, WR2 Jalen Tolbert, WR3 Caleb Douglas (rookie, R3 #75 per data/draft_picks.csv). research/03-news.md §3 says Douglas was WR1 on the *initial* official chart (ESPN, Aug); the nflverse chart never had him above WR3.
   Fix: replace "with Malik Willis and a rookie WR1;" with "with Malik Willis and a WR corps of Malik Washington / Tolbert / rookie Caleb Douglas (R3);". No rank move.

5. **Emeka Egbuka (39): "Godwin (30) and Evans gone" reads as if Godwin left — he is TB's WR2.**
   Severity: high by rubric (top-50 note; a drafter reading this would over-project Egbuka's target share).
   Evidence: data/depth_charts_2026.csv TB WR 2026-09-02: Egbuka 1, Chris Godwin Jr. 2, Jalen McMillan 3; data/roster_2026.csv Godwin TB ACT. The board's own rank-86 note says "Godwin ... TB" and rank-128 Mayfield note says "Egbuka/Godwin; Evans gone".
   Fix: replace "Godwin (30) and Evans gone." with "Evans gone (SF); Godwin (30, off major injuries) is the WR2." No rank move.

6. **All DST rows carry team_26 = "NYJ" (ranks 133-138, 159-160, and every DST in the file).**
   Severity: medium (round 15, and byes are correct, but the printed sheet shows "Houston Texans, NYJ" in the room and any team-based filter/sort on the board will mis-bucket every DST).
   Evidence: build/board_A.csv rows 133-138, 159-160 (team_26 = NYJ for HOU/DEN/LAC/SEA/PHI/DET/PIT/MIN); build/master.csv DST rows show the same, so the bug is upstream in build/master.py's DST join (byes are right: HOU 8, DET 6, MIN 6, matching the skill players on those teams, so bye is not derived from team_26).
   Fix: in build/master.py map DST player name to team abbreviation (Houston Texans -> HOU, Denver Broncos -> DEN, Los Angeles Chargers -> LAC, Seattle Seahawks -> SEA, Philadelphia Eagles -> PHI, Detroit Lions -> DET, Pittsburgh Steelers -> PIT, Minnesota Vikings -> MIN, etc.) before writing team_26; rebuild board_A/B.

7. **Isiah Pacheco (154): board is right, the ground-truth files are stale — and the note's return window should be Wk 7, not "4+".**
   Severity: low (IR-stash slot; informational for the data pipeline).
   Evidence: data/roster_2026.csv Pacheco DET status ACT/A01; data/depth_charts_2026.csv 2026-09-02 DET RB5. Search 2026-09-03: ESPN "Detroit Lions place RB Isiah Pacheco on injured reserve" (https://www.espn.com/nfl/story/_/id/49796729/detroit-lions-place-rb-isiah-pacheco-injured-reserve, Sep 1); Yahoo "forcing the RB to miss at least four games" — eligible Wk 5, but DET's Wk 6 bye means a realistic Wk 7 return (board bye column: DET 6). The nflverse Week-1 roster snapshot does not yet reflect Sep 1-2 IR moves, so any other Sep 1-2 transaction is also invisible in roster_2026.csv.
   Fix: note 154 -> "IR (back/MCL), placed Sep 1; eligible Wk 5, DET bye Wk 6 so realistic return Wk 7; DET RB2/3 when back. IR stash only." No rank move. Note for the pipeline: do not treat roster_2026.csv status ACT as proof of health for moves after ~Aug 31.

8. **Josh Jacobs (91): "6-game suspension is the precedent" understates the open-ended exempt-list risk for League A.**
   Severity: medium (round 10 pick in League A; the plan sells him as a "Wk 8+ playoff asset").
   Evidence: data/roster_2026.csv GB EXE/E02; depth chart GB RB4. Search 2026-09-03: NBC Sports "Josh Jacobs placed on Commissioner Exempt List" (https://www.nbcsports.com/fantasy/football/player-news/2026-08-30/josh-jacobs-placed-on-commissioners-exempt-list): "no telling how long Jacobs will remain on the exempt list ... the process could extend deep into the 2026 season"; first court appearance is Nov 17 (after fantasy Wk 10). Footballguys (https://www.footballguys.com/article/2026-jacobs-placed-on-commissioner-exempt-list-how-should-we-proceed).
   Fix: append to note 91: "Exempt list has no fixed length and first court date is Nov 17 (Wk 10+): a Wk 8 return is a hope, not a schedule." Rank: in League A leave at 91 only if bench has 6 slots; otherwise drop to ~110 (after Concepcion/Croskey-Merritt). League B: already a pass.

9. **Tucker Kraft (71): note still says "Check practice status" — the ground truth answers it.**
   Severity: low (round 8; note is stale rather than wrong).
   Evidence: data/roster_2026.csv Kraft GB ACT/A01; data/depth_charts_2026.csv 2026-09-02 GB TE1 (Jonnu Smith TE2). research/03-news.md has no injury flag on him.
   Fix: replace "Check practice status; if healthy he is a TE1 at a TE7 price." with "ACT and listed GB TE1 on the Sep 2 chart, no injury flag in camp news: a TE1 at a TE7 price."

10. **Tyrone Tracy Jr. (158): nflverse chart lists him NYG RB2, but camp reporting has him behind Najee Harris/Singletary.**
    Severity: low (round 15/handcuff).
    Evidence: data/depth_charts_2026.csv 2026-09-02 NYG RB: Skattebo 1, Tracy 2, Najee Harris 3; research/03-news.md §1: "Tracy (neck) on 53 but buried behind Najee Harris/Devin Singletary"; §3: "Tracy/Najee Harris/Singletary 'OR' on line 2".
    Fix: add note: "Sep 2 chart: RB2 behind Skattebo, but camp reports have Harris/Singletary 'OR' with him; Skattebo handcuff is a three-way guess." No rank move.

11. **research/07-rookies.md contains draft-capital errors the board avoided but the plan cites the file.**
    Severity: low (board is correct; fix the research file so the Socratic pass does not re-import the errors).
    Evidence: data/draft_picks.csv season 2026: Jadarian Price R1 #32 SEA (07-rookies says "R2 ... projected ~46"); Makai Lemon R1 #20 PHI (07-rookies "Round UNVERIFIED"); KC Concepcion R1 #24 CLE (absent from 07-rookies table); Omar Cooper Jr. WR R1 #30 NYJ (absent everywhere; Sep 2 chart NYJ WR3); Kaelon Black RB R3 #90 SF; Emmett Johnson RB R5 #161 KC; De'Zhaun Stribling (07-rookies spells "Deshaun"). Jordyn Tyson team = NO (03-news §4 table says "team UNVERIFIED"; draft_picks says NOR, roster NO).
    Fix: correct those cells in 07-rookies.md and the 03-news draft table; no board change.

12. **Puka Nacua (4): note is accurate as of Sep 3 — no ruling yet; keep the "early-season only" framing but add the game date.**
    Severity: low (confirmation, no error).
    Evidence: Search 2026-09-03: SI "NFL Hands Out Suspensions, But Rams Still Await Decisions on Puka Nacua, Alaric Jackson" (https://www.si.com/nfl/rams/onsi/rams-puka-nacua-alaric-jackson-suspension-decisions); Deseret 2026-09-01. data/games.csv: SF@LA Thu 2026-09-10 (Melbourne).
    Fix: optional: "no ruling as of Sep 3; opener is Thu Sep 10 in Melbourne, so a ruling could land inside draft week."

13. **Other Week-1 status notes verified, no change needed** (listed so the next pass does not re-search them): Jeanty (24) — worked on the side Sep 1, Kubiak "counting on him", low-ankle per reports (Yahoo/TheBigLead 2026-09); Walker (26) — expected for Mon Sep 14 (PFN); Nabers (27) — cleared for contact, "reasonable to assume" Wk 1, no commitment (PFR 2026-09); Mahomes (77) — "on track" per Rapoport but not yet cleared for game action (CBS), note is fine; Kittle (89) — made the Australia trip Sep 2 after two positive practices (TotalProSports/Yardbarker 2026-09-02); Hampton (34) — the unverified SI injury headline resolves to LAC saying he will not be a locked-in workhorse (FTN "Chargers Throw Cold Water on Omarion Hampton's Workload"), which is what the note already says; Parker Washington (68) — Travis Hunter is JAX LCB1 and WR4 on the Sep 2 chart, so "CB first" is right; Collins (14) — Higgins RES/R01, Dell RES/R48 on the roster; Stribling (130) — Pearsall RES/R01, Kirk RES/R48; Evans (66) — Aiyuk not on any roster.

14. **Depth-chart QB1/RB1/WR1/WR2/TE1 starters absent from the board's top 200** (all RB1s and WR1s are present; nothing here is a real omission, ECR and 2025 ppg in build/master.csv agree with leaving them out):
    - QB1: Aaron Rodgers PIT (board 201), Geno Smith NYJ (206), Tua Tagovailoa ATL (253), Kirk Cousins LV (273), Deshaun Watson CLE (278).
    - TE1: Gunnar Helm TEN (205), Pat Freiermuth PIT (221), Cade Otton TB (223), Evan Engram DEN (236), Colby Parkinson LA (247), Mike Gesicki CIN (255), Mason Taylor NYJ (257), Charlie Kolar LAC (268), Tommy Tremble CAR (399).
    - WR2: Rashod Bateman BAL (211), Devaughn Vele NO (229), Darius Slayton NYG (244), Jahan Dotson ATL (260), Xavier Hutchinson HOU (272), Jalen Tolbert MIA (276).
    Only two are worth a waiver-watch line in plan_v1.md: Hutchinson (HOU WR2 with Higgins out for the year and Dell on IR through Wk 4 — the Collins note already names him) and Vele (NO WR2 while Tyson is on IR ~2 months). No rank moves.

# Contrarian critique of plan_v1 (Socratic pass, 2026-09-03)

Scope: argue against the plan's structure and find where it loses championships. Inputs: plan_v1.md, board_A/B.csv, master.csv (2025 actuals under each league's exact scoring), research/00, 01, 04, 05, plus 02-adp-notes and 03-news for room prices/status. New computations this pass: `build/sim_espn.py` (deterministic ESPN-shifted board), `build/mc_espn.py` / `build/mc_pocket.py` (1,500-2,000-run Monte Carlo of an ESPN room), `build/weekly.py` (2025 weekly variance, Weeks 15-17 splits, ceiling frequency under League-A scoring). Three web searches used (of 5): Stafford ESPN price, Lloyd/Skattebo ESPN ranks, ESPN QB/TE ADP behaviour.

Room model: ESPN drafters anchor on ESPN's printed list. Base = FantasyPros ECR x {RB 0.75, WR 1.15, TE 1.05, QB 1.25}, overridden by the ESPN-specific prices already in research/02 (Love ~25, Collins ~28, D.Smith 39, Henderson ~75, Godwin 147, Kyler ~115, Herbert ~110, Bowers 16, McBride 19, Allen 19, Lamar 37, Daniels 63, CMC 7.75, Achane 11, C.Brown 14, Barkley 15, Henry 16, Walker 20, Hampton 15.5, Hall 31.5, Loveland 41, Warren 52, Kraft 74, LaPorta 78, Kittle 98, McMillan 40, McLaurin 51, Waddle 53, Burden 57, Moore 63, Skattebo 41, Lloyd 70). Monte Carlo adds Gaussian noise (sd = 0.8 x ECR sd x position multiplier, floor 2). Two known biases of this model, both of which make the plan look BETTER than reality: (1) Mike Clay's ESPN list has Lloyd #34 and Skattebo #20 overall (search, Sep 2026), so both go earlier than modelled; (2) ESPN "pushes elite QBs way up" (search), so Allen/Lamar availability below is optimistic.

---

## A. Numbered findings (ordered by severity)

### F1. CRITICAL - The plan states the ESPN RB shift (thesis point 6) but never applies it to its own RB target lists. The R6 RB2 tier is 0-2% available; the R10 RB4 tier is 0%.
Evidence (MC, League A / League B):
- Pick 59 / 57 "RB2 tier" - Skattebo 0%/0%, Irving 0%/1%, Judkins 2%/4%, Kyren 0%/0%, Javonte 0%/0%, Etienne 0%/0%, Montgomery 1%/2%, Swift 0%/0%. Price 30%/39%, Tuten 9%/15%. The list is empty in both leagues.
- Pick 99 / 97 "RB4 upside" - Dowdle 0%, Dobbins 0%, Harvey 0%, Gainwell 0%, Hubbard 1%, Pollard 0%, Marks 69%/77%. Only Marks survives.
- Pick 39 / 37 "RB only if Jeanty/Walker/Henry/Hall fall" - Hall 3%/9%, Kyren 5%/11%; Jeanty/Walker/Henry are gone by ~23.
- Round mix in the simulated room: 4.0-5.2 RBs per round in EVERY round R1-R10 (R8-R9: 4.5-4.6). There is no R7-R10 RB pocket in this room; the BBM/NFFC "RB2 after R7" pocket exists in consensus rooms, not ESPN rooms.
- Where the RB2 tier actually is: at 39/42 (A) or 37/44 (B) - Judkins 81%/72%, Montgomery 81%/69%, Irving 67%/55%, Skattebo 47%/32%, Swift ~35%. At 59-64 the real RB tier is Stevenson 46%, Warren 45%, Price 30%, Henderson 99%, Dowdle 75%, Lloyd ~57% (optimistic - see bias 1).
Fix: shift every RB target up ~1.5 rounds and every WR3-5 target down ~1.5 rounds. R4/R5 = Judkins, Montgomery, Irving, Skattebo, Swift (plus Higgins/Egbuka/Waddle as the WR option). R6/R7 = Stevenson, Warren, Price, Henderson, Dowdle (Lloyd only as a League-B dart). R10 = Marks, Allgeier, Bigsby, Emmett Johnson (the actual survivors). Buy WR3-5 at 59-102 where the ESPN discount is deepest: Odunze 82%, Jameson 68%, DJ Moore 64%, Burden 44% at 59; Wan'Dale 90%, M. Wilson 88%, Sutton 85%, BTJ 85%, Metcalf 79% at 82; Q. Johnston 69%, Pierce 57%, Lemon 58%, Meyers 61% at 102.

### F2. HIGH - Zero-RB and "WR-WR-WR then RBs" are the WORST structures in this specific room; the plan's Hero-RB + WR-heavy shape drifts toward them by default because of F1.
Evidence: the strategy doc's Zero/Hero-RB support (BBM, NFFC) assumes RBs are available late. In this room the RB3/RB4 you can actually buy after pick 62 are Marks (9.1 ppg 2025), JCM (8.6), Allgeier (7.2), Mason (8.2), Bigsby (3.8). Lineup projection under League-A 2025 ppg (names with >=50% availability only):
- Plan as written (2 Gibbs, 19 McBride, 22 Collins, 39 Higgins, 42 Egbuka/Waddle, 59 Odunze [RB tier empty], 62 Henderson, 79 Herbert, 82 Wan'Dale, 99 Marks): QB 18.4 + RB 22.5/12.5 + WR 15.4/14.2 + TE 18.8 + FLEX 12.4/12.2 = 126.4.
- Same start, RB at the break (39 Judkins/Montgomery, 42 Irving/Skattebo, 59 Odunze, 62 Jameson/Henderson): 128.7 - and an RB3 exists.
- Robust-RB (19 Jeanty, 22 Walker/Love, 39 Higgins, 42 Egbuka, 59 Odunze, 62 Kraft): 126.2 on 2025 numbers, which under-credit Jeanty/Walker/Love's 2026 roles; highest variance, pays the ESPN premium.
- Zero-RB (2 Chase, 19 McBride, 22 Collins, 39 Higgins, 42 Waddle, 59 Odunze, 62 Henderson, 82 Gainwell/Mason, 99 Marks): ~121. Loses 5+ ppg because two RB slots must be filled from the RB25-45 pool.
Fix: the plan must guarantee two startable RBs by pick 42 (League A) / 44 (League B), not by 59/57. Exit R5 with RB-RB/WR-WR or RB-WR/WR-TE; never exit R5 with one RB in this room.

### F3. HIGH - League B QB fork is mis-sequenced: Maye at 37 should be the DEFAULT, Lamar at 44 is unavailable, Allen at 37/42 is fantasy, and Stafford at 77 is a hope.
Evidence:
- MC: Allen 0% at 37/39/42/44; Lamar 54% at 37 but ~20% at 44 (and ESPN pushes him up further - bias 2); Maye 81% at 37, 63% at 44, 23% at 57.
- Stafford: consensus ADP 104.9/QB12 but "elevated price tag on ESPN" (Yahoo/PFN, Sep 2026). In a 6-pt room where the sheet shows 46 TD, he will not be a R8 pick.
- League-B VOR from master.csv ppgB: Allen 26.3, Stafford 26.6, Maye 24.5, Purdy 24.6 (9 g), Mahomes 23.8, Lawrence 23.4, Dak 22.7, Goff 22.2, Caleb 22.0, Herbert 21.8, Burrow 21.6, Nix 21.3, D. Jones 20.6. Replacement (QB11) ~20.6-21.3. Maye VOR ~+3.5-4.0; the WR alternatives at 37 (D. Smith 12.1, Higgins 14.2, McMillan 12.7, McConkey 11.5 - VOR +0.5 to +2.5) are worse by the plan's own math. Maye also has the lowest weekly CV of any QB (0.26, sd 5.4), 17 games, 25.5 ppg in Weeks 15-17 - exactly the floor a 6-of-10 league needs.
- Lamar 2025: 16.5/19.8 ppg, 13 games, 2 rush TD, new OC. Paying pick 37 for 2024 Lamar in a 6-pt league is paying for a rushing profile the format discounts.
Fix (League B): 37 = Maye (default). If Maye is gone: 44 = Stafford if there (rare), else 57/64 = Stafford/Herbert/Lawrence/Mahomes - i.e. move the QB window from R8 to R6/R7. Remove Lamar from the 44 list. Remove "Allen at 37/42" from both plans.

### F4. HIGH - McBride at 19 is under-argued, not over-argued. He is the highest-VOR player likely on the board at 19 in League A.
Evidence: Jefferson 1%, London 29%, AJB 46% at 19; McBride 67% (Bowers 41%). VOR (plan's own League-A curve): TE1 +7.8 vs WR9-12 +3.5-4.3. Weekly file: McBride 18.8 ppg, 17 games, 24% weeks >= 25 (more than Collins 0%, AJB 20%, Olave 19%), Weeks 15-17 23.1 ppg. In a 2-FLEX lineup his raw ppg (18.8) beats every WR likely available at 19 (Collins 15.4, Rice 18.9 in 8 g, Pickens 17.6, Olave 17.0, AJB 15.2). Risk: Brissett replaces Kyler; MHJ healthy. Counter: McBride's 2024 with Kyler was 15.5 - still TE1-2.
Fix: League A at 19 - McBride if there, full stop; AJB/London only if McBride is gone. League B at 17/24 - McBride at 24 is only 32% available, so if the R1 pick was a WR and Jeanty/Walker are the RB options at 17, take McBride at 17 (78%) and the RB (Judkins/Montgomery tier) at 37/44. Do not take Loveland at 39 as the TE fallback (see F11); Kraft (86% at 62) or Pitts (66% at 79) are the fallbacks.

### F5. MEDIUM - Hero-RB breaks the moment Gibbs misses time, because the plan carries no second startable RB until R7.
Evidence: 2 RB slots are mandatory. With Gibbs out, the plan starts two of {Henderson 12.5, Marks 9.1, JCM 8.6, Vaki n/a} - roughly 10 ppg each vs RB30 replacement 11.5, i.e. below waiver level. RB long-run games missed 3.3/yr (research 01, 8a); 2025 was the outlier-healthy year. Gibbs's own 2025 weekly profile: sd 15.3, CV 0.68 (highest of any top-10 RB), Weeks 15-17 13.0 ppg.
Fix: F1/F2 (RB at 39/42). Also take the Vaki handcuff in R14 in League A regardless (Pacheco IR, Montgomery gone - Vaki is the only body).

### F6. MEDIUM - "WR-heavy = Weeks 15-17 ceiling" is asserted, not shown; the 2025 data point runs the other way.
Evidence (weekly.py, League-A scoring, players >= 8 games): top-24 RB mean Weeks 15-17 = 17.7 vs season 16.7; top-8 TE 18.7 vs 14.0; top-12 QB 21.6 vs 19.5; top-30 WR 14.4 vs 15.1. Ceiling frequency: top-24 RB 17% of weeks >= 25, top-30 WR 14%. Weekly CV: RB 0.55, WR 0.57, QB 0.42. One season, n = 3 weeks - not proof, but it means the plan cannot claim WR-heavy is the ceiling play for Weeks 15-17. Bijan (34.1), Henry (30.8), Chase Brown (27.0), CMC (27.5), Olave (28.7), Nacua (33.2), McBride (23.1), Pitts (23.1), Kittle (24.4) were the Weeks 15-17 spike players; Gibbs (13.0), London (3.5), Jefferson (8.6), Egbuka (6.8), Waddle (5.8) were not.
Fix: state the ceiling metric explicitly (best-6 average is fine) and stop using "8-of-10 playoffs" as a reason to prefer WR over RB. Use it only for what it actually implies: early-season suspensions/injuries are cheap (Nacua, Jacobs, Tyson).

### F7. MEDIUM - Lloyd at 56 (R7 target) is unbuyable at value in an ESPN room and is near-worthless for League A's objective.
Evidence: Mike Clay #34 overall on ESPN; ESPN's own mock had him R6 in a 12-team (pick ~65-72 = R5/R6 in a 10-team). Kaleb Johnson was acquired Aug 30 (committee risk). Jacobs's exempt-list absence is ~6 weeks; Lloyd's fantasy window closes around Week 8, seven weeks before the only weeks League A cares about. One career game.
Fix: remove Lloyd from board A's top 100. League B: dart at 57/64 only if RB2 is still empty (it should not be, per F2). The League A playoff RB in that backfield is Jacobs (15.8 ppg) - see F9.

### F8. MEDIUM - "R14: own handcuff OR IR stash" is a false choice. The IR slot is a 16th roster spot, so the IR stash is free.
Evidence: 9 starters + 6 bench = 15 picks; IR is additional. Drafting an IR-eligible player and moving him to IR returns the bench slot. So the right sequence is R13 = IR stash (moves to IR immediately), R14 = handcuff, R15 = DST - three assets for three picks instead of two.
Caveats to verify on the ESPN league page before Thursday: (a) which designations the IR slot accepts (ESPN default is IR/O; PUP and Commissioner's Exempt/SSPD depend on the league setting); (b) Tyson (NFL IR) qualifies under any setting; Charbonnet (reserve/PUP) and Jacobs (exempt list) may not.
Ranking of the stash, League A: Jacobs (if eligible) > Tyson > Charbonnet > Conner. Jacobs: RB1 volume from ~Week 8, 15.8 ppg 2025 (but 9.8 in Weeks 15-17). Tyson: #8 overall pick, NO WR2 behind Olave, back ~Week 8; R1 rookie WR top-24 rate 28%. Charbonnet: PUP 4+, behind Price/Holani when back. Conner: 31, IR ankle 4+, third on the depth chart - zero.
League B: Tyson > Charbonnet; Jacobs is a pass (6-of-10 playoffs, and his 9.8 Weeks 15-17 does not justify it).

### F9. MEDIUM - Pick-4 contingency (Gibbs/Bijan/Chase gone) is under-specified; JSN vs Nacua vs CMC needs a rule, and it differs by league.
Evidence: JSN 22.0 ppg, floor 19.8 (highest of any WR), CV 0.36 (lowest), 17 games, 36% target share. Nacua 24.4 ppg, best-6 35.4, Weeks 15-17 33.2, but sd 11.8, 16 games, unresolved NFL conduct review (no ruling Sep 1; suspension possible for Sep 10). CMC 25.2 ppg (RB1 overall), floor 17.6, CV 0.36, Weeks 15-17 27.5, but age 30.3, 450 touches, calf strain, no preseason, questionable Week 1; age-30 RB top-20 seasons: 8 (research 01, 8b). Two-pick sums (2025 ppg): CMC@4 + Collins@17 = 40.6; JSN@4 + Collins@17 = 37.4 but no RB; JSN@4 + Jeanty@17 = 36.8. Discount CMC by 30% missed games -> ~36.5. It is a coin flip on paper, decided by the calf and the league format.
Decision rule, League B (pick 4, 6-of-10): JSN > CMC > Nacua. CMC only if he logged full practices the week of Sep 6; Nacua drops to third because a multi-game suspension is expensive in a 6-of-10 league. Then 17 = best RB of Achane/Cook/C.Brown if any fell, else Jeanty (80%) / Walker (84%) / McBride (78%) per F4; 24 = Collins (95%) / Olave (45%) / Rice (80%).
(League A is pick 2: Gibbs/Bijan are guaranteed; if both somehow go 1.01/1.02 - impossible - Chase.)

### F10. MEDIUM - 19/22 contingency when Jefferson/London/AJB/McBride are all gone (~15-20% of rooms) needs an explicit ceiling-vs-floor rule, and Collins is the wrong default for League A.
Evidence: availability at 19/22 - Collins 100%/99%, Rice 92%/87%, Pickens 88%/76%, Olave 78%/61%, Nabers -/85%, Walker 74%/54%, Jeanty 70%/52%, Bowers 41%/19%, Love -/89%. Ceiling (2025 best-6 League A): Pickens 29.2, Olave 25.3, Collins 22.5, Rice 22.4 (8 g), Nabers 14.7 (4 g). Weeks >= 25: Rice 38%, Pickens 29%, Olave 19%, Collins 0%. Floor/volume: Olave 156 tgt/16 g, Collins 25% share with Higgins (ACL) and Dell (IR) out, Rice 9.8 tgt/g but Mahomes off ACL/LCL and no preseason snaps.
Rule, League A at 19/22: Pickens > Olave > Rice > Collins (ceiling first), pairing one of them with Walker/Jeanty at 22 if the WR run leaves an RB. Rule, League B at 17/24: Olave > Collins > Rice > Pickens (volume first). Bowers at 19 (41%) over any of them in League A only if McBride is gone AND Pickens/Olave are gone.

### F11. MEDIUM - Loveland at 39 as the TE fallback is the worst TE price on the board.
Evidence: 10.4 ppg rookie, 17% share; TE10 replacement is 11.1 ppg - his 2025 VOR is negative. Kraft 15.0 ppg (8 g), 86% available at 62; Pitts 12.5 ppg, 118 tgt, 17 games, Weeks 15-17 23.1, 66% at 79; Fannin 11.7/107 tgt, 44% at 79; Kittle 14.8 (Achilles), 87% at 79. ESPN price on Loveland is ~41.
Fix: never Loveland at 39/42; TE fallback order = Kraft (62) > Pitts (79) > Kittle/Fannin (79-82).

### F12. LOW - "No QB2 / TE2 / DST2" is right, and the room makes it even more right; but the plan's QB timing in League A is one round too early.
Evidence: at 99/102 - Kyler 93%/89%, Dart 75%/73%, Nix 77%, Purdy ~98%, D. Jones ~99%, Mahomes/Stafford ~100% (consensus-based; ESPN elevates Stafford). At 79/82 - Herbert 94%/92%, Lawrence 93%/88%, Dak 94%/91%. The QB10-12 line in League A is 17.5-18.4 ppg; Kyler (500+ rush yds projected) at 99 is the cheapest rushing floor. RB/WR at 79/82 in this room: the RB pocket is thin (Dobbins 34%, Hubbard 31%, Harvey 28%, Gainwell 32%) but the WR pocket is fat (Wan'Dale 90%, M. Wilson 88%, Sutton 85%, BTJ 85%, Metcalf 79%).
Fix, League A: 79/82 = WR + WR (or WR + Kraft/Pitts if no TE); QB at 99 (Kyler/Dart/Nix/Herbert-if-he-slides). Keep zero QB2/TE2/DST2; with 10 starting QBs and 6 bench spots that must hold 3 RBs, a QB2 is a dead slot. League B keeps the R4 Maye fork (F3).

### F13. LOW - Board-rank quibbles that rarely matter at picks 2/4 but matter if they fall.
- Jefferson at 9 (both boards): 2025 12.1 ppg, best-6 18.5, 0% weeks >= 25, Weeks 15-17 8.6; ranked above Lamb/London/AJB on a TD-regression argument. He is 1%/4% available at 19/17, so the rank is moot - but if he does fall he should be behind London/AJB, not ahead.
- Gibbs vs Bijan at 1/2: closer than the plan implies. Bijan CV 0.49, floor 14.7, 103 tgt, Weeks 15-17 34.1; Gibbs CV 0.68, Weeks 15-17 13.0, but best-6 38.5 and every DET touch with Montgomery/Pacheco gone. Keep Gibbs; do not treat Bijan as a consolation.
- Nacua 4 vs JSN 5 on board A: correct for League A (8-of-10; suspension cheap); reversed on board B - also correct.
- Jacobs at 91 (A): as the League A Weeks-15-17 RB asset he is the R10/R11 pick (ESPN ~95) ahead of the R11 WR5 list, IF the IR slot accepts exempt-list players (F8). If not, he is a R13-14 bench hold.

---

## B. Structure steelmen and championship-equity verdict

Using the plan's own VOR (League A 2025): RB1 +13.8, RB5 +9.5, RB10 +4.4, RB20 +2.3; WR1 +12.7, WR5 +7.2, WR10 +4.3, WR20 +1.4; TE1 +7.8, TE2-4 +4; QB1 +5.3 (4-pt) / +5.0 (6-pt). Replacement (weekly.py): RB30 11.5, WR30 11.8, TE10 11.1, QB10 18.4 (A). Room facts from the MC: RBs go 4-5 per round through R10; WR1s slide to 19-24; WR3-5 slide 1-2 rounds.

| Structure | Steelman | Where it wins | Where it dies here | Equity verdict A (pick 2, 8/10) | Equity verdict B (pick 4, 6/10) |
|---|---|---|---|---|---|
| Robust-RB (RB-RB-RB early) | RB VOR is steeper at the top (RB5 +9.5 vs WR5 +7.2); 2 RB slots are mandatory; RB Weeks-15-17 spike (2025: 17.7 vs 16.7); RotoViz 2026 says "extreme RB destroys home leagues"; rookie R1 RBs hit top-24 71%. | Rooms that let RBs slide. Injury-heavy RB seasons (2021-24 base rate) reward depth. | This room does NOT let RBs slide (Achane 10%, Cook 11%, C.Brown 21% at 19). RB-RB at 19/22 means Jeanty (ankle) + Walker (new team, RB28 ppg 2025) at a premium; ETR: 3+ RB in first five rounds never beat baseline. | 2nd. Gibbs + Jeanty/Walker + WR at 39/42 is only ~0.2 ppg behind the plan on 2025 numbers with far more RB insurance. | 3rd. At pick 4 the R1 is a WR unless Gibbs/Bijan fall; RB-RB at 17/24 buys Jeanty + Love, two ankle sprains. |
| Zero-RB (no RB until R6) | Full PPR lifts WRs; WR R1 hit rate > RB; BBM winners 2023-25 were WR-heavy; WRs are the ESPN discount pocket. | Consensus rooms with an R7-R10 RB pocket. | No RB pocket after R6 in this room (F1); RB3/RB4 = Marks/JCM/Allgeier. Two mandatory RB slots filled below replacement. | 4th (worst). ~5 ppg behind on 2025 numbers. | 4th. Same, and 6/10 playoffs punish the early-season hole. |
| Elite-TE + elite-QB early (B only) | League B QB1-vs-QB11 gap ~5-6 ppg beats RB10-RB20 (2.1) or WR10-WR20 (2.9); Maye CV 0.26; TE1 VOR +7.8 is the single largest edge after R1. | If Allen (17) or McBride (17/24) are actually there. | Allen 0% by 24 in practice (ESPN pushes QBs up); McBride 32% at 24; combining both costs the RB2 slot and lands you in the Zero-RB trap. | n/a (4-pt; QB late is right) | 2nd - as "one of the two": Maye at 37 (default) OR McBride at 17. Not both early. |
| WR-WR-WR then RBs | WR1s at 19/22 are the room's biggest discount; Chase 2024 24.5 ppg. | Rooms that take 6-7 RBs in R1. | Throws away Gibbs/Bijan (guaranteed at 2). Chase@2 + Jeanty@19 (35.1) < Gibbs@2 + Collins@19 (37.9). | 3rd. | At pick 4 this IS the plan's R1 (Chase/JSN) - fine, as long as an RB comes at 17 or 37. |
| Plan as written (Hero-RB, WR-heavy, RB2 at R6) | Documented best BBM/NFFC shape. | Consensus rooms. | The R6 RB2 does not exist here (F1); Gibbs injury = below-replacement RB slots (F5). | 1st ONLY after the F1/F2 fix (RB at 39/42, WR at 59-102). Unfixed, it is 3rd. | 1st after F1/F3 fixes (RB at 17 or 44, Maye at 37). |

Recommended shape, League A pick 2: Gibbs / McBride (or AJB, London) / best of Pickens-Olave-Rice-Collins / RB (Judkins-Montgomery-Irving-Skattebo) / RB or WR (Higgins-Egbuka-Waddle) / WR (Odunze-Jameson-Moore) / Henderson-Stevenson-Dowdle / WR (Wan'Dale-M.Wilson-Sutton) / WR or Kraft-Pitts / Kyler-Dart / Marks-Allgeier / WR dart / IR stash / Vaki / DST. Exit R6: 2-3 RB, 2-3 WR, 1 TE. Exit R9: 3 RB, 4-5 WR, 1 TE, 0-1 QB.

Recommended shape, League B pick 4: Chase or JSN / RB (Achane-Cook-C.Brown if they fall; else Jeanty-Walker) or McBride / Collins-Olave-Rice / Maye / RB (Judkins-Montgomery-Irving) / WR (Odunze-Jameson-Moore) / Henderson-Kraft / WR (Wan'Dale-M.Wilson-Sutton-Metcalf) / Pitts-Fannin or WR / Marks-Allgeier / WR dart / IR stash (Tyson) / handcuff / DST. If Maye is gone at 37: Stafford/Herbert/Lawrence at 57/64.

---

## C. Simulated ESPN room, rounds 1-6 (deterministic pass, sim_espn.py)

Pick = board position in the shifted room. A/B marks the user's picks. ECR = FantasyPros overall; ESPN est = modelled room price.

| Pick | Player | Pos | ECR | ESPN est | | Pick | Player | Pos | ECR | ESPN est |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Ja'Marr Chase | WR | 2 | 1.8 | | 31 | Breece Hall | RB | 40 | 31.5 |
| 2 A | Jahmyr Gibbs | RB | 2 | 1.9 | | 32 | Javonte Williams | RB | 45 | 33.5 |
| 3 | Bijan Robinson | RB | 4 | 3.1 | | 33 | Garrett Wilson | WR | 30 | 34.1 |
| 4 B | Puka Nacua | WR | 3 | 3.7 | | 34 | Zay Flowers | WR | 30 | 34.8 |
| 5 | Jaxon Smith-Njigba | WR | 5 | 5.4 | | 35 | Travis Etienne | RB | 48 | 35.7 |
| 6 | Amon-Ra St. Brown | WR | 5 | 6.2 | | 36 | Lamar Jackson | QB | 32 | 37.0 |
| 7 | Christian McCaffrey | RB | 9 | 7.8 | | 37 B | DeVonta Smith | WR | 24 | 39.0 |
| 8 | Jonathan Taylor | RB | 12 | 8.9 | | 38 | Tetairoa McMillan | WR | 36 | 40.0 |
| 9 | CeeDee Lamb | WR | 9 | 10.3 | | 39 A | Ladd McConkey | WR | 35 | 40.1 |
| 10 | Justin Jefferson | WR | 9 | 10.8 | | 40 | Colston Loveland | TE | 37 | 41.0 |
| 11 | De'Von Achane | RB | 21 | 11.0 | | 41 | Cam Skattebo | RB | 57 | 41.0 |
| 12 | James Cook | RB | 16 | 12.0 | | 42 A | D'Andre Swift | RB | 55 | 41.0 |
| 13 | Chase Brown | RB | 18 | 14.0 | | 43 | Tee Higgins | WR | 37 | 42.4 |
| 14 | Drake London | WR | 13 | 14.8 | | 44 B | Bucky Irving | RB | 59 | 44.0 |
| 15 | Saquon Barkley | RB | 24 | 15.0 | | 45 | David Montgomery | RB | 61 | 46.0 |
| 16 | Omarion Hampton | RB | 26 | 15.5 | | 46 | Quinshon Judkins | RB | 62 | 46.5 |
| 17 B | Brock Bowers | TE | 19 | 16.0 | | 47 | Emeka Egbuka | WR | 41 | 47.0 |
| 18 | Derrick Henry | RB | 38 | 16.0 | | 48 | Drake Maye | QB | 38 | 47.1 |
| 19 A | A.J. Brown | WR | 14 | 16.4 | | 49 | Bhayshul Tuten | RB | 67 | 50.4 |
| 20 | Trey McBride | TE | 21 | 19.0 | | 50 | Terry McLaurin | WR | 47 | 51.0 |
| 21 | Josh Allen | QB | 26 | 19.0 | | 51 | Tyler Warren | TE | 53 | 52.0 |
| 22 A | Ashton Jeanty | RB | 26 | 19.8 | | 52 | Jaylen Waddle | WR | 35 | 53.0 |
| 23 | Kenneth Walker III | RB | 26 | 20.0 | | 53 | Jadarian Price | RB | 73 | 54.9 |
| 24 B | Chris Olave | WR | 18 | 20.7 | | 54 | Luther Burden III | WR | 47 | 57.0 |
| 25 | George Pickens | WR | 20 | 23.5 | | 55 | Joe Burrow | QB | 46 | 57.3 |
| 26 | Jeremiyah Love | RB | 41 | 25.0 | | 56 | Davante Adams | WR | 50 | 57.6 |
| 27 | Nico Collins | WR | 16 | 28.0 | | 57 B | Rhamondre Stevenson | RB | 77 | 58.0 |
| 28 | Malik Nabers | WR | 25 | 28.2 | | 58 | Jaylen Warren | RB | 77 | 58.0 |
| 29 | Rashee Rice | WR | 25 | 28.4 | | 59 A | Jameson Williams | WR | 55 | 63.0 |
| 30 | Kyren Williams | RB | 42 | 31.1 | | 60 | DJ Moore | WR | 52 | 63.0 |

Picks 61-80 in the same pass: Daniels, Pollard (62 A), Evans, Odunze (64 B), Watson, Dowdle, Brooks, Lloyd (68), Hurts, P. Washington, Harvey, Kraft, Hubbard, Henderson (74), Gainwell, Dobbins, Fannin (77 B), LaPorta, Tate (79 A), MHJ.

Simulated positional mix per round (MC average): R1 4.8 RB / 5.1 WR; R2 5.2 RB / 3.3 WR / 1.1 TE / 0.5 QB; R3 4.0 / 4.2 / 0.9 / 0.9; R4 4.5 / 4.2 / 0.4 / 0.8; R5 4.2 / 4.2 / 0.7 / 1.0; R6 4.0 / 4.2 / 0.7 / 1.1; R7 4.2 / 3.7 / 1.0 / 1.1; R8 4.6 / 2.9 / 1.6 / 1.0; R9 4.5 / 2.9 / 1.5 / 1.1; R10 4.3 / 3.2 / 1.2 / 1.3.

### Plan-target survival, Monte Carlo P(available) - League A (pick 2)
| Pick | Plan's named targets: alive (P) | Plan's named targets: effectively gone (P <= 30%) | Verdict |
|---|---|---|---|
| 19 | Collins 100, Rice 92, Pickens 88, Olave 78, McBride 67, AJB 46 | Jefferson 1, Achane 10, Cook 11, C.Brown 21, London 29 | List is half-empty at the top; McBride/AJB are the real R2 |
| 22 | Collins 99, Rice 87, Nabers 85, Pickens 76, Olave 61, McBride 46 | AJB 26, Achane/C.Brown ~0 | OK for WR; McBride coin flip |
| 39 | Waddle 98, Egbuka 91, Higgins 74, Loveland 60, McMillan 59, McConkey 58, D.Smith 54 | Flowers 31, G.Wilson 26, Rice 12, Nabers 11, Kyren 5, Hall 3, Jeanty/Walker/Henry 0 | RB fallback list empty; WR list fine |
| 42 | Burden 98, McLaurin 95, Waddle 94, Egbuka 81, Judkins 81, Montgomery 81, Irving 67, Higgins 55, Skattebo 47 | D.Smith 36, McConkey 41, Flowers 21, G.Wilson 15, Allen 0 | This is where the RB2 tier lives, not R6 |
| 59 | Odunze 82, Jameson 68, Moore 64, Stevenson 46, Warren 45, Adams 45, Burden 44 | Every plan RB2 name 0-2%; Price 30, Tuten 9 | EMPTY - critical |
| 62 | Henderson 99, Kraft 86, Dowdle 75, Odunze 71, Watson 68, Evans 61, Lloyd 57 (optimistic) | Stevenson 26, Warren 22, Price 18, Tuten 3 | Henderson/Dowdle/Kraft are the picks |
| 79 | Dak 94, Herbert 94, Lawrence 93, BTJ 85, Mahomes 67, Pitts 66, Caleb 66, Stafford 59* | Dobbins 34, Gainwell 32, Hubbard 31, Harvey 28, Dowdle 6, Burrow 4 | QB list fine; "WR4 if QBs gone" is backwards - QBs stay, RBs go |
| 82 | Herbert 92, Dak 91, Wan'Dale 90, M.Wilson 88, Lawrence 88, Sutton 85, Metcalf 79 | Kraft 25, Gainwell 21, Dowdle 3 | WR pocket, not RB |
| 99 | Kyler 93, Nix 77, Dart 75, Allgeier 73, Marks 69 | Dowdle/Dobbins/Harvey/Gainwell/Hubbard/Pollard 0-1, Mason 11, JCM 8, Corum 4 | EMPTY - the "RB4 upside" list is gone |
| 102 | Kyler 89, Dart 73, Q.Johnston 69, Meyers 61, Lemon 58, Pierce 57, M.Wilson 45, Diggs 38 | Pittman 22, Mason 6, JCM 4 | WR5 list OK |
| 119 | D.Jones 98, E.Johnson 87, Stafford 81*, Bigsby 74, Lemon 66, Dart 55 | Kyler 29, Herbert 23, JCM/Corum/Mason 0 | Handcuff-plus list (JCM, Corum, Mason, Monangai) is gone; Bigsby/E.Johnson/Vaki remain |
*Stafford modelled at consensus; ESPN price is elevated (search) - treat as ~50% at 79 and lower in League B.

### Plan-target survival - League B (pick 4)
| Pick | Alive (P) | Gone (P <= 30%) | Verdict |
|---|---|---|---|
| 17 | Collins 100, Rice 95, Pickens 93, Allen 91 (optimistic), Olave 87, Walker 84, Jeanty 80, McBride 78, AJB 60, Henry 57, Bowers 57, Barkley 50, London 49, C.Brown 37 | Cook 20, Achane 17, Taylor ~0, Jefferson 4 | "Taylor/Achane/Cook" are not R2 options; Jeanty/Walker/McBride are |
| 24 | Collins 95, Rice 80, Nabers 79, Love 78, Pickens 65, Olave 45 | McBride 32, Allen 18, AJB 15, Bowers 9 | McBride is an R2 (17) pick or nothing |
| 37 | Waddle 99, Egbuka 94, Higgins 83, Maye 81, McMillan 71, McConkey 70, Loveland 67, D.Smith 66, Lamar 54 | Flowers 41, G.Wilson 37, Rice 17, Nabers 16, Allen 0 | Maye is the pick |
| 44 | Burden 96, McLaurin 91, Waddle 91, Judkins 72, Egbuka 71, Montgomery 69, Maye 63, Irving 55, Higgins 44 | Skattebo 32, McMillan 29, McConkey 29, D.Smith 25, Lamar ~20, Allen 0 | RB2 tier lives here |
| 57 | Odunze 87, Jameson 76, Moore 71, Warren 62, Stevenson 61, Adams 56, Burden 54, Burrow 53 | Every plan RB2 name 0-4%; Price 39, Maye 23 | EMPTY - critical |
| 64 | Henderson 97, Kraft 82, Hurts 69, Dowdle 65, Odunze 62, Watson 60, Lloyd 54, Evans 52 | Stevenson 16, Warren 12, Tuten 2 | Henderson/Dowdle/Kraft |
| 77 | Dak 96, Lawrence 94, Herbert 94, BTJ 88, Pitts 73, Caleb 71, Mahomes 67, Stafford 59* | Dobbins 44, Gainwell 41, Kraft 40, Hubbard 38, Harvey 36, Dowdle 10, Burrow 6 | Stafford is a coin flip at best on ESPN |
| 84 | Herbert 92, Dak 88, Wan'Dale 86, M.Wilson 85, Lawrence 85, Sutton 81, Metcalf 73 | LaPorta 31, Fannin 24, Kraft 20, Gainwell 14 | WR pocket |
| 97 | Kyler 95, Nix 77, Marks 77, Dart 76 | All plan RB4 names 0-1; Mason 15, JCM 12, Corum 6 | EMPTY |

---

## D. Contingency trees (decision rules)

**League A, pick 19/22 - Jefferson, London, AJB, McBride all gone (P ~ 15-20%).**
1. 19: Pickens (best-6 29.2, 29% weeks >= 25) > Olave (156 tgt, Weeks 15-17 28.7) > Rice (38% weeks >= 25 but Mahomes/Bieniemy unknowns) > Collins (0% weeks >= 25). If Bowers is there (41%) and Pickens/Olave are not, Bowers.
2. 22: the other of Pickens/Olave/Rice/Collins - UNLESS Walker (54%) or Jeanty (52%) is there, in which case take the RB at 22 and push the WR2 to 39 (Waddle 98%, Egbuka 91%, Higgins 74%). Never Love (89% at 22): ESPN's most overvalued player, high-ankle sprain, Allgeier listed first.
3. If a WR run leaves two of Walker/Jeanty/Henry at 19/22: take one RB + one WR, never two RBs (ETR rule) - the WR discount at 39-62 is where the room refunds you.

**League A, pick 39/42 - WR2 tier (D.Smith, Rice, Nabers, G.Wilson, Flowers, McMillan) gone (P ~ 40%).**
1. 39: RB from Judkins/Montgomery/Irving/Skattebo/Swift (whichever is highest on this order: Skattebo > Irving > Judkins > Montgomery > Swift for League A ceiling; Judkins > Montgomery > Irving for League B floor). If none, Higgins (74%).
2. 42: the other slot - WR from Waddle/Egbuka/Burden/McLaurin if 39 was an RB; RB from the same list if 39 was Higgins. Maye is NOT a League A pick (4-pt).
3. Only exception: McBride/Bowers still there at 39 (rare, <10%) - take him and go RB-RB at 42/59.

**League A, pick 59/62.** RB tier is gone. 59: WR from Odunze/Jameson/Moore/Burden (League A: Jameson best-6 23.4 > Odunze > Moore) unless Stevenson/Warren/Price is there and the roster has fewer than 2 startable RBs. 62: Henderson (99%) if the roster has < 3 RBs; else Kraft (86%) if no TE; else Dowdle (75%).

**League B, pick 4 - Gibbs, Bijan, Chase gone.**
1. JSN (default; floor 19.8, CV 0.36, 17 games).
2. CMC over JSN only if CMC logged full practices Sep 2-5 AND the user accepts age-30/450-touch variance; in that case 17 = WR (Collins/Olave/Rice) not RB.
3. Nacua third: unresolved conduct review; in a 6-of-10 league an early suspension costs seeding. (Board B already has JSN 4 > Nacua 5 - keep it.)
4. Then 17: Achane/Cook/C.Brown if one fell (17-37%), else Jeanty (80%) > Walker (84%) > McBride (78%) - McBride if the R1 was Chase (higher WR floor) and Jeanty's ankle is not cleared by Sep 6. 24: Collins (95%) > Olave (45%) > Rice (80%) - volume order for League B.

**League B, pick 37/44 - Maye gone (P ~ 19%).**
1. 37: RB from Judkins/Montgomery/Irving (72/69/55% at 44 - take at 37 to be safe) or Higgins (83%).
2. 44: the other; then QB at 57/64 = Stafford (if there) > Herbert > Lawrence > Mahomes (ACL, no preseason) > Dak. Not Lamar at 44 (~20%, and 2025 output does not justify it). Not Burrow at 57 (53%, turf toe, 8 games).

**Both leagues, elite TE gone at every stop.** Do not chase Loveland (39) or Warren (52). Kraft at 62/64 (82-86%); Pitts at 77-79 (66-73%); Kittle/Fannin/LaPorta at 79-84 as darts. Stream from TE10+ (11.1 ppg) otherwise - the plan's own VOR says TE2-4 is +4 and TE5-10 is ~0, so paying R4 for TE3-4 is the worst price on the board.

---

## E. Late rounds, bench, IR

1. "No QB2 / TE2 / DST2" - correct in both leagues, and this room strengthens it: QB11+ (Nix, Dart, Kyler, Purdy, D. Jones) are 96-100% available at 99 and will be on waivers all season; TE10 (11.1) is one waiver click away; DST top-3 ADP becomes DST1 3.8% of the time. Bench = 3 RB / 2 WR / 1 swing is right, but in this room the 3 bench RBs will be Marks/Allgeier/Bigsby/E. Johnson-grade unless one RB is bought at 39/42 (F2).
2. IR slot is a 16th roster spot (F8): draft the IR stash at R13 (it leaves the bench immediately), the handcuff at R14, DST at R15. The R13 "upside WR/TE" dart (Concepcion/Golden/Reed/Doubs) is what gets displaced, and those are the lowest-EV picks on the board anyway.
3. IR stash EV, League A (Weeks 15-17 objective): Jacobs (if exempt-list players are IR-eligible in this league - VERIFY) > Tyson > Charbonnet > Conner. Jacobs is a top-20 RB from ~Week 8 in a league where only Weeks 15-17 count; his cost is a R10-R11 pick (ESPN ~95, 0% chance he lasts to 139). Tyson is the R13-R14 stash (NFL IR = always eligible; #8 pick; NO WR2 behind Olave; back ~Week 8). Conner is a zero (31, third on ARI's chart). Charbonnet is PUP (eligibility varies) and behind Price.
4. Handcuff vs stash is not either/or, but if forced: League A - Vaki (Gibbs handcuff; nobody else in DET) beats any stash except Jacobs, because a Gibbs injury in December is the single largest swing on the roster. League B - Tyson (stash) beats the handcuff, because the stash costs nothing and the handcuff's value is concentrated in a ~15-20% event.
5. Handcuff-plus list at R12 (119/117) is gone in this room (JCM 0%, Corum 0%, Mason 0%, Monangai 0%, Allgeier 2%). Survivors: E. Johnson 87%, Bigsby 74%, Vaki/B. Robinson/K. Black (not drafted in most rooms). Buy JCM/Corum/Mason at 99/102 if wanted (8-11%) - realistically they are gone; Marks (69%) and Allgeier (73%) are the R10 RBs.
6. DST: Chargers (ARI, LV openers) is the right R15 idea; Lions (NO, @BUF, NYJ, @CAR) is the alternative. Both leagues' steep PA/YA scales reward streaming against Brissett/Cousins/Shough/Willis/Ward offences - keep it to R15.

---

## F. Five undervalued / five overvalued (championship-equity lens)

Undervalued by the board:
1. Trey McBride (board 13 both leagues): +7.8 VOR is the largest edge available after R1; 18.8 ppg, 17 games, 24% weeks >= 25, Weeks 15-17 23.1. Should be top-10 on board A and the default at 19; top-12 on board B and a 17 pick if the R1 was a WR.
2. Drake Maye (board A 38 / B 25): in League B he is the position's floor king (CV 0.26, sd 5.4) at QB2-3 ppg (24.5), 81% available at 37. Board B should have him ~20 and the plan should make him the R4 default, not a conditional.
3. Tucker Kraft (board 71/75): 15.0 ppg = TE2 rate before his 2025 injury; 86% available at 62; the correct TE fallback instead of Loveland-at-39. Board should have him ~55, above Loveland.
4. Rhamondre Stevenson / Jaylen Warren (board 70/74 and 79/82): they ARE the R6 RB2 tier in this room (46%/45% at 59). Stevenson is listed RB1 in NE (13.0 ppg, Weeks 15-17 18.6, goal-line role); Warren 13.9 ppg, RB1 on the PIT chart. Board should have both ~55-60.
5. Michael Wilson (board 85/87): best-6 25.7 (WR ~12 in ceiling weeks), 126 tgt, ARI WR2 behind McBride with Brissett (volume thrower); 88% at 82, 45% at 102. For League A's ceiling objective he is a R9 pick, not R11. Honourable mentions: Kyler Murray (93% at 99; the cheapest rushing floor in League A), Bijan (not a consolation prize; CV 0.49, Weeks 15-17 34.1), Jacobs in League A (F8).

Overvalued by the board:
1. MarShawn Lloyd (56/61): ESPN Clay #34 makes him a R4-5 price for a ~6-week rental in a backfield that just added Kaleb Johnson; zero relevance to Weeks 15-17. Remove from board A's top 100.
2. Jeremiyah Love (43/44): ESPN's most overvalued player (67% ECR-ADP gap), high-ankle sprain, Allgeier listed first; goes ~25 in ESPN rooms, so he is never available at his board price - and at his room price he is a fade.
3. Colston Loveland (33/35): 10.4 ppg rookie with 17% share = negative VOR vs TE10 (11.1); the plan's R4 TE fallback costs pick 39-41 for TE3-5 output that Kraft/Pitts deliver at 62-79.
4. Lamar Jackson (36/31): 2025 16.5 ppg (4-pt) / 19.8 (6-pt), 13 games, 2 rush TD, new OC; ESPN pushes him to ~37 anyway. 6-pt scoring re-orders the tier toward pocket TD-volume (Stafford/Maye/Dak) and away from him. Remove from the League B 44 list; board B ~40.
5. Nico Collins (14/14) as a League A pick: 15.4 ppg, 0% weeks >= 25, CV 0.44, Weeks 15-17 14.0 - a floor WR ranked as a ceiling WR. Fine for League B; on board A he belongs behind Pickens (17.6, best-6 29.2) and Olave (17.0, best-6 25.3). Honourable mentions: Justin Jefferson at 9 (best-6 18.5, 0% weeks >= 25 - moot unless he falls), Cam Skattebo at 42 (ESPN Clay #20 means the room pays ~39 for 8 games of 2025 data and a healed tibia; the board's price is right but the plan's R6 slot for him is fantasy).

---

## G. What the plan gets right (so the fixes are surgical)
- Gibbs/Bijan at 2; Chase/JSN at 4; late QB in League A; one DST in R15; no QB2/TE2; handcuff-plus over clipboard handcuffs; age tiebreaks (Henry/CMC/Barkley discounts); Nacua-vs-JSN ordering differing by league; Stafford as the League-B value IF he lasts.
- The structural thesis (elite RB/WR >> elite TE ~ QB1 > everything; edges flatten after ~RB12/WR12) is correct. The error is executional: the target lists were built on consensus ECR while the plan's own thesis point 6 says the room is not a consensus room. Apply the shift the plan already describes and most of the findings above collapse into one rule: **RBs one-and-a-half rounds earlier than the list, WRs one-and-a-half rounds later, TE1 at 19 if there, Maye at 37 in League B.**

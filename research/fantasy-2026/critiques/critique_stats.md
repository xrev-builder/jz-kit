# Statistical critique of plan_v1.md / board_A.csv / board_B.csv

Reviewer: skeptical statistician pass, 2026-09-03. All numbers below were recomputed from
data/stats_player_week_2025.csv and _2024.csv using the exact scoring in master.py (League A and B),
or read from build/master.csv. "8+ g" = players with at least 8 regular-season games that year.
Reproduction helper: scratchpad/crit_lib.py (imports score()/season() from master.py).

Legend: severity critical / high / medium / low. "Fix" is the concrete edit proposed.

---

## 1. Replacement levels and VOR curve: reproducible, with three small misstatements
Severity: low

Evidence (2025, 8+ g, full weekly population; master.csv gives identical values):
- RB31 = 10.92 ppg (plan says ~11.4; 11.4 is RB30 = 11.46. curves.py prints ranks 30 and 36 but never 31, so RB31 was eyeballed).
- WR31 = 11.76 (plan 11.7, OK). TE11 = 11.06 (plan 11.0, OK). QB11 = 17.93 4-pt / 21.80 6-pt (plan 18.0 / 21.7, OK).
- VOR League A recomputed vs plan: RB1 +14.3 (plan +13.8), RB5 +10.0 (+9.5), RB10 +4.9 (+4.4), RB20 +2.8 (+2.3); every RB figure is 0.5 low because of the RB31 error. WR1 +12.6 (+12.7), WR5 +7.2, WR10 +4.3, WR20 +1.3: all OK. TE1 +7.8 OK, TE2-4 +3.8 to +4.0 OK.
- QB1 4-pt = +4.9, not +5.3; QB5 = +2.0 / +2.0, not +2.4 / +2.2. QB1 6-pt = +4.8 (plan +5.0, OK).

Fix: in plan point 1 write RB31 = 10.9; in point 2 add 0.5 to every RB VOR and change QB1 to +4.9 / +4.8, QB5 to +2.0 / +2.0. Nothing on the board moves because of this.

## 2. The 2025 VOR curve shape is not stable: 2024 gives a different structural story
Severity: medium

Evidence (League A VOR, 8+ g):
| rank | 2025 | 2024 |
|---|---|---|
| RB1 / RB5 / RB10 / RB15 / RB20 | +14.3 / +10.0 / +4.9 / +4.2 / +2.8 | +13.6 / +8.6 / +6.7 / +5.1 / +3.5 |
| WR1 / WR2 / WR5 / WR10 / WR20 | +12.6 / +10.2 / +7.2 / +4.3 / +1.3 | +11.5 / +6.4 / +5.7 / +4.3 / +2.1 |
| TE1 / TE2-4 | +7.8 / +3.9 | +5.7 / +5.1..+3.1 |
| QB1 / QB3 / QB5 (4-pt) | +4.9 / +2.8 / +2.0 | +7.8 / +5.2 / +3.4 |
| QB1 / QB3 / QB5 (6-pt) | +4.8 / +2.8 / +2.0 | +9.4 / +6.4 / +3.3 |

Reading: "positional edges flatten fast after ~RB12/WR12" is a 2025 artifact. In 2024 RB10-15 were worth 5-7 ppg over replacement (the fat middle that justifies R3-R5 RBs), WR2-5 were worth much less than in 2025 (Nacua/JSN/Chase pulled the 2025 WR top out), and the QB1 edge was ~8-9 ppg (Lamar). The two-year average is the honest curve: RB10 ~+5.8, WR5 ~+6.5, QB1 ~+6.3 (4-pt) / +7.1 (6-pt).
Fix: state both years in plan point 2 and use the 2-year average; drop the sentence "positional edges flatten fast after ~RB12/WR12" or qualify it as 2025-only. Practical impact: Hall (37), Kyren (40), Javonte (41), Etienne (47), Swift (55) are slightly under-ranked relative to WR3/WR4 tier on a 2-year curve, i.e. the R6 "RB2 tier" can start one round earlier without violating the evidence.

## 3. All VOR figures are realized outcomes, not expectations; QB persistence is far lower than RB/WR
Severity: high (for the QB rungs), medium (for the RB/WR rungs)

Evidence:
- Year-over-year regression of 2025 ppgA on 2024 ppgA (8+ g both years, ppg24 >= 8): RB slope 0.78 (r 0.64, n=36); WR slope 0.79 (r 0.60, n=58); TE slope 0.71 (r 0.43, n=20); QB slope 0.26 (r 0.31, n=26). QB ppgB slope 0.23 (r 0.29). QB pass-TD/game slope 0.25 (r 0.33).
- Split-half 2025 (first 8 games vs remaining, 14+ g): top-8 RBs by first-half ppg fell 21.8 -> 19.4; top-8 WRs 19.6 -> 16.5; top-8 TEs 13.1 -> 11.3; top-8 QBs 21.5 -> 18.1.
- 2024 top-15 WRs by ppg averaged 18.2 in 2024 and 15.3 in 2025.
- Weekly SD of a top-12 RB or WR is ~9 pts, so a full-season ppg has SE ~2.2; a 8-9 game ppg has SE ~3.

Reading: the plan's comparison "QB1 +4.9 = an RB10/WR9-level edge" treats a QB edge as equally bankable as an RB/WR edge. With a pooled QB slope of ~0.25 (versus ~0.8 at RB/WR), last year's QB rank order is close to noise; the 2024->2025 pairs illustrate it: Lamar 30.5 -> 19.8 ppgB, Burrow 28.0 -> 21.6, Mayfield 27.0 -> 19.3, Darnold 22.6 -> 17.0, Stafford 16.2 -> 26.6, Purdy 21.1 -> 24.6. Allen's own history (QB1 in 4 of 6 years) makes him more persistent than the pool, but no other QB on this board has that record.
Fix: (a) In plan points 2 and 5 label the curves "realized 2025" and add the expectation haircut: multiply RB/WR VOR by ~0.8 and QB VOR by ~0.5 before comparing across positions. (b) Order QBs by ECR plus structural factors (rushing volume, age, weapons), not by 2025 ppg; see finding 8 for the specific rungs.

## 4. "Best-6-week average" (top6A_25) is a rescaled ppg, adds no information, and is biased against short seasons
Severity: high (it is the plan's stated selection criterion for League A)

Evidence:
- Correlation of top6A_25 with ppgA_25 among the top-40 at each position: RB r=0.92 (Spearman 0.86), WR 0.89 (0.88), TE 0.93 (0.93), QB 0.94 (0.94). Fitted line: top6 = 2.6 + 1.38 x ppg (RB), 3.7 + 1.28 x ppg (WR).
- Out of sample: predicting 2025 ppg from 2024 stats, adding 2024 top6 to 2024 ppg changes R2 by 0.000 (RB), 0.000 (WR), +0.004 (TE), +0.009 (QB); the top6 coefficient is ~0 or negative. Predicting 2025 top6 itself: 2024 ppg does as well as or better than 2024 top6 at every position (RB 0.606 vs 0.596, WR 0.518 vs 0.491, TE 0.522 vs 0.524, QB 0.103 vs 0.070). Last year's ceiling does not predict next year's ceiling any better than last year's average does.
- Mechanical bias: a 17-game player picks his 6 best from 17 draws, an 8-game player from 8. The largest ppg-rank vs top6-rank gaps are all short seasons penalised (Skattebo RB9 by ppg / RB25 by top6; Irving RB18 / RB31; Dobbins RB26 / RB37; Hampton RB13 / RB22; Rice WR5 / WR15; Watson WR16 / WR33; LaPorta TE7 / TE20; Kraft TE2 / TE8; Purdy QB6 / QB14; Burrow QB16 / QB24) and 17-game volume players flattered (Dowdle RB21 / RB8; Gainwell RB22 / RB12; Henderson RB24 / RB13; Egbuka WR30 / WR17; Michael Wilson WR19 / WR7; Jameson WR17 / WR10; Loveland TE16 / TE6).

Reading: every note that cites "best-6 avg" as evidence (Gibbs, Taylor, AJB, Pickens, Jeanty, Hall, Kyren, Dowdle, Henderson, Gainwell, Michael Wilson, Jameson, Herbert) is citing ppg with extra noise. The League A thesis (ceiling in Weeks 15-17) is fine; this metric does not measure it.
Fix: remove "best-6 avg" from all notes and from plan point 4, or replace it with the residual (top6 minus 2.6+1.38 x ppg) computed only for 14+ game players, and then use it as a tiebreak only. Specific rank consequences: Dowdle (87), Gainwell (101), Henderson (61), Michael Wilson (85) should not be moved up on ceiling grounds; Skattebo (42), Irving (49), Hampton (34), Kraft (71) should not be moved down on it.

## 5. The League A rushing-bonus tilt is real but too small to rank on; plan arithmetic is also off
Severity: medium-low

Evidence (2025 League A bonus points = 100-yd rush +3, 200-yd rush +8, 100-yd rec +1.5, 200-yd rec +8):
- Mean bonus per game: top-12 RBs 0.77 ppg, RB13-36 0.32; top-12 WRs 0.50, WR13-36 0.18. The RB-minus-WR tilt is ~0.27 ppg (about 4.6 pts per season) for starters.
- Extremes: Cook 32 pts (8 x 3 + one 200-yd game at 8), Henry 29 (7 x 3 + 8), Taylor 20 (4 x 3 + 8), Bijan 15, Gibbs 14, CMC 12, Achane 12. Plan says Cook +27 and Henry +24 (counts 9 x 3 and 8 x 3, ignoring the 200-yd games).
- Re-ranking the top-36 RBs by ppg with and without bonuses moves nobody more than 2 spots except RJ Harvey (-3) and Dowdle (+2).
- Year-over-year persistence of 100-yd rushing games (RBs with 150+ carries in 2024 and 10+ games both years, n=28): r = 0.43. Barkley 11 -> 3, Taylor 8 -> 5, Kyren 4 -> 1, Cook 4 -> 9. Expected 2026 bonus for Cook at that regression is ~6 games (~19 pts, 1.1 ppg), which is inside his ppg SE (2.7).
- For comparison the weekly SD of a top-12 RB is 9.1 pts; the SE of a 17-game ppg is 2.2 ppg.

Fix: keep the tilt as a tiebreak only. Correct the Cook (+32) and Henry (+29) figures. Delete "(+3 each in League A)" as a ranking rationale for Taylor and the "League A rushing bonus" clause in the Gibbs R1 rationale; neither changes the pick.

## 6. Small-sample ppg: most placements survive shrinkage; three do not
Severity: medium

Method: 95% CI from weekly SD; shrinkage estimate = (g x ppg25 + 8 x prior) / (g + 8) with prior = startable-pool mean (RB 14.8, WR 14.1, TE 13.0, QB 19.2) or the player's own 2024 ppg when he had 8+ games.

| player | g | ppg (pos rank) | 95% CI | shrunk to pool (rank) | shrunk to own 2024 (rank) | board A rank (pos) | verdict |
|---|---|---|---|---|---|---|---|
| Rashee Rice | 8 | 18.9 (WR5) | 13.2-24.7 | 16.5 (WR9) | 16.5 (WR9) | 21 (WR12) | OK; board already discounts him. Weekly range 7.4-29.4. |
| Malik Nabers | 4 | 14.7 (WR13) | -1.9 to 31.2 | 14.3 | 17.2 (WR8) | 27 (WR14) | Rank OK; the 4-game figure is meaningless (one 39.2 game, others 12.1 / 3.3 / 4.0). Cite 2024 (18.5 ppg, 15 g) with an ACL discount instead. |
| Cam Skattebo | 8 | 16.0 (RB9) | 10.0-21.9 | 15.4 (RB14) | n/a | 42 (RB16) | OK. Note the 8 games include two token games (2.9 and 10.0 pts); 101 carries total. |
| Omarion Hampton | 9 | 15.4 (RB13) | 9.7-21.1 | 15.1 (RB15) | n/a | 34 (RB12) | Slightly high vs shrinkage and vs the note's own "committee = fade"; 36-40 is more consistent. |
| Tucker Kraft | 8 | 15.0 (TE2) | 7.8-22.3 | 14.0 (TE5) | 12.3 (TE7) | 71 (TE5) | Rank OK, note overstated: two games (25.9, 34.8) are 51% of his points; other six average 9.9. "TE2-level per game" should read "TE5-7 with two spike weeks". |
| Brock Purdy | 9 | 19.7 / 24.6 B (QB6 / QB3) | 13.0-26.4 | 19.5 (QB7) | 18.8 (QB8) | 103 A / 80 B | OK; note's "QB8 upside" matches. Three of nine games were 32-45 pts (Wks 15-17). |
| Joe Burrow | 8 | 16.8 / 21.6 (QB16 / QB12) | 10.9-22.8 | 18.0 (QB11) | 19.8 (QB6) | 58 A / 45 B | OK. Better framing: excluding the two injury games (Wks 1-2, 8.8 and 7.0), his six healthy games average 19.8 A (QB5-6). |
| Jayden Daniels | 7 | 16.3 / 18.6 (QB18) | 11.6-21.0 | 17.9 (QB12) | 18.9 (QB7) | 63 A / 66 B | OK. |
| Lamar Jackson | 13 | 16.5 / 19.8 (QB17 / QB16) | 11.6-21.5 | 17.6 (QB12) | 19.9 (QB5) | 36 A (QB2) / 31 B (QB3) | Not OK. He is QB2/QB3 on both boards on the strength of 2024 alone; the shrunk estimate is QB5. Board A at 36 (a R4 pick) also contradicts the plan's own "QB window R8" for the 4-pt league. Move to ~55 in A (with Burrow/Hurts) and ~45 in B. |
| Garrett Wilson | 7 | 14.2 (WR14) | 7.1-21.4 | 14.2 | 14.7 (WR13) | 28 (WR15) | OK. |
| Kyler Murray | 5 | 15.6 (QB21) | 14.0-17.1 | 17.8 | 16.7 | 96 | OK. |

Fix: Lamar to ~55 (A) / ~45 (B); Hampton to ~38; rewrite Nabers and Kraft notes as above.

## 7. Jefferson at #9 (WR5): the "pure positive regression" framing is wrong and the rank is one tier high
Severity: high

Evidence:
- 2024 -> 2025: 154 -> 141 targets, 103 -> 84 receptions, 1533 -> 1048 yards, 10 -> 2 TD, 19.1 -> 12.1 ppgA. Decomposition of the 7.0 ppg drop: TDs -48 pts (-2.8 ppg, 40%), yards -48.5 pts (-2.9 ppg, 41%), receptions -19 pts (-1.1 ppg, 16%). Catch rate 66.9% -> 59.6%, yards per target 9.95 -> 7.43. The majority of the decline is efficiency, not TD luck.
- Base-rate check on "140+ targets and <=3 TD": exactly one 2024 case in the data (Wan'Dale Robinson, 140 tgt / 3 TD, 10.7 ppg -> 13.9 in 2025, +3.2). Widening to 100+ targets and <=4 TD gives 11 WRs: mean ppgA 12.9 in 2024 -> 12.2 in 2025. Four improved (Nacua +4.9, Pickens +5.7, Odunze +3.7, Wan'Dale +3.2), six declined, one flat. Low-TD volume WRs did not rebound as a group.
- Component persistence (WR 100+ tgt in 2024, 80+ in 2025, n=25): TD/target YoY slope 0.29 (regresses hard toward 5.5%), yards/target slope 0.33 (also regresses, but Jefferson's 7.43 is 0.6 below the pool mean and would only partly recover), ppg slope 0.59.
- Counterfactuals at 141 targets: at pool-average 2025 rates (catch 62%, 8.0 Y/tgt, 5.5% TD) = 250 pts = 14.7 ppg (WR12); at his 2025 rates but average TD rate = 235 pts = 13.8 ppg (WR16); at his full 2024 rates = 290 pts = 17.0 ppg (WR7). To justify WR5 (~19 ppg) he needs 2024 efficiency plus more targets than 2025 in an offense that changed QB again (Murray, 15.6 ppgA in 5 games).
- Tier context: the 2024 top-15 WRs by ppg regressed on average from 18.2 to 15.3; this is exactly what happened to Jefferson, Higgins, Collins, Evans, BTJ, McLaurin, Smith. A rebound from a collapse year is less common than the plan assumes.

Fix: move Jefferson from 9 to 13-14 on both boards (behind London 17.4 ppg in 12 g, AJB, and level with Collins), and rewrite the note: "12.1 ppg (141 tgt, 30% share, 2 TD, 7.4 Y/tgt vs 9.95 in 2024). TD rate will regress (+1.5-2 ppg); efficiency drop is the bigger half and is QB-dependent (Murray). Range WR6-WR14; ECR 9.4 already prices most of the rebound."
Positive-regression cases the same logic actually supports: Lamb (3 TD on 117 tgt, 2.6%; at 5.5% he adds ~3.5 TD = +1.6 ppg to 16.1 = ~17.8, consistent with rank 10) and Wan'Dale (4 on 140).

## 8. QB ladders: League B ordering and the Stafford placement
Severity: high (Stafford at 39), medium (ordering), low (the "+1 ppg" claim)

Evidence:
- 2025 ppgB (8+ g): Stafford 26.6, Allen 26.3, Purdy 24.6 (9 g), Maye 24.5, Mahomes 23.8, Lawrence 23.4, Dak 22.7, Goff 22.2, Hurts 22.1, Caleb 22.0, Herbert 21.8, Burrow 21.6 (8 g), Nix 21.3, D. Jones 20.6, Lamar 19.8. Board B order: Allen 19, Maye 25, Lamar 31, Stafford 39, Burrow 45, Hurts 51, Herbert 57, Mahomes 58, Lawrence 63, Dak 64, Caleb 65, Daniels 66, Purdy 80, Goff 81, Nix 88. Lamar (QB16 by ppgB) sits above QB1/QB4-8; Hurts (QB9) and Herbert (QB11) sit above Mahomes (QB5), Lawrence (QB6), Dak (QB7); Goff (QB8, 34 TD, six 300-yd games, 6-pt uplift +4.7 ppg vs Herbert +3.4) sits at 81.
- QB1-QB11 gap: 4-pt 4.86 ppg, 6-pt 4.81 ppg (2025). The plan's "elite QB gap grows ~1 ppg" in League B is false for 2025 (it is +0.0; the uplift from 4-pt to 6-pt is 3.4-5.2 ppg for every QB in the top 14, so the gap does not widen) and true for 2024 (7.8 -> 9.4, +1.6). Plan point 5 "Allen/Maye justify R3-4" and the R4 note "QB2-3 worth ~+5 ppg": Allen is +4.5 over QB11 in B, Maye is +2.7. Under the plan's own curve, +2.7 is RB20/WR13 value (a pick in the 35-45 range), so Maye at 25 in B is a round early; Allen at 19 is borderline (RB11/WR9 equivalence = pick 25-35).
- Stafford: 46 TD on 597 attempts = 7.7% TD rate vs 4.6% league QB average and 5.4% for the top-10 TD passers; his own 2024 was 20 TD / 3.5% and 16.2 ppgB (QB ~20). Holding 2025 attempts and yards: at the top-10 rate he throws 32 TD -> 21.8 ppgB (QB11); at the midpoint of his own 2024/2025 rates 35 TD -> 22.6 (QB8); at league average 28 TD -> 20.1 (QB15). Pass-TD/game YoY slope in the data is 0.25; every 2024 QB with 35+ TD threw at least 9 fewer in 2025 (Lamar 41 -> 21, Burrow 43 -> 17 in 8 g, Mayfield 41 -> 26, Goff 37 -> 34, Darnold 35 -> 25). Age 38.6 is confirmed by birth date. Weekly SD 9.4 in B (range 11.3-40.9).
  Expected value is QB6-10 in B, i.e. the same tier as Lawrence/Dak/Hurts. That is still a value at ECR 104, but it does not justify pick ~39 (R4) over Egbuka, Kyren, Javonte, Skattebo.

Fix (League B): Allen 19 -> 24-26; Maye 25 -> 35-38; Lamar 31 -> ~45; Stafford 39 -> 60-64 (immediately after Hurts/Herbert, still ~40 spots above ECR; the R8 pick-77 target in the plan text is the right place to actually take him, and the note "the single biggest value on the board" should read "biggest ECR-vs-ppg gap, half of which is TD-rate luck"); Mahomes 58 -> 52; Lawrence 63 -> 55; Dak 64 -> 58; Goff 81 -> 66. Change plan point 5 to: "6-pt scoring adds 3.4-5.2 ppg to every starting QB; the QB1-vs-QB11 gap was 4.8 ppg in both formats in 2025 and 1.6 ppg wider in 6-pt in 2024. Volume passers (Goff, Dak, Stafford) gain the most relative to rushers."
Fix (League A): Lamar 36 -> ~55 (finding 6); Allen at 31 is acceptable (+4.9 realized, ~+3 expected = WR12-15/RB15-20 equivalence = picks 35-45), but the plan text and the board should agree: either say "Allen at 39 is fine" in R4 or move him to ~40.

## 9. Factual errors in the notes (each verified against master.csv / weekly data)
Severity: low individually; fix all before printing

- Gibbs: "best-6 avg 38.5 (highest of any RB)" is false; Taylor's is 38.7 (the Taylor note says so). Also repeated in the plan's R1 rationale.
- Achane: "floor 16.6 (best of any RB)" is false; McCaffrey 17.6.
- Amon-Ra St. Brown: "Highest floor at the position" is false; JSN 19.8, Nacua 16.5, ARSB 13.7 (the JSN note already claims the highest floor).
- Kyren Williams: "17 games three straight years" is false; 16 games in 2024 in the data (17 in 2025, 12 in 2023).
- Cook: "+27 pts in League A" should be +32; Henry "+24" should be +29 (200-yd games score +8).
- Judkins: "<10 ppg after Wk 9" is 10.5 ppg (7 g); "68% of CLE rushes" is 65% of RB carries / 55% of all team carries.
- Parker Washington: "22.3 ppg over the final stretch" is a 3-game window (28.0, 20.5, 19.7); last 6 games average 16.4.
- McBride: "Brissett threw to him at 8+ tgt/g" understates: 10.6 tgt/g in Brissett weeks vs 8.4 with Murray (harmless, but the note reads as a caveat when it is a positive).
- Chase Brown: "22.3 ppg over the last 6 games" is 22.8; two of the six were 32-pt games (Wks 16-17). Correct number, cherry-picked window.
- Henderson: "17.6 ppg (RB7) Wks 10-18" is 18.4, RB7 (correct rank); first 9 weeks 7.3.
- Odunze "WR11 ppg Wks 1-8": WR10, 15.9 ppg (7 g). Fine.
- Jefferson "2 TD on 16 end-zone targets": not verifiable from the weekly data; mark as sourced elsewhere or drop.
- MIN "fewest fantasy points allowed, 66.2/g" and DAL "most points allowed" (101.7/g) both reproduce from pts_allowed_2025.csv.
- Everything else spot-checked (targets, shares, carries, TD counts, 2024 ppg for Chase, Nabers, Collins, Lamb, McConkey, Waddle, BTJ, Hubbard, Burrow, Daniels, Lamar, Bowers, Barkley; QB rushing yards/TDs; 300-yd game counts) matches.

## 10. Sub-season splits are used as evidence only when they help
Severity: low-medium

Evidence: the split-half test (finding 3) shows that a hot 8-game window regresses with slope 0.65 (RB) / 0.79 (WR) / 0.46 (QB). Notes that lean on a favourable window: Chase Brown (last 6), Henderson (Wks 10-18), Odunze (Wks 1-8), Burden (Wks 10-18, 5.6 tgt/g but 11.6 ppg), Parker Washington (last 3), Kraft (2 spike games), Purdy (Wks 15-17). Notes that use an unfavourable window: Egbuka (Wks 1-5 21.1 ppg, then 7.9), Judkins (after Wk 9). The selection direction is not consistent with any rule.
Fix: state full-season ppg first in every note; keep windows as one-line colour with the games count; never move a player more than one tier on a window alone.

## 11. TD-rate regression is acknowledged in prose but not in the ranks
Severity: medium

Evidence: TD/target regresses toward ~5.5% with YoY slope 0.29. Outliers on the board: Higgins 11 TD on 98 tgt (11.2%); Goedert 11 on 82 (13.4%); Adams 14 on 114 (12.3%); Pickens 9 on 137 (6.6%, fine); Quentin Johnston 8 on 84 (9.5%). At 5.5%: Higgins ~5.4 TD (-34 pts, -2.2 ppg -> 12.0 ppg, WR ~30); Adams ~6.3 TD (-46 pts, -3.3 ppg -> 12.7, WR ~22); Goedert ~4.5 TD (-39 pts, -2.6 ppg -> 9.8, TE ~18).
Fix: Higgins 30 -> ~40 (below Flowers, McMillan, Egbuka); Adams 48 -> ~58; Goedert 115 -> ~125. Both notes already say "TD-dependent"; the ranks should say it too.

## 12. Loveland at TE3 (33 overall) with TE16 per-game production
Severity: low

Evidence: 10.4 ppg (TE16 among 8+ g; VOR -0.7 in 2025); the note itself says "TE3-6 is only ~1.5 ppg over replacement". TE VOR at TE3-4 was +3.9 in 2025 only because Kraft (8 g) / Bowers (12 g) / Kittle (11 g) sit at ~15 ppg. Rank 33 is ECR-driven (37.4) and puts him ahead of Hampton, McConkey, Hall, Maye. Fine as an ECR placement; not supported by the numbers on the card.
Fix: either move to ~45 (behind Hall/Egbuka) or rewrite the note to say the rank is an ECR/role bet, not a production one.

## 13. Two-FLEX replacement is a common baseline, not RB31 and WR31 separately
Severity: low

Evidence: with 10 x (2 RB + 2 WR + 1 TE + 2 FLEX), the 20 flex starters by 2025 ppg were 12 WR / 8 RB (2024: 14 WR / 6 RB), so ~28 RB and ~32 WR start weekly, not 30/30, and the common flex replacement (71st RB/WR/TE) is 11.55 ppg. Using it lowers every RB VOR by ~0.6 and leaves WR VOR unchanged.
Fix: plan point 1: "replacement is the ~71st RB/WR/TE (~11.5 ppg) plus TE11 (11.1) and QB11 (17.9 / 21.8)". No board change.

---

## Consolidated rank changes proposed
League A: Jefferson 9 -> 13; Lamar 36 -> ~55; Hampton 34 -> ~38; Higgins 30 -> ~40; Adams 48 -> ~58; Loveland 33 -> ~45 (optional); Goedert 115 -> ~125.
League B: Jefferson 9 -> 13; Allen 19 -> ~25; Maye 25 -> ~36; Lamar 31 -> ~45; Stafford 39 -> ~62; Mahomes 58 -> ~52; Lawrence 63 -> ~55; Dak 64 -> ~58; Goff 81 -> ~66; Higgins 33 -> ~42; Adams 50 -> ~60.
Text: correct RB31/QB VOR figures (finding 1); add 2024 curve (2); label curves as realized and add the QB haircut (3); delete best-6 as a criterion (4); fix Cook/Henry bonus arithmetic and demote the bonus tilt to a tiebreak (5); fix the nine factual note errors (9).

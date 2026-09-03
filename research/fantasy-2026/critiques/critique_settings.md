# Settings critique — scoring, board deltas, playoff structure, DST, bench (2026-09-03)

Scope: verified `build/master.py::score` against `research/00-league-settings.md`; recomputed everything below from `data/stats_player_week_2025.csv`, `data/games.csv`, `data/sched_2026.csv`, `build/playoff_sos.csv`, `build/pts_allowed_2025.csv`. League A = Ratz (pick 2, 8/10 playoffs, 4-pt TD, +3/+1.5 100-yd). League B = Footborn (pick 4, 6/10 playoffs, 6-pt TD, +2 300-yd, +2 50-yd TD, +2/+2 100-yd).

## 1. Scoring implementation

### 1.1 (medium) League B's +2 per 50+ yd TD is not implemented
Evidence: `score()` line-by-line vs 00-league-settings.md. Everything else matches exactly: pass 0.04/yd, TD 4 (A) / 6 (B), INT -2, 2pt +2, 400-yd pass +8 (A) / 300-399 +2 and 400+ +4 (B); rush 0.1/yd, TD 6, 100-199 +3 (A) / +2 (B), 200+ +8 (A) / +4 (B); rec 0.1/yd, +1/rec, TD 6, 100-199 +1.5 (A) / +2 (B), 200+ +8 (A) / +4 (B); fumbles lost -2 (sack+rush+rec); ST TD 6. The only term in the doc with no code is League B's "+2 for 50+ yd TD pass/rush/rec". Every other bonus is per-game and the data is per-game, so the bucket logic is right.
Impact (bounded, no play-by-play available): games with both a 40+ yd play and a TD are a hard upper bound on 50+ yd TDs. Upper bounds for 2025: JSN 6, Bijan 6, Gibbs 6, Cook 5, Henderson/Jameson/Barkley/Taylor/Henry 4; QBs: Dak 11, Darnold 10, Hurts/Stroud/Herbert 8, Allen/Stafford 7. League-wide 40+ plays: 228 pass, 78 rush, 226 rec; roughly 20-25% of those are 50+ TDs, so realistic 2025 values are ~1-2 for the top skill players (+2 to +4 pts, <= 0.25 ppg) and ~2-4 for top QBs (+4 to +8 pts, <= 0.5 ppg). No top-100 reorder in board B changes from this.
Fix: (a) add a `bigplay_25 = rushing_40 + receiving_40 (+ passing_40 for QB)` column to master.csv and use it only as a tiebreak in board B; (b) footnote in plan that ptsB is biased low by ~2-8 pts for big-play players (JSN, Gibbs, Bijan, Cook, Henderson, Jameson Williams; Dak, Darnold, Stafford). Do NOT add a proxy term to `score()` — it would silently contaminate ppgB with a guess.

### 1.2 (low) "Fumble recovered for TD" (6) and D/ST are not scored for skill players
Not in the nflverse weekly data; worth <1 pt/season for any player. No action.

### 1.3 (low) Verified: 2024 columns use the same `score()`; replacement levels from the plan reproduce
RB31 10.9 / WR31 11.8 / TE11 11.1 / QB11 17.9 (A) and 21.8 (B) from master.csv with g_25 >= 8. Plan quotes 11.4/11.7/11.0/18.0/21.7 — within rounding/filter differences. OK.

## 2. What actually differs between board A and board B

Fact: board_B is board_A with 20 QBs re-slotted and Jacobs moved 91 -> 105. Every non-QB "move" is a +1..+6 shift caused by QB insertions. No RB/WR/TE is reordered for the 100-yd or 50-yd bonuses.

### 2.1 (high) League B QB placement: Allen 19, Maye 25, Lamar 31 are 7-15 picks too early; the "+5 ppg" rationale double-counts
Evidence: 6-pt TD lifts EVERY QB, including replacement. 2025 (g>=8): QB1 26.6 / QB3 24.6 / QB5 23.8 / QB11 21.8 under B vs 22.8 / 20.7 / 19.9 / 17.9 under A. Gap QB1-QB11: A 4.9, B 4.8. Gap QB3-QB11: A 2.8, B 2.8. So in 2025 the format widened the elite-QB edge by ~0 ppg. In 2024 it did widen: gap1-11 7.8 (A) -> 9.4 (B), gap3-11 5.2 -> 6.4, i.e. +1.2-1.6 ppg. Blended two-year answer: 6-pt adds ~0.5-1.0 ppg of VOR to a QB1-3, not the "+5 ppg" written in plan_v1 (that +5 is the same player's score change, not his edge over replacement).
Player-level 2025 VOR under B: Stafford 4.8, Allen 4.5, Purdy 2.8 (9 g), Maye 2.7, Mahomes 2.0, Lawrence 1.6, Dak 0.9, Goff 0.4, Hurts 0.3, Lamar -2.0 (13 g, 19.8 ppg). At pick 19 the RB/WR alternatives (Cook 19.0 vs RB31 10.9 = +8.1; Pickens/Rice +6-7) carry ~1.5-2x Allen's VOR.
Fix (board B): Allen 19 -> 26-28 (after Henry/Jeanty tier, before Nabers/G. Wilson); Maye 25 -> 34-36; Lamar 31 -> 42-45 (2025 was injury-marred but he is also 29 with 13 games; ECR 32 is the ceiling price, not the expected one); Stafford 39 stays (highest 2025 VOR at either format; the age-38 discount is already ~40 picks); Burrow 45 stays; Purdy 80 -> ~65 (24.6 ppgB, VOR 2.8 = Maye-level). The R4 plan line "Maye or Allen if there (QB2-3 worth ~+5 ppg)" should read "+2.5-3 ppg over QB11; take only if the RB/WR on the board has VOR < 3 (i.e. after the top ~28 RB/WR are gone)".

### 2.2 (medium) League A QB ladder is internally inconsistent: Lamar 36 / Maye 38 vs Herbert 60 / Lawrence 74 / Stafford 78
Evidence, League A 2025 (ppg / best-6): Allen 22.8/32.9, Stafford 21.1/29.0, Maye 20.7/26.5, Mahomes 20.4/27.9, Lawrence 19.9/28.3, Herbert 18.4/27.6, Lamar 16.5/25.0 (13 g). In an 8/10 league where only Weeks 15-17 matter (see section 3), best-6 is the right lens and Stafford/Lawrence/Herbert/Mahomes are Maye's peers, 20-40 picks cheaper. Also Weeks 15-17 QB SOS: Stafford (LA: DAL, @SEA, @TB) 19.3 = 2nd-softest QB playoff slate; Lawrence 18.7 (3rd); Dart 18.4; Maye 16.4; Lamar 16.8; Mahomes 15.0; Hurts 15.0; Purdy 14.1 (hardest tier).
Fix (board A): Lamar 36 -> 55-60; Maye 38 -> 45; keep Allen 31; Lawrence 74 -> 62; Stafford 78 -> 64; Dart 95 -> 85. Practically: in League A do not take a QB before R6 unless Allen falls to 39/42; R8-R9 Stafford/Lawrence/Mahomes is the correct window and the plan already says so — the board numbers should agree with the plan text.

### 2.3 (low) Rushing +3 vs receiving +1.5 (A): correctly small, but two RBs earn a real tilt
Evidence (2025 season points A minus B, which isolates the 100-yd asymmetry since everything else at RB/WR is identical): Cook +12.0 (nine 100-yd rush games), Henry +11.0 (eight), Taylor +8.0, Dowdle +6.0, Gibbs +5.5; WRs: JSN -4.5 (nine 100-yd rec games), Chase -3.5, Amon-Ra/AJB/Pickens -2.5. Max swing between any two board-adjacent players is ~1 ppg (Cook vs JSN). The boards carry this only implicitly (JSN 5 in A / 4 in B; Nacua the reverse).
Fix: in A, move Cook 17 -> 14 (ahead of Collins; 19.7 ppgA, best-6 30.8, also Chase Brown's superior at 17.2) and Henry 25 -> 20-22 (18.1 ppgA, best-6 29.4, rushing-bonus beneficiary, and section 3 adds a soft Weeks 15-17 slate). In B, leave Cook 17 and Henry 27.

### 2.4 (low) 50-yd TD bonus in B: nobody should move up more than 1-2 slots
Evidence: section 1.1 upper bounds. JSN (8 receptions of 40+, 6 upper-bound), Gibbs (7 plays 40+), Bijan (6), Cook (5), Jameson Williams (5), Henderson (4 rush 40+ in a rookie half-season), Pierce (5) are the big-play tails. Expected bonus +2 to +6 pts/season, i.e. <= 0.35 ppg — below the noise of any ranking.
Fix: none beyond the tiebreak column in 1.1. In B, Jameson Williams 59 and Henderson 67 can each move up 2-3 slots (they also have top-quartile best-6 ratios, 1.76 and 1.86); Alec Pierce 104 -> 98.

## 3. Playoff structure

### 3.1 (high) League A: playoff-week ppg is worth ~2.2x regular-season ppg; the board is still ordered by season ppg/ECR
Evidence (Monte Carlo, 10 teams, 14-week reg season, weekly score sd 22, single-elimination bracket, 20k sims per cell):
```
format  dReg dPO  P(make) P(title)      format  dReg dPO  P(make) P(title)
8/10    +0   +0   0.798   0.103         6/10    +0   +0   0.598   0.101
8/10    +3   +0   0.878   0.111         6/10    +3   +0   0.721   0.129
8/10    +0   +3   0.802   0.121         6/10    +0   +3   0.605   0.123
8/10    +6   +0   0.932   0.117         6/10    +6   +0   0.820   0.154
8/10    +0   +6   0.800   0.154         6/10    +0   +6   0.600   0.141
8/10    -3   +3   0.693   0.111         6/10    -3   +3   0.465   0.091
8/10    -6   +6   0.578   0.107         6/10    -6   +6   0.341   0.076
```
League A: +3 ppg in the regular season adds +0.8 pts of title equity; +3 ppg in Weeks 15-17 adds +1.8 pts. Ratio ~2.2:1. Trading -3 regular / +3 playoff is neutral-to-positive (0.111 vs 0.103). League B: the same trade is negative (0.091 vs 0.101); regular-season ppg is worth ~1.2x playoff ppg because 40% of teams miss.
Consequences for League A:
- Early-season absence is cheap. A 15-ppg starter (vs 11 replacement) missing 6 of 14 games costs 4 x 6/14 = 1.7 ppg regular-season, i.e. ~0.5 pts of title equity, recovered by +0.8 ppg of playoff-week edge. Nacua at 4 (suspension risk, no ruling as of Sep 1) and Jacobs at 91 (exempt list, Wk 7-9 return) are correctly priced for A. Tyson/Conner/Charbonnet at 151-153 are correctly IR-only.
- Ceiling: use a 50/50 blend of season ppg and best-6 average, times the Weeks 15-17 positional SOS factor (team pts-allowed / league mean: RB 22.5, WR 31.1, QB 16.4, TE 13.3). Under that metric the biggest defensible moves (2025 non-injury cases only) are:
  - Jonathan Taylor 8 -> 3-4 (best-6 38.7 is the highest on the board; IND playoff slate @TEN/CIN/@CLE = RB SOS 24.5, factor 1.09; metric 33.3, #1 overall).
  - Derrick Henry 25 -> 16-18 (best-6 29.4; @PIT/CLE/@CIN factor 1.07; metric 25.4, #11).
  - George Pickens 20 -> 14-15 (best-6 29.2; @LA/JAX/NYG factor 1.05; metric 24.6, #12).
  - Wan'Dale Robinson 82 -> 60 (best-6 23.0; TEN slate IND/@LV/PIT = WR SOS 35.5, the softest WR playoff slate in the league; metric 21.1, #27).
  - Michael Wilson 85 -> 70 (best-6 25.7, ratio 1.94 = the most volatile top-100 WR); Rico Dowdle 87 -> 72 (best-6 25.2); Kenny Gainwell 101 -> 88 (best-6 24.0); Kyle Pitts 76 -> 60 (best-6 21.5, ATL slate @WAS/TB/NO TE SOS 14.8).
  - Downward: JSN 5 -> 6-7 (best-6 29.8 is the lowest of the top-8 and SEA's playoff slate @PHI/LA/@CAR is WR SOS 28.8, factor 0.93; his edge is floor, which League A does not pay for). McCaffrey 7 -> 9 (SF slate @LAC/@KC/PHI = 72.2 total, hardest in the league, RB factor 0.92; age 30). Achane 15 -> 17 (MIA @GB/LAC/BUF = 74.3, 2nd-hardest). Rashee Rice 21 -> 25 (best-6 ratio 1.18 = lowest ceiling-to-mean of any top-40 player; KC slate NE/SF/@LAC 78.8). Loveland 33 -> 42 (CHI TE SOS 11.1, lowest in the league; 10.4 ppg). Kittle 89 -> 100 (SF TE SOS 10.0, lowest). Nabers 27 -> 33 (best-6 = ppg = 14.6: a 3-game 2025 sample, no ceiling evidence; the "only if Wk-1 news is positive" caveat belongs on the card).
- Do not use the metric to demote injury-depressed 2025 seasons (Jefferson 12.1 ppg, Lamb, AJB, DeVonta, Walker): those are projection calls, and Jefferson in particular has the softest Weeks 15-17 slate in the NFL (MIN: DET/WAS/@NYJ, 93.3 total, WR 34.1), which supports keeping him at 9 in A.

### 3.2 (high) League B is not more floor-conscious: the non-QB order is identical to League A
Evidence: board_B rank == board_A rank + QB offsets for all 429 non-QB rows except Jacobs. Yet 6/10 makes regular-season ppg worth ~1.2x playoff ppg (3.1) and the 25th-percentile weekly score (floorA_25) varies enormously inside tiers: Bijan 14.7 vs Gibbs 11.6; JSN 19.8 vs Chase 9.9; Achane 16.6 vs Cook 10.7; Amon-Ra 13.7 vs London 7.6 / AJB 8.5; Nabers 3.8, McConkey 4.2, Egbuka 5.0, Loveland 5.1 in the 27-40 range.
Fix (board B only): Bijan 2 -> 1, Gibbs 1 -> 2 (ppgB 22.6 vs 22.2, floor 14.7 vs 11.6, Bijan also has 103 targets = PPR floor). JSN 4 -> 3, Chase 3 -> 4. Achane 15 -> 12 (ahead of AJB/Collins: 20.7 ppgB vs 15.4/15.5, floor 16.6 vs 8.5/9.3). Amon-Ra 6 stays but move London 11 -> 13 behind McBride (McBride 18.9 ppgB, floor 12.2). Nabers 29 -> 36; McConkey 37 -> 42; Loveland 35 -> 44; Egbuka 40 -> 46. Jacobs 105 -> 115 (he misses ~45% of the regular season that decides 40% of the league's fate, and cannot sit in IR, see 5.2). Nacua 5 stays (the suspension, if any, is likely short; his floor 16.5 is 4th-best).

### 3.3 (medium) Board A's R14/R15 ordering conflicts with the plan
The board lists 6 DSTs at 133-138 and Vaki/B. Robinson/IR stashes at 139-154; League A picks are 139 and 142. A drafter following the sheet takes DST at 139 (R14) and the handcuff/IR stash at 142 (R15), the reverse of plan_v1 ("R14 handcuff or IR stash, R15 DST"). Fix: move the DST block to 150-157 in board A (and B), or print the R14/R15 rule on the card.

## 4. D/ST

### 4.1 (low) Spread confirms Round 15, but matchup > unit
Evidence: rebuilt 2025 weekly DST scores from games.csv + team defensive stats under League A's exact scale (sack 1, INT 2, FR 2, TD 6, PA and YA buckets). Season ppg: SEA 8.4, HOU 8.2, DEN 8.1, CLE 7.7, JAX 7.4, MIN 7.3, LAC 7.2, PHI 6.5, LA 6.2, NE 6.0, BUF 5.9 ... CHI 5.4, PIT 5.4, TB 5.1, DET 4.6, GB 4.6 ... NYJ 0.2. DST1-DST12 = 2.7 ppg, weekly sd 4-9. Component means: PA bucket +0.74, YA bucket -0.25, sacks 2.35, turnovers 1.72 - i.e. the "steep" negative buckets only bite against 350+ yd / 28+ pt offenses, which is exactly what W1-4 matchup selection avoids. Round 15 is right.

### 4.2 (high) The DST block order (HOU, DEN, LAC, SEA, PHI, DET) contradicts the board's own notes and the W1-4 schedule
Evidence: 2026 W1-4 opponents' 2025 offensive yards/game (lower = softer): CHI 304 (@CAR Young, MIN Kyler, PHI, NYJ Geno), GB 316 (@MIN, @NYJ, ATL, @TB), TB 317 (@CIN, CLE Watson, MIN, GB), MIA 317 (@LV Cousins, @SF, KC, @MIN), KC 324, ATL 326, TEN 327, CLE 329 (@JAX, @TB, CAR Young, PIT), DET 331 (NO Shough, @BUF, NYJ Geno, @CAR Young), LV 335, CIN 336, NO 339, IND 340, PIT 340 (ATL, @NE, CIN, @CLE), ..., LAC 344 (ARI Brissett, LV Cousins, @BUF, @SEA), MIN 344 (GB, @CHI, @TB, MIA Willis), PHI 349 (WAS, @TEN Ward, @CHI, LA), SEA 356 (NE, @ARI Brissett, @WAS, LAC), DEN 364 (@KC, JAX, LA, @SF), BUF 369, HOU 375 (BUF, CIN, @IND, DAL = the four worst possible openers). The board ranks HOU 1st and DEN 2nd purely on ECR while their notes say "bad early schedule". 2026 QB changes make the soft group softer (MIA Willis, LV Cousins, NYJ Geno, NO Shough, CLE Watson, CAR Young, ARI Brissett are all bottom-10 2025 passers; MIN Kyler and TEN Ward are modest upgrades over 2025).
Also: research/03-news.md lists Brian Branch and Kerby Joseph (DET's two starting safeties) as unavailable for the first four games. The Lions DST (19th of 32 in 2025 scoring even with them) should not be the plan's #2 recommendation for Weeks 1-4.
Round-15 DST order for Weeks 1-4 (unit quality x schedule, 2026-QB adjusted):
1. LAC (7.2 ppg unit; ARI/LV in W1-2 = two of the five softest offenses; swap at the W3 @BUF/W4 @SEA bye-like weeks).
2. CLE (7.7 ppg, Garrett; @JAX is the only real test; CAR/PIT/TB soft-to-average).
3. SEA (8.4 ppg, best unit in 2025; NE/@ARI/@WAS/LAC = one soft, three average).
4. MIN (7.3 ppg; GB/@CHI/@TB average, MIA-Willis W4 soft; elite from W5 on).
5. CHI (5.4 ppg unit, but the softest four-week slate in the league: @CAR, MIN, PHI, NYJ).
6. PHI (6.5; WAS, @TEN Ward, @CHI, LA).
7. PIT (5.4; ATL, @NE, CIN, @CLE).
8. DET (4.6, Branch/Joseph out; NO/NYJ/@CAR are soft but @BUF W2 is a -3/-5 risk).
9-10. GB (4.6; softest opponent QBs: Kyler/Geno) and TB (5.1; Watson W2) as streamers if the top 6 are gone.
Avoid in R15: HOU (DST1 talent, 375 opp ypg), DEN (@KC/JAX/LA/@SF), BUF, NE, WAS, NYG, ARI.
Fix: reorder the DST block in both boards to LAC, CLE, SEA, MIN, CHI, PHI, PIT, DET; drop HOU/DEN to 159-160 with the note "W5+ trade/waiver target".

## 5. Bench and IR

### 5.1 (medium) 3 RB / 2 WR / 1 swing is right for League A; League B should be 3 RB / 2 WR / 1 flex-agnostic and keep the IR slot free
Evidence: 15 rounds = 9 starters (QB, 2 RB, 2 WR, TE, 2 FLEX, DST) + 6 bench; the IR slot is a 16th spot that can only hold an IR/O-designated player and is empty on draft night. With 2 FLEX, the RB31/WR31 replacement levels are nearly equal (10.9 / 11.8), so the flex bench should track injury rate, not scarcity: RBs miss more games and their handcuffs carry a bigger jump on injury (Vaki behind Gibbs, B. Robinson behind Bijan). 3 RB / 2 WR / 1 is consistent with the plan's own pick path (6 RB, 5-6 WR, 1-2 TE, 1 QB). In League B the sixth bench spot should be a waiver-ready WR/RB with Weeks 1-4 starts (e.g. Allgeier, Kaleb Johnson/Lloyd's partner, Tank Dell's replacements), not an IR stash: the regular season is worth 1.2x the playoffs there.
Fix: League B R14 = handcuff or early-season starter, never a Week-8-return player; League A R14 = IR stash is correct.

### 5.2 (high) ESPN IR rule: Tyson/Conner/Charbonnet/Pacheco qualify; Jacobs (exempt list) does not
Evidence: ESPN's IR-slot policy allows only players whose ESPN status is IR or O (Out); SSPD (suspended), Q and D are ineligible. The Commissioner's Exempt List is administrative, not medical, and ESPN tags exempt-list players SSPD, not O. roster_2026.csv: Conner RES, Charbonnet RES (PUP), Tyson RES, Pacheco (IR per news), Jacobs EXE. So:
- Tyson (151), Conner (152), Charbonnet (153), Pacheco (154) can be moved to IR immediately after the draft, which frees a bench slot for a waiver pickup - the stash is effectively free. This is the sound part of the plan.
- Jacobs cannot sit in IR. Drafting him at 91 in League A means one of six bench slots is dead for 6-9 weeks (until an NFL ruling, then the suspension). In League A that costs only bench-tiebreak points and one waiver body, and his playoff-adjusted value (metric 20.1, #34 of the top 110) justifies it. In League B move him to 115+ (3.2).
- Only ONE IR slot exists: the R14 IR stash uses it, so an in-season injured starter has no IR home and must be dropped or benched. The plan lists four stash candidates as if they were stackable. Print "1 IR slot: stash OR injured starter, not both" on the card.
- Nacua: if suspended he is SSPD, not IR-eligible; at rank 4 he would burn a bench slot for the length of the suspension. Acceptable in A (3.1); in B, if a suspension is announced before Sunday's draft, drop him to 8-10.
Fix: change the R14 line in plan_v1 to "IR-eligible stash (Tyson > Charbonnet > Conner > Pacheco; all currently IR/PUP) or own handcuff"; remove Jacobs from the IR-stash sentence.

### 5.3 (low) Verify ESPN's actual tag on Jacobs and Nacua on draft night
The IR-eligibility of an exempt-list player depends on the tag ESPN applies (SSPD vs O). Check the ESPN player page 30 minutes before each draft; if ESPN shows "O", Jacobs becomes a free IR stash and can move up ~15 slots in A.

## Summary of concrete board edits
Board A: Taylor 8->4; Cook 17->14; Henry 25->17; Pickens 20->15; JSN 5->7; CMC 7->9; Achane 15->17; Rice 21->25; Nabers 27->33; Loveland 33->42; Lamar 36->58; Maye 38->45; Lawrence 74->62; Stafford 78->64; Pitts 76->60; W. Robinson 82->60; M. Wilson 85->70; Dowdle 87->72; Gainwell 101->88; Kittle 89->100; DST block reordered LAC/CLE/SEA/MIN/CHI/PHI/PIT/DET and moved to 150-157.
Board B: Bijan 1, Gibbs 2, JSN 3, Chase 4; Achane 15->12; London 11->13; Allen 19->27; Maye 25->35; Lamar 31->44; Nabers 29->36; Loveland 35->44; McConkey 37->42; Egbuka 40->46; Purdy 80->65; Jacobs 105->115; Jameson Williams 59->56; Henderson 67->64; same DST reorder.
Code: leave `score()` as is; add `bigplay_25` column (1.1); add a `po_adj_A = 0.5*(ppgA+top6A) * playoff_SOS_factor` column to master.csv so board A can be sorted on it within tiers.

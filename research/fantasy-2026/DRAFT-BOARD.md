# Ratz & Footborn Draft Board

Two in-person ESPN drafts, one player universe. 10 teams, full PPR, QB/2RB/2WR/TE/2FLEX/DST, 6 bench + 1 IR, 15 rounds. Built Sept 3-4, 2026 from verified 2025 weekly stats, Sept 2 depth charts, Aug 28 expert consensus, a 2013-2025 usage-history model, the 2012-2025 injury-report history and medical literature, 2026 Vegas win totals, and a version-3 season simulator with handcuffs and an active waiver wire; pressure-tested by five reviewers and holdout backtests.

> Live, tap-to-strike version: see the published artifact link in the PR/README. PDFs: `ratz-pick2.pdf`, `footborn-pick4.pdf`.


---

## Ratz Fantasy

Pick 2 · draft Thursday Sept 4 · 4-pt passing TD · +3 per 100-yd rushing game, +1.5 per 100-yd receiving game · 8 of 10 teams make the playoffs (Weeks 15-17)

**Your picks:** 2 · 19 · 22 · 39 · 42 · 59 · 62 · 79 · 82 · 99 · 102 · 119 · 122 · 139 · 142

### Game plan

1. Eight of ten make the playoffs. In a 20,000-run simulation, +3 ppg in Weeks 15-17 was worth 2.2x as much title equity as +3 ppg in the regular season. Draft ceiling, not September floor; an early suspension (Nacua) costs almost nothing here.
2. Elite RB and WR are the scarce assets. Value over a 2-FLEX replacement (about the 71st RB/WR, 11.5 ppg) was +13 for the RB1/WR1 and +4 to +7 by RB10/WR10 across 2024-25, then flat. McBride's TE1 edge (+7.8) is a round-2 asset; a QB1's realized +4.9 shrinks to ~+3 because QB edges persist only half as well.
3. What survives randomized rooms in the version-3 simulator: RB-first openings (RB-RB 23.0% title, Robust-RB 21.5%, best-available 20.0%, Hero-RB 19.5%) beat WR-WR (17.3%) and Zero-RB (13.7%) with eight playoff spots. Open with Gibbs and take the best of an RB1-tier back, McBride, or a top WR at 19 and 22. The plan roster wins the title in 19.8% of 1,200 simulated seasons (playoffs 94%) against 10.3% for an ESPN-sheet drafter at pick 2; Chase at 2 with a Zero-RB build 12.8%, Chase then Kyren 13.2%, Bijan at 2 14.2%, Allen at 19 17.6%, London/Kraft instead of McBride 15.2%. RB2 by 42, WR3-WR5 in rounds 6-11, QB at 82-99, DST last.
4. Bell-cows get the +3 rushing bonus (Cook +32 points last year, Henry +29, Taylor +8): a tiebreak, not a tier.
5. Bench: 3 RB, 2 WR, 1 swing. No second QB, TE, or DST. The IR slot is a 16th roster spot: draft an IR-tagged stash at 139 and your RB1's handcuff at 142, then move the stash to IR after the draft. The handcuff is measured, not assumed: with Vaki the plan won 16.7% vs 15.3% with a random late RB in his place (about one point of title odds, the same sign in both leagues). With no injuries in the league at all the plan's edge shrinks to 15.9%: part of its value is being built for the injuries that will happen.

### Round by round

| Rd | Pick | Targets, in order | If they are gone | Rule |
|---|---|---|---|---|
| R1 | 2 | Gibbs; Bijan if Gibbs went 1.01 (happens about half the time) | Never reached | Workhorse with Montgomery traded and Pacheco on IR; age 24 |
| R2 | 19 | Best of: an RB1-tier back if one fell (Chase Brown, Cook, Achane, Jeanty), McBride, or London / A.J. Brown / Collins. Jefferson only if he slid past 15 | Olave, Pickens, Rice | RB-first openings won every randomized-room run; RB, McBride, or WR at 19 are within noise of each other. Slot 1 picks twice between your 19 and 22 |
| R3 | 22 | A.J. Brown, Collins, Olave, Pickens (85-100% there in RB-heavy or balanced rooms); Chase Brown if he is still there | Rice, Nabers (only with good Wk-1 news), DeVonta Smith | Leave R3 with RB1 + two of (elite WR / McBride). WR-savvy room: Olave/Pickens/Rice |
| R4 | 39 | DeVonta Smith (coin flip), Flowers, Garrett Wilson, McMillan, Egbuka | Tee Higgins, Loveland only if TE-less and nothing else; Hall if a WR run left him | Best WR2; the RB run on ESPN starts right after this pick |
| R5 | 42 | RB2: Judkins, Montgomery, Irving, Skattebo (Kyren/Javonte/Etienne if they fell); Swift only if the Sept 9 report is clean | Egbuka, McConkey, Loveland | This is the RB2 window. Round 6 has 0-5% of these names left |
| R6 | 59 | WR3: Tee Higgins, Egbuka, McConkey, Burden, DJ Moore, Waddle; or Price if RB2 is still open | Jameson Williams, Odunze (leg: check the Sept 9 report) | The WR discount lives from here to round 11 |
| R7 | 62 | MarShawn Lloyd (GB lead back while Jacobs is out; there in nearly every simulated room), else Stevenson, Henderson, Jameson Williams (Odunze only if the leg is cleared); Kraft if TE-less | Tuten, Kraft, Pitts | RB3 or WR4, whichever tier is thinner |
| R8 | 79 | WR4/RB3: Jameson Williams, Odunze, Stevenson, Henderson, Tate, Parker Washington, Brian Thomas Jr.; Kraft/Fannin/Pitts if TE-less | Michael Wilson, Wan'Dale Robinson | Not a QB yet: Herbert is there at 82 in ~100% of rooms and at 99 in ~85% |
| R9 | 82 | QB: Herbert (rushing floor, ESPN QB15 price); if gone, Lawrence, Mahomes, Stafford, Caleb Williams, Dak | WR4 from the R8 list and take the QB at 99 | Starting lineup complete by R9 |
| R10 | 99 | RB4: Dowdle, Dobbins, Harvey, Gainwell, Hubbard, Pollard, Croskey-Merritt | Herbert/Caleb/Dak/Kyler if no QB yet | Late RBs with a path to 15 touches |
| R11 | 102 | WR5: Michael Wilson, Wan'Dale Robinson, Diggs, Pittman, Q. Johnston, Pierce, Meyers | Kyler (about 50% there at 119) or Daniel Jones if no QB | Volume, not names |
| R12 | 119 | Handcuff-plus: Corum, Mason, Allgeier, Emmett Johnson, Bigsby, Marks; Monangai only if Swift's midsection injury is confirmed serious | Kyler, Purdy, Nix, Daniel Jones if no QB | Backups with standalone value |
| R13 | 122 | Upside WR: Concepcion, Golden, Reed, Doubs, Coker, Stribling, Deebo, Worthy | Kelce, Goedert, Ferguson only if TE-less | Ceiling swings |
| R14 | 139 | IR-tagged stash: Tyson, then Charbonnet, Conner, Pacheco (move to IR right after the draft) | Godwin at his ESPN price (~147) | The IR slot is a free 16th spot; only IR/O-tagged players qualify (not exempt-list Jacobs) |
| R15 | 142 | Your RB1's handcuff: Vaki (Gibbs) or Brian Robinson (Bijan); else DST: Chargers, Browns, Seahawks, Vikings, Bears | Steelers, Eagles, Lions | If you already hold the handcuff, take the DST here |

### ESPN-room buys (their price is well below this board)

- Trey McBride at 19 (room ~18; the highest value-over-replacement pick available to you)
- Chase Brown at 19-22 (room ~26)
- Nico Collins, A.J. Brown, Olave, Pickens at 22 (room 26-32)
- DeVonta Smith at 39 (ESPN ADP 39.4)
- Judkins / Montgomery / Irving / Skattebo at 42 (room 44-53)
- MarShawn Lloyd at 59-62 (printed lists still say ~180)
- Justin Herbert at 82-99 (ESPN QB15)
- Michael Wilson, Wan'Dale Robinson at 99-102
- Kyler Murray at 119; Daniel Jones at 122+
- Chris Godwin at 139-142 (ESPN ADP 147)

### Do not pay the ESPN price

- Jeremiyah Love (room ~25; ankle 50/50 for Wk 1)
- Derrick Henry at 19 (age 32.7; fine at 39)
- Omarion Hampton at 20 (three-back committee; fine at 37-44)
- Lamar Jackson at 38 (QB17 by 2025 ppg)
- Davante Adams at 46 (12.3% TD rate; the only WR ESPN takes early)
- Jaxson Dart at 88 (ESPN staff QB7, so the room takes him early)
- Josh Jacobs anywhere (exempt list, open-ended; not IR-eligible)
- Any DST before round 14

### Status watch (as of Thu Sept 3, evening)

- Nacua: conduct review open, not suspended, not exempt; the league has no deadline, so a 1-6 game ruling can land any day (opener Thu Sept 10 in Melbourne)
- Odunze (right leg) and Swift (midsection) both left Thursday's Bears practice early; no diagnosis; first official report Wed Sept 9. Monangai (knee) still week-to-week
- Chase (knee) and Higgins (heel): DNP Sept 1-2 as precaution, both expected Wk 1
- Jeanty (low-ankle, not IR): side work Sept 1, Kubiak 'yes' on Wk 1 optimism
- Love (high ankle): 'about 50/50' for Wk 1; Allgeier listed first; Conner on IR (out 4+)
- Nabers (ACL): shed the no-contact jersey Aug 31, then left Wed practice 20 min early (team: no injury)
- Kittle (Achilles): off PUP, flew to Australia Sept 2, 'trending' to play; LaPorta (back surgery + new hip): Campbell unsure on Wk 1
- Walker (foot/shoe swelling): DNP twice, Reid not concerned, opener Sept 14; Barkley: foot/ankle checked at practice, stayed in
- Egbuka (toe): day-to-day, Bowles 'hopeful'; Evans (groin) back at practice Sept 2; Henderson (ankle) 'good to go' Sept 9
- Jacobs: exempt list, 'not in line to play Sunday', no timeline; Tyson (NO) and Charbonnet on IR/PUP through Wk 4 at least
- Mahomes (ACL/LCL): full camp, no preseason snaps, starting Sept 14; Kraft (ACL): full-go Wk 1, likely snap count

### Room tactics

- Count RBs in picks 1-10. Six or more: WRs will be there at 22 and 39, so 19 can be the RB that falls (Chase Brown/Jeanty/Walker). Four or fewer: WR1s vanish by 22 but RB2s survive to 59.
- Before pick 19, look at slot 1's round-1 pick; whichever of your two targets slot 1 wants more, take that one first.
- Never chase the tail of a run; take the front of the next one. The ESPN RB run is picks 44-53.
- Say 'did anyone see the Jacobs thing?' before round 5. Two or more reactions: Lloyd at 59-62. Silence: Lloyd at 79.
- Cross names off the ESPN printed sheet. Casual drafters take the top uncrossed name at the position they need.

### Rankings by position

ECR = expert consensus rank (Aug 28). Room = estimated pick where an ESPN cheat-sheet room takes him. ppg = 2025 points per game under this league's scoring.


#### RB

| # | Player | Team | Bye | ECR | Room | 25 ppg | G | Why |
|---|---|---|---|---|---|---|---|---|
| | **Tier 1: Workhorse, 100-target ceiling** | | | | | | | |
| 1 | Jahmyr Gibbs | DET | 6 | 2 | 1 | 22.5 | 17 | 22.5 ppg, 94 tgt, 243 car, 17 games; second-highest ceiling weeks of any RB (best-6 avg 38.5, behind only Taylor). Montgomery traded, Pacheco on IR: first true workhorse season. Age 24. |
| 3 | Bijan Robinson | ATL | 11 | 4 | 1 | 22.9 | 17 | 22.9 ppg, 103 tgt (2nd among RBs), 287 car, five 100-yd rush games. New HC Stefanski/Tua; hold-in resolved with record deal. |
| | **Tier 2: Elite volume with one flag** | | | | | | | |
| 8 | Jonathan Taylor | IND | 13 | 11 | 7 | 22.5 | 17 | 22.5 ppg, 323 car, 18 TD (league high), five 100-yd games (+3 each in League A), highest ceiling weeks of any RB (best-6 38.7). Only 55 tgt. IND's Weeks 15-17 slate (@TEN, CIN, @CLE) is the softest RB playoff schedule on the board. Daniel Jones back from Achilles. |
| 7 | Christian McCaffrey | SF | 8 | 9 | 4 | 25.2 | 17 | 25.2 ppg (RB1 overall), 129 tgt, 311 car. Age 30.3 with 450 touches incl. playoffs; calf tightness in camp resolved, full participant, 'on track' for Sep 10. Bilateral Achilles tendinitis in 2024. Age cliff plus the soft-tissue file are the knocks; the usage model still has him RB4. |
| 9 | James Cook III | BUF | 7 | 15 | 10 | 19.7 | 17 | 19.7 ppg, 309 car, nine 100-yd rushing games (+32 bonus pts in League A, most of any RB). Only 40 tgt: low PPR floor (10.7), high bonus ceiling. ESPN rooms take him ~pick 10. |
| | **Tier 3: RB1 upside, room price inflated or aging** | | | | | | | |
| 10 | Chase Brown | CIN | 6 | 17 | 24 | 17.2 | 17 | 17.2 ppg full season; 22.8 ppg over the last 6 with Burrow healthy (two 32-pt games); 88 tgt. ESPN ADP ~26: the one RB1-ceiling back that actually reaches pick 19-24. |
| 12 | De'Von Achane | MIA | 6 | 20 | 8 | 20.9 | 16 | 20.9 ppg, 85 tgt, 238 car, floor 16.6 (second only to McCaffrey). MIA's offense is Malik Willis throwing to Malik Washington / Tolbert / rookie Caleb Douglas: Achane is the whole offense, for better and worse. ESPN rooms take him ~pick 8. |
| 26 | Derrick Henry | BAL | 13 | 37 | 19 | 18.1 | 17 | 18.1 ppg, 307 car, eight 100-yd games (+29 bonus pts in A). Age 32.7; only 21 tgt (floor 11.2). New OC Doyle. Soft Weeks 15-17 (@PIT, CLE, @CIN). Age-cliff risk is extreme; ESPN takes him ~19. |
| | **Tier 4: RB2 window: picks 39-44** | | | | | | | |
| 36 | Saquon Barkley | PHI | 10 | 24 | 18 | 15.1 | 16 | 15.1 ppg in 2025 (24.6 in 2024), 280 car, 50 tgt, 4.07 YPC. Age 29.6 = RB cliff zone (top-20 RB seasons halve at 29). Left foot/ankle checked by trainers at practice this week, stayed on the field, no diagnosis announced. |
| 20 | Ashton Jeanty | LV | 13 | 26 | 20 | 14.8 | 17 | 14.8 ppg, 266 car, 73 tgt, best-6 avg 24.8. Low-ankle sprain Aug 23 (not high-ankle, not IR); side work Sep 1, Kubiak 'yes' when asked if optimistic for Wk 1 (Sep 2). Cousins/Kubiak upgrade over 2025. Mike Washington Jr. is the hedge. |
| 29 | Kenneth Walker III | KC | 5 | 26 | 17 | 11.6 | 17 | 11.6 ppg in SEA committee (RB28); now KC's clear lead back (Reid RB1s average 250+ touches). Foot soreness/ankle swelling from a shoe issue, DNP twice, Reid not concerned, opener not until Sep 14. Calf/ankle/oblique history: +0.5 expected games missed. |
| 43 | Breece Hall | NYJ | 13 | 39 | 31 | 13.7 | 16 | 13.7 ppg, 243 car, 48 tgt. Signed a 3-yr/$45.75M extension in May (locked-in RB1); Geno Smith at QB. Groin, on track for Wk 1. |
| 17 | Kyren Williams | LA | 11 | 41 | 34 | 15.7 | 17 | 15.7 ppg, 259 car, 50 tgt, 17 games in 2025 (16 in 2024). Corum behind him. Safe RB2, low ceiling. ESPN takes him ~34. |
| | **Tier 5: Committee leads / role backs** | | | | | | | |
| 32 | Javonte Williams | DAL | 14 | 44 | 32 | 15.6 | 16 | 15.6 ppg, 252 car, 51 tgt in DAL's league-worst defense environment (shootouts). Cheap volume RB2. |
| 28 | Omarion Hampton | LAC | 7 | 25 | 19 | 15.4 | 9 | 15.4 ppg in 9 g (ankle). OC McDaniel says all three of Hampton/Vidal/Mitchell play every game, 'hot hand'. Committee = fade at ESPN's ~pick-20 price; fine at 37-44. |
| 62 | Cam Skattebo | NYG | 8 | 57 | 44 | 16.0 | 8 | 16.0 ppg in 8 g before the open tib/fib fracture and ankle dislocation (Oct 2025). Full camp participant, played the preseason opener, says 'ready to go'; Harbaugh: not yet 100% twitchy. Listed starter in a run-heavy offense. Priced at 90% of his healthy line. |
| 27 | Jeremiyah Love | ARI | 14 | 41 | 25 |  |  | Rookie #3 overall (R1 RBs hit top-24 71% of the time). High-ankle sprain Aug 13, no surgery; 'about 50/50' for Wk 1 (Sep 2). Literature: early returners from high-ankle sprains rarely regain form for weeks. Team chart lists Allgeier first. ESPN drafters take him ~25: do not pay that. |
| 39 | Travis Etienne Jr. | NO | 8 | 47 | 38 | 15.3 | 17 | 15.3 ppg, 260 car, 52 tgt in JAX; signed with NO, Kamara (31) still there. Volume RB2. |
| 49 | Bucky Irving | TB | 10 | 58 | 51 | 14.0 | 10 | 14.0 ppg in 10 g; shoulder surgery healed, 'full go'. Gainwell added for a pony package. TB has PFF's #3 OL. |
| 46 | Jadarian Price | SEA | 11 | 73 | 68 |  |  | Rookie R1 (#32), SEA starter: Macdonald 'really confident in him going into Week 1'; Walker gone, Charbonnet PUP (out 4+, likely Wk 7). Zero preseason snaps; Holani in tandem. ECR 73 = discount for a lead back on a Super Bowl offense. |
| | **Tier 6: Handcuff-plus and darts** | | | | | | | |
| 52 | Quinshon Judkins | CLE | 11 | 62 | 47 | 12.3 | 14 | 12.3 ppg in 14 g, 230 car (65% of CLE RB carries), 10.5 ppg after Wk 9. Upgraded OL, Watson at QB, Sampson takes passing downs. ESPN takes him ~47. |
| 50 | D'Andre Swift | CHI | 10 | 54 | 52 | 14.8 | 16 | 14.8 ppg, 223 car, 48 tgt in the Ben Johnson offense. Left Thu Sep 3 practice holding his midsection after a goal-line carry, no diagnosis; Monangai (knee) is week-to-week too. Fade until the Sep 9 report; Roschon Johnson is the contingency. |
| 94 | David Montgomery | HOU | 8 | 61 | 53 | 10.0 | 17 | 10.0 ppg in DET committee; traded to HOU as the clear RB1 with Marks on passing downs. Age 29. Goal-line volume play. |
| 92 | MarShawn Lloyd | GB | 11 | 179 | 96 |  |  | Lead back in GB with Jacobs on the exempt list (open-ended; 6+ games likely). One career game; Kaleb Johnson (traded from PIT Aug 30) and Chris Brooks share. Printed sheets (~180) predate the news; Mike Clay has him RB33. Survives to 62/64 in almost every simulated room. |
| 45 | TreVeyon Henderson | NE | 11 | 70 | 72 | 12.5 | 17 | 12.5 ppg full year; 7.3 ppg Wks 1-9, then 18.4 ppg (RB7) Wks 10-18. Depth chart lists Stevenson first. ESPN ADP ~72 vs Sleeper 52: cheap on ESPN. |
| 114 | Bhayshul Tuten | JAX | 7 | 67 | 50 | 5.9 | 15 | 5.9 ppg as rookie (83 car). Listed RB1 with Etienne gone; Rodriguez behind. Coen offense. Speculative RB1 role at RB3 price. |
| 74 | Rhamondre Stevenson | NE | 11 | 77 | 77 | 13.0 | 14 | 13.0 ppg in 14 g, listed RB1 ahead of Henderson. Age 28.5. Early-down and goal-line role. |
| 60 | Rico Dowdle | PIT | 9 | 88 | 84 | 13.5 | 17 | 13.5 ppg, 236 car, best-6 avg 25.2 in CAR; now PIT ~50/50 with Warren. Volume upside if he wins the job. |
| 76 | Jaylen Warren | PIT | 9 | 77 | 74 | 13.9 | 16 | 13.9 ppg, 211 car; Dowdle signed and reps split ~50/50 in camp. New HC McCarthy. |
| 98 | Kenny Gainwell | TB | 10 | 100 | 104 | 13.0 | 17 | 13.0 ppg, 85 tgt (!) in PIT; now TB pony-package with Irving. PPR-only RB4 with standalone value. |
| 111 | Tony Pollard | TEN | 9 | 84 | 82 | 11.5 | 17 | 11.5 ppg, 242 car, three 100-yd games; contract year, trade candidate; Spears/Singleton behind. |
| 155 | Josh Jacobs | GB | 11 | 46 | 63 | 15.8 | 15 | 15.8 ppg, 234 car. Commissioner's Exempt List (Aug 30), 'not in line to play Sunday', no timeline, 6-game suspension still possible on top. ESPN tags exempt players SSPD, not IR-eligible: he burns a bench slot. Someone in the room will take him off the printed sheet around 55-70; do not. |

#### WR

| # | Player | Team | Bye | ECR | Room | 25 ppg | G | Why |
|---|---|---|---|---|---|---|---|---|
| | **Tier 1: 28%+ share, same QB** | | | | | | | |
| 2 | Ja'Marr Chase | CIN | 6 | 1 | 3 | 20.3 | 16 | 20.3 ppg in 2025 with Burrow hurt most of the year; 24.5 ppg in 2024. 185 tgt, 32% share. Hyperextended knee Aug 25, DNP Sep 1-2 'out of an abundance of caution'; Taylor: could play if there were a game tomorrow. No discount. |
| 4 | Puka Nacua | LA | 11 | 3 | 5 | 24.4 | 16 | 24.4 ppg (WR1), 166 tgt in 16 g, six 100-yd games. Psoas soreness resolved, practicing since Aug 30. NFL conduct review still open as of Sep 3: not suspended, not on the exempt list, and the league has no deadline, so a 1-6 game ruling can land any day. Priced with a 35% chance of a 3-game absence. |
| 5 | Jaxon Smith-Njigba | SEA | 11 | 4 | 6 | 22.0 | 17 | 22.0 ppg, 36% target share (best in NFL), nine 100-yd games, floor 19.8 (highest of any WR). Same QB (Darnold); OC Kubiak left for LV, replaced by Brian Fleury (same Shanahan-tree scheme). Age 24. |
| 6 | Amon-Ra St. Brown | DET | 6 | 5 | 9 | 19.5 | 17 | 19.5 ppg, 172 tgt, 31% share, 11 TD, 17 games four straight years. Floor 13.7 with five 100-yd games; new OC Petzing. |
| | **Tier 2: WR1 volume, new situation** | | | | | | | |
| 15 | CeeDee Lamb | DAL | 14 | 9 | 16 | 16.1 | 13 | 16.2 ppg in 13 g, 25% share with Pickens taking 23%. 17.9 ppg in 2024. Dak healthy; DAL allowed most points in NFL last year (shootouts). |
| 14 | Drake London | ATL | 11 | 12 | 20 | 17.4 | 12 | 17.5 ppg in 12 g, 30% share, 9.3 tgt/g. Tua replaces Penix; Stefanski offense. Missed 5 games in 2025. |
| 23 | A.J. Brown | NE | 11 | 14 | 25 | 15.2 | 15 | 15.2 ppg, 30% share, best-6 avg 25.5. Traded to NE: Drake Maye (31 TD) and Diggs's 1,013 vacated yards. Age 29. Playing through a dislocated thumb (Aug 31) after a camp hamstring; three hamstrings in three years, so 0.5 extra expected games missed. |
| 16 | Justin Jefferson | MIN | 6 | 9 | 15 | 12.1 | 17 | 12.1 ppg (141 tgt, 30% share, 2 TD, 7.4 yds/target vs 9.95 in 2024; 19.1 ppg in 2024). TD rate will rebound (+1.5-2 ppg); the efficiency half depends on Kyler Murray. Range WR6-WR14, and ECR 9 already prices most of the rebound. Softest Weeks 15-17 WR slate in the NFL (DET, WAS, @NYJ). |
| 19 | Nico Collins | HOU | 8 | 16 | 28 | 15.4 | 15 | 15.4 ppg (18.1 in 2024), 25% share. Jayden Higgins (ACL) and Dell (IR) out: Collins is the only proven target in HOU. ESPN drafters take him ~12 picks later than experts. |
| | **Tier 3: WR2 with WR1 weeks** | | | | | | | |
| 13 | George Pickens | DAL | 14 | 20 | 31 | 17.6 | 17 | 17.6 ppg, 137 tgt, 9 TD, best-6 avg 29.3. TD-dependent (9 of 137 tgt) with Lamb back healthy: ceiling real, share capped ~23%. |
| 18 | Chris Olave | NO | 8 | 17 | 29 | 17.0 | 16 | 17.0 ppg, 156 tgt, 29% share, led NFL in air yards. Rookie Tyson on IR ~2 months: target monopoly with Shough. |
| 24 | Rashee Rice | KC | 5 | 24 | 22 | 18.9 | 8 | 19.0 ppg in 8 g, 9.8 tgt/g, 29% share. May 2026 arthroscopic cleanup on the surgically repaired knee; back in 11-on-11 late August. Mahomes back from ACL/LCL; Bieniemy OC. Has not played more than 8 games since 2023. |
| 30 | DeVonta Smith | PHI | 10 | 24 | 39 | 12.0 | 17 | 12.1 ppg, 113 tgt. A.J. Brown traded to NE: Smith is the only proven WR in PHI (Hurts, 25 TD). ESPN ADP ~39 = end of R4. |
| 53 | Garrett Wilson | NYJ | 13 | 29 | 40 | 14.2 | 7 | 14.2 ppg in 7 g, 34% target share. Geno Smith is the new QB (upgrade). Missed 10 games in 2025. |
| 25 | Zay Flowers | BAL | 13 | 30 | 42 | 14.6 | 17 | 14.6 ppg, 118 tgt, 29% share, 17 games. New OC Doyle; quad contusion 'nothing major'. |
| | **Tier 4: Breakout and volume WR3** | | | | | | | |
| 31 | Tetairoa McMillan | CAR | 5 | 35 | 43 | 12.7 | 17 | 12.7 ppg, 122 tgt, 25% share, OROY, 40.9% air-yard share. Year-2 leap profile; Bryce Young caps ceiling. |
| 84 | Malik Nabers | NYG | 8 | 24 | 30 | 14.7 | 4 | 18.5 ppg over 15 games in 2024 (the 2025 four-game sample is one 39-pt game). ACL+meniscus Oct 2025: shed the no-contact jersey Aug 31, Harbaugh 'reasonable to assume' Wk 1, but he left Wed Sep 2 practice ~20 min early with trainers (team says no injury). WR ACL year-1 production loss is the largest in the literature (age 23 helps): priced at 90% of his healthy line. Dart at QB. Karabell has him on ESPN's do-not-draft list, so he may fall. |
| 35 | Emeka Egbuka | TB | 10 | 40 | 52 | 11.8 | 17 | 11.8 ppg, 127 tgt, 24% share as rookie; hot Wks 1-5 then faded. Toe sprain Aug 12, still day-to-day, Bowles 'hopeful' for Wk 1, local beat says 'lingering'. Evans gone (SF); Godwin (30, off two ankle surgeries) is the WR2. |
| 42 | Ladd McConkey | LAC | 7 | 34 | 49 | 11.5 | 16 | 11.5 ppg (15.3 in 2024), 106 tgt. McDaniel OC historically feeds slot WRs. Year-3 bounce candidate. |
| 38 | Tee Higgins | CIN | 6 | 36 | 55 | 14.2 | 15 | 14.2 ppg, 11 TD on 98 tgt (11.2% TD rate; league ~5.5%, so ~5 TD and ~12 ppg is the regressed line). Heel contusion, DNP Sep 2 but ran hills, expected Wk 1. Hamstring/quad history. ESPN price ~55: fine at 42-59, not at 30. |
| 44 | Jaylen Waddle | DEN | 10 | 34 | 46 | 12.2 | 16 | 12.2 ppg (10.2 in 2024), 100 tgt. Traded to DEN: Nix, Sutton competition. Volume unclear. |
| 64 | Luther Burden III | CHI | 10 | 46 | 60 | 8.7 | 15 | 8.7 ppg but 5.6 tgt/g over Wks 10-18, #3 in NFL yards per route run (2.69). DJ Moore's 85 targets vacated. Classic year-2 breakout. |
| | **Tier 5: WR4 floor / TD swing** | | | | | | | |
| 59 | DJ Moore | BUF | 7 | 52 | 61 | 10.1 | 17 | 10.1 ppg in CHI; traded to BUF as Josh Allen's WR1 (Diggs/Cooper never cleared 85 tgt there). Floor play at WR3 price. |
| 33 | Jameson Williams | DET | 6 | 54 | 70 | 13.3 | 17 | 13.3 ppg, 102 tgt, 90% snaps, best-6 23.4. Deep-threat volatility; new OC Petzing. |
| 81 | Terry McLaurin | WAS | 7 | 47 | 56 | 11.4 | 10 | 11.4 ppg in 10 g, age 31. Diggs added Aug 7; Daniels' health. Fading volume. |
| 56 | Davante Adams | LA | 11 | 50 | 46 | 16.0 | 14 | 16.0 ppg, 14 TD on 114 tgt (12.3% TD rate; regressed line ~12.7 ppg). Age 33.7. The only top-50 WR ESPN rooms take EARLIER than experts (~46): never a value there. |
| 55 | Wan'Dale Robinson | TEN | 9 | 85 | 93 | 13.9 | 16 | 13.9 ppg, 140 tgt, 30% share in NYG. Signed 4yr/$78M with TEN (Daboll OC). Slot PPR floor; Tate competes. |
| 65 | Rome Odunze | CHI | 10 | 57 | 66 | 12.4 | 12 | 12.4 ppg in 12 g, 24% share, WR11 ppg Wks 1-8; listed WR1 outside with Moore gone. Left Thu Sep 3 practice early (right leg, walked off, no diagnosis); 2025 foot stress fracture. First official report Wed Sep 9: draft a round later than the sheet and hedge. |
| 82 | Christian Watson | GB | 11 | 57 | 80 | 13.4 | 10 | 13.4 ppg in 10 g, 19% share; GB WR1 on depth chart. Injury history; TD-dependent. |
| 107 | Mike Evans | SF | 8 | 56 | 62 | 10.8 | 8 | 10.8 ppg in 8 g, age 33. Signed with SF (Purdy, Shanahan); Pearsall done for the season, Deebo WR2. Camp groin kept him out a week, back Sep 2 and expected Sep 10. Three hamstrings plus a groin: chronic soft-tissue flag, +1 expected game missed. |
| | **Tier 6: Late volume and darts** | | | | | | | |
| 68 | Michael Wilson | ARI | 14 | 88 | 105 | 13.2 | 17 | 13.2 ppg, 126 tgt, best-6 avg 25.7 (WR ~12 in ceiling weeks). Listed WR2 in ARI; Brissett throws volume. ADP ~88 = value. |
| 58 | Parker Washington | JAX | 7 | 63 | 78 | 11.7 | 16 | 11.7 ppg, 95 tgt; 16.4 ppg over the last 6 games as JAX WR1 (three straight 20-pt games). Hunter is a part-time WR in 2026 (CB first). |
| 54 | Carnell Tate | TEN | 9 | 68 | 70 |  |  | Rookie #4 overall, listed WR1 in TEN with Cam Ward. R1 rookie WRs finish top-24 only 28% of the time; Wan'Dale takes slot volume. |
| 77 | Brian Thomas Jr. | JAX | 7 | 80 | 74 | 9.9 | 14 | 9.9 ppg in 14 g (17.1 as a rookie in 2024). Lawrence healthy all 17 games; Hunter part-time. Bounce-back with WR1 ceiling. |
| 85 | Marvin Harrison Jr. | ARI | 14 | 68 | 72 | 10.7 | 12 | 10.7 ppg in 12 g, 18% share. Brissett (volume thrower) replaces Kyler; McBride still eats. Year-3 leap or bust. |
| 61 | DK Metcalf | PIT | 9 | 78 | 66 | 12.7 | 15 | 12.7 ppg, 99 tgt, 23% share with Rodgers; Pittman added. Best-ball TD swings. |
| 71 | Courtland Sutton | DEN | 10 | 83 | 84 | 13.1 | 17 | 13.1 ppg, 124 tgt, 22% share, 17 games. Waddle added; age 31. |
| 73 | Michael Pittman Jr. | PIT | 9 | 80 | 86 | 12.0 | 17 | 12.0 ppg, 111 tgt; traded to PIT with Rodgers (age 42.8). Volume WR3. |
| 104 | Josh Downs | IND | 13 | 87 | 98 | 8.7 | 16 | 8.7 ppg, 88 tgt; Pittman traded, Keenan Allen added. Slot volume WR4. |
| 100 | Stefon Diggs | WAS | 7 | 96 | 95 | 12.8 | 17 | 12.8 ppg, 102 tgt, five 100-yd games in NE; signed with WAS Aug 7 as 1B to McLaurin. Age 33. |
| 67 | Quentin Johnston | LAC | 7 | 95 | 100 | 13.3 | 13 | 13.3 ppg in 13 g, 8 TD, 20% share. McDaniel OC. WR4 with TD equity. |
| 70 | Alec Pierce | IND | 13 | 100 | 108 | 12.4 | 15 | 12.4 ppg, 84 tgt, listed WR1 in IND; Pittman gone. Deep threat with League B 50-yd TD bonus appeal. |

#### TE

| # | Player | Team | Bye | ECR | Room | 25 ppg | G | Why |
|---|---|---|---|---|---|---|---|---|
| | **Tier 1: TE1 by 4 ppg (round 2)** | | | | | | | |
| 11 | Trey McBride | ARI | 14 | 21 | 18 | 18.8 | 17 | 18.9 ppg = TE1 by 4 ppg over TE2; 169 tgt, 27% share, WR-like usage. Brissett replaces Kyler (Brissett threw to him at 8+ tgt/g in 2025 too). |
| | **Tier 2: Elite ceiling, injury discount** | | | | | | | |
| 22 | Brock Bowers | LV | 13 | 19 | 14 | 14.9 | 12 | 14.9 ppg in 12 g (2025, injured); 15.6 ppg TE1 in 2024. Cousins + Kubiak scheme. TE2-4 tier is worth ~4 ppg over replacement. |
| | **Tier 3: Role bets, not production** | | | | | | | |
| 37 | Colston Loveland | CHI | 10 | 37 | 45 | 10.4 | 16 | 10.4 ppg as a rookie (TE16 per game), 82 tgt (17% share), 64% snaps. Rank is a role bet (DJ Moore's 85 targets vacated, Ben Johnson), not a production one. ESPN ADP 45: take him at 42-45 only if TE-less. |
| 34 | Tyler Warren | IND | 13 | 53 | 54 | 11.1 | 17 | 11.1 ppg, 112 tgt (21% share) as a rookie, 84% snaps. Daniel Jones back. TE3-5 range; ESPN ~54. |
| | **Tier 4: Streamer-plus (Kraft is the fallback)** | | | | | | | |
| 47 | Kyle Pitts Sr. | ATL | 11 | 78 | 73 | 12.5 | 17 | 12.5 ppg, 118 tgt (23% share), 17 games. Tua at QB is a target-funnel QB. TE4-6. |
| 63 | Tucker Kraft | GB | 11 | 80 | 76 | 15.0 | 8 | 15.0 ppg in 8 g, but two spike games (25.9, 34.8) were 51% of it; the other six averaged 9.9. ACL Nov 2: off PUP July 31, full joint-practice contact, 'full-go' Wk 1 per CBS, likely on a snap count early. TE5-7 with TE1 weeks. |
| 48 | Harold Fannin Jr. | CLE | 11 | 73 | 85 | 11.7 | 16 | 11.7 ppg, 107 tgt as a rookie (21% share). Watson at QB, Monken HC. TE5-8 with volume. |
| 87 | Sam LaPorta | DET | 6 | 85 | 78 | 11.9 | 9 | 11.9 ppg in 9 g (2025, lumbar disc surgery ~Wk 10); cleared for camp, then a hip injury in late August and Campbell 'I don't know' on Wk 1. Back literature: stats hold after discectomy, availability does not. TE8-10 with a 1.5-game haircut. |
| | **Tier 5: Only if cheap** | | | | | | | |
| 103 | George Kittle | SF | 8 | 98 | 92 | 14.8 | 11 | 14.8 ppg in 11 g; Achilles tear Jan 11, activated from PUP, flew to Australia with the team Sep 2 and is 'trending' to play Wk 1. Age 33. Achilles literature: TE return rate is the best of any position (71%) but only 27% of players get back to their prior level in year 1, so he is priced at 85% of his healthy line (TE6-8), not TE1. |
| 75 | Travis Kelce | KC | 5 | 98 | 88 | 11.4 | 17 | 11.4 ppg, 108 tgt, 17 games; age 37. Mahomes back. TE8-10 floor. |
| 112 | Dalton Kincaid | BUF | 7 | 112 | 106 | 10.8 | 12 | 10.8 ppg in 12 g; 37% snaps in 2025 split with Knox. DJ Moore added. TE10-12. |
| 86 | Jake Ferguson | DAL | 14 | 118 | 116 | 11.1 | 17 | 11.1 ppg, 102 tgt, 17 games. TE volume floor in a high-scoring DAL offense. |
| 83 | Dallas Goedert | PHI | 10 | 117 | 112 | 12.4 | 15 | 12.4 ppg on 11 TD in 82 tgt (13.4% TD rate; regressed ~9.8 ppg); age 31.7; more targets with A.J. Brown gone. TE10-12. |
| 110 | Mark Andrews | BAL | 13 | 131 |  | 7.7 | 17 | 7.7 ppg, 70 tgt; age 31; listed TE1 in BAL. TE12-15. |

#### QB

| # | Player | Team | Bye | ECR | Room | 25 ppg | G | Why |
|---|---|---|---|---|---|---|---|---|
| | **Tier 1: QB1 both formats** | | | | | | | |
| 21 | Josh Allen | BUF | 7 | 25 | 24 | 22.8 | 16 | 22.8 ppg (4-pt) / 26.3 (6-pt), 14 rush TD, 112 car. QB1 both formats; DJ Moore added. Realized edge over QB11 was ~4.9 ppg; QB edges persist only ~half as well as RB/WR, so the expected edge is ~3 ppg (a WR12-15 equivalent). ESPN rooms let him reach ~24. |
| | **Tier 2: Round-4 only if they fall** | | | | | | | |
| 40 | Drake Maye | NE | 11 | 37 | 48 | 20.7 | 17 | 20.7/24.5 ppg, 31 TD, 450 rush yds, 17 games, age 24. A.J. Brown added. QB2-4 in 6-pt scoring (+2.7 ppg over QB11 in 2025). ESPN ADP ~48: he is a pick-37 decision in League B. |
| 41 | Lamar Jackson | BAL | 13 | 32 | 38 | 16.5 | 13 | 16.5/19.8 ppg in 13 g (2 rush TD, QB17 by ppg); 25.5 ppg in 2024. Shrinking the two years together gives ~QB5. Age 29.7, new OC. ESPN takes him ~38: let someone else pay for 2024. |
| | **Tier 3: Wait-and-win tier (picks 82-99)** | | | | | | | |
| 69 | Joe Burrow | CIN | 6 | 45 | 58 | 16.8 | 8 | 16.8/21.6 ppg in 8 g (turf toe). Healthy: 2024 was 22.9 ppg (4-pt). Chase/Higgins/Brown. QB1 upside at QB5 price. |
| 51 | Jalen Hurts | PHI | 10 | 56 | 60 | 18.8 | 16 | 18.8/22.1 ppg, 8 rush TD, 105 car. A.J. Brown gone lowers passing ceiling; Tush Push keeps TD floor. |
| 79 | Justin Herbert | LAC | 7 | 71 | 114 | 18.4 | 16 | 18.4/21.8 ppg, 26 TD, 498 rush yds (career high), 16 games. ESPN ADP QB15 (~pick 114) vs expert QB7: he is there at 79 in ~100% of simulated rooms and at 99 in ~85%. Take him at 82-99, not 79. |
| 66 | Trevor Lawrence | JAX | 7 | 77 | 92 | 19.9 | 17 | 19.9/23.4 ppg, 29 TD, 359 rush yds, 9 rush TD, 17 games. Priced QB9-10; Coen offense year 2. |
| 95 | Matthew Stafford | LA | 11 | 104 | 76 | 21.1 | 17 | 21.1/26.6 ppg, 46 TD on a 7.7% TD rate (league 4.6%, his own 2024 3.5%). At a top-10 rate he is ~32 TD and ~22 ppg in League B (QB8-11). Age 38.6. Biggest ECR-vs-ppg gap on the board, but half of it is TD luck, and ESPN rooms already price him QB8 (~76). League B target at 64-77, never at 39. |
| | **Tier 4: Free QB1 upside (R11-13)** | | | | | | | |
| 90 | Jayden Daniels | WAS | 7 | 53 | 62 | 16.3 | 7 | 16.3/18.6 ppg in 7 g (four separate injuries). 21.1 ppg in 2024. Rushing floor when healthy; availability risk. |
| 106 | Patrick Mahomes II | KC | 5 | 101 | 82 | 20.4 | 14 | 20.4/23.8 ppg in 14 g, 422 rush yds. ACL/LCL Dec 14; full camp participant, no preseason snaps, 'on track' for Mon Sep 14 (exactly 9 months post-op). QB ACL literature: 92% return, no production loss. Rice/Worthy/Kelce; Bieniemy back. |
| 57 | Caleb Williams | CHI | 10 | 67 | 85 | 18.7 | 17 | 18.7/22.0 ppg, 27 TD, 388 rush yds, 17 games. Year 3 under Ben Johnson; Moore gone, Burden/Odunze/Loveland up. |
| 78 | Dak Prescott | DAL | 14 | 78 | 90 | 18.5 | 17 | 18.5/22.7 ppg, 30 TD, six 300-yd games (League B bonus). Age 33. Lamb+Pickens. |
| 116 | Jaxson Dart | NYG | 8 | 97 | 88 | 17.3 | 14 | 17.3/19.4 ppg in 14 g, 487 rush yds, 9 rush TD (86 car). Rushing floor; Nabers back. ESPN's own staff rank him QB7, so the room takes him ~88: he is not a late fallback in an ESPN room. |
| | **Tier 5: Streamers** | | | | | | | |
| 124 | Kyler Murray | MIN | 6 | 112 | 115 | 15.6 | 5 | 15.6/18.0 ppg in 5 g (ARI); signed with MIN as starter over McCarthy. 500+ rush yds projected; Jefferson/Addison/Hockenson. Round-12 price on ESPN. |
| 93 | Brock Purdy | SF | 8 | 96 | 105 | 19.7 | 9 | 19.7/24.6 ppg in 9 g (injured). Evans + Kittle + CMC. 6-pt league QB8 upside at QB14 price. |
| 80 | Bo Nix | DEN | 10 | 99 | 99 | 17.9 | 17 | 17.9/21.3 ppg, 25 TD, 356 rush yds, 17 games. Waddle added. Streamer-plus. |
| 97 | Jared Goff | DET | 6 | 106 | 110 | 17.5 | 17 | 17.5/22.2 ppg, 34 TD, six 300-yd games. Zero rushing. 6-pt league value only. |
| 179 | Daniel Jones | IND | 13 | 147 | 134 | 17.4 | 13 | 17.4/20.6 ppg in 13 g before the Achilles (Dec 2025); says 100%, took every first-team rep in camp, starting Sep 13. Achilles year-1 haircut applies even to QBs. Taylor/Warren/Pierce/Downs/Allen. ECR 148 = free QB12-14. |
| 117 | Baker Mayfield | TB | 10 | 118 |  | 16.0 | 17 | 16.0/19.3 ppg, 26 TD, 382 rush yds. Egbuka/Godwin; Evans gone. QB14 range. |
| 171 | Jordan Love | GB | 11 | 118 |  | 15.7 | 15 | 15.7/19.0 ppg in 15 g. Watson/Reed/Golden/Kraft. Streamer. |

#### DST

| # | Player | Team | Bye | ECR | Room | 25 ppg | G | Why |
|---|---|---|---|---|---|---|---|---|
| | **Tier 1: Round-15 picks (Weeks 1-2 opponents)** | | | | | | | |
| 157 | Los Angeles Chargers | LAC | 7 | 193 |  |  |  | 7.2 ppg in 2025. Wks 1-2 vs ARI (Brissett) and LV (Cousins): the best two-week opener of any DST; then @BUF, @SEA (stream those). Round-15 pick #1. |
| 158 | Cleveland Browns | CLE | 11 | 219 |  |  |  | 7.7 ppg in 2025 with Garrett; Wks 1-4 @JAX, @TB, CAR (Young), PIT. Round-15 pick #2. |
| 159 | Seattle Seahawks | SEA | 11 | 167 |  |  |  | Best DST in 2025 under this scoring (8.4 ppg); Wks 1-4 NE, @ARI, @WAS, LAC. Champion defense with a soft Wk 2. |
| 160 | Minnesota Vikings | MIN | 6 | 185 |  |  |  | Allowed the fewest fantasy points in the NFL in 2025 (66.2/g), 7.3 DST ppg; Wks 1-4 GB, @CHI, @TB, MIA (Willis). Elite from Week 5 on. |
| 161 | Chicago Bears | CHI | 10 | 263 |  |  |  | Only 5.4 ppg in 2025 but the softest four-week opener in the league: @CAR (Young), MIN, PHI, NYJ (Geno). Streamer #5. |
| | **Tier 2: If those are gone** | | | | | | | |
| 162 | Philadelphia Eagles | PHI | 10 | 174 |  |  |  | 6.5 ppg in 2025; Wks 1-4 WAS, @TEN (Ward), @CHI, LA. Soft Week 2. |
| 163 | Pittsburgh Steelers | PIT | 9 | 186 |  |  |  | 5.4 ppg in 2025; Wks 1-4 ATL, @NE, CIN, @CLE. Watt pass rush; Week 4 is the soft one. |
| 164 | Detroit Lions | DET | 6 | 220 |  |  |  | Wks 1-4 NO, @BUF, NYJ, @CAR (three soft offenses) but only 4.6 ppg in 2025 and safeties Branch and Joseph miss Weeks 1-4. Last of the streamable eight. |
| | **Tier 3: Week-5 waiver targets, not round-15 picks** | | | | | | | |
| 165 | Houston Texans | HOU | 8 | 152 |  |  |  | ECR DST1 and 8.2 ppg in 2025, but Wks 1-4 = BUF, CIN, @IND, DAL (the four hardest openers). Goes ~R11 on ESPN; a Week-5 waiver target, not a round-15 pick. |
| 166 | Denver Broncos | DEN | 10 | 163 |  |  |  | ECR DST2, 8.1 ppg in 2025; Wks 1-4 @KC, JAX, LA, @SF. Elite pass rush, tough openers; Week-5 waiver target. |

### Overall top 150

| # | Player | Pos | Team | Bye | ECR | Room | 25 ppg |
|---|---|---|---|---|---|---|---|
| 1 | Jahmyr Gibbs | RB1 | DET | 6 | 2 | 1 | 22.5 |
| 2 | Ja'Marr Chase | WR1 | CIN | 6 | 1 | 3 | 20.3 |
| 3 | Bijan Robinson | RB2 | ATL | 11 | 4 | 1 | 22.9 |
| 4 | Puka Nacua | WR2 | LA | 11 | 3 | 5 | 24.4 |
| 5 | Jaxon Smith-Njigba | WR3 | SEA | 11 | 4 | 6 | 22.0 |
| 6 | Amon-Ra St. Brown | WR4 | DET | 6 | 5 | 9 | 19.5 |
| 7 | Christian McCaffrey | RB3 | SF | 8 | 9 | 4 | 25.2 |
| 8 | Jonathan Taylor | RB4 | IND | 13 | 11 | 7 | 22.5 |
| 9 | James Cook III | RB5 | BUF | 7 | 15 | 10 | 19.7 |
| 10 | Chase Brown | RB6 | CIN | 6 | 17 | 24 | 17.2 |
| 11 | Trey McBride | TE1 | ARI | 14 | 21 | 18 | 18.8 |
| 12 | De'Von Achane | RB7 | MIA | 6 | 20 | 8 | 20.9 |
| 13 | George Pickens | WR5 | DAL | 14 | 20 | 31 | 17.6 |
| 14 | Drake London | WR6 | ATL | 11 | 12 | 20 | 17.4 |
| 15 | CeeDee Lamb | WR7 | DAL | 14 | 9 | 16 | 16.1 |
| 16 | Justin Jefferson | WR8 | MIN | 6 | 9 | 15 | 12.1 |
| 17 | Kyren Williams | RB8 | LA | 11 | 41 | 34 | 15.7 |
| 18 | Chris Olave | WR9 | NO | 8 | 17 | 29 | 17.0 |
| 19 | Nico Collins | WR10 | HOU | 8 | 16 | 28 | 15.4 |
| 20 | Ashton Jeanty | RB9 | LV | 13 | 26 | 20 | 14.8 |
| 21 | Josh Allen | QB1 | BUF | 7 | 25 | 24 | 22.8 |
| 22 | Brock Bowers | TE2 | LV | 13 | 19 | 14 | 14.9 |
| 23 | A.J. Brown | WR11 | NE | 11 | 14 | 25 | 15.2 |
| 24 | Rashee Rice | WR12 | KC | 5 | 24 | 22 | 18.9 |
| 25 | Zay Flowers | WR13 | BAL | 13 | 30 | 42 | 14.6 |
| 26 | Derrick Henry | RB10 | BAL | 13 | 37 | 19 | 18.1 |
| 27 | Jeremiyah Love | RB11 | ARI | 14 | 41 | 25 |  |
| 28 | Omarion Hampton | RB12 | LAC | 7 | 25 | 19 | 15.4 |
| 29 | Kenneth Walker III | RB13 | KC | 5 | 26 | 17 | 11.6 |
| 30 | DeVonta Smith | WR14 | PHI | 10 | 24 | 39 | 12.0 |
| 31 | Tetairoa McMillan | WR15 | CAR | 5 | 35 | 43 | 12.7 |
| 32 | Javonte Williams | RB14 | DAL | 14 | 44 | 32 | 15.6 |
| 33 | Jameson Williams | WR16 | DET | 6 | 54 | 70 | 13.3 |
| 34 | Tyler Warren | TE3 | IND | 13 | 53 | 54 | 11.1 |
| 35 | Emeka Egbuka | WR17 | TB | 10 | 40 | 52 | 11.8 |
| 36 | Saquon Barkley | RB15 | PHI | 10 | 24 | 18 | 15.1 |
| 37 | Colston Loveland | TE4 | CHI | 10 | 37 | 45 | 10.4 |
| 38 | Tee Higgins | WR18 | CIN | 6 | 36 | 55 | 14.2 |
| 39 | Travis Etienne Jr. | RB16 | NO | 8 | 47 | 38 | 15.3 |
| 40 | Drake Maye | QB2 | NE | 11 | 37 | 48 | 20.7 |
| 41 | Lamar Jackson | QB3 | BAL | 13 | 32 | 38 | 16.5 |
| 42 | Ladd McConkey | WR19 | LAC | 7 | 34 | 49 | 11.5 |
| 43 | Breece Hall | RB17 | NYJ | 13 | 39 | 31 | 13.7 |
| 44 | Jaylen Waddle | WR20 | DEN | 10 | 34 | 46 | 12.2 |
| 45 | TreVeyon Henderson | RB18 | NE | 11 | 70 | 72 | 12.5 |
| 46 | Jadarian Price | RB19 | SEA | 11 | 73 | 68 |  |
| 47 | Kyle Pitts Sr. | TE5 | ATL | 11 | 78 | 73 | 12.5 |
| 48 | Harold Fannin Jr. | TE6 | CLE | 11 | 73 | 85 | 11.7 |
| 49 | Bucky Irving | RB20 | TB | 10 | 58 | 51 | 14.0 |
| 50 | D'Andre Swift | RB21 | CHI | 10 | 54 | 52 | 14.8 |
| 51 | Jalen Hurts | QB4 | PHI | 10 | 56 | 60 | 18.8 |
| 52 | Quinshon Judkins | RB22 | CLE | 11 | 62 | 47 | 12.3 |
| 53 | Garrett Wilson | WR21 | NYJ | 13 | 29 | 40 | 14.2 |
| 54 | Carnell Tate | WR22 | TEN | 9 | 68 | 70 |  |
| 55 | Wan'Dale Robinson | WR23 | TEN | 9 | 85 | 93 | 13.9 |
| 56 | Davante Adams | WR24 | LA | 11 | 50 | 46 | 16.0 |
| 57 | Caleb Williams | QB5 | CHI | 10 | 67 | 85 | 18.7 |
| 58 | Parker Washington | WR25 | JAX | 7 | 63 | 78 | 11.7 |
| 59 | DJ Moore | WR26 | BUF | 7 | 52 | 61 | 10.1 |
| 60 | Rico Dowdle | RB23 | PIT | 9 | 88 | 84 | 13.5 |
| 61 | DK Metcalf | WR27 | PIT | 9 | 78 | 66 | 12.7 |
| 62 | Cam Skattebo | RB24 | NYG | 8 | 57 | 44 | 16.0 |
| 63 | Tucker Kraft | TE7 | GB | 11 | 80 | 76 | 15.0 |
| 64 | Luther Burden III | WR28 | CHI | 10 | 46 | 60 | 8.7 |
| 65 | Rome Odunze | WR29 | CHI | 10 | 57 | 66 | 12.4 |
| 66 | Trevor Lawrence | QB6 | JAX | 7 | 77 | 92 | 19.9 |
| 67 | Quentin Johnston | WR30 | LAC | 7 | 95 | 100 | 13.3 |
| 68 | Michael Wilson | WR31 | ARI | 14 | 88 | 105 | 13.2 |
| 69 | Joe Burrow | QB7 | CIN | 6 | 45 | 58 | 16.8 |
| 70 | Alec Pierce | WR32 | IND | 13 | 100 | 108 | 12.4 |
| 71 | Courtland Sutton | WR33 | DEN | 10 | 83 | 84 | 13.1 |
| 72 | RJ Harvey | RB25 | DEN | 10 | 97 | 95 | 12.2 |
| 73 | Michael Pittman Jr. | WR34 | PIT | 9 | 80 | 86 | 12.0 |
| 74 | Rhamondre Stevenson | RB26 | NE | 11 | 77 | 77 | 13.0 |
| 75 | Travis Kelce | TE8 | KC | 5 | 98 | 88 | 11.4 |
| 76 | Jaylen Warren | RB27 | PIT | 9 | 77 | 74 | 13.9 |
| 77 | Brian Thomas Jr. | WR35 | JAX | 7 | 80 | 74 | 9.9 |
| 78 | Dak Prescott | QB8 | DAL | 14 | 78 | 90 | 18.5 |
| 79 | Justin Herbert | QB9 | LAC | 7 | 71 | 114 | 18.4 |
| 80 | Bo Nix | QB10 | DEN | 10 | 99 | 99 | 17.9 |
| 81 | Terry McLaurin | WR36 | WAS | 7 | 47 | 56 | 11.4 |
| 82 | Christian Watson | WR37 | GB | 11 | 57 | 80 | 13.4 |
| 83 | Dallas Goedert | TE9 | PHI | 10 | 117 | 112 | 12.4 |
| 84 | Malik Nabers | WR38 | NYG | 8 | 24 | 30 | 14.7 |
| 85 | Marvin Harrison Jr. | WR39 | ARI | 14 | 68 | 72 | 10.7 |
| 86 | Jake Ferguson | TE10 | DAL | 14 | 118 | 116 | 11.1 |
| 87 | Sam LaPorta | TE11 | DET | 6 | 85 | 78 | 11.9 |
| 88 | Jonathon Brooks | RB28 | CAR | 5 | 90 | 111 |  |
| 89 | Makai Lemon | WR40 | PHI | 10 | 109 | 118 |  |
| 90 | Jayden Daniels | QB11 | WAS | 7 | 53 | 62 | 16.3 |
| 91 | Jordan Addison | WR41 | MIN | 6 | 105 | 109 | 9.9 |
| 92 | MarShawn Lloyd | RB29 | GB | 11 | 179 | 96 |  |
| 93 | Brock Purdy | QB12 | SF | 8 | 96 | 105 | 19.7 |
| 94 | David Montgomery | RB30 | HOU | 8 | 61 | 53 | 10.0 |
| 95 | Matthew Stafford | QB13 | LA | 11 | 104 | 76 | 21.1 |
| 96 | Jakobi Meyers | WR42 | JAX | 7 | 104 | 96 | 11.0 |
| 97 | Jared Goff | QB14 | DET | 6 | 106 | 110 | 17.5 |
| 98 | Kenny Gainwell | RB31 | TB | 10 | 100 | 104 | 13.0 |
| 99 | Juwan Johnson | TE12 | NO | 8 | 134 |  | 10.6 |
| 100 | Stefon Diggs | WR43 | WAS | 7 | 96 | 95 | 12.8 |
| 101 | Hunter Henry | TE13 | NE | 11 | 164 |  | 10.6 |
| 102 | Khalil Shakir | WR44 | BUF | 7 | 123 |  | 10.5 |
| 103 | George Kittle | TE14 | SF | 8 | 98 | 92 | 14.8 |
| 104 | Josh Downs | WR45 | IND | 13 | 87 | 98 | 8.7 |
| 105 | Romeo Doubs | WR46 | NE | 11 | 127 |  | 10.3 |
| 106 | Patrick Mahomes II | QB15 | KC | 5 | 101 | 82 | 20.4 |
| 107 | Mike Evans | WR47 | SF | 8 | 56 | 62 | 10.8 |
| 108 | KC Concepcion | WR48 | CLE | 11 | 118 | 119 |  |
| 109 | J.K. Dobbins | RB32 | DEN | 10 | 100 | 90 | 12.2 |
| 110 | Mark Andrews | TE15 | BAL | 13 | 131 |  | 7.7 |
| 111 | Tony Pollard | RB33 | TEN | 9 | 84 | 82 | 11.5 |
| 112 | Dalton Kincaid | TE16 | BUF | 7 | 112 | 106 | 10.8 |
| 113 | Dalton Schultz | TE17 | HOU | 8 | 163 |  | 10.5 |
| 114 | Bhayshul Tuten | RB34 | JAX | 7 | 67 | 50 | 5.9 |
| 115 | De'Zhaun Stribling | WR49 | SF | 8 | 132 |  |  |
| 116 | Jaxson Dart | QB16 | NYG | 8 | 97 | 88 | 17.3 |
| 117 | Baker Mayfield | QB17 | TB | 10 | 118 |  | 16.0 |
| 118 | Xavier Worthy | WR50 | KC | 5 | 129 | 120 | 7.8 |
| 119 | Oronde Gadsden II | TE18 | LAC | 7 | 211 |  | 8.9 |
| 120 | Jacory Croskey-Merritt | RB35 | WAS | 7 | 113 | 101 | 8.6 |
| 121 | Jordan Watkins | WR51 | SF | 8 | 318 |  | 2.3 |
| 122 | Brenton Strange | TE19 | JAX | 7 | 159 |  | 9.8 |
| 123 | Troy Franklin | WR52 | DEN | 10 | 216 |  | 10.4 |
| 124 | Kyler Murray | QB18 | MIN | 6 | 112 | 115 | 15.6 |
| 125 | Chig Okonkwo | TE20 | WAS | 7 | 160 |  | 7.3 |
| 126 | Kyle Monangai | RB36 | CHI | 10 | 116 | 117 | 9.0 |
| 127 | Tre Tucker | WR53 | LV | 13 | 162 |  | 9.6 |
| 128 | AJ Barner | TE21 | SEA | 11 | 208 |  | 8.7 |
| 129 | Xavier Restrepo | WR54 | TEN | 9 | 346 |  | 3.5 |
| 130 | Jauan Jennings | WR55 | MIN | 6 | 166 |  | 11.6 |
| 131 | Jayden Reed | WR56 | GB | 11 | 104 | 110 | 9.7 |
| 132 | Jalen Royals | WR57 | KC | 5 | 316 |  | 1.2 |
| 133 | Kayshon Boutte | WR58 | HOU | 8 | 179 |  | 9.0 |
| 134 | Rashid Shaheed | WR59 | SEA | 11 | 148 |  | 8.8 |
| 135 | Deebo Samuel Sr. | WR60 | SF | 8 | 138 |  | 11.8 |
| 136 | Hollywood Brown | WR61 | PHI | 10 | 288 |  | 8.6 |
| 137 | Woody Marks | RB37 | HOU | 8 | 137 |  | 9.1 |
| 138 | Keon Coleman | WR62 | BUF | 7 | 246 |  | 8.7 |
| 139 | Chris Godwin Jr. | WR63 | TB | 10 | 76 | 146 | 9.4 |
| 140 | Sam Darnold | QB19 | SEA | 11 | 139 |  | 13.8 |
| 141 | Jalen Coker | WR64 | CAR | 5 | 124 |  | 8.2 |
| 142 | CJ Daniels | WR65 | LA | 11 | 331 |  |  |
| 143 | Ja'Kobi Lane | WR66 | BAL | 13 | 222 |  |  |
| 144 | Elijah Sarratt | WR67 | BAL | 13 | 261 |  |  |
| 145 | Chris Blair | WR68 | ATL | 11 | 339 |  | 0.0 |
| 146 | Phil Mafah | RB38 | DAL | 14 | 327 |  | 10.9 |
| 147 | Rachaad White | RB39 | WAS | 7 | 111 |  | 8.4 |
| 148 | Cade Otton | TE22 | TB | 10 | 239 |  | 8.1 |
| 149 | Tyler Shough | QB20 | NO | 8 | 124 |  | 14.4 |
| 150 | Jacob Cowing | WR69 | SF | 8 | 347 |  |  |

---

## Fantasy Footborn League

Pick 4 · draft Sunday Sept 6 · 6-pt passing TD, +2 per 300-yd passing game, +2 per 50-yd TD · equal 100-yd bonuses · 6 of 10 teams make the playoffs

**Your picks:** 4 · 17 · 24 · 37 · 44 · 57 · 64 · 77 · 84 · 97 · 104 · 117 · 124 · 137 · 144

### Game plan

1. This room, not the ESPN average, is the model now: two years of the same ten drafters (2024 and 2025 boards transcribed). Rounds 1-3 are half WRs, so WRs do not slide; the QB run comes in rounds 3-5 (six QBs between picks 30 and 47 last year); elite TEs go in round 3; DST goes in round 14.
2. Against randomized rooms with the version-3 simulator (handcuffs, active waivers), the structure gap narrowed here: best-available-by-this-board 26.0% title, RB-RB 25.0%, WR-WR and Robust-RB 23.5%, Hero-RB 20.7%, Zero-RB 19.8%, three straight WRs 17.5%. So in Footborn the rule is: take the best player on this board, and do not leave round 3 without a running back or round 4 without two. Pick 4 is the slot where the elite WR is right because the RB1 tier is gone; the RB then comes at 17 (Chase Brown, Jeanty, Cook).
3. Pick 4: last year picks 1-3 were Chase, Barkley, Bijan and pick 4 was Gibbs. Expect Chase, Bijan, Gibbs gone (take Gibbs if he is there: 14.6% title, 78% playoffs). The version-3 simulation prefers Nacua (15.2% title, 15.9% with Collins at 24 and Maye at 37) to JSN (14.2%) with a 35% chance of a 3-game suspension priced in: take Nacua unless a suspension of 4+ games is announced before Sunday, then JSN. Taylor at 4 is a step down (13.9%).
4. Six-point passing TDs lift every QB, including replacement: the QB1-vs-QB11 gap is the same as in 4-pt scoring. Allen went 30th here last year (Billy, at the turn). Allen at 24 is the one QB worth a round-3 pick; Maye at 37 is the second and last chance before the run; if both are gone, wait. Kass, Sleiman, and Doug let Dak, Lawrence, and Goff reach picks 135-145 last year.
5. Chase Brown went 23rd here last year (Sleiman) and is the one RB1-ceiling back likely to reach 17. Jeanty went 9th last year and is cheaper now after the ankle; Ish or Betto will take him if he is there at 17.
6. Bench: 3 RB, 2 WR, 1 swing that is a Weeks 1-4 starter. Perine (Chase Brown's handcuff) in place of a fifth WR raised the plan from 15.2% to 16.0%. IR-tagged stash at 137 only if a handcuff is already rostered. Six of ten make the playoffs, so regular-season points count about 1.2x playoff points here; the ESPN-sheet drafter at pick 4 makes the playoffs 55% and wins 9.8%.

### Round by round

| Rd | Pick | Targets, in order | If they are gone | Rule |
|---|---|---|---|---|
| R1 | 4 | Bijan, Gibbs, Chase if any fell; else Nacua (default), JSN if a 4+ game suspension is announced, Taylor if you want the RB | McCaffrey only on clean practice reports | Decide Nacua vs JSN before you sit down; the room takes ~30 seconds |
| R2 | 17 | Chase Brown (went 23 here last year), Jeanty, McBride (went 31), Cook if he fell | Collins, A.J. Brown, London if one is still there (they went 10-16 last year) | Take the scarcer piece at 17; this room does not let WR1s slide to 24 |
| R3 | 24 | Josh Allen if there (went 30 last year); else McBride if there; else Pickens, Olave, Rice, DeVonta Smith | Nabers with good Wk-1 news, Garrett Wilson | Allen at 24 is the only QB worth a round-3 pick; Billy takes him at the turn if you do not |
| R4 | 37 | Maye if you did not take Allen; else Garrett Wilson, Flowers, DeVonta Smith, McMillan, Tee Higgins | Egbuka, McConkey; Judkins/Montgomery if the RB2 tier is thinning | The QB run was picks 30-47 last year: Maye is a 37 decision, never a 44 decision |
| R5 | 44 | RB2: Judkins, Montgomery, Irving, Skattebo (Hall, Hubbard, Pollard went 41-50 here last year); Swift only with a clean Sept 9 report | Egbuka, McConkey, Waddle; do NOT take Burrow/Lamar/Hurts/Daniels in the run | Enter the RB run at 44 |
| R6 | 57 | WR3: Tee Higgins, Egbuka, McConkey, Burden, DJ Moore; Price if RB2 is still open | Jameson Williams, Odunze (leg: check the Sept 9 report) (Kittle/LaPorta/Kelce went 56-62 here; let them go) | WR discount window |
| R7 | 64 | Lloyd; else Stevenson, Henderson, Jameson Williams (Odunze only if the leg is cleared); Kraft if TE-less (never drafted here last year) | Pitts, Fannin | RB3 or WR4 |
| R8 | 77 | If no QB: Mahomes, Lawrence, Dak, Stafford, Herbert (Mayfield went 73 and Nix 85 here; Dak/Lawrence went 144). Otherwise RB3/WR4: Stevenson, Henderson, Tate, BTJ | Kraft, Fannin, Pitts | Starters done by round 9 |
| R9 | 84 | The other of QB / WR4 / TE | Parker Washington, Sutton, Wan'Dale Robinson, Michael Wilson | Fill the lineup |
| R10 | 97 | RB4: Dowdle, Dobbins, Harvey, Gainwell, Hubbard, Pollard, Croskey-Merritt | Purdy, Goff, Nix if no QB (this room leaves them to 135+) | Late RB volume |
| R11 | 104 | WR5: Michael Wilson, Diggs, Pittman, Q. Johnston, Pierce, Meyers | QB if still none: Purdy, Goff, Dak, Lawrence will be there | Volume |
| R12 | 117 | Handcuff-plus: Corum, Mason, Allgeier, Emmett Johnson, Bigsby, Marks; Monangai only if Swift's midsection injury is confirmed serious | Concepcion, Golden, Reed | Backups with standalone value |
| R13 | 124 | Upside WR: Concepcion, Golden, Reed, Doubs, Coker, Stribling, Deebo, Worthy | Kelce, Goedert, Ferguson if TE-less | Ceiling swings |
| R14 | 137 | Your RB1's handcuff (Black for CMC, Vaki for Gibbs, B. Robinson for Bijan, McGowan for Taylor) or a Weeks 1-4 starter (Allgeier, Croskey-Merritt) | IR stash (Tyson) if the handcuff is rostered | Jacobs is a pass here |
| R15 | 144 | DST: Chargers, Browns, Seahawks, Vikings, Bears (seven of ten DSTs went in round 14 here last year) | Eagles, Steelers, Lions | Stream from Week 3 |

### Footborn room profile (2024 and 2025 boards)

- Rounds 1-3: 15 WR / 13 RB last year, 14 / 14 the year before. WR1s went 10-19; JSN went 29 after his 2024 season.
- QB run: picks 30-47 last year (Allen, Daniels, Lamar, Burrow, Hurts, Mahomes), then Mayfield 73, Nix 85, and nothing until 135-145 (Goff, Dak, Lawrence). Two years ago the run was 49-64.
- TE: Bowers 28, McBride 31; Kittle/LaPorta/Kelce 56-62; Loveland and Warren went 110-118 before their breakouts.
- RB2 tier went 41-50 (Hall, Hubbard, Pollard, Kamara). Rookies go at consensus price (Jeanty 9, Henderson 34, Hampton 37, Egbuka 56).
- DST: one at 112, the rest 130-146. Nobody takes a second QB before round 14.

### Who does what

- Ish: RB-first (Bijan, Jacobs, Walker in rounds 1-3), QB in round 5. Expect him on Love/Jeanty/Chase Brown early.
- Billy: QB and TE early (Allen round 3, McBride round 4). If he picks between your 17 and 24, Allen is gone.
- Betto: young upside (Jeanty round 1, JSN round 3, Daniels round 4); the other Jeanty/Love threat.
- Moe: WR, WR, then Bowers in round 3; late QB (Mayfield round 8).
- Abu Ali and Ach: a QB in round 4 (Lamar, Burrow) and a name-brand WR in round 3.
- Kass, Sleiman, Doug: never take a QB before round 9; Kass drafts veterans (Adams, Kamara-types), Sleiman is RB-early and grabbed Chase Brown at 23.
- You (2025): Lamb, BTJ, Cook, Hampton, Mahomes at 47. Your leaguemates expect you to take a QB in round 5; use that.

### ESPN-room buys, adjusted to this room

- Josh Allen at 24 (about a coin flip; Billy at the turn is the risk)
- Drake Maye at 37 (must happen at 37)
- Chase Brown at 17
- Judkins / Montgomery / Irving / Skattebo at 44
- MarShawn Lloyd at 57-64
- Mahomes, Lawrence, Dak, Stafford at 77 if you missed Allen/Maye
- Purdy, Goff at 97+ (they reached 135+ here last year)
- Kraft at 64-84 (undrafted here last year)

### Do not pay this room's price

- Jeanty above 17 (went 9 last year)
- Any QB other than Allen/Maye between 30 and 47
- Bowers/McBride before 17
- Kittle/LaPorta/Kelce at 56-62 when Kraft is free later
- Josh Jacobs (misses 6+ in a 6-team playoff league)
- Any DST before 137

### Status watch (as of Thu Sept 3, evening)

- Nacua: conduct review open, not suspended, not exempt; the league has no deadline, so a 1-6 game ruling can land any day (opener Thu Sept 10 in Melbourne)
- Odunze (right leg) and Swift (midsection) both left Thursday's Bears practice early; no diagnosis; first official report Wed Sept 9. Monangai (knee) still week-to-week
- Chase (knee) and Higgins (heel): DNP Sept 1-2 as precaution, both expected Wk 1
- Jeanty (low-ankle, not IR): side work Sept 1, Kubiak 'yes' on Wk 1 optimism
- Love (high ankle): 'about 50/50' for Wk 1; Allgeier listed first; Conner on IR (out 4+)
- Nabers (ACL): shed the no-contact jersey Aug 31, then left Wed practice 20 min early (team: no injury)
- Kittle (Achilles): off PUP, flew to Australia Sept 2, 'trending' to play; LaPorta (back surgery + new hip): Campbell unsure on Wk 1
- Walker (foot/shoe swelling): DNP twice, Reid not concerned, opener Sept 14; Barkley: foot/ankle checked at practice, stayed in
- Egbuka (toe): day-to-day, Bowles 'hopeful'; Evans (groin) back at practice Sept 2; Henderson (ankle) 'good to go' Sept 9
- Jacobs: exempt list, 'not in line to play Sunday', no timeline; Tyson (NO) and Charbonnet on IR/PUP through Wk 4 at least
- Mahomes (ACL/LCL): full camp, no preseason snaps, starting Sept 14; Kraft (ACL): full-go Wk 1, likely snap count

### Rankings by position

ECR = expert consensus rank (Aug 28). Room = estimated pick where an ESPN cheat-sheet room takes him. ppg = 2025 points per game under this league's scoring.


#### RB

| # | Player | Team | Bye | ECR | Room | 25 ppg | G | Why |
|---|---|---|---|---|---|---|---|---|
| | **Tier 1: Workhorse, 100-target ceiling** | | | | | | | |
| 3 | Bijan Robinson | ATL | 11 | 4 | 1 | 22.6 | 17 | 22.9 ppg, 103 tgt (2nd among RBs), 287 car, five 100-yd rush games. New HC Stefanski/Tua; hold-in resolved with record deal. |
| 1 | Jahmyr Gibbs | DET | 6 | 2 | 1 | 22.2 | 17 | 22.5 ppg, 94 tgt, 243 car, 17 games; second-highest ceiling weeks of any RB (best-6 avg 38.5, behind only Taylor). Montgomery traded, Pacheco on IR: first true workhorse season. Age 24. |
| | **Tier 2: Elite volume with one flag** | | | | | | | |
| 7 | Christian McCaffrey | SF | 8 | 9 | 4 | 25.0 | 17 | 25.2 ppg (RB1 overall), 129 tgt, 311 car. Age 30.3 with 450 touches incl. playoffs; calf tightness in camp resolved, full participant, 'on track' for Sep 10. Bilateral Achilles tendinitis in 2024. Age cliff plus the soft-tissue file are the knocks; the usage model still has him RB4. |
| 8 | Jonathan Taylor | IND | 13 | 11 | 7 | 22.0 | 17 | 22.5 ppg, 323 car, 18 TD (league high), five 100-yd games (+3 each in League A), highest ceiling weeks of any RB (best-6 38.7). Only 55 tgt. IND's Weeks 15-17 slate (@TEN, CIN, @CLE) is the softest RB playoff schedule on the board. Daniel Jones back from Achilles. |
| 12 | De'Von Achane | MIA | 6 | 20 | 8 | 20.7 | 16 | 20.9 ppg, 85 tgt, 238 car, floor 16.6 (second only to McCaffrey). MIA's offense is Malik Willis throwing to Malik Washington / Tolbert / rookie Caleb Douglas: Achane is the whole offense, for better and worse. ESPN rooms take him ~pick 8. |
| | **Tier 3: RB1 upside, room price inflated or aging** | | | | | | | |
| 11 | Chase Brown | CIN | 6 | 17 | 24 | 17.0 | 17 | 17.2 ppg full season; 22.8 ppg over the last 6 with Burrow healthy (two 32-pt games); 88 tgt. ESPN ADP ~26: the one RB1-ceiling back that actually reaches pick 19-24. |
| 9 | James Cook III | BUF | 7 | 15 | 10 | 19.0 | 17 | 19.7 ppg, 309 car, nine 100-yd rushing games (+32 bonus pts in League A, most of any RB). Only 40 tgt: low PPR floor (10.7), high bonus ceiling. ESPN rooms take him ~pick 10. |
| 41 | Saquon Barkley | PHI | 10 | 24 | 18 | 14.9 | 16 | 15.1 ppg in 2025 (24.6 in 2024), 280 car, 50 tgt, 4.07 YPC. Age 29.6 = RB cliff zone (top-20 RB seasons halve at 29). Left foot/ankle checked by trainers at practice this week, stayed on the field, no diagnosis announced. |
| | **Tier 4: RB2 window: picks 39-44** | | | | | | | |
| 23 | Ashton Jeanty | LV | 13 | 26 | 20 | 14.7 | 17 | 14.8 ppg, 266 car, 73 tgt, best-6 avg 24.8. Low-ankle sprain Aug 23 (not high-ankle, not IR); side work Sep 1, Kubiak 'yes' when asked if optimistic for Wk 1 (Sep 2). Cousins/Kubiak upgrade over 2025. Mike Washington Jr. is the hedge. |
| 30 | Kenneth Walker III | KC | 5 | 26 | 17 | 11.5 | 17 | 11.6 ppg in SEA committee (RB28); now KC's clear lead back (Reid RB1s average 250+ touches). Foot soreness/ankle swelling from a shoe issue, DNP twice, Reid not concerned, opener not until Sep 14. Calf/ankle/oblique history: +0.5 expected games missed. |
| 29 | Derrick Henry | BAL | 13 | 37 | 19 | 17.5 | 17 | 18.1 ppg, 307 car, eight 100-yd games (+29 bonus pts in A). Age 32.7; only 21 tgt (floor 11.2). New OC Doyle. Soft Weeks 15-17 (@PIT, CLE, @CIN). Age-cliff risk is extreme; ESPN takes him ~19. |
| 45 | Breece Hall | NYJ | 13 | 39 | 31 | 13.6 | 16 | 13.7 ppg, 243 car, 48 tgt. Signed a 3-yr/$45.75M extension in May (locked-in RB1); Geno Smith at QB. Groin, on track for Wk 1. |
| 17 | Kyren Williams | LA | 11 | 41 | 34 | 15.6 | 17 | 15.7 ppg, 259 car, 50 tgt, 17 games in 2025 (16 in 2024). Corum behind him. Safe RB2, low ceiling. ESPN takes him ~34. |
| | **Tier 5: Committee leads / role backs** | | | | | | | |
| 33 | Javonte Williams | DAL | 14 | 44 | 32 | 15.4 | 16 | 15.6 ppg, 252 car, 51 tgt in DAL's league-worst defense environment (shootouts). Cheap volume RB2. |
| 27 | Omarion Hampton | LAC | 7 | 25 | 19 | 15.3 | 9 | 15.4 ppg in 9 g (ankle). OC McDaniel says all three of Hampton/Vidal/Mitchell play every game, 'hot hand'. Committee = fade at ESPN's ~pick-20 price; fine at 37-44. |
| 65 | Cam Skattebo | NYG | 8 | 57 | 44 | 16.0 | 8 | 16.0 ppg in 8 g before the open tib/fib fracture and ankle dislocation (Oct 2025). Full camp participant, played the preseason opener, says 'ready to go'; Harbaugh: not yet 100% twitchy. Listed starter in a run-heavy offense. Priced at 90% of his healthy line. |
| 26 | Jeremiyah Love | ARI | 14 | 41 | 25 |  |  | Rookie #3 overall (R1 RBs hit top-24 71% of the time). High-ankle sprain Aug 13, no surgery; 'about 50/50' for Wk 1 (Sep 2). Literature: early returners from high-ankle sprains rarely regain form for weeks. Team chart lists Allgeier first. ESPN drafters take him ~25: do not pay that. |
| 40 | Travis Etienne Jr. | NO | 8 | 47 | 38 | 15.2 | 17 | 15.3 ppg, 260 car, 52 tgt in JAX; signed with NO, Kamara (31) still there. Volume RB2. |
| 49 | Bucky Irving | TB | 10 | 58 | 51 | 14.1 | 10 | 14.0 ppg in 10 g; shoulder surgery healed, 'full go'. Gainwell added for a pony package. TB has PFF's #3 OL. |
| 44 | Jadarian Price | SEA | 11 | 73 | 68 |  |  | Rookie R1 (#32), SEA starter: Macdonald 'really confident in him going into Week 1'; Walker gone, Charbonnet PUP (out 4+, likely Wk 7). Zero preseason snaps; Holani in tandem. ECR 73 = discount for a lead back on a Super Bowl offense. |
| | **Tier 6: Handcuff-plus and darts** | | | | | | | |
| 54 | Quinshon Judkins | CLE | 11 | 62 | 47 | 12.3 | 14 | 12.3 ppg in 14 g, 230 car (65% of CLE RB carries), 10.5 ppg after Wk 9. Upgraded OL, Watson at QB, Sampson takes passing downs. ESPN takes him ~47. |
| 51 | D'Andre Swift | CHI | 10 | 54 | 52 | 14.7 | 16 | 14.8 ppg, 223 car, 48 tgt in the Ben Johnson offense. Left Thu Sep 3 practice holding his midsection after a goal-line carry, no diagnosis; Monangai (knee) is week-to-week too. Fade until the Sep 9 report; Roschon Johnson is the contingency. |
| 94 | David Montgomery | HOU | 8 | 61 | 53 | 10.1 | 17 | 10.0 ppg in DET committee; traded to HOU as the clear RB1 with Marks on passing downs. Age 29. Goal-line volume play. |
| 93 | MarShawn Lloyd | GB | 11 | 179 | 96 |  |  | Lead back in GB with Jacobs on the exempt list (open-ended; 6+ games likely). One career game; Kaleb Johnson (traded from PIT Aug 30) and Chris Brooks share. Printed sheets (~180) predate the news; Mike Clay has him RB33. Survives to 62/64 in almost every simulated room. |
| 47 | TreVeyon Henderson | NE | 11 | 70 | 72 | 12.4 | 17 | 12.5 ppg full year; 7.3 ppg Wks 1-9, then 18.4 ppg (RB7) Wks 10-18. Depth chart lists Stevenson first. ESPN ADP ~72 vs Sleeper 52: cheap on ESPN. |
| 111 | Bhayshul Tuten | JAX | 7 | 67 | 50 | 5.9 | 15 | 5.9 ppg as rookie (83 car). Listed RB1 with Etienne gone; Rodriguez behind. Coen offense. Speculative RB1 role at RB3 price. |
| 80 | Rhamondre Stevenson | NE | 11 | 77 | 77 | 12.9 | 14 | 13.0 ppg in 14 g, listed RB1 ahead of Henderson. Age 28.5. Early-down and goal-line role. |
| 69 | Rico Dowdle | PIT | 9 | 88 | 84 | 13.2 | 17 | 13.5 ppg, 236 car, best-6 avg 25.2 in CAR; now PIT ~50/50 with Warren. Volume upside if he wins the job. |
| 77 | Jaylen Warren | PIT | 9 | 77 | 74 | 13.8 | 16 | 13.9 ppg, 211 car; Dowdle signed and reps split ~50/50 in camp. New HC McCarthy. |
| 101 | Kenny Gainwell | TB | 10 | 100 | 104 | 13.0 | 17 | 13.0 ppg, 85 tgt (!) in PIT; now TB pony-package with Irving. PPR-only RB4 with standalone value. |
| 112 | Tony Pollard | TEN | 9 | 84 | 82 | 11.3 | 17 | 11.5 ppg, 242 car, three 100-yd games; contract year, trade candidate; Spears/Singleton behind. |
| 108 | J.K. Dobbins | DEN | 10 | 100 | 90 | 12.0 | 10 | 12.2 ppg in 10 g, listed RB1 in DEN ahead of Harvey; PFF #1 OL. Age 27.7, injury history. |

#### WR

| # | Player | Team | Bye | ECR | Room | 25 ppg | G | Why |
|---|---|---|---|---|---|---|---|---|
| | **Tier 1: 28%+ share, same QB** | | | | | | | |
| 2 | Ja'Marr Chase | CIN | 6 | 1 | 3 | 20.5 | 16 | 20.3 ppg in 2025 with Burrow hurt most of the year; 24.5 ppg in 2024. 185 tgt, 32% share. Hyperextended knee Aug 25, DNP Sep 1-2 'out of an abundance of caution'; Taylor: could play if there were a game tomorrow. No discount. |
| 5 | Jaxon Smith-Njigba | SEA | 11 | 4 | 6 | 22.2 | 17 | 22.0 ppg, 36% target share (best in NFL), nine 100-yd games, floor 19.8 (highest of any WR). Same QB (Darnold); OC Kubiak left for LV, replaced by Brian Fleury (same Shanahan-tree scheme). Age 24. |
| 4 | Puka Nacua | LA | 11 | 3 | 5 | 24.3 | 16 | 24.4 ppg (WR1), 166 tgt in 16 g, six 100-yd games. Psoas soreness resolved, practicing since Aug 30. NFL conduct review still open as of Sep 3: not suspended, not on the exempt list, and the league has no deadline, so a 1-6 game ruling can land any day. Priced with a 35% chance of a 3-game absence. |
| 6 | Amon-Ra St. Brown | DET | 6 | 5 | 9 | 19.6 | 17 | 19.5 ppg, 172 tgt, 31% share, 11 TD, 17 games four straight years. Floor 13.7 with five 100-yd games; new OC Petzing. |
| | **Tier 2: WR1 volume, new situation** | | | | | | | |
| 14 | CeeDee Lamb | DAL | 14 | 9 | 16 | 16.4 | 13 | 16.2 ppg in 13 g, 25% share with Pickens taking 23%. 17.9 ppg in 2024. Dak healthy; DAL allowed most points in NFL last year (shootouts). |
| 16 | Drake London | ATL | 11 | 12 | 20 | 17.7 | 12 | 17.5 ppg in 12 g, 30% share, 9.3 tgt/g. Tua replaces Penix; Stefanski offense. Missed 5 games in 2025. |
| 22 | A.J. Brown | NE | 11 | 14 | 25 | 15.4 | 15 | 15.2 ppg, 30% share, best-6 avg 25.5. Traded to NE: Drake Maye (31 TD) and Diggs's 1,013 vacated yards. Age 29. Playing through a dislocated thumb (Aug 31) after a camp hamstring; three hamstrings in three years, so 0.5 extra expected games missed. |
| 15 | Justin Jefferson | MIN | 6 | 9 | 15 | 12.2 | 17 | 12.1 ppg (141 tgt, 30% share, 2 TD, 7.4 yds/target vs 9.95 in 2024; 19.1 ppg in 2024). TD rate will rebound (+1.5-2 ppg); the efficiency half depends on Kyler Murray. Range WR6-WR14, and ECR 9 already prices most of the rebound. Softest Weeks 15-17 WR slate in the NFL (DET, WAS, @NYJ). |
| 19 | Nico Collins | HOU | 8 | 16 | 28 | 15.5 | 15 | 15.4 ppg (18.1 in 2024), 25% share. Jayden Higgins (ACL) and Dell (IR) out: Collins is the only proven target in HOU. ESPN drafters take him ~12 picks later than experts. |
| | **Tier 3: WR2 with WR1 weeks** | | | | | | | |
| 13 | George Pickens | DAL | 14 | 20 | 31 | 17.8 | 17 | 17.6 ppg, 137 tgt, 9 TD, best-6 avg 29.3. TD-dependent (9 of 137 tgt) with Lamb back healthy: ceiling real, share capped ~23%. |
| 20 | Chris Olave | NO | 8 | 17 | 29 | 17.1 | 16 | 17.0 ppg, 156 tgt, 29% share, led NFL in air yards. Rookie Tyson on IR ~2 months: target monopoly with Shough. |
| 21 | Rashee Rice | KC | 5 | 24 | 22 | 19.0 | 8 | 19.0 ppg in 8 g, 9.8 tgt/g, 29% share. May 2026 arthroscopic cleanup on the surgically repaired knee; back in 11-on-11 late August. Mahomes back from ACL/LCL; Bieniemy OC. Has not played more than 8 games since 2023. |
| 28 | DeVonta Smith | PHI | 10 | 24 | 39 | 12.1 | 17 | 12.1 ppg, 113 tgt. A.J. Brown traded to NE: Smith is the only proven WR in PHI (Hurts, 25 TD). ESPN ADP ~39 = end of R4. |
| 52 | Garrett Wilson | NYJ | 13 | 29 | 40 | 14.2 | 7 | 14.2 ppg in 7 g, 34% target share. Geno Smith is the new QB (upgrade). Missed 10 games in 2025. |
| 25 | Zay Flowers | BAL | 13 | 30 | 42 | 14.7 | 17 | 14.6 ppg, 118 tgt, 29% share, 17 games. New OC Doyle; quad contusion 'nothing major'. |
| | **Tier 4: Breakout and volume WR3** | | | | | | | |
| 31 | Tetairoa McMillan | CAR | 5 | 35 | 43 | 12.8 | 17 | 12.7 ppg, 122 tgt, 25% share, OROY, 40.9% air-yard share. Year-2 leap profile; Bryce Young caps ceiling. |
| 37 | Emeka Egbuka | TB | 10 | 40 | 52 | 11.9 | 17 | 11.8 ppg, 127 tgt, 24% share as rookie; hot Wks 1-5 then faded. Toe sprain Aug 12, still day-to-day, Bowles 'hopeful' for Wk 1, local beat says 'lingering'. Evans gone (SF); Godwin (30, off two ankle surgeries) is the WR2. |
| 42 | Ladd McConkey | LAC | 7 | 34 | 49 | 11.6 | 16 | 11.5 ppg (15.3 in 2024), 106 tgt. McDaniel OC historically feeds slot WRs. Year-3 bounce candidate. |
| 82 | Malik Nabers | NYG | 8 | 24 | 30 | 14.8 | 4 | 18.5 ppg over 15 games in 2024 (the 2025 four-game sample is one 39-pt game). ACL+meniscus Oct 2025: shed the no-contact jersey Aug 31, Harbaugh 'reasonable to assume' Wk 1, but he left Wed Sep 2 practice ~20 min early with trainers (team says no injury). WR ACL year-1 production loss is the largest in the literature (age 23 helps): priced at 90% of his healthy line. Dart at QB. Karabell has him on ESPN's do-not-draft list, so he may fall. |
| 43 | Jaylen Waddle | DEN | 10 | 34 | 46 | 12.3 | 16 | 12.2 ppg (10.2 in 2024), 100 tgt. Traded to DEN: Nix, Sutton competition. Volume unclear. |
| 38 | Tee Higgins | CIN | 6 | 36 | 55 | 14.2 | 15 | 14.2 ppg, 11 TD on 98 tgt (11.2% TD rate; league ~5.5%, so ~5 TD and ~12 ppg is the regressed line). Heel contusion, DNP Sep 2 but ran hills, expected Wk 1. Hamstring/quad history. ESPN price ~55: fine at 42-59, not at 30. |
| 64 | Luther Burden III | CHI | 10 | 46 | 60 | 8.8 | 15 | 8.7 ppg but 5.6 tgt/g over Wks 10-18, #3 in NFL yards per route run (2.69). DJ Moore's 85 targets vacated. Classic year-2 breakout. |
| | **Tier 5: WR4 floor / TD swing** | | | | | | | |
| 62 | DJ Moore | BUF | 7 | 52 | 61 | 10.2 | 17 | 10.1 ppg in CHI; traded to BUF as Josh Allen's WR1 (Diggs/Cooper never cleared 85 tgt there). Floor play at WR3 price. |
| 35 | Jameson Williams | DET | 6 | 54 | 70 | 13.4 | 17 | 13.3 ppg, 102 tgt, 90% snaps, best-6 23.4. Deep-threat volatility; new OC Petzing. |
| 78 | Terry McLaurin | WAS | 7 | 47 | 56 | 11.4 | 10 | 11.4 ppg in 10 g, age 31. Diggs added Aug 7; Daniels' health. Fading volume. |
| 55 | Davante Adams | LA | 11 | 50 | 46 | 16.1 | 14 | 16.0 ppg, 14 TD on 114 tgt (12.3% TD rate; regressed line ~12.7 ppg). Age 33.7. The only top-50 WR ESPN rooms take EARLIER than experts (~46): never a value there. |
| 66 | Rome Odunze | CHI | 10 | 57 | 66 | 12.5 | 12 | 12.4 ppg in 12 g, 24% share, WR11 ppg Wks 1-8; listed WR1 outside with Moore gone. Left Thu Sep 3 practice early (right leg, walked off, no diagnosis); 2025 foot stress fracture. First official report Wed Sep 9: draft a round later than the sheet and hedge. |
| 57 | Wan'Dale Robinson | TEN | 9 | 85 | 93 | 14.0 | 16 | 13.9 ppg, 140 tgt, 30% share in NYG. Signed 4yr/$78M with TEN (Daboll OC). Slot PPR floor; Tate competes. |
| 83 | Christian Watson | GB | 11 | 57 | 80 | 13.4 | 10 | 13.4 ppg in 10 g, 19% share; GB WR1 on depth chart. Injury history; TD-dependent. |
| 106 | Mike Evans | SF | 8 | 56 | 62 | 10.8 | 8 | 10.8 ppg in 8 g, age 33. Signed with SF (Purdy, Shanahan); Pearsall done for the season, Deebo WR2. Camp groin kept him out a week, back Sep 2 and expected Sep 10. Three hamstrings plus a groin: chronic soft-tissue flag, +1 expected game missed. |
| | **Tier 6: Late volume and darts** | | | | | | | |
| 73 | Michael Wilson | ARI | 14 | 88 | 105 | 13.3 | 17 | 13.2 ppg, 126 tgt, best-6 avg 25.7 (WR ~12 in ceiling weeks). Listed WR2 in ARI; Brissett throws volume. ADP ~88 = value. |
| 59 | Parker Washington | JAX | 7 | 63 | 78 | 11.8 | 16 | 11.7 ppg, 95 tgt; 16.4 ppg over the last 6 games as JAX WR1 (three straight 20-pt games). Hunter is a part-time WR in 2026 (CB first). |
| 50 | Carnell Tate | TEN | 9 | 68 | 70 |  |  | Rookie #4 overall, listed WR1 in TEN with Cam Ward. R1 rookie WRs finish top-24 only 28% of the time; Wan'Dale takes slot volume. |
| 74 | Brian Thomas Jr. | JAX | 7 | 80 | 74 | 9.9 | 14 | 9.9 ppg in 14 g (17.1 as a rookie in 2024). Lawrence healthy all 17 games; Hunter part-time. Bounce-back with WR1 ceiling. |
| 81 | Marvin Harrison Jr. | ARI | 14 | 68 | 72 | 10.7 | 12 | 10.7 ppg in 12 g, 18% share. Brissett (volume thrower) replaces Kyler; McBride still eats. Year-3 leap or bust. |
| 61 | DK Metcalf | PIT | 9 | 78 | 66 | 12.7 | 15 | 12.7 ppg, 99 tgt, 23% share with Rodgers; Pittman added. Best-ball TD swings. |
| 70 | Courtland Sutton | DEN | 10 | 83 | 84 | 13.2 | 17 | 13.1 ppg, 124 tgt, 22% share, 17 games. Waddle added; age 31. |
| 72 | Michael Pittman Jr. | PIT | 9 | 80 | 86 | 12.0 | 17 | 12.0 ppg, 111 tgt; traded to PIT with Rodgers (age 42.8). Volume WR3. |
| 99 | Josh Downs | IND | 13 | 87 | 98 | 8.7 | 16 | 8.7 ppg, 88 tgt; Pittman traded, Keenan Allen added. Slot volume WR4. |
| 98 | Stefon Diggs | WAS | 7 | 96 | 95 | 13.0 | 17 | 12.8 ppg, 102 tgt, five 100-yd games in NE; signed with WAS Aug 7 as 1B to McLaurin. Age 33. |
| 63 | Quentin Johnston | LAC | 7 | 95 | 100 | 13.3 | 13 | 13.3 ppg in 13 g, 8 TD, 20% share. McDaniel OC. WR4 with TD equity. |
| 71 | Alec Pierce | IND | 13 | 100 | 108 | 12.5 | 15 | 12.4 ppg, 84 tgt, listed WR1 in IND; Pittman gone. Deep threat with League B 50-yd TD bonus appeal. |

#### TE

| # | Player | Team | Bye | ECR | Room | 25 ppg | G | Why |
|---|---|---|---|---|---|---|---|---|
| | **Tier 1: TE1 by 4 ppg (round 2)** | | | | | | | |
| 10 | Trey McBride | ARI | 14 | 21 | 18 | 18.9 | 17 | 18.9 ppg = TE1 by 4 ppg over TE2; 169 tgt, 27% share, WR-like usage. Brissett replaces Kyler (Brissett threw to him at 8+ tgt/g in 2025 too). |
| | **Tier 2: Elite ceiling, injury discount** | | | | | | | |
| 24 | Brock Bowers | LV | 13 | 19 | 14 | 15.0 | 12 | 14.9 ppg in 12 g (2025, injured); 15.6 ppg TE1 in 2024. Cousins + Kubiak scheme. TE2-4 tier is worth ~4 ppg over replacement. |
| | **Tier 3: Role bets, not production** | | | | | | | |
| 39 | Colston Loveland | CHI | 10 | 37 | 45 | 10.4 | 16 | 10.4 ppg as a rookie (TE16 per game), 82 tgt (17% share), 64% snaps. Rank is a role bet (DJ Moore's 85 targets vacated, Ben Johnson), not a production one. ESPN ADP 45: take him at 42-45 only if TE-less. |
| 32 | Tyler Warren | IND | 13 | 53 | 54 | 11.1 | 17 | 11.1 ppg, 112 tgt (21% share) as a rookie, 84% snaps. Daniel Jones back. TE3-5 range; ESPN ~54. |
| | **Tier 4: Streamer-plus (Kraft is the fallback)** | | | | | | | |
| 48 | Kyle Pitts Sr. | ATL | 11 | 78 | 73 | 12.5 | 17 | 12.5 ppg, 118 tgt (23% share), 17 games. Tua at QB is a target-funnel QB. TE4-6. |
| 68 | Tucker Kraft | GB | 11 | 80 | 76 | 15.2 | 8 | 15.0 ppg in 8 g, but two spike games (25.9, 34.8) were 51% of it; the other six averaged 9.9. ACL Nov 2: off PUP July 31, full joint-practice contact, 'full-go' Wk 1 per CBS, likely on a snap count early. TE5-7 with TE1 weeks. |
| 46 | Harold Fannin Jr. | CLE | 11 | 73 | 85 | 11.8 | 16 | 11.7 ppg, 107 tgt as a rookie (21% share). Watson at QB, Monken HC. TE5-8 with volume. |
| 89 | Sam LaPorta | DET | 6 | 85 | 78 | 11.9 | 9 | 11.9 ppg in 9 g (2025, lumbar disc surgery ~Wk 10); cleared for camp, then a hip injury in late August and Campbell 'I don't know' on Wk 1. Back literature: stats hold after discectomy, availability does not. TE8-10 with a 1.5-game haircut. |
| | **Tier 5: Only if cheap** | | | | | | | |
| 107 | George Kittle | SF | 8 | 98 | 92 | 14.9 | 11 | 14.8 ppg in 11 g; Achilles tear Jan 11, activated from PUP, flew to Australia with the team Sep 2 and is 'trending' to play Wk 1. Age 33. Achilles literature: TE return rate is the best of any position (71%) but only 27% of players get back to their prior level in year 1, so he is priced at 85% of his healthy line (TE6-8), not TE1. |
| 75 | Travis Kelce | KC | 5 | 98 | 88 | 11.4 | 17 | 11.4 ppg, 108 tgt, 17 games; age 37. Mahomes back. TE8-10 floor. |
| 109 | Dalton Kincaid | BUF | 7 | 112 | 106 | 10.8 | 12 | 10.8 ppg in 12 g; 37% snaps in 2025 split with Knox. DJ Moore added. TE10-12. |
| 86 | Jake Ferguson | DAL | 14 | 118 | 116 | 11.1 | 17 | 11.1 ppg, 102 tgt, 17 games. TE volume floor in a high-scoring DAL offense. |
| 85 | Dallas Goedert | PHI | 10 | 117 | 112 | 12.5 | 15 | 12.4 ppg on 11 TD in 82 tgt (13.4% TD rate; regressed ~9.8 ppg); age 31.7; more targets with A.J. Brown gone. TE10-12. |
| 110 | Mark Andrews | BAL | 13 | 131 |  | 7.7 | 17 | 7.7 ppg, 70 tgt; age 31; listed TE1 in BAL. TE12-15. |

#### QB

| # | Player | Team | Bye | ECR | Room | 25 ppg | G | Why |
|---|---|---|---|---|---|---|---|---|
| | **Tier 1: Allen at 24 if there** | | | | | | | |
| 18 | Josh Allen | BUF | 7 | 25 | 24 | 26.3 | 16 | 22.8 ppg (4-pt) / 26.3 (6-pt), 14 rush TD, 112 car. QB1 both formats; DJ Moore added. Realized edge over QB11 was ~4.9 ppg; QB edges persist only ~half as well as RB/WR, so the expected edge is ~3 ppg (a WR12-15 equivalent). ESPN rooms let him reach ~24. |
| | **Tier 2: Maye at 37** | | | | | | | |
| 34 | Drake Maye | NE | 11 | 37 | 48 | 24.5 | 17 | 20.7/24.5 ppg, 31 TD, 450 rush yds, 17 games, age 24. A.J. Brown added. QB2-4 in 6-pt scoring (+2.7 ppg over QB11 in 2025). ESPN ADP ~48: he is a pick-37 decision in League B. |
| | **Tier 3: Round-4 pass, round-8 targets** | | | | | | | |
| 36 | Lamar Jackson | BAL | 13 | 32 | 38 | 19.8 | 13 | 16.5/19.8 ppg in 13 g (2 rush TD, QB17 by ppg); 25.5 ppg in 2024. Shrinking the two years together gives ~QB5. Age 29.7, new OC. ESPN takes him ~38: let someone else pay for 2024. |
| 58 | Joe Burrow | CIN | 6 | 45 | 58 | 21.6 | 8 | 16.8/21.6 ppg in 8 g (turf toe). Healthy: 2024 was 22.9 ppg (4-pt). Chase/Higgins/Brown. QB1 upside at QB5 price. |
| | **Tier 4: 300-yd bonus passers (64-77)** | | | | | | | |
| 53 | Jalen Hurts | PHI | 10 | 56 | 60 | 22.1 | 16 | 18.8/22.1 ppg, 8 rush TD, 105 car. A.J. Brown gone lowers passing ceiling; Tush Push keeps TD floor. |
| 84 | Justin Herbert | LAC | 7 | 71 | 114 | 21.8 | 16 | 18.4/21.8 ppg, 26 TD, 498 rush yds (career high), 16 games. ESPN ADP QB15 (~pick 114) vs expert QB7: he is there at 79 in ~100% of simulated rooms and at 99 in ~85%. Take him at 82-99, not 79. |
| 114 | Patrick Mahomes II | KC | 5 | 101 | 82 | 23.8 | 14 | 20.4/23.8 ppg in 14 g, 422 rush yds. ACL/LCL Dec 14; full camp participant, no preseason snaps, 'on track' for Mon Sep 14 (exactly 9 months post-op). QB ACL literature: 92% return, no production loss. Rice/Worthy/Kelce; Bieniemy back. |
| 90 | Matthew Stafford | LA | 11 | 104 | 76 | 26.6 | 17 | 21.1/26.6 ppg, 46 TD on a 7.7% TD rate (league 4.6%, his own 2024 3.5%). At a top-10 rate he is ~32 TD and ~22 ppg in League B (QB8-11). Age 38.6. Biggest ECR-vs-ppg gap on the board, but half of it is TD luck, and ESPN rooms already price him QB8 (~76). League B target at 64-77, never at 39. |
| 60 | Trevor Lawrence | JAX | 7 | 77 | 92 | 23.4 | 17 | 19.9/23.4 ppg, 29 TD, 359 rush yds, 9 rush TD, 17 games. Priced QB9-10; Coen offense year 2. |
| | **Tier 5: Value tier (R10-12)** | | | | | | | |
| 67 | Dak Prescott | DAL | 14 | 78 | 90 | 22.7 | 17 | 18.5/22.7 ppg, 30 TD, six 300-yd games (League B bonus). Age 33. Lamb+Pickens. |
| 102 | Jayden Daniels | WAS | 7 | 53 | 62 | 18.6 | 7 | 16.3/18.6 ppg in 7 g (four separate injuries). 21.1 ppg in 2024. Rushing floor when healthy; availability risk. |
| 56 | Caleb Williams | CHI | 10 | 67 | 85 | 22.0 | 17 | 18.7/22.0 ppg, 27 TD, 388 rush yds, 17 games. Year 3 under Ben Johnson; Moore gone, Burden/Odunze/Loveland up. |
| 97 | Brock Purdy | SF | 8 | 96 | 105 | 24.6 | 9 | 19.7/24.6 ppg in 9 g (injured). Evans + Kittle + CMC. 6-pt league QB8 upside at QB14 price. |
| 96 | Jared Goff | DET | 6 | 106 | 110 | 22.2 | 17 | 17.5/22.2 ppg, 34 TD, six 300-yd games. Zero rushing. 6-pt league value only. |
| | **Tier 6: Streamers** | | | | | | | |
| 79 | Bo Nix | DEN | 10 | 99 | 99 | 21.3 | 17 | 17.9/21.3 ppg, 25 TD, 356 rush yds, 17 games. Waddle added. Streamer-plus. |
| 129 | Jaxson Dart | NYG | 8 | 97 | 88 | 19.4 | 14 | 17.3/19.4 ppg in 14 g, 487 rush yds, 9 rush TD (86 car). Rushing floor; Nabers back. ESPN's own staff rank him QB7, so the room takes him ~88: he is not a late fallback in an ESPN room. |
| 142 | Kyler Murray | MIN | 6 | 112 | 115 | 18.0 | 5 | 15.6/18.0 ppg in 5 g (ARI); signed with MIN as starter over McCarthy. 500+ rush yds projected; Jefferson/Addison/Hockenson. Round-12 price on ESPN. |
| 182 | Daniel Jones | IND | 13 | 147 | 134 | 20.6 | 13 | 17.4/20.6 ppg in 13 g before the Achilles (Dec 2025); says 100%, took every first-team rep in camp, starting Sep 13. Achilles year-1 haircut applies even to QBs. Taylor/Warren/Pierce/Downs/Allen. ECR 148 = free QB12-14. |
| 117 | Baker Mayfield | TB | 10 | 118 |  | 19.3 | 17 | 16.0/19.3 ppg, 26 TD, 382 rush yds. Egbuka/Godwin; Evans gone. QB14 range. |
| 172 | Jordan Love | GB | 11 | 118 |  | 19.0 | 15 | 15.7/19.0 ppg in 15 g. Watson/Reed/Golden/Kraft. Streamer. |

#### DST

| # | Player | Team | Bye | ECR | Room | 25 ppg | G | Why |
|---|---|---|---|---|---|---|---|---|
| | **Tier 1: Round-15 picks (Weeks 1-2 opponents)** | | | | | | | |
| 157 | Los Angeles Chargers | LAC | 7 | 193 |  |  |  | 7.2 ppg in 2025. Wks 1-2 vs ARI (Brissett) and LV (Cousins): the best two-week opener of any DST; then @BUF, @SEA (stream those). Round-15 pick #1. |
| 158 | Cleveland Browns | CLE | 11 | 219 |  |  |  | 7.7 ppg in 2025 with Garrett; Wks 1-4 @JAX, @TB, CAR (Young), PIT. Round-15 pick #2. |
| 159 | Seattle Seahawks | SEA | 11 | 167 |  |  |  | Best DST in 2025 under this scoring (8.4 ppg); Wks 1-4 NE, @ARI, @WAS, LAC. Champion defense with a soft Wk 2. |
| 160 | Minnesota Vikings | MIN | 6 | 185 |  |  |  | Allowed the fewest fantasy points in the NFL in 2025 (66.2/g), 7.3 DST ppg; Wks 1-4 GB, @CHI, @TB, MIA (Willis). Elite from Week 5 on. |
| 161 | Chicago Bears | CHI | 10 | 263 |  |  |  | Only 5.4 ppg in 2025 but the softest four-week opener in the league: @CAR (Young), MIN, PHI, NYJ (Geno). Streamer #5. |
| | **Tier 2: If those are gone** | | | | | | | |
| 162 | Philadelphia Eagles | PHI | 10 | 174 |  |  |  | 6.5 ppg in 2025; Wks 1-4 WAS, @TEN (Ward), @CHI, LA. Soft Week 2. |
| 163 | Pittsburgh Steelers | PIT | 9 | 186 |  |  |  | 5.4 ppg in 2025; Wks 1-4 ATL, @NE, CIN, @CLE. Watt pass rush; Week 4 is the soft one. |
| 164 | Detroit Lions | DET | 6 | 220 |  |  |  | Wks 1-4 NO, @BUF, NYJ, @CAR (three soft offenses) but only 4.6 ppg in 2025 and safeties Branch and Joseph miss Weeks 1-4. Last of the streamable eight. |
| | **Tier 3: Week-5 waiver targets, not round-15 picks** | | | | | | | |
| 165 | Houston Texans | HOU | 8 | 152 |  |  |  | ECR DST1 and 8.2 ppg in 2025, but Wks 1-4 = BUF, CIN, @IND, DAL (the four hardest openers). Goes ~R11 on ESPN; a Week-5 waiver target, not a round-15 pick. |
| 166 | Denver Broncos | DEN | 10 | 163 |  |  |  | ECR DST2, 8.1 ppg in 2025; Wks 1-4 @KC, JAX, LA, @SF. Elite pass rush, tough openers; Week-5 waiver target. |

### Overall top 150

| # | Player | Pos | Team | Bye | ECR | Room | 25 ppg |
|---|---|---|---|---|---|---|---|
| 1 | Jahmyr Gibbs | RB1 | DET | 6 | 2 | 1 | 22.2 |
| 2 | Ja'Marr Chase | WR1 | CIN | 6 | 1 | 3 | 20.5 |
| 3 | Bijan Robinson | RB2 | ATL | 11 | 4 | 1 | 22.6 |
| 4 | Puka Nacua | WR2 | LA | 11 | 3 | 5 | 24.3 |
| 5 | Jaxon Smith-Njigba | WR3 | SEA | 11 | 4 | 6 | 22.2 |
| 6 | Amon-Ra St. Brown | WR4 | DET | 6 | 5 | 9 | 19.6 |
| 7 | Christian McCaffrey | RB3 | SF | 8 | 9 | 4 | 25.0 |
| 8 | Jonathan Taylor | RB4 | IND | 13 | 11 | 7 | 22.0 |
| 9 | James Cook III | RB5 | BUF | 7 | 15 | 10 | 19.0 |
| 10 | Trey McBride | TE1 | ARI | 14 | 21 | 18 | 18.9 |
| 11 | Chase Brown | RB6 | CIN | 6 | 17 | 24 | 17.0 |
| 12 | De'Von Achane | RB7 | MIA | 6 | 20 | 8 | 20.7 |
| 13 | George Pickens | WR5 | DAL | 14 | 20 | 31 | 17.8 |
| 14 | CeeDee Lamb | WR6 | DAL | 14 | 9 | 16 | 16.4 |
| 15 | Justin Jefferson | WR7 | MIN | 6 | 9 | 15 | 12.2 |
| 16 | Drake London | WR8 | ATL | 11 | 12 | 20 | 17.7 |
| 17 | Kyren Williams | RB8 | LA | 11 | 41 | 34 | 15.6 |
| 18 | Josh Allen | QB1 | BUF | 7 | 25 | 24 | 26.3 |
| 19 | Nico Collins | WR9 | HOU | 8 | 16 | 28 | 15.5 |
| 20 | Chris Olave | WR10 | NO | 8 | 17 | 29 | 17.1 |
| 21 | Rashee Rice | WR11 | KC | 5 | 24 | 22 | 19.0 |
| 22 | A.J. Brown | WR12 | NE | 11 | 14 | 25 | 15.4 |
| 23 | Ashton Jeanty | RB9 | LV | 13 | 26 | 20 | 14.7 |
| 24 | Brock Bowers | TE2 | LV | 13 | 19 | 14 | 15.0 |
| 25 | Zay Flowers | WR13 | BAL | 13 | 30 | 42 | 14.7 |
| 26 | Jeremiyah Love | RB10 | ARI | 14 | 41 | 25 |  |
| 27 | Omarion Hampton | RB11 | LAC | 7 | 25 | 19 | 15.3 |
| 28 | DeVonta Smith | WR14 | PHI | 10 | 24 | 39 | 12.1 |
| 29 | Derrick Henry | RB12 | BAL | 13 | 37 | 19 | 17.5 |
| 30 | Kenneth Walker III | RB13 | KC | 5 | 26 | 17 | 11.5 |
| 31 | Tetairoa McMillan | WR15 | CAR | 5 | 35 | 43 | 12.8 |
| 32 | Tyler Warren | TE3 | IND | 13 | 53 | 54 | 11.1 |
| 33 | Javonte Williams | RB14 | DAL | 14 | 44 | 32 | 15.4 |
| 34 | Drake Maye | QB2 | NE | 11 | 37 | 48 | 24.5 |
| 35 | Jameson Williams | WR16 | DET | 6 | 54 | 70 | 13.4 |
| 36 | Lamar Jackson | QB3 | BAL | 13 | 32 | 38 | 19.8 |
| 37 | Emeka Egbuka | WR17 | TB | 10 | 40 | 52 | 11.9 |
| 38 | Tee Higgins | WR18 | CIN | 6 | 36 | 55 | 14.2 |
| 39 | Colston Loveland | TE4 | CHI | 10 | 37 | 45 | 10.4 |
| 40 | Travis Etienne Jr. | RB15 | NO | 8 | 47 | 38 | 15.2 |
| 41 | Saquon Barkley | RB16 | PHI | 10 | 24 | 18 | 14.9 |
| 42 | Ladd McConkey | WR19 | LAC | 7 | 34 | 49 | 11.6 |
| 43 | Jaylen Waddle | WR20 | DEN | 10 | 34 | 46 | 12.3 |
| 44 | Jadarian Price | RB17 | SEA | 11 | 73 | 68 |  |
| 45 | Breece Hall | RB18 | NYJ | 13 | 39 | 31 | 13.6 |
| 46 | Harold Fannin Jr. | TE5 | CLE | 11 | 73 | 85 | 11.8 |
| 47 | TreVeyon Henderson | RB19 | NE | 11 | 70 | 72 | 12.4 |
| 48 | Kyle Pitts Sr. | TE6 | ATL | 11 | 78 | 73 | 12.5 |
| 49 | Bucky Irving | RB20 | TB | 10 | 58 | 51 | 14.1 |
| 50 | Carnell Tate | WR21 | TEN | 9 | 68 | 70 |  |
| 51 | D'Andre Swift | RB21 | CHI | 10 | 54 | 52 | 14.7 |
| 52 | Garrett Wilson | WR22 | NYJ | 13 | 29 | 40 | 14.2 |
| 53 | Jalen Hurts | QB4 | PHI | 10 | 56 | 60 | 22.1 |
| 54 | Quinshon Judkins | RB22 | CLE | 11 | 62 | 47 | 12.3 |
| 55 | Davante Adams | WR23 | LA | 11 | 50 | 46 | 16.1 |
| 56 | Caleb Williams | QB5 | CHI | 10 | 67 | 85 | 22.0 |
| 57 | Wan'Dale Robinson | WR24 | TEN | 9 | 85 | 93 | 14.0 |
| 58 | Joe Burrow | QB6 | CIN | 6 | 45 | 58 | 21.6 |
| 59 | Parker Washington | WR25 | JAX | 7 | 63 | 78 | 11.8 |
| 60 | Trevor Lawrence | QB7 | JAX | 7 | 77 | 92 | 23.4 |
| 61 | DK Metcalf | WR26 | PIT | 9 | 78 | 66 | 12.7 |
| 62 | DJ Moore | WR27 | BUF | 7 | 52 | 61 | 10.2 |
| 63 | Quentin Johnston | WR28 | LAC | 7 | 95 | 100 | 13.3 |
| 64 | Luther Burden III | WR29 | CHI | 10 | 46 | 60 | 8.8 |
| 65 | Cam Skattebo | RB23 | NYG | 8 | 57 | 44 | 16.0 |
| 66 | Rome Odunze | WR30 | CHI | 10 | 57 | 66 | 12.5 |
| 67 | Dak Prescott | QB8 | DAL | 14 | 78 | 90 | 22.7 |
| 68 | Tucker Kraft | TE7 | GB | 11 | 80 | 76 | 15.2 |
| 69 | Rico Dowdle | RB24 | PIT | 9 | 88 | 84 | 13.2 |
| 70 | Courtland Sutton | WR31 | DEN | 10 | 83 | 84 | 13.2 |
| 71 | Alec Pierce | WR32 | IND | 13 | 100 | 108 | 12.5 |
| 72 | Michael Pittman Jr. | WR33 | PIT | 9 | 80 | 86 | 12.0 |
| 73 | Michael Wilson | WR34 | ARI | 14 | 88 | 105 | 13.3 |
| 74 | Brian Thomas Jr. | WR35 | JAX | 7 | 80 | 74 | 9.9 |
| 75 | Travis Kelce | TE8 | KC | 5 | 98 | 88 | 11.4 |
| 76 | RJ Harvey | RB25 | DEN | 10 | 97 | 95 | 12.2 |
| 77 | Jaylen Warren | RB26 | PIT | 9 | 77 | 74 | 13.8 |
| 78 | Terry McLaurin | WR36 | WAS | 7 | 47 | 56 | 11.4 |
| 79 | Bo Nix | QB9 | DEN | 10 | 99 | 99 | 21.3 |
| 80 | Rhamondre Stevenson | RB27 | NE | 11 | 77 | 77 | 12.9 |
| 81 | Marvin Harrison Jr. | WR37 | ARI | 14 | 68 | 72 | 10.7 |
| 82 | Malik Nabers | WR38 | NYG | 8 | 24 | 30 | 14.8 |
| 83 | Christian Watson | WR39 | GB | 11 | 57 | 80 | 13.4 |
| 84 | Justin Herbert | QB10 | LAC | 7 | 71 | 114 | 21.8 |
| 85 | Dallas Goedert | TE9 | PHI | 10 | 117 | 112 | 12.5 |
| 86 | Jake Ferguson | TE10 | DAL | 14 | 118 | 116 | 11.1 |
| 87 | Makai Lemon | WR40 | PHI | 10 | 109 | 118 |  |
| 88 | Jakobi Meyers | WR41 | JAX | 7 | 104 | 96 | 11.0 |
| 89 | Sam LaPorta | TE11 | DET | 6 | 85 | 78 | 11.9 |
| 90 | Matthew Stafford | QB11 | LA | 11 | 104 | 76 | 26.6 |
| 91 | Jonathon Brooks | RB28 | CAR | 5 | 90 | 111 |  |
| 92 | Jordan Addison | WR42 | MIN | 6 | 105 | 109 | 9.9 |
| 93 | MarShawn Lloyd | RB29 | GB | 11 | 179 | 96 |  |
| 94 | David Montgomery | RB30 | HOU | 8 | 61 | 53 | 10.1 |
| 95 | Juwan Johnson | TE12 | NO | 8 | 134 |  | 10.6 |
| 96 | Jared Goff | QB12 | DET | 6 | 106 | 110 | 22.2 |
| 97 | Brock Purdy | QB13 | SF | 8 | 96 | 105 | 24.6 |
| 98 | Stefon Diggs | WR43 | WAS | 7 | 96 | 95 | 13.0 |
| 99 | Josh Downs | WR44 | IND | 13 | 87 | 98 | 8.7 |
| 100 | Khalil Shakir | WR45 | BUF | 7 | 123 |  | 10.5 |
| 101 | Kenny Gainwell | RB31 | TB | 10 | 100 | 104 | 13.0 |
| 102 | Jayden Daniels | QB14 | WAS | 7 | 53 | 62 | 18.6 |
| 103 | Hunter Henry | TE13 | NE | 11 | 164 |  | 10.6 |
| 104 | Romeo Doubs | WR46 | NE | 11 | 127 |  | 10.3 |
| 105 | KC Concepcion | WR47 | CLE | 11 | 118 | 119 |  |
| 106 | Mike Evans | WR48 | SF | 8 | 56 | 62 | 10.8 |
| 107 | George Kittle | TE14 | SF | 8 | 98 | 92 | 14.9 |
| 108 | J.K. Dobbins | RB32 | DEN | 10 | 100 | 90 | 12.0 |
| 109 | Dalton Kincaid | TE15 | BUF | 7 | 112 | 106 | 10.8 |
| 110 | Mark Andrews | TE16 | BAL | 13 | 131 |  | 7.7 |
| 111 | Bhayshul Tuten | RB33 | JAX | 7 | 67 | 50 | 5.9 |
| 112 | Tony Pollard | RB34 | TEN | 9 | 84 | 82 | 11.3 |
| 113 | Dalton Schultz | TE17 | HOU | 8 | 163 |  | 10.5 |
| 114 | Patrick Mahomes II | QB15 | KC | 5 | 101 | 82 | 23.8 |
| 115 | De'Zhaun Stribling | WR49 | SF | 8 | 132 |  |  |
| 116 | Xavier Worthy | WR50 | KC | 5 | 129 | 120 | 7.8 |
| 117 | Baker Mayfield | QB16 | TB | 10 | 118 |  | 19.3 |
| 118 | Brenton Strange | TE18 | JAX | 7 | 159 |  | 9.8 |
| 119 | Jordan Watkins | WR51 | SF | 8 | 318 |  | 2.3 |
| 120 | Oronde Gadsden II | TE19 | LAC | 7 | 211 |  | 8.9 |
| 121 | Chig Okonkwo | TE20 | WAS | 7 | 160 |  | 7.3 |
| 122 | Xavier Restrepo | WR52 | TEN | 9 | 346 |  | 3.5 |
| 123 | Jauan Jennings | WR53 | MIN | 6 | 166 |  | 11.6 |
| 124 | Troy Franklin | WR54 | DEN | 10 | 216 |  | 10.4 |
| 125 | Jacory Croskey-Merritt | RB35 | WAS | 7 | 113 | 101 | 8.5 |
| 126 | AJ Barner | TE21 | SEA | 11 | 208 |  | 8.7 |
| 127 | Kyle Monangai | RB36 | CHI | 10 | 116 | 117 | 8.9 |
| 128 | Jayden Reed | WR55 | GB | 11 | 104 | 110 | 9.7 |
| 129 | Jaxson Dart | QB17 | NYG | 8 | 97 | 88 | 19.4 |
| 130 | Tre Tucker | WR56 | LV | 13 | 162 |  | 9.6 |
| 131 | Jalen Royals | WR57 | KC | 5 | 316 |  | 1.2 |
| 132 | Rashid Shaheed | WR58 | SEA | 11 | 148 |  | 8.8 |
| 133 | Kayshon Boutte | WR59 | HOU | 8 | 179 |  | 9.0 |
| 134 | Hollywood Brown | WR60 | PHI | 10 | 288 |  | 8.6 |
| 135 | Deebo Samuel Sr. | WR61 | SF | 8 | 138 |  | 11.8 |
| 136 | Keon Coleman | WR62 | BUF | 7 | 246 |  | 8.7 |
| 137 | Jalen Coker | WR63 | CAR | 5 | 124 |  | 8.2 |
| 138 | CJ Daniels | WR64 | LA | 11 | 331 |  |  |
| 139 | Elijah Sarratt | WR65 | BAL | 13 | 261 |  |  |
| 140 | Ja'Kobi Lane | WR66 | BAL | 13 | 222 |  |  |
| 141 | Chris Godwin Jr. | WR67 | TB | 10 | 76 | 146 | 9.4 |
| 142 | Kyler Murray | QB18 | MIN | 6 | 112 | 115 | 18.0 |
| 143 | Woody Marks | RB37 | HOU | 8 | 137 |  | 9.1 |
| 144 | Phil Mafah | RB38 | DAL | 14 | 327 |  | 10.9 |
| 145 | Chris Blair | WR68 | ATL | 11 | 339 |  | 0.0 |
| 146 | Skyler Bell | WR69 | BUF | 7 | 292 |  |  |
| 147 | Colbie Young | WR70 | CIN | 6 | 318 |  |  |
| 148 | Jacob Cowing | WR71 | SF | 8 | 347 |  |  |
| 149 | Brandon Aiyuk | WR72 | SF | 8 | 273 |  |  |
| 150 | Cyrus Allen | WR73 | KC | 5 | 222 |  |  |

---

## Evidence appendix


### Opening structure vs randomized rooms: playoff and title probability by drafting rule (version-3 simulator, 600 seasons each, +/-1.6 points)

You draft by rule from your slot (Ratz 2, Footborn 4) against nine opponents whose behavior is drawn at random each season from the three ESPN room types (RB-heavy, WR-savvy, balanced) with pick-to-pick noise; every other pick is best available by this board. Hero-RB = RB in round 1 then WR/TE in rounds 2-3; Robust-RB = RB in three of the first four; Zero-RB = no RB before round 5. Handcuffs, waivers and win totals are on. Example = one drafted opening.

| Rule | Ratz playoffs | Ratz title | Footborn playoffs | Footborn title | Example opening (Ratz) |
|---|---|---|---|---|---|
| Hero-RB (RB, then WR/TE x2) | 95% | 19.5% | 86% | 20.7% | Jahmyr Gibbs, Drake London, CeeDee Lamb, Tetairoa McMillan |
| RB-RB | 95% | 23.0% | 87% | 25.0% | Jahmyr Gibbs, Chase Brown, George Pickens, Zay Flowers |
| WR-WR | 95% | 17.3% | 86% | 23.5% | Ja'Marr Chase, George Pickens, Jahmyr Gibbs, Zay Flowers |
| WR-WR-WR | 91% | 14.2% | 80% | 17.5% | Ja'Marr Chase, George Pickens, Drake London, Chris Olave |
| Robust-RB (RB in 3 of first 4) | 95% | 21.5% | 82% | 23.5% | Jahmyr Gibbs, James Cook III, Chase Brown, Zay Flowers |
| Zero-RB (no RB before R5) | 94% | 13.7% | 82% | 19.8% | Ja'Marr Chase, George Pickens, Chris Olave, Zay Flowers |
| Best available by board | 94% | 20.0% | 88% | 26.0% | Jahmyr Gibbs, Chase Brown, George Pickens, Javonte Williams |

### Points per game by positional finish, 2025 (League A scoring; QB also shown under League B scoring)

Computed from nflverse weekly data, players with 8+ games. Replacement for a 10-team, 2-FLEX lineup is about the 71st RB/WR/TE (11.5 ppg), TE11 (11.1) and QB11 (17.9 in 4-pt, 21.8 in 6-pt).

| Rank | RB | WR | TE | QB (4-pt) | QB (6-pt + bonuses) |
|---|---|---|---|---|---|
| 1 | 25.2 | 24.4 | 18.8 | 22.8 | 26.6 |
| 3 | 22.5 | 20.3 | 14.9 | 20.7 | 24.6 |
| 5 | 20.9 | 18.9 | 12.5 | 19.9 | 23.8 |
| 8 | 17.2 | 17.0 | 11.7 | 18.7 | 22.2 |
| 10 | 15.8 | 16.0 | 11.1 | 18.4 | 22.0 |
| 12 | 15.6 | 15.2 | 10.8 | 17.5 | 21.6 |
| 15 | 15.1 | 13.9 | 10.5 | 16.8 | 20.2 |
| 20 | 13.7 | 13.1 | 9.3 | 15.7 | 17.8 |
| 24 | 12.5 | 12.4 | 8.5 | 14.1 | 16.9 |
| 30 | 11.5 | 11.8 | 7.3 | 11.8 | 14.5 |
| 36 | 9.1 | 11.0 | 5.9 | 10.4 | 12.6 |

### Value over replacement (ppg above the 2-FLEX replacement; 2025, with 2024 in parentheses)

Why the first two rounds are RB/WR, why McBride is a round-2 pick, and why QB waits. Realized edges regress: year-to-year persistence is about 0.78 for RB/WR, 0.71 TE, only 0.26 for QB, so QB edges should be haircut roughly twice as much before comparing across positions.

| Slot | RB | WR | TE | QB 4-pt | QB 6-pt |
|---|---|---|---|---|---|
| 1 | +13.3 (+13.1) | +12.7 (+12.5) | +7.8 (+5.1) | +4.9 (+7.8) | +4.8 (+9.4) |
| 3 | +10.6 (+9.9) | +8.6 (+7.1) | +3.9 (+4.4) | +2.8 (+5.2) | +2.8 (+5.9) |
| 5 | +9.0 (+8.1) | +7.2 (+6.8) | +1.5 (+2.2) | +2.0 (+3.4) | +2.0 (+2.7) |
| 10 | +3.9 (+6.7) | +4.3 (+5.4) | +0.1 (-0.6) | +0.5 (+0.1) | +0.2 (-0.4) |
| 20 | +1.8 (+3.1) | +1.4 (+3.1) | -1.7 (-2.9) | -2.2 (-2.6) | -4.0 (-3.9) |

### Why League A drafts for the playoffs: title equity from +3 ppg (20,000 simulated seasons)

10 teams, 14-week regular season, weekly score sd 22, single-elimination bracket. dReg = ppg edge in the regular season, dPO = ppg edge in Weeks 15-17.

| Format | dReg | dPO | P(make playoffs) | P(title) |
|---|---|---|---|---|
| 8 of 10 | 0 | 0 | 0.798 | 0.103 |
| 8 of 10 | +3 | 0 | 0.878 | 0.111 |
| 8 of 10 | 0 | +3 | 0.802 | 0.121 |
| 8 of 10 | -3 | +3 | 0.693 | 0.111 |
| 6 of 10 | 0 | 0 | 0.598 | 0.101 |
| 6 of 10 | +3 | 0 | 0.721 | 0.129 |
| 6 of 10 | 0 | +3 | 0.605 | 0.123 |
| 6 of 10 | -3 | +3 | 0.465 | 0.091 |

### Long-run age and regression effects (2013-2025, thirteen season-to-season transitions, within-player)

What happens the season after a good one. Coefficients are fitted controlling for last year's ppg and are stable across eras (RB -0.25 per year of age in 2013-18 vs -0.32 in 2019-25; WR -0.39 vs -0.32). They are applied to the production half of every projection: RB -0.30 ppg per year of age, WR -0.35, TE -0.09, QB -0.15, plus an extra -1.1 (RB) / -1.2 (WR) the year after a career-year jump of 4+ ppg. The RB cliff at 29-30 shows up mainly as availability, which the injury model carries separately.

| Group | n | Played 8+ next year | Mean ppg change next year | Dropped 5+ ppg |
|---|---|---|---|---|
| RB top-12, age 24 or under | 39 | 90% | -1.7 | 23% |
| RB top-12, 25-26 | 55 | 91% | -2.1 | 36% |
| RB top-12, 27-28 | 37 | 89% | -2.5 | 36% |
| RB top-12, 29-30 | 20 | 70% | -5.7 | 64% |
| WR top-12, 24 or under | 25 | 88% | -1.5 | 23% |
| WR top-12, 25-27 | 72 | 92% | -1.8 | 18% |
| WR top-12, 28-29 | 28 | 100% | -1.5 | 7% |
| WR top-12, 30-31 | 18 | 89% | -2.8 | 25% |
| WR top-12, 32+ | 13 | 85% | -5.0 | 55% |
| TE top-6 (all) | 78 | 87% | -2.2 | 24% |
| QB top-6 (all) | 78 | 90% | -2.9 | 29% |
| Repeat rate next year: RB top-12 / WR top-12 / TE top-6 / QB top-6 | 156 / 156 / 78 / 78 |  | 46% / 51% / 44% / 38% |  |
| RB career year (jump 4+ to 14+ ppg) vs steady 14+ | 67 / 37 | 90% | -4.0 vs -2.9 |  |
| WR career year vs steady | 77 / 91 | 91% | -3.5 vs -2.3 |  |

### Injury model: games missed the following season by fantasy-relevant players (2013-2025, twelve transitions, top 70 RB/WR and top 24 TE/QB by prior-year points)

Each player's Inj column is the mean for his bucket (position, age band, games missed the prior year), shrunk toward the position mean. Holdout test (fit 2013-23, predict 2024-25): bucket model error 3.82 games vs 3.89 for a flat position average, correlation 0.20 vs 0.11. Availability is mostly unpredictable; the column is a weak prior. Era check: RB and WR rates are the same in 2013-18 and 2019-25; QB missed games rose from 2.0 to 3.5.

| Bucket | n | Mean games missed | P(miss 4+) | P(miss 8+) |  |
|---|---|---|---|---|---|
| RB under 27, 0 missed last year | 170 | 3.5 | 33% | 17% |  |
| RB under 27, 1-3 missed | 217 | 4.6 | 46% | 25% |  |
| RB under 27, 4+ missed | 162 | 5.9 | 54% | 35% |  |
| RB 27-28, 0 missed | 65 | 4.4 | 40% | 23% |  |
| RB 27-28, 1-3 missed | 72 | 5.7 | 51% | 36% |  |
| RB 29+, 0 missed (McCaffrey, Henry) | 51 | 6.2 | 53% | 33% |  |
| RB 29+, 1-3 missed (Barkley) | 75 | 7.6 | 65% | 41% |  |
| RB 29+, 4+ missed | 52 | 8.7 | 65% | 54% |  |
| WR under 30, 0 missed | 331 | 2.9 | 29% | 12% |  |
| WR under 30, 1-3 missed | 303 | 3.4 | 34% | 17% |  |
| WR under 30, 4+ missed | 95 | 4.8 | 44% | 26% |  |
| WR 30+, 0 missed | 71 | 4.3 | 32% | 25% |  |
| WR 30+, 1-3 missed | 74 | 5.7 | 51% | 32% |  |
| TE, 0 / 1-3 / 4+ missed | 131 / 147 / 34 | 3.1 / 4.0 / 5.5 | 28% / 43% / 50% | 14% / 17% / 32% |  |
| QB, 0 / 1-3 missed | 175 / 100 | 2.3 / 3.7 | 23% / 38% | 12% / 18% |  |

### Usage-history projection model (ridge regression per position, fit on 2013-2025 season pairs, holdout-tested)

- Inputs per player: prior-season points per game under the league's scoring, targets per game, carries per game, target share, carry share, snap share, age, the size of last year's career-year jump, and efficiency (yards per carry or per target). Output: next-season ppg. Fit separately for RB, WR, TE, QB with ridge shrinkage.
- Holdout test (train on every year before the test year, test 2022-2025, players with 8+ games in both years): mean absolute error in ppg, model vs 'last year's ppg' alone: RB 3.33 vs 3.83, WR 2.85 vs 3.36, TE 2.20 vs 2.47, QB 2.74 vs 3.02. Rank correlation with next-year ppg: RB .62 vs .57, WR .72 vs .65, QB .52 vs .46; TE .46 vs .54 (TE ranks slightly worse, misses smaller). The model beat naive in 14 of 16 position-years.
- What the coefficients say (RB, League A scoring): each target per game is worth +0.26 ppg next year and each carry +0.11; each year of age costs 0.28; each point of last year's career-year jump gives back 0.15. WR: target share and snap share carry the signal, age costs 0.31, jump gives back 0.28. TE: last year's ppg persists most strongly (0.86) with target share and snap share; QB is mostly opportunity and rushing.
- How it enters the board: projection = one half usage model + one half expert-consensus curve (the consensus curve alone had MAE 2.9 in the 2024-25 backtests; the two errors are partly independent, so the blend beats either). Players without a usable 2025 line (rookies, under 4 games) use shrunken production and consensus instead.
- What it moved: McCaffrey sits RB4 rather than RB1 (age 30, 450 touches, 2025 efficiency above his usage); Nacua stays above JSN on targets per game and share; Cook and Taylor are held back by 2025 efficiency above expectation; Jefferson and Lamb get partial credit back for usage that outran their points. It cannot see 2026 depth charts, so Lloyd, Price, Allgeier, Vaki and Corum carry documented role overrides.

### Injury type: what the 2012-2025 injury reports and the medical literature say (time-loss injuries among top-70 RB/WR and top-24 TE/QB by prior-year points)

n = injuries listed Out at least one week, 2012-2024, followed into the next season. 'Missed next' counts games missed the following season (a player who never played again counts 17). 'Same type' = listed with the same body part the next season. 'ppg change' = next-season ppg minus injury-season ppg for those who played. Literature column: research/08-injury-evidence.md (27 sourced rows). Model use: each 2025 time-loss category adds expected games missed (RB knee +1.5, WR knee +1.3, WR hamstring +0.8, Achilles +2.0, back +0.6-0.8, capped at +3); injuries the 2025 reports cannot see get a literature-based year-1 haircut: Kittle x0.85 and +1.5 games, Nabers x0.90 and +0.5, Skattebo x0.90 and +1.0, LaPorta x0.95 and +1.5, Kraft x0.93 and +0.5, Mahomes and Rice x0.97 and +0.5, Godwin x0.95 and +0.5, Burrow x0.97; chronic soft-tissue files add +0.3 to +1.0 games (Evans, Lloyd, A.J. Brown, Collins, Higgins, McCaffrey, Taylor, Walker, Adams, Watson, Odunze, Stafford, Daniels, Love).

| Injury (position) | n | Missed next season | Same type next year | ppg change next | Literature |
|---|---|---|---|---|---|
| Knee (RB) | 64 | 6.8 | 16% | -1.9 | ACL: ~65% return at ~13.6 months; yards per carry 4.51 to 4.17; only 20% of 36 RBs reached 85% of prior fantasy output in year 1; no year-2 bounce (4 of 36 improved). Age under 26 is the main moderator. |
| Knee (WR) | 54 | 6.3 | 19% | -1.1 | ACL: 60-69% return; the largest and most persistent production loss of any position (post-return targets, yards and TDs cut by more than half vs pre-injury career), though elite young WRs (Godwin, Keenan Allen, Jordy Nelson) have hit 85%+ in year 1. |
| Knee (TE) | 27 | 3.9 | 33% | -2.1 | Meniscus scope: 2-6 weeks, 80-86% return. Cartilage removed matters more for young players. |
| Knee (QB) | 16 | 5.6 | 12% | +0.1 | ACL: 92% return, no significant production change vs pre-injury or controls (Mahomes). |
| Achilles (all, literature only) | - | - | - | - | 62 vs 62 matched controls 2008-2022: only 27% recovered to their prior level; performance down 21% beyond aging, worst in year 1, still depressed at 3 years; career-end hazard +68%. Return rate by position: TE 71% (best), WR 38% (worst), RB near the bottom (Kittle, Daniel Jones). |
| Hamstring (WR) | 80 | 5.2 | 21% | -0.8 | 2,075 NFL hamstrings 2009-2020: 11.9% re-injury the same season, 38.4% in a later season; WRs and returns inside two weeks carry the highest risk; the dip after return is short-lived (Tyson: 4th in 4 years; Evans; A.J. Brown; Watson). |
| Hamstring (RB) | 30 | 3.8 | 17% | -1.0 | Same source; RB hamstring and AC-joint sprains have the highest re-injury rates in the Footballguys index (Lloyd, Gibbs 2023-24). |
| Ankle (RB) | 60 | 4.4 | 20% | -1.0 | High-ankle: 15 days lost on average in the NFL, 5-10 weeks when surgical; the following season RB/TE/WR production fell significantly in every metric (n = 303); 11 of 13 RBs failed to match prior output in their first game back, and early returners (3 games or fewer) rarely regained form (Love, Taylor x3, Walker). |
| Ankle (WR) | 50 | 5.8 | 10% | -0.9 | As above; true recurrence is low but the next-season production drag is real (Lamb 2025, Hampton). |
| Concussion (WR) | 55 | 4.4 | 16% | -1.3 | About 1.5 games missed; per-game production roughly intact, but 83% higher same-season upper-body injury risk and higher release rates (Collins x2, Dart x2). |
| Concussion (QB) | 27 | 9.1 | 4% | -0.2 | Only 41% of these QBs played the next season at all: a concussion on a marginal QB ends careers, not seasons. |
| Shoulder (QB) | 22 | 7.1 | 18% | +1.0 | AC sprains are almost always non-operative (5-6 weeks); labral repair returns 87% but throwing-arm labrum surgery carries real decline risk. |
| Foot (WR) | 23 | 4.3 | 22% | -1.4 | Lisfranc: 82-90% return at ~11 months with a measurable year-1 drop; Jones fracture recovers fully unless the return is rushed under 10 weeks (Odunze 2025 stress fracture). |
| Back (all) | 24 | 6.5 | 17% | +0.8 | Discectomy: 74-82% return, on-field stats hold, careers and contracts shrink; only 62% of these players played the next season (LaPorta, Pacheco, Stafford). |
| Any time-loss injury (all) | 988 | 5.5 | - | -1.1 | Fantasy-points study 2017-2022: next-season ppg -0.5 overall (QB -1.95, RB -0.7, WR -0.33); the default prior when the type is unknown. |

### Handcuffs, waivers and in-season emergences: how the simulator now models an active league (version 3)

- Handcuff evidence, 2012-2025: 258 team-seasons where the RB1 (by ppg) missed at least one game. His backup averaged 5.1 ppg with the starter active and 11.6 ppg (median 10.6) without him: 79% of the starter's line at the median, a 12+ ppg starter 41% of the time, a 15+ ppg RB1-tier week 31% of the time. The simulator promotes the depth-chart backup to 81% of the starter's projection while the starter is out.
- Who the handcuffs are (Sept 2 depth charts): Gibbs to Vaki, Bijan to Brian Robinson, Cook to Ray Davis, Chase Brown to Perine, Judkins to Sampson, Henry to Justice Hill, Kyren to Corum, Taylor to McGowan, Price to Holani, Lloyd to Chris Brooks, Hampton to Keaton Mitchell, Barkley to Bigsby, Love to Allgeier, Swift to Monangai, McCaffrey to Black.
- Waivers: each simulated week, every team with an empty or sub-replacement starting slot claims the best free agent by projection, worst record first (ESPN default order). About four players a season emerge from the free-agent pool as 13-ppg starters (the 2013-2025 rate of undrafted-by-consensus players becoming top-36 RB/WR by midseason). Net effect: in a league this active the replacement level rises about 1-2 ppg over the season, which lowers the value of a fifth bench WR relative to a starter and raises the value of the IR slot and of a handcuff you already own.
- Same-team correlation: each team-week draws one shared factor (sd 0.12) applied to all its players, so stacking or double-dipping on one offense adds variance the way it does in real life.
- Trades: not simulated. There is no evidence base for how these ten drafters trade, and you said trades happen but are not routine. Posture in the game plan: sell a hot RB2 in Weeks 4-6 for a WR1-tier receiver if your RB1 and WR1 are healthy; never trade a handcuff of your own RB1.
- What the handcuff is worth, measured (1,200 seasons each): Ratz plan with Vaki 16.7% title vs 15.3% with a random late RB in his place; Footborn plan with Perine 16.0% vs 15.2% with a fifth WR. About one point of title odds, same sign in both leagues, inside the +/-1.1 point sampling noise of a single run but consistent with the 258-team-season handcuff evidence. Take the handcuff in round 14-15 whenever your RB1's backup is a clear one.

### 2026 win totals and game script (FOX/CBS lines, Sept 2)

- Game script is the largest factor in the 2012-2025 tests: in 7+ point losses vs 7+ point wins the same RB scores 6.0 ppg less, QB 5.8, WR 2.4, TE 1.2. It enters the projection through team win totals: per win above or below 8.5, RB +0.22 ppg, QB +0.20, WR +0.09, TE +0.04 (the within-player effect scaled by how much one win shifts the share of blowout losses).
- Totals: BAL and LAR 11.5; CIN, BUF, DET, KC, SF, GB, PHI, SEA 10.5; JAX, NE, DAL, HOU, DEN, CHI, LAC 9.5; TB, PIT, MIN, IND 8.5; WAS, NYG, ATL, NO 7.5; TEN, CAR, CLE 6.5; NYJ, LV 5.5; ARI, MIA 4.5.
- Effect size: Gibbs +0.4 ppg, Kyren +0.7, Cook +0.4; Jeanty -0.7, Achane -0.9, Love -0.9, Judkins -0.4, Skattebo -0.2; Allen +0.4, Lamar +0.6, Kyler +0 (MIN 8.5). Enough to break ties inside a tier, never to move a tier, which is why Jeanty still sits at 17 in Footborn and Judkins is still the RB2 target.

### Where the human judgment is (what 'hand adjustments' meant, and what replaced them)

- Earlier versions had the board order typed by hand after reading the model. Now the order is generated (model_board.py) from the projection, the availability layer and value over the 2-FLEX replacement, and every human input is one of the documented overrides below. Everything else, including every rank you see, is data.
- Role overrides where the Aug 28 consensus predates a verified depth-chart change (projected ppg): Lloyd 10.5 (GB RB1 with Jacobs on the exempt list), Price 12.5 (SEA RB1), Allgeier 8.0 (ARI RB1 while Love is out, then handcuff), Corum 6.5, Vaki 4.0.
- Availability overrides for players whose 2026 status is known: Tyson 8 games, Jacobs 8, Conner 6, Pacheco 6, Charbonnet 5, Dell 5 (all moved to the IR-stash section); Week-1 doubt flags: Love 50% chance of 2 games, Nabers 40% of 2, Kittle 40% of 2, Nacua 35% of 3 (conduct review), Jeanty 30% of 1.
- Sept 3 practice news, added as expected games missed: Odunze +1.0, Swift +1.0, Monangai +2.0, Nabers +0.5, Egbuka +0.5.
- Lingering-injury multipliers from the medical literature (table above). Ceiling bonus in Ratz only: a small credit for each player's top-6-week average, because 8 of 10 make the playoffs and December ceiling wins titles there.
- What is still judgment and not data: the Footborn room model (two boards of ten drafters), the DST order (2025 DST points under this scale plus Weeks 1-4 opponents), and League B's +2 per 50-yard TD, which is not in the data and is used only as a tiebreak.

### Title odds conditional on your key players' health (Ratz plan roster, 1,500 seasons)

Same simulator. Read with the base rates: 24% of fantasy-relevant RBs missed 8+ games the following season across 2023-25. The plan's edge survives a mid-season Gibbs injury because the RB2 at 42 and the handcuff at 142 backstop it; it does not survive losing him for half the year. (Version-2 simulator; the version-3 plan odds are 19.8%, so read these as relative.)

| Condition | Seasons | Make playoffs | Win title |
|---|---|---|---|
| Gibbs plays all 17 | 556 | 96% | 22.3% |
| Gibbs misses 1-3 | 714 | 95% | 15.4% |
| Gibbs misses 4-7 | 104 | 87% | 15.4% |
| Gibbs misses 8+ | 126 | 71% | 10.3% |
| Gibbs out for any of Weeks 15-17 | 257 | 88% | 13.6% |
| Gibbs available all playoff weeks | 1,243 | 94% | 18.3% |
| McBride misses 4+ | 422 | 89% | 15.4% |
| McBride plays all 17 | 544 | 94% | 20.8% |
| All seasons | 1,500 | 93% | 17.5% |

### 2025 actual vs expected fantasy points (ffopportunity expected-points model, PPR, players with 8+ games incl. playoffs)

- Outperformed expectation by 3+ ppg (usage did not justify the points; regression risk): Gibbs +3.6, Achane +3.5, Taylor +3.3, Bijan +2.5, Cook +2.1; Nacua +3.7, JSN +3.3, Higgins +2.3, Flowers +2.2, Pickens +1.8; Kraft +5.8, Kincaid +3.2, LaPorta +3.0, Kittle +2.9; Allen +2.3.
- Underperformed expectation (usage justified more points; bounce candidates): Jefferson -2.8, Odunze -2.8, Adams -2.5, Egbuka -2.5, Lamb -1.7; Barkley -1.7, Javonte -1.3, Judkins -0.8, McCaffrey -0.8; Warren -1.5, Ferguson -0.8; Dak -2.4, Lawrence -1.4.
- How it was used: as a cross-check, not a rank driver. It agrees with the board on Jefferson, Odunze, Egbuka, Lamb (already ranked above their 2025 ppg) and on Higgins/Kraft/Goedert (already discounted). It argues for a little more caution on the elite RBs' 2025 totals and a little more optimism on Barkley's volume, which the age model overrides.

### Draft-strategy evidence (2018-2025)

- Round-1 RBs and WRs finish top-12 at their position about half the time (RB 54%, WR 48%) and bust ~36%; the WR edge is small, so take the elite RB when the RB tier is thinner.
- Best Ball Mania: rosters with 3 WRs through round 6 were near-optimal every year; rosters with 3+ RBs in the first five rounds never advanced above the 16.7% baseline; the 2025 champion was Hero-RB (Henry round 2) with four early WRs. This board keeps the Hero-RB spine but moves the RB2 to picks 39-44 because the simulated ESPN room removes every RB2 candidate before round 6.
- QB1 (pick ~23) and QB12 (pick ~102) hit QB1-12 at the same ~50% rate; the QB1-vs-QB11 gap was 4.9 ppg in 4-pt and 4.8 in 6-pt scoring in 2025 (7.8 and 9.4 in 2024). Six-point TDs reorder the QBs; they do not make the position scarcer.
- 70% of QB seasons with 80+ carries since 2010 finished top-12 in ppg: require a rushing floor (Allen 112 car, Maye 103, Hurts 105, Dart 86, Herbert 83, Lawrence 82, Caleb 77).
- Touchdown rate per target regresses with a year-to-year slope of ~0.29 toward ~5.5%: Higgins (11.2%), Adams (12.3%), Goedert (13.4%) are ranked on their regressed lines; Lamb (2.6%) and Jefferson (1.4%) get partial credit back.
- RB age: top-20 RB seasons fall from 22-23 per year at ages 27-28 to 11 at 29 and 8 at 30. Elite WRs show no cliff through 30.
- First-round rookie RBs finish top-24 71% of the time; first-round rookie WRs finish top-24 only 28% and top-12 12%; Day-2 rookie WRs 13.5% top-36.
- A top-3 ADP DST finishes DST1 about 4% of the time; under this league's scale the DST1-DST12 spread was 2.7 ppg in 2025. Draft one in round 15 by Weeks 1-2 opponent and stream.
- Small samples were shrunk toward the pool before ranking (8 games of prior): Rice, Skattebo, Purdy, Burrow, Daniels survive; Lamar (QB17 by 2025 ppg) and Nabers (one 39-point game in four) do not, and are ranked on blended 2024-25 evidence.

### 2026 Weeks 15-17 schedule strength (2025 fantasy points allowed per game by those opponents; higher = softer)

League A playoff weeks. League average is 83.4. Tiebreak only; defenses change.

| Softest | Score | W15 / W16 / W17 | Hardest | Score | W15 / W16 / W17 |
|---|---|---|---|---|---|
| MIN | 93.3 | DET, WAS, @NYJ | SF | 72.2 | @LAC, @KC, PHI |
| JAX | 90.3 | @HOU, @DAL, WAS | MIA | 74.3 | @GB, LAC, BUF |
| CLE | 89.7 | @NYG, @BAL, IND | WAS | 76.7 | ATL, @MIN, @JAX |
| LA | 88.7 | DAL, @SEA, @TB | DEN | 77.7 | @LV, BUF, @NE |
| TEN | 88.2 | IND, @LV, PIT | SEA | 78.1 | @PHI, LA, @CAR |
| IND (RB) | 24.5 RB | @TEN, CIN, @CLE | HOU | 78.3 | JAX, @PHI, @GB |
| NYG | 88.0 | CLE, @DET, @DAL | NYJ / PHI | 78.4 | see sheet |

### What the five reviewers changed (Socratic pass, Sept 3)

- Statistician: Jefferson moved from 9 to 13 (his drop was 60% efficiency, not TD luck); Lamar out of the QB2 slot on both boards; Stafford to 61-64 in League B; Higgins and Adams down a tier for TD-rate regression; 'best-6 weeks' dropped as a ranking criterion (it is a rescaled ppg that penalizes short seasons); nine note errors fixed.
- Room simulator (three ESPN room types, 600 runs each): RB2 moved to picks 42/44; Herbert to 82-99; Maye at 37 as the League B default; Jefferson/Achane/Cook/Taylor removed from the round-2 list (0-20% available); Godwin to round 14-15; Dart and Burrow removed as late QB fallbacks.
- Contrarian drafter: Hero-RB with the RB2 at 39-44 beat Zero-RB by ~5 ppg and Robust-RB in both leagues; McBride at 19 made the default; Kraft (not Loveland) as the TE fallback; handcuff and IR stash are both draftable because the IR slot is a 16th spot; Gibbs-injury contingency = Vaki at 142.
- Settings specialist: confirmed the scoring model term by term (League B's +2 per 50-yd TD is not in the data and is treated as a tiebreak); Monte Carlo on playoff formats; DST order rebuilt on 2025 DST points under this exact scale plus Weeks 1-4 opponents; ESPN IR rule (IR/O-tagged only) applied.
- News auditor: all 150 skill players in the top 160 matched Sept 2 depth charts and rosters; fixed JSN's OC, Hall's extension, Love's 50/50 status, Egbuka/Godwin, Achane's WR corps, Jacobs' open-ended exempt list, Pacheco's Week-7 return.

### What was analyzed for each player, and what would sharpen it

- Per player, from verified data: 2025 and 2024 games, points per game under each league's exact scoring (yardage bonuses included), weekly standard deviation, 25th-percentile week, best-6-week average, targets, target share, receptions, receiving yards and TDs, carries, rushing yards and TDs, 100-yard rushing and receiving game counts, passing yards/TDs/INTs and 300-yard games, offensive snap share, age on Sept 10, draft year and round, 2026 team, Sept 2 depth-chart slot, roster status (active / IR / PUP / exempt), bye week, expert consensus overall and positional rank (Aug 28), estimated ESPN room price, expected games missed (injury model), 2026 Weeks 15-17 opponents' 2025 points allowed by position, and dated Sept 1-3 injury and role reporting.
- Per player, derived: shrunken projection (8-game prior toward own 2024 or the positional pool), value over the 2-FLEX replacement, TD-rate regression, expected-points gap, and availability-weighted season points (projection times 17 minus expected games missed).
- Per player, added since the first version: usage-model projection (targets, carries, shares, snaps, age, efficiency), 2025 injury-report categories with literature recurrence rates, 2026 win-total game-script tilt, depth-chart handcuff, Week-1 status from the Sept 2-4 reports, and a 2012-2025 injury history for the top 80 (research/08-injury-types.csv).
- Still not modeled, in order of value: (1) opponent-specific weekly projections (schedule strength is a tiebreak); (2) a per-week injury hazard instead of one block; (3) trade behavior; (4) target-share stability across QB changes (A.J. Brown to Maye, Jefferson to Murray) beyond the usage model's team-change term.
- Where more data lives: nflverse (play-by-play, FTN charting, snap counts, injuries, participation), ffopportunity (expected points), DynastyProcess (daily expert-consensus and ADP snapshots), all reachable from this environment; ESPN's own ADP and the 2026 injury file were not reachable today.

### Footborn draft-room history (transcribed from the 2024 and 2025 boards)

Positional picks by round. The room is the model for pick 4: WRs go early, QBs run in rounds 3-5, DSTs in round 14.

| Round | 2025 RB/WR/TE/QB/DST | 2024 RB/WR/TE/QB/DST | Notable 2025 picks |
|---|---|---|---|
| 1 | 5/5/0/0/0 | 5/5/0/0/0 | Chase 1, Barkley 2, Bijan 3, Gibbs 4, Jefferson 5, CMC 6, Lamb 7, Nabers 8, Jeanty 9, Collins 10 |
| 2 | 5/5/0/0/0 | 4/6/0/0/0 | Henry 11, ASB 12, Nacua 13, BTJ 14, AJB 15, Achane 16, London 17, Jacobs 18, Irving 19, Taylor 20 |
| 3 | 3/5/1/1/0 | 5/3/2/0/0 | Hill 21, Higgins 22, Walker 23, C. Brown 24, McConkey 25, Adams 26, Cook 27, Bowers 28, JSN 29, Allen 30 |
| 4 | 3/3/1/3/0 | 3/7/0/0/0 | McBride 31, Daniels 32, Kyren 33, Hampton 34, MHJ 35, McLaurin 36, Henderson 37, G. Wilson 38, Lamar 39, Burrow 40 |
| 5 | 4/4/0/2/0 | 3/5/1/1/0 | Metcalf 41, McMillan 42, Hurts 43, Sutton 44, Pollard 45, Hall 46, Mahomes 47, Kamara 48, Hubbard 49, Evans 50 |
| 6-7 | 6/11/3/0/0 | 3/12/2/3/0 | Kittle 56, LaPorta 61, Kelce 62; Egbuka 56, Rice 66, Golden 67 |
| 8-9 | 8/9/1/2/0 | 6/9/3/2/0 | Mayfield 73, Nix 85; Olave 74, Odunze 88 |
| 10-13 | 15/19/4/0/2 | 15/13/5/4/3 | Skattebo 101, Warren 110, Loveland 118 |
| 14-15 | 2/6/1/3/8 | 4/2/1/3/10 | Goff 135, Dak 144, Lawrence 145; 7 DSTs in round 14 |

### Factor tests: which proposed data points carry signal (2012-2025, within-player comparisons; earlier 3-year figures corrected)

- Thursday games: over 13 seasons (1,455 player-seasons) the same-player difference is +0.15 ppg with a confidence interval of -0.28 to +0.58. The +1.5 found on 2023-25 alone was a small-sample artifact. Monday: -0.4 (CI -0.83 to 0.00). Neither gets a weight.
- International games: +0.3 ppg, CI -0.5 to +1.1 across 379 player-seasons. No effect; zero weight.
- Game script (team lost by 7+ vs won by 7+, same player, 2012-2025): RB -6.0 ppg, QB -5.8, WR -2.4, TE -1.2 (n = 422 / 412 / 647 / 156). Stable across eras and the largest effect in the set; enter it through team win totals, weighted RB and QB > WR > TE.
- Age: controlling for last year's ppg and opportunity, each year of age costs about 0.7 ppg for RBs and WRs; TE 0.3; QB none. Within-player declines accelerate at RB 28-29 (-2.9 ppg) and 30+ (-4.9). Already in the board; the regression confirms the weight.
- Head coach tendencies: pass rate persists year to year only moderately (r = 0.51 in 2023-24, 0.37 in 2024-25) and plays per game barely persist (r = 0.29, then -0.03). Coaches matter through the opportunity they create (Sean Payton's RB target share 32% in 2023, McVay's RB target share ~10%), not as a separate factor; once opportunity is in the model, a coaching change adds no reliable signal (coefficients near zero and unstable). Offensive-coordinator data is not in the files.
- Supporting cast and team change: after controlling for opportunity, 'new team' is unstable across positions (RB -1.9, WR +2.4, TE -3.4 on samples of 20-58). Treat as a manual adjustment for specific cases (A.J. Brown to Maye, Jefferson to Murray) rather than a fixed weight.
- Predictive weighting (2024 features predicting 2025 ppg): last year's ppg plus opportunity per game plus age explains 50-56% of RB/WR variance vs 36-41% for last year's ppg alone; for TE 46% vs 19%; for QB 41% vs 10% (QB is mostly opportunity and rushing). Opportunity per game carries about as much weight as last year's points.
- Weekly variance over 13 seasons: a player's coefficient of variation persists year to year at r = 0.26 (1,091 pairs), weaker than the 0.52 seen in the 2024-25 pair alone. The simulator's per-player variance is therefore shrunk toward the position average (mean CV 0.57).
- Positional scoring curves are kept to 2024-25 deliberately: the 13-year table shows RB12 drifting between 13.8 and 17.0 ppg and TE1 between 14.5 and 21.5 by year, so old curves would import a different scoring environment. Age, injury, game-script and variance effects are structural and use the full window.

### Pressure test of the model (holdout backtests on 2024 and 2025, plus simulation sensitivity)

- Projection: using the real late-August expert consensus of each year, mapping consensus positional rank onto the historical points curve predicted next-season ppg with MAE 2.9 and rank correlation 0.69-0.74, versus MAE 3.4 and 0.60-0.63 for last year's points alone (n = 139 and 145 players). Blending 30-50% production with 50-70% consensus was marginally best (MAE 2.8). The board's 50/50 blend holds; consensus alone was best for RBs and TEs, the blend helped QBs and WRs.
- Implication for this board: deviations from consensus at RB have historically not been rewarded. The board's larger RB moves (Taylor to 5, Henry to 20 vs consensus 38, Skattebo to 38 vs 57, Lloyd) are role- and injury-driven calls, and should be treated as such, not as model output.
- Injury model: fit on 2023-24 and tested on 2024-25, the position/age/prior-injury buckets beat a flat position average only slightly (MAE 3.87 vs 3.95 games; correlation with actual missed games 0.18 vs 0.11). The P(miss 8+) tiers were calibrated in the middle and top (predicted 23% / 39%, actual 21% / 40%) and under-predicted the safest tier (8% predicted, 16% actual). Games missed are mostly unpredictable; the Inj column is a weak prior, not a forecast.
- Weekly variance: a player's 2024 standard deviation predicted his 2025 standard deviation weakly (r = 0.22) but his coefficient of variation persisted (r = 0.52); 90% intervals built from 2024 covered 88% of 2025 weeks. The simulator's variance is about right.
- Room model: the Footborn room deviates from consensus by 22-24 picks on average. RB-early behavior persisted (applying 2024's RB shift cut 2025 RB error from 26 to 22 picks) but QB behavior did not (QBs went 40 picks late in 2024 and near consensus in 2025, so the 2024 shift doubled QB error). The pick-4 QB plan therefore leans on 2025 only, and DST/RB timing on both years.
- Simulation sensitivity (700 seasons per cell, Ratz): the plan's title odds stayed 15-19% and the ESPN-sheet roster stayed 7-8% under every assumption tested (production/consensus blend 0.2 to 0.8, weekly variance x1.3, deeper waiver wire, injuries x1.5, opponents drafting by consensus instead of ESPN skew). Zero-RB never won a setting. Robust-RB tied or edged the plan under a consensus-heavy blend and longer injuries, so 'Hero-RB beats Robust-RB' is not a robust conclusion; 'either beats drafting off the sheet' is.
- Known limitations after version 3: trades are not simulated; each player's injury is still one contiguous block per season (its length is drawn from the 2013-2025 distribution for his position, age and prior-year games missed); ESPN's own 2026 ADP could not be reached, so the Ratz room is modeled from ESPN's public rankings and consensus, and the Footborn room from its 2024-25 boards; 29 of the 80 injury histories could be verified only through June 2026 (search budget); League B's 50-yard TD bonus is a tiebreak only.

---

Sources: nflverse weekly player stats 2024-2025 (points recomputed under each league's exact scoring), nflverse 2026 rosters, depth charts (Sept 2), draft picks and schedule; FantasyPros expert consensus rankings via DynastyProcess (Aug 28, 2026); ESPN staff ranks (Yates, Clay, Aug 31) and ESPN-specific ADP anchors from FantasyPros, RotoWire, FantasySixPack, FTN (Aug 2026); injury and transaction reporting dated Aug 15 - Sept 3, 2026 (ESPN, NFL.com, CBS, NBC Sports, team sites); strategy studies from Underdog Best Ball Mania, 4for4, FantasyPros, Footballguys, RotoViz. ECR = expert consensus overall rank. Room = estimated pick where an ESPN cheat-sheet room takes the player (verified anchors where available, modelled otherwise, about +/-10 picks). 25 ppg = 2025 points per game under this league's scoring.

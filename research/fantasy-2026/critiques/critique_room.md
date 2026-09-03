# critique_room.md — ESPN in-person room model vs plan_v1 (2026-09-03)

Reviewer lens: 10-team in-person ESPN league, casual-to-medium drafters working off ESPN's printed PPR list. Method: (1) built an ESPN-room ADP estimate from ECR + every ESPN-specific number found; (2) Monte-Carlo'd 3 room types x 600 drafts x rounds 1-8 for pick 2 (League A) and pick 4 (League B) with the user following plan_v1's ladders literally; (3) compared ESPN price to board_A/board_B rank. Simulator: `build/room_sim.py` (raw output in `build/room_sim_out.md`).

## 0. ESPN-specific numbers found this session (15 searches, no page fetches)

| # | Number | Player | Source (URL) | Date |
|---|---|---|---|---|
| 1 | ESPN ADP **39.4** | DeVonta Smith | fantasysixpack.net/2026-fantasy-football-adp-values/ (via search snippet) | 2026 preseason |
| 2 | ESPN ADP **45.3**; Yates #36 / TE3 | Colston Loveland | espn.com/fantasy/football/story/_/id/49684093/2026-fantasy-football-draft-value-picks-favorite-players-field-yates | Aug 24, 2026 |
| 3 | Yates #11, "nearly a round before his ADP" => ESPN ADP ~19-20 | Derrick Henry | same Yates "Field's favorites" article | Aug 24, 2026 |
| 4 | Yates QB6 vs ESPN ADP **QB15**; 58-pick ECR gap | Justin Herbert | fantasypros.com/2026/08/top-3-fantasy-football-draft-values-on-espn-2026-picks/ + Yates favorites | Aug 2026 |
| 5 | ESPN ADP **WR36** vs ECR WR28; Yates WR29 (#76) | Christian Watson | same FantasyPros ESPN-values article | Aug 2026 |
| 6 | ESPN ADP **QB8** vs ECR QB15 ("overvalued"); "avoid high-ADP Stafford" | Matthew Stafford | fantasypros.com/2026/08/overvalued-fantasy-football-draft-picks-to-avoid-espn-2026-picks/ ; stackedfantasy.com/exploit-adp/espn | Aug 2026 |
| 7 | ESPN ADP **17.7** (pre-ankle, Aug 23) | Ashton Jeanty | rotowire.com/football/article/2026-fantasy-football-adp-exploiting-default-rankings-on-espn-129135 (via stackedfantasy snippet) | ~Aug 20, 2026 |
| 8 | ESPN ADP **26.2** ("gone by mid-R2 elsewhere") | Chase Brown | same RotoWire article | ~Aug 20, 2026 |
| 9 | Clay **RB33**; FantasyPros composite ADP 178 (stale, pre-Aug 30) | MarShawn Lloyd | espn.com/.../47513496/2026-fantasy-football-rankings-ppr-mike-clay ; fantasypros.com/nfl/adp/marshawn-lloyd.php | Aug 31 / Sep 1, 2026 |
| 10 | Sleeper 51.8, ESPN **~23 picks later** (~75); "R4-5 on ESPN" (12-team phrasing) | TreVeyon Henderson | fantasysixpack.net/2026-fantasy-football-adp-values/ | 2026 preseason |
| 11 | Clay QB7 / Yates **QB7** (ESPN staff love him; Karabell 'do not draft' NYG trio) | Jaxson Dart | Clay + Yates Aug 31 pages; espn.com/.../49529494/...karabell | Aug 31, 2026 |
| 12 | Clay QB12-13 / Yates QB13 | Stafford (staff rank, not ADP) | Clay + Yates Aug 31 | Aug 31, 2026 |
| 13 | Clay QB17 / Yates QB19 | Kyler Murray | Clay + Yates Aug 31 | Aug 31, 2026 |
| 14 | Clay QB20 / Yates QB17 | Daniel Jones | Clay + Yates Aug 31 | Aug 31, 2026 |
| 15 | Clay WR40 | Michael Wilson | Clay Aug 31 | Aug 31, 2026 |
| 16 | ESPN ADP **146.8** | Chris Godwin | FantasyPros ESPN values (Aug) + ftnfantasy.com/exploiting-espn-fantasy-football-adp-in-2026 ("~70 picks later than FTN rank") | Aug 2026 |
| 17 | Yates top-20 (Aug 31): Bijan, Gibbs, CMC, Chase, Nacua, JSN, Taylor, Achane, ASB, Cook, Henry, Jefferson, Lamb, C.Brown, Walker(16), Bowers, London(18), McBride, Rice(20) | — | espn.com/.../48711830/2026-fantasy-football-rankings-ppr-field-yates | Aug 31, 2026 |
| 18 | ESPN "best picks by slot, 10-team": pick 2 = Gibbs then **A.J. Brown at 19** (Hall also 'unlocked' at 19); pick 4 = Nacua then **London + Collins** as top-15 values at 17 | — | espn.com/.../49723044/2026-fantasy-football-draft-best-picks-draft-slot-10-team | Aug 2026 |
| 19 | "ESPN has the most easily exploitable default ranks... a self-fulfilling prophecy" | structural | RotoWire (#7) | Aug 2026 |
| 20 | Top-20 ECR WRs go **45% later** on ESPN; RBs ~30% earlier; Davante Adams the only top-50 WR going earlier | structural | FantasyPros ESPN values (Jun+Aug) | 2026 |

Not found (searches exhausted): a full ESPN top-200 ADP table; a numeric ESPN ADP for Collins, Lloyd, Dart, Kyler, Jones, M. Wilson (all modelled from staff rank + structural skew). Confidence per row is in the "basis" column below.

## 1. ESPN room ADP estimate (top 125; 10-team)

Method: start from `ecr_ovr` (FantasyPros ECR 2026-08-28); override with the numbers above; else apply the structural skew (RB x~0.85, WR x~1.15-1.25, QB and TE later, big-name veterans earlier). delta = est_espn_adp - ecr_ovr (negative = ESPN rooms take him EARLIER than experts).

| # | player | pos | ecr_ovr | est_espn_adp | delta (ESPN-ECR) | basis |
|---|---|---|---|---|---|---|
| 1 | Bijan Robinson | RB | 4.1 | 1.5 | -3 | Y#1 C#2 |
| 2 | Jahmyr Gibbs | RB | 2.5 | 1.8 | -1 | Y#2 C#1; ESPNslot: pick 2 = Gibbs |
| 3 | Ja'Marr Chase | WR | 1.6 | 3.5 | +2 | Y#4 C WR1 |
| 4 | Christian McCaffrey | RB | 9.2 | 4.5 | -5 | Y#3 C RB3; casual rooms take CMC by name; CBS ADP 7.75 |
| 5 | Puka Nacua | WR | 3.2 | 5.5 | +2 | Y#5; ESPNslot pick 4 = Nacua |
| 6 | Jaxon Smith-Njigba | WR | 4.7 | 6.5 | +2 | Y#6 |
| 7 | Jonathan Taylor | RB | 11.9 | 7.0 | -5 | Y#7 C#4 |
| 8 | De'Von Achane | RB | 21.0 | 8.5 | -12 | Y#8 C RB5; proxy ADP 11 |
| 9 | Amon-Ra St. Brown | WR | 5.4 | 9.5 | +4 | Y#9 C WR4 |
| 10 | James Cook III | RB | 16.0 | 10.5 | -5 | Y#10 C RB6 |
| 11 | Brock Bowers | TE | 19.0 | 14.0 | -5 | Y#16; PrizePicks 'R2 P16'; casual rooms take TE1 early |
| 12 | Justin Jefferson | WR | 9.4 | 15.0 | +6 | Y#12; proxy 15.7; WRs later on ESPN |
| 13 | CeeDee Lamb | WR | 9.0 | 16.0 | +7 | Y#13; proxy 14.7 |
| 14 | Kenneth Walker III | RB | 26.1 | 17.0 | -9 | Y#16 RB9; proxy 18.0 |
| 15 | Trey McBride | TE | 21.0 | 18.0 | -3 | Y#18; PrizePicks 'R2 P19'; fantasylife 'price too high on ESPN' |
| 16 | Saquon Barkley | RB | 24.4 | 18.5 | -6 | C RB8 / Y RB11; name value in casual rooms; RULE RB earlier |
| 17 | Derrick Henry | RB | 37.7 | 19.0 | -19 | Y#11 'nearly a round before his ADP' (YF Aug 24) => ADP ~19-20 |
| 18 | Omarion Hampton | RB | 25.6 | 19.5 | -6 | Y RB12 C RB13; proxy 15.5 |
| 19 | Ashton Jeanty | RB | 26.4 | 20.0 | -6 | RW: ESPN ADP 17.7 (pre-ankle Aug 23); slight drift |
| 20 | Drake London | WR | 12.9 | 20.5 | +8 | Y#18; ESPNslot: London 'top-15 value' at pick 17 |
| 21 | Rashee Rice | WR | 24.7 | 22.0 | -3 | Y#20 WR8 |
| 22 | Josh Allen | QB | 25.8 | 24.0 | -2 | proxy ADP 19; ESPN rooms take QBs later than Sleeper/Yahoo |
| 23 | Chase Brown | RB | 17.9 | 24.5 | +7 | RW: ESPN ADP 26.2 (Y#14); Burrow-healthy drift up |
| 24 | Jeremiyah Love | RB | 41.4 | 25.0 | -16 | FP: most overvalued on ESPN (67% gap), C RB7 Y RB10; proxy 27 |
| 25 | A.J. Brown | WR | 14.2 | 25.5 | +11 | Y#27; ESPNslot: AJB = R2 pick at 19 (i.e. expected available at 19) |
| 26 | Nico Collins | WR | 16.0 | 28.0 | +12 | Y#40 C WR10; FP: ~12 picks later than ECR 16; ESPNslot: value at 17 |
| 27 | Chris Olave | WR | 18.0 | 29.0 | +11 | C WR11; ECR 18 x RULE |
| 28 | Malik Nabers | WR | 24.5 | 30.0 | +5 | Y#26 C WR13; K do-not-draft; ACL/Wk1 doubt |
| 29 | Breece Hall | RB | 39.9 | 31.0 | -9 | Y RB15; proxy 31.5; ESPNslot: Hall 'unlocked' R2 at pick 2 |
| 30 | George Pickens | WR | 20.4 | 31.5 | +11 | C WR15; ECR 20 x RULE |
| 31 | Javonte Williams | RB | 44.6 | 32.0 | -13 | Y RB14 C RB16; proxy 29 |
| 32 | Kyren Williams | RB | 41.5 | 34.0 | -8 | Y RB16; proxy 34 |
| 33 | Lamar Jackson | QB | 32.1 | 38.0 | +6 | proxy 37; QBs later |
| 34 | Travis Etienne Jr. | RB | 47.6 | 38.0 | -10 | proxy 38; Y RB17 |
| 35 | DeVonta Smith | WR | 24.0 | 39.4 | +15 | F6P: ESPN ADP 39.4 (verified number) |
| 36 | Garrett Wilson | WR | 29.6 | 40.0 | +10 | C WR13; ECR 29.6 x RULE |
| 37 | Zay Flowers | WR | 30.3 | 42.0 | +12 | Y#42 |
| 38 | Tetairoa McMillan | WR | 35.6 | 43.0 | +7 | Y#43; FFC 40 |
| 39 | Cam Skattebo | RB | 57.4 | 44.0 | -13 | proxy 41; Y RB20; K do-not-draft (NYG trio) |
| 40 | Colston Loveland | TE | 37.4 | 45.3 | +8 | YF: ESPN ADP 45.3 (verified number) |
| 41 | Davante Adams | WR | 50.1 | 46.0 | -4 | Y#51; FP: only top-50 WR going EARLIER than ECR on ESPN |
| 42 | Jaylen Waddle | WR | 34.8 | 46.5 | +12 | Y#45 |
| 43 | Quinshon Judkins | RB | 62.0 | 47.0 | -15 | proxy 47; Y RB18 |
| 44 | Drake Maye | QB | 37.7 | 48.0 | +10 | C QB4; ECR 37.7; QBs later on ESPN |
| 45 | Ladd McConkey | WR | 34.9 | 49.0 | +14 | C WR21; ECR 34.9 x RULE |
| 46 | Bhayshul Tuten | RB | 67.2 | 50.0 | -17 | Y#50 |
| 47 | Bucky Irving | RB | 58.7 | 51.0 | -8 | C RB20 Y RB21 |
| 48 | D'Andre Swift | RB | 54.7 | 52.0 | -3 | Y RB19 |
| 49 | Emeka Egbuka | WR | 40.8 | 52.5 | +12 | C WR19; ECR 40.8 x RULE |
| 50 | David Montgomery | RB | 61.4 | 53.0 | -8 | Y#57; RB earlier |
| 51 | Tyler Warren | TE | 53.1 | 54.0 | +1 | proxy 52.5; C TE4 |
| 52 | Tee Higgins | WR | 36.9 | 55.0 | +18 | Y#58 |
| 53 | Terry McLaurin | WR | 47.2 | 56.0 | +9 | ECR 47; name value |
| 54 | Joe Burrow | QB | 45.8 | 58.0 | +12 | C QB6; ECR 45.8; QBs later |
| 55 | Jalen Hurts | QB | 56.5 | 60.0 | +4 | C QB5; ECR 56.5 |
| 56 | Luther Burden III | WR | 47.0 | 60.5 | +14 | ECR 47 x RULE |
| 57 | DJ Moore | WR | 52.1 | 61.0 | +9 | ECR 52 x RULE |
| 58 | Jayden Daniels | QB | 53.2 | 62.0 | +9 | proxy 63; C QB2 but injury |
| 59 | Mike Evans | WR | 56.2 | 62.5 | +6 | ECR 56; name value |
| 60 | Josh Jacobs | RB | 46.9 | 63.0 | +16 | exempt list Aug 30 AFTER most printed sheets (Y RB~15 / C RB26); in-person rooms hear the news but a few still take him |
| 61 | Chuba Hubbard | RB | 98.9 | 65.0 | -34 | Y#66 |
| 62 | DK Metcalf | WR | 78.9 | 66.0 | -13 | Y#69; name value |
| 63 | Rome Odunze | WR | 57.5 | 66.5 | +9 | Y#68 |
| 64 | Jadarian Price | RB | 73.2 | 68.0 | -5 | rookie R1 SEA RB1; no ESPN number; RULE |
| 65 | Jameson Williams | WR | 54.7 | 70.0 | +15 | Y#80; ECR 54.7 |
| 66 | Carnell Tate | WR | 68.3 | 70.5 | +2 | proxy 67 |
| 67 | TreVeyon Henderson | RB | 71.0 | 72.0 | +1 | F6P: ESPN ~23 picks later than Sleeper 51.8 => ~75 |
| 68 | Marvin Harrison Jr. | WR | 68.6 | 72.5 | +4 | Y#74; name value |
| 69 | Kyle Pitts Sr. | TE | 78.9 | 73.0 | -6 | stacked: 'Pitts inflated cost' on ESPN; ECR 79 |
| 70 | Brian Thomas Jr. | WR | 80.0 | 74.0 | -6 | proxy 78.2 |
| 71 | Jaylen Warren | RB | 77.3 | 74.5 | -3 | ECR 77; RB earlier |
| 72 | Matthew Stafford | QB | 104.3 | 76.0 | -28 | FP overvalued: ESPN ADP QB8 vs ECR QB15; stacked: 'avoid high-ADP Stafford' |
| 73 | Tucker Kraft | TE | 80.5 | 76.5 | -4 | proxy 74.3 |
| 74 | Rhamondre Stevenson | RB | 77.3 | 77.0 | -0 | riser; listed NE RB1; RULE |
| 75 | Sam LaPorta | TE | 85.8 | 78.0 | -8 | proxy 77.9 |
| 76 | Parker Washington | WR | 63.3 | 78.5 | +15 | ECR 63 x RULE |
| 77 | Christian Watson | WR | 57.6 | 80.0 | +22 | Y#76; FP: ESPN ADP WR36 vs ECR WR28 |
| 78 | Patrick Mahomes II | QB | 101.5 | 82.0 | -19 | ECR 101; name value in casual rooms |
| 79 | Tony Pollard | RB | 85.0 | 82.5 | -2 | ECR 85; RB earlier |
| 80 | Rico Dowdle | RB | 88.8 | 84.0 | -5 | ECR 89; RB earlier |
| 81 | Courtland Sutton | WR | 83.3 | 84.5 | +1 | Y#88 |
| 82 | Caleb Williams | QB | 67.1 | 85.0 | +18 | ECR 67; QBs later |
| 83 | Harold Fannin Jr. | TE | 73.4 | 85.5 | +12 | ECR 73; TE later |
| 84 | Michael Pittman Jr. | WR | 80.4 | 86.0 | +6 | ECR 80 |
| 85 | Jaxson Dart | QB | 97.5 | 88.0 | -9 | C QB7 / Y QB7 (ESPN composite QB7) vs ECR QB13 => ESPN rooms take him EARLY; K do-not-draft |
| 86 | Travis Kelce | TE | 98.5 | 88.5 | -10 | ECR 98.5; name value |
| 87 | Dak Prescott | QB | 78.2 | 90.0 | +12 | ECR 78; QBs later |
| 88 | J.K. Dobbins | RB | 100.5 | 90.5 | -10 | ECR 100; listed DEN RB1 |
| 89 | Trevor Lawrence | QB | 77.8 | 92.0 | +14 | ECR 78; QBs later |
| 90 | George Kittle | TE | 98.9 | 92.5 | -6 | proxy 97.8 |
| 91 | Wan'Dale Robinson | WR | 85.6 | 93.0 | +7 | ECR 85.6 x RULE |
| 92 | Stefon Diggs | WR | 96.5 | 95.0 | -1 | ECR 96.5; name |
| 93 | RJ Harvey | RB | 97.5 | 95.5 | -2 | Y#110; RB earlier |
| 94 | MarShawn Lloyd | RB | 179.0 | 96.0 | -83 | C RB33 (~#95); printed sheets ~180 (FP ADP 178 stale); Jacobs news Aug 30; HIGH VARIANCE 60-150 |
| 95 | Jakobi Meyers | WR | 104.5 | 96.5 | -8 | Y#93 |
| 96 | Josh Downs | WR | 87.2 | 98.0 | +11 | ECR 87 x RULE |
| 97 | Bo Nix | QB | 99.3 | 99.0 | -0 | ECR 99 |
| 98 | Aaron Jones Sr. | RB | 115.8 | 100.0 | -16 | ECR 116; name; RB earlier |
| 99 | Quentin Johnston | WR | 95.8 | 100.5 | +5 | ECR 96 |
| 100 | Jacory Croskey-Merritt | RB | 113.7 | 101.0 | -13 | ECR 114; listed WAS RB1 |
| 101 | Kenny Gainwell | RB | 100.1 | 104.0 | +4 | ECR 100 |
| 102 | Brock Purdy | QB | 96.5 | 105.0 | +8 | ECR 96.5; FP 'overlooked' |
| 103 | Michael Wilson | WR | 88.4 | 105.5 | +17 | C WR40; ECR 88 x RULE |
| 104 | Jordan Mason | RB | 115.7 | 106.0 | -10 | ECR 116; Karabell #44 |
| 105 | Dalton Kincaid | TE | 112.4 | 106.5 | -6 | ECR 112 |
| 106 | Blake Corum | RB | 112.1 | 108.0 | -4 | ECR 112; RW value |
| 107 | Alec Pierce | WR | 100.3 | 108.5 | +8 | ECR 100 |
| 108 | Jordan Addison | WR | 105.6 | 109.0 | +3 | ECR 106 |
| 109 | Jared Goff | QB | 106.4 | 110.0 | +4 | ECR 106 |
| 110 | Jayden Reed | WR | 104.2 | 110.5 | +6 | ECR 104; riser |
| 111 | Jonathon Brooks | RB | 90.8 | 111.0 | +20 | ECR 91 |
| 112 | Dallas Goedert | TE | 117.2 | 112.0 | -5 | ECR 117 |
| 113 | Justin Herbert | QB | 71.6 | 114.0 | +42 | FP: ESPN ADP QB15 vs ECR QB7, 58-pick gap => ~115-130; Y QB6 'Field's favorite' pulls it up a bit |
| 114 | Kyler Murray | QB | 112.8 | 115.5 | +3 | C QB17 / Y QB19; CBS/Yahoo 'R12' |
| 115 | Jake Ferguson | TE | 118.5 | 116.0 | -2 | ECR 118 |
| 116 | Kyle Monangai | RB | 117.0 | 117.0 | +0 | ECR 117 |
| 117 | Makai Lemon | WR | 109.7 | 118.0 | +8 | ECR 110 x RULE |
| 118 | KC Concepcion | WR | 118.1 | 119.0 | +1 | ECR 118 |
| 119 | Xavier Worthy | WR | 129.3 | 120.0 | -9 | Y#136 C WR46 |
| 120 | Tyler Allgeier | RB | 138.7 | 124.0 | -15 | ECR 139; listed ARI RB1 while Love hurt |
| 121 | Daniel Jones | QB | 148.0 | 134.0 | -14 | Y QB17 / C QB20; ECR 148 |
| 122 | Chris Godwin Jr. | WR | 76.5 | 146.8 | +70 | FP: verified ESPN ADP 146.8 |

## 2. Simulated availability — who survives to the user's picks

Room profiles: **RB-heavy** (RB ADP x0.86, WR x1.12), **balanced** (ESPN ADP as-is), **WR-savvy** (drafters blend 50% toward ECR and lean WR). 600 drafts each, 9 opponents with private noisy valuations (lognormal sd 0.16), max 1 QB / 1 TE each through R8. The user follows plan_v1's ladder literally (first available name). Percent = probability the player is still on the board when the user is on the clock.

### League A — pick 2 (picks 2 / 19 / 22 / 39 / 42 / 59 / 62 / 79)

| Pick | Plan's named targets | RB-heavy | balanced | WR-savvy | Verdict |
|---|---|---|---|---|---|
| 2 | Gibbs / Bijan | Gibbs 56, Bijan 53 | Gibbs 62, Bijan 50 | Gibbs 63, Bijan 83 | Realistic. Yates has Bijan #1: expect Bijan to go 1.01 ~40-50% of the time. |
| 19 | Jefferson, London, AJB, McBride, Collins, Achane, C.Brown, Olave, Cook, Rice, Pickens | Jefferson 17, London 92, AJB 100, McBride 41, Collins 100, Achane 0, C.Brown 83, Olave 100, Cook 0, Rice 96, Pickens 100 | Jefferson 0, London 60, AJB 96, McBride 20, Collins 99, Achane 0, C.Brown 94, Olave 99, Cook 0, Rice 81, Pickens 100 | Jefferson 0, London 0, AJB 14, McBride 29, Collins 38, Achane 1, C.Brown 78, Olave 64, Cook 0, Rice 62, Pickens 86 | **Jefferson, Achane, Cook are fantasy (ESPN 10-15)**. London is a coin flip. AJB/Collins/Olave/Pickens are near-locks in casual rooms. Chase Brown (ESPN 26.2) is the one RB that DOES fall. |
| 22 | McBride, then the WR list, Achane/C.Brown "if they fall" | McBride 13, AJB 92, Collins 99, Olave 99, Rice 85, Pickens 100, C.Brown 52, D.Smith 100, Nabers 100 | McBride 4, AJB 52, Collins 95, Olave 97, Rice 55, Pickens 98, C.Brown 81, D.Smith 100, Nabers 98 | McBride 1, Collins 5, Olave 34, Rice 36, Pickens 66, C.Brown 33, D.Smith 96, Nabers 80 | **McBride at 22 is ~5%** (Bowers/McBride go 14-18 on ESPN). WR2 is a buffet in casual rooms. |
| 39 | D.Smith, Rice, G.Wilson, Flowers, Higgins, McMillan, Loveland; RB only if Jeanty/Walker/Henry/Hall fall | D.Smith 67, G.Wilson 68, Flowers 82, Higgins 100, McMillan 84, Loveland 80, Egbuka 99; Jeanty/Walker/Henry/Hall 0 | D.Smith 21, G.Wilson 28, Flowers 44, Higgins 97, McMillan 57, Loveland 77, Egbuka 96; RBs 0 | D.Smith 0, G.Wilson 2, Flowers 3, Higgins 65, McMillan 15, Loveland 67, Hall 34, Egbuka 72 | DeVonta (ESPN 39.4) is a coin flip at 39 only in RB-heavy rooms. **Jeanty/Walker/Henry/Hall never fall (ESPN 17-31)** — delete that clause. Loveland (45.3) is a real option here. |
| 42 | same pool + Egbuka, McConkey, Waddle, Allen "if there" | D.Smith 0, G.Wilson 30, Flowers 62, Higgins 97, McMillan 72, Egbuka 98, McConkey 95, Waddle 89, Allen 0, Loveland 67 | D.Smith 0, G.Wilson 2, Flowers 8, Higgins 68, McMillan 37, Egbuka 89, McConkey 76, Waddle 65, Allen 0, Loveland 61 | all WR1-2 names <5; Higgins 2, Egbuka 55, McConkey 18, Loveland 34 | **DeVonta cannot be a R5 name (0%)**; Allen 0%. Higgins/Egbuka/McConkey/Waddle are the realistic R5 WRs — and they are ALSO there at 59 (see below), which is the whole point. |
| 59 | RB2 tier: Skattebo, Irving, Price, Judkins, Kyren, Javonte, Etienne, Montgomery, Swift | **all 0 except Price 25** | all 0-5 except Price 78 | Skattebo 12, Irving 41, Price 97, Judkins 43, Montgomery 62, Swift 34 | **The R6 "RB2 tier" does not exist in an ESPN room.** ESPN ADPs 34-53. The user ended up taking Burden/Higgins/Egbuka here in most sims — i.e. WR4 with no RB2. |
| 62 | Lloyd, Henderson, Tuten, Stevenson; or WR4 (Burden, Odunze, Jamo, Adams, DJ Moore) | Lloyd 97, Henderson 28, Tuten 0, Stevenson 57, Burden 40, Odunze 85, Jamo 93, Adams 1, Moore 59 | Lloyd 100, Henderson 80, Stevenson 94, Burden 19, Odunze 60, Jamo 76, Adams 0, Moore 23 | Lloyd 100, Henderson 96, Tuten 54, Stevenson 99, Odunze 18, Jamo 18 | Lloyd is there every time (and ~75-85% at 79). Stevenson/Henderson are the realistic R7 RBs. Adams (ESPN 46) and Tuten (50) are gone. |
| 79 | Herbert, Lawrence, Mahomes, Stafford, Caleb, Burrow, Dak | Herbert 100, Lawrence 98, Mahomes 86, Stafford 72, Caleb 91, Burrow 2, Dak 97 | Herbert 100, Lawrence 95, Mahomes 79, Stafford 59, Caleb 86, Burrow 1, Dak 91 | Herbert 97, Lawrence 86, Mahomes 96, Stafford 95, Caleb 67, Dak 89 | Herbert (ESPN ~114) is a lock here **and ~85% at 99**: R8 is a round early for him in a 4-pt league. Burrow is gone (ESPN 58). |

### League B — pick 4 (picks 4 / 17 / 24 / 37 / 44 / 57 / 64 / 77)

| Pick | Plan's named targets | RB-heavy | balanced | WR-savvy | Verdict |
|---|---|---|---|---|---|
| 4 | Gibbs > Bijan > Chase > JSN > Nacua > CMC; "take Chase" | Gibbs 3, Bijan 2, Chase 55, JSN 98, Nacua 94, CMC 57 | Gibbs 5, Bijan 2, Chase 39, JSN 96, Nacua 89, CMC 73 | Gibbs 11, Bijan 28, Chase 13, JSN 89, Nacua 64, CMC 98 | Chase (Yates #4) is gone more often than not. **Plan for JSN (or Nacua) at 4**, not Chase. CMC is there 57-98% — ESPN rooms take him 3-5. |
| 17 | Taylor, Achane, C.Brown, Cook, Jeanty; else Jefferson/London/AJB/Collins; McBride | Taylor 0, Achane 0, C.Brown 91, Cook 0, Jeanty 48, Jefferson 41, London 98, AJB 100, Collins 100, McBride 64 | Taylor 0, Achane 0, C.Brown 98, Jeanty 73, Jefferson 3, London 78, AJB 99, Collins 99, McBride 45 | Achane 5, C.Brown 90, Jeanty 98, London 4, AJB 36, Collins 65, McBride 52 | Taylor/Achane/Cook are 0%. **Chase Brown is the R2 RB (90-98%)**, Jeanty second. McBride is a real option at 17 (45-64%), NOT at 24. |
| 24 | McBride/Bowers or WR; Allen "not expected" | McBride 2, Bowers 0, **Allen 64**, London 34, AJB 86, Collins 96, Olave 98, Rice 57, Pickens 100, D.Smith 100 | McBride 2, Allen 51, London 11, AJB 69, Collins 89, Olave 91, Rice 26, Pickens 98, D.Smith 100 | Allen 71, Pickens 48, Rice 18, Olave 16, D.Smith 92 | **Allen IS there half the time or more** (ESPN rooms take QBs late) — the plan is too pessimistic. TEs are gone. |
| 37 | Maye or Allen "if there"; else DeVonta/Rice/G.Wilson/Flowers/Higgins/McMillan | Maye 98, Allen 0, D.Smith 80, G.Wilson 82, Flowers 90, Higgins 100, McMillan 94 | Maye 94, D.Smith 40, G.Wilson 45, Flowers 66, Higgins 100, McMillan 72 | Maye 88, D.Smith 0, Higgins 81, McMillan 32 | **Maye at 37 is 88-98%, make it the default, not a conditional.** |
| 44 | WR3 or Lamar "if there" | Lamar 10, D.Smith 28, G.Wilson 37, Flowers 56, Higgins 98, McMillan 62, Egbuka 97, McConkey 91, Waddle 82 | Lamar 4, D.Smith 3, G.Wilson 6, Flowers 14, Higgins 90, McMillan 23, Egbuka 80, McConkey 69, Waddle 51 | Lamar 3, Higgins 31, Egbuka 38 | Lamar is a 4-10% event: remove. Higgins/Egbuka/McConkey are the pick. |
| 57 | RB2 tier (same nine) | all 0 except Price 35 | all 0-13 except Price 86 | Skattebo 27, Irving 54, Price 98, Judkins 52, Montgomery 67, Swift 45 | Same critical flaw as League A. |
| 64 | Lloyd / Henderson / Tuten / Stevenson or WR4 | Lloyd 96, Henderson 18, Stevenson 45, Odunze 80, Jamo 90, Moore 48 | Lloyd 100, Henderson 75, Stevenson 90, Odunze 50, Jamo 69 | Lloyd 100, Henderson 92, Tuten 40, Stevenson 98 | Fine. |
| 77 | Stafford, Mahomes, Lawrence, Dak, Herbert, Burrow | **Stafford 66**, Mahomes 82, Lawrence 98, Dak 96, Herbert 100, Burrow 1 | **Stafford 49**, Mahomes 77, Lawrence 92, Dak 93, Herbert 99 | Stafford 95, Mahomes 96, Lawrence 89, Dak 87, Herbert 96 | **Stafford is a coin flip at 77 in casual rooms** — ESPN ADP is QB8 (~76), not ECR 104. If he is the plan's "biggest value", he has to be taken at 64. |

### Where plan_v1 is too optimistic
- R2/R3 (both leagues): Jefferson, Achane, Cook, Taylor, McBride/Bowers at 19-24. ESPN prices: 8-18.
- R4: "RB only if Jeanty/Walker/Henry/Hall fall" — they are ESPN 17-31; 0% at 39.
- R5: DeVonta Smith (39.4) listed again at 42/44 — 0-3%. Lamar at 44 — 3-10%.
- R6: the entire "RB2 tier" (Skattebo 44, Judkins 47, Irving 51, Swift 52, Montgomery 53, Kyren 34, Javonte 32, Etienne 38 on ESPN) at 57/59 — 0-5% in casual rooms.
- R7: Tuten (50) and Adams (46) as fallbacks — gone.
- R8 (B): Stafford at 77 — ~50-66%.
- R10-11 fallback: Dart (ESPN staff QB7 => room takes him ~88) is gone before 99; Burrow gone by 58.
- B R1: "take Chase" — Chase survives to 4 only 13-55%.

### Where plan_v1 is too pessimistic
- Josh Allen at 24 (B): 51-71% available. Even at 22 (A, WR-savvy room) 0%, but in casual rooms he lasts to the R3 turn.
- Chase Brown at 17/19: 78-98%. ESPN's own ADP (26.2) is the ONE top-15 RB discount; the plan says "ESPN rooms rarely let them fall".
- Maye at 37: 88-98%.
- Loveland at 39/42: 61-80% in casual rooms (ESPN ADP 45.3 is 8 picks behind ECR).
- Herbert at 79: 97-100%; ~85% at 99.
- Lloyd at 62/64: 96-100%; the printed-sheet room does not know.
- A.J. Brown / Collins / Olave / Pickens at 22: 85-100% in casual rooms. The R2/R3 WR pool is deeper than the plan fears, which is exactly why RB2 should NOT wait until R6.

## 3. ESPN arbitrage

### BUY list — ESPN price >= board rank + 10 (take them a round later than the board says)

| Player | pos | board A/B | ECR | est ESPN | gap (A) | Target |
|---|---|---|---|---|---|---|
| Chris Godwin | WR | 86/89 | 76.5 | **146.8** (verified) | +61 | R14-15 (139/142), not R11 |
| Justin Herbert | QB | 60/57 | 71.6 | ~114 (QB15 verified) | +54 | R9-10 (82/99 in A; 84/97 in B) |
| MarShawn Lloyd | RB | 56/61 | 179 (stale) | ~96 (Clay RB33; sheet says ~180) | +40 | R7 (62/64) if RB2 is still missing; otherwise R8 (79/77) — 75-85% survival |
| Tee Higgins | WR | 30/33 | 36.9 | 55 | +25 | R5-6 (42-59) |
| Michael Wilson | WR | 85/87 | 88.4 | ~105 (Clay WR40) | +20 | R11-12 (102-119) |
| Kyler Murray | QB | 96/98 | 112.8 | ~115 (R12) | +20 | R12 (119/117); ~85% at 102 |
| Caleb Williams | QB | 67/65 | 67.1 | ~85 | +18 | R9 (82/84) |
| Trevor Lawrence | QB | 74/63 | 77.8 | ~92 | +18/+29 | R9-10 |
| DeVonta Smith | WR | 22/23 | 24.0 | **39.4** (verified) | +17 | R4 exactly (39/37); never R5 |
| Daniel Jones | QB | 117/117 | 148 | ~134 (Y QB17/C QB20) | +17 | R14 |
| Jadarian Price | RB | 52/55 | 73.2 | ~68 | +16 | R6-7 (59/57 or 62/64) — the only board RB2 that survives R6 |
| Jameson Williams | WR | 54/59 | 54.7 | ~70 (Y#80) | +16 | R7 |
| Christian Watson | WR | 64/69 | 57.6 | ~80 (WR36 verified) | +16 | R8 |
| Luther Burden III | WR | 45/47 | 47.0 | ~60 | +16 | R6 |
| DJ Moore | WR | 46/48 | 52.1 | ~61 | +15 | R6-7 |
| Nico Collins | WR | 14/14 | 16.0 | ~28 (12 picks later, verified) | +14 | R3 (22/24) |
| A.J. Brown | WR | 12/12 | 14.2 | ~25.5 (ESPN slot article: R2 at 19) | +14 | R2-3 |
| Ladd McConkey | WR | 35/37 | 34.9 | ~49 | +14 | R5 |
| Emeka Egbuka | WR | 39/40 | 40.8 | ~52 | +14 | R5-6 |
| Zay Flowers | WR | 29/32 | 30.3 | ~42 (Y#42) | +13 | R4-5 |
| Colston Loveland | TE | 33/35 | 37.4 | **45.3** (verified) | +12 | R4-5 (39-44) |
| Garrett Wilson | WR | 28/30 | 29.6 | ~40 | +12 | R4 |
| George Pickens | WR | 20/21 | 20.4 | ~31.5 | +12 | R3 |
| Chris Olave | WR | 18/18 | 18.0 | ~29 | +11 | R3 |
| TreVeyon Henderson | RB | 61/67 | 71.0 | ~72 (verified ~75) | +11 | R7 (62/64) |
| Drake Maye | QB | 38/25 | 37.7 | ~48 | +10/+23 | R4 (37) in League B; R5 in A only if you want a QB that early (you don't) |
| Chase Brown | RB | 16/16 | 17.9 | **26.2** (verified, RotoWire) | +8 (just under threshold, but the only RB1-tier discount) | R2 (17/19) |

### DO-NOT-REACH list — ESPN price <= board rank - 10 (the room will take them before your board says; do not pay the room's price)

| Player | pos | board A/B | ECR | est ESPN | gap | Note |
|---|---|---|---|---|---|---|
| Jeremiyah Love | RB | 43/44 | 41.4 | ~25 | -18 | FantasyPros: most overvalued on ESPN (67%). Never there at 39. |
| Omarion Hampton | RB | 34/36 | 25.6 | ~19.5 | -14 | Gone by 22. |
| Derrick Henry | RB | 25/27 | 37.7 | ~19 | -6 (vs board) / -19 (vs ECR) | Yates #11; goes late R2. |
| Breece Hall | RB | 37/38 | 39.9 | ~31 | -6 / -9 | ESPN pushes him R2-3. |
| Bhayshul Tuten | RB | 65/70 | 67.2 | ~50 (Y#50) | -15 | Not a R7 fallback. |
| Chuba Hubbard | RB | 99/101 | 98.9 | ~65 (Y#66) | -34 | Not a R10 RB4; gone by R7. |
| Josh Jacobs | RB | 91/105 | 46.9 | ~63 (printed ~33) | -28 | Someone in the room will take him R5-7 off the sheet. Let them. |
| DK Metcalf | WR | 80/83 | 78.9 | ~66 | -14 | Name value. |
| Travis Kelce | TE | 100/102 | 98.5 | ~88 | -12 | Name value. |
| Sam LaPorta | TE | 88/91 | 85.8 | ~78 | -10 | |
| Aaron Jones | RB | 167 | 115.8 | ~100 | -67 | Name value; irrelevant to plan. |
| Davante Adams | WR | 48/50 | 50.1 | ~46 | -2 (board) | FP: only top-50 WR going earlier than ECR on ESPN. Not a R7 fallback (0% at 62). |
| Jaxson Dart | QB | 95/97 | 97.5 | ~88 (ESPN staff QB7) | -7 | Do not plan on him as a R10-11 fallback; ESPN readers grab him R8-9. |
| Matthew Stafford | QB | 78 (A) / 39 (B) | 104.3 | ~76 (QB8 verified) | +2 (A) / -37 (B) | Not an arbitrage in either league: the room prices the MVP at his League-B value. In B, 64 is the price; in A he is a fair R8 QB, nothing more. |
| Kyler Murray, Daniel Jones, Michael Wilson | | | | | | See BUY list — all cheaper than the board. |

## 4. In-person tactics (reading the room)

1. **Score the room in Round 1 and pick the ladder.** Count RBs in picks 1-10. 6+ RBs (typical ESPN room: Bijan/Gibbs/CMC/Taylor/Achane/Cook + Henry/Walker in R2) => use the RB-heavy row above: WRs will be there at 22 and 39 (AJB/Collins/Olave/Pickens 85-100%), so **spend 19 on the RB that falls (Chase Brown / Jeanty / Walker) and 22/39 on WRs**, then RB2 at 42. 4 or fewer RBs in R1 => WR-savvy room: WR1s vanish by 22 (Collins 5%, AJB 0%), but Irving/Judkins/Montgomery/Swift survive to 59 (34-62%) — the plan's ladder works as written only in THIS room.
2. **The 19/22 turn (only slot 1 picks between you, twice).** Before pick 19, look at slot 1's R1 pick. Slot 1 took Bijan/Gibbs => he takes WR + (WR or RB) at 20-21. Whatever you want most from a pair of targets, take the one slot 1 is more likely to want at 19 and collect the survivor at 22. Concretely: with London + Chase Brown + AJB on the board, slot 1 (with an RB) takes London and AJB; so take Chase Brown at 19 only if you're OK with Collins/Olave at 22 — or take London at 19 and expect AJB OR Chase Brown at 22 (one of the two survives >90% in casual rooms). Never take at 19 a player the room prices behind 22 (DeVonta 39, Higgins 55, Loveland 45).
3. **Pick 4's 17/24 gap is 6 picks (slots 3,2,1,1,2,3): treat them as independent.** Do not "wait" for anyone between 17 and 24 unless his ESPN price is >= 30 (Collins 28, Olave 29, Pickens 31.5, Nabers 30 are the only R2-priced names that survive to 24 at >=85%).
4. **Runs: never chase the tail; take the front of the next run.** QB run on ESPN starts after Allen (24) and Lamar (38): Maye 48 / Burrow 58 / Hurts 60 / Daniels 62 go inside two rounds. If you want Maye in League B, he is a pick-37 decision (88-98%), not a pick-44 decision. TE: Bowers/McBride R2, then Loveland (45)/Warren (54), then nothing until Kraft (76)/LaPorta (78). RB run #2 on ESPN is picks 44-53 (Skattebo, Judkins, Tuten, Irving, Swift, Montgomery): that is the window for RB2, i.e. your 42/44 pick, one round before the plan's 59/57.
5. **The Jacobs test (Lloyd timing).** Before R5 say out loud "did anyone see the Jacobs thing?" If two or more people react, the room knows: take Lloyd at 62/64. If nobody reacts, Lloyd is a 79/77 pick and 62/64 goes to Stevenson/Henderson/Jamo/Odunze. Same test works for Nabers (Karabell DND; Week 1 doubt): a quiet room takes him ~30; a loud room lets him fall to 39.
6. **Bring the ESPN list and cross names off it — it IS the predictive model.** Casual drafters take the top uncrossed name on their sheet at the position they need. If the top three uncrossed names on the ESPN sheet at pick N+1 are all RBs, WRs survive; if they're WRs, RBs survive. Re-read the sheet every time you're 3 picks out.

## 5. Findings and fixes (severity-ranked)

1. **CRITICAL — the R6 "RB2 tier" does not survive to 59/57 in an ESPN room.** Skattebo (44), Judkins (47), Irving (51), Swift (52), Montgomery (53), Kyren (34), Javonte (32), Etienne (38) are all gone in RB-heavy and balanced rooms (0-5%); only Price (68) survives. In 600 sims the plan's literal ladder produced a team with WR4 and no RB2 at 59 most of the time. Fix: swap R5 and R6. **R5 (42/44) = RB2 from Skattebo / Judkins / Irving / Swift / Montgomery / Tuten** (50-98% availability, and the 3-WR structural goal is still met by R6 because Higgins 55 / Egbuka 52 / McConkey 49 / Burden 60 / DJ Moore 61 / Jamo 70 slide to 59). R6 = WR3 from that slide pool. R7 = Lloyd/Stevenson/Henderson or Price. This is the single biggest ESPN-specific edge: the room pays a round early for RBs, so you buy the WRs it drops, but you must still get one RB before the room's second RB run (44-53).
2. **HIGH — R2/R3 lists contain 5 names that are 0-20% at 19-24: Jefferson (ESPN 15), Achane (8.5), Cook (10.5), Taylor (7), McBride (18)/Bowers (14).** Fix: strike them (leave Jefferson as "if he slides past 15, take him at 19"). Real R2/R3 order in League A: London (60-92%) > Chase Brown (78-94%, ESPN 26.2 verified) > A.J. Brown (ESPN slot article: expected at 19) > Collins > Olave > Pickens > Rice. Make Chase Brown at 19 the explicit RB-heavy-room play (Finding 1 depends on it). "Exit R3 with RB1 + two of (elite WR / McBride)" => "RB1 + WR1 + (WR2 or Chase Brown)".
3. **HIGH — DeVonta Smith (ESPN ADP 39.4, verified) is listed at both 39/37 and 42/44.** He is 0-3% at 42/44 and a coin flip at 39 (21-67%). Fix: he is a pick-39/37 name only; replace him in the R5 list with Loveland (45.3, 61-80% at 42) / Higgins / Egbuka / McConkey. Also delete "RB only if Jeanty/Walker/Henry/Hall fall" (0% in every room; ESPN 17-31).
4. **HIGH (League B) — Stafford is not an ESPN arbitrage.** ECR QB15 but ESPN ADP QB8 (FantasyPros overvalued list, Aug) => ~76; 49-66% at 77 in casual rooms. Board B rank 39 vs plan pick 77 is internally inconsistent. Fix: B ladder becomes **Maye at 37 (88-98%) as the default QB**; if Maye is gone, Stafford at 64 (R7, ~96%) and Lloyd/RB at 77; never both. If Maye is taken at 37, R8 (77) is RB/WR, not a QB, and the "Stafford at 38 ceiling pick" line is deleted.
5. **HIGH (League A) — Herbert at 79 wastes a round.** ESPN QB15 (~114; 58-pick gap verified): 97-100% at 79, ~85% at 99. Fix: R8 (79) = WR4/RB3 (Jamo 76-93%, Odunze 60-85%, Stevenson, Henderson), **R9-10 (82/99) = Herbert**, fallback Lawrence (92) / Caleb (85) / Dak (90) / Kyler (115 at 119). Note the counter-risk: Yates lists Herbert as a "Field's favorite" and Karabell has him QB8 — a Yates-reader in the room takes him R8-9; in a room where someone visibly reads ESPN articles, take him at 82.
6. **MEDIUM — Dart is not a R10-11 fallback.** ESPN staff (Clay QB7, Yates QB7) put him on the printed sheet at QB7 => the room takes him ~88, before Herbert. Fix: fallback QBs are Kyler (115), Purdy (105), Nix (99), Daniel Jones (134), not Dart. Also Burrow (ESPN 58) is gone by R8 in every sim — remove from the R8 list.
7. **MEDIUM (League B) — Allen at 24 is too pessimistic, Lamar at 44 too optimistic.** Allen 51-71% at 24 (ESPN rooms take QBs late); Lamar 3-10% at 44. Fix: R3 (24) = "Allen if there (expect ~60%), else Collins/AJB/Olave/Pickens"; delete Lamar from R5; if Allen is taken at 24, R4 (37) is WR, not Maye.
8. **MEDIUM (League B) — pick 4 expectation.** Chase (Yates #4) survives to 4 only 13-55%; JSN 89-98%, Nacua 64-94%, CMC 57-98%. Fix: write "expect JSN; Chase is the bonus", and decide now between JSN and Nacua (suspension review) so no clock panic.
9. **MEDIUM — Lloyd's price on the board (56/61) is a reach against the room, not against the sheet.** He is 96-100% at 62/64 and ~75-85% at 79/77 (Clay RB33 ≈ 95 is the ceiling price; most printed sheets say ~180). Fix: keep him on the R7 line but only when RB2 is still open after Finding 1's swap; otherwise R8. Use the Jacobs test (tactic 5). Do not take him at 59.
10. **MEDIUM — Jacobs will be drafted by someone else off the printed sheet (RB15-26 on ESPN's list) around picks 55-70.** Plan says he is an IR-stash for League A at R14 — he will not be there. Fix: drop Jacobs from R14; the IR slot goes to Tyson/Conner/Charbonnet as listed.
11. **LOW — Godwin (ESPN 146.8) belongs at R14-15, not R11.** He is a value only if taken at 139/142; at 102 you are paying 45 picks over the room. Michael Wilson (~105) is right at R11 (102) but also fine at 119. Kyler (~115) is ~50% at 119; if he is the QB plan in League A, 102 is safer.
12. **LOW — R7 fallbacks Tuten (ESPN 50) and Adams (46) are 0-1% at 62.** Replace with Jamo (70), Odunze (66), DJ Moore (61), Stevenson (77).
13. **LOW — Chase (WR) at 1.03 in A: irrelevant to pick 2, but note the room order at 1.01 is Bijan ~45% / Gibbs ~55%**, so "If Gibbs goes 1.01, Bijan" is correct and will trigger about half the time.
14. **LOW — evidence gap.** No numeric ESPN ADP exists in this file for Collins, Lloyd, Dart, Kyler, Jones, M. Wilson, Price, Stevenson; their rows are modelled (staff rank + skew) and carry roughly +/-10 picks of uncertainty. The verified anchors (D. Smith 39.4, Loveland 45.3, Jeanty 17.7, C. Brown 26.2, Godwin 146.8, Herbert QB15, Stafford QB8, Watson WR36, Henry ~19) all point the same direction as the model, so the structural conclusions (Findings 1-5) do not depend on the unverified rows.

## 6. Revised ladders implied by the findings (for plan_v2)

League A (pick 2): 2 Gibbs/Bijan -> 19 London / Chase Brown / AJB (RB-heavy room: Chase Brown) -> 22 AJB / Collins / Olave / Pickens -> 39 DeVonta (if there) / Flowers / G. Wilson / Loveland -> **42 RB2: Skattebo / Judkins / Irving / Swift / Montgomery / Tuten** -> 59 WR3: Higgins / Egbuka / McConkey / Burden / DJ Moore -> 62 Lloyd (if RB2 still open or room knows) else Jamo / Odunze / Stevenson / Henderson / Price -> 79 WR4/RB3 -> 82 Herbert (99 if the room is quiet on QBs) -> rest as plan.

League B (pick 4): 4 JSN (Chase if there) -> 17 Chase Brown / Jeanty / McBride (45-64%) -> 24 Allen (~60%) else Collins / AJB / Olave -> 37 Maye (if no Allen) else WR -> **44 RB2 (same pool)** -> 57 WR3 (slide pool) -> 64 Stafford (only if no Allen/Maye) else Lloyd / Stevenson / Henderson -> 77 RB3/WR4 (Lloyd if still there) -> rest as plan.

## Appendix — raw simulator output

```
### League A (pick 2), room = RB-heavy
- pick 2: Jahmyr Gibbs 56%, Bijan Robinson 53%
    user most often took: [('Jahmyr Gibbs', 339), ('Bijan Robinson', 261)]
- pick 19: Justin Jefferson 17%, Drake London 92%, A.J. Brown 100%, Trey McBride 41%, Nico Collins 100%, De'Von Achane 0%, Chase Brown 83%, Chris Olave 100%, James Cook III 0%, Rashee Rice 96%, George Pickens 100%
    user most often took: [('Drake London', 463), ('Justin Jefferson', 101), ('A.J. Brown', 36)]
- pick 22: Trey McBride 13%, Justin Jefferson 0%, Drake London 10%, A.J. Brown 92%, Nico Collins 99%, Chris Olave 99%, Rashee Rice 85%, George Pickens 100%, De'Von Achane 0%, Chase Brown 52%, DeVonta Smith 100%, Malik Nabers 100%
    user most often took: [('A.J. Brown', 424), ('Trey McBride', 78), ('Drake London', 61), ('Nico Collins', 37)]
- pick 39: DeVonta Smith 67%, Rashee Rice 0%, Garrett Wilson 68%, Zay Flowers 82%, Tee Higgins 100%, Tetairoa McMillan 84%, Colston Loveland 80%, Ashton Jeanty 0%, Kenneth Walker III 0%, Derrick Henry 0%, Breece Hall 0%, Emeka Egbuka 99%
    user most often took: [('DeVonta Smith', 402), ('Garrett Wilson', 148), ('Zay Flowers', 44), ('Tee Higgins', 6)]
- pick 42: DeVonta Smith 0%, Garrett Wilson 30%, Zay Flowers 62%, Tee Higgins 97%, Tetairoa McMillan 72%, Emeka Egbuka 98%, Ladd McConkey 95%, Jaylen Waddle 89%, Josh Allen 0%, Colston Loveland 67%
    user most often took: [('Zay Flowers', 262), ('Garrett Wilson', 181), ('Tee Higgins', 149), ('Tetairoa McMillan', 8)]
- pick 59: Cam Skattebo 0%, Bucky Irving 0%, Jadarian Price 25%, Quinshon Judkins 0%, Kyren Williams 0%, Javonte Williams 0%, Travis Etienne Jr. 0%, David Montgomery 0%, D'Andre Swift 0%
    user most often took: [('Luther Burden III', 169), ('Jadarian Price', 149), ('Tee Higgins', 131), ('Emeka Egbuka', 80)]
- pick 62: MarShawn Lloyd 97%, TreVeyon Henderson 28%, Bhayshul Tuten 0%, Rhamondre Stevenson 57%, Luther Burden III 40%, Rome Odunze 85%, Jameson Williams 93%, Davante Adams 1%, DJ Moore 59%
    user most often took: [('MarShawn Lloyd', 584), ('Rhamondre Stevenson', 12), ('TreVeyon Henderson', 2), ('Rome Odunze', 1)]
- pick 79: Justin Herbert 100%, Trevor Lawrence 98%, Patrick Mahomes II 86%, Matthew Stafford 72%, Caleb Williams 91%, Joe Burrow 2%, Dak Prescott 97%, Luther Burden III 0%, Rome Odunze 12%, Jameson Williams 28%, Davante Adams 0%, DJ Moore 2%
    user most often took: [('Justin Herbert', 600)]

### League A (pick 2), room = balanced
- pick 2: Jahmyr Gibbs 62%, Bijan Robinson 50%
    user most often took: [('Jahmyr Gibbs', 374), ('Bijan Robinson', 226)]
- pick 19: Justin Jefferson 0%, Drake London 60%, A.J. Brown 96%, Trey McBride 20%, Nico Collins 99%, De'Von Achane 0%, Chase Brown 94%, Chris Olave 99%, James Cook III 0%, Rashee Rice 81%, George Pickens 100%
    user most often took: [('Drake London', 360), ('A.J. Brown', 230), ('Nico Collins', 5), ('Trey McBride', 3)]
- pick 22: Trey McBride 4%, Justin Jefferson 0%, Drake London 0%, A.J. Brown 52%, Nico Collins 95%, Chris Olave 97%, Rashee Rice 55%, George Pickens 98%, De'Von Achane 0%, Chase Brown 81%, DeVonta Smith 100%, Malik Nabers 98%
    user most often took: [('A.J. Brown', 309), ('Nico Collins', 255), ('Trey McBride', 22), ('Chris Olave', 14)]
- pick 39: DeVonta Smith 21%, Rashee Rice 0%, Garrett Wilson 28%, Zay Flowers 44%, Tee Higgins 97%, Tetairoa McMillan 57%, Colston Loveland 77%, Ashton Jeanty 0%, Kenneth Walker III 0%, Derrick Henry 0%, Breece Hall 0%, Emeka Egbuka 96%
    user most often took: [('Zay Flowers', 168), ('Tee Higgins', 159), ('Garrett Wilson', 144), ('DeVonta Smith', 126)]
- pick 42: DeVonta Smith 0%, Garrett Wilson 2%, Zay Flowers 8%, Tee Higgins 68%, Tetairoa McMillan 37%, Emeka Egbuka 89%, Ladd McConkey 76%, Jaylen Waddle 65%, Josh Allen 0%, Colston Loveland 61%
    user most often took: [('Tee Higgins', 355), ('Emeka Egbuka', 95), ('Tetairoa McMillan', 81), ('Zay Flowers', 48)]
- pick 59: Cam Skattebo 0%, Bucky Irving 2%, Jadarian Price 78%, Quinshon Judkins 0%, Kyren Williams 0%, Javonte Williams 0%, Travis Etienne Jr. 0%, David Montgomery 5%, D'Andre Swift 3%
    user most often took: [('Jadarian Price', 465), ('Luther Burden III', 51), ('DJ Moore', 37), ('Jameson Williams', 10)]
- pick 62: MarShawn Lloyd 100%, TreVeyon Henderson 80%, Bhayshul Tuten 0%, Rhamondre Stevenson 94%, Luther Burden III 19%, Rome Odunze 60%, Jameson Williams 76%, Davante Adams 0%, DJ Moore 23%
    user most often took: [('MarShawn Lloyd', 600)]
- pick 79: Justin Herbert 100%, Trevor Lawrence 95%, Patrick Mahomes II 79%, Matthew Stafford 59%, Caleb Williams 86%, Joe Burrow 1%, Dak Prescott 91%, Luther Burden III 0%, Rome Odunze 1%, Jameson Williams 6%, Davante Adams 0%, DJ Moore 0%
    user most often took: [('Justin Herbert', 600)]

### League A (pick 2), room = WR-savvy
- pick 2: Jahmyr Gibbs 63%, Bijan Robinson 83%
    user most often took: [('Jahmyr Gibbs', 379), ('Bijan Robinson', 221)]
- pick 19: Justin Jefferson 0%, Drake London 0%, A.J. Brown 14%, Trey McBride 29%, Nico Collins 38%, De'Von Achane 1%, Chase Brown 78%, Chris Olave 64%, James Cook III 0%, Rashee Rice 62%, George Pickens 86%
    user most often took: [('Chase Brown', 176), ('Nico Collins', 161), ('Trey McBride', 154), ('A.J. Brown', 82)]
- pick 22: Trey McBride 1%, Justin Jefferson 0%, Drake London 0%, A.J. Brown 0%, Nico Collins 5%, Chris Olave 34%, Rashee Rice 36%, George Pickens 66%, De'Von Achane 0%, Chase Brown 33%, DeVonta Smith 96%, Malik Nabers 80%
    user most often took: [('Chris Olave', 189), ('George Pickens', 176), ('Rashee Rice', 144), ('Chase Brown', 33)]
- pick 39: DeVonta Smith 0%, Rashee Rice 0%, Garrett Wilson 2%, Zay Flowers 3%, Tee Higgins 65%, Tetairoa McMillan 15%, Colston Loveland 67%, Ashton Jeanty 0%, Kenneth Walker III 0%, Derrick Henry 0%, Breece Hall 34%, Emeka Egbuka 72%
    user most often took: [('Tee Higgins', 374), ('Colston Loveland', 106), ('Tetairoa McMillan', 40), ('Breece Hall', 31)]
- pick 42: DeVonta Smith 0%, Garrett Wilson 0%, Zay Flowers 0%, Tee Higgins 2%, Tetairoa McMillan 3%, Emeka Egbuka 55%, Ladd McConkey 18%, Jaylen Waddle 11%, Josh Allen 0%, Colston Loveland 34%
    user most often took: [('Emeka Egbuka', 317), ('Colston Loveland', 74), ('Ladd McConkey', 58), ('Kyren Williams', 46)]
- pick 59: Cam Skattebo 12%, Bucky Irving 41%, Jadarian Price 97%, Quinshon Judkins 43%, Kyren Williams 0%, Javonte Williams 0%, Travis Etienne Jr. 0%, David Montgomery 62%, D'Andre Swift 34%
    user most often took: [('Jadarian Price', 299), ('Bucky Irving', 221), ('Cam Skattebo', 72), ('Quinshon Judkins', 5)]
- pick 62: MarShawn Lloyd 100%, TreVeyon Henderson 96%, Bhayshul Tuten 54%, Rhamondre Stevenson 99%, Luther Burden III 0%, Rome Odunze 18%, Jameson Williams 18%, Davante Adams 0%, DJ Moore 3%
    user most often took: [('MarShawn Lloyd', 600)]
- pick 79: Justin Herbert 97%, Trevor Lawrence 86%, Patrick Mahomes II 96%, Matthew Stafford 95%, Caleb Williams 67%, Joe Burrow 0%, Dak Prescott 89%, Luther Burden III 0%, Rome Odunze 0%, Jameson Williams 0%, Davante Adams 0%, DJ Moore 0%
    user most often took: [('Justin Herbert', 580), ('Trevor Lawrence', 17), ('Patrick Mahomes II', 3)]

### League B (pick 4), room = RB-heavy
- pick 4: Jahmyr Gibbs 3%, Bijan Robinson 2%, Ja'Marr Chase 55%, Jaxon Smith-Njigba 98%, Puka Nacua 94%, Christian McCaffrey 57%
    user most often took: [("Ja'Marr Chase", 322), ('Jaxon Smith-Njigba', 248), ('Jahmyr Gibbs', 18), ('Bijan Robinson', 12)]
- pick 17: Jonathan Taylor 0%, De'Von Achane 0%, Chase Brown 91%, James Cook III 0%, Ashton Jeanty 48%, Justin Jefferson 41%, Drake London 98%, A.J. Brown 100%, Nico Collins 100%, Trey McBride 64%
    user most often took: [('Chase Brown', 544), ('Ashton Jeanty', 37), ('Justin Jefferson', 14), ('Drake London', 5)]
- pick 24: Trey McBride 2%, Brock Bowers 0%, Josh Allen 64%, Justin Jefferson 0%, Drake London 34%, A.J. Brown 86%, Nico Collins 96%, Chris Olave 98%, Rashee Rice 57%, George Pickens 100%, DeVonta Smith 100%
    user most often took: [('Josh Allen', 380), ('A.J. Brown', 109), ('Drake London', 89), ('Trey McBride', 14)]
- pick 37: Drake Maye 98%, Josh Allen 0%, DeVonta Smith 80%, Rashee Rice 0%, Garrett Wilson 82%, Zay Flowers 90%, Tee Higgins 100%, Tetairoa McMillan 94%
    user most often took: [('Drake Maye', 587), ('DeVonta Smith', 11), ('Garrett Wilson', 2)]
- pick 44: Lamar Jackson 10%, DeVonta Smith 28%, Garrett Wilson 37%, Zay Flowers 56%, Tee Higgins 98%, Tetairoa McMillan 62%, Emeka Egbuka 97%, Ladd McConkey 91%, Jaylen Waddle 82%
    user most often took: [('DeVonta Smith', 160), ('Zay Flowers', 155), ('Garrett Wilson', 148), ('Tee Higgins', 74)]
- pick 57: Cam Skattebo 0%, Bucky Irving 0%, Jadarian Price 35%, Quinshon Judkins 0%, Kyren Williams 0%, Javonte Williams 0%, Travis Etienne Jr. 0%, David Montgomery 0%, D'Andre Swift 0%
    user most often took: [('Jadarian Price', 208), ('Tee Higgins', 196), ('Emeka Egbuka', 79), ('Luther Burden III', 51)]
- pick 64: MarShawn Lloyd 96%, TreVeyon Henderson 18%, Bhayshul Tuten 0%, Rhamondre Stevenson 45%, Luther Burden III 42%, Rome Odunze 80%, Jameson Williams 90%, Davante Adams 0%, DJ Moore 48%
    user most often took: [('MarShawn Lloyd', 573), ('TreVeyon Henderson', 9), ('Rhamondre Stevenson', 9), ('Rome Odunze', 4)]
- pick 77: Matthew Stafford 66%, Patrick Mahomes II 82%, Trevor Lawrence 98%, Dak Prescott 96%, Justin Herbert 100%, Joe Burrow 1%, Luther Burden III 2%, Rome Odunze 22%, Jameson Williams 38%, Davante Adams 0%
    user most often took: [('Matthew Stafford', 398), ('Patrick Mahomes II', 178), ('Trevor Lawrence', 24)]

### League B (pick 4), room = balanced
- pick 4: Jahmyr Gibbs 5%, Bijan Robinson 2%, Ja'Marr Chase 39%, Jaxon Smith-Njigba 96%, Puka Nacua 89%, Christian McCaffrey 73%
    user most often took: [('Jaxon Smith-Njigba', 327), ("Ja'Marr Chase", 230), ('Jahmyr Gibbs', 31), ('Bijan Robinson', 12)]
- pick 17: Jonathan Taylor 0%, De'Von Achane 0%, Chase Brown 98%, James Cook III 0%, Ashton Jeanty 73%, Justin Jefferson 3%, Drake London 78%, A.J. Brown 99%, Nico Collins 99%, Trey McBride 45%
    user most often took: [('Chase Brown', 586), ('Ashton Jeanty', 13), ('Drake London', 1)]
- pick 24: Trey McBride 2%, Brock Bowers 0%, Josh Allen 51%, Justin Jefferson 0%, Drake London 11%, A.J. Brown 69%, Nico Collins 89%, Chris Olave 91%, Rashee Rice 26%, George Pickens 98%, DeVonta Smith 100%
    user most often took: [('Josh Allen', 302), ('A.J. Brown', 200), ('Drake London', 45), ('Nico Collins', 43)]
- pick 37: Drake Maye 94%, Josh Allen 0%, DeVonta Smith 40%, Rashee Rice 0%, Garrett Wilson 45%, Zay Flowers 66%, Tee Higgins 100%, Tetairoa McMillan 72%
    user most often took: [('Drake Maye', 561), ('DeVonta Smith', 20), ('Garrett Wilson', 12), ('Zay Flowers', 6)]
- pick 44: Lamar Jackson 4%, DeVonta Smith 3%, Garrett Wilson 6%, Zay Flowers 14%, Tee Higgins 90%, Tetairoa McMillan 23%, Emeka Egbuka 80%, Ladd McConkey 69%, Jaylen Waddle 51%
    user most often took: [('Tee Higgins', 405), ('Zay Flowers', 75), ('Garrett Wilson', 33), ('Emeka Egbuka', 29)]
- pick 57: Cam Skattebo 0%, Bucky Irving 5%, Jadarian Price 86%, Quinshon Judkins 0%, Kyren Williams 0%, Javonte Williams 0%, Travis Etienne Jr. 0%, David Montgomery 13%, D'Andre Swift 8%
    user most often took: [('Jadarian Price', 495), ('Luther Burden III', 32), ('Bucky Irving', 30), ('David Montgomery', 14)]
- pick 64: MarShawn Lloyd 100%, TreVeyon Henderson 75%, Bhayshul Tuten 0%, Rhamondre Stevenson 90%, Luther Burden III 15%, Rome Odunze 50%, Jameson Williams 69%, Davante Adams 0%, DJ Moore 19%
    user most often took: [('MarShawn Lloyd', 598), ('TreVeyon Henderson', 2)]
- pick 77: Matthew Stafford 49%, Patrick Mahomes II 77%, Trevor Lawrence 92%, Dak Prescott 93%, Justin Herbert 99%, Joe Burrow 0%, Luther Burden III 0%, Rome Odunze 3%, Jameson Williams 11%, Davante Adams 0%
    user most often took: [('Matthew Stafford', 295), ('Patrick Mahomes II', 248), ('Trevor Lawrence', 53), ('Dak Prescott', 4)]

### League B (pick 4), room = WR-savvy
- pick 4: Jahmyr Gibbs 11%, Bijan Robinson 28%, Ja'Marr Chase 13%, Jaxon Smith-Njigba 89%, Puka Nacua 64%, Christian McCaffrey 98%
    user most often took: [('Jaxon Smith-Njigba', 303), ('Bijan Robinson', 160), ("Ja'Marr Chase", 73), ('Jahmyr Gibbs', 64)]
- pick 17: Jonathan Taylor 0%, De'Von Achane 5%, Chase Brown 90%, James Cook III 1%, Ashton Jeanty 98%, Justin Jefferson 0%, Drake London 4%, A.J. Brown 36%, Nico Collins 65%, Trey McBride 52%
    user most often took: [('Chase Brown', 517), ('Ashton Jeanty', 51), ("De'Von Achane", 31), ('James Cook III', 1)]
- pick 24: Trey McBride 4%, Brock Bowers 0%, Josh Allen 71%, Justin Jefferson 0%, Drake London 0%, A.J. Brown 1%, Nico Collins 8%, Chris Olave 16%, Rashee Rice 18%, George Pickens 48%, DeVonta Smith 92%
    user most often took: [('Josh Allen', 412), ('George Pickens', 53), ('Rashee Rice', 33), ('Chris Olave', 32)]
- pick 37: Drake Maye 88%, Josh Allen 0%, DeVonta Smith 0%, Rashee Rice 0%, Garrett Wilson 5%, Zay Flowers 8%, Tee Higgins 81%, Tetairoa McMillan 32%
    user most often took: [('Drake Maye', 528), ('Tee Higgins', 51), ('Zay Flowers', 7), ('Colston Loveland', 5)]
- pick 44: Lamar Jackson 3%, DeVonta Smith 0%, Garrett Wilson 0%, Zay Flowers 0%, Tee Higgins 31%, Tetairoa McMillan 1%, Emeka Egbuka 38%, Ladd McConkey 8%, Jaylen Waddle 5%
    user most often took: [('Tee Higgins', 180), ('Emeka Egbuka', 166), ('Colston Loveland', 91), ('Kyren Williams', 37)]
- pick 57: Cam Skattebo 27%, Bucky Irving 54%, Jadarian Price 98%, Quinshon Judkins 52%, Kyren Williams 0%, Javonte Williams 0%, Travis Etienne Jr. 1%, David Montgomery 67%, D'Andre Swift 45%
    user most often took: [('Bucky Irving', 240), ('Jadarian Price', 192), ('Cam Skattebo', 164), ('David Montgomery', 2)]
- pick 64: MarShawn Lloyd 100%, TreVeyon Henderson 92%, Bhayshul Tuten 40%, Rhamondre Stevenson 98%, Luther Burden III 0%, Rome Odunze 13%, Jameson Williams 14%, Davante Adams 0%, DJ Moore 1%
    user most often took: [('MarShawn Lloyd', 600)]
- pick 77: Matthew Stafford 95%, Patrick Mahomes II 96%, Trevor Lawrence 89%, Dak Prescott 87%, Justin Herbert 96%, Joe Burrow 0%, Luther Burden III 0%, Rome Odunze 0%, Jameson Williams 0%, Davante Adams 0%
    user most often took: [('Matthew Stafford', 571), ('Patrick Mahomes II', 29)]
```

import pandas as pd, json, re, unicodedata
O='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/'
m=pd.read_csv(O+'master.csv')

def norm(s):
    s=unicodedata.normalize('NFKD',str(s)).encode('ascii','ignore').decode().lower()
    s=s.replace("'","").replace(".","").replace("-"," ")
    s=re.sub(r"\b(jr|sr|ii|iii|iv|v)\b","",s)
    return re.sub(r"\s+"," ",s).strip()
m['key']=m.player.map(norm)
byname={k:r for k,r in zip(m.key,m.to_dict('records'))}

# ---------------- NOTES (evidence-backed, 2025 stats from nflverse weekly data; ECR = FantasyPros expert consensus 2026-08-28) ----------------
N={
'Jahmyr Gibbs':"22.5 ppg, 94 tgt, 243 car, 17 games; second-highest ceiling weeks of any RB (best-6 avg 38.5, behind only Taylor). Montgomery traded, Pacheco on IR: first true workhorse season. Age 24.",
'Bijan Robinson':"22.9 ppg, 103 tgt (2nd among RBs), 287 car, five 100-yd rush games. New HC Stefanski/Tua; hold-in resolved with record deal.",
"Ja'Marr Chase":"20.3 ppg in 2025 with Burrow hurt most of the year; 24.5 ppg in 2024. 185 tgt, 32% share. Knee 'tweak' Aug 25, limited but expected Wk 1.",
'Puka Nacua':"24.4 ppg (WR1), 166 tgt in 16 g, six 100-yd games. Open NFL conduct review, no ruling as of Sep 1: suspension risk is real but early-season only.",
'Jaxon Smith-Njigba':"22.0 ppg, 36% target share (best in NFL), nine 100-yd games, floor 19.8 (highest of any WR). Same QB (Darnold); OC Kubiak left for LV, replaced by Brian Fleury (same Shanahan-tree scheme). Age 24.",
'Amon-Ra St. Brown':"19.5 ppg, 172 tgt, 31% share, 11 TD, 17 games four straight years. Floor 13.7 with five 100-yd games; new OC Petzing.",
'Christian McCaffrey':"25.2 ppg (RB1 overall), 129 tgt, 311 car. Age 30.3 with 450 touches incl. playoffs; calf tightness in camp resolved, full participant. Age cliff is the only knock.",
'Jonathan Taylor':"22.5 ppg, 323 car, 18 TD (league high), five 100-yd games (+3 each in League A), highest ceiling weeks of any RB (best-6 38.7). Only 55 tgt. IND's Weeks 15-17 slate (@TEN, CIN, @CLE) is the softest RB playoff schedule on the board. Daniel Jones back from Achilles.",
'Justin Jefferson':"12.1 ppg (141 tgt, 30% share, 2 TD, 7.4 yds/target vs 9.95 in 2024; 19.1 ppg in 2024). TD rate will rebound (+1.5-2 ppg); the efficiency half depends on Kyler Murray. Range WR6-WR14, and ECR 9 already prices most of the rebound. Softest Weeks 15-17 WR slate in the NFL (DET, WAS, @NYJ).",
'CeeDee Lamb':"16.2 ppg in 13 g, 25% share with Pickens taking 23%. 17.9 ppg in 2024. Dak healthy; DAL allowed most points in NFL last year (shootouts).",
'Drake London':"17.5 ppg in 12 g, 30% share, 9.3 tgt/g. Tua replaces Penix; Stefanski offense. Missed 5 games in 2025.",
'A.J. Brown':"15.2 ppg, 30% share, best-6 avg 25.5. Traded to NE: Drake Maye (31 TD) and Diggs's 1,013 vacated yards. Age 29.",
'Trey McBride':"18.9 ppg = TE1 by 4 ppg over TE2; 169 tgt, 27% share, WR-like usage. Brissett replaces Kyler (Brissett threw to him at 8+ tgt/g in 2025 too).",
'Nico Collins':"15.4 ppg (18.1 in 2024), 25% share. Jayden Higgins (ACL) and Dell (IR) out: Collins is the only proven target in HOU. ESPN drafters take him ~12 picks later than experts.",
"De'Von Achane":"20.9 ppg, 85 tgt, 238 car, floor 16.6 (second only to McCaffrey). MIA's offense is Malik Willis throwing to Malik Washington / Tolbert / rookie Caleb Douglas: Achane is the whole offense, for better and worse. ESPN rooms take him ~pick 8.",
'Chase Brown':"17.2 ppg full season; 22.8 ppg over the last 6 with Burrow healthy (two 32-pt games); 88 tgt. ESPN ADP ~26: the one RB1-ceiling back that actually reaches pick 19-24.",
'James Cook III':"19.7 ppg, 309 car, nine 100-yd rushing games (+32 bonus pts in League A, most of any RB). Only 40 tgt: low PPR floor (10.7), high bonus ceiling. ESPN rooms take him ~pick 10.",
'Chris Olave':"17.0 ppg, 156 tgt, 29% share, led NFL in air yards. Rookie Tyson on IR ~2 months: target monopoly with Shough.",
'Brock Bowers':"14.9 ppg in 12 g (2025, injured); 15.6 ppg TE1 in 2024. Cousins + Kubiak scheme. TE2-4 tier is worth ~4 ppg over replacement.",
'George Pickens':"17.6 ppg, 137 tgt, 9 TD, best-6 avg 29.3. TD-dependent (9 of 137 tgt) with Lamb back healthy: ceiling real, share capped ~23%.",
'Rashee Rice':"19.0 ppg in 8 g, 9.8 tgt/g, 29% share. Mahomes back from ACL/LCL; Bieniemy OC. Has not played more than 8 games since 2023.",
'DeVonta Smith':"12.1 ppg, 113 tgt. A.J. Brown traded to NE: Smith is the only proven WR in PHI (Hurts, 25 TD). ESPN ADP ~39 = end of R4.",
'Saquon Barkley':"15.1 ppg in 2025 (24.6 in 2024), 280 car, 50 tgt, 4.07 YPC. Age 29.6 = RB cliff zone (top-20 RB seasons halve at 29).",
'Ashton Jeanty':"14.8 ppg, 266 car, 73 tgt, best-6 avg 24.8. Ankle sprain Aug 23, on the side Sep 1, HC 'optimistic' for Wk 1. Cousins/Kubiak upgrade over 2025.",
'Derrick Henry':"18.1 ppg, 307 car, eight 100-yd games (+29 bonus pts in A). Age 32.7; only 21 tgt (floor 11.2). New OC Doyle. Soft Weeks 15-17 (@PIT, CLE, @CIN). Age-cliff risk is extreme; ESPN takes him ~19.",
'Kenneth Walker III':"11.6 ppg in SEA committee (RB28); now KC's clear lead back (Reid RB1s average 250+ touches). Shoe-related ankle swelling, expected Wk 1.",
'Malik Nabers':"18.5 ppg over 15 games in 2024 (the 2025 four-game sample is one 39-pt game). ACL+meniscus: cleared for contact, has not committed to Wk 1 vs DAL. Dart at QB. Elite share when healthy; Karabell has him on ESPN's do-not-draft list, so he may fall.",
'Garrett Wilson':"14.2 ppg in 7 g, 34% target share. Geno Smith is the new QB (upgrade). Missed 10 games in 2025.",
'Zay Flowers':"14.6 ppg, 118 tgt, 29% share, 17 games. New OC Doyle; quad contusion 'nothing major'.",
'Tee Higgins':"14.2 ppg, 11 TD on 98 tgt (11.2% TD rate; league ~5.5%, so ~5 TD and ~12 ppg is the regressed line). Heel contusion, limited but expected Wk 1. ESPN price ~55: fine at 42-59, not at 30.",
'Josh Allen':"22.8 ppg (4-pt) / 26.3 (6-pt), 14 rush TD, 112 car. QB1 both formats; DJ Moore added. Realized edge over QB11 was ~4.9 ppg; QB edges persist only ~half as well as RB/WR, so the expected edge is ~3 ppg (a WR12-15 equivalent). ESPN rooms let him reach ~24.",
'Tetairoa McMillan':"12.7 ppg, 122 tgt, 25% share, OROY, 40.9% air-yard share. Year-2 leap profile; Bryce Young caps ceiling.",
'Colston Loveland':"10.4 ppg as a rookie (TE16 per game), 82 tgt (17% share), 64% snaps. Rank is a role bet (DJ Moore's 85 targets vacated, Ben Johnson), not a production one. ESPN ADP 45: take him at 42-45 only if TE-less.",
'Omarion Hampton':"15.4 ppg in 9 g (ankle). OC McDaniel says all three of Hampton/Vidal/Mitchell play every game, 'hot hand'. Committee = fade at ESPN's ~pick-20 price; fine at 37-44.",
'Ladd McConkey':"11.5 ppg (15.3 in 2024), 106 tgt. McDaniel OC historically feeds slot WRs. Year-3 bounce candidate.",
'Lamar Jackson':"16.5/19.8 ppg in 13 g (2 rush TD, QB17 by ppg); 25.5 ppg in 2024. Shrinking the two years together gives ~QB5. Age 29.7, new OC. ESPN takes him ~38: let someone else pay for 2024.",
'Breece Hall':"13.7 ppg, 243 car, 48 tgt. Signed a 3-yr/$45.75M extension in May (locked-in RB1); Geno Smith at QB. Groin, on track for Wk 1.",
'Drake Maye':"20.7/24.5 ppg, 31 TD, 450 rush yds, 17 games, age 24. A.J. Brown added. QB2-4 in 6-pt scoring (+2.7 ppg over QB11 in 2025). ESPN ADP ~48: he is a pick-37 decision in League B.",
'Emeka Egbuka':"11.8 ppg, 127 tgt, 24% share as rookie; hot Wks 1-5 then faded. Toe sprain, day-to-day, Bowles 'hopeful' Wk 1. Evans gone (SF); Godwin (30, off major injuries) is the WR2.",
'Kyren Williams':"15.7 ppg, 259 car, 50 tgt, 17 games in 2025 (16 in 2024). Corum behind him. Safe RB2, low ceiling. ESPN takes him ~34.",
'Javonte Williams':"15.6 ppg, 252 car, 51 tgt in DAL's league-worst defense environment (shootouts). Cheap volume RB2.",
'Cam Skattebo':"16.0 ppg in 8 g before tibia/ankle fracture. Back, played preseason, listed starter under Harbaugh (run-heavy). ESPN ADP RB18-ish.",
'Jeremiyah Love':"Rookie #3 overall (R1 RBs hit top-24 71% of the time). High-ankle sprain Aug 13; LaFleur says 'about 50/50' for Wk 1 (Sep 2), back by Wk 2-3 if he sits. Team's official chart lists Allgeier first. ESPN drafters take him ~25: do not pay that.",
'Jaylen Waddle':"12.2 ppg (10.2 in 2024), 100 tgt. Traded to DEN: Nix, Sutton competition. Volume unclear.",
'Luther Burden III':"8.7 ppg but 5.6 tgt/g over Wks 10-18, #3 in NFL yards per route run (2.69). DJ Moore's 85 targets vacated. Classic year-2 breakout.",
'DJ Moore':"10.1 ppg in CHI; traded to BUF as Josh Allen's WR1 (Diggs/Cooper never cleared 85 tgt there). Floor play at WR3 price.",
'Travis Etienne Jr.':"15.3 ppg, 260 car, 52 tgt in JAX; signed with NO, Kamara (31) still there. Volume RB2.",
'Davante Adams':"16.0 ppg, 14 TD on 114 tgt (12.3% TD rate; regressed line ~12.7 ppg). Age 33.7. The only top-50 WR ESPN rooms take EARLIER than experts (~46): never a value there.",
'Bucky Irving':"14.0 ppg in 10 g; shoulder surgery healed, 'full go'. Gainwell added for a pony package. TB has PFF's #3 OL.",
'Terry McLaurin':"11.4 ppg in 10 g, age 31. Diggs added Aug 7; Daniels' health. Fading volume.",
'Tyler Warren':"11.1 ppg, 112 tgt (21% share) as a rookie, 84% snaps. Daniel Jones back. TE3-5 range; ESPN ~54.",
'Jadarian Price':"Rookie R1 (#32), listed RB1 in SEA with Walker gone and Charbonnet on PUP. Super Bowl champion offense, Darnold. ECR 73 = discount for a lead back.",
'Quinshon Judkins':"12.3 ppg in 14 g, 230 car (65% of CLE RB carries), 10.5 ppg after Wk 9. Upgraded OL, Watson at QB, Sampson takes passing downs. ESPN takes him ~47.",
'Jameson Williams':"13.3 ppg, 102 tgt, 90% snaps, best-6 23.4. Deep-threat volatility; new OC Petzing.",
"D'Andre Swift":"14.8 ppg, 223 car, 48 tgt; Monangai (knee) doubtful early. Ben Johnson offense.",
'MarShawn Lloyd':"Lead back in GB with Jacobs on the exempt list (open-ended; 6+ games likely). One career game; Kaleb Johnson (traded from PIT Aug 30) and Chris Brooks share. Printed sheets (~180) predate the news; Mike Clay has him RB33. Survives to 62/64 in almost every simulated room.",
'David Montgomery':"10.0 ppg in DET committee; traded to HOU as the clear RB1 with Marks on passing downs. Age 29. Goal-line volume play.",
'Joe Burrow':"16.8/21.6 ppg in 8 g (turf toe). Healthy: 2024 was 22.9 ppg (4-pt). Chase/Higgins/Brown. QB1 upside at QB5 price.",
'Jalen Hurts':"18.8/22.1 ppg, 8 rush TD, 105 car. A.J. Brown gone lowers passing ceiling; Tush Push keeps TD floor.",
'Justin Herbert':"18.4/21.8 ppg, 26 TD, 498 rush yds (career high), 16 games. ESPN ADP QB15 (~pick 114) vs expert QB7: he is there at 79 in ~100% of simulated rooms and at 99 in ~85%. Take him at 82-99, not 79.",
'TreVeyon Henderson':"12.5 ppg full year; 7.3 ppg Wks 1-9, then 18.4 ppg (RB7) Wks 10-18. Depth chart lists Stevenson first. ESPN ADP ~72 vs Sleeper 52: cheap on ESPN.",
'Rome Odunze':"12.4 ppg in 12 g, 24% share, WR11 ppg Wks 1-8. Listed WR1 outside in CHI with Moore gone.",
'Jayden Daniels':"16.3/18.6 ppg in 7 g (four separate injuries). 21.1 ppg in 2024. Rushing floor when healthy; availability risk.",
'Christian Watson':"13.4 ppg in 10 g, 19% share; GB WR1 on depth chart. Injury history; TD-dependent.",
'Bhayshul Tuten':"5.9 ppg as rookie (83 car). Listed RB1 with Etienne gone; Rodriguez behind. Coen offense. Speculative RB1 role at RB3 price.",
'Mike Evans':"10.8 ppg in 8 g, age 33. Signed with SF (Purdy, Shanahan), Aiyuk gone, Deebo WR2. 11 straight 1,000-yd seasons ended in 2025.",
'Caleb Williams':"18.7/22.0 ppg, 27 TD, 388 rush yds, 17 games. Year 3 under Ben Johnson; Moore gone, Burden/Odunze/Loveland up.",
'Parker Washington':"11.7 ppg, 95 tgt; 16.4 ppg over the last 6 games as JAX WR1 (three straight 20-pt games). Hunter is a part-time WR in 2026 (CB first).",
'Carnell Tate':"Rookie #4 overall, listed WR1 in TEN with Cam Ward. R1 rookie WRs finish top-24 only 28% of the time; Wan'Dale takes slot volume.",
'Rhamondre Stevenson':"13.0 ppg in 14 g, listed RB1 ahead of Henderson. Age 28.5. Early-down and goal-line role.",
'Tucker Kraft':"15.0 ppg in 8 g, but two spike games (25.9, 34.8) were 51% of it; the other six averaged 9.9. Active and listed GB TE1 with no camp injury flag. TE5-7 with TE1 weeks.",
'Brian Thomas Jr.':"9.9 ppg in 14 g (17.1 as a rookie in 2024). Lawrence healthy all 17 games; Hunter part-time. Bounce-back with WR1 ceiling.",
'Marvin Harrison Jr.':"10.7 ppg in 12 g, 18% share. Brissett (volume thrower) replaces Kyler; McBride still eats. Year-3 leap or bust.",
'Trevor Lawrence':"19.9/23.4 ppg, 29 TD, 359 rush yds, 9 rush TD, 17 games. Priced QB9-10; Coen offense year 2.",
'Harold Fannin Jr.':"11.7 ppg, 107 tgt as a rookie (21% share). Watson at QB, Monken HC. TE5-8 with volume.",
'Kyle Pitts Sr.':"12.5 ppg, 118 tgt (23% share), 17 games. Tua at QB is a target-funnel QB. TE4-6.",
'Patrick Mahomes II':"20.4/23.8 ppg in 14 g, 422 rush yds. ACL/LCL rehab, no preseason snaps, 'on track' for Wk 1 (Mon Sep 14). Rice/Worthy/Kelce; Bieniemy back.",
'Matthew Stafford':"21.1/26.6 ppg, 46 TD on a 7.7% TD rate (league 4.6%, his own 2024 3.5%). At a top-10 rate he is ~32 TD and ~22 ppg in League B (QB8-11). Age 38.6. Biggest ECR-vs-ppg gap on the board, but half of it is TD luck, and ESPN rooms already price him QB8 (~76). League B target at 64-77, never at 39.",
'Jaylen Warren':"13.9 ppg, 211 car; Dowdle signed and reps split ~50/50 in camp. New HC McCarthy.",
'DK Metcalf':"12.7 ppg, 99 tgt, 23% share with Rodgers; Pittman added. Best-ball TD swings.",
'Courtland Sutton':"13.1 ppg, 124 tgt, 22% share, 17 games. Waddle added; age 31.",
"Wan'Dale Robinson":"13.9 ppg, 140 tgt, 30% share in NYG. Signed 4yr/$78M with TEN (Daboll OC). Slot PPR floor; Tate competes.",
'Dak Prescott':"18.5/22.7 ppg, 30 TD, six 300-yd games (League B bonus). Age 33. Lamb+Pickens.",
'Michael Pittman Jr.':"12.0 ppg, 111 tgt; traded to PIT with Rodgers (age 42.8). Volume WR3.",
'Michael Wilson':"13.2 ppg, 126 tgt, best-6 avg 25.7 (WR ~12 in ceiling weeks). Listed WR2 in ARI; Brissett throws volume. ADP ~88 = value.",
'Chris Godwin Jr.':"9.4 ppg in 9 g, age 30.5, coming off major injuries; listed TB WR2. ESPN ADP 147 vs ECR 76: a round-14/15 pick, never round 11.",
'Rico Dowdle':"13.5 ppg, 236 car, best-6 avg 25.2 in CAR; now PIT ~50/50 with Warren. Volume upside if he wins the job.",
'Sam LaPorta':"11.9 ppg in 9 g (injured); 2023 TE1. Petzing OC. TE5-8.",
'George Kittle':"14.8 ppg in 11 g; Achilles tear in January, made the Australia trip after two positive practices, 'trending' to play Wk 1. Age 33. Discounted TE1 if healthy.",
'Tony Pollard':"11.5 ppg, 242 car, three 100-yd games; contract year, trade candidate; Spears/Singleton behind.",
'Josh Jacobs':"15.8 ppg, 234 car. Commissioner's Exempt List (Aug 30) with no fixed length; first court date Nov 17, so a Wk 8 return is a hope. ESPN tags exempt players SSPD, not IR-eligible: he burns a bench slot. Someone in the room will take him off the printed sheet around 55-70; do not.",
'Josh Downs':"8.7 ppg, 88 tgt; Pittman traded, Keenan Allen added. Slot volume WR4.",
'Stefon Diggs':"12.8 ppg, 102 tgt, five 100-yd games in NE; signed with WAS Aug 7 as 1B to McLaurin. Age 33.",
'Quentin Johnston':"13.3 ppg in 13 g, 8 TD, 20% share. McDaniel OC. WR4 with TD equity.",
'Jaxson Dart':"17.3/19.4 ppg in 14 g, 487 rush yds, 9 rush TD (86 car). Rushing floor; Nabers back. ESPN's own staff rank him QB7, so the room takes him ~88: he is not a late fallback in an ESPN room.",
'Kyler Murray':"15.6/18.0 ppg in 5 g (ARI); signed with MIN as starter over McCarthy. 500+ rush yds projected; Jefferson/Addison/Hockenson. Round-12 price on ESPN.",
'J.K. Dobbins':"12.2 ppg in 10 g, listed RB1 in DEN ahead of Harvey; PFF #1 OL. Age 27.7, injury history.",
'RJ Harvey':"12.2 ppg, 146 car, 58 tgt, 42% snaps; listed RB2 behind Dobbins, rookie Coleman added. Pass-down role.",
'Chuba Hubbard':"8.4 ppg in 2025 (16.9 in 2024); listed RB1 with Dowdle gone and no RB drafted; Brooks (two ACLs) behind. Bounce-back at RB35 price.",
'Travis Kelce':"11.4 ppg, 108 tgt, 17 games; age 37. Mahomes back. TE8-10 floor.",
'Kenny Gainwell':"13.0 ppg, 85 tgt (!) in PIT; now TB pony-package with Irving. PPR-only RB4 with standalone value.",
'Alec Pierce':"12.4 ppg, 84 tgt, listed WR1 in IND; Pittman gone. Deep threat with League B 50-yd TD bonus appeal.",
'Brock Purdy':"19.7/24.6 ppg in 9 g (injured). Evans + Kittle + CMC. 6-pt league QB8 upside at QB14 price.",
'Bo Nix':"17.9/21.3 ppg, 25 TD, 356 rush yds, 17 games. Waddle added. Streamer-plus.",
'Jared Goff':"17.5/22.2 ppg, 34 TD, six 300-yd games. Zero rushing. 6-pt league value only.",
'Makai Lemon':"Rookie R1 (#20), PHI; A.J. Brown gone, listed behind Smith/Wicks on initial depth chart. Day-1 capital but rookie WR hit rates are low.",
'Jakobi Meyers':"11.0 ppg, 110 tgt, 23% share in LV; now JAX. Target floor WR4.",
'Jordan Addison':"9.9 ppg in 14 g; Kyler at QB, Jefferson draws coverage. TD-dependent WR4.",
'Jayden Reed':"9.7 ppg in 5 g (injured); healthy, ADP rising. GB slot with Watson/Golden.",
'KC Concepcion':"Rookie R1 (#24), listed WR2 in CLE next to Jeudy; Watson at QB. Rising in ADP.",
'Jacory Croskey-Merritt':"8.6 ppg, 175 car (39% snaps), listed RB1 in WAS ahead of Rachaad White. Cheap lead-back share.",
'Blake Corum':"7.4 ppg, 145 car behind Kyren; would be a back-end RB1 if Kyren misses time. Handcuff-plus.",
'Jordan Mason':"8.2 ppg, 159 car, 91.3 PFF rush grade; RB2 behind Aaron Jones (31.8). Handcuff-plus.",
'Dalton Kincaid':"10.8 ppg in 12 g; 37% snaps in 2025 split with Knox. DJ Moore added. TE10-12.",
'Dallas Goedert':"12.4 ppg on 11 TD in 82 tgt (13.4% TD rate; regressed ~9.8 ppg); age 31.7; more targets with A.J. Brown gone. TE10-12.",
'Jake Ferguson':"11.1 ppg, 102 tgt, 17 games. TE volume floor in a high-scoring DAL offense.",
'Daniel Jones':"17.4/20.6 ppg in 13 g before Achilles; 'absolutely' expects Wk 1. Taylor/Warren/Pierce/Downs/Allen. ECR 148 = free QB12.",
'Rachaad White':"8.4 ppg, 132 car, 45 tgt; WAS RB2 behind Croskey-Merritt. PPR-only.",
'Romeo Doubs':"10.3 ppg, 85 tgt in GB; listed WR2 in NE opposite A.J. Brown with Maye.",
'Khalil Shakir':"10.5 ppg, 95 tgt, 21% share; Moore added. PPR floor WR5.",
'Jalen Coker':"8.2 ppg in 11 g; listed WR2 in CAR. Cheap volume behind McMillan.",
'Matthew Golden':"5.0 ppg as a rookie (44 tgt); ADP rising in camp. Year-2 dart.",
'Xavier Worthy':"7.9 ppg in 14 g, 73 tgt. Mahomes back; Rice/Kelce first. Big-play dart (League B 50-yd bonus).",
'Deebo Samuel Sr.':"11.8 ppg, 99 tgt, 25% share in WAS; listed WR2 in SF with Evans. Age 30.7.",
'Tyler Allgeier':"7.2 ppg in ATL; listed RB1 in ARI while Love (ankle) recovers; Conner on IR. Week 1-2 starter, then handcuff.",
'Woody Marks':"9.1 ppg, 196 car, 36 tgt as a rookie; passing-down role behind Montgomery. Handcuff-plus.",
'Kyle Monangai':"9.0 ppg, 169 car, 5 TD as rookie; hyperextended knee Aug 16, week-to-week. Swift handcuff once healthy.",
'Baker Mayfield':"16.0/19.3 ppg, 26 TD, 382 rush yds. Egbuka/Godwin; Evans gone. QB14 range.",
'Jordan Love':"15.7/19.0 ppg in 15 g. Watson/Reed/Golden/Kraft. Streamer.",
"De'Zhaun Stribling":"Rookie R2 (#33), led SF with 7 catches in preseason opener; Pearsall on IR, Kirk on IR. WR3 in SF behind Evans/Deebo.",
'Mark Andrews':"7.7 ppg, 70 tgt; age 31; listed TE1 in BAL. TE12-15.",
'Jonathon Brooks':"Two ACL tears; listed RB2 behind Hubbard. Talent dart only in R14-15.",
'Tank Bigsby':"3.8 ppg in 2025; listed RB2 in PHI = Barkley (29.6) handcuff. Elite YAC metrics.",
'Sione Vaki':"Listed RB2 in DET behind Gibbs (Montgomery traded, Pacheco IR). The Gibbs handcuff for League A; not in most printed lists.",
'Brian Robinson Jr.':"3.7 ppg, 92 car; listed RB2 in ATL = Bijan handcuff.",
'Kaelon Black':"Rookie R3 (#90), listed RB2 in SF = McCaffrey handcuff (RB2 there had 'huge spike' potential in 2025).",
'Emmett Johnson':"Rookie R5, listed RB2 in KC = Walker handcuff; short-yardage role.",
'Jordyn Tyson':"Rookie #8 overall, on IR (hamstring) ~2 months (Rapoport). IR-slot stash only: both leagues have 1 IR spot.",
'James Conner':"On IR (ankle), out at least 4 games; behind Love/Allgeier when back. IR-slot stash at best.",
'Zach Charbonnet':"Reserve/PUP (ACL), out 4+ games. IR stash only.",
'Isiah Pacheco':"IR (back/MCL) since Sep 1; eligible Wk 5, DET bye Wk 6, so realistic return Wk 7; DET RB2/3 when back. IR stash only.",
'Cleveland Browns':"7.7 ppg in 2025 with Garrett; Wks 1-4 @JAX, @TB, CAR (Young), PIT. Round-15 pick #2.",
'Chicago Bears':"Only 5.4 ppg in 2025 but the softest four-week opener in the league: @CAR (Young), MIN, PHI, NYJ (Geno). Streamer #5.",
'Pittsburgh Steelers':"5.4 ppg in 2025; Wks 1-4 ATL, @NE, CIN, @CLE. Watt pass rush; Week 4 is the soft one.",
'Philadelphia Eagles':"6.5 ppg in 2025; Wks 1-4 WAS, @TEN (Ward), @CHI, LA. Soft Week 2.",
'Houston Texans':"ECR DST1 and 8.2 ppg in 2025, but Wks 1-4 = BUF, CIN, @IND, DAL (the four hardest openers). Goes ~R11 on ESPN; a Week-5 waiver target, not a round-15 pick.",
'Denver Broncos':"ECR DST2, 8.1 ppg in 2025; Wks 1-4 @KC, JAX, LA, @SF. Elite pass rush, tough openers; Week-5 waiver target.",
'Los Angeles Chargers':"7.2 ppg in 2025. Wks 1-2 vs ARI (Brissett) and LV (Cousins): the best two-week opener of any DST; then @BUF, @SEA (stream those). Round-15 pick #1.",
'Seattle Seahawks':"Best DST in 2025 under this scoring (8.4 ppg); Wks 1-4 NE, @ARI, @WAS, LAC. Champion defense with a soft Wk 2.",
'Detroit Lions':"Wks 1-4 NO, @BUF, NYJ, @CAR (three soft offenses) but only 4.6 ppg in 2025 and safeties Branch and Joseph miss Weeks 1-4. Last of the streamable eight.",
'Minnesota Vikings':"Allowed the fewest fantasy points in the NFL in 2025 (66.2/g), 7.3 DST ppg; Wks 1-4 GB, @CHI, @TB, MIA (Willis). Elite from Week 5 on.",
}

# Ordered boards. Names must match ECR spelling (see master.csv). Unlisted ECR players are appended in ECR order.
A_ORDER="""Jahmyr Gibbs|Bijan Robinson|Ja'Marr Chase|Puka Nacua|Jonathan Taylor|Jaxon Smith-Njigba|Amon-Ra St. Brown|Christian McCaffrey|CeeDee Lamb|Drake London|A.J. Brown|Trey McBride|Justin Jefferson|James Cook III|Nico Collins|George Pickens|Chase Brown|De'Von Achane|Chris Olave|Derrick Henry|Brock Bowers|Rashee Rice|DeVonta Smith|Saquon Barkley|Ashton Jeanty|Kenneth Walker III|Garrett Wilson|Zay Flowers|Tetairoa McMillan|Malik Nabers|Josh Allen|Emeka Egbuka|Ladd McConkey|Breece Hall|Kyren Williams|Javonte Williams|Omarion Hampton|Cam Skattebo|Tee Higgins|Colston Loveland|Jeremiyah Love|Jaylen Waddle|Luther Burden III|DJ Moore|Drake Maye|Travis Etienne Jr.|Bucky Irving|Jadarian Price|Quinshon Judkins|D'Andre Swift|David Montgomery|Tyler Warren|Jameson Williams|MarShawn Lloyd|Terry McLaurin|Davante Adams|Lamar Jackson|Joe Burrow|Jalen Hurts|Justin Herbert|Wan'Dale Robinson|Kyle Pitts Sr.|Trevor Lawrence|Matthew Stafford|TreVeyon Henderson|Rome Odunze|Jayden Daniels|Patrick Mahomes II|Christian Watson|Bhayshul Tuten|Mike Evans|Caleb Williams|Michael Wilson|Rhamondre Stevenson|Parker Washington|Carnell Tate|Tucker Kraft|Brian Thomas Jr.|Marvin Harrison Jr.|Harold Fannin Jr.|Rico Dowdle|Dak Prescott|Jaylen Warren|DK Metcalf|Courtland Sutton|Michael Pittman Jr.|Jaxson Dart|Kenny Gainwell|Sam LaPorta|Tony Pollard|George Kittle|Josh Jacobs|Kyler Murray|Josh Downs|Stefon Diggs|Quentin Johnston|J.K. Dobbins|RJ Harvey|Chuba Hubbard|Brock Purdy|Travis Kelce|Alec Pierce|Bo Nix|Jared Goff|Makai Lemon|Jakobi Meyers|Jordan Addison|Jayden Reed|KC Concepcion|Jacory Croskey-Merritt|Blake Corum|Jordan Mason|Daniel Jones|Dalton Kincaid|Jake Ferguson|Chris Godwin Jr.|Rachaad White|Romeo Doubs|Khalil Shakir|Jalen Coker|Matthew Golden|Xavier Worthy|Deebo Samuel Sr.|Tyler Allgeier|Woody Marks|Dallas Goedert|Kyle Monangai|Baker Mayfield|Jordan Love|De'Zhaun Stribling|Mark Andrews|Tank Bigsby|Sione Vaki|Brian Robinson Jr.|Kaelon Black|Emmett Johnson|Jonathon Brooks|Isaiah Likely|Jordyn Tyson|Zach Charbonnet|James Conner|Isiah Pacheco|Tyjae Spears|Chris Rodriguez Jr.|Dylan Sampson|Keenan Allen|Rashid Shaheed|Sam Darnold|Juwan Johnson|Denzel Boston|Los Angeles Chargers|Cleveland Browns|Seattle Seahawks|Minnesota Vikings|Chicago Bears|Philadelphia Eagles|Pittsburgh Steelers|Detroit Lions|Houston Texans|Denver Broncos|Brenton Strange|Tyrone Tracy Jr.|Alvin Kamara|Jauan Jennings|Adonai Mitchell|Braelon Allen|Cam Ward|C.J. Stroud"""

B_ORDER="""Bijan Robinson|Jahmyr Gibbs|Ja'Marr Chase|Jaxon Smith-Njigba|Puka Nacua|Amon-Ra St. Brown|Christian McCaffrey|Jonathan Taylor|CeeDee Lamb|Drake London|De'Von Achane|Trey McBride|A.J. Brown|Justin Jefferson|Nico Collins|Chase Brown|James Cook III|George Pickens|Chris Olave|Brock Bowers|Rashee Rice|DeVonta Smith|Saquon Barkley|Ashton Jeanty|Josh Allen|Kenneth Walker III|Derrick Henry|Garrett Wilson|Zay Flowers|Tetairoa McMillan|Emeka Egbuka|Ladd McConkey|Breece Hall|Kyren Williams|Javonte Williams|Drake Maye|Malik Nabers|Omarion Hampton|Cam Skattebo|Jaylen Waddle|Tee Higgins|Colston Loveland|Luther Burden III|DJ Moore|Lamar Jackson|Jeremiyah Love|Travis Etienne Jr.|Bucky Irving|Jadarian Price|Quinshon Judkins|D'Andre Swift|David Montgomery|Joe Burrow|Jalen Hurts|Tyler Warren|Jameson Williams|MarShawn Lloyd|Terry McLaurin|Justin Herbert|Patrick Mahomes II|Matthew Stafford|Trevor Lawrence|Davante Adams|Dak Prescott|TreVeyon Henderson|Rome Odunze|Kyle Pitts Sr.|Wan'Dale Robinson|Jayden Daniels|Caleb Williams|Christian Watson|Bhayshul Tuten|Mike Evans|Brock Purdy|Jared Goff|Michael Wilson|Rhamondre Stevenson|Parker Washington|Carnell Tate|Tucker Kraft|Brian Thomas Jr.|Marvin Harrison Jr.|Harold Fannin Jr.|Rico Dowdle|Jaylen Warren|DK Metcalf|Courtland Sutton|Michael Pittman Jr.|Bo Nix|Jaxson Dart|Kenny Gainwell|Sam LaPorta|Tony Pollard|George Kittle|Kyler Murray|Josh Downs|Stefon Diggs|Quentin Johnston|Alec Pierce|J.K. Dobbins|RJ Harvey|Chuba Hubbard|Travis Kelce|Makai Lemon|Jakobi Meyers|Jordan Addison|Jayden Reed|KC Concepcion|Jacory Croskey-Merritt|Blake Corum|Jordan Mason|Daniel Jones|Dalton Kincaid|Jake Ferguson|Josh Jacobs|Chris Godwin Jr.|Rachaad White|Romeo Doubs|Khalil Shakir|Jalen Coker|Matthew Golden|Xavier Worthy|Deebo Samuel Sr.|Tyler Allgeier|Woody Marks|Dallas Goedert|Kyle Monangai|Baker Mayfield|Jordan Love|De'Zhaun Stribling|Mark Andrews|Tank Bigsby|Sione Vaki|Brian Robinson Jr.|Kaelon Black|Emmett Johnson|Jonathon Brooks|Isaiah Likely|Jordyn Tyson|Zach Charbonnet|James Conner|Isiah Pacheco|Tyjae Spears|Chris Rodriguez Jr.|Dylan Sampson|Keenan Allen|Rashid Shaheed|Sam Darnold|Juwan Johnson|Denzel Boston|Los Angeles Chargers|Cleveland Browns|Seattle Seahawks|Minnesota Vikings|Chicago Bears|Philadelphia Eagles|Pittsburgh Steelers|Detroit Lions|Houston Texans|Denver Broncos|Brenton Strange|Tyrone Tracy Jr.|Alvin Kamara|Jauan Jennings|Adonai Mitchell|Braelon Allen|Cam Ward|C.J. Stroud"""

DROP={'Tyreek Hill','Brandon Aiyuk','Joe Mixon','Travis Hunter','Jayden Higgins','Tank Dell','Calvin Austin III','Trey Benson','Fernando Mendoza','Ty Simpson'}
EXTRA={'Sione Vaki':dict(pos='RB',team_26='DET',age=24.5),'Kaleb Johnson':dict(pos='RB',team_26='GB',age=23.0)}

def build(order):
    names=order.split('|'); rows=[]; seen=set()
    for n in names:
        k=norm(n); r=byname.get(k)
        if r is None:
            if n in EXTRA: r={'player':n,**EXTRA[n],'ecr_ovr':None,'ecr_pos':None,'bye':None}
            else: raise SystemExit('missing '+n)
        rows.append(r); seen.add(k)
    for r in m.sort_values('ecr_ovr').to_dict('records'):
        if r['key'] in seen or r['player'] in DROP: continue
        if r['pos']=='DST' and r['player'] not in N: continue
        rows.append(r); seen.add(r['key'])
    out=pd.DataFrame(rows)
    out['rank']=range(1,len(out)+1)
    out['note']=out.player.map(N).fillna('')
    return out

cols=['rank','player','pos','team_26','age','bye','ecr_ovr','ecr_pos','g_25','ppgA_25','ppgB_25','top6A_25','floorA_25','tgt_25','tgt_share_25','car_25','ru100_25','re100_25','pass_td_25','p300_25','ru_yds_25','snap_pct_25','espn_adp','exp_missed','note']
esp=pd.read_csv(O+'espn_adp_est.csv')[['player','espn_adp']]
emx=pd.read_csv(O+'exp_missed.csv')[['player','exp_missed']]
A=build(A_ORDER).merge(esp,on='player',how='left').merge(emx,on='player',how='left'); B=build(B_ORDER).merge(esp,on='player',how='left').merge(emx,on='player',how='left')
for df,lg in ((A,'A'),(B,'B')):
    df['pos_rank']=df.groupby('pos').cumcount()+1
    df[cols+['pos_rank']].to_csv(O+f'board_{lg}.csv',index=False)
    print(lg, len(df))
print(A[['rank','player','pos','team_26','ecr_ovr','ppgA_25','top6A_25']].head(60).to_string(index=False))

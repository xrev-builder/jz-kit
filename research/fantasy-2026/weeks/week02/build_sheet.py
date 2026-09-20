import html, json
E=html.escape
ASOF="Sun Sept 20, 2026, lines reported 9:00-11:30 AM ET"
# ---- game lines: (away@home, kickoff, [(book, spread, total, ml)], consensus spread (home negative = home fav), consensus total, movement, note)
GAMES=[
 ("MIA @ SF","Sun 4:25 ET",[("DraftKings","SF -13.5","44.5","SF -900"),("FanDuel","SF -13.5","44.5/45.5","-"),("BetMGM","SF -13.5","44.5/45.5","-"),("Fanatics","SF -13","45.5","SF -1000 / MIA +650"),("Consensus (SI/Covers)","SF -13.5","44.5","SF -950 / MIA +625")],"SF",13.5,44.5,"Spread 10.5 → 13.5, total 46.5 → 44.5 (SF travel from Australia, MIA Week 1). 80%+ of money on SF.","Malik Willis starts for MIA (full practice, toe). SF D/ST ranked DST6."),
 ("PIT @ NE","Sun 1:00 ET",[("DraftKings","NE -5.5","41.5","-"),("FanDuel","NE -5.5","41.5","NE -230 / PIT +190"),("CBS/SportsLine","NE -5","41.5","-"),("Covers/SI consensus","NE -5.5","41.5","NE 67% implied")],"NE",5.5,41.5,"Opened NE -4.5 / 43.5 → -5.5 / 41.5; 92% of total money on the Under at DK.","A.J. Brown on IR (high ankle, 4-6 wks). PIT: Pittman Jr. and CB Porter Jr. out. Henderson returns for NE."),
 ("NYG @ LAR","Mon 8:15 ET",[("DraftKings","LAR -7","48.5","-"),("BetMGM","LAR -8.5 (+110)","49","-"),("FanDuel","LAR -7","48.5","LAR -375 / NYG +295"),("Action Network consensus","LAR -7 (-7.5 listed)","48.5","-"),("SI/Dimers","LAR -7.5","47.5","LAR -340 / NYG +275")],"LAR",7,48.5,"Was as high as LAR -9.5 pre-week; down to the key number 7 after NYG's Week 1 upset. Total 47.5 → 48.5. 82% of DK tickets on NYG.","Nacua questionable (groin/hip), DNP Fri+Sat, game-time decision. Whittington doubtful. Aaron Donald debuts."),
 ("WAS @ DAL","Sun 4:25 ET",[("Fanatics","DAL -4.5","50.5","-"),("FanDuel","DAL -4.5","50.5","DAL -205 / WAS +172"),("Hard Rock","DAL -4 (opened -3.5)","50.5 (opened 50)","-"),("CBS/SportsLine/Dimers","DAL -4","50.5","DAL -214"),("SI","DAL -4","49.5","-")],"DAL",4.5,50.5,"Opened DAL -3.5 / 50 → -4/-4.5 / 50.5. 93% of total money on the Over.","Second-highest total on the slate. WAS TE Okonkwo out; DAL S Hooker, LB Overshown out."),
 ("CIN @ HOU","Sun 1:00 ET",[("DraftKings","HOU -2.5","45.5","HOU -135 / CIN +114"),("FanDuel","HOU -3 (-104)","46.5","HOU -158 / CIN +134"),("BetMGM","-","45.5 (opened 47.5)","-"),("Fanatics","HOU -2.5","46.5","HOU -155 / CIN +130")],"HOU",2.5,46,"Opened HOU -3 / 48 → -2.5 / 45.5-46.5; money leaning CIN.","Burrow questionable (back) but full Friday, starting; Josh Johnson elevated. Nico Collins OUT."),
 ("SEA @ ARI","Sun 4:25 ET",[("DraftKings","SEA -3.5","40.5","SEA -218 / ARI +180"),("FanDuel","SEA -5.5 (stale?)","41.5","-"),("BetMGM","-","43.5 (stale)","-"),("SI snapshot","SEA -3.5 to -4.5","~41.5","-")],"SEA",3.5,40.5,"Lookahead SEA -9.5 → -5.5 after Darnold injury → -4.5 after ARI Week 1 win → -3.5 at DK Sunday. Total 44.5 → 40.5, heavy Under money.","Drew Lock starts (Darnold out 4-6 wks). Brissett for ARI. Books value Darnold→Lock at 3-5 pts."),
 ("PHI @ TEN","Sun 1:00 ET",[("DraftKings","PHI -7","39.5/40.5","PHI -325 / TEN +260"),("FanDuel","PHI -7","39.5","PHI -350 / TEN +280"),("BetMGM","PHI -7 (-115)","41.5","-"),("Fanatics","PHI -7","40","PHI -350")],"PHI",7,39.5,"Opened below -7 → -7; total 41-42.5 → 39.5. 86-89% of bets, 95% of money on PHI at DK.","Lowest total on your slate. TEN implied 16.25."),
 ("NO @ BAL","Sun 1:00 ET",[("DraftKings","BAL -8.5 (-105)","46.5 (O -118)","BAL -395 / NO +310"),("Fanatics","BAL -8","47","-"),("Covers (book unnamed)","BAL -7.5 (-125), opened -9","46.5 (opened 47.5)","BAL -415"),("SI/CBS","BAL -8.5","46.5","BAL -420 / NO +330")],"BAL",8.5,46.5,"Opened BAL -9 / 48.5 → -7.5/-8.5 / 46.5; every move toward NO despite 76% of tickets on BAL.","Kamara returns (full practice all week). Olave questionable, expected to play. Zay Flowers OUT for BAL."),
 ("CLE @ TB","Sun 1:00 ET",[("DraftKings","TB -8.5","41.5 (opened 42.5)","TB 79% implied"),("Covers consensus","TB -8.5","41.5","-"),("TheSpread","TB -8 (opened -9)","-","-")],"TB",8.5,41.5,"Open disputed (-5.5 lookahead vs -9); now -8/-8.5. Total 42.5 → 41.5.","CLE implied 16.5, second-lowest on the slate."),
 ("CAR @ ATL","Sun 1:00 ET",[("Covers","CAR -2.5","43.5","CAR -152 / ATL +130"),("SI","CAR -2.5","43.5","-")],"CAR",2.5,43.5,"Opened ATL -1.5 → CAR -1.5 → CAR -2.5: a 4-point swing through zero once Cooper Rush was named starter.","Penix out, Tua doubtful; Rush starts (Week 1: 12/22, 143, 1 TD, 2 INT, lowest rating in NFL)."),
 ("GB @ NYJ","Sun 1:00 ET",[("DraftKings","GB -3.5 (-115)","44.5","-"),("FanDuel","GB -3.5","44.5","-"),("Yahoo/Covers (unnamed)","GB -3.5","44.5","GB -192 / NYJ +160")],"GB",3.5,44.5,"Opened GB -5.5 → -4.5 → -3.5 by Wednesday; total 43.5 → 45.5 → 44.5. 85% of spread money on NYJ.","Jacobs still on the exempt list. Lloyd 51.5 rush / 13.5 attempts / +140 TD."),
 ("JAX @ DEN","Sun 4:05 ET",[("DraftKings","DEN -2.5","45.5 (O -108)","DEN -148 / JAX +124"),("FanDuel","DEN -2.5","44.5","DEN -134 / JAX +114"),("Fanatics","DEN -2.5","45.5","-")],"DEN",2.5,45,"Opened DEN -2 / 44 → -2.5 / 44.5-45.5; stable. JAX 67% of DK tickets. Dimers' top Week 2 play: JAX +2.5.","Harvey questionable, Schefter: unlikely. Mims out for DEN. Denver run D worst in missed tackles Week 1."),
 ("MIN @ CHI","Sun 1:00 ET",[("DraftKings","CHI -4.5","48.5 (opened 45.5)","CHI -198 / MIN +164"),("CBS/SportsLine","CHI -4.5","47.5","-"),("SportsBettingDime (unnamed)","CHI -4.5","48","-")],"CHI",4.5,48.5,"Opened CHI -3 / 45.5 → peaked -5.5 → -4.5 by the weekend after CHI's 59-point Week 1 and Wentz named for MIN.","Murray out (concussion), Wentz starts; Jennings out; Mason to IR."),
 ("LV @ LAC","Sun 4:05 ET",[("DraftKings","LAC -7","43.5","-"),("FanDuel","LAC -6.5 (-115)","43.5","LAC -310 / LV +250"),("BetMGM","LAC -7","43.5","-"),("Caesars","LAC -7","43.5","-"),("bet365","LAC -7","43.5","-"),("Fanatics","LAC -7","43.5","-")],"LAC",6.5,43.5,"Opened LAC -8.5 / 42.5 (or -7.5 / 45.5 by another report) → -6.5/-7 / 43.5; market moved toward LV.","McConkey questionable (ribs), game-time. Bowers doubtful for LV. LV implied 18.5."),
]
def implied(home,spread,total,homefav=True):
    fav=(total+spread)/2; dog=(total-spread)/2
    return fav,dog
# ---- props: (player, pos, team, game key, lineup slot, [(market, line, odds, book)], TD prob (decimal or None), note)
PROPS=[
 ("Brock Purdy","QB","SF","MIA @ SF","QB (start)",[("Pass yds","238.5","O -114","unnamed (Dimers)"),("Pass yds alt","237.5","-","SportsLine"),("Completions","19.5","-","FTN"),("Rush yds","13.5","-","unnamed"),("Anytime TD","-","+270","unnamed"),("Pass TDs","not posted","-","-")],None,"Projections: Dimers 232 yds, SportsLine 282.8, FTN 25.3 completions. Week 1: 25/34, 205, 3 TD."),
 ("Drake Maye","QB","NE","PIT @ NE","QB (bench)",[("Pass yds","223.5","-","Athlon/SBD"),("Pass TDs","1.5","O +105","unnamed"),("INT","0.5","U -148","unnamed"),("INT thrown","Yes -140 / No +108","-","FanDuel"),("Rush yds","25.5","-","BettingPros consensus"),("Anytime TD","-","+280","unnamed")],None,"Week 1: 23/33, 178, 1 TD, 3 INT, 47 rush."),
 ("Chase Brown","RB","CIN","CIN @ HOU","RB (start)",[("Rush yds","59.5","-","unnamed (iHeart/Rotoballer)"),("Rec yds","21.5","-","unnamed"),("Anytime TD","≈ -115","53.5-55.6% implied","Covers"),("Receptions","not posted","-","-")],0.545,"6 of 7 CIN red-zone RB touches Week 1, all 3 inside the 5. 74.6% snaps."),
 ("Kyren Williams","RB","LAR","NYG @ LAR","RB (start, Mon)",[("Rush yds","58.5","-","BettingPros consensus"),("Rush yds alt","63.5","-","unnamed (Data Skrive)"),("Rec yds","12.5","O -111","unnamed"),("Anytime TD","-","-195","unnamed (Bleacher Nation)"),("Kyren+Corum rush","100+","-218","unnamed")],0.606,"PFF: 60.6% TD. Corum rush 48.5 (FanDuel). NYG worst rush EPA allowed in 2025."),
 ("Puka Nacua","WR","LAR","NYG @ LAR","WR (start, Mon, GTD)",[("Receptions","6.5","O -118","unnamed (Yahoo SGP)"),("Rec yds","not posted in snippets; projection 90","-","Dimers"),("Anytime TD","~50% implied","-","PFF")],0.50,"Questionable: DNP Fri + Sat, groin soreness after Thursday. FantasyPros injury model 68% to play. No book odds on playing found. Davante Adams 49.5 rec yds / 3.5 rec if Nacua sits."),
 ("George Pickens","WR","DAL","WAS @ DAL","WR (start)",[("Rec yds","63.5","-","FanDuel"),("Longest rec","24.5","Y -112 / N -118","unnamed"),("Anytime TD","-","+135","unnamed (Lineups/BTB)"),("Receptions","not posted","-","-")],0.465,"PFF 46.5% TD. PFN projection 5-78 on ~8 targets. Lamb 76.5 rec yds. 84% snaps Week 1."),
 ("Harold Fannin Jr.","TE","CLE","CLE @ TB","TE (start)",[("Rec yds","35.5","-","unnamed (DBN/Yahoo)"),("Receptions","not posted","-","-"),("Anytime TD","not posted","-","-")],0.20,"TB allowed 5th-most to TEs in 2025, 18.8 to Gesicki Week 1. Watson pass yds 179.5 (BetMGM): low-volume offense."),
 ("Kyle Pitts","TE","ATL","CAR @ ATL","TE (bench)",[("Rec yds","not posted; projection 35","-","-"),("Anytime TD","not posted","-","-")],0.15,"Cooper Rush pass yds 183.5-199.5, 35.4 att projected. Pitts 1 target on 21 routes Week 1."),
 ("Jadarian Price","RB","SEA","SEA @ ARI","FLEX (start)",[("Rush yds","61.5","-","BetMGM"),("Anytime TD","-","+145","unnamed (SI)"),("Rec yds","not posted; PrizePicks 9.5","-","-")],0.41,"Holani took both Week 1 red-zone carries and 92% of 3rd-down snaps. Lock at QB. Love rush 36.5 (FanDuel)."),
 ("Wan'Dale Robinson","WR","TEN","PHI @ TEN","FLEX (start)",[("Receptions","4.5","-","consensus"),("Rec yds","not posted at books; PrizePicks 39.5","-","-"),("Anytime TD","not posted","-","-")],0.15,"Rec-yds Under in 7 of last 8 home games. Ward pass yds 187.5-188.5, 32.5 attempts, 0.5 pass TD line."),
 ("Romeo Doubs","WR","NE","PIT @ NE","FLEX option",[("Rec yds","39.5","-","BetMGM"),("Rec yds consensus","35.5","-","BettingPros"),("Receptions","3.5","-","BetMGM"),("Anytime TD","not posted","-","-")],0.25,"NE WR1 with A.J. Brown on IR. 0 catches on 3 targets Week 1 (one tipped INT, one drop). Porter Jr. out for PIT."),
 ("Carnell Tate","WR","TEN","PHI @ TEN","bench",[("Rec yds","39.5","-","BetMGM"),("Rec yds alt","41.5","-","unnamed (Inquirer/Athlon)"),("Receptions","3.5","-","BetMGM"),("Anytime TD","not posted","-","-")],0.18,"31.6% first-read share Week 1. SI props column fades him."),
 ("Devaughn Vele","WR","NO","NO @ BAL","bench (was FLEX)",[("Receptions","3.5","O -125","Fanatics"),("Rec yds","not posted at books; PrizePicks 38.5","-","-"),("Anytime TD","18.9% (Dimers)","-","-")],0.19,"Week 1: 7-69-1 on 9 targets, 91% snaps. Olave 71.5 rec yds is the NO alpha; Shough 234.5 pass yds."),
 ("Tyler Allgeier","RB","ARI","SEA @ ARI","bench",[("Rush yds","not posted; projection ~30 on 8 carries","-","FanDuel Research"),("Anytime TD","not posted","-","-")],0.22,"Love (36.5 rush line) fully healthy; 50/50 split. SEA #1 rush-EPA defense."),
 ("Jayden Reed","WR","GB","GB @ NYJ","waivers",[("Rec yds","43.5","-","BettingPros consensus")],0.20,"Jets allowing 3rd-fewest pass yds. Kraft is the GB priority; Golden had a 30% target share Week 1."),
 ("Rico Dowdle","RB","PIT","PIT @ NE","free agent",[("Rush yds","32.5","-","BettingPros consensus"),("Anytime TD","-","+170","unnamed")],0.37,"Warren rush 42.5, rec 3.5, ATD +165. Dowdle is the short-yardage back (only RZ carry Week 1)."),
 ("Travis Etienne Jr.","RB","NO","NO @ BAL","Ratz RB",[("Rush yds","40.5","-","FanDuel"),("Rec yds","11.5","-114","FanDuel"),("Receptions","1.5","Y -182","FanDuel"),("Anytime TD","-","+175","FanDuel")],0.369,"Kamara back (rec 2.5, rec yds 11.5); three-way split with Miller. NO implied 19."),
 ("Tee Higgins","WR","CIN","CIN @ HOU","Ratz WR",[("Anytime TD","-","+190","unnamed (SI)"),("Rec yds","not posted","-","-")],0.34,"Burrow pass yds 249.5 (DK, O -117). 99 rec ypg vs HOU last season."),
 ("Drake London","WR","ATL","CAR @ ATL","Ratz WR",[("Rec yds","not posted","-","-"),("Anytime TD","not posted","-","-")],None,"Cooper Rush again. CAR allowed 6th-most yds/target to perimeter WRs."),
 ("Sam LaPorta","TE","DET","DET @ BUF (played)","Ratz TE, locked",[("Final","6-52-1 on 7 tgt, 98% snaps","-","-")],None,"17.2 in Ratz scoring."),
 ("Jahmyr Gibbs","RB","DET","DET @ BUF (played)","Ratz RB, locked",[("Final","16-52 rush, 6-61-1 rec","-","-")],None,"23.3 in Ratz scoring."),
 ("RJ Harvey","RB","DEN","JAX @ DEN","Ratz RB",[("Status","Q, hamstring; Schefter: unlikely to play","-","-")],None,"Dobbins 44% TD; Coleman/Badie behind him."),
 ("Tucker Kraft","TE","GB","GB @ NYJ","Ratz TE",[("Rec yds","45.5","-","BettingPros consensus"),("Receptions","not posted","-","-"),("Anytime TD","not posted","-","-")],0.22,"RotoBaller ~55 yds on 5 targets. Jets allowing 127 pass yds/g."),
 ("Luther Burden III","WR","CHI","MIN @ CHI","Ratz WR",[("Rec yds","51.5","-","FanDuel (Fri afternoon)"),("Rec yds alt","49.5","-","BetMGM"),("Receptions","not posted (Over hit 11 of last 16)","-","BetMGM trend"),("Anytime TD","not posted","-","-")],0.22,"CHI implied 26.5, highest of your Sunday games. Caleb Williams 227.5 pass yds."),
 ("Trevor Lawrence","QB","JAX","JAX @ DEN","Ratz QB option",[("Pass yds","221.5","-","BetMGM / Bleacher Nation"),("Pass TDs","1.5","O +135","BetMGM"),("INT","0.5","O -120","BetMGM"),("Anytime TD","-","+350 / +360 DK","Bleacher Nation / DraftKings")],None,"Career vs DEN: 177 yds/g, 5 TD/4 INT. JAX implied 21-21.5."),
 ("Brian Thomas Jr.","WR","JAX","JAX @ DEN","Ratz WR",[("Rec yds","34.5","-","FanDuel (Fri afternoon)"),("Receptions","not posted","-","-"),("Anytime TD","not posted","-","-")],0.22,"Surtain shadowed him 79% of routes last meeting (1-9). No injury designation."),
 ("J.K. Dobbins","RB","DEN","JAX @ DEN","Ratz waiver option",[("Anytime TD","≈ +125","44.4% implied","FanDuel Research"),("Rush yds","not posted","-","-")],0.444,"Harvey unlikely; Coleman/Badie behind. JAX #1 run D in 2025."),
 ("Justin Herbert","QB","LAC","LV @ LAC","Ratz QB option",[("Pass yds","not posted in reports","-","-"),("INT trend","Over in 12 of last 16","-","BetMGM")],None,"LAC implied 25. vs LV since 2021: 273 pass yds/g. McConkey game-time."),
 ("Quentin Johnston","WR","LAC","LV @ LAC","Ratz WR",[("Rec yds","not posted","-","-"),("Anytime TD","not posted","-","-")],None,"WR1 if McConkey sits; 16-257-1 career vs LV. Hampton rush 61.5."),
 ("MarShawn Lloyd","RB","GB","GB @ NYJ","context",[("Rush yds","51.5","-","BetMGM"),("Rush att","13.5","-","BetMGM"),("Anytime TD","-","+140","BetMGM / SI")],0.42,"Green Bay lead back while Jacobs is out."),
]
def num(s):
    try: return float(str(s).split()[0].replace('≈','').replace('+','').replace('−','-'))
    except: return None
def expected(p):
    name,pos,tm,g,slot,lines,td,note=p
    L={m:l for m,l,o,b in lines}
    pts=None
    if pos=='QB' and num(L.get('Pass yds')):
        py=num(L['Pass yds']); ptd=num(L.get('Pass TDs')) or (2.2 if tm=='SF' else 1.6); ry=num(L.get('Rush yds')) or 15; ints=1 if tm=='NE' else 0.6
        if tm=='JAX': ptd=1.7; ry=20
        pts=py/25+6*ptd+ry/10-2*ints
    elif pos=='RB':
        ry=num(L.get('Rush yds')); rec=num(L.get('Receptions')); rey=num(L.get('Rec yds'))
        if ry is None and 'Rush yds' in L and 'projection' in L['Rush yds']: ry=30
        if ry is not None:
            rec=rec if rec is not None else (4 if tm in('CIN','NO') else 3 if tm=='LAR' else 1.5)
            rey=rey if rey is not None else rec*7
            pts=ry/10+rec+rey/10+6*(td or 0.3)
    elif pos in('WR','TE'):
        rec=num(L.get('Receptions')); rey=num(L.get('Rec yds')) or num(L.get('Rec yds alt')) or num(L.get('Rec yds consensus'))
        if rey is None and name=='Puka Nacua': rey=90
        if rey is None and name=='Wan\'Dale Robinson': rey=39.5
        if rey is None and name=='Devaughn Vele': rey=38.5
        if rey is None and name=='Kyle Pitts': rey=35
        if rey is not None:
            rec=rec if rec is not None else rey/11.5
            pts=rec+rey/10+6*(td or 0.2)
    return pts
CSS="""
<title>Week 2 Market Sheet</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{--bg:#F5F4EE;--ink:#15181C;--mute:#646A70;--line:#D9D6CC;--card:#FFFFFF;--acc:#0E7A57;--acc-ink:#fff;--warn:#B2611A;--tint:#E9F3EE;--head:#EEEDE5}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#101316;--ink:#EAE8E1;--mute:#9AA1A8;--line:#2A2F35;--card:#171B1F;--acc:#3FBF8E;--acc-ink:#0D1712;--warn:#E29558;--tint:#152A22;--head:#1B2025}}
:root[data-theme="dark"]{--bg:#101316;--ink:#EAE8E1;--mute:#9AA1A8;--line:#2A2F35;--card:#171B1F;--acc:#3FBF8E;--acc-ink:#0D1712;--warn:#E29558;--tint:#152A22;--head:#1B2025}
*{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 Barlow,system-ui,sans-serif}
.wrap{max-width:1180px;margin:0 auto;padding:18px 16px 60px}
h1{font:700 30px "Barlow Condensed",sans-serif;margin:0;letter-spacing:-.01em} h2{font:700 20px "Barlow Condensed",sans-serif;margin:26px 0 8px;letter-spacing:.01em;text-transform:uppercase}
.sub{color:var(--mute);margin:4px 0 0;max-width:80ch} .caveat{background:var(--tint);border-left:4px solid var(--acc);padding:10px 14px;margin:14px 0;max-width:90ch;border-radius:0 8px 8px 0}
.caveat b{font-weight:600}
.tw{overflow-x:auto;border:1px solid var(--line);background:var(--card);border-radius:8px}
table{border-collapse:collapse;width:100%;font-size:13px} th{font:600 11px "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;text-align:left;padding:7px 9px;background:var(--head);color:var(--mute);border-bottom:1px solid var(--line);white-space:nowrap}
td{padding:7px 9px;border-bottom:1px solid var(--line);vertical-align:top} .n{font-family:"IBM Plex Mono",monospace;font-variant-numeric:tabular-nums;white-space:nowrap;font-size:12.5px}
tr.g td{background:var(--head);font:600 13px "Barlow Condensed",sans-serif;letter-spacing:.04em} .mv{color:var(--mute);font-size:12.5px;max-width:60ch} .nt{color:var(--mute);font-size:12.5px;max-width:52ch}
.slot{display:inline-block;font:600 10px "Barlow Condensed",sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:2px 6px;border-radius:4px;background:var(--head);color:var(--mute)} .slot.on{background:var(--acc);color:var(--acc-ink)}
.exp{font:600 15px "IBM Plex Mono",monospace} .miss{color:var(--warn)}
.impl{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 0} .impl div{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:6px 10px;font-size:12.5px} .impl b{font:600 15px "IBM Plex Mono",monospace;display:block}
ul.src{columns:2;column-gap:24px;font-size:12px;color:var(--mute);padding-left:18px} @media (max-width:640px){ul.src{columns:1} h1{font-size:24px}}
</style>
"""
out=[CSS,'<div class="wrap">','<h1>Week 2 Market Sheet</h1>',f'<p class="sub">Game lines by book, implied team totals, and every player prop found for the Footborn roster (plus the Ratz names in play). As of {E(ASOF)}. Expected points use Footborn scoring: 6-pt pass TD, full PPR.</p>',
 '<div class="caveat"><b>How this was gathered, and what is missing.</b> Sportsbook sites and odds aggregators are blocked from this sandbox, so every number is quoted from Sept 18-20 press coverage of the books (BetMGM, FanDuel, DraftKings, Fanatics, Covers, SI, Dimers, BettingPros consensus), with the book named where the report named it. Caesars, bet365 and ESPN BET prices were not retrievable. Lines marked "not posted" were not found in any report, not necessarily absent at the book. Re-check the live board before wagering.</div>']
out.append('<h2>Game lines and implied team totals</h2><div class="tw"><table><thead><tr><th>Game</th><th>Book</th><th>Spread</th><th>Total</th><th>Moneyline</th></tr></thead><tbody>')
for g in GAMES:
    key,ko,books,fav,sp,tot,mv,note=g
    fp,dp=implied(fav,sp,tot)
    away,home=key.split(' @ ')
    dog=away if fav==home else home
    out.append(f'<tr class="g"><td colspan="5">{E(key)} · {E(ko)} &nbsp; <span class="n">{E(fav)} {fp:.2f} / {E(dog)} {dp:.2f} implied</span></td></tr>')
    for b,s,t,m in books: out.append(f'<tr><td></td><td>{E(b)}</td><td class="n">{E(s)}</td><td class="n">{E(t)}</td><td class="n">{E(m)}</td></tr>')
    out.append(f'<tr><td></td><td colspan="4"><div class="mv"><b>Movement:</b> {E(mv)}</div><div class="mv">{E(note)}</div></td></tr>')
out.append('</tbody></table></div>')
out.append('<h2>Player props and expected points</h2><div class="tw"><table><thead><tr><th>Player</th><th>Slot</th><th>Market</th><th>Line</th><th>Odds</th><th>Book</th><th>Expected</th><th>Notes</th></tr></thead><tbody>')
for p in PROPS:
    name,pos,tm,g,slot,lines,td,note=p
    ex=expected(p); exs=f'{ex:.1f}' if ex else '—'
    first=True
    for m,l,o,b in lines:
        cls='miss' if 'not posted' in l else ''
        out.append('<tr>'+(f'<td rowspan="{len(lines)}"><b>{E(name)}</b><br><span class="n">{pos} · {tm}</span><br><span class="mv">{E(g)}</span></td><td rowspan="{len(lines)}"><span class="slot {"on" if "start" in slot else ""}">{E(slot)}</span></td>' if first else '')+f'<td>{E(m)}</td><td class="n {cls}">{E(l)}</td><td class="n">{E(o)}</td><td>{E(b)}</td>'+(f'<td rowspan="{len(lines)}"><span class="exp">{exs}</span></td><td rowspan="{len(lines)}" class="nt">{E(note)}</td>' if first else '')+'</tr>')
        first=False
out.append('</tbody></table></div>')
out.append('<h2>Read of the numbers</h2><ul><li><b>QB:</b> Purdy in a 29-point offense with a 238.5 line beats Maye (23.5 team total, 223.5, INT line Yes -140).</li><li><b>RB:</b> Chase Brown (55% TD) and Kyren (61% TD, -195) are the two highest TD probabilities on the roster.</li><li><b>WR:</b> Pickens has the second-highest team total on your slate (27.5) and a 63.5 yards line. Nacua is the best expected number on the roster if he plays; his props were still up Sunday morning, the injury model says 68% to play, and the alternative is a bench receiver in a 16-to-19-point offense.</li><li><b>FLEX:</b> Price 61.5 rushing in a 22-point offense edges the receivers; Wan\'Dale (4.5 catches) and Doubs (39.5 yards, WR1 role) are within a point of each other and both ahead of Vele (NO 19 implied) and Tate.</li><li><b>TE:</b> Fannin\'s 35.5 with Tampa\'s TE history beats Pitts with Cooper Rush.</li><li><b>DST:</b> Miami implied 15.5 is the lowest team total in the league this week.</li></ul>')
out.append('<h2>Sources read</h2><ul class="src">'+''.join(f'<li>{E(s)}</li>' for s in [
"covers.com previews and anytime-TD picks (Sept 20)","sports.betmgm.com player prop blogs: Doubs, Price, Tate, Ward, Pollard, Shough, Olave, Henderson, Stroud, Judkins, Watson, Giants-Rams, Bengals-Texans","fanduel.com/research game updates (Etienne, Olave, Corum, Maye, Warren, Allgeier, Bryce Young, McMillan)","dknetwork.draftkings.com previews (Sept 19-20)","si.com/betting game previews and prop columns","dimers.com projections (Nacua 90 yds, Purdy 232, Dak 270)","bettingpros.com consensus pages (Kyren, Adams, Lamb, Maye rush, Dowdle, Doubs, Reed, Hutchinson)","actionnetwork.com NYG-LAR game page","rotowire.com Week 2 line-moves","thespread.com Sept 20 odds articles","betfanatics.com odds blogs","sportsbettingdime.com Week 2 props","athlonsports.com PIT-NE and PHI-TEN props","pff.com Week 2 anytime TD probabilities","nfl.com / therams.com / patriots.com / bengals.com injury reports","nflverse Week 1 box scores (usage figures)"])+'</ul>')
out.append('</div>')
open('week2-markets.html','w').write('\n'.join(out))
print('ok', sum(1 for p in PROPS), 'players;', len(GAMES),'games')

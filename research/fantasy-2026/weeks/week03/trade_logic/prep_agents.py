import pandas as pd, numpy as np, itertools, json
S='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad'
df=pd.read_csv(S+'/tl/league_table.csv')
OVR={'Josh Jacobs':'EXEMPT LIST, 4-6 game ban possible','Puka Nacua':'Q hip, sat Wk2, McVay unsure for Wk3','Nico Collins':'hamstring Gr1, out Wk2, back in 1-2 wks','Jordyn Tyson':'IR, back ~Wk6+','Brock Bowers':'doubtful Wk2, Wk3 unknown','Zay Flowers':'out Wk2 hamstring','A.J. Brown':'IR','Kyler Murray':'concussion, missed Wk2','DJ Moore':'Q Wk2, 0 catches','Dallas Goedert':'doubtful Wk2','RJ Harvey':'Q hamstring','Jordan Mason':'IR thumb ~4 wks'}
df['status']=df.player.map(OVR).fillna('')
prof=json.load(open(S+'/tl/profiles.json'))
NOTES={
'Ish':"League commissioner. Trade-happy, initiates offers. 1-0 after Wk1 with the league-high 192 pts. On Sept 23 he PROPOSED to Jamal: Bijan Robinson + Brian Thomas Jr. for Chase Brown + Puka Nacua + Kyler Murray. Earlier he declined Tate-for-Montgomery straight up. He is starting Adonai Mitchell at WR because Collins and DJ Moore are hurt; his TEs are Gadsden/Schultz with Goedert doubtful. He wants receivers and asked for Nacua even though Nacua is hurt.",
'Kdouh':"1-0 after Wk1. In a Sept 16 chat he asked for Chase Brown and offered: QJ (Judkins) + Coker; then QJ + Evans; then Evans + Aaron Jones; then Kyren for Evans straight; then Golden + Coker for Brown; then Evans + Golden for Brown. He said 'anyone can be had but you gotta pay the price', that Evans and Nabers are 'close' in his mind but he'd lean keeping Nabers, that QJ 'still gets 15 touches a game', and that he does NOT want the Titans WR core (Tate + Wan'Dale together). He refused Nabers + QJ for Chase Brown as too much. Jefferson and Lamb are his 1st/2nd round picks and effectively untouchable. He wants an elite RB.",
'Daoud':"1-0 after Wk1. On Sept 20 he said he is 'always' open to trades, that what interests him on Jamal's team is 'good WRs' and 'no running backs'. Jamal believes Daoud values Olave over Pickens. He starts 3 RBs (Javonte in FLEX) and his WR3 is Godwin/Michael Wilson.",
'Aoc':"Team 'Ocky and Brocky'. 0-1 after Wk1 (lost 125.66-128.5). A.J. Brown on IR, Zay Flowers out, Bowers was doubtful Wk2, RJ Harvey questionable. Started Juwan Johnson at TE and Rico Dowdle at FLEX in Wk2. $100 FAAB left. Drafted heavy WR early (A.J. Brown 19, Bowers 22, G. Wilson 39, Flowers 42, MHJ 59).",
'Billy':"Team 'The RICEman'. 0-1 after Wk1 despite 161 pts. Best roster in the league by consensus. Added Trevor Lawrence and Antonio Williams. Drafted Chase 3, Jeanty 18, K. Walker 23, Rice 38, Loveland 43. QB is Caleb Williams (drafted round 13) plus Lawrence.",
'Betto':"Team 'Amon One' (Ahmad Makled). 1-0 after Wk1 (162.36). Drafted ARSB 6, Hampton 15, McBride 26, McConkey 35, Burden 46. Added Jared Goff. Two TEs (McBride, Kraft).",
'Kass':"Team 'The Hall Monitor' (Kassem Amine). 0-1 after Wk1 (95.86, second-lowest). Drafted CMC 7, London 14, Breece 27, DeVonta 34, Waddle 47. QB is Jayden Daniels (drafted round 11). Two TEs (Kelce 37 yrs old, Ferguson). Switched DST to Patriots.",
'Hazime':"Team 'Ayri Feekon' (Ahmed Hazime). 1-0 after Wk1 (beat Jamal 122.6-84.0). Drafted JT 8, Henry 13, Higgins 28, McMillan 33, Adams 48, Bucky 53. QB is Stafford only (38 yrs old, drafted round 11). 8 WRs on roster, 4 RBs. No backup QB.",
'Moe':"Team 'Every Villain I...' (m. abdallah). 0-1 after Wk1 (137.32, lost to Ish). Drafted JSN 5, Achane 16, Love 25, Egbuka 36, Skattebo 45, Odunze 56, Kittle 65. Two QBs (Hurts, Dart). Seven WRs, RB thin behind Achane/Love.",
}
LEAGUE="""LEAGUE: 'Stairway to 7', ESPN, 10 teams, full PPR, 6-pt passing TD, +2 for 300 pass yds, no kicker.
Lineup: QB, 2 RB, 2 WR, TE, 2 FLEX (RB/WR/TE), DST, 6 bench, 1 IR. 6 of 10 make playoffs. FAAB waivers ($100 start).
Records: after Week 1 the winners were Ish, Betto, Daoud, Kdouh, Hazime. Jamal is 0-2 with the lowest points in the league (84 in Wk1). Other Week 2 results unknown.
Jamal's roster (Sept 23, may be one player off; ESPN shows Kyler Murray on it): """
cols=['player','pos','nfl','age','draft_pick','draft_round','pre_ecr','ros_ovr','ros_pos','wk3_rank','pts_w1','pts_w2','ep_w1','ep_w2','snap_w1','snap_w2','tgt_car_w1','tgt_car_w2','status','flags']
LEGEND="""COLUMN LEGEND: draft_pick/draft_round = where THIS league drafted him (name value the manager remembers paying). pre_ecr = FantasyPros preseason consensus overall rank (Aug 28) = public name value. ros_ovr / ros_pos = FantasyPros rest-of-season consensus overall / positional rank scraped Sept 18 (current market value). wk3_rank = FantasyPros Week 3 positional weekly rank. pts_w1/pts_w2 = actual points in THIS league's scoring. ep_w1/ep_w2 = expected fantasy points from usage (nflverse), i.e. opportunity; pts far below ep = unlucky/underperforming with usage intact, pts far above ep = overperforming. snap = offensive snap share. tgt_car = (targets, carries). flags: BUY-LOW = consensus still high, points low; SELL-HIGH = points high, consensus low; USAGE>OUTPUT / OUTPUT>USAGE = ep vs pts gap; AGE = decline-age; RISING/FALLING = consensus moved >=5 spots since Sept 4; NAME>CURRENT = public still remembers him as better than market now says (his owner likely overvalues); NAME<CURRENT = market moved up faster than public perception (his owner may undervalue)."""
def tbl(m): return df[df.manager==m][cols].round(1).to_string(index=False)
for m in NOTES:
    p=prof[m]
    txt=f"""You are role-playing {m}, a manager in this fantasy league. Think ONLY as {m}: his roster, his record, his needs, what he paid for players, what he has said in chats. You are NOT trying to help Jamal.

{LEAGUE}
{tbl('Jamal')}

YOUR TEAM ({m}):
{tbl(m)}

YOUR SITUATION (computed): best lineup {[(s,v[0]) for s,v in p['starters'].items()]}. Weak slots vs league median: {p['weak_slots']}. Strong slots: {p['strong_slots']}. Startable depth count: {p['depth_startable']}. Injuries: {p['injuries']}.
WHAT WE KNOW ABOUT YOU: {NOTES[m]}

{LEGEND}

OTHER TEAMS' NEEDS (for market context): """+"; ".join(f"{k}: weak {v['weak_slots']}, strong {v['strong_slots']}" for k,v in prof.items() if k not in (m,'Jamal'))+"""

TASK (answer as this manager, in first person, concise, no web searches, use only the data above plus general football knowledge as of Sept 24, 2026):
1. My untouchables and why (name value, what I paid, production).
2. Players I'd happily sell and what I'd want back (position/tier), including guys I think are 'names' the market overrates and guys I think are about to fall off.
3. My real needs for the next 4 weeks vs rest of season (injuries, byes, weak slots).
4. Which of Jamal's players I actually want, ranked, and which I have zero interest in (say why, e.g. 'Titans WRs', 'a 4th QB', 'a TE2').
5. Three specific trade proposals I would ACCEPT today if Jamal sent them (give exact players both ways). Each must be one I'd genuinely say yes to as this manager, not a gift to Jamal. Note for each why I'd accept.
6. Three offers from Jamal I would REJECT and the counter I'd send.
Keep it under 500 words. Output plain text with those 6 numbered sections."""
    open(S+f'/tl/agent_{m}.md','w').write(txt)
print('written', list(NOTES))

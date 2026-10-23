"""League-wide Nacua trade engine.
Input: rosters CSV (manager,player) -> values every package for Nacua for both sides over Weeks 8-17.
ppg = 0.5*curve(ROS positional ECR, Oct 16) + 0.5*EP (half season, half last-3 games); byes from schedule;
weekly best lineup QB/2RB/2WR/TE/2FLEX with waiver replacement fill. Nacua availability set by NACUA_OUT weeks."""
import pandas as pd, numpy as np, itertools, re, sys, os, json
S='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad'
RAW=S+'/nac/raw'
ROSTERS=sys.argv[1] if len(sys.argv)>1 else S+'/nl/rosters_current.csv'
NACUA_OUT=int(os.environ.get('NACUA_OUT','1'))   # calendar weeks missed counting Week 7 (1 = back Week 8)
WEEKS=list(range(8,18)); PLAY=[15,16,17]
def norm(x): return re.sub(r"[^a-z]","",re.sub(r"\s(jr|sr|ii|iii|iv)\.?$","",str(x).lower().replace("'","")))
CURVE={'QB':(33.39,5.27),'RB':(31.75,6.57),'WR':(29.04,5.16),'TE':(21.11,4.19)}
REPL={'QB':18.07,'RB':7.53,'WR':8.60,'TE':9.31}
ecr=pd.read_csv(RAW+'/ecr.csv',low_memory=False)
PG={'QB':'/nfl/rankings/ros-qb.php','RB':'/nfl/rankings/ros-ppr-rb.php','WR':'/nfl/rankings/ros-ppr-wr.php','TE':'/nfl/rankings/ros-ppr-te.php'}
POSR={};TEAM={}
for pos,pg in PG.items():
    for r in ecr[ecr.fp_page==pg].itertuples(): POSR[norm(r.player)]=(pos,float(r.ecr)); TEAM[norm(r.player)]=r.team
OVR={norm(r.player):float(r.ecr) for r in ecr[ecr.fp_page=='/nfl/rankings/ros-ppr-overall.php'].itertuples()}
ep=pd.read_csv(RAW+'/ep.csv'); ep['k']=ep.full_name.map(norm); ep=ep.sort_values('week')
EPS={k:(g.total_fantasy_points_exp.mean(),g.tail(3).total_fantasy_points_exp.mean(),g.position.iloc[-1],g.posteam.iloc[-1]) for k,g in ep.groupby('k')}
games=pd.read_csv(RAW+'/games.csv'); games=games[games.season==2026]
PLAYS={}
for w in WEEKS:
    gw=games[games.week==w]; PLAYS[w]=set(gw.home_team)|set(gw.away_team)
TFIX={'LAR':'LA','JAC':'JAX','WSH':'WAS'}
# status overrides: (ppg override or None, first week available)
OVRD={norm('Terry McLaurin'):(0,99), norm('Jordyn Tyson'):(10.5,10), norm('Carnell Tate'):(9.0,8),
      norm('Davante Adams'):(None,9)}
def ppg(name):
    k=norm(name)
    if k in OVRD and OVRD[k][0] is not None: return OVRD[k][0]
    pos,rk=POSR.get(k,(None,None))
    e=EPS.get(k)
    if pos is None:
        if e is None: return 0.0
        pos=e[2]; rk={'QB':28,'RB':55,'WR':75,'TE':28}.get(pos,60)
    a,b=CURVE.get(pos,(10,0)); c=max(a-b*np.log(max(rk,1)),0)
    if e is None or pos=='QB': return round(c,2)
    eb=0.5*e[0]+0.5*(e[1] if not np.isnan(e[1]) else e[0])
    return round(0.5*c+0.5*eb,2)
def info(name):
    k=norm(name); pos=POSR.get(k,(None,))[0] or (EPS[k][2] if k in EPS else None)
    tm=TEAM.get(k) or (EPS[k][3] if k in EPS else None); tm=TFIX.get(tm,tm)
    return pos,tm
def avail(name,w):
    k=norm(name)
    if k==norm('Puka Nacua') and w<7+NACUA_OUT: return False
    if k in OVRD and w<OVRD[k][1]: return False
    pos,tm=info(name)
    return tm in PLAYS[w] if tm else True
def lineup(players,w):
    pool=[(ppg(p),info(p)[0]) for p in players if info(p)[0] in REPL and avail(p,w)]
    pool.sort(reverse=True); used=[False]*len(pool); tot=0
    for pos,n in [('QB',1),('RB',2),('WR',2),('TE',1)]:
        got=0
        for i,(v,ps) in enumerate(pool):
            if got<n and not used[i] and ps==pos and v>REPL[pos]: used[i]=True; tot+=v; got+=1
        tot+=REPL[pos]*(n-got)
    got=0
    for i,(v,ps) in enumerate(pool):
        if got<2 and not used[i] and ps in('RB','WR','TE') and v>REPL['WR']: used[i]=True; tot+=v; got+=1
    tot+=REPL['WR']*(2-got)
    return tot
def season(players): 
    return sum(lineup(players,w) for w in WEEKS), sum(lineup(players,w) for w in PLAY)
def paper(names): return sum(100*np.exp(-OVR.get(norm(n),250)/45) for n in names)
if __name__=='__main__':
    R=pd.read_csv(ROSTERS); T={m:list(g.player) for m,g in R.groupby('manager')}
    J=T['Jamal']; base_j=season(J)
    JEXTRA=[None]+[p for p in J if p not in ('Puka Nacua',) and info(p)[0] in REPL]
    out=[]
    for m,ro in T.items():
        if m=='Jamal': continue
        base_p=season(ro)
        cand=[p for p in ro if info(p)[0] in REPL and ppg(p)>=7]
        for k in (1,2,3):
            for get in itertools.combinations(cand,k):
                for ex in JEXTRA:
                    give=['Puka Nacua']+([ex] if ex else [])
                    nj=[p for p in J if p not in give]+list(get); np_=[p for p in ro if p not in get]+give
                    sj=season(nj); sp=season(np_)
                    out.append(dict(partner=m,give=' + '.join(give),get=' + '.join(get),
                        jamal_d=round(sj[0]-base_j[0],1),jamal_po=round(sj[1]-base_j[1],1),
                        partner_d=round(sp[0]-base_p[0],1),partner_po=round(sp[1]-base_p[1],1),
                        paper_partner=round(paper(give)-paper(get),1),n_get=k))
    df=pd.DataFrame(out); df.to_csv(os.environ.get('OUT',S+'/nl/candidates.csv'),index=False); print(len(df),'packages')

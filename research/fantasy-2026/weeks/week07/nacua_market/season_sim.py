"""Monte Carlo of the rest of the regular season (Weeks 7-14) from real rosters and records.
Each player scores ppg x gamma noise; managers start the best expected lineup among available players;
waiver replacement fills empty slots; random small weekly injury risk; byes and IR from engine.
Week 7 matchups are known; Weeks 8-14 opponents are random each sim (actual schedule not provided).
Playoffs: top 6 by wins, tiebreak points for."""
import sys, os, json, numpy as np, pandas as pd
S='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad'
sys.argv=[sys.argv[0]]+sys.argv[1:]
_src=open(S+'/nl/engine.py').read().split("if __name__")[0]
exec(_src)
CVP={'QB':0.35,'RB':0.55,'WR':0.6,'TE':0.65}
REC={'Jamal':(2,4),'Ish':(2,4),'Billy':(2,4),'Kass':(3,3),'Moe':(3,3),'Aoc':(3,3),'Betto':(3,3),'Kdouh':(4,2),'Daoud':(4,2),'Hazime':(4,2)}
PF0={m:720.0 for m in REC}; PF0['Jamal']=690.0   # actual points-for not provided; Jamal assumed lowest
WK7=[('Ish','Kdouh'),('Kass','Jamal'),('Billy','Daoud'),('Moe','Aoc'),('Betto','Hazime')]
WEEKS_LEFT=list(range(7,15))
INJ_WEEKLY=0.04
def nacua_out_weeks(rng):
    # calendar weeks missed starting Week 7 (0 = plays Week 7)
    return rng.choice([0,1,2,3,5,9],p=[0.30,0.35,0.15,0.10,0.06,0.04])
def avail_base(p,w):
    k=norm(p)
    if k in OVRD and w<OVRD[k][1]: return False
    pos,tm=info(p)
    if w>=8: return (tm in PLAYS[w]) if tm else True
    return tm not in ('BUF','JAX','LAC','WAS') if tm else True   # Week 7 byes
def simulate(rosters,n=3000,seed=7):
    rng=np.random.default_rng(seed); teams=list(rosters)
    P={m:[(p,info(p)[0],ppg(p)) for p in ro if info(p)[0] in REPL] for m,ro in rosters.items()}
    made={m:0 for m in teams}; wins_tot={m:0.0 for m in teams}
    for s in range(n):
        W={m:REC[m][0] for m in teams}; PF=dict(PF0)
        nout=nacua_out_weeks(rng); hurt={}
        for w in WEEKS_LEFT:
            sc={}
            for m in teams:
                pool=[]
                for p,pos,v in P[m]:
                    if not avail_base(p,w): continue
                    if p=='Puka Nacua' and w<7+nout: continue
                    if hurt.get(p,0)>=w: continue
                    if rng.random()<INJ_WEEKLY: hurt[p]=w+int(rng.integers(0,3)); continue
                    pool.append((v,pos,p))
                pool.sort(reverse=True); used=set(); tot=0.0
                for pos,k in (('QB',1),('RB',2),('WR',2),('TE',1)):
                    c=[x for x in pool if x[1]==pos and x[2] not in used and x[0]>REPL[pos]][:k]
                    for v,ps,p in c: used.add(p); tot+=v*rng.gamma(1/CVP[ps]**2,CVP[ps]**2)
                    tot+=sum(REPL[pos]*rng.gamma(1/0.5**2,0.5**2) for _ in range(k-len(c)))
                c=[x for x in pool if x[1] in('RB','WR','TE') and x[2] not in used and x[0]>REPL['WR']][:2]
                for v,ps,p in c: used.add(p); tot+=v*rng.gamma(1/CVP[ps]**2,CVP[ps]**2)
                tot+=sum(REPL['WR']*rng.gamma(4,0.25) for _ in range(2-len(c)))
                tot+=7.0*rng.gamma(4,0.25)   # DST, same distribution for all
                sc[m]=tot; PF[m]+=tot
            if w==7: pairs=WK7
            else:
                perm=list(rng.permutation(teams)); pairs=[(perm[i],perm[i+1]) for i in range(0,10,2)]
            for a,b in pairs:
                if sc[a]>sc[b]: W[a]+=1
                else: W[b]+=1
        order=sorted(teams,key=lambda m:(-W[m],-PF[m]))
        for m in order[:6]: made[m]+=1
        for m in teams: wins_tot[m]+=W[m]
    return {m:dict(playoffs=round(100*made[m]/n,1),wins=round(wins_tot[m]/n,2)) for m in teams}
def apply(rosters,trades):
    R={m:list(v) for m,v in rosters.items()}
    for partner,give,get in trades:
        for p in give: R['Jamal'].remove(p); R[partner].append(p)
        for p in get: R[partner].remove(p); R['Jamal'].append(p)
    return R
if __name__=='__main__':
    R=pd.read_csv(S+'/nl/rosters_current.csv'); ROS={m:list(g.player) for m,g in R.groupby('manager')}
    trades=json.loads(sys.argv[1]) if len(sys.argv)>1 else []
    n=int(os.environ.get('N','3000'))
    res=simulate(apply(ROS,trades),n=n,seed=int(os.environ.get('SEED','7')))
    print(json.dumps(res))

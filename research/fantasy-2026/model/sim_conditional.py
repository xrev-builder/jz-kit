import sys; sys.argv=['x','1']
exec(open('sim_season.py').read().split("if __name__=='__main__':")[0])
import numpy as np, pandas as pd
lg='A'; P=project(lg); slot=1; n=1500
ro=['Jahmyr Gibbs','Trey McBride','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Jameson Williams','Justin Herbert','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers']
rec=[]
for s in range(n):
    teams=draft_opponents(P,slot,ro); allp=set(k for t in teams.values() for k in t)
    avail={k:~sample_missed(k,P[k]) for k in allp}
    W=np.zeros(10); PF=np.zeros(10)
    for wk in range(1,15):
        perm=rng.permutation(10); sc={t:lineup_points(teams[t],P,wk,avail,lg) for t in range(10)}
        for i in range(0,10,2):
            a,b=perm[i],perm[i+1]; PF[a]+=sc[a]; PF[b]+=sc[b]
            if sc[a]>sc[b]: W[a]+=1
            else: W[b]+=1
    seed=sorted(range(10),key=lambda t:(-W[t],-PF[t])); po=seed[:8]; made=slot in po
    def game(a,b,wk): return a if lineup_points(teams[a],P,wk,avail,lg)>=lineup_points(teams[b],P,wk,avail,lg) else b
    r1=[game(po[0],po[7],15),game(po[1],po[6],15),game(po[2],po[5],15),game(po[3],po[4],15)]
    r2=[game(r1[0],r1[3],16),game(r1[1],r1[2],16)]; champ=game(r2[0],r2[1],17)
    gm=int((~avail['Jahmyr Gibbs'][1:18]).sum()); gpo=int((~avail['Jahmyr Gibbs'][15:18]).sum())
    mm=int((~avail['Trey McBride'][1:18]).sum())
    rec.append(dict(made=made,title=champ==slot,gibbs_missed=gm,gibbs_missed_playoffs=gpo,mcbride_missed=mm))
d=pd.DataFrame(rec)
def rep(mask,name): 
    t=d[mask]; print(f"{name:45s} n={len(t):5d}  P(playoffs)={t.made.mean():.3f}  P(title)={t.title.mean():.3f}")
rep(d.gibbs_missed==0,'Gibbs plays all 17')
rep(d.gibbs_missed.between(1,3),'Gibbs misses 1-3')
rep(d.gibbs_missed.between(4,7),'Gibbs misses 4-7')
rep(d.gibbs_missed>=8,'Gibbs misses 8+')
rep(d.gibbs_missed_playoffs>0,'Gibbs misses any playoff week (15-17)')
rep(d.gibbs_missed_playoffs==0,'Gibbs available all playoff weeks')
rep(d.mcbride_missed>=4,'McBride misses 4+')
rep(d.mcbride_missed==0,'McBride plays all 17')
print('overall', d.made.mean().round(3), d.title.mean().round(3))

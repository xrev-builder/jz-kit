import pandas as pd, numpy as np
D='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/data/'
exec(open('master.py').read().split("s25=season(2025)")[0])
pl=pd.read_csv(D+'players.csv',low_memory=False)[['gsis_id','birth_date']].dropna().drop_duplicates('gsis_id'); pl['birth']=pd.to_datetime(pl.birth_date,errors='coerce'); pl=pl.set_index('gsis_id')['birth']
S={}
for yr in range(2019,2026):
    s=season(yr); suf=str(yr)[2:]; S[yr]=s.rename(columns={f'ppgA_{suf}':'ppg',f'g_{suf}':'g'})[['name','pos','ppg','g']]
rows=[]
for y0 in range(2019,2025):
    a=S[y0]; b=S[y0+1]
    j=a[a.g>=8].join(b[['ppg','g']],rsuffix='_next',how='left')
    j['age']=((pd.Timestamp(f'{y0+1}-09-10')-j.index.map(pl)).days/365.25)
    j['year']=y0+1
    j['rank0']=j.groupby('pos').ppg.rank(ascending=False)
    rows.append(j)
T=pd.concat(rows); T=T[T.age.notna()]
T['played_next']=T.g_next.fillna(0)>=8
T['d']=T.ppg_next-T.ppg
def band(r):
    a=r.age
    if r.pos=='RB': return '<=24' if a<=24.5 else ('25-26' if a<27 else ('27-28' if a<29 else ('29-30' if a<31 else '31+')))
    return '<=24' if a<=24.5 else ('25-27' if a<28 else ('28-29' if a<30 else ('30-31' if a<32 else '32+')))
T['band']=T.apply(band,axis=1)
print("== Within-player change in ppg next season by age band, players who played 8+ games both years (2019-2025, 6 transitions) ==")
q=T[T.played_next&(T.ppg>=8)]
print(q.groupby(['pos','band']).d.agg(['count','mean','median']).round(2).unstack('band').to_string())
print("\n== After a TOP-12 (RB/WR) or TOP-6 (TE/QB) ppg finish: what happens next year ==")
for pos,n in (('RB',12),('WR',12),('TE',6),('QB',6)):
    t=T[(T.pos==pos)&(T.rank0<=n)]
    nxt=t[t.played_next]; 
    print(f"{pos}: {len(t)} top-{n} seasons. Next year: played 8+ games {t.played_next.mean()*100:.0f}% | of those, mean ppg change {nxt.d.mean():+.2f} | repeated top-{n} {((nxt.ppg_next>=nxt.groupby('year').ppg_next.transform(lambda x: x.nlargest(n).min()))).mean()*100:.0f}% (rough) | dropped 5+ ppg {(nxt.d<=-5).mean()*100:.0f}%")
    for bnd,g in t.groupby('band'):
        gg=g[g.played_next]
        if len(g)>=5: print(f"    age {bnd:6s} n={len(g):3d} played8+ {g.played_next.mean()*100:3.0f}%  mean change {gg.d.mean():+.2f}  dropped 5+ {(gg.d<=-5).mean()*100:.0f}%")
print("\n== Career-year test: players whose ppg jumped 4+ over their prior year, what happened the year after (RB/WR) ==")
# need three consecutive years
rows=[]
for y in range(2020,2025):
    a=S[y-1]; b=S[y]; c=S[y+1]
    j=b[b.g>=8].join(a[['ppg','g']],rsuffix='_prev').join(c[['ppg','g']],rsuffix='_next')
    j=j[(j.g_prev>=8)&(j.pos.isin(['RB','WR']))]
    j['jump']=j.ppg-j.ppg_prev; j['d_next']=j.ppg_next-j.ppg; rows.append(j)
J=pd.concat(rows)
for pos in ['RB','WR']:
    t=J[J.pos==pos]; big=t[(t.jump>=4)&(t.ppg>=14)]; steady=t[(t.jump.abs()<2)&(t.ppg>=14)]
    print(f"{pos}: career-year (jump 4+ to 14+ ppg) n={len(big)}: next-year change {big.d_next.mean():+.2f} (played 8+: {(big.g_next.fillna(0)>=8).mean()*100:.0f}%) | steady 14+ ppg n={len(steady)}: next-year change {steady.d_next.mean():+.2f}")
# age coefficient controlling for prior ppg (all years)
import numpy.linalg as la
print("\n== Age coefficient per year, controlling for last year's ppg (players 8+ g both years, 2019-2025) ==")
for pos in ['RB','WR','TE','QB']:
    t=q[q.pos==pos]; X=np.column_stack([np.ones(len(t)),t.ppg,t.age,np.maximum(0,t.age-(28 if pos=='RB' else 30))]); y=t.ppg_next.values
    b_=la.lstsq(X,y,rcond=None)[0]; print(f"{pos}: n={len(t)}  ppg carry {b_[1]:.2f}  age {b_[2]:+.2f}/yr  extra per yr past {28 if pos=='RB' else 30}: {b_[3]:+.2f}")
T.to_csv('longrun_transitions.csv')

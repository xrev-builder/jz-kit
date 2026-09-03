import pandas as pd, numpy as np, numpy.linalg as la
D='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/data/'
exec(open('master.py').read().split("s25=season(2025)")[0])
pl=pd.read_csv(D+'players.csv',low_memory=False)[['gsis_id','birth_date']].dropna().drop_duplicates('gsis_id'); pl['birth']=pd.to_datetime(pl.birth_date,errors='coerce'); pl=pl.set_index('gsis_id')['birth']
S={}
for yr in range(2012,2026):
    s=season(yr); suf=str(yr)[2:]; S[yr]=s.rename(columns={f'ppgA_{suf}':'ppg',f'g_{suf}':'g'})[['name','pos','ppg','g']]
rows=[]
for y0 in range(2012,2025):
    a=S[y0]; b=S[y0+1]; j=a[a.g>=8].join(b[['ppg','g']],rsuffix='_next',how='left')
    j['age']=((pd.Timestamp(f'{y0+1}-09-10')-j.index.map(pl)).days/365.25); j['year']=y0+1; j['rank0']=j.groupby('pos').ppg.rank(ascending=False); rows.append(j)
T=pd.concat(rows); T=T[T.age.notna()]; T['played_next']=T.g_next.fillna(0)>=8; T['d']=T.ppg_next-T.ppg
T['era']=np.where(T.year<=2018,'2013-18','2019-25')
q=T[T.played_next&(T.ppg>=8)]
print("== Age coefficients by era (controls for prior ppg; knee at RB 28 / others 30) ==")
for pos in ['RB','WR','TE','QB']:
    for era,t in q[q.pos==pos].groupby('era'):
        X=np.column_stack([np.ones(len(t)),t.ppg,t.age,np.maximum(0,t.age-(28 if pos=='RB' else 30))]); b_=la.lstsq(X,t.ppg_next.values,rcond=None)[0]
        print(f"  {pos} {era}: n={len(t):4d} carry {b_[1]:.2f} age {b_[2]:+.2f}/yr extra past knee {b_[3]:+.2f}")
    t=q[q.pos==pos]; X=np.column_stack([np.ones(len(t)),t.ppg,t.age,np.maximum(0,t.age-(28 if pos=='RB' else 30))]); b_=la.lstsq(X,t.ppg_next.values,rcond=None)[0]
    print(f"  {pos} ALL 2013-25: n={len(t):4d} carry {b_[1]:.2f} age {b_[2]:+.2f}/yr extra past knee {b_[3]:+.2f}")
def band(r):
    a=r.age
    if r.pos=='RB': return '<=24' if a<=24.5 else ('25-26' if a<27 else ('27-28' if a<29 else ('29-30' if a<31 else '31+')))
    return '<=24' if a<=24.5 else ('25-27' if a<28 else ('28-29' if a<30 else ('30-31' if a<32 else '32+')))
T['band']=T.apply(band,axis=1)
print("\n== Top-12 RB/WR (top-6 TE/QB) finishers: next year, 2013-2025 (13 transitions) ==")
for pos,n in (('RB',12),('WR',12),('TE',6),('QB',6)):
    t=T[(T.pos==pos)&(T.rank0<=n)]
    print(f"{pos}: {len(t)} seasons | played 8+ next {t.played_next.mean()*100:.0f}% | mean change {t[t.played_next].d.mean():+.2f} | dropped 5+ {(t[t.played_next].d<=-5).mean()*100:.0f}% | still top-{n} next year {(t.groupby('year').apply(lambda g: (g.played_next&(T[(T.pos==pos)&(T.year==g.year.iloc[0]+0)].ppg_next.rank(ascending=False).reindex(g.index)<=n)).mean()) if False else 0)}")
    for bnd,g in t.groupby('band'):
        gg=g[g.played_next]
        if len(g)>=8: print(f"    age {bnd:6s} n={len(g):3d} played8+ {g.played_next.mean()*100:3.0f}%  mean change {gg.d.mean():+.2f}  median {gg.d.median():+.2f}  dropped 5+ {(gg.d<=-5).mean()*100:.0f}%")
# repeat rate computed properly: rank next year among that year's players
print("\n== Repeat rate: top-12 RB/WR (top-6 TE/QB) who finished top-12/top-6 again next year ==")
for pos,n in (('RB',12),('WR',12),('TE',6),('QB',6)):
    reps=[]; 
    for y in range(2013,2026):
        cur=T[(T.pos==pos)&(T.year==y)]; top=cur[cur.rank0<=n]
        nxt=S[y][S[y].g>=8] if y in S else None
        nr=S[y].assign(r=S[y][S[y].g>=8].groupby('pos').ppg.rank(ascending=False))
        ok=nr.loc[nr.index.intersection(top.index)]
        reps.append(((ok.r<=n).sum(), len(top)))
    a=sum(x for x,_ in reps); b=sum(y for _,y in reps); print(f"  {pos}: {a}/{b} = {a/b*100:.0f}%")
print("\n== Career-year test 2013-2025 (RB/WR, jump 4+ to 14+ ppg vs steady 14+) ==")
rows=[]
for y in range(2013,2025):
    a=S[y-1]; b=S[y]; c=S[y+1]; j=b[b.g>=8].join(a[['ppg','g']],rsuffix='_prev').join(c[['ppg','g']],rsuffix='_next'); j=j[(j.g_prev>=8)&(j.pos.isin(['RB','WR']))]; j['jump']=j.ppg-j.ppg_prev; j['d_next']=j.ppg_next-j.ppg; rows.append(j)
J=pd.concat(rows)
for pos in ['RB','WR']:
    t=J[J.pos==pos]; big=t[(t.jump>=4)&(t.ppg>=14)]; steady=t[(t.jump.abs()<2)&(t.ppg>=14)]
    print(f"  {pos}: career-year n={len(big)} next {big.d_next.mean():+.2f} (played 8+ {(big.g_next.fillna(0)>=8).mean()*100:.0f}%) | steady n={len(steady)} next {steady.d_next.mean():+.2f} | extra regression {big.d_next.mean()-steady.d_next.mean():+.2f}")
T.to_csv('longrun_transitions_2012_2025.csv')

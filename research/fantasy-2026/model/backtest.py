"""Holdout backtest of the projection, injury, and variance components: fit on 2023-2024, test on 2025."""
import pandas as pd, numpy as np
D='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/data/'
exec(open('master.py').read().split("s25=season(2025)")[0])
S={yr:season(yr) for yr in (2023,2024,2025)}
POOL={'RB':12,'WR':12,'TE':9,'QB':17}
def curve_from(s,suf):
    return {pos:s[(s.pos==pos)&(s[f'g_{suf}']>=8)][f'ppgA_{suf}'].sort_values(ascending=False).values for pos in POOL}
# consensus proxy for 2025 preseason = positional rank by 2024 ppg (a weak stand-in for ECR, which is not on disk for 2025)
a=S[2024]; b=S[2025]; p=S[2023]
j=a[(a.g_24>=8)][['name','pos','ppgA_24','g_24']].join(p[['ppgA_23','g_23']],how='left').join(b[['ppgA_25','g_25']],how='inner')
j=j[(j.g_25>=8)&(j.ppgA_24>=8)].copy()
cur23=curve_from(S[2023],'23'); cur24=curve_from(S[2024],'24')
def curve(pos,rank):
    c=np.mean([np.pad(cur23[pos][:60],(0,max(0,60-len(cur23[pos][:60]))),'edge'),np.pad(cur24[pos][:60],(0,max(0,60-len(cur24[pos][:60]))),'edge')],axis=0)
    return c[min(max(int(rank),1),60)-1]
j['rank24']=j.groupby('pos').ppgA_24.rank(ascending=False)
j['prior']=np.where(j.g_23>=8,j.ppgA_23,j.pos.map(POOL))
j['shrunk']=(j.g_24*j.ppgA_24+8*j.prior)/(j.g_24+8)
j['curve']=[curve(pos,r) for pos,r in zip(j.pos,j.rank24)]
j['model']=0.5*j.shrunk+0.5*j.curve
j['naive']=j.ppgA_24
j['shrunk_only']=j.shrunk
print("== Projection holdout: predict 2025 ppg (players with 8+ games both years, ppg24>=8) ==")
for pos in ['RB','WR','TE','QB','ALL']:
    t=j if pos=='ALL' else j[j.pos==pos]
    line=f"{pos:4s} n={len(t):3d} "
    for c in ['naive','shrunk_only','model']:
        mae=(t[c]-t.ppgA_25).abs().mean(); rho=t[[c,'ppgA_25']].corr(method='spearman').iloc[0,1]; bias=(t[c]-t.ppgA_25).mean()
        line+=f"| {c}: MAE {mae:4.2f} rho {rho:.2f} bias {bias:+.2f} "
    print(line)
# top-of-board hit rates: of the model's top-12 at each position, how many finished top-12 by 2025 ppg?
print("\n== Top-12 hit rate (model's preseason top 12 by position -> finished top 12 in 2025 ppg, among the tested pool) ==")
for pos in ['RB','WR','TE','QB']:
    t=j[j.pos==pos].copy(); t['r_model']=t.model.rank(ascending=False); t['r_naive']=t.naive.rank(ascending=False); t['r_act']=t.ppgA_25.rank(ascending=False)
    n=12 if pos in('RB','WR') else 6
    hm=((t.r_model<=n)&(t.r_act<=n)).sum(); hn=((t.r_naive<=n)&(t.r_act<=n)).sum()
    print(f"{pos}: model {hm}/{n}  naive {hn}/{n}")
print("\n== Injury model holdout: buckets fit on 2023->2024 only, tested on 2024->2025 ==")
tr=pd.read_csv('injury_transitions.csv')
fit=tr[tr.season==2024]; test=tr[tr.season==2025]
bm=fit.groupby(['pos','age_band','prior_band']).missed_next.agg(['mean','count']); pm=fit.groupby('pos').missed_next.mean()
def pred(r):
    k=(r.pos,r.age_band,r.prior_band)
    if k in bm.index and bm.loc[k,'count']>=8: mu,n=bm.loc[k,'mean'],bm.loc[k,'count']
    else: mu,n=pm[r.pos],0
    return (n*mu+10*pm[r.pos])/(n+10)
test=test.copy(); test['pred']=test.apply(pred,axis=1); test['naive']=test.pos.map(pm); test['zero']=0
for c in ['pred','naive','zero']:
    print(f"{c:6s} MAE {(test[c]-test.missed_next).abs().mean():.2f}  bias {(test[c]-test.missed_next).mean():+.2f}  corr {test[[c,'missed_next']].corr().iloc[0,1] if c!='zero' else float('nan'):.2f}")
print("by position (pred vs actual mean missed):"); print(test.groupby('pos').agg(pred=('pred','mean'),actual=('missed_next','mean'),n=('pred','size')).round(2).to_string())
# calibration of P(miss>=8): predicted bucket rate vs actual
fit8=fit.groupby(['pos','age_band','prior_band']).missed_next.apply(lambda x:(x>=8).mean())
test['p8']=[fit8.get((r.pos,r.age_band,r.prior_band),np.nan) for r in test.itertuples()]
t8=test.dropna(subset=['p8']); t8['q']=pd.qcut(t8.p8,3,labels=['low','mid','high'],duplicates='drop')
print("P(miss 8+) calibration (fit 2023->24, test 2024->25):"); print(t8.groupby('q',observed=True).agg(pred=('p8','mean'),actual=('missed_next',lambda x:(x>=8).mean()),n=('p8','size')).round(2).to_string())
print("\n== Weekly variance: 2024 player sd -> 2025 realized sd (8+ games both years) ==")
W={}
for yr in (2024,2025):
    w=pd.read_csv(D+f'stats_player_week_{yr}.csv',low_memory=False); w=w[(w.season_type=='REG')&(w.position.isin(['QB','RB','WR','TE']))].copy(); w['pts']=score(w,'A')
    W[yr]=w.groupby('player_id').pts.agg(['mean','std','count'])
v=W[2024].join(W[2025],lsuffix='24',rsuffix='25',how='inner'); v=v[(v['count24']>=8)&(v['count25']>=8)&(v['mean24']>=8)]
print(f"n={len(v)}  corr(sd24, sd25)={v.std24.corr(v.std25):.2f}   mean sd24={v.std24.mean():.2f} mean sd25={v.std25.mean():.2f}")
cv=v.std24/v['mean24']; print(f"CV persistence corr={cv.corr(v.std25/v['mean25']):.2f}; mean CV 2024 {cv.mean():.2f}, 2025 {(v.std25/v['mean25']).mean():.2f}")
# normal-interval coverage: share of 2025 weeks within mean24 +/- 1.645*sd24 (90% nominal)
w25=pd.read_csv(D+'stats_player_week_2025.csv',low_memory=False); w25=w25[(w25.season_type=='REG')&(w25.position.isin(['QB','RB','WR','TE']))].copy(); w25['pts']=score(w25,'A')
w25=w25.join(v[['mean24','std24']],on='player_id',how='inner')
cov=((w25.pts>=w25.mean24-1.645*w25.std24)&(w25.pts<=w25.mean24+1.645*w25.std24)).mean()
print(f"90% normal interval built from 2024 mean/sd covered {cov*100:.0f}% of 2025 weeks (nominal 90%)")

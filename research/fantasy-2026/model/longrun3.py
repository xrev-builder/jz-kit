import pandas as pd, numpy as np
D='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/data/'
exec(open('master.py').read().split("s25=season(2025)")[0])
pl=pd.read_csv(D+'players.csv',low_memory=False)[['gsis_id','birth_date']].dropna().drop_duplicates('gsis_id'); pl['birth']=pd.to_datetime(pl.birth_date,errors='coerce'); pl=pl.set_index('gsis_id')['birth']
YRS=list(range(2012,2026)); S={}
for yr in YRS:
    s=season(yr); suf=str(yr)[2:]; S[yr]=s.rename(columns={f'ppgA_{suf}':'ppg',f'g_{suf}':'g',f'ptsA_{suf}':'pts'})[['name','pos','ppg','g','pts']]
G={yr:16 if yr<2021 else 17 for yr in YRS}
# ---------- 1. injury transitions 2013-2025 ----------
rows=[]
for y0 in YRS[:-1]:
    a=S[y0]; b=S[y0+1]; keep=[]
    for pos,n in [('RB',70),('WR',70),('TE',24),('QB',24)]: keep.append(a[(a.pos==pos)&(a.g>=6)].sort_values('pts',ascending=False).head(n))
    a=pd.concat(keep); j=a.join(b[['g']].rename(columns={'g':'g_next'}),how='left'); j['g_next']=j.g_next.fillna(0)
    j['age']=((pd.Timestamp(f'{y0+1}-09-10')-j.index.map(pl)).days/365.25)
    j['missed_prior']=G[y0]-j.g; j['missed_next']=G[y0+1]-j.g_next; j['season']=y0+1; rows.append(j.reset_index())
t=pd.concat(rows); t=t[~((t.pos=='QB')&(t.g_next==0))]; t=t[t.age.notna()]
def ab(r): return ('<27' if r.age<27 else ('27-28' if r.age<29 else '29+')) if r.pos=='RB' else (('<30' if r.age<30 else '30+') if r.pos=='WR' else 'all')
t['age_band']=t.apply(ab,axis=1); t['prior_band']=pd.cut(t.missed_prior,[-1,0,3,17],labels=['0','1-3','4+']).astype(str)
t['era']=np.where(t.season<=2018,'2013-18','2019-25')
pass
pass
summ=t.groupby(['pos','age_band','prior_band']).missed_next.agg(n='size',mean_missed='mean',p_miss4=lambda x:(x>=4).mean(),p_miss8=lambda x:(x>=8).mean()).round(2)
pass
# holdout: fit 2013-2023, test 2024-2025
fit=t[t.season<=2023]; test=t[t.season>=2024]
bm=fit.groupby(['pos','age_band','prior_band']).missed_next.agg(['mean','count']); pm=fit.groupby('pos').missed_next.mean()
def pred(r):
    k=(r.pos,r.age_band,r.prior_band); mu,n=(bm.loc[k,'mean'],bm.loc[k,'count']) if k in bm.index else (pm[r.pos],0)
    return (n*mu+10*pm[r.pos])/(n+10)
test=test.copy(); test['pred']=test.apply(pred,axis=1); test['naive']=test.pos.map(pm)
print(f"\nHoldout 2024-25 (fit 2013-23): bucket model MAE {(test.pred-test.missed_next).abs().mean():.2f} corr {test.pred.corr(test.missed_next):.2f} | position-only MAE {(test.naive-test.missed_next).abs().mean():.2f} corr {test.naive.corr(test.missed_next):.2f} | n={len(test)}")
print("corr(missed_prior, missed_next) all years:", round(t.missed_prior.corr(t.missed_next),3), "| corr(age, missed_next) RB:", round(t[t.pos=='RB'].age.corr(t[t.pos=='RB'].missed_next),3), "WR:", round(t[t.pos=='WR'].age.corr(t[t.pos=='WR'].missed_next),3))
t.to_csv('injury_transitions_2013_2025.csv',index=False)
# ---------- 2. positional curves drift ----------
pass
rows=[]
for yr in YRS:
    s=S[yr][S[yr].g>=8]
    r={'year':yr}
    for pos,rk in [('RB',1),('RB',6),('RB',12),('RB',24),('WR',1),('WR',6),('WR',12),('WR',24),('TE',1),('TE',6),('QB',1),('QB',10)]:
        v=s[s.pos==pos].ppg.sort_values(ascending=False).values; r[f'{pos}{rk}']=round(v[rk-1],1) if len(v)>=rk else None
    rows.append(r)
pass
# ---------- 3. Thursday / game script / international over 2012-2025 ----------
g=pd.read_csv(D+'games.csv',low_memory=False); g=g[(g.game_type=='REG')&(g.season.isin(YRS))]
g['intl']=g.location.eq('Neutral')
tg=[]
for _,r in g.iterrows():
    for tm,home in ((r.home_team,True),(r.away_team,False)):
        margin=(r.home_score-r.away_score) if home else (r.away_score-r.home_score)
        tg.append(dict(season=r.season,week=r.week,team=tm,weekday=r.weekday,intl=r.intl,margin=margin))
tg=pd.DataFrame(tg)
W=[]
for yr in YRS:
    w=pd.read_csv(D+f'stats_player_week_{yr}.csv',low_memory=False); w=w[(w.season_type=='REG')&(w.position.isin(['QB','RB','WR','TE']))].copy(); w['pts']=score(w,'A'); W.append(w[['season','week','team','player_id','position','pts']])
w=pd.concat(W).merge(tg,on=['season','week','team'],how='left')
sz=w.groupby(['season','player_id']).pts.agg(['count','mean']); keep=sz[(sz['count']>=8)&(sz['mean']>=10)].index
w=w.set_index(['season','player_id']).loc[keep].reset_index()
def paired(mask,label):
    a=w[mask].groupby(['season','player_id']).pts.mean(); b=w[~mask].groupby(['season','player_id']).pts.mean()
    j=pd.concat([a.rename('x'),b.rename('y')],axis=1).dropna(); d=j.x-j.y; se=d.std()/np.sqrt(len(d))
    print(f"{label:24s} n={len(d):5d} diff={d.mean():+.2f} ppg (95% CI {d.mean()-1.96*se:+.2f} to {d.mean()+1.96*se:+.2f})")
print("\n== Same-player comparisons 2012-2025 ==")
paired(w.weekday.eq('Thursday'),'Thursday'); paired(w.intl.fillna(False).astype(bool),'International'); paired(w.weekday.eq('Monday'),'Monday')
a=w[w.margin<=-7].groupby(['season','player_id','position']).pts.mean(); b=w[w.margin>=7].groupby(['season','player_id','position']).pts.mean()
j=pd.concat([a.rename('trail'),b.rename('lead')],axis=1).dropna().reset_index(); j['d']=j.trail-j.lead
print("Game script (lost by 7+ minus won by 7+), 2012-2025:"); print(j.groupby('position').d.agg(['count','mean']).round(2).to_string())
# ---------- 4. variance persistence over years ----------
print("\n== Weekly CV persistence year to year (8+ games both years, ppg>=8) ==")
sd=w.groupby(['season','player_id']).pts.agg(['mean','std','count']).reset_index()
sd=sd[(sd['count']>=8)&(sd['mean']>=8)]; sd['cv']=sd['std']/sd['mean']
m=sd.merge(sd.assign(season=sd.season-1),on=['season','player_id'],suffixes=('','_next'))
print(f"n={len(m)} corr(cv, cv_next)={m.cv.corr(m.cv_next):.2f}  corr(sd, sd_next)={m['std'].corr(m['std_next']):.2f}  mean CV {sd.cv.mean():.2f}")

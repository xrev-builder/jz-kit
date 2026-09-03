"""Usage-history projection model: fit next-season ppg on prior-season opportunity, efficiency, snap share, age (2013-2025), holdout-tested, then project 2026."""
import pandas as pd, numpy as np, numpy.linalg as la
D='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/data/'
O='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/'
exec(open(O+'master.py').read().split("s25=season(2025)")[0])
pl=pd.read_csv(D+'players.csv',low_memory=False)[['gsis_id','pfr_id','birth_date','draft_year']].drop_duplicates('gsis_id'); pl['birth']=pd.to_datetime(pl.birth_date,errors='coerce'); pl=pl.set_index('gsis_id')
YRS=list(range(2012,2026))
feat={}
for yr in YRS:
    w=pd.read_csv(D+f'stats_player_week_{yr}.csv',low_memory=False); w=w[(w.season_type=='REG')&(w.position.isin(['QB','RB','WR','TE']))].copy()
    w['ptsA']=score(w,'A'); w['ptsB']=score(w,'B')
    tt=w.groupby(['team','week']).agg(team_tgt=('targets','sum'),team_car=('carries','sum'),team_att=('attempts','sum')).reset_index(); w=w.merge(tt,on=['team','week'])
    g=w.groupby('player_id')
    f=pd.DataFrame({'name':g.player_display_name.first(),'pos':g.position.first(),'team':g.team.last(),'g':g.week.count(),'ppgA':g.ptsA.mean(),'ppgB':g.ptsB.mean(),
        'tgt_pg':g.targets.sum()/g.week.count(),'car_pg':g.carries.sum()/g.week.count(),'rec_pg':g.receptions.sum()/g.week.count(),
        'tgt_share':g.targets.sum()/g.team_tgt.sum(),'car_share':g.carries.sum()/g.team_car.sum(),'att_pg':g.attempts.sum()/g.week.count(),
        'ypt':g.receiving_yards.sum()/g.targets.sum().replace(0,np.nan),'ypc':g.rushing_yards.sum()/g.carries.sum().replace(0,np.nan),
        'td_pt':(g.rushing_tds.sum()+g.receiving_tds.sum())/(g.carries.sum()+g.targets.sum()).replace(0,np.nan),
        'ru_yds_pg':g.rushing_yards.sum()/g.week.count(),'sd':g.ptsA.std()})
    try:
        sn=pd.read_csv(D+f'snap_counts_{yr}.csv',low_memory=False); sn=sn[(sn.game_type=='REG')&(sn.position.isin(['QB','RB','WR','TE']))]
        sp=sn.groupby('pfr_player_id').offense_pct.mean(); f['snap']=f.index.map(lambda i: sp.get(pl.pfr_id.get(i,None),np.nan))
    except Exception as e: f['snap']=np.nan
    f['year']=yr; feat[yr]=f
F=pd.concat(feat.values())
F=F.join(pl[['birth','draft_year']],how='left')
rows=[]
for y0 in YRS[:-1]:
    a=F[(F.year==y0)&(F.g>=6)]; b=F[F.year==y0+1][['ppgA','ppgB','g']].rename(columns={'ppgA':'yA','ppgB':'yB','g':'g_next'})
    j=a.join(b,how='left'); j['age']=((pd.Timestamp(f'{y0+1}-09-10')-j.birth).dt.days/365.25); j['tyear']=y0+1
    p=F[F.year==y0-1][['ppgA','g']].rename(columns={'ppgA':'ppg_prev','g':'g_prev'}); j=j.join(p,how='left'); rows.append(j)
T=pd.concat(rows); T=T[T.age.notna()]
T['jump']=np.where((T.g_prev>=8)&(T.g>=8),T.ppgA-T.ppg_prev,0.0); T['jump']=T.jump.clip(lower=0)
T['snapf']=T.snap.fillna(T.groupby(['pos','year']).snap.transform('mean')).fillna(0.5)
FEATS={'RB':['ppgA','car_pg','tgt_pg','car_share','tgt_share','snapf','age','jump','ypc'],
       'WR':['ppgA','tgt_pg','tgt_share','snapf','age','jump','ypt'],
       'TE':['ppgA','tgt_pg','tgt_share','snapf','age','jump'],
       'QB':['ppgA','att_pg','ru_yds_pg','age','jump']}
def fit(t,pos,ycol='yA',lam=2.0):
    X=t[FEATS[pos]].fillna(0).values; X=np.column_stack([np.ones(len(X)),X]); y=t[ycol].values
    I=np.eye(X.shape[1]); I[0,0]=0
    return la.solve(X.T@X+lam*I,X.T@y)
def predict(b,t,pos): X=t[FEATS[pos]].fillna(0).values; return np.column_stack([np.ones(len(X)),X])@b
print("== Holdout backtests: train on years before the test year; test players with 8+ games both years, ppg>=8 ==")
res=[]
for ty in (2022,2023,2024,2025):
    for pos in ['RB','WR','TE','QB']:
        tr=T[(T.tyear<ty)&(T.pos==pos)&(T.g_next>=8)&(T.g>=8)&(T.ppgA>=6)]; te=T[(T.tyear==ty)&(T.pos==pos)&(T.g_next>=8)&(T.g>=8)&(T.ppgA>=8)]
        b=fit(tr,pos); pr=predict(b,te,pos); naive=te.ppgA.values; y=te.yA.values
        res.append(dict(test=ty,pos=pos,n=len(te),mae_model=np.abs(pr-y).mean(),mae_naive=np.abs(naive-y).mean(),rho_model=pd.Series(pr).rank().corr(pd.Series(y).rank()),rho_naive=pd.Series(naive).rank().corr(pd.Series(y).rank()),bias=(pr-y).mean()))
R=pd.DataFrame(res); print(R.round(2).to_string(index=False)); print(R.groupby('pos')[['mae_model','mae_naive','rho_model','rho_naive']].mean().round(2).to_string())
# compare with consensus curve on 2024/2025 where ECR exists (from backtest2: curve MAE 2.94/2.88, rho .69/.74)
# final fit on all transitions through 2025 target, project 2026 from 2025 features
proj={}
for pos in ['RB','WR','TE','QB']:
    tr=T[(T.pos==pos)&(T.g_next>=8)&(T.g>=8)&(T.ppgA>=6)]
    bA=fit(tr,pos,'yA'); bB=fit(tr,pos,'yB')
    cur=F[(F.year==2025)&(F.pos==pos)&(F.g>=4)].copy(); cur['age']=((pd.Timestamp('2026-09-10')-cur.birth).dt.days/365.25)
    p24=F[F.year==2024][['ppgA','g']].rename(columns={'ppgA':'ppg_prev','g':'g_prev'}); cur=cur.join(p24,how='left')
    cur['jump']=np.where((cur.g_prev>=8)&(cur.g>=8),(cur.ppgA-cur.ppg_prev).clip(lower=0),0.0)
    cur['snapf']=cur.snap.fillna(cur.snap.mean()).fillna(0.5); cur=cur[cur.age.notna()]
    cur['model_A']=predict(bA,cur,pos); cur['model_B']=predict(bB,cur,pos)
    # low-sample shrink: fewer than 8 games -> blend toward positional mean of model preds
    w=np.clip(cur.g/8,0,1); cur['model_A']=w*cur.model_A+(1-w)*cur.model_A.mean(); cur['model_B']=w*cur.model_B+(1-w)*cur.model_B.mean()
    proj[pos]=cur[['name','pos','team','g','ppgA','tgt_pg','car_pg','tgt_share','car_share','snapf','age','model_A','model_B']]
    print(f"\n{pos} coefficients (League A): "+', '.join(f"{n}={c:+.2f}" for n,c in zip(['const']+FEATS[pos],bA)))
P=pd.concat(proj.values()).sort_values('model_A',ascending=False); P.to_csv(O+'usage_proj_2026.csv',index=False)
print("\n== 2026 projections from the usage model (League A ppg), top 40 ==")
print(P.head(40)[['name','pos','team','g','ppgA','tgt_pg','car_pg','tgt_share','snapf','age','model_A','model_B']].round(2).to_string(index=False))
F.to_csv(O+'usage_features_2012_2025.csv')

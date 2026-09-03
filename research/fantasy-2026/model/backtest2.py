import pandas as pd, numpy as np, re, unicodedata
def sp(a,b): return pd.Series(a).rank().corr(pd.Series(b).rank())
D='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/data/'
exec(open('master.py').read().split("s25=season(2025)")[0])
def norm(s):
    s=unicodedata.normalize('NFKD',str(s)).encode('ascii','ignore').decode().lower().replace("'","").replace(".","").replace("-"," ")
    return re.sub(r"\s+"," ",re.sub(r"\b(jr|sr|ii|iii|iv|v)\b","",s)).strip()
E=pd.read_csv(D+'ecr_history_aug.csv',low_memory=False)
snap={2023:'2023-08-25',2024:'2024-08-23',2025:'2025-08-08'}
S={yr:season(yr) for yr in (2022,2023,2024,2025)} if False else {yr:season(yr) for yr in (2023,2024,2025)}
POOL={'RB':12,'WR':12,'TE':9,'QB':17}
def curve_from(s,suf):
    return {pos:s[(s.pos==pos)&(s[f'g_{suf}']>=8)][f'ppgA_{suf}'].sort_values(ascending=False).values[:60] for pos in POOL}
print("== Projection holdout with REAL preseason consensus (ECR positional rank at the Aug snapshot) ==")
for Y in (2024,2025):
    e=E[(E.scrape_date==snap[Y])&(E.ecr_type=='rp')&(E.pos.isin(POOL))][['player','pos','ecr']].copy(); e['key']=e.player.map(norm); e=e.drop_duplicates('key')
    sY=str(Y)[2:]; s1=str(Y-1)[2:]
    act=S[Y][S[Y][f'g_{sY}']>=8][['name','pos',f'ppgA_{sY}']].copy(); act['key']=act.name.map(norm)
    prev=S[Y-1][['name',f'ppgA_{s1}',f'g_{s1}']].copy(); prev['key']=prev.name.map(norm)
    j=e.merge(act,on='key',suffixes=('','_a')).merge(prev[['key',f'ppgA_{s1}',f'g_{s1}']],on='key',how='left')
    j=j[j.ecr<=40].copy()
    if Y==2025: c=curve_from(S[2023],'23'),curve_from(S[2024],'24')
    else: c=curve_from(S[2023],'23'),None
    def curve(pos,rank):
        arrs=[a[pos] for a in c if a is not None]; cc=np.mean([np.pad(a,(0,60-len(a)),'edge') for a in arrs],axis=0); return cc[min(max(int(round(rank)),1),60)-1]
    j['curve']=[curve(p,r) for p,r in zip(j.pos,j.ecr)]
    j['g1']=j[f'g_{s1}'].fillna(0); j['p1']=j[f'ppgA_{s1}'].fillna(j.pos.map(POOL))
    j['shrunk']=(j.g1*j.p1+8*j.pos.map(POOL))/(j.g1+8)
    j['naive']=np.where(j.g1>=8,j.p1,j.curve)
    for b in (0.0,0.3,0.5,0.7,1.0):
        j[f'blend{b}']=np.where(j.g1>0,b*j.shrunk+(1-b)*j.curve,j.curve)
    y=j[f'ppgA_{sY}']
    print(f"\n{Y}: n={len(j)} (consensus top-40 per position with 8+ games)")
    for cnm in ['naive','curve','blend0.3','blend0.5','blend0.7','blend1.0']:
        mae=(j[cnm]-y).abs().mean(); rho=sp(j[cnm].values,y.values); bias=(j[cnm]-y).mean()
        print(f"  {cnm:9s} MAE {mae:.2f}  spearman {rho:.2f}  bias {bias:+.2f}")
    for pos in POOL:
        t=j[j.pos==pos]; yy=t[f'ppgA_{sY}']
        print(f"    {pos}: n={len(t):2d} curve rho {sp(t.curve.values,yy.values):.2f} MAE {(t.curve-yy).abs().mean():.2f} | blend0.5 rho {sp(t['blend0.5'].values,yy.values):.2f} MAE {(t['blend0.5']-yy).abs().mean():.2f} | naive rho {sp(t.naive.values,yy.values):.2f}")
print("\n== Room backtest: Footborn actual picks vs consensus overall rank (same-year Aug snapshot) ==")
R='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/rooms/'
res={}
for Y in (2024,2025):
    e=E[(E.scrape_date==snap[Y])&(E.ecr_type=='ro')][['player','pos','ecr']].copy(); e['key']=e.player.map(norm); e=e.drop_duplicates('key')
    p=pd.read_csv(R+f'footborn_{Y}_picks.csv'); p['key']=p.player.map(norm)
    j=p.merge(e[['key','ecr']],on='key',how='left'); miss=j.ecr.isna().sum()
    j=j.dropna(subset=['ecr']); j['dev']=j.pick-j.ecr
    print(f"{Y}: matched {len(j)}/150 (unmatched {miss}); MAE(pick vs ECR)={j.dev.abs().mean():.1f} picks; by position mean deviation (positive = room takes LATER than consensus):")
    print(j.groupby('pos').dev.agg(['count','mean','median']).round(1).to_string())
    j['rd']=pd.cut(j['round'],[0,3,6,10,15],labels=['R1-3','R4-6','R7-10','R11-15'])
    print(j.groupby(['rd','pos'],observed=True).dev.mean().round(1).unstack('pos').to_string())
    res[Y]=j
# out-of-sample: apply 2024 position shifts to 2025
sh=res[2024].groupby('pos').dev.mean(); t=res[2025].copy(); t['pred']=t.ecr+t.pos.map(sh)
print(f"\n2025 room-price error: ECR alone MAE {t.dev.abs().mean():.1f} picks; ECR + 2024 position shifts MAE {(t.pick-t.pred).abs().mean():.1f} picks")
for pos in ['QB','TE','RB','WR']:
    tt=t[t.pos==pos]; print(f"   {pos}: ECR alone {tt.dev.abs().mean():.1f} -> with shift {(tt.pick-tt.pred).abs().mean():.1f}")

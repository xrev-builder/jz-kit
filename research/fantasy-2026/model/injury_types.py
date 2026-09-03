import pandas as pd, numpy as np, re
D='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/data/'
O='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/'
F=pd.read_csv(O+'usage_features_2012_2025.csv',index_col=0)
G={yr:16 if yr<2021 else 17 for yr in range(2012,2026)}
def cat(s):
    s=str(s).lower()
    for k,v in [('achilles','achilles'),('acl','acl'),('mcl','knee-lig'),('pcl','knee-lig'),('lisfranc','foot'),('turf toe','toe'),('toe','toe'),('hamstring','hamstring'),('groin','groin'),('quad','quad'),('calf','calf'),('back','back'),('spine','back'),('neck','neck'),('concussion','concussion'),('ankle','ankle'),('knee','knee'),('foot','foot'),('shoulder','shoulder'),('hip','hip'),('rib','ribs'),('chest','ribs'),('hand','hand'),('wrist','hand'),('thumb','hand'),('finger','hand'),('elbow','elbow'),('illness','illness'),('abdomen','core'),('core','core'),('oblique','core'),('pectoral','pec'),('collarbone','collarbone'),('clavicle','collarbone'),('thigh','quad'),('shin','shin'),('fibula','ankle'),('heel','foot')]:
        if k in s: return v
    return 'other' if s not in ('nan','none','') else None
rows=[]
for yr in range(2012,2026):
    inj=pd.read_csv(D+f'injuries_{yr}.csv',low_memory=False); inj=inj[(inj.game_type=='REG')&(inj.position.isin(['QB','RB','WR','TE']))].copy()
    inj['cat']=inj.report_primary_injury.map(cat); inj=inj[inj.cat.notna()]
    inj['out']=inj.report_status.eq('Out')
    g=inj.groupby(['gsis_id','cat']).agg(weeks=('week','nunique'),outs=('out','sum')).reset_index(); g['season']=yr; rows.append(g)
I=pd.concat(rows)
# per player-season-category: was listed; was Out at least once; next season: games missed, same cat listed again, same cat Out again
Fy=F.reset_index().rename(columns={'index':'gsis_id'}) if 'gsis_id' not in F.columns else F
Fy=F.reset_index(); Fy=Fy.rename(columns={Fy.columns[0]:'gsis_id'})
gp=Fy.set_index(['gsis_id','year'])[['g','ppgA','pos']]
out=[]
for r in I.itertuples():
    y=r.season; k0=(r.gsis_id,y); k1=(r.gsis_id,y+1)
    if k0 not in gp.index: continue
    g0=gp.loc[k0]; 
    if g0.g<6 or g0.ppgA<6: continue  # fantasy-relevant that season
    g1=gp.loc[k1] if k1 in gp.index else None
    nxt=I[(I.gsis_id==r.gsis_id)&(I.season==y+1)]
    out.append(dict(pos=g0.pos,cat=r.cat,season=y,weeks_listed=r.weeks,out_weeks=r.outs,missed_this=G[y]-g0.g,
        played_next=(g1 is not None and g1.g>=8),missed_next=(G.get(y+1,17)-(g1.g if g1 is not None else 0)) if y<2025 else np.nan,
        same_cat_next=(r.cat in set(nxt.cat)) if y<2025 else np.nan, same_cat_out_next=bool(((nxt.cat==r.cat)&(nxt.outs>0)).any()) if y<2025 else np.nan,
        dppg_next=(g1.ppgA-g0.ppgA) if (g1 is not None and g1.g>=8) else np.nan))
T=pd.DataFrame(out); T=T[T.season<2025]
base=T.groupby('pos').agg(base_missed=('missed_next','mean')).base_missed
print("== Injury type in season Y (fantasy-relevant players) -> season Y+1, 2012-2024 reports ==")
print("baseline mean games missed next season by position among listed players:", base.round(2).to_dict())
summ=T.groupby('cat').agg(n=('cat','size'),out_share=('out_weeks',lambda x:(x>0).mean()),missed_next=('missed_next','mean'),p_miss8_next=('missed_next',lambda x:(x>=8).mean()),recur=('same_cat_next','mean'),recur_out=('same_cat_out_next','mean'),dppg=('dppg_next','mean')).sort_values('n',ascending=False)
print(summ[summ.n>=25].round(2).to_string())
print("\n== By position for the heavy categories (players who were OUT at least one week with that injury) ==")
H=T[(T.out_weeks>0)&(T.cat.isin(['knee','acl','achilles','hamstring','back','ankle','foot','groin','calf','concussion','shoulder','toe','quad','hip','ribs']))]
s2=H.groupby(['cat','pos']).agg(n=('cat','size'),missed_next=('missed_next','mean'),p_miss8=('missed_next',lambda x:(x>=8).mean()),recur_out=('same_cat_out_next','mean'),dppg=('dppg_next','mean'),played8=('played_next','mean'))
print(s2[s2.n>=12].round(2).to_string())
# major injury proxy: Out >=6 weeks with knee/achilles in Y -> next year
M=T[(T.out_weeks>=6)&(T.cat.isin(['knee','acl','achilles','foot','back']))]
print("\n== Major (Out 6+ weeks) knee/ACL/Achilles/foot/back in Y: next season ==")
print(M.groupby(['cat','pos']).agg(n=('cat','size'),played8=('played_next','mean'),missed_next=('missed_next','mean'),dppg=('dppg_next','mean')).round(2).to_string())
T.to_csv(O+'injury_types_2012_2025.csv',index=False)
# current (2025) flags for 2026: players listed in 2025 by category with Out weeks
cur=pd.concat([pd.read_csv(D+'injuries_2025.csv',low_memory=False)]); cur=cur[(cur.game_type=='REG')&(cur.position.isin(['QB','RB','WR','TE']))].copy(); cur['cat']=cur.report_primary_injury.map(cat)
cc=cur.groupby(['full_name','cat']).agg(weeks=('week','nunique'),outs=('report_status',lambda x:(x=='Out').sum())).reset_index()
cc=cc[cc.cat.notna()]; cc.to_csv(O+'injury_flags_2025.csv',index=False)
print("\n2025 injury-report flags saved:",len(cc))

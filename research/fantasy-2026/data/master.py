import pandas as pd, numpy as np, re, unicodedata
D='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/data/'
O='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/'
pd.set_option('display.width',250); pd.set_option('display.max_rows',600); pd.set_option('display.max_columns',60)

def norm(s):
    s=unicodedata.normalize('NFKD',str(s)).encode('ascii','ignore').decode()
    s=s.lower().replace("'","").replace(".","").replace("-"," ")
    s=re.sub(r"\b(jr|sr|ii|iii|iv|v)\b","",s)
    return re.sub(r"\s+"," ",s).strip()

def score(w, league):
    py,ptd,intc,p2=w.passing_yards.fillna(0),w.passing_tds.fillna(0),w.passing_interceptions.fillna(0),w.passing_2pt_conversions.fillna(0)
    ry,rtd,r2=w.rushing_yards.fillna(0),w.rushing_tds.fillna(0),w.rushing_2pt_conversions.fillna(0)
    rec,recy,rectd,rec2=w.receptions.fillna(0),w.receiving_yards.fillna(0),w.receiving_tds.fillna(0),w.receiving_2pt_conversions.fillna(0)
    fl=w.sack_fumbles_lost.fillna(0)+w.rushing_fumbles_lost.fillna(0)+w.receiving_fumbles_lost.fillna(0)
    sttd=w.special_teams_tds.fillna(0) if 'special_teams_tds' in w else 0
    base=0.04*py-2*intc+2*(p2+r2+rec2)+0.1*ry+6*rtd+rec+0.1*recy+6*rectd-2*fl+6*sttd
    if league=='A':
        pts=base+4*ptd+8*(py>=400)+3*((ry>=100)&(ry<200))+8*(ry>=200)+1.5*((recy>=100)&(recy<200))+8*(recy>=200)
    else:
        pts=base+6*ptd+2*((py>=300)&(py<400))+4*(py>=400)+2*((ry>=100)&(ry<200))+4*(ry>=200)+2*((recy>=100)&(recy<200))+4*(recy>=200)
    return pts

def season(year):
    w=pd.read_csv(D+f'stats_player_week_{year}.csv',low_memory=False)
    w=w[(w.season_type=='REG')&(w.position.isin(['QB','RB','WR','TE']))].copy()
    w['ptsA']=score(w,'A'); w['ptsB']=score(w,'B')
    # team targets per week for target share
    tt=w.groupby(['team','week']).targets.sum().rename('team_tgt').reset_index()
    w=w.merge(tt,on=['team','week'],how='left')
    g=w.groupby('player_id')
    s=pd.DataFrame({
      'name':g.player_display_name.first(),'pos':g.position.first(),'team_'+str(year):g.team.last(),
      'g':g.week.count(),
      'ptsA':g.ptsA.sum(),'ptsB':g.ptsB.sum(),'ppr':g.fantasy_points_ppr.sum(),
      'ppgA':g.ptsA.mean(),'ppgB':g.ptsB.mean(),
      'top6A':g.ptsA.apply(lambda x: x.nlargest(6).mean()),
      'top6B':g.ptsB.apply(lambda x: x.nlargest(6).mean()),
      'floorA':g.ptsA.apply(lambda x: x.quantile(0.25)),
      'pass_yds':g.passing_yards.sum(),'pass_td':g.passing_tds.sum(),'int':g.passing_interceptions.sum(),
      'car':g.carries.sum(),'ru_yds':g.rushing_yards.sum(),'ru_td':g.rushing_tds.sum(),
      'tgt':g.targets.sum(),'rec':g.receptions.sum(),'re_yds':g.receiving_yards.sum(),'re_td':g.receiving_tds.sum(),
      'tgt_share':(g.targets.sum()/g.team_tgt.sum()),
      'ru100':g.rushing_yards.apply(lambda x:(x>=100).sum()),'re100':g.receiving_yards.apply(lambda x:(x>=100).sum()),
      'p300':g.passing_yards.apply(lambda x:(x>=300).sum()),
    })
    s.columns=[c if c in('name','pos') or c.startswith('team_') else f'{c}_{str(year)[2:]}' for c in s.columns]
    return s

s25=season(2025); s24=season(2024)
# snaps 2025
sn=pd.read_csv(D+'snap_counts_2025.csv',low_memory=False)
sn=sn[(sn.game_type=='REG')&(sn.position.isin(['QB','RB','WR','TE']))]
snap=sn.groupby('pfr_player_id').offense_pct.mean().rename('snap_pct_25')
# players master
pl=pd.read_csv(D+'players.csv',low_memory=False)
pl=pl[pl.position.isin(['QB','RB','WR','TE'])]
plc=pl[['gsis_id','pfr_id','display_name','birth_date','draft_year','draft_round','draft_pick','rookie_season']].copy() if 'rookie_season' in pl else pl[['gsis_id','pfr_id','display_name','birth_date','draft_year','draft_round','draft_pick']].copy()
plc['age']=((pd.Timestamp('2026-09-10')-pd.to_datetime(plc.birth_date,errors='coerce')).dt.days/365.25).round(1)
# roster 2026
r=pd.read_csv(D+'roster_2026.csv',low_memory=False)
r=r[r.position.isin(['QB','RB','WR','TE'])]
ros=r[['gsis_id','team','status','full_name','years_exp']].rename(columns={'team':'team_26','status':'status_26'})
# ECR
e=pd.read_csv(D+'db_fpecr_latest.csv',low_memory=False)
ro=e[e.ecr_type=='ro'][['player','id','pos','team','ecr','sd','best','worst','bye']].rename(columns={'ecr':'ecr_ovr','sd':'ecr_sd','best':'ecr_best','worst':'ecr_worst','team':'ecr_team'})
rp=e[e.ecr_type=='rp'][['id','ecr']].rename(columns={'ecr':'ecr_pos'})
bo=e[e.ecr_type=='bo'][['id','ecr']].rename(columns={'ecr':'ecr_bestball'})
ecr=ro.merge(rp,on='id',how='left').merge(bo,on='id',how='left')
ecr=ecr[ecr.pos.isin(['QB','RB','WR','TE','DST'])].sort_values('ecr_ovr')
ids=pd.read_csv(D+'db_playerids.csv',low_memory=False)[['fantasypros_id','gsis_id']].dropna()
ids['fantasypros_id']=ids.fantasypros_id.astype(int)
ecr=ecr.merge(ids,left_on='id',right_on='fantasypros_id',how='left')
# fallback name match
ecr['nkey']=ecr.player.map(norm)
plc['nkey']=plc.display_name.map(norm)
miss=ecr.gsis_id.isna()&(ecr.pos!='DST')
fb=ecr[miss].drop(columns=['gsis_id']).merge(plc[['nkey','gsis_id']].drop_duplicates('nkey'),on='nkey',how='left')
ecr.loc[miss,'gsis_id']=fb.gsis_id.values
plc=plc.dropna(subset=['gsis_id']).drop_duplicates('gsis_id'); ros=ros.dropna(subset=['gsis_id']).drop_duplicates('gsis_id')
m=ecr.merge(plc.drop(columns=['nkey']),on='gsis_id',how='left').merge(ros,on='gsis_id',how='left')
m=m.merge(s25.drop(columns=['name','pos']),left_on='gsis_id',right_index=True,how='left').merge(s24.drop(columns=['name','pos']),left_on='gsis_id',right_index=True,how='left')
m=m.merge(snap,left_on='pfr_id',right_index=True,how='left')
m['team_26']=m.team_26.fillna(m.ecr_team)
m=m.sort_values('ecr_ovr').reset_index(drop=True)
m['ecr_rank']=m.index+1
cols=['ecr_rank','player','pos','team_26','age','draft_year','draft_round','bye','ecr_ovr','ecr_sd','ecr_best','ecr_worst','ecr_pos','ecr_bestball','status_26',
 'g_25','ppgA_25','ppgB_25','top6A_25','floorA_25','ptsA_25','ptsB_25','ppr_25','tgt_25','rec_25','re_yds_25','re_td_25','tgt_share_25','car_25','ru_yds_25','ru_td_25','pass_yds_25','pass_td_25','int_25','ru100_25','re100_25','p300_25','snap_pct_25',
 'g_24','ppgA_24','ppgB_24','ppr_24','tgt_24','tgt_share_24','car_24']
m[cols].to_csv(O+'master.csv',index=False)
print(m[['ecr_rank','player','pos','team_26','age','ecr_ovr','ecr_pos','g_25','ppgA_25','ppgB_25','top6A_25','tgt_25','tgt_share_25','car_25','snap_pct_25','ppgA_24']].head(260).round(2).to_string())
print('unmatched:', m[(m.pos!='DST')&m.g_25.isna()&(m.ecr_rank<=250)][['ecr_rank','player','pos','team_26','draft_year']].to_string())

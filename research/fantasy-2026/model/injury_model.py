"""Empirical injury / availability model from 2023->2024 and 2024->2025 transitions.
Games missed next season for players who were fantasy-relevant (top-N ppg) in the prior season.
Bucket by position, age band, and prior-season games missed. Output distributions + per-player expected missed games.
"""
import pandas as pd, numpy as np, sys, re, unicodedata
D='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/data/'
O='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/'
pd.set_option('display.width',220); pd.set_option('display.max_rows',300)

def load(yr):
    w=pd.read_csv(D+f'stats_player_week_{yr}.csv',low_memory=False)
    w=w[(w.season_type=='REG')&(w.position.isin(['QB','RB','WR','TE']))]
    g=w.groupby('player_id').agg(name=('player_display_name','first'),pos=('position','first'),games=('week','nunique'),ppr=('fantasy_points_ppr','sum'),team=('team','last'))
    g['ppg']=g.ppr/g.games
    # weeks the team played (exclude bye): approximate 17 for all
    return g
pl=pd.read_csv(D+'players.csv',low_memory=False)[['gsis_id','birth_date']].dropna().drop_duplicates('gsis_id')
pl['birth']=pd.to_datetime(pl.birth_date,errors='coerce')
rows=[]
for y0,y1 in [(2023,2024),(2024,2025)]:
    a=load(y0); b=load(y1)
    # relevant: top 70 RB/WR, top 24 TE/QB by prior ppr with >=6 games
    keep=[]
    for pos,n in [('RB',70),('WR',70),('TE',24),('QB',24)]:
        keep.append(a[(a.pos==pos)&(a.games>=6)].sort_values('ppr',ascending=False).head(n))
    a=pd.concat(keep)
    j=a.join(b[['games','ppg']].rename(columns={'games':'games_next','ppg':'ppg_next'}),how='left')
    j['games_next']=j.games_next.fillna(0)
    j=j.join(pl.set_index('gsis_id')['birth'])
    j['age']=((pd.Timestamp(f'{y1}-09-10')-j.birth).dt.days/365.25)
    j['missed_prior']=17-j.games
    j['missed_next']=17-j.games_next
    j['season']=y1
    rows.append(j.reset_index())
t=pd.concat(rows)
# players with 0 games next are mostly retired/cut/season-long IR; keep those with >=1 game OR flag; we treat 0-game as 'unavailable all year' but cap influence by excluding QBs benched. Keep all RB/WR/TE with games_next>=1 plus those with 0 (true season-long losses exist, e.g., ACL in camp). Exclude QBs with 0 (benchings dominate).
t=t[~((t.pos=='QB')&(t.games_next==0))]
def age_band(r):
    if r.pos=='RB': return '<27' if r.age<27 else ('27-28' if r.age<29 else '29+')
    if r.pos=='WR': return '<30' if r.age<30 else '30+'
    return 'all'
t['age_band']=t.apply(age_band,axis=1)
t['prior_band']=pd.cut(t.missed_prior,[-1,0,3,17],labels=['0','1-3','4+'])
summ=t.groupby(['pos','age_band','prior_band'],observed=True).agg(n=('missed_next','size'),mean_missed=('missed_next','mean'),p_miss4=('missed_next',lambda x:(x>=4).mean()),p_miss8=('missed_next',lambda x:(x>=8).mean()),p_zero=('missed_next',lambda x:(x==0).mean())).round(2)
print("== Games missed NEXT season by bucket (2023->24 and 2024->25 pooled) ==")
print(summ.to_string())
pos_summ=t.groupby('pos').agg(n=('missed_next','size'),mean_missed=('missed_next','mean'),p_miss4=('missed_next',lambda x:(x>=4).mean()),p_miss8=('missed_next',lambda x:(x>=8).mean())).round(2)
print(pos_summ.to_string())
t.to_csv(O+'injury_transitions.csv',index=False)
# correlation of prior missed with next missed
print("corr(missed_prior, missed_next):", round(t.missed_prior.corr(t.missed_next),3))
# per-player expected missed for the board: use bucket mean with shrink toward position mean (n<15 -> shrink)
def norm(s):
    s=unicodedata.normalize('NFKD',str(s)).encode('ascii','ignore').decode().lower().replace("'","").replace(".","").replace("-"," ")
    return re.sub(r"\s+"," ",re.sub(r"\b(jr|sr|ii|iii|iv|v)\b","",s)).strip()
m=pd.read_csv(O+'master.csv'); m['key']=m.player.map(norm)
bmean=summ.mean_missed.to_dict(); bn=summ.n.to_dict(); pmean=pos_summ.mean_missed.to_dict()
def exp_missed(r):
    if r.pos=='DST': return 0.0
    ab=age_band(pd.Series({'pos':r.pos,'age':r.age if pd.notna(r.age) else 25}))
    mp=(17-r.g_25) if pd.notna(r.g_25) else 3
    pb='0' if mp<=0 else ('1-3' if mp<=3 else '4+')
    k=(r.pos,ab,pb); mu=bmean.get(k,pmean.get(r.pos,3.0)); n=bn.get(k,0)
    return round((n*mu+10*pmean.get(r.pos,3.0))/(n+10),2)
m['exp_missed']=m.apply(exp_missed,axis=1)
m[['player','pos','age','g_25','exp_missed']].to_csv(O+'exp_missed.csv',index=False)
print(m[m.ecr_rank<=60][['ecr_rank','player','pos','age','g_25','exp_missed']].to_string(index=False))

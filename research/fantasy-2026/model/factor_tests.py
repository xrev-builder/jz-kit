"""Pressure-test proposed factors on 2023-2025 data: Thursday games, international games, age, head coach, game script (proxy), supporting cast; then a predictive weighting."""
import pandas as pd, numpy as np
D='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/data/'
pd.set_option('display.width',200)
exec(open('master.py').read().split("s25=season(2025)")[0])
g=pd.read_csv(D+'games.csv',low_memory=False)
g=g[(g.game_type=='REG')&(g.season.isin([2023,2024,2025]))]
g['intl']=g.location.eq('Neutral')|g.stadium.fillna('').str.contains('Wembley|Tottenham|Allianz|Deutsche|Frankfurt|Munich|Madrid|Bernab|Melbourne|Croke|Dublin|Sao|Corinthians|Mexico|Estadio|Cricket',case=False)
rows=[]
for _,r in g.iterrows():
    for tm,opp,coach,oc in ((r.home_team,r.away_team,r.home_coach,r.away_coach),(r.away_team,r.home_team,r.away_coach,r.home_coach)):
        margin=(r.home_score-r.away_score) if tm==r.home_team else (r.away_score-r.home_score)
        rows.append(dict(season=r.season,week=r.week,team=tm,weekday=r.weekday,intl=r.intl,coach=coach,margin=margin))
tg=pd.DataFrame(rows)
W=[]
for yr in (2023,2024,2025):
    w=pd.read_csv(D+f'stats_player_week_{yr}.csv',low_memory=False)
    w=w[(w.season_type=='REG')&(w.position.isin(['QB','RB','WR','TE']))].copy(); w['pts']=score(w,'A'); W.append(w[['season','week','team','player_id','player_display_name','position','pts','targets','carries','attempts']])
w=pd.concat(W).merge(tg,on=['season','week','team'],how='left')
# relevant players: >=8 games and >=10 ppg that season
sz=w.groupby(['season','player_id']).pts.agg(['count','mean']); keep=sz[(sz['count']>=8)&(sz['mean']>=10)].index
w=w.set_index(['season','player_id']).loc[keep].reset_index()
def paired(mask,label):
    a=w[mask].groupby(['season','player_id']).pts.mean(); b=w[~mask].groupby(['season','player_id']).pts.mean()
    j=pd.concat([a.rename('x'),b.rename('y')],axis=1).dropna(); d=j.x-j.y
    se=d.std()/np.sqrt(len(d))
    print(f"{label:38s} player-seasons={len(d):4d}  mean diff={d.mean():+.2f} ppg (95% CI {d.mean()-1.96*se:+.2f} to {d.mean()+1.96*se:+.2f})")
    for pos in ['QB','RB','WR','TE']:
        ids=w[w.position==pos].set_index(['season','player_id']).index.unique()
        dd=d[d.index.isin(ids)]
        if len(dd)>=10: print(f"   {pos}: n={len(dd):3d} diff={dd.mean():+.2f}")
print("== Thursday games vs the same player's other games (League A scoring) ==")
paired(w.weekday.eq('Thursday'),'Thursday')
print("== International games ==")
paired(w.intl.fillna(False),'International / neutral site')
print("== Monday night ==")
paired(w.weekday.eq('Monday'),'Monday')
print("\n== Game script proxy: games the player's team lost by 7+ vs won by 7+ (same player) ==")
a=w[w.margin<=-7].groupby(['season','player_id','position']).pts.mean(); b=w[w.margin>=7].groupby(['season','player_id','position']).pts.mean()
j=pd.concat([a.rename('trail'),b.rename('lead')],axis=1).dropna().reset_index(); j['d']=j.trail-j.lead
print(j.groupby('position').d.agg(['count','mean','std']).round(2).to_string())
print("\n== Age: within-player year-over-year ppg change by age (2023->24, 2024->25), players >=8 g both years ==")
pl=pd.read_csv(D+'players.csv',low_memory=False)[['gsis_id','birth_date']].dropna().drop_duplicates('gsis_id')
pl['birth']=pd.to_datetime(pl.birth_date,errors='coerce')
S={yr:season(yr) for yr in (2023,2024,2025)}
rows=[]
for y0,y1 in ((2023,2024),(2024,2025)):
    a=S[y0]; b=S[y1]; s0=str(y0)[2:]; s1=str(y1)[2:]
    j=a[a[f'g_{s0}']>=8][['name','pos',f'ppgA_{s0}']].join(b[b[f'g_{s1}']>=8][[f'ppgA_{s1}']],how='inner')
    j=j.join(pl.set_index('gsis_id')['birth']); j['age']=(pd.Timestamp(f'{y1}-09-10')-j.birth).dt.days/365.25
    j=j[j[f'ppgA_{s0}']>=8]; j['d']=j[f'ppgA_{s1}']-j[f'ppgA_{s0}']; rows.append(j[['pos','age','d',f'ppgA_{s0}']].rename(columns={f'ppgA_{s0}':'ppg0'}))
A=pd.concat(rows); A['band']=pd.cut(A.age,[0,24,26,28,30,33,50],labels=['<24','24-25','26-27','28-29','30-32','33+'])
print(A.groupby(['pos','band'],observed=True).d.agg(['count','mean']).round(2).unstack('band').to_string())
print("\n== Head coach: team pass rate and plays/game by coach-season (2023-25), coaches active in 2026 with a prior HC season ==")
tw=w.groupby(['season','week','team','coach']).agg(att=('attempts','sum'),car=('carries','sum'),tgt=('targets','sum')).reset_index()
tw['plays']=tw.att+tw.car; tw['pass_rate']=tw.att/tw.plays
cs=tw.groupby(['coach','season']).agg(pass_rate=('pass_rate','mean'),plays=('plays','mean'),n=('week','count')).reset_index()
cs=cs[cs.n>=8].round(3)
coaches26=['Kevin Stefanski','Mike McCarthy','John Harbaugh','Sean McVay','Andy Reid','Kyle Shanahan','Dan Campbell','Ben Johnson','Mike Macdonald','Jim Harbaugh','Sean McDermott','Zac Taylor','Matt LaFleur','Nick Sirianni','Todd Bowles','Kevin O\'Connell','DeMeco Ryans','Shane Steichen','Liam Coen','Brian Callahan','Dave Canales','Sean Payton','Jonathan Gannon','Mike Tomlin','Aaron Glenn','Brian Daboll','Kellen Moore','Raheem Morris','Pete Carroll','Antonio Pierce','Mike McDaniel','Jerod Mayo','Mike Vrabel']
print(cs[cs.coach.isin(coaches26)].sort_values(['coach','season']).to_string(index=False))
print("league avg pass rate by season:", tw.groupby('season').pass_rate.mean().round(3).to_dict())
print("\n== Predictive weighting: regress 2025 ppg on 2024 features (players >=8 g both years, ppg24>=8) ==")
a=S[2024]; b=S[2025]
j=a[a.g_24>=8][['name','pos','ppgA_24','tgt_share_24','tgt_24','car_24','team_2024']].join(b[b.g_25>=8][['ppgA_25','team_2025']],how='inner')
j=j[j.ppgA_24>=8].join(pl.set_index('gsis_id')['birth']); j['age']=(pd.Timestamp('2025-09-10')-j.birth).dt.days/365.25
j['new_team']=(j.team_2024!=j.team_2025).astype(int)
hc={ (r.season,r.team):r.coach for r in tg.drop_duplicates(['season','team']).itertuples()}
j['new_hc']=[int(hc.get((2024,t0))!=hc.get((2025,t1))) for t0,t1 in zip(j.team_2024,j.team_2025)]
j['opp']=j.tgt_24.fillna(0)+j.car_24.fillna(0)
import numpy.linalg as la
for pos in ['RB','WR','TE','QB']:
    t=j[j.pos==pos].dropna(subset=['age'])
    X=np.column_stack([np.ones(len(t)),t.ppgA_24,t.opp/17,t.age,t.new_team,t.new_hc])
    y=t.ppgA_25.values
    beta,res,_,_=la.lstsq(X,y,rcond=None); pred=X@beta; r2=1-((y-pred)**2).sum()/((y-y.mean())**2).sum()
    base=np.corrcoef(t.ppgA_24,y)[0,1]**2
    print(f"{pos}: n={len(t)}  R2 full={r2:.2f} (ppg24 alone={base:.2f})  coefs: ppg24={beta[1]:+.2f}  opp/g={beta[2]:+.2f}  age={beta[3]:+.2f}/yr  new_team={beta[4]:+.2f}  new_HC={beta[5]:+.2f}")

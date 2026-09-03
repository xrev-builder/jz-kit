import pandas as pd, numpy as np
D='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/data/'
O='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/'
exec(open(O+'master.py').read().split("s25=season(2025)")[0])
ratios=[]; top24=[]; emerge={'RB':[],'WR':[]}
for yr in range(2012,2026):
    w=pd.read_csv(D+f'stats_player_week_{yr}.csv',low_memory=False); w=w[(w.season_type=='REG')&(w.position.isin(['RB','WR','TE','QB']))].copy(); w['pts']=score(w,'A')
    rb=w[w.position=='RB']
    # RB1/RB2 per team by season carries
    car=rb.groupby(['team','player_id']).carries.sum().reset_index()
    for tm,g in car.groupby('team'):
        g=g.sort_values('carries',ascending=False)
        if len(g)<2 or g.carries.iloc[0]<120: continue
        rb1,rb2=g.player_id.iloc[0],g.player_id.iloc[1]
        wk=rb[rb.team==tm]; weeks=sorted(wk.week.unique())
        w1=wk[wk.player_id==rb1].set_index('week'); w2=wk[wk.player_id==rb2].set_index('week')
        present=set(w1.index); absent=[k for k in weeks if k not in present]
        if len(absent)>=1 and len(present)>=6:
            p2_pres=w2.reindex([k for k in weeks if k in present]).pts.fillna(0).mean(); p2_abs=w2.reindex(absent).pts.fillna(0).mean(); p1=w1.pts.mean()
            ratios.append(dict(year=yr,team=tm,rb1_ppg=p1,rb2_with=p2_pres,rb2_without=p2_abs,n_abs=len(absent)))
    # waiver emergence: players with <=5 ppg (or absent) in weeks 1-4 who then averaged >=12 (RB) / >=12 (WR) over weeks 5-end with >=6 games
    for pos in ['RB','WR']:
        p=w[w.position==pos]; early=p[p.week<=4].groupby('player_id').pts.mean(); late=p[p.week>=5].groupby('player_id').agg(m=('pts','mean'),n=('pts','count'))
        ids=late[(late.n>=6)&(late.m>=12)].index
        em=[i for i in ids if early.get(i,0)<=5]
        emerge[pos].append(len(em))
R=pd.DataFrame(ratios)
print("== Handcuff: RB2 ppg when RB1 absent vs present (teams with a 120+ carry RB1), 2012-2025 ==")
print(f"n team-seasons with an RB1 absence: {len(R)}; RB1 ppg {R.rb1_ppg.mean():.1f}; RB2 with RB1 {R.rb2_with.mean():.1f}; RB2 without RB1 {R.rb2_without.mean():.1f}; RB2-without as share of RB1 ppg: {R.rb2_without.mean()/R.rb1_ppg.mean():.2f}")
print("distribution of RB2-without ppg: 25th %ile", R.rb2_without.quantile(.25).round(1), "median", R.rb2_without.median().round(1), "75th", R.rb2_without.quantile(.75).round(1), "| share >= 12 ppg:", (R.rb2_without>=12).mean().round(2))
E=pd.DataFrame(emerge,index=range(2012,2026)); print("\n== In-season emergence (<=5 ppg in weeks 1-4, then >=12 ppg over 6+ games from week 5) per season ==\n",E.T.to_string()); print("mean per season: RB",E.RB.mean().round(1),"WR",E.WR.mean().round(1))
R.to_csv(O+'handcuff_ratios.csv',index=False)

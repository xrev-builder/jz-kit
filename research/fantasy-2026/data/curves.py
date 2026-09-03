import pandas as pd, numpy as np, sys
sys.path.insert(0,'.')
D='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/data/'
exec(open('master.py').read().split("s25=season(2025)")[0])  # reuse score() and season()
out={}
for yr in (2025,2024):
    s=season(yr); suf=str(yr)[2:]
    s=s[s[f'g_{suf}']>=8]
    for pos in ['QB','RB','WR','TE']:
        for lg in ['A','B']:
            v=s[s.pos==pos][f'ppg{lg}_{suf}'].sort_values(ascending=False).values
            out[(yr,pos,lg)]=v[:40]
ranks=[1,2,3,4,5,6,8,10,12,15,18,20,24,30,36]
for pos in ['QB','RB','WR','TE']:
    print(f"\n== {pos} ppg by positional rank (>=8 games): 2025A 2025B 2024A 2024B")
    for r in ranks:
        vals=[out[(y,pos,l)][r-1] if len(out[(y,pos,l)])>=r else np.nan for y,l in [(2025,'A'),(2025,'B'),(2024,'A'),(2024,'B')]]
        print(f"{pos}{r:>3}: "+"  ".join(f"{v:5.1f}" for v in vals))
# 2025 points allowed by position per defense (League A ppg allowed)
w=pd.read_csv(D+'stats_player_week_2025.csv',low_memory=False)
w=w[(w.season_type=='REG')&(w.position.isin(['QB','RB','WR','TE']))].copy()
w['ptsA']=score(w,'A')
pa=w.groupby(['opponent_team','position']).ptsA.sum().unstack()/w.groupby('opponent_team').week.nunique().values[:,None]
pa=pa.round(1); pa['ALL']=pa.sum(axis=1).round(1)
pa.to_csv('pts_allowed_2025.csv')
print("\n== 2025 League-A fantasy pts allowed per game by defense (rank 1 = most allowed)")
print(pa.sort_values('ALL',ascending=False).to_string())

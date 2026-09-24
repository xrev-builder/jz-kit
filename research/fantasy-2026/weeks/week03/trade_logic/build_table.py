import pandas as pd, numpy as np, json, re, csv, sys
S='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad'
def norm(n): return re.sub(r"[^a-z]","",re.sub(r"\s(jr|sr|ii|iii|iv)\.?$","",str(n).lower().replace("'","")))
# --- rosters (draft + known moves through Sept 23) ---
picks=list(csv.DictReader(open('/home/user/jz-kit/research/fantasy-2026/rooms/footborn_2026_picks.csv')))
R={}; DRAFT={}
for p in picks:
    if p['player']=='?': continue
    R.setdefault(p['manager'],[]).append(p['player']); DRAFT[norm(p['player'])]=(int(p['pick']),int(p['round']),p['manager'])
def swap(m,drop,add):
    for d in drop:
        if d in R[m]: R[m].remove(d)
    R[m]+=add
swap('Jamal',['Rico Dowdle','Los Angeles Chargers','Jayden Reed','Tyler Allgeier'],['Devaughn Vele','San Francisco 49ers','Brock Purdy','Kyler Murray'])
swap('Kdouh',['Minnesota Vikings','Malachi Fields'],['Patrick Mahomes','Tampa Bay Buccaneers'])
swap('Billy',["De'Zhaun Stribling"],['Trevor Lawrence','Antonio Williams'])
swap('Kass',['Detroit Lions'],['New England Patriots'])
swap('Aoc',['Keenan Allen','Jerry Jeudy'],['Juwan Johnson','Rico Dowdle','Kansas City Chiefs'])
swap('Betto',[],['Jared Goff'])
swap('Daoud',['Cyrus Allen'],['Caleb Douglas'])
swap('Ish',['Jonathon Brooks','Keaton Mitchell'],['Oronde Gadsden II','Dalton Schultz'])
# --- sources ---
pre=pd.read_csv(S+'/data/db_fpecr_latest.csv',low_memory=False)   # 2026-08-28 preseason
pre=pre[pre.fp_page=='/nfl/rankings/ppr-cheatsheets.php']; PRE={norm(r.player):float(r.ecr) for r in pre.itertuples()}
cur=pd.read_csv(S+'/data/db_fpecr_latest_new.csv',low_memory=False) # 2026-09-18
CUR={norm(r.player):float(r.ecr) for r in cur[cur.fp_page=='/nfl/rankings/ros-ppr-overall.php'].itertuples()}
CURD={norm(r.player):r.rank_delta for r in cur[cur.fp_page=='/nfl/rankings/ros-ppr-overall.php'].itertuples()}
CPOS={}
for pos,pg in {'RB':'/nfl/rankings/ros-ppr-rb.php','WR':'/nfl/rankings/ros-ppr-wr.php','TE':'/nfl/rankings/ros-ppr-te.php','QB':'/nfl/rankings/ros-qb.php','DST':'/nfl/rankings/ros-dst.php'}.items():
    for r in cur[cur.fp_page==pg].itertuples(): CPOS[norm(r.player)]=(pos,float(r.ecr))
WK={norm(r.player):float(r.ecr) for pg in ['/nfl/rankings/ppr-rb.php','/nfl/rankings/ppr-wr.php','/nfl/rankings/ppr-te.php','/nfl/rankings/qb.php'] for r in cur[cur.fp_page==pg].itertuples()}
st=pd.read_csv(S+'/data/stats_wk.csv',low_memory=False)
def g(r,k):
    try: return float(r.get(k) or 0)
    except: return 0.0
def pts(r):
    return g(r,'passing_yards')/25+6*g(r,'passing_tds')-2*g(r,'passing_interceptions')+g(r,'rushing_yards')/10+6*g(r,'rushing_tds')+g(r,'receptions')+g(r,'receiving_yards')/10+6*g(r,'receiving_tds')-2*(g(r,'rushing_fumbles_lost')+g(r,'receiving_fumbles_lost')+g(r,'sack_fumbles_lost'))+(2 if g(r,'passing_yards')>=300 else 0)
PTS={}; USE={}
for _,r in st.iterrows():
    k=norm(r['player_display_name']); PTS.setdefault(k,{})[int(r['week'])]=round(pts(r),1)
    USE.setdefault(k,{})[int(r['week'])]=(int(g(r,'targets')),int(g(r,'carries')))
sn=pd.read_csv(S+'/data/snap_counts_2026.csv'); SN={}
for _,r in sn.iterrows(): SN.setdefault(norm(r['player']),{})[int(r['week'])]=r['offense_pct']
ep=pd.read_csv(S+'/data/ep_weekly_2026.csv'); EP={}
for _,r in ep.iterrows(): EP.setdefault(norm(r['full_name']),{})[int(r['week'])]=round(float(r['total_fantasy_points_exp']),1)
inj=pd.read_csv(S+'/data/injuries_2026.csv'); inj=inj[inj.week==inj.week.max()]
INJ={norm(r.full_name):(str(r.report_status) if pd.notna(r.report_status) else 'listed', str(r.report_primary_injury if pd.notna(r.report_primary_injury) else r.practice_primary_injury), str(r.practice_status)) for r in inj.itertuples()}
pl=pd.read_csv(S+'/data/players.csv',low_memory=False)
AGE={}
for _,r in pl.iterrows():
    try:
        if pd.notna(r.get('birth_date')): AGE[norm(r['display_name'])]=2026-int(str(r['birth_date'])[:4])
    except: pass
TEAM={norm(r.player):r.team for r in cur[cur.fp_page=='/nfl/rankings/ros-ppr-overall.php'].itertuples()}
# --- table ---
rows=[]
for m,ro in R.items():
    for n in ro:
        k=norm(n); pos,cp=CPOS.get(k,('?',np.nan))
        if pos=='?':
            pos='DST' if any(w in n for w in ['49ers','Seahawks','Broncos','Texans','Chargers','Steelers','Ravens','Lions','Browns','Eagles','Vikings','Packers','Rams','Buccaneers','Chiefs','Patriots']) else '?'
        p1=PTS.get(k,{}).get(1,np.nan); p2=PTS.get(k,{}).get(2,np.nan)
        rows.append(dict(manager=m,player=n,pos=pos,nfl=TEAM.get(k,''),age=AGE.get(k,np.nan),draft_pick=DRAFT.get(k,(None,None,None))[0],draft_round=DRAFT.get(k,(None,None,None))[1],
            pre_ecr=PRE.get(k,np.nan),ros_ovr=CUR.get(k,np.nan),ros_pos=cp,ros_delta=CURD.get(k,np.nan),wk3_rank=WK.get(k,np.nan),
            pts_w1=p1,pts_w2=p2,ep_w1=EP.get(k,{}).get(1,np.nan),ep_w2=EP.get(k,{}).get(2,np.nan),snap_w1=SN.get(k,{}).get(1,np.nan),snap_w2=SN.get(k,{}).get(2,np.nan),
            tgt_car_w1=USE.get(k,{}).get(1,''),tgt_car_w2=USE.get(k,{}).get(2,''),inj=INJ.get(k,('','',''))[0],inj_type=INJ.get(k,('','',''))[1],practice=INJ.get(k,('','',''))[2]))
df=pd.DataFrame(rows)
# value curves: rank -> 0..100 (steep at top)
def val(rank):
    if pd.isna(rank): return 5.0
    return round(100*np.exp(-rank/45.0),1)
df['name_value']=df.pre_ecr.apply(val)          # what managers remember paying / preseason hype
df['draft_value']=df.draft_pick.apply(lambda p: val(p) if p else 5.0)
df['current_value']=df.ros_ovr.apply(val)       # Sept 18 consensus
df['ppg']=df[['pts_w1','pts_w2']].mean(axis=1)
df['ep2']=df[['ep_w1','ep_w2']].mean(axis=1)
# perceived (manager-lens) value: name/draft memory + current consensus + hot/cold recency
df['perceived']=(0.30*df.name_value+0.15*df.draft_value+0.40*df.current_value+0.15*df.ppg.fillna(0).clip(0,30)/30*100).round(1)
def flag(r):
    f=[]
    if r.inj and r.inj not in ('','nan','listed'): f.append('INJ:'+str(r.inj))
    elif r.inj=='listed' and 'Did Not' in str(r.practice): f.append('INJ:DNP')
    if pd.notna(r.ros_ovr) and r.ros_ovr<=60 and pd.notna(r.ppg) and r.ppg<0.6*max(val(r.ros_ovr)/4,8): f.append('BUY-LOW')
    if pd.notna(r.ros_ovr) and r.ros_ovr>70 and pd.notna(r.ppg) and r.ppg>=13: f.append('SELL-HIGH')
    if pd.notna(r.ep2) and pd.notna(r.ppg) and r.ep2-r.ppg>=4: f.append('USAGE>OUTPUT')
    if pd.notna(r.ep2) and pd.notna(r.ppg) and r.ppg-r.ep2>=5: f.append('OUTPUT>USAGE')
    if (r.pos=='RB' and pd.notna(r.age) and r.age>=28) or (r.pos in('WR','TE') and pd.notna(r.age) and r.age>=30): f.append('AGE')
    if pd.notna(r.ros_delta) and r.ros_delta<=-5: f.append('FALLING')
    if pd.notna(r.ros_delta) and r.ros_delta>=5: f.append('RISING')
    if pd.notna(r.pre_ecr) and pd.notna(r.ros_ovr) and r.pre_ecr-r.ros_ovr>=25: f.append('NAME<CURRENT')
    if pd.notna(r.pre_ecr) and pd.notna(r.ros_ovr) and r.ros_ovr-r.pre_ecr>=25: f.append('NAME>CURRENT')
    return ' '.join(f)
df['flags']=df.apply(flag,axis=1)
df=df.sort_values(['manager','perceived'],ascending=[True,False])
df.to_csv(S+'/tl/league_table.csv',index=False)
pd.set_option('display.width',260); pd.set_option('display.max_rows',300)
cols=['manager','player','pos','nfl','age','draft_pick','pre_ecr','ros_ovr','ros_pos','pts_w1','pts_w2','ep2','snap_w2','inj','perceived','flags']
print(df[cols].round(1).to_string(index=False))

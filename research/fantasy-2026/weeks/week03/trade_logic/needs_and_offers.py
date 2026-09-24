import pandas as pd, numpy as np, itertools, json
S='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad'
df=pd.read_csv(S+'/tl/league_table.csv')
# manual status overrides (Sept 24)
OVR={'Josh Jacobs':'EXEMPT-LIST (4-6 game ban possible)','Puka Nacua':'Q hip, sat Wk2, McVay unsure Wk3','Nico Collins':'hamstring Gr1, out Wk2, 1-2 more wks','Jordyn Tyson':'IR, back ~Wk6+','Brock Bowers':'doubtful Wk2 (status Wk3 unknown)','Zay Flowers':'out Wk2 hamstring','A.J. Brown':'IR','Kyler Murray':'concussion, missed Wk2','DJ Moore':'Q Wk2, 0 catches','Dallas Goedert':'doubtful Wk2','RJ Harvey':'Q hamstring','Jordan Mason':'IR thumb ~4 wks','Michael Penix Jr.':'out'}
df['status']=df.player.map(OVR).fillna(df.inj.fillna(''))
df['cv']=df.current_value; df['pv']=df.perceived
SLOTS=[('QB',1),('RB',2),('WR',2),('TE',1),('FLEX',2)]
def lineup(team_df,col='cv'):
    ro=team_df[team_df.pos.isin(['QB','RB','WR','TE'])].sort_values(col,ascending=False)
    used=set(); out={}
    for pos,n in SLOTS:
        pool=ro[(ro.pos==pos) if pos!='FLEX' else ro.pos.isin(['RB','WR','TE'])]
        pool=pool[~pool.player.isin(used)].head(n)
        for i,(_,r) in enumerate(pool.iterrows()): used.add(r.player); out[f'{pos}{i+1}']=(r.player,round(r[col],1))
    bench=ro[~ro.player.isin(used)]
    return out,round(sum(v[1] for v in out.values()),1),bench
teams=sorted(df.manager.unique())
L={m:lineup(df[df.manager==m]) for m in teams}
slot_med={s:np.median([L[m][0].get(s,('',0))[1] for m in teams]) for s in L['Jamal'][0]}
print('LEAGUE MEDIAN by slot',slot_med)
profiles={}
for m in teams:
    out,tot,bench=L[m]
    weak=[s for s in out if out[s][1]<slot_med[s]-8]
    strong=[s for s in out if out[s][1]>slot_med[s]+8]
    d=df[df.manager==m]
    depth={p:int(((d.pos==p)&(d.cv>=15)).sum()) for p in ['QB','RB','WR','TE']}
    inj=[f"{r.player}({r.status})" for _,r in d.iterrows() if str(r.status) not in ('','nan')]
    profiles[m]=dict(starters=out,starter_value=tot,weak_slots=weak,strong_slots=strong,depth_startable=depth,injuries=inj,
        bench_top=[(r.player,r.pos,round(r.cv,1)) for _,r in bench.head(5).iterrows()])
    print(f"\n== {m}  starters {tot}  weak {weak}  strong {strong}  depth {depth}\n   lineup {[(s,v[0]) for s,v in out.items()]}\n   bench {profiles[m]['bench_top']}\n   inj {inj}")
json.dump(profiles,open(S+'/tl/profiles.json','w'),indent=1,default=str)
# ---- candidate offers: Jamal <-> partner; evaluate both by ROS lineup value (cv) and partner by perceived (pv) with need weighting
J=df[df.manager=='Jamal']
JGIVE=[p for p in J.player if p not in ('San Francisco 49ers',)]
def team_after(m,minus,plus):
    d=df[(df.manager==m)&(~df.player.isin(minus))]
    add=df[df.player.isin(plus)].copy(); add['manager']=m
    return pd.concat([d,add])
res=[]
for m in teams:
    if m=='Jamal': continue
    P=df[df.manager==m]; PGIVE=[p for p in P.player if P[P.player==p].pos.iloc[0]!='DST' and P[P.player==p].cv.iloc[0]>=8]
    base_j=L['Jamal'][1]; base_p=L[m][1]
    base_pj=lineup(df[df.manager=='Jamal'],'pv')[1]; base_pp=lineup(P,'pv')[1]
    combos=[]
    jg=[c for k in (1,2) for c in itertools.combinations([p for p in JGIVE if J[J.player==p].cv.iloc[0]>=6],k)]
    pg=[c for k in (1,2) for c in itertools.combinations(PGIVE,k)]
    for give in jg:
        for get in pg:
            if len(give)+len(get)>3: continue
            tj=team_after('Jamal',give,get); tp=team_after(m,get,give)
            dj=lineup(tj)[1]-base_j; dp=lineup(tp)[1]-base_p
            dpp=lineup(tp,'pv')[1]-base_pp     # partner's perceived lineup change
            # partner perceived asset balance (what he thinks he gives vs gets), regardless of lineup
            asset=sum(df[df.player==g].pv.iloc[0] for g in give)-sum(df[df.player==g].pv.iloc[0] for g in get)
            combos.append(dict(partner=m,give=' + '.join(give),get=' + '.join(get),jamal_lineup=round(dj,1),partner_lineup=round(dp,1),partner_perceived_lineup=round(dpp,1),partner_asset_balance=round(asset,1)))
    c=pd.DataFrame(combos)
    ok=c[(c.jamal_lineup>=3)&(c.partner_lineup>=-3)&(c.partner_asset_balance>=-6)].sort_values('jamal_lineup',ascending=False)
    res.append(ok.head(8))
    print(f"\n--- {m}: {len(c)} combos, {len(ok)} pass both-sides filter")
    print(ok.head(8).to_string(index=False))
pd.concat(res).to_csv(S+'/tl/candidates.csv',index=False)

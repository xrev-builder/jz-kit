"""Season Monte Carlo: playoff and title probability for candidate rosters in each league,
with an empirical injury process, bye weeks, weekly variance, ESPN-room opponents, and each league's playoff format."""
import pandas as pd, numpy as np, re, unicodedata, sys, json
D='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/data/'
O='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/'
rng=np.random.default_rng(7)
NSEASONS=int(sys.argv[1]) if len(sys.argv)>1 else 2000

def norm(s):
    s=unicodedata.normalize('NFKD',str(s)).encode('ascii','ignore').decode().lower().replace("'","").replace(".","").replace("-"," ")
    return re.sub(r"\s+"," ",re.sub(r"\b(jr|sr|ii|iii|iv|v)\b","",s)).strip()

exec(open(O+'master.py').read().split("s25=season(2025)")[0])  # score(), season()
m=pd.read_csv(O+'master.csv'); m['key']=m.player.map(norm)
em=pd.read_csv(O+'exp_missed.csv'); m=m.merge(em[['player','exp_missed']],on='player',how='left')
esp=pd.read_csv(O+'espn_adp_est.csv')[['player','espn_adp']]; m=m.merge(esp,on='player',how='left')
trans=pd.read_csv(O+'injury_transitions.csv')

# weekly sd per player (2025, League A scoring; B nearly identical for skill players)
w=pd.read_csv(D+'stats_player_week_2025.csv',low_memory=False)
w=w[(w.season_type=='REG')&(w.position.isin(['QB','RB','WR','TE']))].copy()
w['ptsA']=score(w,'A'); w['ptsB']=score(w,'B')
sdA=w.groupby('player_id').ptsA.std().rename('sdA'); sdB=w.groupby('player_id').ptsB.std().rename('sdB')
pid=pd.read_csv(D+'db_playerids.csv',low_memory=False)[['fantasypros_id','gsis_id']].dropna()
pid['fantasypros_id']=pid.fantasypros_id.astype(int)
# master lacks gsis; rebuild via ecr id -> gsis
e=pd.read_csv(D+'db_fpecr_latest.csv',low_memory=False); e=e[e.ecr_type=='ro'][['player','id']]
e=e.merge(pid,left_on='id',right_on='fantasypros_id',how='left')
m=m.merge(e[['player','gsis_id']].drop_duplicates('player'),on='player',how='left')
m=m.merge(sdA,left_on='gsis_id',right_index=True,how='left').merge(sdB,left_on='gsis_id',right_index=True,how='left')

# positional curves (avg of 2024 and 2025) by league
curves={}
for lg in 'AB':
    cur={}
    for yr in (2025,2024):
        s=season(yr); suf=str(yr)[2:]; s=s[s[f'g_{suf}']>=8]
        for pos in ['QB','RB','WR','TE']:
            v=s[s.pos==pos][f'ppg{lg}_{suf}'].sort_values(ascending=False).values[:60]
            cur.setdefault(pos,[]).append(v)
    curves[lg]={p:np.mean([np.pad(a,(0,60-len(a)),constant_values=a[-1]) for a in v],axis=0) for p,v in cur.items()}
# usage-history model projections (fitted 2013-2025) keyed by normalized name
UP=pd.read_csv(O+'usage_proj_2026.csv'); UP['key']=UP.name.map(norm); UPA=dict(zip(UP.key,UP.model_A)); UPB=dict(zip(UP.key,UP.model_B))
# 2025 injury-report flags by category (weeks listed, weeks Out)
IF=pd.read_csv(O+'injury_flags_2025.csv'); IF['key']=IF.full_name.map(norm)
INJADD={('RB','knee'):1.5,('WR','knee'):1.3,('TE','knee'):0.8,('QB','knee'):0.8,('RB','hamstring'):0.5,('WR','hamstring'):0.8,('TE','hamstring'):0.8,('QB','concussion'):1.0,('WR','ankle'):0.8,('RB','ankle'):0.3,('WR','ribs'):0.8,('QB','shoulder'):1.0,('RB','achilles'):2.0,('WR','achilles'):2.0,('TE','achilles'):2.0,('RB','back'):0.8,('WR','back'):0.6,('QB','back'):0.8}
def inj_add(key,pos):
    t=IF[(IF.key==key)&(IF.outs>0)]
    return float(min(3.0,sum(INJADD.get((pos,c),0.2) for c in t.cat)))
# team for correlation
TEAM=dict(zip(m.key,m.team_26.fillna('FA')))
# 2026 win totals (FOX/CBS, Sept 2) -> game-script tilt per position (per win above 8.5)
_v=pd.read_csv('/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/research/09-vegas.csv')
WINTOT={('LA' if t=='LAR' else t):float(re.match(r'\s*([\d.]+)',str(w)).group(1)) for t,w in zip(_v.team,_v.win_total)}
GS={'RB':0.22,'QB':0.20,'WR':0.09,'TE':0.04}
# late news flags (Sept 3): extra expected games missed
NEWS_MISSED={'Rome Odunze':1.0,"D'Andre Swift":1.0,'Kyle Monangai':2.0,'Malik Nabers':0.5,'Emeka Egbuka':0.5}
# Lingering-injury literature (research/08-injury-evidence.md, 08-injury-types.csv): (production multiplier, extra expected games missed)
# for injuries the 2025 report flags cannot see (postseason/offseason/camp) or where the literature says the year-1 haircut outlasts the games missed.
LING={
 'George Kittle':(0.85,1.5),      # Achilles Jan-26, TE: 71% RTP but 20%+ Y1 decline in matched cohort
 'Malik Nabers':(0.90,0.5),       # ACL+meniscus Oct-25, WR: largest/most persistent Y1 loss; age 23 moderates
 'Tucker Kraft':(0.93,0.5),       # ACL Nov-25, TE: RTP fine, likely snap count early
 'Cam Skattebo':(0.90,1.0),       # open tib/fib + dislocation Oct-25; 'not 100% twitchy'
 'Patrick Mahomes II':(0.97,0.5), # ACL+LCL Dec-25, QB: 92% RTP, ~0 production loss
 'Rashee Rice':(0.97,0.5),        # May-26 scope on the repaired knee
 'Joe Burrow':(0.97,0.0),         # surgical grade-3 turf toe: post-op cohort underperformed
 'Sam LaPorta':(0.95,1.5),        # lumbar disc surgery + new hip; Campbell unsure on Wk 1
 'Chris Godwin Jr.':(0.95,0.5),   # two ankle surgeries
 'Mike Evans':(1.0,1.0),          # 3 hamstrings + camp groin, age 33: 38% any-season hamstring recurrence
 'MarShawn Lloyd':(1.0,1.0),      # two hamstrings, one career game
 'A.J. Brown':(1.0,0.5),          # hamstring x3 in 3 yrs + thumb
 'Nico Collins':(1.0,0.5),        # never a full 17; hamstring + 2 concussions
 'Tee Higgins':(1.0,0.5),         # hamstring/quad history + heel now
 'Christian McCaffrey':(1.0,0.5), # bilateral Achilles tendinitis 24, calf camp 26, age 30
 'Jonathan Taylor':(1.0,0.5),     # three high-ankle sprains 22-24
 'Kenneth Walker III':(1.0,0.5),  # foot soreness now; calf/ankle/oblique history
 'Davante Adams':(1.0,0.5),       # hamstring 24 and 25, age 33
 'Christian Watson':(1.0,0.5),    # hamstring x3 + ACL
 'Rome Odunze':(1.0,0.5),         # foot stress fracture 25; leg Sept 3 (also NEWS_MISSED)
 'Matthew Stafford':(1.0,0.8),    # disc, age 38
 'Jayden Daniels':(1.0,0.5),      # elbow dislocation + re-injury 25
 'Jeremiyah Love':(1.0,0.5),      # high-ankle: early returners rarely regain form quickly
 'Lamar Jackson':(1.0,0.3),'Justin Jefferson':(1.0,0.3),'Zay Flowers':(1.0,0.3),'Terry McLaurin':(1.0,0.3),'Saquon Barkley':(1.0,0.3),'TreVeyon Henderson':(1.0,0.3),'Garrett Wilson':(1.0,0.5),'Omarion Hampton':(1.0,0.3),
}
# role overrides where the Aug-28 consensus predates a verified depth-chart change (ppg)
ROLE={'MarShawn Lloyd':10.5,'Tyler Allgeier':8.0,'Jadarian Price':12.5,'Sione Vaki':4.0,'Blake Corum':6.5}
POOL={'A':{'RB':12,'WR':12,'TE':9,'QB':17},'B':{'RB':12,'WR':12,'TE':9,'QB':20.5}}
CV={'RB':0.55,'WR':0.6,'TE':0.65,'QB':0.35}

def project(lg):
    ppg=f'ppg{lg}_25'; ppg24=f'ppg{lg}_24'
    rows={}
    for r in m.itertuples():
        if r.pos=='DST': continue
        prior=getattr(r,ppg24) if (pd.notna(getattr(r,ppg24)) and r.g_24>=8) else POOL[lg][r.pos]
        g=r.g_25 if pd.notna(r.g_25) else 0
        p25=getattr(r,ppg) if pd.notna(getattr(r,ppg)) else prior
        shrunk=(g*p25+8*prior)/(g+8)
        pr=int(min(max(r.ecr_pos,1),60))-1 if pd.notna(r.ecr_pos) else 59
        cv=curves[lg][r.pos][pr]
        # age and career-year adjustments on the production half (fitted 2019-2025, within-player, controlling for prior ppg)
        age=r.age if pd.notna(r.age) else 25
        # coefficients fitted on 2013-2025 (13 transitions), stable across eras
        if r.pos=='RB': adj=-0.30*(age-26)
        elif r.pos=='WR': adj=-0.35*(age-26)
        elif r.pos=='TE': adj=-0.09*(age-27)
        else: adj=-0.15*(age-28)
        if pd.notna(getattr(r,ppg24)) and r.g_24>=8 and g>=8 and (p25-getattr(r,ppg24))>=4 and p25>=14: adj+=(-1.1 if r.pos=='RB' else -1.2)
        shrunk=shrunk+adj
        um=(UPA if lg=='A' else UPB).get(r.key)
        prod=um if um is not None else shrunk   # usage model where available (age inside the model), else shrunk production
        mean=0.5*prod+0.5*cv if g>0 else cv
        mean=ROLE.get(r.player,mean)
        mean=mean+GS.get(r.pos,0)*(WINTOT.get(TEAM.get(r.key,''),8.5)-8.5)
        mean=mean*LING.get(r.player,(1.0,0.0))[0]
        sd=getattr(r,'sdA' if lg=='A' else 'sdB')
        if not (pd.notna(sd) and g>=8): sd=CV[r.pos]*mean
        sd=max(sd,3.0)
        rows[r.player]=dict(pos=r.pos,team=TEAM.get(r.key,'FA'),mean=mean,sd=sd,bye=int(r.bye) if pd.notna(r.bye) else 0,age=r.age if pd.notna(r.age) else 25,g25=g,exp_missed=(r.exp_missed if pd.notna(r.exp_missed) else 4)+inj_add(r.key,r.pos)+NEWS_MISSED.get(r.player,0)+LING.get(r.player,(1.0,0.0))[1],adp=r.espn_adp if pd.notna(r.espn_adp) else (r.ecr_ovr if pd.notna(r.ecr_ovr) else 300),ecr=r.ecr_ovr)
    for r in m[m.pos=='DST'].itertuples():
        rows[r.player]=dict(pos='DST',team='DST',mean=7.0,sd=6.0,bye=int(r.bye) if pd.notna(r.bye) else 0,age=0,g25=17,exp_missed=0,adp=r.espn_adp if pd.notna(r.espn_adp) else r.ecr_ovr,ecr=r.ecr_ovr)
    return rows

# injury sampling: nonparametric from transitions by bucket
def age_band(pos,age):
    if pos=='RB': return '<27' if age<27 else ('27-28' if age<29 else '29+')
    if pos=='WR': return '<30' if age<30 else '30+'
    return 'all'
buckets={}
for (pos,ab,pb),g in trans.groupby(['pos','age_band','prior_band']): buckets[(pos,ab,str(pb))]=g.missed_next.values
posb={pos:g.missed_next.values for pos,g in trans.groupby('pos')}
OVERRIDE={'Jordyn Tyson':8,'James Conner':6,'Zach Charbonnet':5,'Isiah Pacheco':6,'Josh Jacobs':8,'Tank Dell':5}
WK1={'Jeremiyah Love':(0.5,2),'Malik Nabers':(0.4,2),'Ashton Jeanty':(0.3,1),'George Kittle':(0.4,2),'Puka Nacua':(0.35,3)}
def sample_missed(name,p):
    if name in OVERRIDE: base=OVERRIDE[name]; start=1
    else:
        pos=p['pos']
        if pos=='DST': return np.zeros(18,bool)
        mp=17-p['g25'] if p['g25']>0 else 3
        pb='0' if mp<=0 else ('1-3' if mp<=3 else '4+')
        arr=buckets.get((pos,age_band(pos,p['age']),pb))
        if arr is None or len(arr)<8: arr=posb[pos]
        base=int(rng.choice(arr)); start=int(rng.integers(1,max(1,18-base)+1)) if base<17 else 1
    out=np.zeros(18,bool)
    if base>0: out[start:start+base]=True
    if name in WK1:
        pr,n=WK1[name]
        if rng.random()<pr: out[1:1+n]=True
    return out

# RB depth (Sept 2 depth charts): team -> [RB1,RB2] as P keys
_dc=pd.read_csv(D+'depth_charts_2026.csv',low_memory=False); _dc=_dc[_dc.pos_abb=='RB']; _dc=_dc[_dc.dt==_dc.groupby('team').dt.transform('max')]
_k2p={norm(k):k for k in m.player}
DEPTH={}
for tm,g in _dc.sort_values('pos_rank').groupby('team'):
    names=[_k2p.get(norm(n)) for n in g.player_name.tolist()[:3]]; names=[n for n in names if n]
    if len(names)>=2: DEPTH[tm]=names
HANDCUFF={v[0]:v[1] for v in DEPTH.values()}
HC_RATIO=0.81   # backup scores 81% of the starter's ppg when the starter is out (2012-2025, n=258)
EMERGE_PER_SEASON=4.0; EMERGE_MEAN=13.0
TEAMCORR_SD=0.12
WAIVER={'A':{'QB':15,'RB':9.5,'WR':9.5,'TE':8,'DST':6},'B':{'QB':18.5,'RB':9.5,'WR':9.5,'TE':8,'DST':6}}
CAPS={'QB':2,'RB':6,'WR':7,'TE':2,'DST':1}
def draft_opponents(P,user_slot,user_roster,nteams=10,rounds=15):
    pool={k:v for k,v in P.items() if k not in user_roster}
    order=sorted(pool,key=lambda k:pool[k]['adp']+rng.normal(0,6))
    teams={i:[] for i in range(nteams)}
    taken=set(user_roster)
    for rd in range(rounds):
        slots=list(range(nteams)) if rd%2==0 else list(range(nteams))[::-1]
        for s in slots:
            if s==user_slot: continue
            have=teams[s]; cnt={p:sum(1 for x in have if P[x]['pos']==p) for p in CAPS}
            need=[]
            if rd>=11:
                if cnt['QB']==0: need.append('QB')
                if cnt['TE']==0: need.append('TE')
                if rd>=13 and cnt['DST']==0: need.append('DST')
            pick=None
            for k in order:
                if k in taken: continue
                pos=P[k]['pos']
                if need and pos!=need[0]: continue
                if cnt[pos]>=CAPS[pos]: continue
                if pos=='DST' and rd<12: continue
                if pos=='QB' and cnt['QB']==1 and rd<12: continue
                if pos=='TE' and cnt['TE']==1 and rd<10: continue
                pick=k; break
            if pick is None: continue
            teams[s].append(pick); taken.add(pick)
    teams[user_slot]=list(user_roster)
    return teams

SLOTS=[('QB',1),('RB',2),('WR',2),('TE',1),('FLEX',2),('DST',1)]
def wk_mean(k,P,week,avail,over):
    # projected mean this week: handcuff promotion if the team's RB1 is out; emergence overrides
    mu=over.get(k,P[k]['mean'])
    for rb1,rb2 in HANDCUFF.items():
        if rb2==k and rb1 in avail and not avail[rb1][week]: mu=max(mu,HC_RATIO*P[rb1]['mean'])
    return mu
def lineup_points(roster,P,week,avail,lg,over=None,tf=None):
    over=over or {}; tf=tf or {}
    cands=[k for k in roster if avail.get(k,np.ones(18,bool))[week] and P[k]['bye']!=week]
    mus={k:wk_mean(k,P,week,avail,over) for k in cands}
    cands.sort(key=lambda k:-mus[k])
    used=set(); total=0.0
    def take(pos_ok,n):
        nonlocal total
        got=0
        for k in cands:
            if k in used or P[k]['pos'] not in pos_ok: continue
            used.add(k); got+=1
            f=tf.get(P[k]['team'],1.0)
            total+=max(-2,rng.normal(mus[k]*f,P[k]['sd']))
            if got==n: break
        for _ in range(n-got):
            wl=WAIVER[lg][pos_ok[0]]; total+=max(-2,rng.normal(wl,6))
    take(['QB'],1); take(['RB'],2); take(['WR'],2); take(['TE'],1); take(['RB','WR','TE'],2); take(['DST'],1)
    return total
def team_factors(P):
    return {t:max(0.5,rng.normal(1.0,TEAMCORR_SD)) for t in set(v['team'] for v in P.values())}
def waiver_round(teams,P,avail,over,week,W,PF,fa):
    # after week's games: each team, worst record first, may add the best free agent that improves its lineup for next week
    order=sorted(teams,key=lambda t:(W[t],PF[t]))
    for t in order:
        ro=teams[t]; nxt=week+1
        if nxt>17: break
        # find weakest projected starter-slot value next week
        def best_lineup_value(names):
            cands=[k for k in names if avail.get(k,np.ones(18,bool))[nxt] and P[k]['bye']!=nxt]
            mus={k:wk_mean(k,P,nxt,avail,over) for k in cands}; cands.sort(key=lambda k:-mus[k]); used=set(); tot=0
            for ok,n in (('QB',1),('RB',2),('WR',2),('TE',1),('FLEX',2)):
                oks=['RB','WR','TE'] if ok=='FLEX' else [ok]; g=0
                for k in cands:
                    if k in used or P[k]['pos'] not in oks: continue
                    used.add(k); tot+=mus[k]; g+=1
                    if g==n: break
                tot+=(n-g)*9.0
            return tot
        # only teams with a hole next week look: a starter-quality player unavailable, or thin at a position
        need_pos=set()
        top=sorted([k for k in ro if P[k]['pos']!='DST'],key=lambda k:-P[k]['mean'])[:9]
        for k in top:
            if not avail.get(k,np.ones(18,bool))[nxt] or P[k]['bye']==nxt: need_pos.add(P[k]['pos'])
        if not need_pos: continue
        base=best_lineup_value(ro)
        cands=sorted([k for k in fa if P[k]['pos'] in need_pos or (P[k]['pos'] in ('RB','WR') and 'TE' not in need_pos)],key=lambda k:-wk_mean(k,P,nxt,avail,over))[:6]
        best=None; gain=0.5
        for k in cands:
            v=best_lineup_value(ro+[k])-base
            if v>gain: gain=v; best=k
        if best:
            # drop the lowest-value healthy non-starter
            drop=min((k for k in ro if P[k]['pos']!='DST'),key=lambda k:wk_mean(k,P,nxt,avail,over)+ (0 if avail.get(k,np.ones(18,bool))[nxt] else -5))
            ro.remove(drop); ro.append(best); fa.discard(best); fa.add(drop)
    return teams

def simulate(lg,user_roster,user_slot,injuries=True,n=NSEASONS,label=''):
    P=project(lg); nteams=10; nplay=8 if lg=='A' else 6
    made=0; titles=0; wins_hist=[]; pts_hist=[]
    for s in range(n):
        teams=draft_opponents(P,user_slot,user_roster)
        allp=set(k for t in teams.values() for k in t)
        fa=set(k for k in P if k not in allp and P[k]['pos']!='DST')
        avail={k:(~sample_missed(k,P[k]) if injuries else np.ones(18,bool)) for k in P}
        over={}
        # in-season emergences (undrafted players who become 12+ ppg starters), ~4 per season at weeks 2-10
        n_em=rng.poisson(EMERGE_PER_SEASON); em_weeks=rng.integers(2,11,size=n_em)
        W=np.zeros(nteams); PF=np.zeros(nteams)
        for wk in range(1,15):
            for ew in em_weeks[em_weeks==wk]:
                pool=[k for k in fa if P[k]['pos'] in ('RB','WR')]
                if pool: over[rng.choice(pool)]=float(rng.normal(EMERGE_MEAN,2.0))
            tf=team_factors(P)
            sc={t:lineup_points(teams[t],P,wk,avail,lg,over,tf) for t in range(nteams)}
            perm=rng.permutation(nteams)
            for i in range(0,nteams,2):
                a,b=perm[i],perm[i+1]; PF[a]+=sc[a]; PF[b]+=sc[b]
                if sc[a]>sc[b]: W[a]+=1
                else: W[b]+=1
            waiver_round(teams,P,avail,over,wk,W,PF,fa)
        seed=sorted(range(nteams),key=lambda t:(-W[t],-PF[t]))
        po=seed[:nplay]
        if user_slot in po: made+=1
        wins_hist.append(W[user_slot]); pts_hist.append(PF[user_slot]/14)
        # playoffs
        def game(a,b,wk):
            tf=team_factors(P)
            return a if lineup_points(teams[a],P,wk,avail,lg,over,tf)>=lineup_points(teams[b],P,wk,avail,lg,over,tf) else b
        if nplay==8:
            r1=[game(po[0],po[7],15),game(po[1],po[6],15),game(po[2],po[5],15),game(po[3],po[4],15)]
            r2=[game(r1[0],r1[3],16),game(r1[1],r1[2],16)]
            champ=game(r2[0],r2[1],17)
        else:
            r1=[po[0],po[1],game(po[2],po[5],15),game(po[3],po[4],15)]
            r2=[game(r1[0],r1[3],16),game(r1[1],r1[2],16)]
            champ=game(r2[0],r2[1],17)
        if champ==user_slot: titles+=1
    return dict(label=label,league=lg,injuries=injuries,p_playoffs=made/n,p_title=titles/n,avg_wins=float(np.mean(wins_hist)),avg_ppg=float(np.mean(pts_hist)))

if __name__=='__main__':
    R={'A':{
     'Plan (McBride at 19)':['Jahmyr Gibbs','Trey McBride','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Jameson Williams','Justin Herbert','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers'],
     'Plan (London at 19, Kraft TE)':['Jahmyr Gibbs','Drake London','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Tucker Kraft','Justin Herbert','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers'],
     'Zero-RB (Chase at 2)':["Ja'Marr Chase",'Drake London','A.J. Brown','DeVonta Smith','Zay Flowers','Tee Higgins','MarShawn Lloyd','Rhamondre Stevenson','Justin Herbert','Rico Dowdle','Kenny Gainwell','Blake Corum','Tucker Kraft','Jacory Croskey-Merritt','Los Angeles Chargers'],
     'Robust-RB':['Jahmyr Gibbs','Chase Brown','Kenneth Walker III','Quinshon Judkins','David Montgomery','Tee Higgins','Emeka Egbuka','Jameson Williams','Justin Herbert','Rome Odunze','Michael Wilson','Tucker Kraft','KC Concepcion','Sione Vaki','Los Angeles Chargers'],
     'Early QB (Allen at 19)':['Jahmyr Gibbs','Josh Allen','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Tucker Kraft','Jameson Williams','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers'],
    },'B':{
     'Plan (Allen at 24)':['Jaxon Smith-Njigba','Chase Brown','Josh Allen','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'],
     'Plan (Collins at 24, Maye at 37)':['Jaxon Smith-Njigba','Chase Brown','Nico Collins','Drake Maye','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'],
     'Zero-RB':['Jaxon Smith-Njigba','Drake London','Josh Allen','Garrett Wilson','Emeka Egbuka','Tee Higgins','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Kenny Gainwell','Blake Corum','Jacory Croskey-Merritt','KC Concepcion','Los Angeles Chargers'],
     'Robust-RB':['Jaxon Smith-Njigba','Chase Brown','Kyren Williams','Quinshon Judkins','David Montgomery','Emeka Egbuka','Jameson Williams','Rome Odunze','Patrick Mahomes II','Rico Dowdle','Michael Wilson','Tucker Kraft','KC Concepcion','Blake Corum','Los Angeles Chargers'],
     'Late QB (Mahomes at 77)':['Jaxon Smith-Njigba','Chase Brown','Nico Collins','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Patrick Mahomes II','Rico Dowdle','Michael Wilson','Tucker Kraft','KC Concepcion','Blake Corum','Los Angeles Chargers'],
    }}
    slot={'A':1,'B':3}
    out=[]
    for lg in 'AB':
        P=project(lg)
        for lab,ro in R[lg].items():
            missing=[x for x in ro if x not in P]; assert not missing,(lab,missing)
            out.append(simulate(lg,ro,slot[lg],True,NSEASONS,lab))
            print(out[-1],flush=True)
        # injuries off for the plan
        first=list(R[lg].keys())[0]
        out.append(simulate(lg,R[lg][first],slot[lg],False,NSEASONS,first+' [no injuries]')); print(out[-1],flush=True)
        # ESPN-sheet baseline: user drafted by the opponent AI at the slot
        teams=draft_opponents(P,-1,[]); base=teams[slot[lg]]
        out.append(simulate(lg,base,slot[lg],True,NSEASONS,'ESPN-sheet drafter at this slot')); print(out[-1],'roster:',base,flush=True)
    pd.DataFrame(out).to_csv(O+'sim_results.csv',index=False)
    print(pd.DataFrame(out).round(3).to_string(index=False))

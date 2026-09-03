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
        if r.pos=='RB': adj=-0.33*(age-26)-0.32*max(0,age-28)
        elif r.pos=='WR': adj=-0.36*(age-26)
        elif r.pos=='TE': adj=-0.10*(age-27)
        else: adj=-0.27*(age-28)
        if pd.notna(getattr(r,ppg24)) and r.g_24>=8 and g>=8 and (p25-getattr(r,ppg24))>=4 and p25>=14: adj+=(-1.5 if r.pos=='RB' else -1.0)
        shrunk=shrunk+adj
        mean=0.5*shrunk+0.5*cv if g>0 else cv
        mean=ROLE.get(r.player,mean)
        sd=getattr(r,'sdA' if lg=='A' else 'sdB')
        if not (pd.notna(sd) and g>=8): sd=CV[r.pos]*mean
        sd=max(sd,3.0)
        rows[r.player]=dict(pos=r.pos,mean=mean,sd=sd,bye=int(r.bye) if pd.notna(r.bye) else 0,age=r.age if pd.notna(r.age) else 25,g25=g,exp_missed=r.exp_missed if pd.notna(r.exp_missed) else 4,adp=r.espn_adp if pd.notna(r.espn_adp) else (r.ecr_ovr if pd.notna(r.ecr_ovr) else 300),ecr=r.ecr_ovr)
    for r in m[m.pos=='DST'].itertuples():
        rows[r.player]=dict(pos='DST',mean=7.0,sd=6.0,bye=int(r.bye) if pd.notna(r.bye) else 0,age=0,g25=17,exp_missed=0,adp=r.espn_adp if pd.notna(r.espn_adp) else r.ecr_ovr,ecr=r.ecr_ovr)
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
def lineup_points(roster,P,week,avail,lg):
    # choose starters by projected mean among available; realized points sampled
    cands=[k for k in roster if avail[k][week] and P[k]['bye']!=week]
    cands.sort(key=lambda k:-P[k]['mean'])
    used=set(); total=0.0
    def take(pos_ok,n):
        nonlocal total
        got=0
        for k in cands:
            if k in used or P[k]['pos'] not in pos_ok: continue
            used.add(k); got+=1
            total+=max(-2,rng.normal(P[k]['mean'],P[k]['sd']))
            if got==n: break
        for _ in range(n-got):
            wl=WAIVER[lg][pos_ok[0]]; total+=max(-2,rng.normal(wl,6))
    take(['QB'],1); take(['RB'],2); take(['WR'],2); take(['TE'],1); take(['RB','WR','TE'],2); take(['DST'],1)
    return total

def simulate(lg,user_roster,user_slot,injuries=True,n=NSEASONS,label=''):
    P=project(lg); nteams=10; nplay=8 if lg=='A' else 6
    made=0; titles=0; wins_hist=[]; pts_hist=[]
    for s in range(n):
        teams=draft_opponents(P,user_slot,user_roster)
        allp=set(k for t in teams.values() for k in t)
        avail={k:(~sample_missed(k,P[k]) if injuries else np.ones(18,bool)) for k in allp}
        W=np.zeros(nteams); PF=np.zeros(nteams)
        for wk in range(1,15):
            perm=rng.permutation(nteams)
            sc={t:lineup_points(teams[t],P,wk,avail,lg) for t in range(nteams)}
            for i in range(0,nteams,2):
                a,b=perm[i],perm[i+1]; PF[a]+=sc[a]; PF[b]+=sc[b]
                if sc[a]>sc[b]: W[a]+=1
                else: W[b]+=1
        seed=sorted(range(nteams),key=lambda t:(-W[t],-PF[t]))
        po=seed[:nplay]
        if user_slot in po: made+=1
        wins_hist.append(W[user_slot]); pts_hist.append(PF[user_slot]/14)
        # playoffs
        def game(a,b,wk):
            return a if lineup_points(teams[a],P,wk,avail,lg)>=lineup_points(teams[b],P,wk,avail,lg) else b
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

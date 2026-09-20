import sys,json,os
os.chdir('/home/user/jz-kit/research/fantasy-2026/model')
N=int(sys.argv[1]) if len(sys.argv)>1 else 300
TR=json.loads(sys.argv[2]) if len(sys.argv)>2 else []
LABEL=sys.argv[3] if len(sys.argv)>3 else 'baseline'
src=open('sim_league_fb.py').read()
head=src.split("P=project('B')")[0]
sys.argv=[sys.argv[0],str(N)]
exec(head)
def swap(t,drop,add):
    for d in drop:
        if d in R[t]: R[t].remove(d)
    R[t]+=add
swap(3,['Rico Dowdle','Los Angeles Chargers','Jayden Reed'],['Devaughn Vele','San Francisco 49ers','Brock Purdy'])
swap(9,['Minnesota Vikings'],['Patrick Mahomes','Tampa Bay Buccaneers'])
swap(2,["De'Zhaun Stribling"],['Trevor Lawrence','Antonio Williams'])
swap(6,['Detroit Lions'],['New England Patriots'])
swap(1,[],['Kalif Raymond','Kansas City Chiefs'])
swap(5,[],['Jared Goff'])
swap(8,['Cyrus Allen'],['Caleb Douglas'])
# TR: list of [teamA, [playersA out], teamB, [playersB out]]
for a,pa,b,pb in TR:
    for p in pa: R[a].remove(p); R[b].append(p)
    for p in pb: R[b].remove(p); R[a].append(p)

P=project('B'); lg='B'
# MARKET MODE: price every player at the consensus curve for his FantasyPros ROS positional rank (scraped 2026-09-18)
import os
if os.environ.get('MARKET'):
    ROSJ=json.load(open('/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/ros_ecr_0918.json'))['pos']
    for pos in ['QB','RB','WR','TE']:
        ks=[k for k in P if P[k]['pos']==pos]
        ks.sort(key=lambda k:(ROSJ.get(k, 200+(P[k]['ecr'] if P[k]['ecr']==P[k]['ecr'] else 400))))
        for i,k in enumerate(ks):
            cv=curves['B'][pos][min(i,59)]
            P[k]['mean']=cv; P[k]['sd']=max(CV[pos]*cv,3.0)
miss=[(t,n) for t,ro in R.items() for n in ro if n not in P]
teams={t:[n for n in ro if n in P] for t,ro in R.items()}
hl={}
for t in range(10):
    av={k:np.ones(18,bool) for k in P}
    hl[t]=round(lineup_points(teams[t],P,1,av,lg,{},team_factors(P)),1)
nteams=10; nplay=6
made=np.zeros(10); titles=np.zeros(10); Wt=np.zeros(10); PFt=np.zeros(10)
for s in range(N):
    tm={t:list(v) for t,v in teams.items()}
    allp=set(k for t in tm.values() for k in t)
    fa=set(k for k in P if k not in allp and P[k]['pos']!='DST')
    avail={k:~sample_missed(k,P[k]) for k in P}
    over={}
    n_em=rng.poisson(EMERGE_PER_SEASON); em_weeks=rng.integers(2,11,size=n_em)
    W=np.zeros(nteams); PF=np.zeros(nteams)
    # week 1 already played: seed actual results
    W[[0,5,8,9,7]]+=1
    for wk in range(2,15):
        for ew in em_weeks[em_weeks==wk]:
            pool=[k for k in fa if P[k]['pos'] in ('RB','WR')]
            if pool: over[rng.choice(pool)]=float(rng.normal(EMERGE_MEAN,2.0))
        tf=team_factors(P)
        sc={t:lineup_points(tm[t],P,wk,avail,lg,over,tf) for t in range(nteams)}
        perm=rng.permutation(nteams)
        for i in range(0,nteams,2):
            a,b=perm[i],perm[i+1]; PF[a]+=sc[a]; PF[b]+=sc[b]
            if sc[a]>sc[b]: W[a]+=1
            else: W[b]+=1
        waiver_round(tm,P,avail,over,wk,W,PF,fa)
    seed=sorted(range(nteams),key=lambda t:(-W[t],-PF[t]))
    po=seed[:nplay]
    for t in po: made[t]+=1
    Wt+=W; PFt+=PF/13
    def game(a,b,wk):
        tf=team_factors(P)
        return a if lineup_points(tm[a],P,wk,avail,lg,over,tf)>=lineup_points(tm[b],P,wk,avail,lg,over,tf) else b
    r1=[po[0],po[1],game(po[2],po[5],15),game(po[3],po[4],15)]
    r2=[game(r1[0],r1[3],16),game(r1[1],r1[2],16)]
    champ=game(r2[0],r2[1],17)
    titles[champ]+=1
out={'label':LABEL,'N':N,'missing':miss,'teams':{NAMES[t]:{'title':round(titles[t]/N*100,1),'playoffs':round(made[t]/N*100,1),'ppg':round(PFt[t]/N,1),'healthy':hl[t]} for t in range(10)}}
print(json.dumps(out))

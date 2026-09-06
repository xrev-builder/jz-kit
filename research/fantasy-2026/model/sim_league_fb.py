import sys; N=int(sys.argv[1]) if len(sys.argv)>1 else 600; sys.argv=[sys.argv[0],str(N)]
exec(open('sim_season.py').read().split("if __name__=='__main__':")[0])
import json
NAMES=['Ish','Aoc','Billy','Jamal','Moe','Betto','Kass','Hazime','Daoud','Kdouh']
R={
0:['Bijan Robinson','Nico Collins','Josh Allen','David Montgomery','DJ Moore','Brian Thomas Jr.','TreVeyon Henderson','Jordan Addison','Jonathon Brooks','Josh Downs','Rachaad White','Dallas Goedert','Seattle Seahawks','Keaton Mitchell','Adonai Mitchell'],
1:['Jahmyr Gibbs','A.J. Brown','Brock Bowers','Garrett Wilson','Zay Flowers','Marvin Harrison Jr.','Joe Burrow','J.K. Dobbins','MarShawn Lloyd','RJ Harvey','Kyle Monangai','Denver Broncos','Deebo Samuel Sr.','Keenan Allen','Jerry Jeudy'],
2:["Ja'Marr Chase",'Ashton Jeanty','Kenneth Walker III','Rashee Rice','Colston Loveland','Bhayshul Tuten','Parker Washington','Jaylen Warren','Alec Pierce',"De'Zhaun Stribling",'Jordan Mason','Houston Texans','Caleb Williams','Dalton Kincaid',"Ja'Kobi Lane"],
3:['Puka Nacua','Chase Brown','George Pickens','Kyren Williams','Drake Maye','Jadarian Price','Carnell Tate','Harold Fannin Jr.','Rico Dowdle',"Wan'Dale Robinson",'Kyle Pitts Sr.','Jayden Reed','Romeo Doubs','Los Angeles Chargers','Tyler Allgeier'],
4:['Jaxon Smith-Njigba',"De'Von Achane",'Jeremiyah Love','Emeka Egbuka','Cam Skattebo','Rome Odunze','George Kittle','Christian Watson','Courtland Sutton','Makai Lemon','Jalen Hurts','Xavier Worthy','Pittsburgh Steelers','Jacory Croskey-Merritt','Jaxson Dart'],
5:['Amon-Ra St. Brown','Omarion Hampton','Trey McBride','Ladd McConkey','Luther Burden III',"D'Andre Swift",'Rhamondre Stevenson','Justin Herbert','Tucker Kraft','Stefon Diggs','Kenny Gainwell','Khalil Shakir','Cleveland Browns','Zach Charbonnet','Jalen McMillan'],
6:['Christian McCaffrey','Drake London','Breece Hall','DeVonta Smith','Jaylen Waddle','Jameson Williams','Tony Pollard','Michael Pittman Jr.','Travis Kelce','Chuba Hubbard','Jayden Daniels','Jake Ferguson','Tre Tucker','Detroit Lions','Braelon Allen'],
7:['Jonathan Taylor','Derrick Henry','Tee Higgins','Tetairoa McMillan','Davante Adams','Bucky Irving','DK Metcalf','Sam LaPorta','Quentin Johnston','Cleveland Browns','Matthew Stafford','Tyjae Spears','Jakobi Meyers','Cooper Kupp','Keon Coleman'],
8:['Saquon Barkley','James Cook III','Javonte Williams','Chris Olave','Lamar Jackson','Terry McLaurin','Michael Wilson','Chris Godwin Jr.','Isaiah Likely','Blake Corum','KC Concepcion','Tank Bigsby','Philadelphia Eagles','Jordyn Tyson'],
9:['CeeDee Lamb','Justin Jefferson','Malik Nabers','Travis Etienne Jr.','Quinshon Judkins','Tyler Warren','Mike Evans','Josh Jacobs','Matthew Golden','Aaron Jones Sr.','Brian Robinson Jr.','Dak Prescott','Minnesota Vikings','Jalen Coker'],
}
# Hazime's Rams DST is not in the pool: Browns stand in (both mid-pack units)
P=project('B'); lg='B'
miss=[(t,n) for t,ro in R.items() for n in ro if n not in P]
print('missing',miss)
teams={t:[n for n in ro if n in P] for t,ro in R.items()}
# static: week-1 healthy lineup projection
for t in range(10):
    av={k:np.ones(18,bool) for k in P}
    print(NAMES[t].ljust(7), 'healthy lineup', round(lineup_points(teams[t],P,1,av,lg,{},team_factors(P)),1))
nteams=10; nplay=6
made=np.zeros(10); titles=np.zeros(10); Wt=np.zeros(10); PFt=np.zeros(10); seeds=np.zeros(10)
import copy
for s in range(N):
    tm={t:list(v) for t,v in teams.items()}
    allp=set(k for t in tm.values() for k in t)
    fa=set(k for k in P if k not in allp and P[k]['pos']!='DST')
    avail={k:~sample_missed(k,P[k]) for k in P}
    over={}
    n_em=rng.poisson(EMERGE_PER_SEASON); em_weeks=rng.integers(2,11,size=n_em)
    W=np.zeros(nteams); PF=np.zeros(nteams)
    for wk in range(1,15):
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
    for i,t in enumerate(seed): seeds[t]+=i+1
    Wt+=W; PFt+=PF/14
    def game(a,b,wk):
        tf=team_factors(P)
        return a if lineup_points(tm[a],P,wk,avail,lg,over,tf)>=lineup_points(tm[b],P,wk,avail,lg,over,tf) else b
    r1=[po[0],po[1],game(po[2],po[5],15),game(po[3],po[4],15)]
    r2=[game(r1[0],r1[3],16),game(r1[1],r1[2],16)]
    champ=game(r2[0],r2[1],17)
    titles[champ]+=1
order=sorted(range(10),key=lambda t:-titles[t])
print('\nteam     title  playoffs  wins   ppg   avg seed')
for t in order:
    print(NAMES[t].ljust(8), f'{titles[t]/N*100:5.1f}%  {made[t]/N*100:5.1f}%  {Wt[t]/N:4.1f}  {PFt[t]/N:6.1f}  {seeds[t]/N:4.1f}')

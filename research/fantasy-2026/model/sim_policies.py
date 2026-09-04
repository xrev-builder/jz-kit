"""Policy-based draft simulation: the user's roster emerges from a drafting rule against randomized opponents (price noise sd 8, random room type), then the season is simulated."""
import sys; LGARG=sys.argv[1] if len(sys.argv)>1 else 'AB'; FORCE=('fb' if LGARG.endswith('_fb') else None); LGARG=LGARG.replace('_fb',''); sys.argv=['x','1']
exec(open('sim_season.py').read().split("if __name__=='__main__':")[0])
import pandas as pd, numpy as np
N=600
boards={'A':pd.read_csv(O+'board_A.csv'),'B':pd.read_csv(O+'board_B.csv')}
CAPS_U={'QB':1,'RB':6,'WR':7,'TE':1,'DST':1}
def user_pick(policy,rd,have,P,rankmap,taken,lg):
    cnt={p:sum(1 for x in have if P[x]['pos']==p) for p in CAPS_U}
    def allowed(pos):
        if cnt[pos]>=CAPS_U[pos] and not (pos in('RB','WR') ): return False
        if pos=='DST': return rd>=14 and cnt['DST']==0
        if pos=='QB': return cnt['QB']==0 and (rd>=6 if lg=='A' else rd>=3)
        if pos=='TE': return cnt['TE']==0
        if pos=='RB' and cnt['RB']>=6: return False
        if pos=='WR' and cnt['WR']>=7: return False
        return True
    force=None
    if policy=='RB-RB' and rd<=2: force='RB'
    if policy=='WR-WR' and rd<=2: force='WR'
    if policy=='Hero-RB (RB, then WR/TE x2)':
        if rd==1: force='RB'
        elif rd<=3: force=('WR','TE')
    if policy=='Robust-RB (RB in 3 of first 4)' and rd<=3: force='RB'
    if policy=='Zero-RB (no RB before R5)' and rd<=4: force=('WR','TE','QB') if lg=='B' else ('WR','TE')
    if policy=='WR-WR-WR' and rd<=3: force='WR'
    # must-fill: by round 10 ensure QB and TE; by 14 DST
    if rd>=10 and cnt['QB']==0: force='QB'
    elif rd>=11 and cnt['TE']==0: force='TE'
    elif rd>=15 and cnt['DST']==0: force='DST'
    order=sorted([k for k in P if k not in taken],key=lambda k:rankmap.get(k,999))
    for k in order:
        pos=P[k]['pos']
        if force and pos not in (force if isinstance(force,tuple) else (force,)): continue
        if not allowed(pos): continue
        return k
    return order[0]
def run(lg,policy,slot,n):
    P=project(lg); b=boards[lg]; rankmap=dict(zip(b.player,b['rank'])); nteams=10; nplay=8 if lg=='A' else 6
    made=titles=0; pf=[]
    for s in range(n):
        # random room type and larger price noise
        room=FORCE or rng.choice(['rb','bal','wr']); noise=8
        adpm={}
        for k,v in P.items():
            a=v['adp']; pos=v['pos']
            if room=='rb' and pos=='RB': a*=0.85
            if room=='rb' and pos=='WR': a*=1.1
            if room=='wr' and pos=='WR': a*=0.85
            if room=='wr' and pos=='RB': a*=1.1
            if room=='fb':   # measured Footborn room: RBs ~10 picks early (consensus 12-60), TEs late, WRs at consensus
                if pos=='RB' and 8<a<=60: a=max(3,a-10)
                elif pos=='RB' and 60<a<=110: a-=6
                if pos=='TE' and 15<a<45: a+=8
            adpm[k]=a+rng.normal(0,noise)
        order=sorted(P,key=lambda k:adpm[k]); teams={i:[] for i in range(nteams)}; taken=set()
        for rd in range(15):
            slots=list(range(nteams)) if rd%2==0 else list(range(nteams))[::-1]
            for sl in slots:
                if sl==slot:
                    k=user_pick(policy,rd+1,teams[sl],P,rankmap,taken,lg); teams[sl].append(k); taken.add(k); continue
                have=teams[sl]; cnt={p:sum(1 for x in have if P[x]['pos']==p) for p in CAPS}
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
                if pick: teams[sl].append(pick); taken.add(pick)
        allp=set(k for t in teams.values() for k in t); avail={k:~sample_missed(k,P[k]) for k in allp}
        W=np.zeros(nteams); PF=np.zeros(nteams)
        for wk in range(1,15):
            perm=rng.permutation(nteams); sc={t:lineup_points(teams[t],P,wk,avail,lg) for t in range(nteams)}
            for i in range(0,nteams,2):
                a,b_=perm[i],perm[i+1]; PF[a]+=sc[a]; PF[b_]+=sc[b_]
                if sc[a]>sc[b_]: W[a]+=1
                else: W[b_]+=1
        seed=sorted(range(nteams),key=lambda t:(-W[t],-PF[t])); po=seed[:nplay]
        if slot in po: made+=1
        def game(a,b_,wk): return a if lineup_points(teams[a],P,wk,avail,lg)>=lineup_points(teams[b_],P,wk,avail,lg) else b_
        if nplay==8:
            r1=[game(po[0],po[7],15),game(po[1],po[6],15),game(po[2],po[5],15),game(po[3],po[4],15)]; r2=[game(r1[0],r1[3],16),game(r1[1],r1[2],16)]
        else:
            r1=[po[0],po[1],game(po[2],po[5],15),game(po[3],po[4],15)]; r2=[game(r1[0],r1[3],16),game(r1[1],r1[2],16)]
        if game(r2[0],r2[1],17)==slot: titles+=1
        pf.append(PF[slot]/14)
        if s==0: first=list(teams[slot])
    return dict(league=lg,policy=policy,p_playoffs=made/n,p_title=titles/n,avg_ppg=float(np.mean(pf)),example=first)
pols=['Hero-RB (RB, then WR/TE x2)','RB-RB','WR-WR','WR-WR-WR','Robust-RB (RB in 3 of first 4)','Zero-RB (no RB before R5)','Best available by board']
out=[]
for lg,slot in [x for x in (('A',1),('B',3)) if x[0] in LGARG]:
    for pol in pols:
        r=run(lg,pol,slot,N); out.append(r); print(lg,pol,round(r['p_playoffs'],3),round(r['p_title'],3),round(r['avg_ppg'],1),'e.g.',r['example'][:6],flush=True)
pd.DataFrame(out).to_csv(O+('sim_policies.csv' if LGARG=='AB' else f'sim_policies_{LGARG}{"_fb" if FORCE else ""}.csv'),index=False)

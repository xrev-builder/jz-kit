"""Regenerate board order from the model: availability-weighted projection over a positional replacement, per league; documented overrides only."""
import sys; sys.argv=['x','1']
exec(open('/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/sim_season.py').read().split("if __name__=='__main__':")[0])
import pandas as pd, re
STASH=['Jordyn Tyson','James Conner','Zach Charbonnet','Isiah Pacheco','Josh Jacobs','Tank Dell']
DST_ORDER=['Los Angeles Chargers','Cleveland Browns','Seattle Seahawks','Minnesota Vikings','Chicago Bears','Philadelphia Eagles','Pittsburgh Steelers','Detroit Lions','Houston Texans','Denver Broncos']
POSMEAN={'RB':4.9,'WR':3.8,'TE':4.0,'QB':3.9}
def build(lg,ceiling_bonus):
    P=project(lg); rows=[]
    for k,v in P.items():
        if v['pos']=='DST' or k in STASH: continue
        em=0.5*min(v['exp_missed'],12)+0.5*POSMEAN.get(v['pos'],4.0)   # injury model is weak (r~0.2): half weight
        av=v['mean']*(1-em/17)
        rows.append(dict(player=k,pos=v['pos'],mean=v['mean'],sd=v['sd'],exp_missed=v['exp_missed'],avail=av))
    df=pd.DataFrame(rows)
    # replacement: common flex pool (RB+WR+TE) 71st by avail; QB 11th; TE also vs TE11 (take the larger VOR of flex vs TE for TEs)
    flex=df[df.pos.isin(['RB','WR','TE'])].avail.sort_values(ascending=False); rep_flex=flex.iloc[70]
    rep_qb=df[df.pos=='QB'].avail.sort_values(ascending=False).iloc[10]; rep_te=df[df.pos=='TE'].avail.sort_values(ascending=False).iloc[10]
    rep_rb=df[df.pos=='RB'].avail.sort_values(ascending=False).iloc[27]; rep_wr=df[df.pos=='WR'].avail.sort_values(ascending=False).iloc[31]
    def vor(r):
        if r.pos=='QB': return r.avail-rep_qb
        if r.pos=='TE': return max(r.avail-rep_te,r.avail-rep_flex)
        if r.pos=='RB': return max(r.avail-rep_rb,r.avail-rep_flex)
        return max(r.avail-rep_wr,r.avail-rep_flex)
    df['vor']=df.apply(vor,axis=1)
    # League A: 8/10 playoffs -> small ceiling credit (weekly sd) ; League B: none
    df['score']=df.vor+ceiling_bonus*(df.sd-df.groupby('pos').sd.transform('mean'))/10
    df=df.sort_values('score',ascending=False)
    order=df.player.tolist()
    # documented overrides: IR/exempt stashes to the end of the draftable list
    order=[p for p in order if p not in STASH]
    return df,order
A,ordA=build('A',0.5); B,ordB=build('B',0.0)
print("== League A model top 40 =="); print(A.head(40)[['player','pos','mean','exp_missed','avail','vor','score']].round(2).to_string(index=False))
print("== League B model top 40 =="); print(B.head(40)[['player','pos','mean','exp_missed','avail','vor','score']].round(2).to_string(index=False))
s=open(O+'board.py').read()
def repl(s,tag,order):
    lst=order[:150]+STASH+DST_ORDER
    return re.sub(tag+r'=""".*?"""',tag+'="""'+'|'.join(lst)+'"""',s,flags=re.S)
s=repl(s,'A_ORDER',ordA); s=repl(s,'B_ORDER',ordB)
open(O+'board.py','w').write(s); print('board.py orders replaced')
A.to_csv(O+'model_scores_A.csv',index=False); B.to_csv(O+'model_scores_B.csv',index=False)

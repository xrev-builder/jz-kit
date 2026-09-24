import pandas as pd, numpy as np, itertools, json
S='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad'
df=pd.read_csv(S+'/tl/league_table.csv'); df['cv']=df.current_value
UNT={'Kdouh':['CeeDee Lamb','Justin Jefferson','Tyler Warren'],'Moe':['Jaxon Smith-Njigba','Jalen Hurts'],'Ish':['Josh Allen'],'Daoud':['Lamar Jackson','Chris Olave','James Cook III'],
 'Aoc':['Jahmyr Gibbs','Joe Burrow'],'Billy':["Ja'Marr Chase",'Kenneth Walker III','Ashton Jeanty','Colston Loveland','Caleb Williams'],'Betto':['Amon-Ra St. Brown','Trey McBride','Omarion Hampton'],
 'Kass':['Jayden Daniels'],'Hazime':['Jonathan Taylor','Tetairoa McMillan','Sam LaPorta']}
NOINT={'Kdouh':['Carnell Tate',"Wan'Dale Robinson"]}
JASSETS=['Chase Brown','Puka Nacua','George Pickens','Kyren Williams','Harold Fannin Jr.','Brock Purdy','Drake Maye','Carnell Tate',"Wan'Dale Robinson",'Devaughn Vele','Jadarian Price']
SLOTS=[('QB',1),('RB',2),('WR',2),('TE',1),('FLEX',2)]
def lineup(d):
    ro=d[d.pos.isin(['QB','RB','WR','TE'])].sort_values('cv',ascending=False); used=set(); tot=0
    for pos,n in SLOTS:
        pool=ro[(ro.pos==pos) if pos!='FLEX' else ro.pos.isin(['RB','WR','TE'])]
        pool=pool[~pool.player.isin(used)].head(n)
        for _,r in pool.iterrows(): used.add(r.player); tot+=r.cv
    return tot
def after(m,minus,plus):
    d=df[(df.manager==m)&(~df.player.isin(minus))]; add=df[df.player.isin(plus)].copy(); add['manager']=m
    return pd.concat([d,add])
CV=dict(zip(df.player,df.cv))
base={m:lineup(df[df.manager==m]) for m in df.manager.unique()}
out=[]
for m in UNT:
    P=df[(df.manager==m)&(df.pos!='DST')&(~df.player.isin(UNT[m]))&(df.cv>=6)]
    pg=[c for k in (1,2) for c in itertools.combinations(list(P.player),k)]
    ja=[a for a in JASSETS if a not in NOINT.get(m,[])]
    jg=[c for k in (1,2) for c in itertools.combinations(ja,k)]
    for give in jg:
        for get in pg:
            if len(give)+len(get)>3: continue
            if 'Puka Nacua' in give and max(CV[g] for g in get)<45: continue   # Nacua only star-for-star
            dj=lineup(after('Jamal',give,get))-base['Jamal']; dp=lineup(after(m,get,give))-base[m]
            paper=sum(CV[g] for g in give)-sum(CV[g] for g in get)   # + means partner receives more consensus value
            if dj>=2 and dp>=-2 and paper>=-4:
                out.append(dict(partner=m,give=' + '.join(give),get=' + '.join(get),jamal_lineup=round(dj,1),partner_lineup=round(dp,1),paper_for_partner=round(paper,1)))
o=pd.DataFrame(out).sort_values(['partner','jamal_lineup'],ascending=[True,False])
pd.set_option('display.width',220)
for m,g in o.groupby('partner'): print(f"\n--- {m} ({len(g)})"); print(g.head(6).to_string(index=False))
o.to_csv(S+'/tl/candidates2.csv',index=False)

import sys; sys.argv=['x','700']
src=open('sim_season.py').read().split("if __name__=='__main__':")[0]
import pandas as pd, numpy as np
plan=['Jahmyr Gibbs','Trey McBride','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Jameson Williams','Justin Herbert','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers']
zero=["Ja'Marr Chase",'Drake London','A.J. Brown','DeVonta Smith','Zay Flowers','Tee Higgins','MarShawn Lloyd','Rhamondre Stevenson','Justin Herbert','Rico Dowdle','Kenny Gainwell','Blake Corum','Tucker Kraft','Jacory Croskey-Merritt','Los Angeles Chargers']
robust=['Jahmyr Gibbs','Chase Brown','Kenneth Walker III','Quinshon Judkins','David Montgomery','Tee Higgins','Emeka Egbuka','Jameson Williams','Justin Herbert','Rome Odunze','Michael Wilson','Tucker Kraft','KC Concepcion','Sione Vaki','Los Angeles Chargers']
settings={
 'baseline':{},
 'blend 0.8 production / 0.2 consensus':{'BLEND':0.8},
 'blend 0.2 production / 0.8 consensus':{'BLEND':0.2},
 'weekly sd x1.3':{'SDMUL':1.3},
 'waiver level 11.5 (deeper wire)':{'WAIVER_RB':11.5},
 'injuries x1.5 duration':{'INJMUL':1.5},
 'opponents draft by ECR (no ESPN skew)':{'ADP_ECR':True},
}
out=[]
for name,cfg in settings.items():
    g={}
    code=src
    if 'BLEND' in cfg: code=code.replace("mean=0.5*shrunk+0.5*cv if g>0 else cv",f"mean={cfg['BLEND']}*shrunk+{1-cfg['BLEND']}*cv if g>0 else cv")
    if 'SDMUL' in cfg: code=code.replace("sd=max(sd,3.0)",f"sd=max(sd*{cfg['SDMUL']},3.0)")
    if 'WAIVER_RB' in cfg: code=code.replace("'RB':9.5,'WR':9.5",f"'RB':{cfg['WAIVER_RB']},'WR':{cfg['WAIVER_RB']}")
    if 'INJMUL' in cfg: code=code.replace("base=int(rng.choice(arr));",f"base=int(min(17,round(rng.choice(arr)*{cfg['INJMUL']})));")
    if 'ADP_ECR' in cfg: code=code.replace("adp=r.espn_adp if pd.notna(r.espn_adp) else (r.ecr_ovr if pd.notna(r.ecr_ovr) else 300)","adp=(r.ecr_ovr if pd.notna(r.ecr_ovr) else 300)")
    exec(code,g)
    P=g['project']('A')
    for lab,ro in (('plan',plan),('zero-RB',zero),('robust-RB',robust)):
        r=g['simulate']('A',ro,1,True,700,lab); r['setting']=name; out.append(r); print(name,lab,round(r['p_playoffs'],3),round(r['p_title'],3),flush=True)
    teams=g['draft_opponents'](P,-1,[]); base=teams[1]
    r=g['simulate']('A',base,1,True,700,'sheet'); r['setting']=name; out.append(r); print(name,'sheet',round(r['p_playoffs'],3),round(r['p_title'],3),flush=True)
df=pd.DataFrame(out); df.to_csv('sim_sensitivity.csv',index=False)
print(df.pivot(index='setting',columns='label',values='p_title').round(3).to_string())

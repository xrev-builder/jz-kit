"""Replicates the live tool's lineup() metric in Python so SL (metric -> odds) can be recalibrated from simulator results."""
import re, json, sys
H=open('/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/draft-live.html').read()
DATA=json.loads(re.search(r'const DATA=(\[.*?\]);\n',H,re.S).group(1))
WAIV={'A':{'QB':15,'RB':9.5,'WR':9.5,'TE':8,'DST':6},'B':{'QB':18.5,'RB':9.5,'WR':9.5,'TE':8,'DST':6}}  # must match gen_live.py
BY={d['n']:d for d in DATA}
def lineup(names,lg):
    W=WAIV[lg]
    ps=[BY[n] for n in names if n in BY]
    POSMEAN={'QB':3.9,'RB':4.9,'WR':3.8,'TE':4.0,'DST':0}
    av=lambda d:(d['pA'] if lg=='A' else d['pB'])*(1-(0.5*min(d['inj'],12)+0.5*POSMEAN.get(d['pos'],4))/17)
    ps.sort(key=av,reverse=True); used=set(); t=0.0
    def take(ok,n):
        nonlocal t; g=0
        for p in ps:
            if p['n'] in used or p['pos'] not in ok: continue
            used.add(p['n']); t+=av(p); g+=1
            if g==n: break
        while g<n: t+=W[ok[0]]; g+=1
    take(['QB'],1);take(['RB'],2);take(['WR'],2);take(['TE'],1);take(['RB','WR','TE'],2);take(['DST'],1)
    return t
if __name__=='__main__':
    R={'A':['Jahmyr Gibbs','Trey McBride','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Jameson Williams','Justin Herbert','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers'],
       'B':['Puka Nacua','Chase Brown','Josh Allen','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers']}
    for lg in 'AB':
        missing=[n for n in R[lg] if n not in BY]; print(lg,'plan metric',round(lineup(R[lg],lg),2),'missing',missing)

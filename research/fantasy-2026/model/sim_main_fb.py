"""Footborn fixed-roster scenarios with opponents drafting at the MEASURED Footborn room price (roomB from the live tool), 1000 seasons."""
import sys, json, re
N=int(sys.argv[1]) if len(sys.argv)>1 else 1000
sys.argv=[sys.argv[0],str(N)]
exec(open('sim_season.py').read().split("if __name__=='__main__':")[0])
import pandas as pd
H=open('/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/draft-live.html').read()
ADPB={d['n']:d['adpB'] for d in json.loads(re.search(r'const DATA=(\[.*?\]);\n',H,re.S).group(1))}
P=project('B')
for k,v in P.items():
    if k in ADPB: v['adp']=float(ADPB[k])
R={'Plan (Nacua 4, RB 17, Allen 24)':['Puka Nacua','Chase Brown','Josh Allen','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'],
   'Plan (Nacua 4, Kyren 17, McBride 24, Maye 37)':['Puka Nacua','Kyren Williams','Trey McBride','Drake Maye','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tyler Warren','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'],
   'Bijan 4, Pickens 17, McBride 24, Maye 37':['Bijan Robinson','George Pickens','Trey McBride','Drake Maye','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Brian Robinson Jr.','Los Angeles Chargers'],
   'Bijan 4, Kyren 17, Pickens 24, Maye 37 (RB-RB)':['Bijan Robinson','Kyren Williams','George Pickens','Drake Maye','Emeka Egbuka','Tetairoa McMillan','MarShawn Lloyd','Tucker Kraft','Michael Wilson','Rico Dowdle','Jameson Williams','Blake Corum','KC Concepcion','Brian Robinson Jr.','Los Angeles Chargers'],
   'JSN 4 (else plan)':['Jaxon Smith-Njigba','Kyren Williams','Trey McBride','Drake Maye','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tyler Warren','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'],
   'Zero-RB (Nacua, Pickens, McBride, Maye, RBs from 44)':['Puka Nacua','George Pickens','Trey McBride','Drake Maye','Bucky Irving','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tyler Warren','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'],
}
out=[]
for lab,ro in R.items():
    missing=[x for x in ro if x not in P]; assert not missing,(lab,missing)
    out.append(simulate('B',ro,3,True,N,lab)); print(out[-1],flush=True)
teams=draft_opponents(P,-1,[]); base=teams[3]
out.append(simulate('B',base,3,True,N,'Measured-room sheet drafter at pick 4')); print(out[-1],'roster:',base,flush=True)
pd.DataFrame(out).to_csv(O+'sim_results_B_fb.csv',index=False)

import sys; N=int(sys.argv[2]); cand=sys.argv[1]; sys.argv=[sys.argv[0],str(N)]
exec(open('sim_season.py').read().split("if __name__=='__main__':")[0])
import json,re,pandas as pd
H=open('/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/draft-live.html').read(); ADPB={d['n']:d['adpB'] for d in json.loads(re.search(r'const DATA=(\[.*?\]);\n',H,re.S).group(1))}
P=project('B')
for k,v in P.items():
    if k in ADPB: v['adp']=float(ADPB[k])
base=['Drake Maye','Chase Brown','Kyren Williams','Jadarian Price','Puka Nacua','George Pickens','Carnell Tate','Harold Fannin Jr.']
fill=["Wan'Dale Robinson",'MarShawn Lloyd','Quentin Johnston','Blake Corum','Samaje Perine','Alec Pierce','RJ Harvey','Los Angeles Chargers']
ro=base+[cand]+[f for f in fill if f!=cand][:5]+['Los Angeles Chargers'] if 'Los Angeles Chargers' not in [f for f in fill if f!=cand][:5] else base+[cand]+[f for f in fill if f!=cand][:6]
ro=ro[:15]; assert all(x in P for x in ro),[x for x in ro if x not in P]
r=simulate('B',ro,3,True,N,cand); print(r,flush=True)

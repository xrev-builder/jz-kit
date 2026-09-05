import sys; N=int(sys.argv[2]); cand=sys.argv[1]; sys.argv=[sys.argv[0],str(N)]
exec(open('sim_season.py').read().split("if __name__=='__main__':")[0])
import json,re,pandas as pd
H=open('/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/draft-live.html').read(); ADPB={d['n']:d['adpB'] for d in json.loads(re.search(r'const DATA=(\[.*?\]);\n',H,re.S).group(1))}
P=project('B')
for k,v in P.items():
    if k in ADPB: v['adp']=float(ADPB[k])
base=['Drake Maye','Chase Brown','Kyren Williams','Jadarian Price','Rico Dowdle','Puka Nacua','George Pickens','Carnell Tate','Harold Fannin Jr.',"Wan'Dale Robinson"]
fill=['Khalil Shakir','Samaje Perine','KC Concepcion','Romeo Doubs','Los Angeles Chargers']
ro=base+[cand]+[f for f in fill if f!=cand][:4]
ro=ro[:15]; assert all(x in P for x in ro),[x for x in ro if x not in P]
r=simulate('B',ro,3,True,N,cand); print(r,flush=True)

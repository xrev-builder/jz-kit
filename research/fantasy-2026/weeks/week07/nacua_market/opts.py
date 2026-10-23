import json, subprocess, os
from concurrent.futures import ThreadPoolExecutor
S='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad'
O=json.load(open(S+'/nl/options.json'))
def run(o):
    env=dict(os.environ,N=os.environ.get('N','4000'),SEED='11')
    r=subprocess.run(['python3',S+'/nl/season_sim.py',json.dumps(o['trades'])],capture_output=True,text=True,env=env)
    try: return o['id'],json.loads(r.stdout)
    except Exception: return o['id'],{'err':r.stderr[-300:]}
with ThreadPoolExecutor(4) as ex: res=dict(ex.map(run,O))
json.dump(res,open(S+'/nl/opt_results.json','w'),indent=1)
b=res['O0']['Jamal']['playoffs']
for o in O:
    r=res[o['id']]
    if 'err' in r: print(o['id'],'ERR',r['err']); continue
    j=r['Jamal']; part=o['trades'][0][0] if o['trades'] else '-'
    pp=r.get(part,{}).get('playoffs','') if part!='-' else ''
    pb=res['O0'].get(part,{}).get('playoffs','') if part!='-' else ''
    print(f"{o['id']:4} {o['label'][:70]:70} Jamal PO {j['playoffs']:5} ({j['playoffs']-b:+5.1f}) wins {j['wins']:5} | {part} {pb}->{pp}")

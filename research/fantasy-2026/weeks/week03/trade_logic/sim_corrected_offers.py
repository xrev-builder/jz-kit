import json, subprocess, os
from concurrent.futures import ThreadPoolExecutor
S='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad'
T={'Ish':0,'Aoc':1,'Billy':2,'Moe':4,'Betto':5,'Kass':6,'Hazime':7,'Daoud':8,'Kdouh':9}
O=[
('base',None,[],[]),
('I1_Nacua_for_Bijan','Ish',['Puka Nacua'],['Bijan Robinson']),
('I2_Nacua_for_BijanBTJ','Ish',['Puka Nacua'],['Bijan Robinson','Brian Thomas Jr.']),
('I3_NacuaPrice_for_BijanBTJ','Ish',['Puka Nacua','Jadarian Price'],['Bijan Robinson','Brian Thomas Jr.']),
('I4_Pickens_for_Collins','Ish',['George Pickens'],['Nico Collins']),
('I5_Brown_for_Bijan','Ish',['Chase Brown'],['Bijan Robinson']),
('K1_Brown_for_NabersJudkins','Kdouh',['Chase Brown'],['Malik Nabers','Quinshon Judkins']),
('K2_Brown_for_Nabers','Kdouh',['Chase Brown'],['Malik Nabers']),
('K3_Kyren_for_Nabers','Kdouh',['Kyren Williams'],['Malik Nabers']),
('K4_BrownVele_for_NabersJudkins','Kdouh',['Chase Brown','Devaughn Vele'],['Malik Nabers','Quinshon Judkins']),
('K5_Kyren_for_Evans','Kdouh',['Kyren Williams'],['Mike Evans']),
('D1_Pickens_for_Saquon','Daoud',['George Pickens'],['Saquon Barkley']),
('D2_Pickens_for_SaquonGodwin','Daoud',['George Pickens'],['Saquon Barkley','Chris Godwin Jr.']),
('D3_Pickens_for_JavonteWilson','Daoud',['George Pickens'],['Javonte Williams','Michael Wilson']),
('D4_TateVele_for_Javonte','Daoud',['Carnell Tate','Devaughn Vele'],['Javonte Williams']),
('D5_Pickens_for_SaquonJavonte','Daoud',['George Pickens'],['Saquon Barkley','Javonte Williams']),
('A1_Kyren_for_GWilson','Aoc',['Kyren Williams'],['Garrett Wilson']),
('A2_KyrenTate_for_GWilson','Aoc',['Kyren Williams','Carnell Tate'],['Garrett Wilson']),
('A3_Kyren_for_AJBrown','Aoc',['Kyren Williams'],['A.J. Brown']),
('A4_KyrenFannin_for_GWilsonBowers','Aoc',['Kyren Williams','Harold Fannin Jr.'],['Garrett Wilson','Brock Bowers']),
('S1_Nacua_for_CMC','Kass',['Puka Nacua'],['Christian McCaffrey']),
('S2_Nacua_for_CMCJamo','Kass',['Puka Nacua'],['Christian McCaffrey','Jameson Williams']),
('S3_Nacua_for_BreeceDeVonta','Kass',['Puka Nacua'],['Breece Hall','DeVonta Smith']),
('S4_Nacua_for_DeVontaLondon','Kass',['Puka Nacua'],['DeVonta Smith','Drake London']),
('S5_Nacua_for_CMCDeVonta','Kass',['Puka Nacua'],['Christian McCaffrey','DeVonta Smith']),
('H1_Purdy_for_Adams','Hazime',['Brock Purdy'],['Davante Adams']),
('H2_PurdyTate_for_Bucky','Hazime',['Brock Purdy','Carnell Tate'],['Bucky Irving']),
('H3_PurdyPrice_for_Bucky','Hazime',['Brock Purdy','Jadarian Price'],['Bucky Irving']),
('M1_Brown_for_EgbukaLove','Moe',['Chase Brown'],['Emeka Egbuka','Jeremiyah Love']),
('M2_Brown_for_Achane','Moe',['Chase Brown'],["De'Von Achane"]),
('M3_KyrenFannin_for_EgbukaKittle','Moe',['Kyren Williams','Harold Fannin Jr.'],['Emeka Egbuka','George Kittle']),
('M4_Kyren_for_Odunze','Moe',['Kyren Williams'],['Rome Odunze']),
('M5_Brown_for_AchaneOdunze','Moe',['Chase Brown'],["De'Von Achane",'Rome Odunze']),
]
def run(o):
    lab,p,give,get=o
    tr=json.dumps([[3,give,T[p],get]]) if p else '[]'
    env=dict(os.environ,WK3='1',MARKET='1')
    r=subprocess.run(['python3',S+'/trade_sim.py','300',tr,lab],capture_output=True,text=True,env=env)
    open(S+f'/trades19/{lab}.json','w').write(r.stdout); open(S+f'/trades19/{lab}.err','w').write(r.stderr); return lab
with ThreadPoolExecutor(4) as ex: list(ex.map(run,O))
b=json.load(open(S+'/trades19/base.json'))['teams']
print('BASE:',{k:(v['title'],v['playoffs']) for k,v in sorted(b.items(),key=lambda x:-x[1]['title'])})
r=json.load(open(S+'/ros_ecr_0918.json'))['ovr']
rows=[]
for lab,p,give,get in O[1:]:
    try: d=json.load(open(S+f'/trades19/{lab}.json'))
    except: print('FAIL',lab,open(S+f'/trades19/{lab}.err').read()[-200:]); continue
    t=d['teams']['Jamal']; q=d['teams'][p]
    paper=sum(r.get(g,150) for g in get)-sum(r.get(g,150) for g in give)  # partner "gives" higher-ranked (lower number) => negative = partner gives more value
    rows.append((lab,p,t['title']-b['Jamal']['title'],t['playoffs']-b['Jamal']['playoffs'],t['ppg']-b['Jamal']['ppg'],q['title']-b[p]['title'],q['playoffs']-b[p]['playoffs'],' + '.join(f"{g}({r.get(g,'-')})" for g in give),' + '.join(f"{g}({r.get(g,'-')})" for g in get)))
rows.sort(key=lambda x:-x[2])
for x in rows: print(f"{x[0]:34}{x[1]:7} Jamal {x[2]:+5.1f}/{x[3]:+5.1f}/{x[4]:+4.1f} | {x[1]} {x[5]:+5.1f}/{x[6]:+5.1f} | give {x[7]} -> get {x[8]}")

import json, subprocess, os
from concurrent.futures import ThreadPoolExecutor
S='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad'
T={'Ish':0,'Aoc':1,'Billy':2,'Moe':4,'Betto':5,'Kass':6,'Hazime':7,'Daoud':8,'Kdouh':9}
W="Wan'Dale Robinson"
OFFERS=[ # (label, partner, jamal_gives, jamal_gets, source)
('I1','Ish',['Chase Brown','Puka Nacua'],['Bijan Robinson','Brian Thomas Jr.'],'accept'),
('I2','Ish',['George Pickens'],['David Montgomery','Dalton Schultz'],'accept'),
('I3','Ish',['Harold Fannin Jr.','Kyren Williams'],['TreVeyon Henderson','Oronde Gadsden II'],'accept'),
('I4','Ish',['Carnell Tate','Harold Fannin Jr.'],['David Montgomery'],'counter'),
('I5','Ish',['George Pickens'],['DJ Moore','Dalton Schultz'],'counter'),
('I6','Ish',['George Pickens','Harold Fannin Jr.'],['Nico Collins','Rachaad White'],'counter'),
('K1','Kdouh',['Chase Brown'],['Mike Evans','Matthew Golden'],'accept'),
('K2','Kdouh',['Chase Brown'],['Malik Nabers'],'accept'),
('K3','Kdouh',['Chase Brown'],['Dak Prescott','Mike Evans'],'accept'),
('K4','Kdouh',['Chase Brown','George Pickens'],['Malik Nabers','Mike Evans'],'counter'),
('K5','Kdouh',['Kyren Williams'],['Jalen Coker','Aaron Jones Sr.'],'counter'),
('D1','Daoud',['George Pickens'],['Javonte Williams','Michael Wilson'],'accept'),
('D2','Daoud',['Puka Nacua'],['Saquon Barkley','Chris Godwin Jr.'],'accept'),
('D3','Daoud',['George Pickens','Harold Fannin Jr.'],['Isaiah Likely','Javonte Williams'],'accept'),
('D4','Daoud',['Chase Brown','George Pickens'],['Saquon Barkley','Javonte Williams'],'counter'),
('D5','Daoud',['Harold Fannin Jr.','Devaughn Vele'],['Isaiah Likely'],'counter'),
('A1','Aoc',['Chase Brown','Carnell Tate'],['Garrett Wilson','Rico Dowdle'],'accept'),
('A2','Aoc',['Kyren Williams'],['Deebo Samuel Sr.','Kyle Monangai'],'accept'),
('A3','Aoc',['Puka Nacua'],['Garrett Wilson','J.K. Dobbins'],'accept'),
('A4','Aoc',['Devaughn Vele'],['Kyle Monangai'],'counter'),
('A5','Aoc',['Kyren Williams'],['Rico Dowdle','Kyle Monangai'],'counter'),
('B1','Billy',['Chase Brown'],['Dalton Kincaid','Parker Washington'],'accept'),
('B2','Billy',['Puka Nacua'],['Rashee Rice','Jaylen Warren'],'accept'),
('B3','Billy',['George Pickens'],['Dalton Kincaid','Alec Pierce'],'accept'),
('B4','Billy',['Chase Brown'],['Caleb Williams','Bhayshul Tuten'],'counter'),
('B5','Billy',['Kyren Williams'],['Jaylen Warren','Alec Pierce'],'counter'),
('T1','Betto',['Chase Brown'],["D'Andre Swift",'Stefon Diggs','Tucker Kraft'],'accept'),
('T2','Betto',['George Pickens'],['Stefon Diggs','Rhamondre Stevenson'],'accept'),
('T3','Betto',['Puka Nacua'],['Ladd McConkey',"D'Andre Swift"],'accept'),
('T4','Betto',['Kyren Williams'],["D'Andre Swift",'Khalil Shakir'],'counter'),
('S1','Kass',['Chase Brown'],['Travis Kelce','Chuba Hubbard'],'accept'),
('S2','Kass',['Harold Fannin Jr.','Kyren Williams'],['Jameson Williams','Jake Ferguson'],'accept'),
('S3','Kass',['Brock Purdy','Kyren Williams'],['Jayden Daniels','Tre Tucker'],'accept'),
('S4','Kass',['Kyren Williams'],['Tre Tucker','Tony Pollard'],'counter'),
('S5','Kass',['George Pickens','Harold Fannin Jr.'],['DeVonta Smith'],'counter'),
('H1','Hazime',['Brock Purdy'],['Davante Adams'],'accept'),
('H2','Hazime',['Drake Maye','George Pickens'],['Derrick Henry','Davante Adams'],'accept'),
('H3','Hazime',['Puka Nacua'],['Derrick Henry','DK Metcalf'],'accept'),
('H4','Hazime',['Chase Brown'],['Derrick Henry','Cooper Kupp'],'counter'),
('H5','Hazime',['Drake Maye'],['Sam LaPorta','Quentin Johnston'],'counter'),
('M1','Moe',['Chase Brown'],['Christian Watson','Jacory Croskey-Merritt'],'accept'),
('M2','Moe',['Kyren Williams'],['Christian Watson'],'accept'),
('M3','Moe',['Harold Fannin Jr.','Kyren Williams'],['George Kittle','Christian Watson','Jaxson Dart'],'accept'),
('M4','Moe',['Harold Fannin Jr.'],['George Kittle','Xavier Worthy'],'counter'),
('M5','Moe',['George Pickens'],['Emeka Egbuka','Jacory Croskey-Merritt'],'counter'),
]
def run(o):
    lab,p,give,get,src=o
    tr=json.dumps([[3,give,T[p],get]])
    env=dict(os.environ,WK3='1',MARKET='1')
    r=subprocess.run(['python3',S+'/trade_sim.py','300',tr,lab],capture_output=True,text=True,env=env)
    open(S+f'/trades18/{lab}.json','w').write(r.stdout); open(S+f'/trades18/{lab}.err','w').write(r.stderr)
    return lab
with ThreadPoolExecutor(4) as ex:
    for lab in ex.map(run,OFFERS): pass
json.dump(OFFERS,open(S+'/trades18/offers.json','w'))
b=json.load(open(S+'/trades14/base.json'))['teams']
rows=[]
for lab,p,give,get,src in OFFERS:
    try: d=json.load(open(S+f'/trades18/{lab}.json'))
    except Exception as e: print('FAIL',lab,open(S+f'/trades18/{lab}.err').read()[-300:]); continue
    t=d['teams']['Jamal']; q=d['teams'][p]
    rows.append((lab,p,src,' + '.join(give),' + '.join(get),t['title']-b['Jamal']['title'],t['playoffs']-b['Jamal']['playoffs'],t['ppg']-b['Jamal']['ppg'],q['title']-b[p]['title'],q['playoffs']-b[p]['playoffs'],d['missing']))
rows.sort(key=lambda r:-r[5])
print(f"{'id':4}{'partner':8}{'src':8}{'Jamal gives':38}{'Jamal gets':46}{'title':>7}{'PO':>7}{'ppg':>6} | partner title/PO")
for r in rows: print(f"{r[0]:4}{r[1]:8}{r[2]:8}{r[3][:37]:38}{r[4][:45]:46}{r[5]:+7.1f}{r[6]:+7.1f}{r[7]:+6.1f} | {r[8]:+.1f}/{r[9]:+.1f}")
miss=set(m for r in rows for m in [str(x) for x in r[10]]); print('missing from sim pool:',miss)

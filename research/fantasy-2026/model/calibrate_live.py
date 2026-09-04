"""Recalibrate the live tool's metric->odds map (SL in gen_live.py) from the v3 simulator: plan roster and ESPN-sheet roster per league."""
import re, ast, pandas as pd
from calc_metric import lineup, BY
O='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/'
sr=pd.read_csv(O+'sim_results.csv')
PLAN={'A':('Plan (McBride at 19)',['Jahmyr Gibbs','Trey McBride','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Jameson Williams','Justin Herbert','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers']),
      'B':('Plan (Nacua at 4, Allen at 24)',['Puka Nacua','Chase Brown','Josh Allen','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'])}
SL={}
for lg in 'AB':
    log=open(O+f'sim_main_{lg}.log').read()
    sheet=ast.literal_eval(log.split('roster:')[1].strip().split('\n')[0])
    lab,plan=PLAN[lg]
    rp=sr[(sr.league==lg)&(sr.label==lab)].iloc[0]; rs=sr[(sr.league==lg)&(sr.label=='ESPN-sheet drafter at this slot')].iloc[0]
    mp,ms=lineup(plan,lg),lineup(sheet,lg)
    st=(rp.p_title-rs.p_title)*100/(mp-ms); sp=(rp.p_playoffs-rs.p_playoffs)*100/(mp-ms)
    SL[lg]=dict(title=round(st,2),po=round(sp,2),base=dict(ppg=round(mp,1),title=round(rp.p_title*100,1),po=round(rp.p_playoffs*100,1)))
    print(lg,'plan metric',round(mp,1),'sheet metric',round(ms,1),'plan',round(rp.p_title*100,1),round(rp.p_playoffs*100,1),'sheet',round(rs.p_title*100,1),round(rs.p_playoffs*100,1),'-> slope title',round(st,2),'po',round(sp,2))
    print('  sheet roster:',sheet)
js="const SL={A:{title:%s,po:%s,base:{ppg:%s,title:%s,po:%s}},B:{title:%s,po:%s,base:{ppg:%s,title:%s,po:%s}}};"%(SL['A']['title'],SL['A']['po'],SL['A']['base']['ppg'],SL['A']['base']['title'],SL['A']['base']['po'],SL['B']['title'],SL['B']['po'],SL['B']['base']['ppg'],SL['B']['base']['title'],SL['B']['base']['po'])
g=open(O+'gen_live.py').read()
g2=re.sub(r"const SL=\{A:\{.*?\}\};",js,g,count=1); assert g2!=g or js in g
open(O+'gen_live.py','w').write(g2); print('SL ->',js)

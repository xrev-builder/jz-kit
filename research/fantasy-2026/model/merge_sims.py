"""Merge per-league main + extra scenario results into sim_results.csv for the page builders."""
import pandas as pd, os
O='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/'
parts=[]
for lg in 'AB':
    for f in (f'sim_results_{lg}.csv',f'sim_extra_{lg}.csv'):
        if os.path.exists(O+f): parts.append(pd.read_csv(O+f))
d=pd.concat(parts,ignore_index=True)
d=d.drop_duplicates(subset=['league','label'],keep='first')
d.to_csv(O+'sim_results.csv',index=False)
print(d[['league','label','p_playoffs','p_title','avg_wins','avg_ppg']].round(3).to_string(index=False))

"""Per-league runner for the fixed-roster scenarios in sim_season.py (parallelizable)."""
import sys
LG=sys.argv[1]; N=int(sys.argv[2]) if len(sys.argv)>2 else 1500
sys.argv=[sys.argv[0],str(N)]
exec(open('sim_season.py').read().split("if __name__=='__main__':")[0])
import pandas as pd
if True:

    R={'A':{
     'Plan (McBride at 19)':['Jahmyr Gibbs','Trey McBride','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Jameson Williams','Justin Herbert','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers'],
     'Plan (London at 19, Kraft TE)':['Jahmyr Gibbs','Drake London','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Tucker Kraft','Justin Herbert','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers'],
     'Zero-RB (Chase at 2)':["Ja'Marr Chase",'Drake London','A.J. Brown','DeVonta Smith','Zay Flowers','Tee Higgins','MarShawn Lloyd','Rhamondre Stevenson','Justin Herbert','Rico Dowdle','Kenny Gainwell','Blake Corum','Tucker Kraft','Jacory Croskey-Merritt','Los Angeles Chargers'],
     'Robust-RB':['Jahmyr Gibbs','Chase Brown','Kenneth Walker III','Quinshon Judkins','David Montgomery','Tee Higgins','Emeka Egbuka','Jameson Williams','Justin Herbert','Rome Odunze','Michael Wilson','Tucker Kraft','KC Concepcion','Sione Vaki','Los Angeles Chargers'],
     'Early QB (Allen at 19)':['Jahmyr Gibbs','Josh Allen','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Tucker Kraft','Jameson Williams','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers'],
    },'B':{
     'Plan (Allen at 24)':['Jaxon Smith-Njigba','Chase Brown','Josh Allen','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'],
     'Plan (Collins at 24, Maye at 37)':['Jaxon Smith-Njigba','Chase Brown','Nico Collins','Drake Maye','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'],
     'Zero-RB':['Jaxon Smith-Njigba','Drake London','Josh Allen','Garrett Wilson','Emeka Egbuka','Tee Higgins','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Kenny Gainwell','Blake Corum','Jacory Croskey-Merritt','KC Concepcion','Los Angeles Chargers'],
     'Robust-RB':['Jaxon Smith-Njigba','Chase Brown','Kyren Williams','Quinshon Judkins','David Montgomery','Emeka Egbuka','Jameson Williams','Rome Odunze','Patrick Mahomes II','Rico Dowdle','Michael Wilson','Tucker Kraft','KC Concepcion','Blake Corum','Los Angeles Chargers'],
     'Late QB (Mahomes at 77)':['Jaxon Smith-Njigba','Chase Brown','Nico Collins','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Patrick Mahomes II','Rico Dowdle','Michael Wilson','Tucker Kraft','KC Concepcion','Blake Corum','Los Angeles Chargers'],
    }}

slot={'A':1,'B':3}
out=[]; lg=LG
P=project(lg)
for lab,ro in R[lg].items():
    missing=[x for x in ro if x not in P]; assert not missing,(lab,missing)
    out.append(simulate(lg,ro,slot[lg],True,N,lab)); print(out[-1],flush=True)
first=list(R[lg].keys())[0]
out.append(simulate(lg,R[lg][first],slot[lg],False,N,first+' [no injuries]')); print(out[-1],flush=True)
teams=draft_opponents(P,-1,[]); base=teams[slot[lg]]
out.append(simulate(lg,base,slot[lg],True,N,'ESPN-sheet drafter at this slot')); print(out[-1],'roster:',base,flush=True)
pd.DataFrame(out).to_csv(O+f'sim_results_{lg}.csv',index=False)

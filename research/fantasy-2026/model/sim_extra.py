"""Supplemental fixed-roster scenarios on the v3 simulator: Nacua-at-4 variants, Taylor-at-4, handcuff on/off, Chase/Bijan at 2."""
import sys
LG=sys.argv[1]; N=int(sys.argv[2]) if len(sys.argv)>2 else 1500
sys.argv=[sys.argv[0],str(N)]
exec(open('sim_season.py').read().split("if __name__=='__main__':")[0])
import pandas as pd
R={'A':{
 'Plan (McBride at 19) [Vaki = Gibbs handcuff]':['Jahmyr Gibbs','Trey McBride','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Jameson Williams','Justin Herbert','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers'],
 'Plan, no handcuff (Croskey-Merritt for Vaki)':['Jahmyr Gibbs','Trey McBride','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Jameson Williams','Justin Herbert','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Jacory Croskey-Merritt','Los Angeles Chargers'],
 'Chase at 2, Kyren at 19':["Ja'Marr Chase",'Kyren Williams','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Tucker Kraft','Justin Herbert','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers'],
 'Bijan at 2 (else plan)':['Bijan Robinson','Trey McBride','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Jameson Williams','Justin Herbert','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Brian Robinson Jr.','Los Angeles Chargers'],
},'B':{
 'Plan (Nacua at 4, Allen at 24)':['Puka Nacua','Chase Brown','Josh Allen','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'],
 'Plan (Nacua at 4, Collins at 24, Maye at 37)':['Puka Nacua','Chase Brown','Nico Collins','Drake Maye','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'],
 'Plan (Nacua) + Perine handcuff for Concepcion':['Puka Nacua','Chase Brown','Josh Allen','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','Samaje Perine','Tyler Allgeier','Los Angeles Chargers'],
 'Taylor at 4, London at 17':['Jonathan Taylor','Drake London','Josh Allen','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'],
 'Gibbs at 4 (if there), Pickens at 17':['Jahmyr Gibbs','George Pickens','Josh Allen','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers'],
}}
slot={'A':1,'B':3}
P=project(LG); out=[]
for lab,ro in R[LG].items():
    missing=[x for x in ro if x not in P]; assert not missing,(lab,missing)
    out.append(simulate(LG,ro,slot[LG],True,N,lab)); print(out[-1],flush=True)
pd.DataFrame(out).to_csv(O+f'sim_extra_{LG}.csv',index=False)

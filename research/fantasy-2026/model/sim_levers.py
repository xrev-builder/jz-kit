import sys; sys.argv=['x','2000']
exec(open('sim_season.py').read().split("if __name__=='__main__':")[0])
import pandas as pd
base_A=['Jahmyr Gibbs','Trey McBride','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Jameson Williams','Justin Herbert','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers']
def swap(r,a,b): r=list(r); r[r.index(a)]=b; return r
S={'A':{
 'Plan (reference)':base_A,
 'No Gibbs handcuff (Vaki -> Wan\'Dale Robinson)':swap(base_A,'Sione Vaki',"Wan'Dale Robinson"),
 'Third RB at 59 (Price instead of Higgins)':swap(base_A,'Tee Higgins','Jadarian Price'),
 'Bijan at 2 instead of Gibbs':swap(base_A,'Jahmyr Gibbs','Bijan Robinson'),
 'Streaming QB (no Herbert; extra WR Odunze)':swap(base_A,'Justin Herbert','Rome Odunze'),
 'Two handcuffs (Corum -> Brian Robinson... n/a) : Dowdle -> Emmett Johnson':swap(base_A,'Rico Dowdle','Emmett Johnson'),
},'B':{
 'Plan (JSN at 4, reference)':['Jaxon Smith-Njigba','Chase Brown','Josh Allen','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'],
 'Taylor at 4, London at 17':['Jonathan Taylor','Drake London','Josh Allen','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Seth McGowan','Los Angeles Chargers'],
 'Nacua at 4':['Puka Nacua','Chase Brown','Josh Allen','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'],
 'McCaffrey at 4':['Christian McCaffrey','Drake London','Josh Allen','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Kaelon Black','Los Angeles Chargers'],
 'WR-heavy: JSN, London, Allen, G.Wilson, then RBs':['Jaxon Smith-Njigba','Drake London','Josh Allen','Garrett Wilson','Quinshon Judkins','David Montgomery','MarShawn Lloyd','Rhamondre Stevenson','Tucker Kraft','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Tyler Allgeier','Los Angeles Chargers'],
}}
slot={'A':1,'B':3}; out=[]
for lg in 'AB':
    P=project(lg)
    for lab,ro in S[lg].items():
        miss=[x for x in ro if x not in P]
        if miss: print('MISSING',lab,miss); continue
        out.append(simulate(lg,ro,slot[lg],True,2000,lab)); print(out[-1],flush=True)
pd.DataFrame(out).to_csv(O+'sim_levers.csv',index=False)
print(pd.DataFrame(out).round(3).to_string(index=False))

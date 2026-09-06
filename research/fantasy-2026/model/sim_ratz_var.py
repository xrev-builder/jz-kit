import sys; N=int(sys.argv[2]); var=sys.argv[1]; sys.argv=[sys.argv[0],str(N)]
exec(open('sim_season.py').read().split("if __name__=='__main__':")[0])
plan=['Jahmyr Gibbs','Trey McBride','A.J. Brown','DeVonta Smith','Quinshon Judkins','Tee Higgins','MarShawn Lloyd','Jameson Williams','Justin Herbert','Rico Dowdle','Michael Wilson','Blake Corum','KC Concepcion','Sione Vaki','Los Angeles Chargers']
V={
 'plan_qb82':plan,
 'maye_at42':[x if x!='Quinshon Judkins' else 'Drake Maye' for x in plan if x!='Justin Herbert']+['Rhamondre Stevenson'],
 'allen_at19':[x if x!='Trey McBride' else 'Josh Allen' for x in plan if x!='Justin Herbert']+['Rhamondre Stevenson'],
 'tate_flex62':[x if x!='Jameson Williams' else 'Carnell Tate' for x in plan],
 'price_rb2_42':[x if x!='Quinshon Judkins' else 'Jadarian Price' for x in plan],
 'wr_at42_qb99':[x if x!='Quinshon Judkins' else 'Emeka Egbuka' for x in plan],
}
ro=V[var]; P=project('A'); assert all(x in P for x in ro),[x for x in ro if x not in P]
print(simulate('A',ro,1,True,N,var),flush=True)

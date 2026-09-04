const {JSDOM}=require('jsdom'); const fs=require('fs');
const html='<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync('draft-board.html','utf8')+'</body></html>';
const dom=new JSDOM(html,{url:'https://example.org/',runScripts:'dangerously',pretendToBeVisual:true}); dom.window.HTMLElement.prototype.scrollIntoView=function(){};
setTimeout(()=>{const D=dom.window.__draft; const sig=(p,a)=>1/(1+Math.exp(-(p-a)/6));
 const ADP=JSON.parse(fs.readFileSync('draft-board.html','utf8').match(/const ADP=(\{.*?\}); const MP=/)[1]);
 const s=D.state('B');
 function fill(upto){ s.picks=[]; for(let p=1;p<upto;p++){ const taken=new Set(s.picks.map(x=>x.name)); const c=D.predict('B',p,taken)[0]; s.picks.push({key:'B-'+c.n.replace(/ /g,'_'),name:c.n,pos:c.pos}) } }
 function evalT(){ let err=0,n=0; for(const [c,nx] of [[1,4],[5,17],[18,24],[25,37],[38,44]]){ fill(c); const takenN=new Set(s.picks.map(x=>x.name)); const G=D.survival('B',c,nx);
   const names=Object.keys(ADP).filter(nm=>!takenN.has(nm)&&ADP[nm][1]<=nx+30&&ADP[nm][2]!=='DST');
   for(const nm of names){const a=ADP[nm][1]; const target=Math.max(0,sig(nx,a)-sig(c,a))/Math.max(1e-6,1-sig(c,a)); err+=((G[nm]||0)-target)**2; n++} } return Math.sqrt(err/n) }
 let best=null;
 for(const width of [3,4,6,8]) for(const cap of [1.5,2.5,4,7]) for(const power of [0.6,0.8,1,1.2]){ D.TUNE.width=width; D.TUNE.cap=cap; D.TUNE.power=power; const rm=evalT(); if(!best||rm<best.rm) best={width,cap,power,rm} }
 console.log('best',best); Object.assign(D.TUNE,best);
 fill(18); const G=D.survival('B',18,24); console.log('picks 1-17 (greedy):',s.picks.map(p=>p.name).join(', ')); console.log('18->24 gone%: Allen',(G['Josh Allen']*100).toFixed(0),'McBride',(G['Trey McBride']*100).toFixed(0),'Kyren',(G['Kyren Williams']*100).toFixed(0),'Pickens',(G['George Pickens']*100).toFixed(0),'Olave',(G['Chris Olave']*100).toFixed(0),'Maye',(G['Drake Maye']*100).toFixed(0),'Collins',(G['Nico Collins']*100).toFixed(0),'Javonte',(G['Javonte Williams']*100).toFixed(0));
 fill(5); const G1=D.survival('B',5,17); console.log('5->17 gone%: Nacua',(G1['Puka Nacua']*100).toFixed(0),'Chase Brown',(G1['Chase Brown']*100).toFixed(0),'Jeanty',(G1['Ashton Jeanty']*100).toFixed(0),'Kyren',(G1['Kyren Williams']*100).toFixed(0),'McBride',(G1['Trey McBride']*100).toFixed(0),'Allen',(G1['Josh Allen']*100).toFixed(0),'London',(G1['Drake London']*100).toFixed(0),'Pickens',(G1['George Pickens']*100).toFixed(0));
 fill(25); const G2=D.survival('B',25,37); console.log('25->37 gone%: Maye',(G2['Drake Maye']*100).toFixed(0),'Judkins',(G2['Quinshon Judkins']*100).toFixed(0),'McMillan',(G2['Tetairoa McMillan']*100).toFixed(0),'Warren',(G2['Tyler Warren']*100).toFixed(0),'Lamar',(G2['Lamar Jackson']*100).toFixed(0),'Burrow',(G2['Joe Burrow']*100).toFixed(0));
},150);

const {JSDOM}=require('jsdom'); const fs=require('fs');
const src=fs.readFileSync('draft-live.html','utf8');
const html='<!doctype html><html><head><meta charset="utf-8"></head><body>'+src+'</body></html>';
const DATA=JSON.parse(src.match(/const DATA=(\[.*?\]);\n/s)[1]);
function scenario(lg,slot,mine,keep,cur,label){
  const order=DATA.filter(x=>x.pos!=='DST').sort((a,b)=>(lg==='A'?a.rA-b.rA:a.rB-b.rB)).map(x=>x.n);
  const ks=new Set(keep); const taken=[]; for(const n of order){ if(taken.length>=cur-1) break; if(ks.has(n)) continue; taken.push(n);} 
  const state={lg,slot,taken,mine};
  const dom=new JSDOM(html,{url:'https://example.org/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.localStorage.setItem('live2026',JSON.stringify(state)); w.confirm=()=>true;}});
  return new Promise(res=>setTimeout(()=>{const d=dom.window.document; const rows=[...d.querySelectorAll('#tbl tbody tr')];
    console.log('\n'+label,'| on clock',d.getElementById('cur').textContent,d.getElementById('curwho').textContent,'| odds',d.getElementById('odds').textContent);
    console.log('   cols: '+[...d.querySelectorAll('#tbl thead th')].map(t=>t.textContent.trim()).join(' | '));
    rows.slice(0,5).forEach(r=>console.log('   '+r.querySelector('td.nm b').textContent.padEnd(22)+' '+[...r.children].slice(2).map(c=>c.textContent.trim()).join(' | ')));
    res();},80));
}
(async()=>{
 await scenario('A',2,['Jahmyr Gibbs'],['Bijan Robinson'],19,'A pick 19, Bijan slipped');
 await scenario('A',2,['Jahmyr Gibbs','Trey McBride','A.J. Brown','DeVonta Smith'],['Chase Brown'],42,'A pick 42, Chase Brown slipped');
 await scenario('B',4,['Puka Nacua','Chase Brown'],['Trey McBride','Josh Allen'],24,'B pick 24, McBride and Allen both there');
 await scenario('B',4,['Puka Nacua','Chase Brown','Josh Allen','Garrett Wilson','Quinshon Judkins','Emeka Egbuka','MarShawn Lloyd'],['Brock Bowers'],84,'B pick 84, Bowers slipped to round 9');
})();

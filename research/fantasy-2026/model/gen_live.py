"""Build the live draft assistant page: embeds projections, availability, room prices, and a client-side recommender."""
import sys, json, html, math
sys.argv=['x','1']
exec(open('/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/sim_season.py').read().split("if __name__=='__main__':")[0])
import pandas as pd
O='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/'
OUT='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/draft-live.html'
PA=project('A'); PB=project('B')
bA=pd.read_csv(O+'board_A.csv'); bB=pd.read_csv(O+'board_B.csv')
rankB=dict(zip(bB.player,bB['rank']))
# Footborn room price: ESPN estimate shifted by this room's 2025 tendencies (RB earlier, QB run 30-47, TE round 3)
def roomB(name,pos,adp):
    if pos=='QB':
        fixed={'Josh Allen':28,'Drake Maye':38,'Lamar Jackson':40,'Joe Burrow':44,'Jalen Hurts':46,'Jayden Daniels':47,'Patrick Mahomes II':60,'Matthew Stafford':72,'Justin Herbert':84,'Trevor Lawrence':90,'Dak Prescott':95,'Caleb Williams':88,'Bo Nix':92,'Brock Purdy':110,'Jared Goff':120,'Jaxson Dart':100,'Kyler Murray':118,'Baker Mayfield':105,'Daniel Jones':130}
        return fixed.get(name,adp)
    if pos=='TE': return adp-4 if adp<40 else adp
    if pos=='RB': return max(1,adp-4)
    if pos=='DST': return max(adp,120)
    return adp
rows=[]
for r in bA.itertuples():
    p=PA.get(r.player); q=PB.get(r.player)
    if p is None: continue
    adp=float(r.espn_adp) if pd.notna(r.espn_adp) else (float(r.ecr_ovr) if pd.notna(r.ecr_ovr) else 250.0)
    rows.append(dict(n=r.player,pos=r.pos,tm=r.team_26 if pd.notna(r.team_26) else '',bye=int(r.bye) if pd.notna(r.bye) else 0,
        rA=int(r.rank),rB=int(rankB.get(r.player,r.rank)),ecr=round(float(r.ecr_ovr),0) if pd.notna(r.ecr_ovr) else None,
        adpA=round(adp,0),adpB=round(roomB(r.player,r.pos,adp),0),
        pA=round(p['mean'],1),pB=round(q['mean'],1),inj=round(float(p['exp_missed']),1),
        note=(r.note if isinstance(r.note,str) else '')[:160]))
rows=[x for x in rows if x['rA']<=260]
data=json.dumps(rows,separators=(',',':'))
esc=html.escape
page=r'''<title>Draft Day Assistant</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{--bg:#FBFAF6;--ink:#16191D;--mute:#646B73;--line:#DCD9D0;--acc:#1E7A4B;--acc-ink:#fff;--card:#fff;--head:#F1EFE7;--warn:#B4541B;--mine:#DDEFE4;--gone:#9AA0A6}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#121417;--ink:#ECEDE9;--mute:#9BA3AB;--line:#2C3136;--acc:#4CC38A;--acc-ink:#0F1512;--card:#181B1F;--head:#1B1F24;--warn:#E5905A;--mine:#173327;--gone:#5C646C}}
:root[data-theme="dark"]{--bg:#121417;--ink:#ECEDE9;--mute:#9BA3AB;--line:#2C3136;--acc:#4CC38A;--acc-ink:#0F1512;--card:#181B1F;--head:#1B1F24;--warn:#E5905A;--mine:#173327;--gone:#5C646C}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.4 Barlow,system-ui,sans-serif}
.wrap{max-width:1000px;margin:0 auto;padding:12px 12px 80px}
h1,h2,h3{font-family:"Barlow Condensed",sans-serif;margin:0} h1{font-size:28px;font-weight:700} h2{font-size:20px;font-weight:700;margin:14px 0 6px} h3{font-size:15px;font-weight:600;color:var(--mute);letter-spacing:.06em;text-transform:uppercase}
.top{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;align-items:center;border-bottom:2px solid var(--ink);padding-bottom:8px}
.seg{display:flex;gap:4px}.seg button{font:600 13px "Barlow Condensed",sans-serif;letter-spacing:.05em;text-transform:uppercase;padding:7px 12px;border:1.5px solid var(--ink);background:transparent;color:var(--ink);cursor:pointer}.seg button.on{background:var(--ink);color:var(--bg)}
.status{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:10px}.stat{background:var(--card);border:1px solid var(--line);padding:8px 10px}.stat span{display:block;font:600 11px "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}.stat b{font:500 20px "IBM Plex Mono",monospace}.stat small{color:var(--mute)}
.tools{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.tools input{flex:1;min-width:200px;font:15px Barlow,sans-serif;padding:8px 10px;border:1.5px solid var(--line);background:var(--card);color:var(--ink)}.tools input:focus-visible{outline:3px solid var(--acc)}
.chips{display:flex;gap:4px;flex-wrap:wrap}.chips button{font:600 12px "Barlow Condensed",sans-serif;letter-spacing:.06em;padding:6px 10px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}.chips button.on{background:var(--acc);color:var(--acc-ink);border-color:var(--acc)}
.tw{overflow-x:auto;border:1px solid var(--line);background:var(--card)}table{border-collapse:collapse;width:100%;font-size:13px}th{font:600 11px "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;text-align:left;padding:6px 6px;background:var(--head);border-bottom:1px solid var(--line);white-space:nowrap}td{padding:5px 6px;border-bottom:1px solid var(--line);vertical-align:middle}.num{font-family:"IBM Plex Mono",monospace;font-variant-numeric:tabular-nums;white-space:nowrap;font-size:12.5px;text-align:right}
td.nm b{font-weight:600}td.nm small{color:var(--mute);white-space:nowrap}td.act{white-space:nowrap}td.act button{font:600 12px "Barlow Condensed",sans-serif;letter-spacing:.05em;padding:4px 8px;margin-right:3px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}td.act button.mine{border-color:var(--acc);color:var(--acc)}td.act button:focus-visible{outline:3px solid var(--acc)}
tr.rec1 td{background:var(--mine)}tr.gone td{color:var(--gone)}tr.gone td.nm b{text-decoration:line-through}
.why{color:var(--mute);font-size:12px;max-width:44ch}
.roster{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}.slot{display:flex;justify-content:space-between;gap:8px;padding:5px 8px;border:1px solid var(--line);background:var(--card)}.slot span{font:600 11px "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);min-width:44px}.slot i{color:var(--mute);font-style:normal}
.log{font-size:12.5px;color:var(--mute);display:flex;flex-wrap:wrap;gap:4px}.log button{font:12px Barlow,sans-serif;padding:2px 7px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}
.foot{color:var(--mute);font-size:12px;margin-top:20px;max-width:90ch}
.setup{display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:13px}.setup select,.setup button{font:14px Barlow,sans-serif;padding:6px 8px;border:1.5px solid var(--line);background:var(--card);color:var(--ink)}.setup button{cursor:pointer}
</style>
<div class="wrap">
<header class="top"><div><h1>Draft Day Assistant</h1><div class="setup">
<div class="seg" id="lgseg"><button class="on" data-lg="A">Ratz · pick 2</button><button data-lg="B">Footborn · pick 4</button></div>
<label>My slot <select id="slot"></select></label>
<button id="undo">Undo last</button><button id="reset">Reset draft</button></div></div></header>
<div class="status">
<div class="stat"><span>On the clock</span><b id="cur">1</b><small id="curwho"></small></div>
<div class="stat"><span>My next picks</span><b id="nextp">2</b><small id="nextp2"></small></div>
<div class="stat"><span>Projected starting ppg</span><b id="tppg">0</b><small>my picks + expected value of my remaining picks</small></div>
<div class="stat"><span>Est. playoffs / title</span><b id="odds">--</b><small>model estimate vs an average roster</small></div>
</div>
<h2>Recommended now</h2>
<div class="tools"><input type="search" id="q" placeholder="Type a name, then tap Taken or Mine" aria-label="find a player"><div class="chips" id="chips"><button class="on" data-pos="ALL">All</button><button data-pos="RB">RB</button><button data-pos="WR">WR</button><button data-pos="TE">TE</button><button data-pos="QB">QB</button><button data-pos="DST">DST</button></div></div>
<div class="tw"><table id="tbl"><thead><tr><th></th><th>Player</th><th>Proj</th><th>Value vs next pick</th><th>Gone by next</th><th>Title Δ</th><th>Board</th><th>Room</th><th>Inj</th><th>Why</th></tr></thead><tbody></tbody></table></div>
<h2>My roster</h2><div class="roster" id="roster"></div>
<h2>Draft log</h2><div class="log" id="log"></div>
<p class="foot">Proj = projected points per game under this league's scoring (half shrunken 2024-25 production, half consensus curve). Value vs next pick = projected season points over the best player at the same position expected to still be there at your next pick, adjusted for what your lineup still needs. Gone by next = chance the room takes him before your next turn, from the room-price model. Title Δ = estimated change in championship probability from adding him, using the slope fitted from the season simulations (the plan roster scored 17.7% in Ratz and 11.6% in Footborn; a roster drafted off the ESPN sheet 8.2% and 12.8%). All of it is an estimate; the round-by-round sheet still governs structure.</p>
</div>
<script>
const DATA=__DATA__;
(function(){
const $=s=>document.querySelector(s);
const SL={A:{title:1.01,po:1.24,base:{ppg:112.2,title:17.7,po:94.5}},B:{title:0.70,po:1.73,base:{ppg:107.8,title:11.6,po:70}}};
const WAIV={A:{QB:15,RB:9.5,WR:9.5,TE:8,DST:6},B:{QB:18.5,RB:9.5,WR:9.5,TE:8,DST:6}};
const LINE=[['QB',1],['RB',2],['WR',2],['TE',1],['FLEX',2],['DST',1]];
let st={lg:'A',slot:2,taken:[],mine:[]};
try{const s=JSON.parse(localStorage.getItem('live2026')||'null');if(s)st=s}catch(e){}
function save(){try{localStorage.setItem('live2026',JSON.stringify(st))}catch(e){}}
const byName={};DATA.forEach(d=>byName[d.n]=d);
function myPicks(slot){const out=[];for(let r=0;r<15;r++){out.push(r*10+(r%2===0?slot:11-slot))}return out}
function proj(d){return st.lg==='A'?d.pA:d.pB}
function adp(d){return st.lg==='A'?d.adpA:d.adpB}
function rank(d){return st.lg==='A'?d.rA:d.rB}
function avail(d){return proj(d)*(1-d.inj/17)}
function pGone(d,pick,cur){if(pick<=cur)return 0;const a=adp(d);const x=(pick-a)/6;return 1/(1+Math.exp(-x))}
function lineup(names){const ps=names.map(n=>byName[n]).filter(Boolean).sort((a,b)=>avail(b)-avail(a));const used=new Set();let t=0;const W=WAIV[st.lg];
 function take(ok,n){let g=0;for(const p of ps){if(used.has(p.n)||!ok.includes(p.pos))continue;used.add(p.n);t+=avail(p);g++;if(g===n)break}for(;g<n;g++)t+=W[ok[0]]}
 take(['QB'],1);take(['RB'],2);take(['WR'],2);take(['TE'],1);take(['RB','WR','TE'],2);take(['DST'],1);return t}
function expectedLineup(names,availP,cur,picks){
 // fill open starting slots greedily with the best player expected to be available at each of my future picks
 const have=names.slice(); const future=picks.filter(p=>p>cur).slice(0,9);
 for(const p of future){let best=null,bestGain=0;const baseL=lineup(have);
  for(const pos of ['QB','RB','WR','TE','DST']){const c=availP.filter(d=>d.pos===pos&&!have.includes(d.n)&&pGone(d,p,cur)<0.5).sort((a,b)=>avail(b)-avail(a))[0];if(!c)continue;const g=lineup(have.concat([c.n]))-baseL;if(g>bestGain){bestGain=g;best=c}}
  if(best)have.push(best.n); else break}
 return lineup(have)}
function render(){
 const cur=st.taken.length+1; const picks=myPicks(st.slot); const nxt=picks.find(p=>p>=cur)||151; const nxt2=picks.find(p=>p>nxt)||151;
 const onClock=((cur-1)%10); const rd=Math.floor((cur-1)/10); const slotOn=(rd%2===0?onClock+1:10-onClock);
 $('#cur').textContent=cur>150?'done':cur; $('#curwho').textContent=cur>150?'':(slotOn===st.slot?'YOU':'slot '+slotOn);
 $('#nextp').textContent=nxt>150?'--':nxt; $('#nextp2').textContent=nxt2>150?'':('then '+nxt2);
 const takenSet=new Set(st.taken); const mineSet=new Set(st.mine);
 const availP=DATA.filter(d=>!takenSet.has(d.n));
 const base=expectedLineup(st.mine,availP,cur,picks); $('#tppg').textContent=base.toFixed(1);
 const S=SL[st.lg]; const dt=Math.max(1,Math.min(45,S.base.title+S.title*(base-S.base.ppg))); const dp=Math.max(5,Math.min(99,S.base.po+S.po*(base-S.base.ppg)));
 $('#odds').textContent=st.mine.length?(dp.toFixed(0)+'% / '+dt.toFixed(1)+'%'):'--';
 // best alternative at each position likely available at next pick
 const alt={};['QB','RB','WR','TE','DST'].forEach(pos=>{const c=availP.filter(d=>d.pos===pos&&pGone(d,nxt,cur)<0.5).sort((a,b)=>avail(b)-avail(a));alt[pos]=c.length?avail(c[0]):WAIV[st.lg][pos]});
 const cnt={};st.mine.forEach(n=>{const p=byName[n];if(p)cnt[p.pos]=(cnt[p.pos]||0)+1});
 const need=pos=>{const c=cnt[pos]||0;if(pos==='QB')return c===0?1:0.25;if(pos==='TE')return c===0?1:0.35;if(pos==='DST')return c===0?1:0.05;const flexOpen=2-Math.max(0,(cnt.RB||0)-2)-Math.max(0,(cnt.WR||0)-2)-Math.max(0,(cnt.TE||0)-1);if(c<2)return 1;return flexOpen>0?0.85:0.55};
 const rows=availP.map(d=>{const v=(avail(d)-alt[d.pos])*17*need(d.pos);const dtitle=S.title*(expectedLineup(st.mine.concat([d.n]),availP.filter(x=>x.n!==d.n),cur+1,picks)-base);return {d,v,dtitle,pg:pGone(d,nxt,cur)}});
 const pos=$('#chips button.on').dataset.pos; const q=$('#q').value.trim().toLowerCase();
 let list=rows.filter(r=>(pos==='ALL'||r.d.pos===pos)&&(!q||r.d.n.toLowerCase().includes(q)));
 list.sort((a,b)=>(b.dtitle*30+b.v*0.5)-(a.dtitle*30+a.v*0.5)); list=list.slice(0,q?15:40);
 const tb=$('#tbl tbody'); tb.innerHTML='';
 list.forEach((r,i)=>{const d=r.d;const tr=document.createElement('tr');if(i===0&&!q)tr.className='rec1';
  tr.innerHTML='<td class="act"><button data-a="taken">Taken</button><button class="mine" data-a="mine">Mine</button></td><td class="nm"><b>'+d.n+'</b> <small>'+d.pos+' · '+d.tm+' · bye '+d.bye+'</small></td><td class="num">'+proj(d).toFixed(1)+'</td><td class="num">'+(r.v>=0?'+':'')+r.v.toFixed(0)+'</td><td class="num">'+(r.pg*100).toFixed(0)+'%</td><td class="num">'+(r.dtitle>=0?'+':'')+r.dtitle.toFixed(1)+'</td><td class="num">'+rank(d)+'</td><td class="num">'+adp(d)+'</td><td class="num">'+d.inj.toFixed(1)+'</td><td class="why">'+d.note.replace(/</g,'&lt;')+'</td>';
  tr.querySelector('[data-a="taken"]').addEventListener('click',()=>{st.taken.push(d.n);save();$('#q').value='';render()});
  tr.querySelector('[data-a="mine"]').addEventListener('click',()=>{st.taken.push(d.n);st.mine.push(d.n);save();$('#q').value='';render()});
  tb.appendChild(tr)});
 // roster
 const R=$('#roster');R.innerHTML='';const ps=st.mine.map(n=>byName[n]).filter(Boolean).sort((a,b)=>avail(b)-avail(a));const used=new Set();
 LINE.forEach(([sl,n])=>{for(let i=0;i<n;i++){const ok=sl==='FLEX'?['RB','WR','TE']:[sl];const p=ps.find(x=>!used.has(x.n)&&ok.includes(x.pos));if(p)used.add(p.n);const div=document.createElement('div');div.className='slot';div.innerHTML='<span>'+sl+'</span><b>'+(p?p.n:'<i>open</i>')+'</b><i>'+(p?proj(p).toFixed(1):'')+'</i>';R.appendChild(div)}});
 ps.filter(p=>!used.has(p.n)).forEach(p=>{const div=document.createElement('div');div.className='slot';div.innerHTML='<span>BN</span><b>'+p.n+'</b><i>'+proj(p).toFixed(1)+'</i>';R.appendChild(div)});
 // log
 const L=$('#log');L.innerHTML='';st.taken.forEach((n,i)=>{const b=document.createElement('button');b.textContent=(i+1)+' '+n+(st.mine.includes(n)?' ★':'');b.title='remove';b.addEventListener('click',()=>{st.taken.splice(i,1);st.mine=st.mine.filter(x=>x!==n);save();render()});L.appendChild(b)});
}
const sel=$('#slot');for(let i=1;i<=10;i++){const o=document.createElement('option');o.value=i;o.textContent=i;sel.appendChild(o)}
sel.value=st.slot; sel.addEventListener('change',()=>{st.slot=parseInt(sel.value,10);save();render()});
document.querySelectorAll('#lgseg button').forEach(b=>{b.classList.toggle('on',b.dataset.lg===st.lg);b.addEventListener('click',()=>{document.querySelectorAll('#lgseg button').forEach(x=>x.classList.toggle('on',x===b));st.lg=b.dataset.lg;if(st.lg==='A'&&st.slot===4)st.slot=2;if(st.lg==='B'&&st.slot===2)st.slot=4;sel.value=st.slot;save();render()})});
if(st.lg==='B'&&st.slot===2)st.slot=4;
document.querySelectorAll('#chips button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#chips button').forEach(x=>x.classList.toggle('on',x===b));render()}));
$('#q').addEventListener('input',render);
$('#undo').addEventListener('click',()=>{const n=st.taken.pop();if(n)st.mine=st.mine.filter(x=>x!==n);save();render()});
$('#reset').addEventListener('click',()=>{if(confirm('Clear the whole draft?')){st.taken=[];st.mine=[];save();render()}});
render();
})();
</script>'''
page=page.replace('__DATA__',data)
open(OUT,'w').write(page); print('wrote',OUT,len(page),'players',len(rows))

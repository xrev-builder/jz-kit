const {JSDOM}=require('jsdom'); const fs=require('fs');
const html='<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(process.argv[2]||'draft-board.html','utf8')+'</body></html>';
const dom=new JSDOM(html,{url:'https://example.org/',runScripts:'dangerously',pretendToBeVisual:true}); const errs=[]; dom.window.addEventListener('error',e=>errs.push(e.message));
dom.window.confirm=()=>true; dom.window.prompt=()=>'Kass'; dom.window.HTMLElement.prototype.scrollIntoView=function(){};
setTimeout(()=>{const d=dom.window.document; const $=s=>d.querySelector(s);
 const tick=(lg,name)=>{const tr=[...d.querySelectorAll('#lg-'+lg+' tr.p')].find(t=>t.dataset.name===name); const c=tr.querySelector('input'); c.checked=!c.checked; c.dispatchEvent(new dom.window.Event('change',{bubbles:true}))};
 console.log('errors',errs);
 const sec=$('#trk-A'); console.log('A start:',$('#trk-A [data-t="clock"]').textContent,'| mynext',$('#trk-A [data-t="mynext"]').textContent,'| dock hidden A/B',$('.dock[data-dock="A"]').hidden,$('.dock[data-dock="B"]').hidden);
 ["ja'marr chase","jahmyr gibbs","bijan robinson","puka nacua","jaxon smith-njigba","amon-ra st. brown","christian mccaffrey","jonathan taylor","james cook iii","chase brown","trey mcbride","de'von achane"].forEach(n=>tick('A',n));
 console.log('after 12 picks:',$('#trk-A [data-t="clock"]').textContent,'| mynext',$('#trk-A [data-t="mynext"]').textContent,'| dock',$('.dock[data-dock="A"] [data-t="dockpick"]').textContent,$('.dock[data-dock="A"] [data-t="dockteam"]').textContent,$('.dock[data-dock="A"] [data-t="docknext"]').textContent);
 const cards=[...d.querySelectorAll('#trk-A [data-t="teams"] .tm')]; console.log('team cards',cards.length,'| YOU card:',cards[1].querySelector('h5 span').textContent,cards[1].querySelector('.cnt').textContent,'|',[...cards[1].querySelectorAll('li')].map(l=>l.textContent).join('; '));
 console.log('team 10 (turn):',[...cards[9].querySelectorAll('li')].map(l=>l.textContent).join('; '),'| needs:',cards[9].querySelector('.need').textContent);
 const grid=$('#trk-A [data-t="grid"]'); const r2=grid.querySelectorAll('tbody tr')[1]; console.log('grid R2 cells:',[...r2.children].slice(1).map(c=>c.textContent.trim()).join(' | '));
 console.log('around:',[...d.querySelectorAll('#trk-A [data-t="around"] .tm h5')].map(h=>h.textContent).join(' / '));
 console.log('log first 3:',[...d.querySelectorAll('#trk-A [data-t="log"] li')].slice(0,3).map(l=>l.textContent).join(' ; '));
 // untick Chase (pick 1) -> removal shifts
 tick('A',"ja'marr chase"); console.log('after removing pick 1: clock',$('#trk-A [data-t="clock"]').textContent,'| log first:',$('#trk-A [data-t="log"] li').textContent,'| chase row done?',[...d.querySelectorAll('#lg-A tr.p')].find(t=>t.dataset.name==="ja'marr chase").classList.contains('done'));
 // undo
 $('#trk-A [data-t="undo"]').click(); console.log('after undo: clock',$('#trk-A [data-t="clock"]').textContent,'| achane done?',[...d.querySelectorAll('#lg-A tr.p')].find(t=>t.dataset.name==="de'von achane").classList.contains('done'));
 // rename team 1 via grid header
 grid.querySelector('th[data-team="1"]').click(); console.log('renamed header:',grid.querySelector('th[data-team="1"]').textContent,'| log first:',$('#trk-A [data-t="log"] li').textContent);
 // persistence
 const T=JSON.parse(dom.window.localStorage.getItem('tracker')); console.log('stored picks A',T.A.picks.length,'names',JSON.stringify(T.A.names),'slot',T.A.slot);
 // league B independent, slot 4
 d.querySelectorAll('.tabs button')[1].click(); setTimeout(()=>{console.log('B tab: dock A hidden',$('.dock[data-dock="A"]').hidden,'B hidden',$('.dock[data-dock="B"]').hidden,'| B clock',$('#trk-B [data-t="clock"]').textContent,'| B mynext',$('#trk-B [data-t="mynext"]').textContent);
  $('.dock[data-dock="B"] button[data-go="trk-B"]').click(); console.log('errors at end',errs);},20);
},80);

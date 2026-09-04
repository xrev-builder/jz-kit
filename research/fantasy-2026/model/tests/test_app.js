const {JSDOM}=require('jsdom'); const fs=require('fs');
const html='<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(process.argv[2]||'draft-board.html','utf8')+'</body></html>';
const dom=new JSDOM(html,{url:'https://example.org/',runScripts:'dangerously',pretendToBeVisual:true}); const errs=[]; dom.window.addEventListener('error',e=>errs.push(e.message));
dom.window.confirm=()=>true; dom.window.HTMLElement.prototype.scrollIntoView=function(){}; dom.window.scrollTo=()=>{};
setTimeout(()=>{const d=dom.window.document; const $=s=>d.querySelector(s); const ev=(el,t)=>el.dispatchEvent(new dom.window.Event(t,{bubbles:true}));
 const tick=(lg,name)=>{const tr=[...d.querySelectorAll('#lg-'+lg+' tr.p')].find(t=>t.dataset.name===name); const c=tr.querySelector('input'); c.checked=!c.checked; ev(c,'change')};
 const live=$('#live'); const rows=()=>[...live.querySelectorAll('[data-t="ltbl"] tbody tr')];
 console.log('errors',errs,'| vtabs',[...d.querySelectorAll('.vtabs button')].map(b=>b.textContent).join(','),'| live hidden',live.hidden);
 tick('A',"ja'marr chase"); // pick 1.01 from the sheet
 $('.vtabs button[data-view="live"]').click(); console.log('assistant: hidden',live.hidden,'sheet hidden',$('#lg-A .sheet').hidden,'| cur',$('#live [data-t="cur"]').textContent,$('#live [data-t="curwho"]').textContent,'| next',$('#live [data-t="nextp"]').textContent,'| first rec',rows()[0].querySelector('td.nm b').textContent,'| btn',rows()[0].querySelector('button').textContent);
 rows()[0].querySelector('button').click(); // my pick 1.02 from the assistant
 console.log('after Mine: cur',$('#live [data-t="cur"]').textContent,$('#live [data-t="curwho"]').textContent,'| ppg',$('#live [data-t="tppg"]').textContent,'| odds',$('#live [data-t="odds"]').textContent,'| roster RB1',[...live.querySelectorAll('.slot')].find(s=>s.querySelector('span').textContent==='RB').querySelector('b').textContent,'| btn now',rows()[0].querySelector('button').textContent);
 for(let i=0;i<5;i++) rows()[0].querySelector('button').click(); // 1.03-1.07 taken by others via assistant
 console.log('log:',[...live.querySelectorAll('[data-t="llog"] button')].map(b=>b.textContent).join(' ; '));
 // board reflects it
 const g=$('#db-A [data-t="grid"]'); console.log('board R1:',[1,2,3,4,5,6,7].map(t=>g.querySelectorAll('tbody tr')[0].children[t].textContent).join(' | '),'| board clock',$('#db-A [data-t="clock"]').textContent);
 // sheet struck?
 console.log('sheet struck count A:',d.querySelectorAll('#lg-A tr.p.done').length/2);
 // remove from assistant log
 live.querySelectorAll('[data-t="llog"] button')[0].click(); console.log('after removing 1.01 via log: cur',$('#live [data-t="cur"]').textContent,'| board 1.01 now',g.querySelectorAll('tbody tr')[0].children[1].textContent,'| chase struck?',[...d.querySelectorAll('#lg-A tr.p')].find(t=>t.dataset.name==="ja'marr chase").classList.contains('done'));
 // dock buttons
 $('.dock[data-dock="A"] button[data-view="board"]').click(); console.log('dock->board: live hidden',live.hidden,'board hidden',$('#db-A').hidden,'| stored view',dom.window.localStorage.getItem('view'));
 // league switch keeps separate state
 d.querySelectorAll('.tabs button[data-lg]')[1].click(); setTimeout(()=>{ $('.vtabs button[data-view="live"]').click(); console.log('B assistant: lgname',$('#live [data-t="lgname"]').textContent,'| cur',$('#live [data-t="cur"]').textContent,'| next',$('#live [data-t="nextp"]').textContent,'| first',rows()[0].querySelector('td.nm b').textContent,rows()[0].querySelector('button').textContent,'| errors',errs)},20);
},100);

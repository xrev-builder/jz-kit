const {JSDOM}=require('jsdom'); const fs=require('fs');
const html='<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync('draft-board.html','utf8')+'</body></html>';
const dom=new JSDOM(html,{url:'https://example.org/',runScripts:'dangerously',pretendToBeVisual:true}); const errs=[]; dom.window.addEventListener('error',e=>errs.push(e.message)); dom.window.HTMLElement.prototype.scrollIntoView=function(){}; dom.window.scrollTo=()=>{};
setTimeout(()=>{const d=dom.window.document; const $=s=>d.querySelector(s); const ev=(el,t)=>el.dispatchEvent(new dom.window.Event(t,{bubbles:true}));
 $('.vtabs button[data-view="espn"]').click(); const sec=$('#espn'); const vis=()=>[...sec.querySelectorAll('tr.p')].filter(r=>r.style.display!=='none');
 console.log('errors',errs,'| espn hidden',sec.hidden,'| rows',vis().length,'| first 5 by ESPN ADP:',vis().slice(0,5).map(r=>r.querySelector('td.nm b').textContent+' '+r.children[0].textContent).join(', '));
 sec.querySelector('[data-t="esort"] button[data-sort="delta"]').click(); console.log('top value gaps:',vis().slice(0,6).map(r=>r.querySelector('td.nm b').textContent+' '+r.children[7].textContent).join(', '));
 sec.querySelector('[data-t="echips"] button[data-pos="RB"]').click(); sec.querySelector('[data-t="esort"] button[data-sort="adp"]').click(); console.log('RBs by ESPN:',vis().slice(0,8).map(r=>r.querySelector('td.nm b').textContent+' '+r.children[0].textContent+' (FB25 '+r.children[8].textContent+')').join(' | '));
 // strike sync
 const tr=[...d.querySelectorAll('#lg-A tr.p')].find(t=>t.dataset.name==='jahmyr gibbs'); const c=tr.querySelector('input'); c.checked=true; ev(c,'change');
 console.log('gibbs struck on ESPN tab:',[...sec.querySelectorAll('tr.p')].find(r=>r.dataset.name==='jahmyr gibbs').classList.contains('done'),'| errors',errs);
},120);

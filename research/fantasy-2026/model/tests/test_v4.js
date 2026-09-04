const {JSDOM}=require('jsdom'); const fs=require('fs');
const html='<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync('draft-board.html','utf8')+'</body></html>';
const dom=new JSDOM(html,{url:'https://example.org/',runScripts:'dangerously',pretendToBeVisual:true}); const errs=[]; dom.window.addEventListener('error',e=>errs.push(e.message));
dom.window.confirm=()=>true; dom.window.alert=m=>console.log('ALERT',m); dom.window.HTMLElement.prototype.scrollIntoView=function(){}; dom.window.scrollTo=()=>{};
setTimeout(()=>{const d=dom.window.document; const $=s=>d.querySelector(s); const ev=(el,t)=>el.dispatchEvent(new dom.window.Event(t,{bubbles:true}));
 const tick=(lg,name)=>{const tr=[...d.querySelectorAll('#lg-'+lg+' tr.p')].find(t=>t.dataset.name===name); const c=tr.querySelector('input'); c.checked=!c.checked; ev(c,'change')};
 d.querySelectorAll('.tabs button[data-lg]')[1].click();
 setTimeout(()=>{
  $('.vtabs button[data-view="board"]').click();
  console.log('errors',errs,'| B next-up at 1.01:'); d.querySelectorAll('#db-B .nu').forEach(n=>console.log('   ',n.querySelector('h5').textContent,'->',[...n.querySelectorAll('li')].map(l=>l.textContent).join(', ')));
  ["jahmyr gibbs","ja'marr chase","bijan robinson"].forEach(n=>tick('B',n));
  console.log('after 3 picks, next-up:'); d.querySelectorAll('#db-B .nu').forEach(n=>console.log('   ',n.querySelector('h5').textContent,'->',[...n.querySelectorAll('li')].map(l=>l.textContent).join(', ')));
  $('.vtabs button[data-view="live"]').click(); const live=$('#live'); const rows=()=>[...live.querySelectorAll('[data-t="ltbl"] tbody tr')];
  console.log('assistant at 1.04 banner:',live.querySelector('[data-t="rec"]').textContent.slice(0,400));
  tick('B','puka nacua'); // my 4
  ["jaxon smith-njigba","amon-ra st. brown","christian mccaffrey","jonathan taylor","james cook iii","de'von achane","ashton jeanty","chase brown","derrick henry","kenneth walker iii","omarion hampton","ceedee lamb"].forEach(n=>tick('B',n)); // picks 5-16
  console.log('\nassistant at 2.07 (pick 17) banner:',live.querySelector('[data-t="rec"]').textContent.slice(0,600));
  console.log('top 8 at 17:',rows().slice(0,8).map(r=>r.querySelector('td.nm b').textContent+' Δ'+r.children[5].textContent+' gone '+r.children[4].textContent).join(' | '));
  const allen=rows().find(r=>r.querySelector('td.nm b').textContent==='Josh Allen'); const mcb=rows().find(r=>r.querySelector('td.nm b').textContent==='Trey McBride');
  console.log('Allen row:',allen?allen.children[3].textContent+' '+allen.children[4].textContent+' '+allen.children[5].textContent:'n/a','| McBride row:',mcb?mcb.children[3].textContent+' '+mcb.children[4].textContent+' '+mcb.children[5].textContent:'n/a');
  $('.vtabs button[data-view="board"]').click(); console.log('\nboard next-up at 2.07:'); d.querySelectorAll('#db-B .nu').forEach(n=>console.log('   ',n.querySelector('h5').textContent,'->',[...n.querySelectorAll('li')].map(l=>l.textContent).join(', ')));
  // player card
  $('.vtabs button[data-view="sheet"]').click(); const nm=[...d.querySelectorAll('#lg-B tr.p')].find(t=>t.dataset.name==='josh allen').querySelector('.nm b'); nm.click(); const mb=$('#modal [data-t="mbody"]'); console.log('\ncard open:',!$('#modal').hidden,'| title',mb.querySelector('h3').textContent,'| summary:',mb.querySelector('.sum').textContent.slice(0,200),'| weeks:',mb.querySelectorAll('tbody tr').length); $('[data-t="mclose"]').click(); console.log('card closed:',$('#modal').hidden);
  // export/import
  $('.vtabs button[data-view="board"]').click(); $('#db-B [data-t="export"]').click(); const exp=$('#modal textarea').value; console.log('export len',exp.length,'picks',JSON.parse(exp).picks.length); $('[data-t="mclose"]').click();
  $('#db-B [data-t="clear"]').click(); console.log('after clear picks:',JSON.parse(dom.window.localStorage.getItem('tracker')).B.picks.length);
  $('#db-B [data-t="import"]').click(); $('#modal [data-t="imp"]').value=exp; $('#modal [data-t="impgo"]').click(); console.log('after import picks:',JSON.parse(dom.window.localStorage.getItem('tracker')).B.picks.length,'| clock',$('#db-B [data-t="clock"]').textContent,'| saved stamp:',$('.dock[data-dock="B"] [data-t="saved"]').textContent,'| struck rows',d.querySelectorAll('#lg-B tr.p.done').length/2);
  console.log('errors end',errs);
 },30);
},150);

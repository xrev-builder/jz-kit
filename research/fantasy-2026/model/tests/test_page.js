const {JSDOM}=require('jsdom'); const fs=require('fs');
const html='<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(process.argv[2],'utf8')+'</body></html>';
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true});
const errs=[]; dom.window.addEventListener('error',e=>errs.push(e.message));
dom.virtualConsole&&0;
const d=dom.window.document;
setTimeout(()=>{
  const tabs=d.querySelectorAll('.tabs button'); console.log('tabs',tabs.length,'errors',errs);
  const A=d.getElementById('lg-A'),B=d.getElementById('lg-B'); console.log('before: A hidden',A.hidden,'B hidden',B.hidden);
  tabs[1].click(); console.log('after click B: A hidden',A.hidden,'B hidden',B.hidden);
  tabs[0].click(); console.log('after click A: A hidden',A.hidden,'B hidden',B.hidden);
  const cb=d.querySelector('tr.p input'); cb.click(); console.log('checkbox row done class:',cb.closest('tr').classList.contains('done'));
  const chip=d.querySelector('.chips[data-chips="A"] button[data-pos="WR"]'); chip.click(); console.log('WR chip: RB section hidden',d.getElementById('A-RB').hidden,'WR hidden',d.getElementById('A-WR').hidden);
  const s=d.querySelector('input[data-search="A"]'); s.value='gibbs'; s.dispatchEvent(new dom.window.Event('input')); console.log('search rows visible:',[...d.querySelectorAll('#lg-A tr.p')].filter(t=>t.style.display!=='none').length);
},50);

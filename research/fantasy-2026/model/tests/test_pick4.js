const {JSDOM}=require('jsdom');const fs=require('fs');
const html='<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync('draft-live.html','utf8')+'</body></html>';
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true});const d=dom.window.document;
setTimeout(()=>{ d.querySelector('#lgseg button[data-lg="B"]').click();
 for(const n of ['Bijan Robinson','Jahmyr Gibbs',"Ja'Marr Chase"]){const q=d.querySelector('#q');q.value=n;q.dispatchEvent(new dom.window.Event('input'));d.querySelector('#tbl tbody tr [data-a="taken"]').click();}
 console.log('B, on the clock at', d.querySelector('#cur').textContent, d.querySelector('#curwho').textContent);
 [...d.querySelectorAll('#tbl tbody tr')].slice(0,8).forEach(tr=>{const c=tr.querySelectorAll('td');console.log(' ',c[1].textContent.trim().padEnd(40),'proj',c[2].textContent,'vNext',c[3].textContent,'gone',c[4].textContent,'titleΔ',c[5].textContent)});
},50);

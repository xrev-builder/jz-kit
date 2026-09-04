const {JSDOM}=require('jsdom'); const fs=require('fs');
const html='<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync('draft-board.html','utf8')+'</body></html>';
const state={A:{picks:[],names:{},slot:2},B:{picks:[{key:"B-Ja'Marr_Chase",name:"Ja'Marr Chase",pos:'WR',team:'CIN'},{key:'B-Jahmyr_Gibbs',name:'Jahmyr Gibbs',pos:'RB',team:'DET'},{key:'B-Bijan_Robinson',name:'Bijan Robinson',pos:'RB',team:'ATL'}],names:{},slot:4}};
const dom=new JSDOM(html,{url:'https://example.org/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.localStorage.setItem('tracker',JSON.stringify(state));w.localStorage.setItem('tab','B');w.localStorage.setItem('view','live');w.HTMLElement.prototype.scrollIntoView=function(){};w.scrollTo=()=>{}}});
setTimeout(()=>{const d=dom.window.document; const rows=[...d.querySelectorAll('#live [data-t="ltbl"] tbody tr')];
 console.log('lg',d.querySelector('#live [data-t="lgname"]').textContent,'| cur',d.querySelector('#live [data-t="cur"]').textContent,d.querySelector('#live [data-t="curwho"]').textContent);
 rows.slice(0,6).forEach(r=>console.log('  '+r.querySelector('td.nm b').textContent.padEnd(22)+[...r.children].slice(2,7).map(c=>c.textContent.trim()).join(' | ')));
},120);

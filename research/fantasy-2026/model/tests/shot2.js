const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
 const p=await b.newPage({viewport:{width:420,height:900}}); await p.goto('file://'+process.cwd()+'/draft-board.html'); await p.waitForTimeout(300);
 await p.evaluate(()=>document.getElementById('A-RB').scrollIntoView()); await p.waitForTimeout(200); await p.screenshot({path:'shot-sheet.png'});
 const names=["ja'marr chase","jahmyr gibbs","bijan robinson"]; for(const n of names){await p.evaluate(n=>{const tr=[...document.querySelectorAll('#lg-A tr.p')].find(t=>t.dataset.name===n);tr.querySelector('input').click()},n)}
 await p.click('.vtabs button[data-view="live"]'); await p.waitForTimeout(400); await p.screenshot({path:'shot-live.png'});
 await p.evaluate(()=>{const b=[...document.querySelectorAll('#live td.nm b')][0]; b.click()}); await p.waitForTimeout(300); await p.screenshot({path:'shot-card.png'});
 const p2=await b.newPage({viewport:{width:1200,height:820}}); await p2.goto('file://'+process.cwd()+'/draft-board.html'); await p2.waitForTimeout(300); await p2.evaluate(()=>{["ja'marr chase","jahmyr gibbs","bijan robinson","puka nacua"].forEach(n=>{const tr=[...document.querySelectorAll('#lg-A tr.p')].find(t=>t.dataset.name===n);tr.querySelector('input').click()})}); await p2.click('.vtabs button[data-view="board"]'); await p2.waitForTimeout(400); await p2.screenshot({path:'shot-board2.png'});
 await b.close(); console.log('ok')})().catch(e=>{console.error(e.message);process.exit(1)});

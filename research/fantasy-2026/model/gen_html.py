import pandas as pd, json, html, math
O='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/'
OUT='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/draft-board.html'
plan=json.load(open(O+'plan_final.json'))
boards={'A':pd.read_csv(O+'board_A.csv'),'B':pd.read_csv(O+'board_B.csv')}
tiers=json.load(open(O+'tiers.json'))  # {pos: [[tier_label, [names...]], ...]} shared; league-specific overrides under key 'A'/'B'
esc=lambda s: html.escape('' if (s is None or (isinstance(s,float) and math.isnan(s))) else str(s))
def f1(x):
    try:
        return '' if x is None or (isinstance(x,float) and math.isnan(x)) else f"{float(x):.1f}"
    except: return ''
def i0(x):
    try:
        return '' if x is None or (isinstance(x,float) and math.isnan(x)) else f"{int(float(x))}"
    except: return ''

def pos_tables(lg):
    b=boards[lg]; ppg='ppgA_25' if lg=='A' else 'ppgB_25'
    out=[]
    for pos in ['RB','WR','TE','QB','DST']:
        tl=tiers.get(lg,{}).get(pos) or tiers['shared'][pos]
        rows=[]
        for ti,(label,names) in enumerate(tl):
            rows.append(f'<tr class="tier t{min(ti+1,6)}"><td colspan="10">Tier {ti+1} <span>{esc(label)}</span></td></tr>')
            for n in names:
                r=b[b.player==n]
                if r.empty: continue
                r=r.iloc[0]
                key=f"{lg}-{esc(n).replace(' ','_')}"
                usage = f"{i0(r.tgt_25)} tgt" if pos in('WR','TE') else (f"{i0(r.car_25)} car / {i0(r.tgt_25)} tgt" if pos=='RB' else (f"{i0(r.pass_td_25)} TD / {i0(r.ru_yds_25)} ru yd" if pos=='QB' else ''))
                rows.append(
                  f'<tr class="p" data-key="{key}" data-pos="{pos}" data-name="{esc(n).lower()}">'
                  f'<td class="ck"><input type="checkbox" aria-label="drafted {esc(n)}"></td>'
                  f'<td class="num">{int(r["rank"])}</td><td class="nm"><b>{esc(n)}</b> <small>{esc(r.team_26)} · bye {i0(r.bye)}{(" · age "+f1(r.age)) if pos!="DST" else ""}</small></td>'
                  f'<td class="num">{i0(r.ecr_ovr)}</td><td class="num">{i0(r.espn_adp)}</td><td class="num">{f1(r[ppg])}</td><td class="num">{i0(r.g_25)}</td><td class="num">{f1(r.exp_missed)}</td><td class="us">{usage}</td>'
                  f'<td class="note">{esc(r.note)}</td></tr>')
        out.append(f'''<section class="pos" id="{lg}-{pos}"><h3>{pos}</h3><div class="tw"><table>
<thead><tr><th></th><th>#</th><th>Player</th><th>ECR</th><th>Room</th><th>25 ppg</th><th>G</th><th>Inj</th><th>2025 usage</th><th>Why</th></tr></thead><tbody>{''.join(rows)}</tbody></table></div></section>''')
    return ''.join(out)

def overall(lg):
    b=boards[lg].head(150); ppg='ppgA_25' if lg=='A' else 'ppgB_25'
    rows=[]
    for _,r in b.iterrows():
        key=f"{lg}-{esc(r.player).replace(' ','_')}"
        rows.append(f'<tr class="p" data-key="{key}" data-pos="{esc(r.pos)}" data-name="{esc(r.player).lower()}"><td class="ck"><input type="checkbox" aria-label="drafted {esc(r.player)}"></td><td class="num">{int(r["rank"])}</td><td class="nm"><b>{esc(r.player)}</b> <small>{esc(r.pos)}{int(r.pos_rank)} · {esc(r.team_26)} · bye {i0(r.bye)}</small></td><td class="num">{i0(r.ecr_ovr)}</td><td class="num">{i0(r.espn_adp)}</td><td class="num">{f1(r[ppg])}</td></tr>')
    return f'''<div class="tw"><table class="ov"><thead><tr><th></th><th>#</th><th>Player</th><th>ECR</th><th>Room</th><th>25 ppg</th></tr></thead><tbody>{''.join(rows)}</tbody></table></div>'''

def plan_table(lg):
    rows=[]
    for r in plan['rounds'][lg]:
        rows.append(f'<tr><td class="num">R{r["round"]}</td><td class="num">{r["pick"]}</td><td class="tg">{esc(r["targets"])}</td><td class="fb">{esc(r["fallback"])}</td><td class="rule">{esc(r["rule"])}</td></tr>')
    return f'''<div class="tw"><table class="plan"><thead><tr><th>Rd</th><th>Pick</th><th>Targets, in order</th><th>If they are gone</th><th>Rule</th></tr></thead><tbody>{''.join(rows)}</tbody></table></div>'''

def lists(lg):
    L=plan['lists'][lg]; out=[]
    for title,items in L:
        out.append(f'<div class="card"><h4>{esc(title)}</h4><ul>'+''.join(f'<li>{esc(i)}</li>' for i in items)+'</ul></div>')
    return '<div class="cards">'+''.join(out)+'</div>'

def sim_section():
    import os
    if not os.path.exists(O+'sim_results.csv'): return ''
    sr=pd.read_csv(O+'sim_results.csv')
    out=['<h4>Season simulation: playoff and title probability by roster construction (1,200 seasons each, simulator v3)</h4><p class="cap">Each season re-drafts nine ESPN-cheat-sheet opponents around your slot, samples every player\'s missed games from the empirical injury model, applies bye weeks and each player\'s own 2025 weekly variance, plays a 14-week random head-to-head schedule, then the league\'s bracket (8 of 10 in Ratz, 6 of 10 in Footborn). Starters are chosen by projection, not hindsight. Version 3 adds: handcuff promotion (a backup scores 81% of the starter\'s line while the starter is out, from 258 team-seasons), an active waiver wire (worst record claims first, need-based, ~4 in-season emergences per year at 13 ppg), same-team weekly correlation, a game-script tilt from 2026 Vegas win totals, injury report categories from 2025 and the lingering-injury literature (ACL, Achilles, hamstring, high-ankle, back), and the Sept 3 practice news. Projection = half usage-history model (opportunity, efficiency, snap share, age; fit 2013-2025), half the expert-consensus positional curve.</p>']
    for lg,name in (('A','Ratz (pick 2)'),('B','Footborn (pick 4)')):
        t=sr[sr.league==lg]
        rows=''.join(f'<tr><td>{esc(r.label)}</td><td class="num">{r.p_playoffs*100:.0f}%</td><td class="num">{r.p_title*100:.1f}%</td><td class="num">{r.avg_wins:.1f}</td><td class="num">{r.avg_ppg:.1f}</td></tr>' for r in t.itertuples())
        out.append(f'<p class="cap"><b>{name}</b></p><div class="tw"><table class="ev"><thead><tr><th>Roster</th><th>Make playoffs</th><th>Win title</th><th>Avg wins</th><th>Avg ppg</th></tr></thead><tbody>{rows}</tbody></table></div>')
    return ''.join(out)

def evidence():
    ev=plan['evidence']; out=[sim_section()]
    for sec in ev:
        if sec['type']=='table':
            hdr=''.join(f'<th>{esc(h)}</th>' for h in sec['header'])
            body=''.join('<tr>'+''.join(f'<td class="{"num" if j else ""}">{esc(c)}</td>' for j,c in enumerate(row))+'</tr>' for row in sec['rows'])
            out.append(f'<h4>{esc(sec["title"])}</h4><p class="cap">{esc(sec.get("caption",""))}</p><div class="tw"><table class="ev"><thead><tr>{hdr}</tr></thead><tbody>{body}</tbody></table></div>')
        else:
            out.append(f'<h4>{esc(sec["title"])}</h4><ul class="ev">'+''.join(f'<li>{esc(i)}</li>' for i in sec['items'])+'</ul>')
    return ''.join(out)

USER_SLOT={'A':2,'B':4}
def board(lg):
    slot=USER_SLOT[lg]
    opts=''.join(f'<option value="{i}"{" selected" if i==slot else ""}>{i}</option>' for i in range(1,11))
    return f"""<section class="dboard" id="db-{lg}" data-lg="{lg}" hidden>
<div class="dbtop"><div class="onclock"><span>On the clock</span><b data-t="clock">1.01 · Team 1</b></div><div class="onclock"><span>You</span><b data-t="mynext">-</b></div>
<div class="addp"><input type="search" placeholder="Type a name to log a pick" data-t="q" aria-label="log a pick"><div class="hits" data-t="hits" hidden></div></div>
<label class="slotsel">Slot <select data-t="slot">{opts}</select></label><button type="button" data-t="undo">Undo</button><button type="button" data-t="clear">Clear</button></div>
<p class="cap">Tick a player on the cheat sheet or type a name here: he is logged to the team on the clock (snake). Tap a team name to rename it. Tap a filled cell to remove that pick. Scroll sideways for all ten teams.</p>
<div class="dbwrap"><table class="db" data-t="grid"></table></div>
</section>
<div class="dock" data-dock="{lg}"><div><span>Pick</span><b data-t="dockpick">1.01</b></div><div><span>On clock</span><b data-t="dockteam">Team 1</b></div><div><span>You</span><b data-t="docknext">-</b></div><button type="button" data-view="sheet">Sheet</button><button type="button" data-view="board">Board</button><button type="button" data-view="live">Assistant</button></div>"""

def league(lg):
    L=plan['leagues'][lg]
    return f'''<div class="league" id="lg-{lg}" {'hidden' if lg=='B' else ''}>
<div class="sheet"><div class="lhead"><div><h2>{esc(L['name'])}</h2><p class="meta">{esc(L['meta'])}</p></div><div class="pickbox"><span>Your picks</span><b>{esc(L['picks'])}</b></div></div>
<div class="thesis"><h3>Game plan</h3><ol>{''.join(f'<li>{esc(t)}</li>' for t in L['thesis'])}</ol></div>
<h3 class="sec">Round by round</h3>{plan_table(lg)}
{lists(lg)}
<h3 class="sec" id="rank-{lg}">Rankings by position <span class="hint">ECR = expert consensus rank · Room = where an ESPN cheat-sheet room takes him · Inj = expected games missed (empirical, by position/age/prior injuries) · tap the box to strike a drafted player</span></h3>
<div class="tools"><input type="search" placeholder="Find a player" data-search="{lg}" aria-label="find a player"><div class="chips" data-chips="{lg}"><button class="on" data-pos="ALL">All</button><button data-pos="RB">RB</button><button data-pos="WR">WR</button><button data-pos="TE">TE</button><button data-pos="QB">QB</button><button data-pos="DST">DST</button></div></div>
{pos_tables(lg)}
<h3 class="sec">Overall top 150</h3>{overall(lg)}
</div>
{board(lg)}
</div>'''

EXTRA_CSS='''
<style>
:root{--pQB:#F9C9D3;--pRB:#BDEBDD;--pWR:#C6DBFA;--pTE:#FAD9B4;--pDST:#DAD6CE;--pQBi:#7A1F35;--pRBi:#0F5A45;--pWRi:#1C3F7A;--pTEi:#7A4410;--pDSTi:#4A4640}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--pQB:#5A2131;--pRB:#173F35;--pWR:#1E3355;--pTE:#553414;--pDST:#34363A;--pQBi:#FFC5D2;--pRBi:#9FE8CF;--pWRi:#B7D0FF;--pTEi:#FFD1A3;--pDSTi:#D8D8D8}}
:root[data-theme="dark"]{--pQB:#5A2131;--pRB:#173F35;--pWR:#1E3355;--pTE:#553414;--pDST:#34363A;--pQBi:#FFC5D2;--pRBi:#9FE8CF;--pWRi:#B7D0FF;--pTEi:#FFD1A3;--pDSTi:#D8D8D8}
.vtabs{display:flex;gap:6px;margin-left:auto} .vtabs button{font:600 15px "Barlow Condensed",sans-serif;letter-spacing:.04em;text-transform:uppercase;padding:8px 14px;border:1.5px solid var(--acc);background:transparent;color:var(--ink);cursor:pointer} .vtabs button.on{background:var(--acc);color:var(--acc-ink)} .vtabs button:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.dboard{margin-top:12px} .dbtop{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
.onclock{border:1.5px solid var(--ink);padding:4px 10px;min-width:120px} .onclock span{display:block;font:600 10.5px "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)} .onclock b{font-family:"IBM Plex Mono",monospace;font-size:13px;white-space:nowrap}
.dbtop button,.dock button{font:600 13px "Barlow Condensed",sans-serif;letter-spacing:.05em;text-transform:uppercase;padding:7px 12px;border:1.5px solid var(--ink);background:var(--card);color:var(--ink);cursor:pointer} .dbtop button:focus-visible,.dock button:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
.slotsel{font-size:13px;color:var(--mute)} .slotsel select{font:14px Barlow,sans-serif;padding:4px 6px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);margin-left:4px}
.addp{position:relative;flex:1 1 220px;min-width:200px} .addp input{width:100%;font:14px Barlow,sans-serif;padding:7px 10px;border:1.5px solid var(--ink);background:var(--card);color:var(--ink)} .addp input:focus-visible{outline:3px solid var(--acc)}
.hits{position:absolute;left:0;right:0;top:100%;z-index:30;background:var(--card);border:1.5px solid var(--ink);max-height:280px;overflow:auto} .hits button{display:flex;justify-content:space-between;gap:8px;width:100%;text-align:left;font:14px Barlow,sans-serif;padding:7px 10px;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--ink);cursor:pointer} .hits button small{color:var(--mute);white-space:nowrap} .hits button:hover,.hits button:focus{background:var(--head)}
.dbwrap{overflow-x:auto;overflow-y:auto;max-height:78vh;border:1px solid var(--line);background:var(--bg);-webkit-overflow-scrolling:touch}
table.db{border-collapse:separate;border-spacing:4px;width:max-content;min-width:100%;font-size:12px}
table.db th{position:sticky;top:0;z-index:3;background:var(--head);border:1px solid var(--line);padding:6px 6px;min-width:118px;max-width:118px;text-align:left;vertical-align:top;font:600 13px "Barlow Condensed",sans-serif;letter-spacing:.02em;cursor:pointer}
table.db th small{display:block;font:500 10.5px "IBM Plex Mono",monospace;color:var(--mute);letter-spacing:0;text-transform:none;margin-top:2px;white-space:nowrap}
table.db th.me{background:var(--t1);box-shadow:inset 0 3px 0 var(--acc)} table.db th.clock{box-shadow:inset 0 3px 0 var(--warn)}
table.db td.rd,table.db th.rd{position:sticky;left:0;z-index:4;min-width:34px;max-width:34px;width:34px;background:var(--head);text-align:center;font:600 12px "IBM Plex Mono",monospace;color:var(--mute);cursor:default;padding:0} table.db th.rd{z-index:5}
table.db td.c{height:46px;min-width:118px;max-width:118px;padding:4px 6px;vertical-align:top;background:var(--card);border:1px solid var(--line);border-radius:3px;position:relative;cursor:pointer;overflow:hidden}
table.db td.c b{display:block;font-weight:600;font-size:12.5px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis} table.db td.c small{display:block;font:500 10.5px "IBM Plex Mono",monospace;margin-top:2px;white-space:nowrap} table.db td.c i{position:absolute;right:5px;bottom:3px;font:500 10px "IBM Plex Mono",monospace;color:var(--mute);font-style:normal}
table.db td.QB{background:var(--pQB);color:var(--pQBi);border-color:transparent} table.db td.RB{background:var(--pRB);color:var(--pRBi);border-color:transparent} table.db td.WR{background:var(--pWR);color:var(--pWRi);border-color:transparent} table.db td.TE{background:var(--pTE);color:var(--pTEi);border-color:transparent} table.db td.DST{background:var(--pDST);color:var(--pDSTi);border-color:transparent}
table.db td.QB i,table.db td.RB i,table.db td.WR i,table.db td.TE i,table.db td.DST i{color:inherit;opacity:.8}
table.db td.empty{color:var(--mute);cursor:default} table.db td.empty i{color:var(--line)} table.db td.mine{box-shadow:inset 0 0 0 1px var(--acc)} table.db td.next{outline:2px dashed var(--warn);outline-offset:-2px;background:var(--t4)} table.db td.next span{font:600 11px "Barlow Condensed",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--warn)}
.legend{display:flex;flex-wrap:wrap;gap:6px 12px;margin:6px 0 0;font-size:11.5px;color:var(--mute)} .legend i{display:inline-block;width:12px;height:12px;border-radius:2px;vertical-align:-2px;margin-right:4px}
.dock{position:fixed;left:0;right:0;bottom:0;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:nowrap;padding:6px 10px;background:var(--card);border-top:2px solid var(--ink);z-index:20;box-shadow:0 -4px 12px rgba(0,0,0,.08)} .dock[hidden]{display:none} .dock div{min-width:0;flex:0 0 auto} .dock span{display:block;font:600 10px "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)} .dock b{font-family:"IBM Plex Mono",monospace;font-size:13px;white-space:nowrap}
body{padding-bottom:64px} body.boardmode .top p{display:none} body.boardmode .top{padding-bottom:6px} @media (max-width:640px){body.boardmode h1{font-size:22px}}
@media (max-width:640px){.dock{gap:6px;padding:5px 6px} .dock span{font-size:9px} .dock b{font-size:12px} .dock button{padding:6px 7px;font-size:11.5px;letter-spacing:.02em;flex:0 0 auto} .vtabs{margin-left:0} table.db th,table.db td.c{min-width:104px;max-width:104px} .dbwrap{max-height:72vh}}
.live .lgname{font:500 14px Barlow,sans-serif;color:var(--mute);margin-left:8px}
.status{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:10px}.stat{background:var(--card);border:1px solid var(--line);padding:8px 10px}.stat span{display:block;font:600 11px "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}.stat b{font:500 20px "IBM Plex Mono",monospace}.stat small{color:var(--mute)}
table.ltbl td{vertical-align:middle} table.ltbl td.act{white-space:nowrap} table.ltbl td.act button{font:600 12px "Barlow Condensed",sans-serif;letter-spacing:.05em;padding:4px 9px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer} table.ltbl td.act button.mine{border-color:var(--acc);color:var(--acc);font-weight:700} table.ltbl td.act button:focus-visible{outline:3px solid var(--acc)}
table.ltbl tr.rec1 td{background:var(--t1)} table.ltbl td.why{color:var(--mute);font-size:12px;max-width:44ch;min-width:28ch}
.roster{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}.slot{display:flex;justify-content:space-between;gap:8px;padding:5px 8px;border:1px solid var(--line);background:var(--card)}.slot span{font:600 11px "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);min-width:44px}.slot i{color:var(--mute);font-style:normal}
.plog2{font-size:12.5px;color:var(--mute);display:flex;flex-wrap:wrap;gap:4px}.plog2 button{font:12px Barlow,sans-serif;padding:2px 7px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}.plog2 button.me{border-color:var(--acc)}
.dock button.on{background:var(--ink);color:var(--bg)}
@media print{.dboard,.dock,.vtabs,.live{display:none!important} body{padding-bottom:0}}
</style>'''
LIVE_HTML=r'''<section class="live" id="live" hidden>
<div class="lhead"><div><h2>Draft Day Assistant <span class="lgname" data-t="lgname"></span></h2><p class="meta">Ranks every undrafted player by what he adds to your title odds right now, against what will still be there at your next pick. Picks logged here, on the board, or on the cheat sheet all go to the same draft.</p></div></div>
<div class="status">
<div class="stat"><span>On the clock</span><b data-t="cur">1.01</b><small data-t="curwho"></small></div>
<div class="stat"><span>Your next picks</span><b data-t="nextp">-</b><small data-t="nextp2"></small></div>
<div class="stat"><span>Projected starting ppg</span><b data-t="tppg">0</b><small>your picks + expected value of your remaining picks</small></div>
<div class="stat"><span>Est. playoffs / title</span><b data-t="odds">--</b><small>calibrated on the version-3 simulator</small></div>
</div>
<h3 class="sec">Recommended now</h3>
<div class="tools"><input type="search" data-t="lq" placeholder="Find a player" aria-label="find a player"><div class="chips" data-t="lchips"><button class="on" data-pos="ALL">All</button><button data-pos="RB">RB</button><button data-pos="WR">WR</button><button data-pos="TE">TE</button><button data-pos="QB">QB</button><button data-pos="DST">DST</button></div></div>
<div class="tw"><table class="ltbl" data-t="ltbl"><thead><tr><th></th><th>Player</th><th>Proj</th><th>Value vs next pick</th><th>Gone by next</th><th>Title Δ</th><th>Board</th><th>Room</th><th>Inj</th><th>Why</th></tr></thead><tbody></tbody></table></div>
<h3 class="sec">Your roster</h3><div class="roster" data-t="roster"></div>
<h3 class="sec">Draft log <span class="hint">tap a pick to remove it</span></h3><div class="plog2" data-t="llog"></div>
<p class="cap">Proj = projected points per game under this league's scoring (half usage-history model, half consensus curve, injury-adjusted). Value vs next pick = projected season points over the best player at the same position expected to still be there at your next pick, weighted by what your lineup still needs. Gone by next = chance the room takes him before your next turn (room-price model). Title Δ = change in championship probability from adding him now, using the slope fitted on 21 simulated rosters (about ±1 point of noise).</p>
</section>'''
LIVE_JS=r'''
<script>
(function(){
const DATA=__LIVE_DATA__;
const $=(s,r)=>(r||document).querySelector(s), $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const SL={A:{title:0.42,po:0.52,base:{ppg:105.0,title:19.8,po:93.6}},B:{title:0.42,po:1.04,base:{ppg:103.3,title:15.2,po:74.2}}};
const WAIV={A:{QB:15,RB:9.5,WR:9.5,TE:8,DST:6},B:{QB:18.5,RB:9.5,WR:9.5,TE:8,DST:6}};
const LINE=[['QB',1],['RB',2],['WR',2],['TE',1],['FLEX',2],['DST',1]];
const LGN={A:'Ratz',B:'Footborn'};
const byName={};DATA.forEach(d=>byName[d.n]=d);
const D=window.__draft; const sec=$('#live'); if(!D||!sec) return;
let lg='A';
function myPicks(slot){const out=[];for(let r=0;r<15;r++){out.push(r*10+(r%2===0?slot:11-slot))}return out}
function proj(d){return lg==='A'?d.pA:d.pB} function adp(d){return lg==='A'?d.adpA:d.adpB} function rank(d){return lg==='A'?d.rA:d.rB}
const POSMEAN={QB:3.9,RB:4.9,WR:3.8,TE:4.0,DST:0};
function avail(d){return proj(d)*(1-(0.5*Math.min(d.inj,12)+0.5*(POSMEAN[d.pos]||4))/17)} // same half-weighted injury model as the board order
function pGone(d,pick,cur){if(pick<=cur)return 0;const a=adp(d);const x=(pick-a)/6;return 1/(1+Math.exp(-x))}
function lineup(names){const ps=names.map(n=>byName[n]).filter(Boolean).sort((a,b)=>avail(b)-avail(a));const used=new Set();let t=0;const W=WAIV[lg];
 function take(ok,n){let g=0;for(const p of ps){if(used.has(p.n)||!ok.includes(p.pos))continue;used.add(p.n);t+=avail(p);g++;if(g===n)break}for(;g<n;g++)t+=W[ok[0]]}
 take(['QB'],1);take(['RB'],2);take(['WR'],2);take(['TE'],1);take(['RB','WR','TE'],2);take(['DST'],1);return t}
function expectedLineup(names,availP,cur,picks){const have=names.slice(); const future=picks.filter(p=>p>cur).slice(0,9);
 for(const p of future){let best=null,bestGain=0;const baseL=lineup(have);
  for(const pos of ['QB','RB','WR','TE','DST']){const c=availP.filter(d=>d.pos===pos&&!have.includes(d.n)&&pGone(d,p,cur)<0.5).sort((a,b)=>avail(b)-avail(a))[0];if(!c)continue;const g=lineup(have.concat([c.n]))-baseL;if(g>bestGain){bestGain=g;best=c}}
  if(best)have.push(best.n); else break}
 return lineup(have)}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function render(){
 if(sec.hidden) return;
 lg=D.curLg(); const s=D.state(lg); const slot=s.slot; const taken=s.picks.map(p=>p.name); const mine=s.picks.filter((p,i)=>D.teamOf(i+1)===slot).map(p=>p.name);
 $('[data-t="lgname"]',sec).textContent=LGN[lg]+' · slot '+slot;
 const cur=taken.length+1; const picks=myPicks(slot); const onMe=picks.includes(cur); const nxt=(onMe?picks.find(p=>p>cur):picks.find(p=>p>=cur))||151; const nxt2=picks.find(p=>p>nxt)||151;
 const slotOn=cur<=150?D.teamOf(cur):0;
 $('[data-t="cur"]',sec).textContent=cur>150?'done':D.pickLabel(cur); $('[data-t="curwho"]',sec).textContent=cur>150?'':(slotOn===slot?'YOU':D.tname(lg,slotOn));
 $('[data-t="nextp"]',sec).textContent=nxt>150?'--':(onMe?'now, then '+D.pickLabel(nxt):D.pickLabel(nxt)); $('[data-t="nextp2"]',sec).textContent=nxt2>150?'':('then '+D.pickLabel(nxt2));
 const takenSet=new Set(taken); const availP=DATA.filter(d=>!takenSet.has(d.n));
 const base=expectedLineup(mine,availP,cur,picks); $('[data-t="tppg"]',sec).textContent=base.toFixed(1);
 const S=SL[lg]; const dt=Math.max(1,Math.min(45,S.base.title+S.title*(base-S.base.ppg))); const dp=Math.max(5,Math.min(99,S.base.po+S.po*(base-S.base.ppg)));
 $('[data-t="odds"]',sec).textContent=mine.length?(dp.toFixed(0)+'% / '+dt.toFixed(1)+'%'):'--';
 const alt={};['QB','RB','WR','TE','DST'].forEach(pos=>{const c=availP.filter(d=>d.pos===pos&&pGone(d,nxt,cur)<0.5).sort((a,b)=>avail(b)-avail(a));alt[pos]=c.length?avail(c[0]):WAIV[lg][pos]});
 const cnt={};mine.forEach(n=>{const p=byName[n];if(p)cnt[p.pos]=(cnt[p.pos]||0)+1});
 const need=pos=>{const c=cnt[pos]||0;if(pos==='QB')return c===0?1:0.25;if(pos==='TE')return c===0?1:0.35;if(pos==='DST')return c===0?1:0.05;const flexOpen=2-Math.max(0,(cnt.RB||0)-2)-Math.max(0,(cnt.WR||0)-2)-Math.max(0,(cnt.TE||0)-1);if(c<2)return 1;return flexOpen>0?0.85:0.55};
 const rows=availP.map(d=>{const v=(avail(d)-alt[d.pos])*17*need(d.pos);const dtitle=S.title*(expectedLineup(mine.concat([d.n]),availP.filter(x=>x.n!==d.n),cur+1,picks)-base);return {d,v,dtitle,pg:pGone(d,nxt,cur)}});
 const pos=$('[data-t="lchips"] button.on',sec).dataset.pos; const q=$('[data-t="lq"]',sec).value.trim().toLowerCase();
 let list=rows.filter(r=>(pos==='ALL'||r.d.pos===pos)&&(!q||r.d.n.toLowerCase().includes(q)));
 list.sort((a,b)=>(b.dtitle*30+b.v*0.5)-(a.dtitle*30+a.v*0.5)); list=list.slice(0,q?15:40);
 const tb=$('[data-t="ltbl"] tbody',sec); tb.innerHTML='';
 const who=cur>150?'':(onMe?'Mine':'Taken by '+D.tname(lg,slotOn));
 list.forEach((r,i)=>{const d=r.d;const tr=document.createElement('tr');if(i===0&&!q)tr.className='rec1';
  tr.innerHTML='<td class="act"><button type="button" class="'+(onMe?'mine':'')+'">'+esc(who)+'</button></td><td class="nm"><b>'+esc(d.n)+'</b> <small>'+d.pos+' · '+esc(d.tm)+' · bye '+d.bye+'</small></td><td class="num">'+proj(d).toFixed(1)+'</td><td class="num">'+(r.v>=0?'+':'')+r.v.toFixed(0)+'</td><td class="num">'+(r.pg*100).toFixed(0)+'%</td><td class="num">'+(r.dtitle>=0?'+':'')+r.dtitle.toFixed(1)+'</td><td class="num">'+rank(d)+'</td><td class="num">'+adp(d)+'</td><td class="num">'+d.inj.toFixed(1)+'</td><td class="why">'+esc(d.note)+'</td>';
  $('button',tr).addEventListener('click',()=>{D.addByName(lg,d.n);$('[data-t="lq"]',sec).value=''});
  tb.appendChild(tr)});
 const R=$('[data-t="roster"]',sec);R.innerHTML='';const ps=mine.map(n=>byName[n]).filter(Boolean).sort((a,b)=>avail(b)-avail(a));const used=new Set();
 LINE.forEach(([sl,n])=>{for(let i=0;i<n;i++){const ok=sl==='FLEX'?['RB','WR','TE']:[sl];const p=ps.find(x=>!used.has(x.n)&&ok.includes(x.pos));if(p)used.add(p.n);const div=document.createElement('div');div.className='slot';div.innerHTML='<span>'+sl+'</span><b>'+(p?esc(p.n):'<i>open</i>')+'</b><i>'+(p?proj(p).toFixed(1):'')+'</i>';R.appendChild(div)}});
 ps.filter(p=>!used.has(p.n)).forEach(p=>{const div=document.createElement('div');div.className='slot';div.innerHTML='<span>BN</span><b>'+esc(p.n)+'</b><i>'+proj(p).toFixed(1)+'</i>';R.appendChild(div)});
 const L=$('[data-t="llog"]',sec);L.innerHTML='';s.picks.forEach((p,i)=>{const b=document.createElement('button');b.type='button';const t=D.teamOf(i+1);b.className=(t===slot?'me':'');b.textContent=D.pickLabel(i+1)+' '+D.tname(lg,t)+': '+p.name;b.title='remove';b.addEventListener('click',()=>{if(confirm('Remove '+D.pickLabel(i+1)+' '+p.name+'? Later picks move up one slot.')) D.removeByName(lg,p.name)});L.appendChild(b)});
}
$$('[data-t="lchips"] button',sec).forEach(b=>b.addEventListener('click',()=>{$$('[data-t="lchips"] button',sec).forEach(x=>x.classList.toggle('on',x===b));render()}));
$('[data-t="lq"]',sec).addEventListener('input',render);
D.on(render); render();
})();
</script>'''
import re as _re
LIVE_DATA=_re.search(r'const DATA=(\[.*?\]);\n',open('/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/draft-live.html').read(),_re.S).group(1)
EXTRA_JS=r'''
<script>
(function(){
const $=(s,r)=>(r||document).querySelector(s), $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const POS=['QB','RB','WR','TE','DST']; const STARTERS={QB:1,RB:2,WR:2,TE:1,DST:1};
let T={}; try{T=JSON.parse(localStorage.getItem('tracker')||'{}')}catch(e){T={}}
function save(){try{localStorage.setItem('tracker',JSON.stringify(T))}catch(e){}}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function teamOf(p){const r=Math.ceil(p/10), i=(p-1)%10; return r%2===1?i+1:10-i}
function pickLabel(p){const r=Math.ceil(p/10), i=(p-1)%10+1; return r+'.'+(i<10?'0':'')+i}
const PL={A:{},B:{}}; ['A','B'].forEach(lg=>{$$('#lg-'+lg+' tr.p').forEach(tr=>{const k=tr.dataset.key; if(PL[lg][k]) return; const sm=$('.nm small',tr); PL[lg][k]={key:k,name:$('.nm b',tr).textContent,pos:tr.dataset.pos,team:sm?sm.textContent.split('·')[0].trim():'',q:tr.dataset.name}})});
function state(lg){ if(!T[lg]) T[lg]={picks:[],names:{},slot:parseInt($('#db-'+lg+' select[data-t="slot"]').value,10)}; if(!T[lg].names) T[lg].names={}; return T[lg] }
function tname(lg,t){const s=state(lg); return s.names[t]||( t===s.slot?'YOU':'Team '+t )}
function counts(picks){const c={QB:0,RB:0,WR:0,TE:0,DST:0}; picks.forEach(p=>{if(c[p.pos]!==undefined)c[p.pos]++}); return c}
function needs(c){const n=[]; POS.forEach(p=>{const m=STARTERS[p]-c[p]; if(m>0) n.push(p+(m>1?'x'+m:''))}); const fl=Math.max(0,c.RB-2)+Math.max(0,c.WR-2)+Math.max(0,c.TE-1); if(fl<2) n.push('FLX'+(2-fl>1?'x2':'')); return n}
function myNext(lg,cur){const s=state(lg); for(let p=cur;p<=150;p++){ if(teamOf(p)===s.slot) return p } return null}
function render(lg){
  const s=state(lg), sec=$('#db-'+lg), picks=s.picks, cur=picks.length+1, onTeam=cur<=150?teamOf(cur):null, mn=myNext(lg,cur);
  const byTeam={}; for(let t=1;t<=10;t++) byTeam[t]=[]; picks.forEach((p,i)=>byTeam[teamOf(i+1)].push(p));
  $('[data-t="clock"]',sec).textContent=cur>150?'Draft complete':(pickLabel(cur)+' · '+tname(lg,onTeam));
  $('[data-t="mynext"]',sec).textContent=mn?(mn===cur?'ON THE CLOCK':(pickLabel(mn)+' · '+(mn-cur)+' away')):'-';
  const dock=$('.dock[data-dock="'+lg+'"]'); $('[data-t="dockpick"]',dock).textContent=cur>150?'done':pickLabel(cur); $('[data-t="dockteam"]',dock).textContent=cur>150?'-':tname(lg,onTeam); $('[data-t="docknext"]',dock).textContent=mn?(mn===cur?'NOW':pickLabel(mn)):'-';
  let h='<thead><tr><th class="rd">Rd</th>'+[1,2,3,4,5,6,7,8,9,10].map(t=>{const c=counts(byTeam[t]), nd=needs(c); return '<th class="'+(t===s.slot?'me':'')+(t===onTeam?' clock':'')+'" data-team="'+t+'" title="tap to rename">'+esc(tname(lg,t))+'<small>'+t+' · '+(nd.length?'need '+nd.join(' '):'set')+'</small></th>'}).join('')+'</tr></thead><tbody>';
  for(let r=1;r<=15;r++){h+='<tr><td class="rd">'+r+'</td>'; for(let t=1;t<=10;t++){const idx=(r%2===1)?t:11-t; const pick=(r-1)*10+idx; const p=picks[pick-1]; const cls=['c',p?p.pos:'empty',t===s.slot?'mine':'',pick===cur?'next':''].join(' ');
    h+='<td class="'+cls+'" data-pick="'+pick+'">'+(p?'<b>'+esc(p.name)+'</b><small>'+p.pos+(p.team?' · '+esc(p.team):'')+'</small>':(pick===cur?'<span>On the clock</span>':''))+'<i>'+pickLabel(pick)+'</i></td>'} h+='</tr>'}
  $('[data-t="grid"]',sec).innerHTML=h+'</tbody>';
  // keep the current pick in view
  const nx=$('td.next',sec); if(nx&&sec.offsetParent!==null){try{nx.scrollIntoView({block:'nearest',inline:'center'})}catch(e){}}
  if(typeof emit==='function') emit();
}
function setDone(lg,key,on){$$('#lg-'+lg+' tr.p[data-key="'+key+'"]').forEach(tr=>{tr.classList.toggle('done',on);const c=$('input',tr);if(c)c.checked=on}); try{const st=JSON.parse(localStorage.getItem('drafted')||'{}'); st[key]=on; localStorage.setItem('drafted',JSON.stringify(st))}catch(e){}}
function addPick(lg,key){const s=state(lg); if(s.picks.some(p=>p.key===key)) return; const inf=PL[lg][key]; if(!inf||s.picks.length>=150) return; s.picks.push({key:inf.key,name:inf.name,pos:inf.pos,team:inf.team}); save(); setDone(lg,key,true); render(lg)}
function removePick(lg,key){const s=state(lg); const i=s.picks.findIndex(p=>p.key===key); if(i<0) return; s.picks.splice(i,1); save(); setDone(lg,key,false); render(lg)}
const LIS=[]; function emit(){LIS.forEach(f=>{try{f()}catch(e){}})}
const NK={A:{},B:{}}; ['A','B'].forEach(lg=>Object.values(PL[lg]).forEach(p=>NK[lg][p.name]=p.key));
window.__draft={state,teamOf,pickLabel,tname,addByName:(lg,n)=>{const k=NK[lg][n]; if(k) addPick(lg,k)},removeByName:(lg,n)=>{const k=NK[lg][n]; if(k) removePick(lg,k)},on:f=>LIS.push(f),emit,curLg:()=>{const b=$('.tabs button.on[data-lg]'); return b?b.dataset.lg:'A'}};
function setView(v){document.body.classList.toggle('boardmode',v!=='sheet'); $$('.vtabs button').forEach(b=>b.classList.toggle('on',b.dataset.view===v)); $$('.dock button[data-view]').forEach(b=>b.classList.toggle('on',b.dataset.view===v)); $$('.league').forEach(l=>{const sh=$('.sheet',l), db=$('.dboard',l); if(sh) sh.hidden=(v!=='sheet'); if(db) db.hidden=(v!=='board')}); const lv=$('#live'); if(lv) lv.hidden=(v!=='live'); try{localStorage.setItem('view',v)}catch(e){} if(v==='board'){['A','B'].forEach(render)} emit()}
['A','B'].forEach(lg=>{
  const sec=$('#db-'+lg); if(!sec) return; const s=state(lg);
  $$('#lg-'+lg+' tr.p input').forEach(c=>c.addEventListener('change',()=>{const k=c.closest('tr').dataset.key; if(c.checked) addPick(lg,k); else removePick(lg,k)}));
  sec.addEventListener('click',e=>{
    const td=e.target.closest('td[data-pick]'); if(td){const p=parseInt(td.dataset.pick,10); const pk=s.picks[p-1]; if(pk&&confirm('Remove '+pickLabel(p)+' '+pk.name+'? Later picks move up one slot.')) removePick(lg,pk.key); return}
    const th=e.target.closest('th[data-team]'); if(th){const t=parseInt(th.dataset.team,10); const n=prompt('Name for slot '+t+' (blank = default)',s.names[t]||''); if(n!==null){ if(n.trim()) s.names[t]=n.trim(); else delete s.names[t]; save(); render(lg)} }
  });
  $('[data-t="undo"]',sec).addEventListener('click',()=>{const pk=s.picks[s.picks.length-1]; if(pk) removePick(lg,pk.key)});
  $('[data-t="clear"]',sec).addEventListener('click',()=>{if(confirm('Clear every pick in this league?')){const ks=s.picks.map(p=>p.key); s.picks=[]; save(); ks.forEach(k=>setDone(lg,k,false)); render(lg)}});
  const sel=$('select[data-t="slot"]',sec); sel.value=s.slot; sel.addEventListener('change',()=>{s.slot=parseInt(sel.value,10); save(); render(lg)});
  // quick add by name
  const q=$('[data-t="q"]',sec), hits=$('[data-t="hits"]',sec);
  function showHits(){const v=q.value.trim().toLowerCase(); if(!v){hits.hidden=true;hits.innerHTML='';return} const taken=new Set(s.picks.map(p=>p.key)); const m=Object.values(PL[lg]).filter(p=>!taken.has(p.key)&&p.q.includes(v)).slice(0,8); hits.innerHTML=m.map(p=>'<button type="button" data-key="'+esc(p.key)+'"><span>'+esc(p.name)+'</span><small>'+p.pos+(p.team?' · '+esc(p.team):'')+' → '+pickLabel(s.picks.length+1)+' '+esc(tname(lg,teamOf(s.picks.length+1)))+'</small></button>').join('')||'<button type="button" disabled>No match</button>'; hits.hidden=false}
  q.addEventListener('input',showHits); q.addEventListener('focus',showHits); q.addEventListener('keydown',e=>{if(e.key==='Enter'){const b=$('button[data-key]',hits); if(b) b.click()} if(e.key==='Escape'){hits.hidden=true}});
  hits.addEventListener('click',e=>{const b=e.target.closest('button[data-key]'); if(!b) return; addPick(lg,b.dataset.key); q.value=''; hits.hidden=true; q.focus()});
  document.addEventListener('click',e=>{if(!sec.contains(e.target)) hits.hidden=true});
  s.picks.forEach(p=>setDone(lg,p.key,true));
  render(lg);
});
$$('.vtabs button').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
$$('.dock button[data-view]').forEach(b=>b.addEventListener('click',()=>{setView(b.dataset.view); try{window.scrollTo({top:0})}catch(e){}}));
function syncDock(){$$('.dock').forEach(d=>{const lg=d.dataset.dock; const l=document.getElementById('lg-'+lg); d.hidden=!l||l.hidden})}
$$('.tabs button[data-lg]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{syncDock();['A','B'].forEach(render);emit()},0))); syncDock();
try{const v=localStorage.getItem('view'); if(v==='board'||v==='live') setView(v)}catch(e){}
})();
</script>'''
page=f'''<title>{esc(plan['title'])}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{{--bg:#FBFAF6;--ink:#16191D;--mute:#646B73;--line:#DCD9D0;--acc:#1E7A4B;--acc-ink:#fff;--t1:#DDEFE4;--t2:#E9F3EC;--t3:#F3F1E6;--t4:#F6EDDC;--t5:#F7E6DA;--t6:#F1F0EC;--card:#FFFFFF;--warn:#B4541B;--strike:#9AA0A6;--head:#F1EFE7}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#121417;--ink:#ECEDE9;--mute:#9BA3AB;--line:#2C3136;--acc:#4CC38A;--acc-ink:#0F1512;--t1:#173327;--t2:#152A22;--t3:#26261C;--t4:#2E261A;--t5:#33221A;--t6:#1D2024;--card:#181B1F;--warn:#E5905A;--strike:#5C646C;--head:#1B1F24}}}}
:root[data-theme="dark"]{{--bg:#121417;--ink:#ECEDE9;--mute:#9BA3AB;--line:#2C3136;--acc:#4CC38A;--acc-ink:#0F1512;--t1:#173327;--t2:#152A22;--t3:#26261C;--t4:#2E261A;--t5:#33221A;--t6:#1D2024;--card:#181B1F;--warn:#E5905A;--strike:#5C646C;--head:#1B1F24}}
*{{box-sizing:border-box}} body{{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 Barlow,system-ui,sans-serif}}
.wrap{{max-width:1100px;margin:0 auto;padding:16px 14px 60px}}
h1,h2,h3,h4{{font-family:"Barlow Condensed",Barlow,sans-serif;letter-spacing:.01em;text-wrap:balance;margin:0}}
h1{{font-size:34px;font-weight:700;line-height:1}} h2{{font-size:26px;font-weight:700}} h3{{font-size:20px;font-weight:600;margin:22px 0 8px}} h4{{font-size:16px;font-weight:600;margin:0 0 6px}}
.top{{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;justify-content:space-between;border-bottom:2px solid var(--ink);padding-bottom:10px}}
.top p{{margin:4px 0 0;color:var(--mute);max-width:64ch}}
.tabs{{display:flex;gap:6px}} .tabs button{{font:600 15px "Barlow Condensed",sans-serif;letter-spacing:.04em;text-transform:uppercase;padding:8px 14px;border:1.5px solid var(--ink);background:transparent;color:var(--ink);cursor:pointer}} .tabs button.on{{background:var(--ink);color:var(--bg)}} .tabs button:focus-visible{{outline:3px solid var(--acc);outline-offset:2px}}
.lhead{{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;align-items:flex-start;margin-top:16px}} .meta{{color:var(--mute);margin:2px 0 0;max-width:70ch}}
.pickbox{{border:1.5px solid var(--ink);padding:6px 10px;font-family:"IBM Plex Mono",monospace;font-size:12.5px}} .pickbox span{{display:block;font:600 11px "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}}
.thesis{{background:var(--card);border-left:4px solid var(--acc);padding:10px 14px;margin-top:14px}} .thesis ol{{margin:6px 0 0;padding-left:20px}} .thesis li{{margin:4px 0;max-width:80ch}}
.sec .hint{{font:500 12px Barlow,sans-serif;color:var(--mute);margin-left:8px;letter-spacing:0}}
.tw{{overflow-x:auto;border:1px solid var(--line);background:var(--card)}}
table{{border-collapse:collapse;width:100%;font-size:13px}} th{{font:600 11.5px "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;text-align:left;padding:6px 8px;background:var(--head);border-bottom:1px solid var(--line);position:sticky;top:0}}
td{{padding:5px 8px;border-bottom:1px solid var(--line);vertical-align:top}} .num{{font-family:"IBM Plex Mono",monospace;font-variant-numeric:tabular-nums;white-space:nowrap;font-size:12.5px}}
.nm b{{font-weight:600}} .nm small{{color:var(--mute);white-space:nowrap}} .us{{white-space:nowrap;font-family:"IBM Plex Mono",monospace;font-size:12px;color:var(--mute)}}
.note{{color:var(--mute);min-width:26ch;max-width:60ch;font-size:12.5px}}
tr.tier td{{background:var(--t3);font:600 13px "Barlow Condensed",sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:5px 8px}} tr.tier td span{{font-family:Barlow,sans-serif;font-weight:500;text-transform:none;letter-spacing:0;color:var(--mute);margin-left:8px}}
tr.t1 td{{background:var(--t1)}} tr.t2 td{{background:var(--t2)}} tr.t3 td{{background:var(--t3)}} tr.t4 td{{background:var(--t4)}} tr.t5 td{{background:var(--t5)}} tr.t6 td{{background:var(--t6)}}
tr.p.done td{{color:var(--strike)}} tr.p.done .nm b,tr.p.done .note{{text-decoration:line-through;color:var(--strike)}}
.ck{{width:28px}} .ck input{{width:16px;height:16px;accent-color:var(--acc);cursor:pointer}}
table.plan td.tg{{font-weight:500;min-width:28ch}} table.plan td.fb{{color:var(--mute);min-width:20ch}} table.plan td.rule{{color:var(--mute);min-width:24ch;font-size:12.5px}}
.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin-top:14px}} .card{{background:var(--card);border:1px solid var(--line);padding:10px 12px}} .card ul{{margin:0;padding-left:18px}} .card li{{margin:3px 0;font-size:13px}}
.tools{{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 8px}} .tools input{{font:14px Barlow,sans-serif;padding:6px 10px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);min-width:220px}} .tools input:focus-visible{{outline:3px solid var(--acc)}}
.chips{{display:flex;gap:4px;flex-wrap:wrap}} .chips button{{font:600 12px "Barlow Condensed",sans-serif;letter-spacing:.06em;padding:5px 10px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}} .chips button.on{{background:var(--acc);color:var(--acc-ink);border-color:var(--acc)}}
.pos h3{{margin-top:18px}} .pos[hidden]{{display:none}}
.evid{{margin-top:30px;border-top:2px solid var(--ink);padding-top:10px}} .evid h4{{margin-top:16px}} .cap{{color:var(--mute);margin:0 0 6px;font-size:12.5px;max-width:80ch}} ul.ev li{{margin:4px 0;max-width:90ch;font-size:13px}} table.ev{{font-size:12.5px}}
.foot{{color:var(--mute);font-size:12px;margin-top:24px;max-width:90ch}}
@media (max-width:640px){{.note{{min-width:22ch}} h1{{font-size:28px}} td,th{{padding:4px 6px}}}}
@media print{{body{{font-size:10px;background:#fff;color:#000}} .wrap{{max-width:none;padding:0}} .tabs,.tools,.hint,.evid,.noprint{{display:none!important}} .tw{{overflow:visible;border:none}} table{{font-size:9.5px}} td,th{{padding:2px 4px}} th{{position:static}} .note{{max-width:44ch}} .league[hidden]{{display:none}} tr.tier td{{-webkit-print-color-adjust:exact;print-color-adjust:exact}} h3{{margin:10px 0 4px;page-break-after:avoid}} .pos{{page-break-inside:auto}} .cards{{grid-template-columns:repeat(3,1fr)}} .ck{{width:14px}} .ck input{{width:10px;height:10px}}}}
@media (prefers-reduced-motion:no-preference){{tr.p td{{transition:color .15s}}}}
</style>
<div class="wrap">
<header class="top"><div><h1>{esc(plan['title'])}</h1><p>{esc(plan['subtitle'])}</p></div>
<nav class="tabs" aria-label="league"><button class="on" data-lg="A">Ratz · pick 2</button><button data-lg="B">Footborn · pick 4</button></nav><nav class="vtabs" aria-label="view"><button class="on" data-view="sheet">Cheat sheet</button><button data-view="board">Draft board</button><button data-view="live">Assistant</button></nav></header>
{league('A')}{league('B')}
__LIVE_HTML__
<section class="evid"><h2>Evidence appendix</h2>{evidence()}</section>
<p class="foot">{esc(plan['footer'])}</p>
</div>
<script>
(function(){{
const $=(s,r)=>(r||document).querySelector(s), $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
let store={{}}; try{{store=JSON.parse(localStorage.getItem('drafted')||'{{}}')}}catch(e){{store={{}}}}
function save(){{try{{localStorage.setItem('drafted',JSON.stringify(store))}}catch(e){{}}}}
function applyKey(k,on){{$$('tr.p[data-key="'+k+'"]').forEach(tr=>{{tr.classList.toggle('done',on);const c=$('input',tr);if(c)c.checked=on}})}}
Object.keys(store).forEach(k=>applyKey(k,!!store[k]));
$$('tr.p input').forEach(c=>c.addEventListener('change',e=>{{const k=c.closest('tr').dataset.key;store[k]=c.checked;save();applyKey(k,c.checked)}}));
$$('.tabs button').forEach(b=>b.addEventListener('click',()=>{{$$('.tabs button').forEach(x=>x.classList.toggle('on',x===b));$$('.league').forEach(l=>l.hidden=(l.id!=='lg-'+b.dataset.lg));try{{localStorage.setItem('tab',b.dataset.lg)}}catch(e){{}}}}));
try{{const t=localStorage.getItem('tab');if(t){{const b=$('.tabs button[data-lg="'+t+'"]');if(b)b.click()}}}}catch(e){{}}
$$('.chips').forEach(ch=>{{const lg=ch.dataset.chips;$$('button',ch).forEach(b=>b.addEventListener('click',()=>{{$$('button',ch).forEach(x=>x.classList.toggle('on',x===b));const p=b.dataset.pos;$$('#lg-'+lg+' .pos').forEach(s=>s.hidden=(p!=='ALL'&&!s.id.endsWith('-'+p)))}}))}});
$$('input[data-search]').forEach(inp=>inp.addEventListener('input',()=>{{const q=inp.value.trim().toLowerCase();$$('#lg-'+inp.dataset.search+' tr.p').forEach(tr=>{{tr.style.display=(!q||tr.dataset.name.includes(q))?'':'none'}})}}));
}})();
</script>'''
page=page.replace('__LIVE_HTML__',LIVE_HTML).replace('__LIVE_DATA__',LIVE_DATA)
page=page.replace('</style>\n<div class="wrap">', '</style>'+EXTRA_CSS+'\n<div class="wrap">',1)+EXTRA_JS+LIVE_JS.replace('__LIVE_DATA__',LIVE_DATA)
open(OUT,'w').write(page)
print('wrote',OUT,len(page))

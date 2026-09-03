import pandas as pd, json
O='/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/build/'
plan=json.load(open(O+'plan_final.json')); tiers=json.load(open(O+'tiers.json'))
def i0(x):
    try: return '' if pd.isna(x) else str(int(float(x)))
    except: return ''
def f1(x):
    try: return '' if pd.isna(x) else f"{float(x):.1f}"
    except: return ''
out=[f"# {plan['title']}\n\n{plan['subtitle']}\n\n> Live, tap-to-strike version: see the published artifact link in the PR/README. PDFs: `ratz-pick2.pdf`, `footborn-pick4.pdf`.\n"]
for lg in 'AB':
    L=plan['leagues'][lg]; b=pd.read_csv(O+f'board_{lg}.csv'); ppg='ppgA_25' if lg=='A' else 'ppgB_25'
    out.append(f"\n---\n\n## {L['name']}\n\n{L['meta']}\n\n**Your picks:** {L['picks']}\n\n### Game plan\n")
    out+= [f"{i+1}. {t}" for i,t in enumerate(L['thesis'])]
    out.append("\n### Round by round\n\n| Rd | Pick | Targets, in order | If they are gone | Rule |\n|---|---|---|---|---|")
    out+= [f"| R{r['round']} | {r['pick']} | {r['targets']} | {r['fallback']} | {r['rule']} |" for r in plan['rounds'][lg]]
    for title,items in plan['lists'][lg]:
        out.append(f"\n### {title}\n"); out+=[f"- {i}" for i in items]
    out.append("\n### Rankings by position\n\nECR = expert consensus rank (Aug 28). Room = estimated pick where an ESPN cheat-sheet room takes him. ppg = 2025 points per game under this league's scoring.\n")
    for pos in ['RB','WR','TE','QB','DST']:
        tl=tiers.get(lg,{}).get(pos) or tiers['shared'][pos]
        out.append(f"\n#### {pos}\n\n| # | Player | Team | Bye | ECR | Room | 25 ppg | G | Why |\n|---|---|---|---|---|---|---|---|---|")
        for ti,(label,names) in enumerate(tl):
            out.append(f"| | **Tier {ti+1}: {label}** | | | | | | | |")
            for n in names:
                r=b[b.player==n]
                if r.empty: continue
                r=r.iloc[0]
                out.append(f"| {int(r['rank'])} | {n} | {r.team_26} | {i0(r.bye)} | {i0(r.ecr_ovr)} | {i0(r.espn_adp)} | {f1(r[ppg])} | {i0(r.g_25)} | {str(r.note).replace('|','/')} |")
    out.append("\n### Overall top 150\n\n| # | Player | Pos | Team | Bye | ECR | Room | 25 ppg |\n|---|---|---|---|---|---|---|---|")
    for _,r in b.head(150).iterrows():
        out.append(f"| {int(r['rank'])} | {r.player} | {r.pos}{int(r.pos_rank)} | {r.team_26} | {i0(r.bye)} | {i0(r.ecr_ovr)} | {i0(r.espn_adp)} | {f1(r[ppg])} |")
out.append("\n---\n\n## Evidence appendix\n")
for sec in plan['evidence']:
    out.append(f"\n### {sec['title']}\n")
    if sec['type']=='table':
        if sec.get('caption'): out.append(sec['caption']+"\n")
        out.append('| '+' | '.join(sec['header'])+' |'); out.append('|'+'---|'*len(sec['header']))
        out+=['| '+' | '.join(str(c) for c in row)+' |' for row in sec['rows']]
    else:
        out+=[f"- {i}" for i in sec['items']]
out.append(f"\n---\n\n{plan['footer']}\n")
open(O+'DRAFT-BOARD.md','w').write('\n'.join(out)); print('md ok', sum(len(x) for x in out))

export const meta = {
  name: 'nacua-offer-review',
  description: 'Evaluate Daoud offer (Javonte + Tyson + M. Wilson for injured Nacua) and counters under injury scenarios, then adversarially verify',
  phases: [
    { title: 'Gather', detail: 'Nacua injury (2 angles), incoming players, counter targets' },
    { title: 'Value', detail: 'rest-of-season lineup model under Nacua injury scenarios' },
    { title: 'Verify', detail: 'injury, roster-fit and would-Daoud-accept skeptics' },
  ],
}
const D = args.dir
const CONTEXT = `Context: today is Friday Oct 23, 2026, NFL Week 7 (Thu Oct 22 through Mon Oct 26). Fantasy league: 10 teams, ESPN, full PPR, 6-pt passing TDs, lineup QB, 2 RB, 2 WR, TE, 2 FLEX (RB/WR/TE), DST; 6 of 10 make playoffs; regular season Weeks 1-14, playoffs Weeks 15-17. The user (team 'Stairway to 9 (wins)', manager Jamal) received this offer from manager Daoud ('Likely to Cook'), expiring Sat Oct 24 7:09 PM ET: Jamal gives Puka Nacua (WR, LAR); Jamal gets Javonte Williams (RB, DAL), Jordyn Tyson (WR, NO, rookie, hamstring IR since August), Michael Wilson (WR, ARI). The user says Nacua 'got hurt in practice' this week. Only WebSearch works for the web (WebFetch/curl to news sites are blocked). Never invent a fact, date or number; write 'not found' when results don't show it. Ignore 2025-or-earlier articles about earlier Nacua injuries unless clearly labeled as history. Record source and date for every claim.`

const NEWS = { type: 'object', properties: {
  items: { type: 'array', items: { type: 'object', properties: {
    player: { type: 'string' }, claim: { type: 'string' }, source: { type: 'string' }, date: { type: 'string' }, url: { type: 'string' } },
    required: ['player', 'claim', 'source', 'date'] } },
  summary: { type: 'string' },
  timeline_estimate: { type: 'string' },
  not_found: { type: 'array', items: { type: 'string' } } }, required: ['items', 'summary', 'not_found'] }

phase('Gather')
const [nacNews, nacMed, incoming, counters] = await parallel([
  () => agent(`${CONTEXT}\n\nTask: find exactly what happened to Puka Nacua in Rams practice this week (Oct 21-23, 2026): which body part, how it happened, practice participation each day (Wed/Thu/Fri), official Week 7 game status vs the Raiders, any MRI or imaging result, quotes from Sean McVay, and reports from Adam Schefter, Ian Rapoport, Tom Pelissero, Jourdan Rodrigue, ESPN, NFL.com, therams.com. Also confirm his earlier 2026 history (hip/groin in September, missed Weeks 2-3) and his Weeks 4-6 production. Run at least 20 WebSearch queries, rephrasing when results come back empty. Put the best-supported expected timeline in timeline_estimate with sources.`, { label: 'nacua:news', phase: 'Gather', schema: NEWS }),
  () => agent(`${CONTEXT}\n\nTask: find injury-analyst and fantasy-site assessments of Puka Nacua's new practice injury this week (Oct 21-23, 2026): Fantasy Doctors / Edwin Porras, Jeff Mueller, SIC Score / Deepak Chona, FantasyPros injury updates, RotoWire, Rotoballer, CBS, PFN, Underdog news. Capture: diagnosis if known, typical return timeline for that injury, re-injury risk given his September hip/groin issue, and whether experts advise holding or selling. Run at least 15 WebSearch queries. Put a range like '0-1 weeks / 2-4 weeks / 6+ weeks' with the evidence in timeline_estimate.`, { label: 'nacua:medical', phase: 'Gather', schema: NEWS }),
  () => agent(`${CONTEXT}\n\nTask: assess the three incoming players as of Oct 23, 2026. (1) Javonte Williams (DAL): Week 7 status, any injury, carries/targets trend Weeks 1-6, snap share, goal-line role, backup competition, Dallas QB situation. (2) Jordyn Tyson (NO, rookie WR, No. 8 overall pick): hamstring IR since late August; has he been designated to return, is he practicing, expected debut week, expected role with Olave and Vele. (3) Michael Wilson (ARI WR): Week 7 status, target share, role vs Marvin Harrison Jr. and Trey McBride, any injury. Also note rest-of-season outlook from any source. Run at least 18 WebSearch queries.`, { label: 'incoming:3-players', phase: 'Gather', schema: NEWS }),
  () => agent(`${CONTEXT}\n\nTask: Daoud's roster as of late September included Lamar Jackson, James Cook III, Saquon Barkley, Javonte Williams, Chris Olave, Terry McLaurin, Chris Godwin Jr., Michael Wilson, Isaiah Likely, KC Concepcion, Blake Corum, Caleb Douglas, Tank Bigsby, Jordyn Tyson. For counter-offer planning, find the current (Oct 21-23, 2026) health and role news for: Chris Olave, James Cook III, Saquon Barkley, Terry McLaurin, Chris Godwin Jr., Blake Corum, KC Concepcion, Isaiah Likely, and Lamar Jackson (ankle, missed Weeks 5-6). Note anyone injured, benched, or traded. Run at least 15 WebSearch queries.`, { label: 'counters:daoud-roster-news', phase: 'Gather', schema: NEWS }),
])
log('Gather done: ' + [nacNews, nacMed, incoming, counters].map(x => x ? 'ok' : 'FAILED').join(', '))

phase('Value')
const VAL = { type: 'object', properties: {
  method: { type: 'string' },
  ppg_inputs: { type: 'array', items: { type: 'object', properties: { player: { type: 'string' }, ros_ppg: { type: 'number' }, basis: { type: 'string' } }, required: ['player', 'ros_ppg', 'basis'] } },
  scenarios: { type: 'array', items: { type: 'object', properties: {
    option: { type: 'string' }, nacua_weeks_missed: { type: 'string' }, lineup_ppg_wk8_14: { type: 'number' }, lineup_ppg_wk15_17: { type: 'number' }, delta_vs_hold_wk8_14: { type: 'number' }, delta_vs_hold_wk15_17: { type: 'number' } },
    required: ['option', 'nacua_weeks_missed', 'lineup_ppg_wk8_14', 'lineup_ppg_wk15_17', 'delta_vs_hold_wk8_14', 'delta_vs_hold_wk15_17'] } },
  breakeven: { type: 'string' },
  recommendation: { type: 'string' },
  counter_ranking: { type: 'array', items: { type: 'object', properties: { option: { type: 'string' }, why: { type: 'string' }, daoud_acceptance: { type: 'string' } }, required: ['option', 'why', 'daoud_acceptance'] } },
  script_path: { type: 'string' } }, required: ['method', 'ppg_inputs', 'scenarios', 'breakeven', 'recommendation', 'counter_ranking'] }

const ev = JSON.stringify({ nacua_news: nacNews, nacua_medical: nacMed, incoming, counter_targets: counters })
const valued = await agent(`${CONTEXT}

Evidence from other agents (JSON): ${ev}

Local data (read with Bash/python; pandas is installed): ${D}/raw/ecr.csv (FantasyPros consensus scraped 2026-10-16; use fp_page '/nfl/rankings/ros-ppr-wr.php', '/nfl/rankings/ros-ppr-rb.php', '/nfl/rankings/ros-ppr-te.php', '/nfl/rankings/ros-qb.php' for rest-of-season positional ranks), ${D}/raw/stats_wk.csv (nflverse weekly stats Weeks 1-6, 2026), ${D}/raw/snaps.csv, ${D}/raw/ep.csv (expected fantasy points), ${D}/raw/games.csv (schedule; byes: LA wk11, DAL wk14, NO wk8, ARI wk14).

Jamal's roster (ASSUMED from last known state, Sept 23; state this assumption): QB Brock Purdy, Kyler Murray; RB Chase Brown, Kyren Williams, Jadarian Price, Emanuel Wilson; WR Puka Nacua, George Pickens, Carnell Tate, Devaughn Vele, Dontayvion Wicks, Romeo Doubs; TE Harold Fannin Jr., Kyle Pitts; DST 49ers. The user has said Carnell Tate is not a startable player; cap Tate at 9 ppg.

Build a transparent rest-of-season model in Python, save it under ${D}/work/, and run it:
1. Per-player rest-of-season PPR points per game: map each player's ROS positional ECR to points per game using a curve fitted from 2026 Weeks 1-6 actual PPR points per game by position rank (players with >=3 games), blended 50/50 with that player's own expected points per game (ep.csv) where available. Jordyn Tyson: 0 until his realistic return week from the evidence, then a rookie WR3 estimate you justify. Apply byes.
2. Each week 8-17, Jamal's best legal lineup points (QB, 2RB, 2WR, TE, 2FLEX). Compare HOLD Nacua vs each option, with Nacua missing 1, 2, 4, 6 and 10 more weeks (and a 'most likely' scenario from the evidence). Report average lineup points per week for Weeks 8-14 and 15-17 and the delta vs HOLD.
3. Options to evaluate: (a) accept as offered: Javonte + Tyson + M. Wilson; (b) Javonte + M. Wilson + Blake Corum; (c) Javonte + M. Wilson (2-for-1); (d) Javonte + Chris Olave; (e) Chris Olave straight up; (f) James Cook + M. Wilson; (g) Javonte + M. Wilson + Terry McLaurin. A 3-for-1 forces 2 drops: drop the two lowest-value bench players (likely Emanuel Wilson and Romeo Doubs or Kyler Murray); state which.
4. breakeven: how many weeks Nacua must miss for option (a) to beat HOLD.
5. counter_ranking: order the counters by value to Jamal, and for each say how likely Daoud is to accept, based on what Daoud said earlier: he wants WRs, said 'no running backs' when asked what interested him, treats Olave, Cook and Lamar as untouchable, and called McLaurin dead weight.
Report numbers honestly, including if the answer is 'hold'.`, { label: 'value:ros-model', phase: 'Value', schema: VAL })

phase('Verify')
const VER = { type: 'object', properties: {
  issues: { type: 'array', items: { type: 'object', properties: { topic: { type: 'string' }, problem: { type: 'string' }, correction: { type: 'string' }, severity: { type: 'string' }, evidence: { type: 'string' } }, required: ['topic', 'problem', 'correction', 'severity'] } },
  verdict: { type: 'string' },
  best_action: { type: 'string' } }, required: ['issues', 'verdict', 'best_action'] }
const valText = JSON.stringify(valued)
const LENSES = [
  { k: 'injury', p: `LENS: the Nacua injury. Re-check with WebSearch (at least 12 queries) what the injury is and how long he is likely out. Try to REFUTE the timeline the model used. If the injury is minor (expected to miss 0-1 games), say so plainly, because then selling is selling low. If it is serious, say so.` },
  { k: 'fit', p: `LENS: roster fit and math. Read ${D}/work/ and the data files. Re-run or re-derive the key numbers. Check: are the ppg inputs reasonable (e.g., Javonte RB10 ROS, Wilson WR22 ROS, Nacua WR4 ROS), are byes applied, is the 3-for-1 drop handled, is Tyson's return modeled honestly, does the lineup actually start the new players over current ones. Try to REFUTE the recommendation.` },
  { k: 'daoud', p: `LENS: would Daoud accept each counter, and what is he thinking. He sent this offer the day Nacua got hurt, which suggests he is buying low. He told Jamal he wants 'good WRs, no running backs', and he values Olave above Pickens. Rank the counters by probability of acceptance AND value to Jamal, and propose the exact counter message. Try to REFUTE the counter ranking.` },
]
const verdicts = await parallel(LENSES.map(l => () => agent(`${CONTEXT}\n\nModel result to review:\n${valText}\n\nGathered evidence:\n${ev}\n\n${l.p}\nCite evidence for each issue.`, { label: 'verify:' + l.k, phase: 'Verify', schema: VER })))

return { valued, verdicts: verdicts.map((v, i) => ({ lens: LENSES[i].k, v })), gathered: { nacNews, nacMed, incoming, counters } }

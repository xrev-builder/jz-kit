export const meta = {
  name: 'week7-te-rankings',
  description: 'Rank Week 7 TEs from consensus, Vegas props, usage, matchup and injury news, then adversarially verify',
  phases: [
    { title: 'Gather', detail: 'consensus ranks, Vegas props, injury news (6 agents, different sources)' },
    { title: 'Rank', detail: 'blend everything into a projected-points ranking with tiers' },
    { title: 'Verify', detail: '3 skeptics with different lenses try to refute the ranking' },
  ],
}

const TABLE = args.table_path
const CONTEXT = `Context: today is Wednesday Oct 21, 2026. NFL Week 7 runs Thu Oct 22 (NE at CHI) through Mon Oct 26 (DAL at PHI). Byes this week: BUF, JAX, LAC, WAS (so Dalton Kincaid, Brenton Strange, David Njoku, Chig Okonkwo are on bye). Fantasy scoring: full PPR (1 per catch, 0.1 per yard, 6 per TD), no TE premium. In this environment ONLY WebSearch works; WebFetch and curl are blocked for news, fantasy and sportsbook sites, so do not try them. Never invent a number, odds, rank or status: if a search result does not show it, write "not found". Always record the source name and the date shown for every item, and prefer items dated Oct 19-21, 2026. Ignore results from 2025 or earlier seasons (check the year).`
const TES = 'Brock Bowers (LV), Isaiah Likely (NYG), Trey McBride (ARI), Sam LaPorta (DET), George Kittle (SF), Tyler Warren (IND), Mike Gesicki (CIN), Travis Kelce (KC), Dallas Goedert (PHI), Juwan Johnson (NO), Pat Freiermuth (PIT), Tyler Higbee (LAR), Michael Mayer (LV), T.J. Hockenson (MIN), Tucker Kraft (GB), Dalton Schultz (HOU), Harold Fannin Jr. (CLE), Hunter Henry (NE), Kyle Pitts (ATL), Mark Andrews (BAL), Colston Loveland (CHI), Jake Ferguson (DAL), Tommy Tremble (CAR), Darren Waller (CAR), Cade Otton (TB), Greg Dulcich (MIA), Kenyon Sadiq (NYJ), AJ Barner (SEA), Terrance Ferguson (LAR)'
const TES_A = 'Brock Bowers, Isaiah Likely, Trey McBride, Sam LaPorta, George Kittle, Tyler Warren, Mike Gesicki, Travis Kelce, Dallas Goedert, Juwan Johnson, Pat Freiermuth, Tyler Higbee, Michael Mayer, T.J. Hockenson, Tucker Kraft'
const TES_B = 'Dalton Schultz, Harold Fannin Jr., Hunter Henry, Kyle Pitts, Mark Andrews, Colston Loveland, Jake Ferguson, Tommy Tremble, Darren Waller, Cade Otton, Greg Dulcich, Kenyon Sadiq, AJ Barner, Terrance Ferguson, Noah Fant'

const RANK_SCHEMA = { type: 'object', properties: {
  sources: { type: 'array', items: { type: 'object', properties: {
    source: { type: 'string' }, date: { type: 'string' }, url: { type: 'string' },
    ranks: { type: 'array', items: { type: 'object', properties: { rank: { type: 'number' }, player: { type: 'string' } }, required: ['rank', 'player'] } } },
    required: ['source', 'date', 'ranks'] } },
  notes: { type: 'string' } }, required: ['sources', 'notes'] }
const PROP_SCHEMA = { type: 'object', properties: {
  props: { type: 'array', items: { type: 'object', properties: {
    player: { type: 'string' }, market: { type: 'string' }, line_or_odds: { type: 'string' }, book: { type: 'string' }, date: { type: 'string' }, url: { type: 'string' } },
    required: ['player', 'market', 'line_or_odds', 'book', 'date'] } },
  game_lines: { type: 'array', items: { type: 'object', properties: { game: { type: 'string' }, spread: { type: 'string' }, total: { type: 'string' }, source: { type: 'string' }, date: { type: 'string' } }, required: ['game', 'source'] } },
  not_found: { type: 'array', items: { type: 'string' } } }, required: ['props', 'not_found'] }
const NEWS_SCHEMA = { type: 'object', properties: {
  players: { type: 'array', items: { type: 'object', properties: {
    player: { type: 'string' }, team: { type: 'string' }, week7_status: { type: 'string' }, practice: { type: 'string' },
    role_news: { type: 'string' }, qb_situation: { type: 'string' }, source: { type: 'string' }, date: { type: 'string' } },
    required: ['player', 'week7_status', 'role_news', 'source', 'date'] } },
  notes: { type: 'string' } }, required: ['players', 'notes'] }

phase('Gather')
const gathered = await parallel([
  () => agent(`${CONTEXT}\n\nTask: find WEEK 7 2026 full-PPR TE rankings from FantasyPros (expert consensus), ESPN (Mike Clay / Field Yates / aggregate), and Yahoo. Run at least 15 WebSearch queries, rephrasing when a query returns nothing (try "Week 7 TE rankings 2026", "Week 7 tight end rankings PPR", site names, analyst names). For each source, record the ordered top 20 TEs exactly as shown in results. If a source only shows part of the list, record the part you can see. Return sources with date and url.`, { label: 'ranks:FP-ESPN-Yahoo', phase: 'Gather', schema: RANK_SCHEMA }),
  () => agent(`${CONTEXT}\n\nTask: find WEEK 7 2026 full-PPR TE rankings from Pro Football Network (Katz), CBS Sports (Jamey Eisenberg / Dave Richard), NBC Sports / Rotoworld, RotoBaller, Footballguys, Sporting News, and Draft Sharks. Run at least 15 WebSearch queries, rephrasing when a query returns nothing. For each source, record the ordered top 20 TEs exactly as shown. Partial lists are fine. Return sources with date and url.`, { label: 'ranks:PFN-CBS-NBC-other', phase: 'Gather', schema: RANK_SCHEMA }),
  () => agent(`${CONTEXT}\n\nTask: find WEEK 7 2026 ANYTIME TOUCHDOWN odds for these tight ends: ${TES}. Run at least 20 WebSearch queries (e.g. "<player> anytime touchdown odds Week 7", "<team> vs <opp> player props Week 7", "Week 7 TE touchdown props", "<game> anytime TD scorer odds"). Also record current game spread and total for each Week 7 game you see. Record each line with book and date. List players with no odds found in not_found.`, { label: 'vegas:TD-odds', phase: 'Gather', schema: PROP_SCHEMA }),
  () => agent(`${CONTEXT}\n\nTask: find WEEK 7 2026 RECEIVING YARDS and RECEPTIONS prop lines (over/under) for these tight ends: ${TES}. Run at least 20 WebSearch queries (e.g. "<player> receiving yards prop Week 7", "<game> player props", "best TE props Week 7 2026"). Record each line with book and date. List players with nothing found in not_found.`, { label: 'vegas:yards-receptions', phase: 'Gather', schema: PROP_SCHEMA }),
  () => agent(`${CONTEXT}\n\nTask: for each of these tight ends, find the Week 7 injury status, Wednesday practice participation if reported, and any role news (traded, demoted, new starter at QB, teammate injury that raises or lowers targets, snap share trend): ${TES_A}. Run at least 15 WebSearch queries. If a player has no injury listing, say "no injury designation found". Note the starting QB for his team this week if there is a QB change or injury.`, { label: 'news:TE-group-A', phase: 'Gather', schema: NEWS_SCHEMA }),
  () => agent(`${CONTEXT}\n\nTask: for each of these tight ends, find the Week 7 injury status, Wednesday practice participation if reported, and any role news (traded, demoted, new starter at QB, teammate injury that raises or lowers targets, snap share trend): ${TES_B}. Run at least 15 WebSearch queries. If a player has no injury listing, say "no injury designation found". Note the starting QB for his team this week if there is a QB change or injury.`, { label: 'news:TE-group-B', phase: 'Gather', schema: NEWS_SCHEMA }),
])
const [rA, rB, tdOdds, ydProps, newsA, newsB] = gathered
const got = gathered.map(x => x ? 'ok' : 'FAILED')
log(`Gather results: ${got.join(', ')}`)

phase('Rank')
const RANKING_SCHEMA = { type: 'object', properties: {
  method: { type: 'string' },
  ranking: { type: 'array', items: { type: 'object', properties: {
    rank: { type: 'number' }, player: { type: 'string' }, team: { type: 'string' }, opp: { type: 'string' },
    tier: { type: 'string' }, proj_points: { type: 'number' }, floor: { type: 'number' }, ceiling: { type: 'number' },
    consensus_avg_rank: { type: 'string' }, td_prob: { type: 'string' }, implied_total: { type: 'string' },
    status: { type: 'string' }, why: { type: 'string' }, risk: { type: 'string' } },
    required: ['rank', 'player', 'team', 'tier', 'proj_points', 'why', 'status'] } },
  excluded: { type: 'array', items: { type: 'object', properties: { player: { type: 'string' }, reason: { type: 'string' } }, required: ['player', 'reason'] } },
  data_gaps: { type: 'string' } }, required: ['method', 'ranking', 'excluded', 'data_gaps'] }

const evidence = JSON.stringify({ consensus_ranks_1: rA, consensus_ranks_2: rB, td_odds: tdOdds, yards_receptions_props: ydProps, news_A: newsA, news_B: newsB })
const ranked = await agent(`${CONTEXT}

You are building the Week 7 TE start ranking for a manager in this league. Read the local usage table at ${TABLE} (columns: ppg = season avg fantasy points in this scoring, ppg3 = Weeks 4-6 avg, tgt/tgt3 = targets per game season / last 3, tshare/tsh3 = target share, snap/snap3 = offensive snap share, ep_pg = expected fantasy points per game from usage, tds = receiving TDs, opp = Week 7 opponent, implied = team implied points from the Week 7 line, spread_for = points the team is favored by (negative = underdog), opp_te_allowed_rank = rank of the opponent in TE fantasy points allowed per game Weeks 1-6 where 1 = most generous, opp_te_ppg_allowed, bye, inj_wk7 = nflverse injury report text, ros_te_ecr_oct16 = FantasyPros rest-of-season TE rank on Oct 16, wk6_te_ecr = FantasyPros Week 6 weekly TE rank). Use Read or Bash (cat) to read it.

Evidence gathered by other agents (JSON):
${evidence}

Method you must follow, and state it in 'method':
1. Projection = blend of: (a) usage baseline 0.5*ep_pg + 0.3*ppg3 + 0.2*ppg; (b) Vegas: if receiving-yards and receptions lines exist, line_proj = receptions_line + yards_line/10 + 6*TD_prob, where TD_prob comes from anytime TD odds converted to implied probability with ~5% vig removed; (c) matchup adjustment: scale by (opp_te_ppg_allowed / league avg ~13.3)^0.5 and by (implied / 22.5)^0.5. Weight Vegas 50% when both lines exist, 25% when only TD odds exist, 0% otherwise.
2. Consensus check: compute the average Week 7 consensus rank across sources found. If your rank and consensus differ by more than 4 spots, explain why in 'why', and only keep the gap if the data clearly supports it.
3. Exclude players on bye, ruled out, or doubtful; list them in 'excluded'. Mark questionable players and lower their projection by 15%.
4. Rank the top 20 startable TEs by proj_points. Put them in tiers (Tier 1 elite, Tier 2 every-week starter, Tier 3 streamer, Tier 4 desperation). Give floor/ceiling as rough 20th/80th percentile.
5. 'data_gaps': what you could not find.
Be specific in 'why' (numbers). Do not invent numbers; if an input is missing say so.`, { label: 'rank:blend', phase: 'Rank', schema: RANKING_SCHEMA })

phase('Verify')
const VERDICT_SCHEMA = { type: 'object', properties: {
  issues: { type: 'array', items: { type: 'object', properties: {
    player: { type: 'string' }, claim: { type: 'string' }, problem: { type: 'string' }, correction: { type: 'string' }, severity: { type: 'string' }, evidence: { type: 'string' } },
    required: ['player', 'claim', 'problem', 'correction', 'severity'] } },
  suggested_top12: { type: 'array', items: { type: 'string' } },
  overall_ok: { type: 'boolean' } }, required: ['issues', 'suggested_top12', 'overall_ok'] }
const rankedText = JSON.stringify(ranked)
const LENSES = [
  { key: 'status', prompt: 'LENS: availability and role. Independently re-check with WebSearch (at least 10 queries) the injury status, practice reports and role news for the top 15 players in this ranking, plus any QB changes on their teams. Try to REFUTE any status claim. Flag anyone ranked who is out, doubtful, on bye, traded, or lost his role, and anyone excluded who is actually active.' },
  { key: 'math', prompt: `LENS: numbers. Read the usage table at ${TABLE} and check every projection against the stated method and the evidence. Recompute the top 12 projections yourself. Flag arithmetic errors, misread table values, misconverted odds (American odds to probability), and Vegas lines that were invented or attributed to the wrong player or week. Try to REFUTE the ordering.` },
  { key: 'consensus', prompt: `LENS: market sanity. Using WebSearch (at least 8 queries for Week 7 2026 TE rankings and start/sit advice) and the usage table at ${TABLE}, check whether any player is ranked far from expert consensus without a data-backed reason, and whether any strong start is missing from the list. Try to REFUTE the top 12 order.` },
]
const verdicts = await parallel(LENSES.map(l => () => agent(`${CONTEXT}\n\nYou are a skeptic reviewing this Week 7 TE ranking:\n${rankedText}\n\n${l.prompt}\nDefault to flagging when uncertain, but cite evidence. Return issues and your own suggested top-12 order.`, { label: `verify:${l.key}`, phase: 'Verify', schema: VERDICT_SCHEMA })))

return { ranked, verdicts: verdicts.map((v, i) => ({ lens: LENSES[i].key, v })), gathered: { rA, rB, tdOdds, ydProps, newsA, newsB } }

# 2026 fantasy football draft board (Ratz pick 2, Footborn pick 4)

Built 2026-09-03/04 for two in-person 10-team ESPN PPR leagues (QB/2RB/2WR/TE/2FLEX/DST, 6 bench + 1 IR, 15 rounds).

- Cheat sheet (phone-friendly, tap to strike drafted players, evidence tab): https://claude.ai/code/artifact/f9fd7bfa-6969-415a-ab7f-a98547650650
- Draft Day Assistant (live in-draft recommender, works offline once loaded): https://claude.ai/code/artifact/ae1357b4-c985-4404-aa6a-b56ed1e7a073
- Printable: `ratz-pick2.pdf`, `footborn-pick4.pdf`
- Markdown copy of the whole board: `DRAFT-BOARD.md`

## What is in the model (version 3)

- `model/master.py`: scoring functions for both leagues, 2024-25 stats joined to the Aug 28 expert consensus.
- `model/usage_model.py`: usage-history projection (ridge per position on prior ppg, targets/carries per game, shares, snap share, age, career-year jump, efficiency; fit 2013-2025, holdout MAE beats naive at every position).
- `model/injury_model.py`, `model/injury_types.py`: games-missed model by position/age/prior injury (2013-2025) and injury-type recurrence from the 2012-2025 injury reports; `research/08-injury-evidence.md` is the medical-literature table (ACL, Achilles, hamstring, high-ankle, back, foot, concussion, shoulder) and `research/08-injury-types.csv` the per-player histories for the top 80.
- `model/handcuff_waiver.py`: what an RB2 scores when the RB1 is out (258 team-seasons).
- `model/sim_season.py`: season Monte Carlo (ESPN-room opponents, empirical injuries, byes, weekly variance, handcuff promotion, active waiver wire, in-season emergences, same-team correlation, Vegas win-total game script, lingering-injury literature, Sept 3 news). `sim_main.py` / `sim_extra.py` run the fixed-roster scenarios; `sim_policies.py` the opening-structure policies against randomized rooms.
- `model/model_board.py`: generates the board order from the projection, availability and value over replacement; every human override is listed in the page's evidence tab.
- `model/gen_html.py`, `gen_live.py`, `gen_md.py`: the pages. `calc_metric.py` recalibrates the live tool's odds against the simulator.
- `data/`: boards, model scores, usage projections, injury tables, handcuff ratios, ESPN room-price estimates.
- `research/`: scout reports (settings, strategy evidence, ADP, news through Sept 3 evening, RB, WR, QB/TE/DST, rookies, injury literature, Vegas win totals, coaches, waivers/handcuffs).
- `critiques/`: the Socratic reviews and the pre-critique plan. `rooms/`: the transcribed Footborn 2024 and 2025 boards.

Data provenance: nflverse weekly stats 2012-2025 (points recomputed under each league's exact scoring), snap counts, injury reports, 2026 rosters/depth charts (Sept 2)/draft/schedule; FantasyPros expert consensus via DynastyProcess (Aug 28, with 2023-25 history for backtests); ffopportunity expected points; FOX/CBS win totals (Sept 2); dated injury/transaction reporting through the evening of Sept 3 (research/10-news-sept4.md).

# 2026 fantasy football draft board (Ratz pick 2, Footborn pick 4)

Built 2026-09-03 for two in-person 10-team ESPN PPR leagues (QB/2RB/2WR/TE/2FLEX/DST, 6 bench + 1 IR, 15 rounds).

- Live cheat sheet (phone-friendly, tap to strike drafted players): https://claude.ai/code/artifact/f9fd7bfa-6969-415a-ab7f-a98547650650
- Printable: `ratz-pick2.pdf`, `footborn-pick4.pdf`
- Markdown copy of the whole board: `DRAFT-BOARD.md`
- `data/`: boards as CSV, the master 2025-stats + expert-consensus table, scoring model (`master.py`), board builder, HTML/markdown generators, ESPN room-price estimates, playoff schedule strength
- `research/`: the seven research scout reports (league settings, strategy evidence, ADP, news as of Sept 3, RB, WR, QB/TE/DST, rookies)
- `critiques/`: the five Socratic reviews (statistician, contrarian drafter, news auditor, league-settings specialist, ESPN room simulator) and the pre-critique plan

Data provenance: nflverse weekly stats 2024-25 (points recomputed under each league's exact scoring), nflverse 2026 rosters/depth charts (Sept 2)/draft/schedule, FantasyPros expert consensus via DynastyProcess (Aug 28), ESPN staff ranks and ESPN-specific ADP anchors (Aug 2026), dated injury/transaction reporting (Aug 15 - Sept 3).

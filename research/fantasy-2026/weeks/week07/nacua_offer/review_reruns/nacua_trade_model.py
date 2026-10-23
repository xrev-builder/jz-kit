#!/usr/bin/env python3
"""
Rest-of-season (Weeks 8-17) trade model: Jamal ('Stairway to 9 (wins)') trading Puka Nacua.

League: 10 teams, ESPN, full PPR, 6-pt passing TDs.
Lineup: QB, 2 RB, 2 WR, TE, 2 FLEX (RB/WR/TE), DST.  DST (49ers) is identical in every
option, so it is left out of all lineup totals.  Kicker is not a lineup slot.

Method (all inputs read from ../raw, nothing invented):
 1. Points-per-game curve by positional rank: 2026 Weeks 1-6 actual PPR points per game
    (nflverse weekly stats; QBs rescored to 6-pt passing TDs), players with >= 3 games,
    ranked within position, fitted ppg = a + b*ln(rank) on the top N at each position.
 2. Each player's ROS ppg = 50% curve(ROS positional ECR, FantasyPros scraped 2026-10-16)
                          + 50% own expected fantasy points per game (ep.csv, Weeks 1-6;
                            QBs rescored to 6-pt passing TDs).  Curve only if no EP.
 3. Evidence overrides (see OVERRIDES below): Carnell Tate capped at 9 ppg (user says not
    startable); Terry McLaurin 0 (torn patellar tendon, season over, Commanders/ESPN
    2026-10-20); Jordyn Tyson 0 until his return week, then a rookie estimate.
 4. Byes from games.csv (2026 REG).  Each week the best legal lineup is chosen (greedy is
    optimal for nested QB/RB/WR/TE + FLEX slots).  A slot the roster cannot fill legally
    (e.g. both TEs on bye in Week 11) is filled with a waiver streamer at replacement level.
 5. 3-for-1 and 2-for-1 trades force drops; the dropped players are chosen by brute force
    as the combination that costs the fewest modeled lineup points over Weeks 8-17
    (ties broken by lowest ROS ppg).
"""
import itertools
import json
import os
import re
import sys

import numpy as np
import pandas as pd

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(BASE, "raw")
OUT = os.path.join(BASE, "work")

WEEKS = list(range(8, 18))          # Weeks 8-17
REG = list(range(8, 15))            # Weeks 8-14 (regular season remainder)
PLAYOFF = [15, 16, 17]
FIRST_INJURY_WEEK = 7               # Nacua's calf injury: Thu Oct 22 practice, Week 7

# Tyson return assumption (evidence: IR since Aug 30, not practicing Week 7, 21-day
# window not opened, NO bye Week 8, analysts' earliest debut Week 9, hamstring history).
TYSON_RETURN_WEEK = int(os.environ.get("TYSON_RETURN_WEEK", 10))
TYSON_FIRST_GAME_FACTOR = 0.6       # snap ramp in first game back
TYSON_RANK = float(os.environ.get("TYSON_RANK", 36))   # low-end fantasy WR3 per game

# Waiver replacement ranks for a 10-team league (approx. rostered at each position + 1)
REPL_RANK = {"QB": 20, "RB": 45, "WR": 55, "TE": 16}
# WAIVER_MODE: "always" (default) = a replacement-level streamer at each position is available to
# every roster every week; "empty" = streamer only fills a slot the roster cannot fill; "none".
WAIVER_MODE = os.environ.get("WAIVER_MODE", "always")
USE_WAIVER_FILL = WAIVER_MODE != "none"

CURVE_TOPN = {"QB": 32, "RB": 64, "WR": 90, "TE": 32}

ROS_PAGE = {"QB": "/nfl/rankings/ros-qb.php", "RB": "/nfl/rankings/ros-ppr-rb.php",
            "WR": "/nfl/rankings/ros-ppr-wr.php", "TE": "/nfl/rankings/ros-ppr-te.php"}


def norm(name):
    if not isinstance(name, str):
        return ""
    n = name.lower().replace(".", "").replace("'", "")
    n = re.sub(r"\b(jr|sr|ii|iii|iv|v)\b", "", n)
    return re.sub(r"\s+", " ", n).strip()


# ---------------------------------------------------------------- players
# name, position, 2026 team (nflverse code)
JAMAL = [
    ("Brock Purdy", "QB", "SF"), ("Kyler Murray", "QB", "MIN"),
    ("Chase Brown", "RB", "CIN"), ("Kyren Williams", "RB", "LA"),
    ("Jadarian Price", "RB", "SEA"), ("Emanuel Wilson", "RB", "SEA"),
    ("Puka Nacua", "WR", "LA"), ("George Pickens", "WR", "DAL"),
    ("Carnell Tate", "WR", "TEN"), ("Devaughn Vele", "WR", "NO"),
    ("Dontayvion Wicks", "WR", "PHI"), ("Romeo Doubs", "WR", "NE"),
    ("Harold Fannin Jr.", "TE", "CLE"), ("Kyle Pitts", "TE", "ATL"),
]
INCOMING = [
    ("Javonte Williams", "RB", "DAL"), ("Jordyn Tyson", "WR", "NO"),
    ("Michael Wilson", "WR", "ARI"), ("Blake Corum", "RB", "LA"),
    ("Chris Olave", "WR", "NO"), ("James Cook", "RB", "BUF"),
    ("Terry McLaurin", "WR", "WAS"),
    ("Isaiah Likely", "TE", "NYG"),   # extra counter idea, not in the requested list
]
ALL = JAMAL + INCOMING
POS = {n: p for n, p, _ in ALL}
TEAM = {n: t for n, _, t in ALL}

OPTIONS = {
    "HOLD": [],
    "(a) Javonte + Tyson + M. Wilson (as offered)": ["Javonte Williams", "Jordyn Tyson", "Michael Wilson"],
    "(b) Javonte + M. Wilson + Corum": ["Javonte Williams", "Michael Wilson", "Blake Corum"],
    "(c) Javonte + M. Wilson (2-for-1)": ["Javonte Williams", "Michael Wilson"],
    "(d) Javonte + Olave": ["Javonte Williams", "Chris Olave"],
    "(e) Olave straight up": ["Chris Olave"],
    "(f) Cook + M. Wilson": ["James Cook", "Michael Wilson"],
    "(g) Javonte + M. Wilson + McLaurin": ["Javonte Williams", "Michael Wilson", "Terry McLaurin"],
    "(h) EXTRA: Javonte + M. Wilson + Isaiah Likely": ["Javonte Williams", "Michael Wilson", "Isaiah Likely"],
}

# Nacua scenarios: calendar weeks missed counting from Week 7 (out Weeks 7 .. 6+N)
NACUA_SCEN = [1, 2, 4, 6, 10]
# 'Most likely' = probability-weighted mix (analyst judgment from the evidence; see notes)
MOST_LIKELY_W = {1: 0.45, 2: 0.30, 4: 0.15, 6: 0.06, 10: 0.04}


def main():
    stats = pd.read_csv(os.path.join(RAW, "stats_wk.csv"), low_memory=False)
    stats = stats[(stats.season == 2026) & (stats.season_type == "REG") & stats.week.between(1, 6)].copy()
    stats["fp"] = stats["fantasy_points_ppr"].fillna(0) + 2 * stats["passing_tds"].fillna(0)  # 6-pt pass TD
    stats = stats[stats.position.isin(["QB", "RB", "WR", "TE"])]

    # ---------------- 1. curve
    g = stats.groupby(["player_id", "player_display_name", "position"]).agg(games=("week", "nunique"), pts=("fp", "sum")).reset_index()
    g["ppg"] = g.pts / g.games
    g = g[g.games >= 3]
    curves, curve_rows = {}, []
    for pos, topn in CURVE_TOPN.items():
        d = g[g.position == pos].sort_values("ppg", ascending=False).reset_index(drop=True)
        d["rank"] = np.arange(1, len(d) + 1)
        d = d[d["rank"] <= topn]
        b, a = np.polyfit(np.log(d["rank"]), d["ppg"], 1)
        pred = a + b * np.log(d["rank"])
        r2 = 1 - ((d.ppg - pred) ** 2).sum() / ((d.ppg - d.ppg.mean()) ** 2).sum()
        curves[pos] = (a, b)
        curve_rows.append({"pos": pos, "n_fit": len(d), "a": round(a, 3), "b": round(b, 3), "r2": round(r2, 3),
                           **{f"rank{k}": round(a + b * np.log(k), 2) for k in (1, 4, 6, 10, 16, 22, 30, 36, 45, 55)}})

    def curve(pos, rank):
        a, b = curves[pos]
        return max(0.0, a + b * np.log(max(rank, 1.0)))

    # ---------------- 2. ECR + EP
    ecr = pd.read_csv(os.path.join(RAW, "ecr.csv"))
    ecr["key"] = ecr.player.map(norm)
    ep = pd.read_csv(os.path.join(RAW, "ep.csv"))
    ep = ep[(ep.season == 2026) & ep.week.between(1, 6)].copy()
    ep["xfp"] = ep.total_fantasy_points_exp.fillna(0) + np.where(ep.position == "QB", 2 * ep.pass_touchdown_exp.fillna(0), 0)
    ep["key"] = ep.full_name.map(norm)
    epg = ep.groupby(["key", "position"]).agg(ep_games=("week", "nunique"), xfp=("xfp", "sum")).reset_index()
    epg["ep_ppg"] = epg.xfp / epg.ep_games
    act = stats.assign(key=stats.player_display_name.map(norm)).groupby(["key", "position"]).agg(
        games=("week", "nunique"), pts=("fp", "sum")).reset_index()
    act["act_ppg"] = act.pts / act.games

    rows = []
    for name, pos, team in ALL:
        k = norm(name)
        e = ecr[(ecr.fp_page == ROS_PAGE[pos]) & (ecr.key == k)]
        rank = float(e.ecr.iloc[0]) if len(e) else np.nan
        c = curve(pos, rank) if len(e) else np.nan
        x = epg[(epg.key == k) & (epg.position == pos)]
        epp = float(x.ep_ppg.iloc[0]) if len(x) else np.nan
        ac = act[(act.key == k) & (act.position == pos)]
        acp = float(ac.act_ppg.iloc[0]) if len(ac) else np.nan
        gms = int(ac.games.iloc[0]) if len(ac) else 0
        if np.isnan(epp):
            ppg, basis = c, f"curve(ROS {pos}{rank:g}) only; no EP"
        else:
            ppg, basis = 0.5 * c + 0.5 * epp, f"0.5*curve(ROS {pos}{rank:g})={c:.2f} + 0.5*EP/g={epp:.2f}"
        rows.append(dict(player=name, pos=pos, team=team, ros_ecr=rank, curve_ppg=c, ep_ppg=epp,
                         actual_ppg_wk1_6=acp, games_wk1_6=gms, ros_ppg=ppg, basis=basis))
    P = pd.DataFrame(rows).set_index("player")

    # ---------------- 3. overrides from the evidence
    P.loc["Carnell Tate", "basis"] += f"; capped at 9.0 (user: not startable; model value {P.loc['Carnell Tate','ros_ppg']:.2f})"
    P.loc["Carnell Tate", "ros_ppg"] = min(9.0, P.loc["Carnell Tate", "ros_ppg"])
    P.loc["Terry McLaurin", "basis"] = "0: torn left patellar tendon, season over (ESPN/NFL.com 2026-10-20); Oct-16 ECR is stale"
    P.loc["Terry McLaurin", "ros_ppg"] = 0.0
    tyson_active = curve("WR", TYSON_RANK)
    P.loc["Jordyn Tyson", "basis"] = (f"0 through Week {TYSON_RETURN_WEEK-1} (IR, hamstring; not practicing Wk7, window not opened, NO bye Wk8); "
                                      f"debut Wk{TYSON_RETURN_WEEK} at {TYSON_FIRST_GAME_FACTOR:.0%}, then curve(WR{TYSON_RANK:g})={tyson_active:.2f}/g")
    P.loc["Jordyn Tyson", "ros_ppg"] = tyson_active

    # ---------------- byes
    games = pd.read_csv(os.path.join(RAW, "games.csv"), low_memory=False)
    games = games[(games.season == 2026) & (games.game_type == "REG")]
    bye = {}
    for t in set(TEAM.values()):
        played = set(games[(games.home_team == t) | (games.away_team == t)].week)
        bye[t] = [w for w in range(1, 19) if w not in played]
    P["bye"] = [bye[TEAM[n]][0] if bye[TEAM[n]] else None for n in P.index]

    # Optional sensitivity overrides, e.g. PPG_OVERRIDE='{"Michael Wilson": 12.0}'
    for n, v in json.loads(os.environ.get("PPG_OVERRIDE", "{}")).items():
        P.loc[n, "basis"] += f"; SENSITIVITY override -> {v}"
        P.loc[n, "ros_ppg"] = float(v)

    # Replacement level on the SAME basis as player values: blend curve(ECR) with EP for every
    # player on each ROS ECR page, sort, and take the value at the replacement rank.
    repl = {}
    for pos, rr in REPL_RANK.items():
        e = ecr[ecr.fp_page == ROS_PAGE[pos]][["key", "ecr"]].drop_duplicates("key")
        e = e.merge(epg[epg.position == pos][["key", "ep_ppg"]], on="key", how="left")
        e["c"] = [curve(pos, r) for r in e.ecr]
        e["blend"] = np.where(e.ep_ppg.notna(), 0.5 * e.c + 0.5 * e.ep_ppg, e.c)
        vals = sorted(e.blend, reverse=True)
        repl[pos] = float(vals[rr - 1])

    def weekly_pts(player, week, nacua_out_through):
        if week in bye[TEAM[player]]:
            return None
        v = P.loc[player, "ros_ppg"]
        if player == "Puka Nacua" and week <= nacua_out_through:
            return None
        if player == "Jordyn Tyson":
            if week < TYSON_RETURN_WEEK:
                return None
            if week == TYSON_RETURN_WEEK:
                return v * TYSON_FIRST_GAME_FACTOR
        if player == "Terry McLaurin":
            return None
        return v

    for pos in ("QB", "RB", "WR", "TE"):
        POS[f"streamer {pos}"] = pos

    def best_lineup(roster, week, nacua_out_through, detail=False):
        avail = {p: weekly_pts(p, week, nacua_out_through) for p in roster}
        avail = {p: v for p, v in avail.items() if v is not None}
        if WAIVER_MODE == "always":
            # symmetric for every option: one replacement-level free agent per position each week
            for pos in ("QB", "RB", "WR", "TE"):
                avail[f"streamer {pos}"] = repl[pos]
        bypos = {pos: sorted([(v, p) for p, v in avail.items() if POS[p] == pos], reverse=True) for pos in ("QB", "RB", "WR", "TE")}
        used, total, lineup = set(), 0.0, []
        for pos, n in (("QB", 1), ("RB", 2), ("WR", 2), ("TE", 1)):
            got = bypos[pos][:n]
            for v, p in got:
                used.add(p); total += v; lineup.append((pos, p, v))
            for _ in range(n - len(got)):
                fill = repl[pos] if USE_WAIVER_FILL else 0.0
                total += fill; lineup.append((pos, f"waiver {pos}", fill))
        flex = sorted([(v, p) for p, v in avail.items() if POS[p] in ("RB", "WR", "TE") and p not in used], reverse=True)[:2]
        for v, p in flex:
            total += v; lineup.append(("FLEX", p, v))
        for _ in range(2 - len(flex)):
            fill = max(repl["RB"], repl["WR"], repl["TE"]) if USE_WAIVER_FILL else 0.0
            total += fill; lineup.append(("FLEX", "waiver FLEX", fill))
        return (total, lineup) if detail else total

    def season(roster, nacua_out_through):
        return {w: best_lineup(roster, w, nacua_out_through) for w in WEEKS}

    base_roster = [n for n, _, _ in JAMAL]

    # ---------------- drops
    rosters, drops = {}, {}
    for opt, inc in OPTIONS.items():
        if not inc:
            rosters[opt], drops[opt] = base_roster[:], []
            continue
        r = [p for p in base_roster if p != "Puka Nacua"] + inc
        k = len(inc) - 1
        if k == 0:
            rosters[opt], drops[opt] = r, []
            continue
        best = None
        for combo in itertools.combinations(r, k):
            rr = [p for p in r if p not in combo]
            tot = sum(season(rr, 0).values())          # Nacua not on roster: scenario irrelevant
            key = (-tot, sum(P.loc[c, "ros_ppg"] for c in combo))
            if best is None or key < best[0]:
                best = (key, combo, rr)
        rosters[opt], drops[opt] = best[2], list(best[1])
    # cost of each drop set vs keeping everyone (informational)
    drop_cost = {}
    for opt, inc in OPTIONS.items():
        if drops[opt]:
            full = [p for p in base_roster if p != "Puka Nacua"] + inc
            drop_cost[opt] = sum(season(full, 0).values()) - sum(season(rosters[opt], 0).values())

    # ---------------- scenarios
    def summarize(weekly):
        return (np.mean([weekly[w] for w in REG]), np.mean([weekly[w] for w in PLAYOFF]), sum(weekly.values()))

    res = []
    weekly_tbl = {}
    for opt in OPTIONS:
        for n in NACUA_SCEN:
            out_through = FIRST_INJURY_WEEK + n - 1
            wk = season(rosters[opt], out_through)
            weekly_tbl[(opt, n)] = wk
            r8, p15, tot = summarize(wk)
            res.append(dict(option=opt, nacua_weeks_missed=n, out_through_week=out_through, ppg_wk8_14=r8, ppg_wk15_17=p15, total_wk8_17=tot))
    R = pd.DataFrame(res)
    hold = R[R.option == "HOLD"].set_index("nacua_weeks_missed")
    R["delta_wk8_14"] = R.apply(lambda r: r.ppg_wk8_14 - hold.loc[r.nacua_weeks_missed, "ppg_wk8_14"], axis=1)
    R["delta_wk15_17"] = R.apply(lambda r: r.ppg_wk15_17 - hold.loc[r.nacua_weeks_missed, "ppg_wk15_17"], axis=1)
    R["delta_total_wk8_17"] = R.apply(lambda r: r.total_wk8_17 - hold.loc[r.nacua_weeks_missed, "total_wk8_17"], axis=1)

    ml = []
    for opt in OPTIONS:
        sub = R[R.option == opt].set_index("nacua_weeks_missed")
        row = {"option": opt, "nacua_weeks_missed": "most likely (prob-weighted)"}
        for col in ["ppg_wk8_14", "ppg_wk15_17", "total_wk8_17", "delta_wk8_14", "delta_wk15_17", "delta_total_wk8_17"]:
            row[col] = sum(MOST_LIKELY_W[n] * sub.loc[n, col] for n in NACUA_SCEN)
        ml.append(row)
    ML = pd.DataFrame(ml)

    # ---------------- breakeven for option (a) and (c)
    be = {}
    for opt in ["(a) Javonte + Tyson + M. Wilson (as offered)", "(c) Javonte + M. Wilson (2-for-1)", "(b) Javonte + M. Wilson + Corum"]:
        rows_be = []
        opt_wk = season(rosters[opt], 0)
        for n in range(1, 12):
            out_through = FIRST_INJURY_WEEK + n - 1
            h = season(rosters["HOLD"], out_through)
            rows_be.append(dict(n=n, out_through=out_through,
                                d_total=sum(opt_wk.values()) - sum(h.values()),
                                d_reg=sum(opt_wk[w] for w in REG) - sum(h[w] for w in REG),
                                d_po=sum(opt_wk[w] for w in PLAYOFF) - sum(h[w] for w in PLAYOFF)))
        be[opt] = rows_be

    # ---------------- output
    pd.set_option("display.width", 250)
    pd.set_option("display.max_columns", 30)
    print("=== PPG curve fits (2026 Wk1-6 actual PPR ppg by positional rank, >=3 games; ppg = a + b*ln(rank)) ===")
    print(pd.DataFrame(curve_rows).to_string(index=False))
    print("\nWaiver replacement ppg :", {k: round(v, 2) for k, v in repl.items()}, "mode=" + WAIVER_MODE)
    print("\n=== Player ROS ppg inputs ===")
    print(P[["pos", "team", "bye", "ros_ecr", "curve_ppg", "ep_ppg", "actual_ppg_wk1_6", "games_wk1_6", "ros_ppg"]].round(2).to_string())
    print("\n=== Drops forced by each option (chosen by min lineup-point cost) ===")
    for opt in OPTIONS:
        if drops[opt]:
            print(f"{opt}: drop {drops[opt]}  (modeled cost of the drops, Wk8-17 total: {drop_cost[opt]:.2f} pts)")
    print("\n=== HOLD lineups by week (Nacua healthy from Week 8) ===")
    for w in WEEKS:
        t, lu = best_lineup(rosters["HOLD"], w, 7, detail=True)
        print(w, round(t, 1), [f"{s}:{p}({v:.1f})" for s, p, v in lu])
    print("\n=== Option (a) lineups by week ===")
    for w in WEEKS:
        t, lu = best_lineup(rosters["(a) Javonte + Tyson + M. Wilson (as offered)"], w, 0, detail=True)
        print(w, round(t, 1), [f"{s}:{p}({v:.1f})" for s, p, v in lu])
    print("\n=== Scenario results (avg lineup points/week, DST excluded) ===")
    print(R.round(2).to_string(index=False))
    print("\n=== Most likely (probability-weighted:", MOST_LIKELY_W, ") ===")
    print(ML.round(2).to_string(index=False))
    print("\n=== Breakeven sweep (option total minus HOLD total, points) ===")
    for opt, rows_be in be.items():
        print(opt)
        print(pd.DataFrame(rows_be).round(2).to_string(index=False))

    out = dict(
        curves=curve_rows, replacement=repl, players=P.reset_index().to_dict(orient="records"),
        drops=drops, drop_cost=drop_cost, scenarios=R.to_dict(orient="records"),
        most_likely=ML.to_dict(orient="records"), breakeven=be,
        weekly={f"{k[0]}|{k[1]}": v for k, v in weekly_tbl.items()},
        assumptions=dict(TYSON_RETURN_WEEK=TYSON_RETURN_WEEK, TYSON_RANK=TYSON_RANK, MOST_LIKELY_W=MOST_LIKELY_W,
                         WAIVER_MODE=WAIVER_MODE, REPL_RANK=REPL_RANK),
    )
    suffix = os.environ.get("OUT_SUFFIX", "")
    with open(os.path.join(OUT, f"results{suffix}.json"), "w") as f:
        json.dump(out, f, indent=1, default=float)


if __name__ == "__main__":
    main()

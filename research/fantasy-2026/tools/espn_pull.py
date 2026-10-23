#!/usr/bin/env python3
"""Pull the live ESPN fantasy league (read-only) into CSVs for the trade engine.

Environment (never hard-code or commit these):
  ESPN_LEAGUE_ID   required, the leagueId= number from the league URL
  ESPN_YEAR        optional, default 2026
  ESPN_S2, ESPN_SWID   required only for a private league (login cookies espn_s2 and SWID)

Usage:
  python3 espn_pull.py --check            # connectivity + auth test, prints no secrets
  python3 espn_pull.py OUT_DIR            # writes teams.csv, rosters_current.csv, free_agents.csv, activity.json, meta.json

Writes league data only to OUT_DIR. Keep OUT_DIR outside any public repository:
the files contain other managers' names and rosters.
"""
import os, sys, json, csv, datetime, urllib.request, urllib.error

HOST = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/"
# Owner name -> short manager name used by the trade engine (from this league's history).
SHORT = {
    ("ismail", "bazzi"): "Ish", ("ahmad", "makled"): "Betto", ("daoud", "sleiman"): "Daoud",
    ("hussein", "kdouh"): "Kdouh", ("ahmed", "hazime"): "Hazime", ("billy", "sobh"): "Billy",
    ("kassem", "amine"): "Kass", ("jamal", "zreik"): "Jamal",
}
TEAM_HINT = {"every villian": "Moe", "ocky": "Aoc", "stairway": "Jamal", "commish": "Ish", "amon one": "Betto",
             "likely to cook": "Daoud", "buffalo bills": "Kdouh", "ayri feekon": "Hazime", "riceman": "Billy",
             "hall monitor": "Kass"}

def env():
    lid = os.environ.get("ESPN_LEAGUE_ID", "").strip()
    year = int(os.environ.get("ESPN_YEAR", "2026"))
    s2 = os.environ.get("ESPN_S2", "").strip() or None
    swid = os.environ.get("ESPN_SWID", "").strip() or None
    return lid, year, s2, swid

def check():
    lid, year, s2, swid = env()
    print("ESPN_LEAGUE_ID set:", bool(lid), "| ESPN_S2 set:", bool(s2), "| ESPN_SWID set:", bool(swid))
    try:
        with urllib.request.urlopen(HOST + str(year), timeout=20) as r:
            print("ESPN API reachable: HTTP", r.status)
    except urllib.error.HTTPError as e:
        print("ESPN API reachable: HTTP", e.code)
    except Exception as e:
        print("ESPN API NOT reachable:", type(e).__name__, str(e)[:120])
        print("Fix: allow lm-api-reads.fantasy.espn.com (and fantasy.espn.com) in the environment's network access.")
        return 2
    if not lid:
        print("Missing ESPN_LEAGUE_ID."); return 3
    try:
        from espn_api.football import League
        lg = League(league_id=int(lid), year=year, espn_s2=s2, swid=swid)
        print("League OK:", len(lg.teams), "teams, current week", lg.current_week)
        return 0
    except Exception as e:
        print("League fetch failed:", type(e).__name__, str(e)[:200])
        print("If this is a private league, ESPN_S2 and ESPN_SWID must be set (or make the league viewable to public).")
        return 4

def short_name(team):
    for o in (team.owners or []):
        key = (str(o.get("firstName", "")).strip().lower(), str(o.get("lastName", "")).strip().lower())
        if key in SHORT: return SHORT[key]
    tn = team.team_name.lower()
    for h, s in TEAM_HINT.items():
        if h in tn: return s
    return team.team_name

def pull(out):
    from espn_api.football import League
    lid, year, s2, swid = env()
    if not lid: sys.exit("Missing ESPN_LEAGUE_ID")
    lg = League(league_id=int(lid), year=year, espn_s2=s2, swid=swid)
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, "teams.csv"), "w", newline="") as f:
        w = csv.writer(f); w.writerow(["team_id", "team_name", "manager", "owners", "wins", "losses", "ties", "points_for", "points_against", "standing", "faab_spent"])
        for t in lg.teams:
            owners = "; ".join(f"{o.get('firstName','')} {o.get('lastName','')}".strip() for o in (t.owners or []))
            w.writerow([t.team_id, t.team_name, short_name(t), owners, t.wins, t.losses, t.ties, t.points_for, t.points_against, t.standing, getattr(t, "acquisition_budget_spent", "")])
    with open(os.path.join(out, "rosters_current.csv"), "w", newline="") as f:
        w = csv.writer(f); w.writerow(["manager", "team_name", "player", "pos", "nfl", "injury", "lineup_slot", "acquisition", "pct_owned", "avg_points", "proj_avg_points"])
        for t in lg.teams:
            for p in t.roster:
                w.writerow([short_name(t), t.team_name, p.name, p.position, p.proTeam, p.injuryStatus, p.lineupSlot, p.acquisitionType,
                            getattr(p, "percent_owned", ""), getattr(p, "avg_points", ""), getattr(p, "projected_avg_points", "")])
    fa = []
    for pos in ("QB", "RB", "WR", "TE", "D/ST"):
        try: fa += lg.free_agents(size=40, position=pos)
        except Exception as e: print("free agents", pos, "failed:", e)
    with open(os.path.join(out, "free_agents.csv"), "w", newline="") as f:
        w = csv.writer(f); w.writerow(["player", "pos", "nfl", "injury", "pct_owned", "avg_points", "proj_avg_points"])
        for p in fa:
            w.writerow([p.name, p.position, p.proTeam, p.injuryStatus, getattr(p, "percent_owned", ""), getattr(p, "avg_points", ""), getattr(p, "projected_avg_points", "")])
    acts = []
    try:
        for a in lg.recent_activity(size=50):
            acts.append({"date": a.date, "actions": [[getattr(x[0], "team_name", str(x[0])), x[1], getattr(x[2], "name", str(x[2]))] + ([x[3]] if len(x) > 3 else []) for x in a.actions]})
    except Exception as e:
        print("recent activity failed:", e)
    json.dump(acts, open(os.path.join(out, "activity.json"), "w"), indent=1, default=str)
    json.dump({"fetched_utc": datetime.datetime.utcnow().isoformat(timespec="seconds"), "year": year, "current_week": lg.current_week,
               "n_teams": len(lg.teams)}, open(os.path.join(out, "meta.json"), "w"), indent=1)
    print("Wrote", out, "| teams", len(lg.teams), "| week", lg.current_week, "| FA", len(fa), "| activity", len(acts))

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--check":
        sys.exit(check())
    pull(sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-0/-home-user-jz-kit/8f34411e-cae9-5317-988c-4b9094bb09b9/scratchpad/espn")

#!/usr/bin/env python3
"""Pull the live ESPN fantasy league (read-only) into CSVs for the trade engine.

Environment (never hard-code or commit these):
  ESPN_LEAGUE_ID      required, the leagueId= number from the league URL
  ESPN_YEAR           optional, default 2026
  ESPN_S2, ESPN_SWID  required only for a private league (login cookies espn_s2 and SWID)
  ESPN_MANAGER_MAP    optional path to a JSON file {"<ESPN team_id>": "<short name>"} kept OUTSIDE the repo
  ESPN_OUT            optional default output folder (default: ~/espn_league)

Usage:
  python3 espn_pull.py --check          connectivity + auth test; prints no secrets
  python3 espn_pull.py [--out DIR]      writes teams.csv, rosters_current.csv, free_agents.csv, activity.json, meta.json

League files contain other managers' names and rosters, so the script refuses to write inside a git repository.
Requires espn_api >= 0.46 (older versions put cookie values in auth error messages).
"""
import os, sys, json, csv, datetime, argparse, urllib.request, urllib.error

HOST = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/"
# Team-name hints only (team names are chosen in-league; no personal names in source).
TEAM_HINT = {"every villian": "Moe", "ocky": "Aoc", "stairway": "Jamal", "commish": "Ish", "amon one": "Betto",
             "likely to cook": "Daoud", "buffalo bills": "Kdouh", "ayri feekon": "Hazime", "riceman": "Billy",
             "hall monitor": "Kass"}

def env():
    lid = os.environ.get("ESPN_LEAGUE_ID", "").strip()
    year_s = os.environ.get("ESPN_YEAR", "").strip() or "2026"
    s2 = os.environ.get("ESPN_S2", "").strip() or None
    swid = os.environ.get("ESPN_SWID", "").strip() or None
    return lid, year_s, s2, swid

def scrub(msg):
    _, _, s2, swid = env()
    msg = str(msg)
    for secret in (s2, swid):
        if secret:
            msg = msg.replace(secret, "[redacted]")
    return msg[:300]

def lib_ok():
    try:
        from espn_api._version import __version__ as v
    except Exception:
        return False, "unknown"
    try:
        parts = tuple(int(x) for x in v.split(".")[:2])
    except ValueError:
        return False, v
    return parts >= (0, 46), v

def check():
    lid, year_s, s2, swid = env()
    print("ESPN_LEAGUE_ID set:", bool(lid), "| ESPN_S2 set:", bool(s2), "| ESPN_SWID set:", bool(swid))
    ok, v = lib_ok()
    print("espn_api version:", v, "(ok)" if ok else "(need >= 0.46: pip install -U espn-api)")
    if not ok: return 5
    if not year_s.isdigit():
        print("ESPN_YEAR must be a number."); return 3
    try:
        with urllib.request.urlopen(HOST + year_s, timeout=20) as r:
            print("ESPN API reachable: HTTP", r.status)
    except urllib.error.HTTPError as e:
        if e.code in (403, 407) or e.code >= 500:
            print("ESPN API NOT reachable: HTTP", e.code); return 2
        print("ESPN API reachable: HTTP", e.code)
    except Exception as e:
        print("ESPN API NOT reachable:", type(e).__name__, scrub(e))
        print("Fix: allow lm-api-reads.fantasy.espn.com in the environment's network access.")
        return 2
    if not lid.isdigit():
        print("ESPN_LEAGUE_ID missing or not a number."); return 3
    try:
        from espn_api.football import League
        lg = League(league_id=int(lid), year=int(year_s), espn_s2=s2, swid=swid)
        print("League OK:", len(lg.teams), "teams, current week", lg.current_week)
        return 0
    except Exception as e:
        name = type(e).__name__
        print("League fetch failed:", name)
        if name == "ESPNAccessDenied":
            print("Private league: set ESPN_S2 and ESPN_SWID, or ask the commissioner to make the league viewable to public.")
        elif name == "ESPNInvalidLeague":
            print("League not found: check ESPN_LEAGUE_ID and ESPN_YEAR.")
        else:
            print(scrub(e))
        return 4

def in_git_repo(path):
    p = os.path.realpath(path)
    while True:
        if os.path.exists(os.path.join(p, ".git")): return True
        parent = os.path.dirname(p)
        if parent == p: return False
        p = parent

def load_map():
    path = os.environ.get("ESPN_MANAGER_MAP", "").strip()
    if not path: return {}
    try:
        with open(path, encoding="utf-8") as f:
            return {str(k): v for k, v in json.load(f).items()}
    except Exception as e:
        print("ESPN_MANAGER_MAP unreadable:", type(e).__name__); return {}

def short_name(team, mp):
    if str(team.team_id) in mp: return mp[str(team.team_id)]
    tn = str(team.team_name).lower()
    for h, s in TEAM_HINT.items():
        if h in tn: return s
    return team.team_name

def clean_player(p):
    inj = p.injuryStatus if isinstance(p.injuryStatus, str) else ""
    pct = getattr(p, "percent_owned", None)
    pct = "" if pct is None or (isinstance(pct, (int, float)) and pct < 0) else pct
    s0 = getattr(p, "stats", {}).get(0, {}) if isinstance(getattr(p, "stats", None), dict) else {}
    acq = p.acquisitionType if isinstance(p.acquisitionType, str) else ""
    return inj, pct, s0.get("avg_points", ""), s0.get("projected_avg_points", ""), acq

def pull(out):
    lid, year_s, s2, swid = env()
    ok, v = lib_ok()
    if not ok: sys.exit(f"espn_api {v} is too old; run: pip install -U espn-api")
    if not lid.isdigit() or not year_s.isdigit(): sys.exit("Set ESPN_LEAGUE_ID (number); ESPN_YEAR must be a number.")
    out = os.path.realpath(os.path.expanduser(out))
    if in_git_repo(out): sys.exit(f"Refusing to write league data inside a git repository: {out}")
    from espn_api.football import League
    try:
        lg = League(league_id=int(lid), year=int(year_s), espn_s2=s2, swid=swid)
    except Exception as e:
        sys.exit(f"League fetch failed: {type(e).__name__}: {scrub(e)}")
    mp = load_map(); errors = {}
    names = {t.team_id: short_name(t, mp) for t in lg.teams}
    unmapped = [t.team_name for t in lg.teams if names[t.team_id] == t.team_name]
    if unmapped: errors["unmapped_teams"] = unmapped
    if len(set(names.values())) != len(names): errors["duplicate_short_names"] = sorted(names.values())
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, "teams.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["team_id", "team_name", "manager", "wins", "losses", "ties", "points_for", "points_against", "standing", "faab_spent"])
        for t in lg.teams:
            w.writerow([t.team_id, t.team_name, names[t.team_id], t.wins, t.losses, t.ties, t.points_for, t.points_against, t.standing, getattr(t, "acquisition_budget_spent", "")])
    with open(os.path.join(out, "rosters_current.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["manager", "team_name", "player", "pos", "nfl", "injury", "lineup_slot", "acquisition", "pct_owned", "avg_points", "proj_avg_points"])
        for t in lg.teams:
            for p in t.roster:
                inj, pct, avg, proj, acq = clean_player(p)
                w.writerow([names[t.team_id], t.team_name, p.name, p.position, p.proTeam, inj, p.lineupSlot, acq, pct, avg, proj])
    fa, seen = [], set()
    for pos in ("QB", "RB", "WR", "TE", "D/ST"):
        try:
            for p in lg.free_agents(size=40, position=pos):
                if p.playerId not in seen: seen.add(p.playerId); fa.append(p)
        except Exception as e:
            errors[f"free_agents:{pos}"] = f"{type(e).__name__}: {scrub(e)}"
    with open(os.path.join(out, "free_agents.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["player", "pos", "nfl", "injury", "pct_owned", "avg_points", "proj_avg_points"])
        for p in fa:
            inj, pct, avg, proj, _ = clean_player(p)
            w.writerow([p.name, p.position, p.proTeam, inj, pct, avg, proj])
    try:
        acts = [{"date": a.date, "actions": [[getattr(x[0], "team_name", str(x[0])), x[1], getattr(x[2], "name", str(x[2]))] + list(x[3:]) for x in a.actions]}
                for a in lg.recent_activity(size=50)]
        with open(os.path.join(out, "activity.json"), "w", encoding="utf-8") as f:
            json.dump(acts, f, indent=1, default=str)
    except Exception as e:
        acts = None; errors["activity"] = f"{type(e).__name__}: {scrub(e)}"
    with open(os.path.join(out, "meta.json"), "w", encoding="utf-8") as f:
        json.dump({"fetched_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"), "year": int(year_s),
                   "current_week": lg.current_week, "n_teams": len(lg.teams), "n_free_agents": len(fa),
                   "n_activity": None if acts is None else len(acts), "complete": not errors, "errors": errors}, f, indent=1)
    print("Wrote", out, "| teams", len(lg.teams), "| week", lg.current_week, "| FA", len(fa), "| activity", "failed" if acts is None else len(acts))
    if errors:
        print("Incomplete pull:", json.dumps(errors)[:400]); sys.exit(6)

if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Read-only ESPN league pull")
    ap.add_argument("--check", action="store_true", help="connectivity and auth test only")
    ap.add_argument("--out", default=os.environ.get("ESPN_OUT", "~/espn_league"), help="output folder (must be outside any git repo)")
    a = ap.parse_args()
    sys.exit(check()) if a.check else pull(a.out)

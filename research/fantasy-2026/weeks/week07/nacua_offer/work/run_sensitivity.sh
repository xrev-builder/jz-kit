#!/bin/bash
# Runs the base model and sensitivity variants; each writes results<suffix>.json next to the script.
W=$(cd "$(dirname "$0")" && pwd)
M=$W/nacua_trade_model.py
python3 $M > $W/run_base.txt 2>/dev/null
OUT_SUFFIX=_empty WAIVER_MODE=empty python3 $M > /dev/null 2>&1
OUT_SUFFIX=_nowaiver WAIVER_MODE=none python3 $M > /dev/null 2>&1
OUT_SUFFIX=_mw12 PPG_OVERRIDE='{"Michael Wilson": 12.0}' python3 $M > /dev/null 2>&1
OUT_SUFFIX=_mwcurve PPG_OVERRIDE='{"Michael Wilson": 13.11}' python3 $M > /dev/null 2>&1
OUT_SUFFIX=_tyson9 TYSON_RETURN_WEEK=9 python3 $M > /dev/null 2>&1
OUT_SUFFIX=_tyson12 TYSON_RETURN_WEEK=12 TYSON_RANK=45 python3 $M > /dev/null 2>&1
OUT_SUFFIX=_nacua25 PPG_OVERRIDE='{"Puka Nacua": 25.0}' python3 $M > /dev/null 2>&1
OUT_SUFFIX=_jav15 PPG_OVERRIDE='{"Javonte Williams": 15.0}' python3 $M > /dev/null 2>&1
python3 - "$W" <<'PY'
import json, sys, glob, os
W = sys.argv[1]
A = "(a) Javonte + Tyson + M. Wilson (as offered)"
for f in sorted(glob.glob(os.path.join(W, "results*.json"))):
    d = json.load(open(f))
    sc = {(r["option"], r["nacua_weeks_missed"]): r for r in d["scenarios"]}
    ml = {r["option"]: r for r in d["most_likely"]}
    be = d["breakeven"][A]
    first = next((r["n"] for r in be if r["d_total"] > 0), None)
    first_po = next((r["n"] for r in be if r["d_po"] > 0), None)
    print(os.path.basename(f), "| (a) dTot N1=%.1f N2=%.1f N4=%.1f | ML d8-14=%.2f d15-17=%.2f tot=%.1f | breakeven N(total)=%s N(playoffs)=%s" % (
        sc[(A,1)]["delta_total_wk8_17"], sc[(A,2)]["delta_total_wk8_17"], sc[(A,4)]["delta_total_wk8_17"],
        ml[A]["delta_wk8_14"], ml[A]["delta_wk15_17"], ml[A]["delta_total_wk8_17"], first, first_po), "| drops(a)", d["drops"][A])
PY

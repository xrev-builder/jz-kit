import json, sys
d = json.load(open(sys.argv[1]))
A = "(a) Javonte + Tyson + M. Wilson (as offered)"; H="(h) EXTRA: Javonte + M. Wilson + Isaiah Likely"
sc = {(r["option"], r["nacua_weeks_missed"]): r for r in d["scenarios"]}
ml = {r["option"]: r for r in d["most_likely"]}
be = d["breakeven"][A]
first = next((r["n"] for r in be if r["d_total"] > 0), None)
print(sys.argv[1], "| (a) N1=%.1f N2=%.1f N3=%.1f N4=%.1f ML=%.1f BE=%s | (h) N1=%.1f ML=%.1f | drops(a)=%s" % (
 sc[(A,1)]["delta_total_wk8_17"], sc[(A,2)]["delta_total_wk8_17"], [r for r in be if r["n"]==3][0]["d_total"], sc[(A,4)]["delta_total_wk8_17"], ml[A]["delta_total_wk8_17"], first,
 sc[(H,1)]["delta_total_wk8_17"], ml[H]["delta_total_wk8_17"], d["drops"][A]))

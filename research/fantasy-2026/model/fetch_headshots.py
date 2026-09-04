"""Run this on a machine with internet to embed real headshots: python3 fetch_headshots.py, then python3 gen_html.py.
Downloads each board player's nflverse headshot (roster_2026 / 2025 weekly stats), resizes to 64px JPEG, writes headshots.json {name: data URI}.
Needs: pip install pillow requests. The page falls back to team-color initials for anyone missing."""
import pandas as pd, json, io, re, unicodedata, os, sys
try:
    from PIL import Image; import requests
except ImportError:
    sys.exit('pip install pillow requests')
O=os.path.dirname(os.path.abspath(__file__))+'/'; DATA=os.path.abspath(O+'../data')+'/'
def norm(s):
    s=unicodedata.normalize('NFKD',str(s)).encode('ascii','ignore').decode().lower(); s=re.sub(r"[.'’-]","",s); return re.sub(r"\s+(jr|sr|ii|iii|iv)$","",s.strip())
b=pd.read_csv(O+'board_A.csv'); urls={}
for f,col in ((DATA+'roster_2026.csv','full_name'),(DATA+'stats_player_week_2025.csv','player_display_name')):
    if os.path.exists(f):
        d=pd.read_csv(f,low_memory=False,usecols=[col,'headshot_url']).dropna().drop_duplicates(col)
        for n,u in zip(d[col],d.headshot_url): urls.setdefault(norm(n),u)
out=json.load(open(O+'headshots.json')) if os.path.exists(O+'headshots.json') else {}
for n in b.player:
    if n in out: continue
    u=urls.get(norm(n))
    if not u: continue
    try:
        r=requests.get(u,timeout=15); im=Image.open(io.BytesIO(r.content)).convert('RGB')
        w,h=im.size; s=min(w,h); im=im.crop(((w-s)//2,0,(w-s)//2+s,s)).resize((64,64),Image.LANCZOS)
        buf=io.BytesIO(); im.save(buf,'JPEG',quality=70,optimize=True); out[n]='data:image/jpeg;base64,'+__import__('base64').b64encode(buf.getvalue()).decode()
    except Exception as e: print('skip',n,e)
json.dump(out,open(O+'headshots.json','w')); print('headshots:',len(out))

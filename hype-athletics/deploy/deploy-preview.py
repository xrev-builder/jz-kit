#!/usr/bin/env python3
"""Deploy the built site (dist/) to the shareable preview at https://hypeathletics.xrev.co.

How it works: every file in dist/ is written to a Workers KV namespace, and a small Worker
(deploy/worker.js) serves them. Only standard Cloudflare API calls are used.

Usage (from hype-athletics/):
    PUBLIC_PREVIEW=1 npm run build
    python3 deploy/deploy-preview.py

Needs a Cloudflare API token for api.cloudflare.com. In Claude Code cloud sessions the network
proxy adds it automatically; elsewhere set CLOUDFLARE_API_TOKEN.
Token permissions: Account › Workers Scripts Edit, Account › Workers KV Storage Edit,
Zone › Workers Routes Edit (xrev.co).
"""
import base64, json, os, subprocess, sys, tempfile

ACCOUNT = 'ae8bcee803a82250768b47ea25778eed'
ZONE = 'dee553f2d523d589d355d7c756ff4c18'          # xrev.co
NAMESPACE = '5733b6a28702409cbfe14eda1334f2b6'      # hype-athletics-preview-site
DAYPASS_NS = '6c5d7a1be1e24efcb31b9d153c9ca768'     # hype-athletics-preview-daypass
SCRIPT = 'hype-athletics-preview'
HOSTNAME = 'hypeathletics.xrev.co'
API = f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}'

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')
BATCH_BYTES = 40 * 1024 * 1024


def api(method, url, *args):
    cmd = ['curl', '-sS', '-X', method, url]
    token = os.environ.get('CLOUDFLARE_API_TOKEN')
    if token:
        cmd += ['-H', f'authorization: Bearer {token}']
    out = subprocess.run(cmd + list(args), capture_output=True, text=True, check=True).stdout
    data = json.loads(out)
    if not data.get('success'):
        raise SystemExit(f'{method} {url} failed: {data.get("errors")}')
    return data.get('result')


def upload_files():
    items, size, batches = [], 0, []
    for dp, _, fs in os.walk(DIST):
        for f in fs:
            path = os.path.join(dp, f)
            key = os.path.relpath(path, DIST).replace(os.sep, '/')
            if key == '_redirects':
                continue
            raw = open(path, 'rb').read()
            if len(raw) > 25 * 1024 * 1024:
                raise SystemExit(f'{key} is over the 25 MB KV limit')
            enc = base64.b64encode(raw).decode()
            if size + len(enc) > BATCH_BYTES and items:
                batches.append(items); items, size = [], 0
            items.append({'key': key, 'value': enc, 'base64': True})
            size += len(enc)
    if items:
        batches.append(items)
    total = sum(len(b) for b in batches)
    for i, batch in enumerate(batches, 1):
        with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as tf:
            json.dump(batch, tf)
        try:
            api('PUT', f'{API}/storage/kv/namespaces/{NAMESPACE}/bulk',
                '-H', 'content-type: application/json', '--data-binary', f'@{tf.name}')
        finally:
            os.unlink(tf.name)
        print(f'  uploaded batch {i}/{len(batches)} ({len(batch)} files)')
    return total


def redirects():
    out = {}
    path = os.path.join(DIST, '_redirects')
    if os.path.exists(path):
        for line in open(path):
            parts = line.split()
            if len(parts) >= 2 and not line.startswith('#'):
                out[parts[0]] = parts[1]
    return out


def upload_worker():
    src = open(os.path.join(ROOT, 'deploy', 'worker.js')).read()
    src = src.replace('__REDIRECTS__', json.dumps(redirects())).replace('__PREVIEW__', 'true')
    meta = {
        'main_module': 'worker.js',
        'compatibility_date': '2025-01-01',
        'bindings': [
            {'type': 'kv_namespace', 'name': 'SITE', 'namespace_id': NAMESPACE},
            {'type': 'kv_namespace', 'name': 'DAYPASS', 'namespace_id': DAYPASS_NS},
            # Preview only: show verification codes on screen until SMS/email providers are configured.
            {'type': 'plain_text', 'name': 'DAYPASS_DEMO', 'text': 'true'},
        ],
    }
    with tempfile.TemporaryDirectory() as td:
        wpath = os.path.join(td, 'worker.js')
        open(wpath, 'w').write(src)
        mpath = os.path.join(td, 'metadata.json')
        open(mpath, 'w').write(json.dumps(meta))
        dpath = os.path.join(ROOT, 'server', 'daypass.js')
        api('PUT', f'{API}/workers/scripts/{SCRIPT}',
            '-F', f'metadata=@{mpath};type=application/json',
            '-F', f'worker.js=@{wpath};filename=worker.js;type=application/javascript+module',
            '-F', f'daypass.js=@{dpath};filename=daypass.js;type=application/javascript+module')


def main():
    if not os.path.exists(os.path.join(DIST, 'index.html')):
        raise SystemExit('dist/ is empty. Run: PUBLIC_PREVIEW=1 npm run build')
    print('Uploading files to KV…')
    n = upload_files()
    print(f'  {n} files')
    print('Uploading worker…')
    upload_worker()
    api('POST', f'{API}/workers/scripts/{SCRIPT}/subdomain', '-H', 'content-type: application/json', '--data', '{"enabled": true}')
    sub = api('GET', f'{API}/workers/subdomain')['subdomain']
    print(f'Live at https://{SCRIPT}.{sub}.workers.dev/')
    if '--skip-domain' not in sys.argv:
        api('PUT', f'{API}/workers/domains', '-H', 'content-type: application/json', '--data',
            json.dumps({'environment': 'production', 'hostname': HOSTNAME, 'service': SCRIPT, 'zone_id': ZONE}))
        print(f'Custom domain: https://{HOSTNAME}/')


if __name__ == '__main__':
    main()

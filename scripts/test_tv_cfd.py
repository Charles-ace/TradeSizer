import urllib.request
import json

tickers = [
    'FOREXCOM:USOIL', 'FOREXCOM:SPX500', 'FOREXCOM:US30', 'FOREXCOM:NAS100',
    'FOREXCOM:XAUUSD', 'FOREXCOM:XAGUSD', 'FOREXCOM:GER40', 'FOREXCOM:UK100',
    'FOREXCOM:JPN225', 'FOREXCOM:AUS200', 'FOREXCOM:FRA40'
]

endpoints = ['cfd', 'forex', 'global', 'america', 'crypto', 'commodities']

for ep in endpoints:
    payload = {'symbols': {'tickers': tickers}, 'columns': ['name', 'close', 'bid', 'ask']}
    req = urllib.request.Request(
        f'https://scanner.tradingview.com/{ep}/scan',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"{ep} totalCount: {data.get('totalCount')}")
            for item in data.get('data', []):
                print('  ', item['s'], item['d'])
    except Exception as e:
        print(f"{ep}: error ({e})")

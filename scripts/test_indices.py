import urllib.request
import json

test_indices = ['SPX500', 'US500', 'NAS100', 'US100', 'US30', 'GER40', 'UK100', 'JPN225', 'JP225', 'AUS200', 'FRA40']

for idx in test_indices:
    payload = {
        'filter': [{'left': 'name', 'operation': 'equal', 'right': idx}],
        'columns': ['name', 'exchange', 'description', 'close']
    }
    req = urllib.request.Request(
        'https://scanner.tradingview.com/cfd/scan',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        cnt = data.get('totalCount', 0)
        print(f"{idx} in CFD: {cnt} matches")
        for item in data.get('data', [])[:3]:
            print('  ', item['s'], item['d'])

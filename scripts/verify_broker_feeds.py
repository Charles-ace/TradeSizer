import urllib.request
import json

def fetch_tv(endpoint, tickers):
    payload = {
        'symbols': {'tickers': tickers},
        'columns': ['name', 'close', 'bid', 'ask']
    }
    req = urllib.request.Request(
        f'https://scanner.tradingview.com/{endpoint}/scan',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode('utf-8'))

# 1. FOREX.COM 30 Forex pairs
fx_pairs = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD', 'USDCAD', 'USDCHF', 'USDMXN', 'USDZAR',
    'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY',
    'EURAUD', 'EURCAD', 'EURCHF', 'EURNZD',
    'GBPAUD', 'GBPCAD', 'GBPCHF', 'GBPNZD',
    'AUDCAD', 'AUDCHF', 'AUDNZD',
    'NZDCHF', 'NZDCAD', 'CADCHF'
]
fx_tickers = [f"FOREXCOM:{p}" for p in fx_pairs]
fx_data = fetch_tv('forex', fx_tickers)
prices = {}

for row in fx_data.get('data', []):
    ticker = row['s'].replace('FOREXCOM:', '')
    close = row['d'][1]
    prices[ticker] = close

print(f"Loaded {len(prices)}/{len(fx_pairs)} Forex pairs from FOREX.COM:")
for p in fx_pairs[:5]:
    print(f"  {p}: {prices.get(p)}")

# 2. Commodities (Gold & Oil from FOREX.COM / FX)
cfd_tickers = ['FOREXCOM:XAUUSD', 'FX:USOIL']
cfd_data = fetch_tv('cfd', cfd_tickers)
for row in cfd_data.get('data', []):
    s = row['s']
    if 'XAUUSD' in s:
        prices['XAUUSD'] = row['d'][1]
    elif 'USOIL' in s:
        prices['USOIL'] = row['d'][1]

# Silver from global TVC
silv_data = fetch_tv('global', ['TVC:SILVER'])
for row in silv_data.get('data', []):
    prices['XAGUSD'] = row['d'][1]

print("\nLoaded Commodities:")
print(f"  XAUUSD (FOREX.COM): {prices.get('XAUUSD')}")
print(f"  USOIL (FOREX.COM/FX): {prices.get('USOIL')}")
print(f"  XAGUSD (Spot): {prices.get('XAGUSD')}")

# 3. Crypto from COINBASE
crypto_data = fetch_tv('crypto', ['COINBASE:BTCUSD', 'COINBASE:ETHUSD'])
for row in crypto_data.get('data', []):
    s = row['s']
    if 'BTCUSD' in s:
        prices['BTCUSD'] = row['d'][1]
    elif 'ETHUSD' in s:
        prices['ETHUSD'] = row['d'][1]

print("\nLoaded Cryptos from COINBASE:")
print(f"  BTCUSD (COINBASE): {prices.get('BTCUSD')}")
print(f"  ETHUSD (COINBASE): {prices.get('ETHUSD')}")

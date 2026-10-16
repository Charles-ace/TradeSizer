import urllib.request
import json

def query_tv(endpoint, tickers):
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

# 1. FOREX.COM Forex pairs
fx_tickers = ['FOREXCOM:' + p for p in [
    'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD', 'USDCAD', 'USDCHF', 'USDMXN', 'USDZAR',
    'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY',
    'EURAUD', 'EURCAD', 'EURCHF', 'EURNZD',
    'GBPAUD', 'GBPCAD', 'GBPCHF', 'GBPNZD',
    'AUDCAD', 'AUDCHF', 'AUDNZD',
    'NZDCHF', 'NZDCAD', 'CADCHF'
]]
print('--- FOREX.COM FX ---')
fx_res = query_tv('forex', fx_tickers)
print('Count:', fx_res.get('totalCount'))
for item in fx_res.get('data', []):
    print(f"  {item['s']}: close={item['d'][1]}, bid={item['d'][2]}, ask={item['d'][3]}")

# 2. FOREX.COM CFD (Metals, Oil, Indices)
cfd_tickers = ['FOREXCOM:' + p for p in [
    'XAUUSD', 'XAGUSD', 'USOIL', 'SPX500', 'NAS100', 'US30', 'GER40', 'UK100', 'JPN225', 'AUS200', 'FRA40'
]]
print('\n--- FOREX.COM CFD ---')
cfd_res = query_tv('cfd', cfd_tickers)
print('Count:', cfd_res.get('totalCount'))
for item in cfd_res.get('data', []):
    print(f"  {item['s']}: close={item['d'][1]}, bid={item['d'][2]}, ask={item['d'][3]}")

# 3. COINBASE Crypto
crypto_tickers = ['COINBASE:BTCUSD', 'COINBASE:ETHUSD']
print('\n--- COINBASE CRYPTO ---')
crypto_res = query_tv('crypto', crypto_tickers)
print('Count:', crypto_res.get('totalCount'))
for item in crypto_res.get('data', []):
    print(f"  {item['s']}: close={item['d'][1]}, bid={item['d'][2]}, ask={item['d'][3]}")

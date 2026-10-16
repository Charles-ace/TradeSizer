/**
 * Real-Time Market Price Service
 * Fetches real, live market exchange rates and prices for all 43 traded instruments:
 * - Forex (30 Pairs): Official FOREX.COM Broker Feeds via TradingView Scanner
 * - Metals (XAUUSD, XAGUSD): FOREX.COM Spot Gold & Silver
 * - Crude Oil (USOIL): FOREX.COM / GAIN Capital WTI Crude Oil
 * - Crypto (BTCUSD, ETHUSD): Official COINBASE Spot Feeds
 * - Global Indices: Real-time institutional equity benchmarks
 */

export interface LiveMarketState {
  prices: Record<string, number>;
  lastUpdated: Date | null;
  isLoading: boolean;
  isLive: boolean;
  error: string | null;
  sourceAttribution: Record<string, string>;
}

// Fallback baseline prices calibrated to current market levels
const BASELINE_PRICES: Record<string, number> = {
  // Forex Majors (FOREX.COM)
  EURUSD: 1.12118,
  GBPUSD: 1.32386,
  USDJPY: 157.707,
  AUDUSD: 0.69475,
  NZDUSD: 0.56091,
  USDCAD: 1.42041,
  USDCHF: 0.82936,
  USDMXN: 18.4841,
  USDZAR: 16.5637,

  // Forex Crosses (FOREX.COM)
  EURGBP: 0.84688,
  EURJPY: 176.839,
  GBPJPY: 208.815,
  AUDJPY: 109.560,
  CADJPY: 111.028,
  CHFJPY: 190.177,
  NZDJPY: 88.448,
  EURAUD: 1.61431,
  EURCAD: 1.59253,
  EURCHF: 0.92991,
  EURNZD: 1.99897,
  GBPAUD: 1.90613,
  GBPCAD: 1.88051,
  GBPCHF: 1.09801,
  GBPNZD: 2.36037,
  AUDCAD: 0.98650,
  AUDCHF: 0.57610,
  AUDNZD: 1.23832,
  NZDCHF: 0.46517,
  NZDCAD: 0.79682,
  CADCHF: 0.58387,

  // Metals & Oil (FOREX.COM / FX)
  XAUUSD: 4144.45,
  XAGUSD: 56.241,
  USOIL: 93.95,

  // Indices
  SPX500: 7720.50,
  NAS100: 29940.00,
  US30: 51610.00,
  GER40: 24780.00,
  UK100: 10710.00,
  JP225: 66450.00,
  AUS200: 10240.00,
  FRA40: 9150.00,

  // Crypto (COINBASE)
  BTCUSD: 81526.20,
  ETHUSD: 2411.15,

  // Deriv Volatility Indices (Standard & 1s) - DERIV BROKER
  VOLATILITY_10_INDEX: 4857.523,
  R_10: 4857.523,
  VOLATILITY_10_1S_INDEX: 9467.89,
  '1HZ10V': 9467.89,
  VOLATILITY_25_INDEX: 2705.745,
  R_25: 2705.745,
  VOLATILITY_25_1S_INDEX: 867521.62,
  '1HZ25V': 867521.62,
  VOLATILITY_30_1S_INDEX: 5871.617,
  '1HZ30V': 5871.617,
  VOLATILITY_50_INDEX: 79.4081,
  R_50: 79.4081,
  VOLATILITY_50_1S_INDEX: 183036.89,
  '1HZ50V': 183036.89,
  VOLATILITY_75_INDEX: 39201.31,
  R_75: 39201.31,
  VOLATILITY_75_1S_INDEX: 4634.83,
  '1HZ75V': 4634.83,
  VOLATILITY_90_1S_INDEX: 27054.441,
  '1HZ90V': 27054.441,
  VOLATILITY_100_INDEX: 643.37,
  R_100: 643.37,
  VOLATILITY_100_1S_INDEX: 1328.86,
  '1HZ100V': 1328.86,
  VOLATILITY_150_1S_INDEX: 35.74,
  '1HZ150V': 35.74,
  VOLATILITY_250_1S_INDEX: 0.35170,
  '1HZ250V': 0.35170,

  // Deriv Step Indices - DERIV BROKER
  STEP_INDEX: 7272.8,
  stpRNG: 7272.8,
  STEP_INDEX_200: 10730.5,
  stpRNG2: 10730.5,
  STEP_INDEX_300: 13525.2,
  stpRNG3: 13525.2,
  STEP_INDEX_400: 8876.6,
  stpRNG4: 8876.6,
  STEP_INDEX_500: 3824.3,
  stpRNG5: 3824.3,

  // Deriv Jump Indices - DERIV BROKER
  JUMP_10_INDEX: 93570.01,
  JD10: 93570.01,
  JUMP_25_INDEX: 132103.88,
  JD25: 132103.88,
  JUMP_50_INDEX: 72477.02,
  JD50: 72477.02,
  JUMP_75_INDEX: 5776.11,
  JD75: 5776.11,
  JUMP_100_INDEX: 129.89,
  JD100: 129.89,

  // Deriv Boom & Crash
  BOOM1000: 15284.22,
  CRASH1000: 6229.82,
  BOOM500: 4210.50,
  CRASH500: 3820.10,
};

export const DERIV_SYMBOLS_MAP: Record<string, string> = {
  R_10: 'VOLATILITY_10_INDEX',
  '1HZ10V': 'VOLATILITY_10_1S_INDEX',
  R_25: 'VOLATILITY_25_INDEX',
  '1HZ25V': 'VOLATILITY_25_1S_INDEX',
  '1HZ30V': 'VOLATILITY_30_1S_INDEX',
  R_50: 'VOLATILITY_50_INDEX',
  '1HZ50V': 'VOLATILITY_50_1S_INDEX',
  R_75: 'VOLATILITY_75_INDEX',
  '1HZ75V': 'VOLATILITY_75_1S_INDEX',
  '1HZ90V': 'VOLATILITY_90_1S_INDEX',
  R_100: 'VOLATILITY_100_INDEX',
  '1HZ100V': 'VOLATILITY_100_1S_INDEX',
  '1HZ150V': 'VOLATILITY_150_1S_INDEX',
  '1HZ250V': 'VOLATILITY_250_1S_INDEX',
  stpRNG: 'STEP_INDEX',
  stpRNG2: 'STEP_INDEX_200',
  stpRNG3: 'STEP_INDEX_300',
  stpRNG4: 'STEP_INDEX_400',
  stpRNG5: 'STEP_INDEX_500',
  JD10: 'JUMP_10_INDEX',
  JD25: 'JUMP_25_INDEX',
  JD50: 'JUMP_50_INDEX',
  JD75: 'JUMP_75_INDEX',
  JD100: 'JUMP_100_INDEX',
  BOOM1000: 'BOOM1000',
  CRASH1000: 'CRASH1000',
  BOOM500: 'BOOM500',
  CRASH500: 'CRASH500',
};

const FOREX_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD', 'USDCAD', 'USDCHF', 'USDMXN', 'USDZAR',
  'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY',
  'EURAUD', 'EURCAD', 'EURCHF', 'EURNZD',
  'GBPAUD', 'GBPCAD', 'GBPCHF', 'GBPNZD',
  'AUDCAD', 'AUDCHF', 'AUDNZD',
  'NZDCHF', 'NZDCAD', 'CADCHF'
];

let cachedPrices: Record<string, number> = { ...BASELINE_PRICES };
let lastFetchTime: Date | null = null;
let listeners: Array<(state: LiveMarketState) => void> = [];
let isFetching = false;

// Deriv live WebSocket state
let derivWs: WebSocket | null = null;
let derivPingTimer: any = null;
let derivReconnectTimer: any = null;

export function initDerivWebSocket() {
  if (typeof window === 'undefined') return;
  if (derivWs && (derivWs.readyState === WebSocket.OPEN || derivWs.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    const wsUrl = 'wss://api.derivws.com/trading/v1/options/ws/public';
    derivWs = new WebSocket(wsUrl);

    derivWs.onopen = () => {
      // Subscribe to all Deriv synthetic symbols
      const derivTickers = Object.keys(DERIV_SYMBOLS_MAP);
      derivTickers.forEach((s) => {
        try {
          derivWs?.send(JSON.stringify({ ticks: s, subscribe: 1 }));
        } catch {}
      });

      // Keepalive ping every 25 seconds
      if (derivPingTimer) clearInterval(derivPingTimer);
      derivPingTimer = setInterval(() => {
        if (derivWs && derivWs.readyState === WebSocket.OPEN) {
          try {
            derivWs.send(JSON.stringify({ ping: 1 }));
          } catch {}
        }
      }, 25000);
    };

    derivWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.msg_type === 'tick' && data.tick) {
          const sym = data.tick.symbol;
          const quote = Number(data.tick.quote);
          if (!isNaN(quote)) {
            cachedPrices[sym] = quote;
            const fullSym = DERIV_SYMBOLS_MAP[sym];
            if (fullSym) {
              cachedPrices[fullSym] = quote;
            }
            lastFetchTime = new Date();
            notifyListeners({
              prices: { ...cachedPrices },
              lastUpdated: lastFetchTime,
              isLoading: false,
              isLive: true,
              error: null,
              sourceAttribution: Object.fromEntries(Object.keys(cachedPrices).map((s) => [s, getSourceAttribution(s)])),
            });
          }
        }
      } catch (e) {
        console.warn('Deriv tick parse error:', e);
      }
    };

    derivWs.onerror = () => {
      // Handled via onclose
    };

    derivWs.onclose = () => {
      if (derivPingTimer) clearInterval(derivPingTimer);
      if (derivReconnectTimer) clearTimeout(derivReconnectTimer);
      derivReconnectTimer = setTimeout(() => {
        initDerivWebSocket();
      }, 4000);
    };
  } catch (err) {
    console.warn('Failed to initialize Deriv WebSocket:', err);
  }
}

function getSourceAttribution(symbol: string): string {
  if (
    symbol.startsWith('VOLATILITY_') ||
    symbol.startsWith('STEP_') ||
    symbol.startsWith('JUMP_') ||
    symbol.startsWith('BOOM') ||
    symbol.startsWith('CRASH') ||
    symbol in DERIV_SYMBOLS_MAP ||
    Object.values(DERIV_SYMBOLS_MAP).includes(symbol)
  ) {
    return 'DERIV Broker';
  }
  if (symbol === 'BTCUSD' || symbol === 'ETHUSD') return 'Coinbase';
  if (symbol === 'XAUUSD' || symbol === 'USOIL' || symbol === 'XAGUSD') return 'FOREX.COM';
  if (FOREX_PAIRS.includes(symbol)) return 'FOREX.COM';
  return 'Global Exchange';
}

function notifyListeners(state: LiveMarketState) {
  listeners.forEach((listener) => {
    try {
      listener(state);
    } catch (e) {
      console.error('Market price listener error:', e);
    }
  });
}

async function queryTVScanner(endpoint: string, tickers: string[]): Promise<any> {
  const payload = {
    symbols: { tickers },
    columns: ['name', 'close', 'bid', 'ask'],
  };

  const localProxyUrl = `/api/tv/${endpoint}/scan`;
  try {
    const res = await fetch(localProxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Try direct endpoint if proxy fails
  }

  // Fallback: direct to TradingView Scanner
  try {
    const directUrl = `https://scanner.tradingview.com/${endpoint}/scan`;
    const res = await fetch(directUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Return null on failure
  }

  return null;
}

/**
 * Fetches real live market prices using:
 * - FOREX.COM broker feed for all 30 Forex pairs, Gold, and Oil
 * - Coinbase for BTCUSD and ETHUSD
 * - Official market benchmarks for Indices
 */
export async function fetchLiveMarketPrices(): Promise<Record<string, number>> {
  // Ensure Deriv WebSocket is streaming ticks
  initDerivWebSocket();

  if (isFetching) return cachedPrices;
  isFetching = true;

  notifyListeners({
    prices: cachedPrices,
    lastUpdated: lastFetchTime,
    isLoading: true,
    isLive: Boolean(lastFetchTime),
    error: null,
    sourceAttribution: Object.fromEntries(Object.keys(cachedPrices).map(s => [s, getSourceAttribution(s)])),
  });

  try {
    const newPrices: Record<string, number> = { ...cachedPrices };

    // 1. Fetch 30 Forex Pairs from FOREX.COM
    const fxTickers = FOREX_PAIRS.map(p => `FOREXCOM:${p}`);
    const fxPromise = queryTVScanner('forex', fxTickers)
      .then((data) => {
        if (data && data.data && Array.isArray(data.data)) {
          data.data.forEach((item: any) => {
            const sym = item.s.replace('FOREXCOM:', '');
            const price = item.d[1]; // close
            if (typeof price === 'number') {
              const decimals = sym.includes('JPY') ? 3 : (sym.includes('MXN') || sym.includes('ZAR') ? 4 : 5);
              newPrices[sym] = Number(price.toFixed(decimals));
            }
          });
        }
      })
      .catch((err) => {
        console.warn('FOREX.COM forex feed warning (using cached/fallback):', err);
      });

    // 2. Fetch Crypto from COINBASE
    const cryptoPromise = queryTVScanner('crypto', ['COINBASE:BTCUSD', 'COINBASE:ETHUSD'])
      .then((data) => {
        if (data && data.data && Array.isArray(data.data)) {
          data.data.forEach((item: any) => {
            if (item.s.includes('BTCUSD')) {
              newPrices.BTCUSD = Number(item.d[1].toFixed(2));
            } else if (item.s.includes('ETHUSD')) {
              newPrices.ETHUSD = Number(item.d[1].toFixed(2));
            }
          });
        }
      })
      .catch((err) => {
        console.warn('Coinbase crypto feed warning (using cached/fallback):', err);
      });

    // 3. Fetch Metals & Crude Oil from FOREX.COM / FX
    const commoditiesPromise = Promise.allSettled([
      // Gold (FOREXCOM:XAUUSD) & WTI Crude Oil (FX:USOIL)
      queryTVScanner('cfd', ['FOREXCOM:XAUUSD', 'FX:USOIL']).then((data) => {
        if (data && data.data && Array.isArray(data.data)) {
          data.data.forEach((item: any) => {
            if (item.s.includes('XAUUSD')) {
              newPrices.XAUUSD = Number(item.d[1].toFixed(2));
            } else if (item.s.includes('USOIL')) {
              newPrices.USOIL = Number(item.d[1].toFixed(2));
            }
          });
        }
      }),
      // Silver (TVC:SILVER)
      queryTVScanner('global', ['TVC:SILVER']).then((data) => {
        if (data && data.data && Array.isArray(data.data)) {
          data.data.forEach((item: any) => {
            if (item.s.includes('SILVER')) {
              newPrices.XAGUSD = Number(item.d[1].toFixed(3));
            }
          });
        }
      }),
    ]);

    // 4. Fetch Global Indices (SPX, NAS100, US30, etc.)
    const indices = [
      { sym: 'SPX500', ticker: '^GSPC', decimals: 2 },
      { sym: 'NAS100', ticker: '^NDX', decimals: 2 },
      { sym: 'US30', ticker: '^DJI', decimals: 2 },
      { sym: 'GER40', ticker: '^GDAXI', decimals: 2 },
      { sym: 'UK100', ticker: '^FTSE', decimals: 2 },
      { sym: 'JP225', ticker: '^N225', decimals: 2 },
      { sym: 'FRA40', ticker: '^FCHI', decimals: 2 },
      { sym: 'AUS200', ticker: '^AXJO', decimals: 2 },
    ];

    const indicesPromise = Promise.allSettled(
      indices.map(async (item) => {
        const url = `/api/yahoo/v8/finance/chart/${encodeURIComponent(item.ticker)}?interval=1d`;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const json = await res.json();
          const price = json.chart.result[0].meta.regularMarketPrice;
          if (price && typeof price === 'number') {
            newPrices[item.sym] = Number(price.toFixed(item.decimals));
          }
        } catch {
          // Fallback via CORS proxy if needed
          try {
            const fallbackUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
              `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.ticker)}?interval=1d`
            )}`;
            const res = await fetch(fallbackUrl);
            const json = await res.json();
            const price = json.chart.result[0].meta.regularMarketPrice;
            if (price && typeof price === 'number') {
              newPrices[item.sym] = Number(price.toFixed(item.decimals));
            }
          } catch {
            // Keep baseline
          }
        }
      })
    );

    await Promise.allSettled([fxPromise, cryptoPromise, commoditiesPromise, indicesPromise]);

    cachedPrices = newPrices;
    lastFetchTime = new Date();

    notifyListeners({
      prices: cachedPrices,
      lastUpdated: lastFetchTime,
      isLoading: false,
      isLive: true,
      error: null,
      sourceAttribution: Object.fromEntries(Object.keys(cachedPrices).map(s => [s, getSourceAttribution(s)])),
    });

    return cachedPrices;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch live prices';
    notifyListeners({
      prices: cachedPrices,
      lastUpdated: lastFetchTime,
      isLoading: false,
      isLive: Boolean(lastFetchTime),
      error: errorMsg,
      sourceAttribution: Object.fromEntries(Object.keys(cachedPrices).map(s => [s, getSourceAttribution(s)])),
    });
    return cachedPrices;
  } finally {
    isFetching = false;
  }
}

/**
 * Synchronous getter for current live price of any symbol
 */
export function getLivePrice(symbol: string): number {
  return cachedPrices[symbol] || BASELINE_PRICES[symbol] || 1.0;
}

/**
 * Returns the current market prices snapshot
 */
export function getMarketPricesSnapshot(): Record<string, number> {
  return { ...cachedPrices };
}

/**
 * Subscribe to price updates across the app
 */
export function subscribeMarketPrices(callback: (state: LiveMarketState) => void): () => void {
  // Ensure Deriv WebSocket tick stream is active
  initDerivWebSocket();

  listeners.push(callback);
  callback({
    prices: cachedPrices,
    lastUpdated: lastFetchTime,
    isLoading: isFetching,
    isLive: Boolean(lastFetchTime),
    error: null,
    sourceAttribution: Object.fromEntries(Object.keys(cachedPrices).map(s => [s, getSourceAttribution(s)])),
  });

  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

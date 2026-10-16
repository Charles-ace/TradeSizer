import React, { useState, useMemo, useEffect } from 'react';
import type {
  CalculationInputs,
  InstrumentSpec,
  StopDistanceUnit,
} from '../types';
import {
  INSTRUMENT_CATALOG,
  resolveInstrument,
} from '../constants/instruments';
import { BrokerSpecsEditor } from './BrokerSpecsEditor';
import {
  fetchLiveMarketPrices,
  subscribeMarketPrices,
  getLivePrice,
  type LiveMarketState,
} from '../services/marketPrices';
import {
  Search,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Sliders,
} from 'lucide-react';

interface TradeSetupFormProps {
  inputs: CalculationInputs;
  activeSpec: InstrumentSpec;
  errors?: string[];
  onChangeInput: <K extends keyof CalculationInputs>(field: K, value: CalculationInputs[K]) => void;
  onUpdateSpec: (updated: Partial<InstrumentSpec>) => void;
  onSelectInstrument: (spec: InstrumentSpec) => void;
  onResetSpecToDefault: () => void;
}

export const TradeSetupForm: React.FC<TradeSetupFormProps> = ({
  inputs,
  activeSpec,
  errors: _errors,
  onChangeInput,
  onUpdateSpec,
  onSelectInstrument,
  onResetSpecToDefault,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubFilter, setActiveSubFilter] = useState<'all' | 'synthetics' | 'majors' | 'crosses' | 'crypto' | 'metals' | 'indices'>('all');
  const [inputMode, setInputMode] = useState<'price' | 'pips'>('price');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [marketState, setMarketState] = useState<LiveMarketState>({
    prices: {},
    lastUpdated: null,
    isLoading: false,
    isLive: false,
    error: null,
    sourceAttribution: {},
  });

  // Subscribe to real-time market prices
  useEffect(() => {
    const unsub = subscribeMarketPrices((state) => {
      setMarketState(state);
    });
    fetchLiveMarketPrices();
    return () => unsub();
  }, []);

  // Quick Curated Symbol Groups
  const quickFilters = [
    { id: 'all', label: 'All 67 Instruments' },
    { id: 'synthetics', label: 'Deriv Volatilities' },
    { id: 'majors', label: 'Majors' },
    { id: 'crosses', label: 'Crosses' },
    { id: 'crypto', label: 'BTC / ETH' },
    { id: 'metals', label: 'Gold & Oil' },
    { id: 'indices', label: 'Indices' },
  ] as const;

  const derivSynthetics = [
    'VOLATILITY_75_INDEX',
    'VOLATILITY_100_1S_INDEX',
    'STEP_INDEX',
    'JUMP_50_INDEX',
    'VOLATILITY_10_INDEX',
    'VOLATILITY_10_1S_INDEX',
    'VOLATILITY_25_INDEX',
    'VOLATILITY_25_1S_INDEX',
    'VOLATILITY_30_1S_INDEX',
    'VOLATILITY_50_INDEX',
    'VOLATILITY_50_1S_INDEX',
    'VOLATILITY_75_1S_INDEX',
    'VOLATILITY_90_1S_INDEX',
    'VOLATILITY_100_INDEX',
    'VOLATILITY_150_1S_INDEX',
    'VOLATILITY_250_1S_INDEX',
    'STEP_INDEX_200',
    'STEP_INDEX_300',
    'STEP_INDEX_400',
    'STEP_INDEX_500',
    'JUMP_10_INDEX',
    'JUMP_25_INDEX',
    'JUMP_75_INDEX',
    'JUMP_100_INDEX',
    'BOOM1000',
    'CRASH1000',
    'BOOM500',
    'CRASH500',
  ];

  const forexMajorsAndUSD = [
    'EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD',
    'USDJPY', 'USDCHF', 'USDCAD', 'USDMXN', 'USDZAR'
  ];

  const forexCrosses = [
    'EURJPY', 'GBPJPY', 'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY',
    'EURGBP', 'EURAUD', 'EURCAD', 'EURCHF', 'EURNZD',
    'GBPAUD', 'GBPCAD', 'GBPCHF', 'GBPNZD',
    'AUDCAD', 'AUDCHF', 'AUDNZD',
    'NZDCHF', 'NZDCAD',
    'CADCHF'
  ];

  const metalsAndCommodities = [
    'XAUUSD', 'XAGUSD', 'USOIL'
  ];

  const globalIndices = [
    'AUS200', 'FRA40', 'GER40', 'JP225', 'SPX500', 'UK100', 'US30', 'NAS100'
  ];

  const cryptocurrencies = [
    'BTCUSD', 'ETHUSD'
  ];

  const all67Symbols = useMemo(() => [
    ...derivSynthetics,
    ...forexMajorsAndUSD,
    ...forexCrosses,
    ...cryptocurrencies,
    ...metalsAndCommodities,
    ...globalIndices,
  ], []);

  // Filtered symbols based on query and filter
  const filteredInstruments = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toUpperCase();
      return INSTRUMENT_CATALOG.filter((i) => i.symbol.includes(q) || i.name.toUpperCase().includes(q));
    }

    let symbols = all67Symbols;
    if (activeSubFilter === 'synthetics') symbols = derivSynthetics;
    else if (activeSubFilter === 'majors') symbols = forexMajorsAndUSD;
    else if (activeSubFilter === 'crosses') symbols = forexCrosses;
    else if (activeSubFilter === 'crypto') symbols = cryptocurrencies;
    else if (activeSubFilter === 'metals') symbols = metalsAndCommodities;
    else if (activeSubFilter === 'indices') symbols = globalIndices;

    return symbols
      .map((s) => resolveInstrument(s))
      .filter((i): i is InstrumentSpec => Boolean(i));
  }, [searchQuery, activeSubFilter, all67Symbols]);

  // Fast popular chips
  const popularFastSymbols = [
    'VOLATILITY_75_INDEX', 'VOLATILITY_100_1S_INDEX', 'STEP_INDEX',
    'EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD', 'NAS100'
  ];

  // Current live market price for active instrument
  const livePrice = useMemo(() => {
    return marketState.prices[activeSpec.symbol] || getLivePrice(activeSpec.symbol);
  }, [marketState.prices, activeSpec.symbol]);

  // Format price cleanly based on instrument precision
  const formatPrice = (val: number, sym: string) => {
    if (sym === 'BTCUSD') return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (sym === 'ETHUSD' || sym === 'XAUUSD') return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (sym.includes('JPY')) return val.toFixed(3);
    if (sym === 'USOIL' || sym === 'XAGUSD') return val.toFixed(3);
    if (sym === 'SPX500' || sym === 'NAS100' || sym === 'US30') return val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (sym.includes('250_1S')) return val.toFixed(5);
    if (sym.includes('50_INDEX')) return val.toFixed(4);
    if (sym.includes('STEP')) return val.toFixed(1);
    if (sym.includes('75_INDEX') || sym.includes('90_1S') || sym.includes('30_1S') || sym.includes('10_INDEX') || sym.includes('25_INDEX')) return val.toFixed(3);
    if (sym.includes('VOLATILITY') || sym.includes('JUMP') || sym.includes('BOOM') || sym.includes('CRASH')) return val.toFixed(2);
    return val.toFixed(5);
  };

  // Select a new symbol and auto-populate real price and defaults
  const handleSelectSymbol = (symbol: string) => {
    const found = resolveInstrument(symbol, inputs.category);
    onSelectInstrument(found);
    onChangeInput('category', found.category);

    const price = marketState.prices[found.symbol] || getLivePrice(found.symbol);
    onChangeInput('entryPrice', price);

    // Set smart defaults
    if (found.category === 'deriv_synthetics') {
      const isLargeIndex = found.symbol.includes('75_INDEX') || found.symbol.includes('25_1S') || found.symbol.includes('50_1S') || found.symbol.includes('JUMP');
      const stopDelta = isLargeIndex ? Math.max(10, Number((price * 0.005).toFixed(2))) : (found.symbol.includes('STEP') ? 5 : 10);
      const stop = inputs.direction === 'long' ? price - stopDelta : price + stopDelta;
      const take = inputs.direction === 'long' ? price + stopDelta * 3 : price - stopDelta * 3;
      const decimals = found.symbol.includes('250_1S') ? 5 : (found.symbol.includes('50_INDEX') ? 4 : (found.symbol.includes('STEP') ? 1 : 2));
      onChangeInput('stopLossUnit', 'price');
      onChangeInput('stopLossDistance', stopDelta);
      onChangeInput('stopLossPrice', Number(stop.toFixed(decimals)));
      onChangeInput('takeProfitPrice', Number(take.toFixed(decimals)));
    } else if (found.category === 'crypto') {
      const isBTC = found.symbol === 'BTCUSD';
      const stopDelta = isBTC ? 1000 : 50;
      const stop = inputs.direction === 'long' ? price - stopDelta : price + stopDelta;
      const take = inputs.direction === 'long' ? price + stopDelta * 3 : price - stopDelta * 3;
      onChangeInput('stopLossUnit', 'price');
      onChangeInput('stopLossDistance', stopDelta);
      onChangeInput('stopLossPrice', Number(stop.toFixed(2)));
      onChangeInput('takeProfitPrice', Number(take.toFixed(2)));
    } else if (found.category === 'metals') {
      const isGold = found.symbol === 'XAUUSD';
      const stopDelta = isGold ? 10 : 0.8;
      const stop = inputs.direction === 'long' ? price - stopDelta : price + stopDelta;
      const take = inputs.direction === 'long' ? price + stopDelta * 3 : price - stopDelta * 3;
      onChangeInput('stopLossUnit', 'price');
      onChangeInput('stopLossDistance', stopDelta);
      onChangeInput('stopLossPrice', Number(stop.toFixed(2)));
      onChangeInput('takeProfitPrice', Number(take.toFixed(2)));
    } else if (found.category === 'indices') {
      const stopDelta = 50;
      const stop = inputs.direction === 'long' ? price - stopDelta : price + stopDelta;
      const take = inputs.direction === 'long' ? price + stopDelta * 3 : price - stopDelta * 3;
      onChangeInput('stopLossUnit', 'points');
      onChangeInput('stopLossDistance', stopDelta);
      onChangeInput('stopLossPrice', Number(stop.toFixed(1)));
      onChangeInput('takeProfitPrice', Number(take.toFixed(1)));
    } else {
      // Forex
      const pipSize = found.pipSize || 0.0001;
      const stopPips = 15.0;
      const priceDelta = stopPips * pipSize;
      const stop = inputs.direction === 'long' ? price - priceDelta : price + priceDelta;
      const take = inputs.direction === 'long' ? price + priceDelta * 3 : price - priceDelta * 3;
      const precision = found.symbol.includes('JPY') ? 3 : 5;
      onChangeInput('stopLossUnit', 'pips');
      onChangeInput('stopLossDistance', stopPips);
      onChangeInput('stopLossPrice', Number(stop.toFixed(precision)));
      onChangeInput('takeProfitPrice', Number(take.toFixed(precision)));
    }

    if (found.defaultExchangeRate) {
      onChangeInput('exchangeRate', found.defaultExchangeRate);
    }
  };

  // Sync Entry, Stop Price, and Take Level Price
  const handleEntryChange = (val: number | null) => {
    onChangeInput('entryPrice', val);
    if (val && inputs.stopLossPrice) {
      recalculateDistance(val, inputs.stopLossPrice);
    }
  };

  const handleStopPriceChange = (val: number | null) => {
    onChangeInput('stopLossPrice', val);
    if (inputs.entryPrice && val) {
      recalculateDistance(inputs.entryPrice, val);
    }
  };

  const recalculateDistance = (entry: number, stop: number) => {
    const delta = Math.abs(entry - stop);
    if (activeSpec.category === 'forex') {
      const pipSize = activeSpec.pipSize || 0.0001;
      const pips = Number((delta / pipSize).toFixed(1));
      onChangeInput('stopLossUnit', 'pips');
      onChangeInput('stopLossDistance', pips > 0 ? pips : 1);
    } else {
      onChangeInput('stopLossUnit', 'price');
      onChangeInput('stopLossDistance', Number(delta.toFixed(activeSpec.category === 'crypto' ? 2 : 4)));
    }
  };

  const handleStopDistanceChange = (dist: number) => {
    onChangeInput('stopLossDistance', dist);
    const entry = inputs.entryPrice ?? livePrice;
    if (entry && entry > 0 && dist > 0) {
      let delta = dist;
      if (activeSpec.category === 'forex') {
        delta = dist * (activeSpec.pipSize || 0.0001);
      }
      const newStop = inputs.direction === 'long' ? entry - delta : entry + delta;
      const decimals = activeSpec.symbol.includes('250_1S')
        ? 5
        : activeSpec.symbol.includes('50_INDEX')
        ? 4
        : activeSpec.symbol.includes('STEP')
        ? 1
        : 2;
      onChangeInput('stopLossPrice', Number(newStop.toFixed(decimals)));
    }
  };

  // Quick R buttons for Take Level Price (+1R, +2R, +3R, +4R)
  const setQuickTakeProfitR = (rMultiple: number) => {
    const entry = inputs.entryPrice ?? livePrice;
    if (!entry) return;

    let priceDelta = 0;
    if (inputs.stopLossPrice) {
      priceDelta = Math.abs(entry - inputs.stopLossPrice);
    } else {
      if (activeSpec.category === 'forex' && inputs.stopLossUnit === 'pips') {
        const pipSize = activeSpec.pipSize || 0.0001;
        priceDelta = inputs.stopLossDistance * pipSize;
      } else {
        priceDelta = inputs.stopLossDistance;
      }
    }

    const precision = activeSpec.category === 'forex'
      ? (activeSpec.symbol.includes('JPY') ? 3 : 5)
      : (activeSpec.category === 'crypto' || activeSpec.category === 'metals' ? 2 : 1);

    const targetPrice = inputs.direction === 'long'
      ? entry + (priceDelta * rMultiple)
      : entry - (priceDelta * rMultiple);

    onChangeInput('takeProfitPrice', Number(targetPrice.toFixed(precision)));
  };

  // Use live market price for entry
  const applyLivePriceToEntry = () => {
    if (livePrice > 0) {
      handleEntryChange(livePrice);
    }
  };

  return (
    <div className="neat-card p-3 sm:p-4 space-y-3">
      {/* Live Market Feeds Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--color-ink)]">
            Live Market Active
          </span>
          <span className="text-[10px] font-mono text-[var(--color-ink-muted)] hidden sm:inline">
            (FOREX.COM, Coinbase &amp; DERIV Broker)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Feed provider attribution chip */}
          <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {activeSpec.category === 'deriv_synthetics' ? 'DERIV Broker' : (activeSpec.category === 'crypto' ? 'Coinbase' : 'FOREX.COM')}
          </span>

          {/* Live Price of selected instrument */}
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[var(--color-card-subtle)] border border-[var(--color-border)]">
            <span className="text-[10px] font-mono text-[var(--color-ink-muted)]">{activeSpec.symbol}:</span>
            <span className="text-xs font-mono font-bold text-[var(--color-ink)] tabular-nums">
              {formatPrice(livePrice, activeSpec.symbol)}
            </span>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => fetchLiveMarketPrices()}
            className="neat-press p-1 rounded hover:bg-[var(--color-card-subtle)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer"
            title="Refresh live prices"
          >
            <RefreshCw className={`w-3 h-3 ${marketState.isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Symbol Search & Popular Chips */}
      <div className="space-y-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--color-ink-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 67 instruments (e.g. V75, STEP, BTC, EURUSD, XAUUSD)..."
            className="neat-input w-full pl-8 pr-16 py-1 text-xs font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Filter Categories */}
        <div className="flex items-center flex-wrap gap-1">
          {quickFilters.map((qf) => {
            const isActive = activeSubFilter === qf.id && !searchQuery;
            return (
              <button
                key={qf.id}
                type="button"
                onClick={() => {
                  setActiveSubFilter(qf.id);
                  setSearchQuery('');
                  // Immediately switch to the category's primary asset so activeSpec is never out-of-sync
                  if (qf.id === 'synthetics') handleSelectSymbol('VOLATILITY_75_INDEX');
                  else if (qf.id === 'crypto') handleSelectSymbol('BTCUSD');
                  else if (qf.id === 'metals') handleSelectSymbol('XAUUSD');
                  else if (qf.id === 'indices') handleSelectSymbol('NAS100');
                  else if (qf.id === 'majors') handleSelectSymbol('EURUSD');
                  else if (qf.id === 'crosses') handleSelectSymbol('EURJPY');
                }}
                className={`neat-press text-[10px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-ink)] text-[var(--color-page)] font-bold shadow-xs'
                    : 'bg-[var(--color-card-subtle)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] border border-[var(--color-border)]'
                }`}
              >
                {qf.label}
              </button>
            );
          })}
        </div>

        {/* Popular Quick-Select Chips */}
        <div className="flex items-center flex-wrap gap-1 pt-0.5">
          {popularFastSymbols.map((sym) => {
            const isActive = activeSpec.symbol === sym;
            return (
              <button
                key={sym}
                type="button"
                onClick={() => handleSelectSymbol(sym)}
                className={`neat-press text-[10px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-ink)] text-[var(--color-page)] font-bold shadow-xs'
                    : 'bg-[var(--color-card-subtle)] border border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
                }`}
              >
                {sym}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 1: Currency Pair Dropdown & Direction */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
        {/* Full Pair Dropdown (All 67 Instruments) */}
        <div className="sm:col-span-8">
          <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] mb-1 uppercase tracking-wider">
            Currency Pair ({filteredInstruments.length} available)
          </label>
          <select
            value={activeSpec.symbol}
            onChange={(e) => handleSelectSymbol(e.target.value)}
            className="neat-input w-full px-2.5 py-1.5 font-mono text-xs font-semibold cursor-pointer"
          >
            {!filteredInstruments.some((i) => i.symbol === activeSpec.symbol) && (
              <option value={activeSpec.symbol}>
                {activeSpec.symbol} — {activeSpec.name} ({marketState.prices[activeSpec.symbol] ? formatPrice(marketState.prices[activeSpec.symbol], activeSpec.symbol) : ''})
              </option>
            )}
            {filteredInstruments.map((item) => (
              <option key={item.symbol} value={item.symbol}>
                {item.symbol} — {item.name} ({marketState.prices[item.symbol] ? formatPrice(marketState.prices[item.symbol], item.symbol) : ''})
              </option>
            ))}
          </select>
        </div>

        {/* Direction: BUY (Long) / SELL (Short) */}
        <div className="sm:col-span-4">
          <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] mb-1 uppercase tracking-wider">
            Direction
          </label>
          <div className="grid grid-cols-2 gap-1 p-0.5 rounded-md bg-[var(--color-card-subtle)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => onChangeInput('direction', 'long')}
              className={`neat-press flex items-center justify-center space-x-1 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                inputs.direction === 'long'
                  ? 'bg-[var(--color-card)] text-emerald-400 border border-[var(--color-border)] shadow-xs'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>BUY</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeInput('direction', 'short')}
              className={`neat-press flex items-center justify-center space-x-1 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                inputs.direction === 'short'
                  ? 'bg-[var(--color-card)] text-rose-400 border border-[var(--color-border)] shadow-xs'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <ArrowDown className="w-3.5 h-3.5 text-rose-400" />
              <span>SELL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Account Currency, Account Balance, Risk Percentage */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
        {/* Account Currency (USD default, EUR, GBP, JPY, etc.) */}
        <div className="sm:col-span-3">
          <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] mb-1 uppercase tracking-wider">
            Currency
          </label>
          <select
            value={inputs.accountCurrency}
            onChange={(e) => onChangeInput('accountCurrency', e.target.value)}
            className="neat-input w-full px-2.5 py-1.5 font-mono text-xs font-semibold cursor-pointer"
          >
            {['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CHF', 'NZD', 'ZAR'].map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>

        {/* Account Balance with Quick Presets */}
        <div className="sm:col-span-5">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
              Balance
            </label>
            <div className="flex items-center space-x-1">
              {[5000, 10000, 25000, 50000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChangeInput('accountBalance', preset)}
                  className={`neat-press px-1.5 py-0.2 rounded text-[9px] font-mono cursor-pointer transition-all ${
                    inputs.accountBalance === preset
                      ? 'bg-[var(--color-ink)] text-[var(--color-page)] font-bold'
                      : 'bg-[var(--color-card-subtle)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] border border-[var(--color-border)]'
                  }`}
                >
                  ${preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] font-mono text-xs">
              $
            </span>
            <input
              type="number"
              min="1"
              step="any"
              value={inputs.accountBalance || ''}
              onChange={(e) => onChangeInput('accountBalance', parseFloat(e.target.value) || 0)}
              placeholder="10000"
              className="neat-input w-full pl-6 pr-2.5 py-1 text-xs font-mono font-semibold tabular-nums"
            />
          </div>
        </div>

        {/* Risk Percentage with Quick Presets */}
        <div className="sm:col-span-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
              Risk %
            </label>
            <div className="flex items-center space-x-1">
              {[0.5, 1.0, 1.5, 2.0].map((rPct) => {
                const currentRisk = inputs.customRiskPercentage ?? 1.5;
                const isSelected = Math.abs(currentRisk - rPct) < 0.01;
                return (
                  <button
                    key={rPct}
                    type="button"
                    onClick={() => onChangeInput('customRiskPercentage', rPct)}
                    className={`neat-press px-1.5 py-0.2 rounded text-[9px] font-mono cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[var(--color-ink)] text-[var(--color-page)] font-bold'
                        : 'bg-[var(--color-card-subtle)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] border border-[var(--color-border)]'
                    }`}
                  >
                    {rPct}%
                  </button>
                );
              })}
            </div>
          </div>
          <div className="relative">
            <input
              type="number"
              min="0.01"
              max="50"
              step="0.1"
              value={inputs.customRiskPercentage ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                onChangeInput('customRiskPercentage', val);
              }}
              placeholder="1.5"
              className="neat-input w-full pl-2.5 pr-6 py-1 text-xs font-mono font-semibold tabular-nums"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] font-mono text-xs">
              %
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Input Mode Selector (Price Levels vs Stop Pips) */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
          Input Method
        </span>
        <div className="flex items-center space-x-1 p-0.5 rounded bg-[var(--color-card-subtle)] border border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setInputMode('price')}
            className={`neat-press px-2.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-all ${
              inputMode === 'price'
                ? 'bg-[var(--color-card)] text-[var(--color-ink)] font-bold shadow-xs border border-[var(--color-border)]'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            Price Levels (Entry / Stop / Target)
          </button>
          <button
            type="button"
            onClick={() => setInputMode('pips')}
            className={`neat-press px-2.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-all ${
              inputMode === 'pips'
                ? 'bg-[var(--color-card)] text-[var(--color-ink)] font-bold shadow-xs border border-[var(--color-border)]'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            Stop Distance ({activeSpec.category === 'forex' ? 'Pips' : 'Points'})
          </button>
        </div>
      </div>

      {/* ORDER PRICE LEVELS (Entry Price, Stop Price, Take Level Price) */}
      {inputMode === 'price' ? (
        <div className="p-3 rounded-lg bg-[var(--color-card-subtle)]/70 border border-[var(--color-border)] space-y-2.5">
          {/* Row of 3 direct price fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Field 1: Entry Price */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink)]">
                  Entry Price
                </label>
                <button
                  type="button"
                  onClick={applyLivePriceToEntry}
                  className="text-[9px] font-mono text-emerald-400 hover:underline cursor-pointer"
                  title="Insert current live price"
                >
                  Use Live Price
                </button>
              </div>
              <input
                type="number"
                step="any"
                value={inputs.entryPrice ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : parseFloat(e.target.value);
                  handleEntryChange(val);
                }}
                placeholder={formatPrice(livePrice, activeSpec.symbol)}
                className="neat-input w-full px-2.5 py-1.5 text-xs font-mono font-semibold tabular-nums"
              />
            </div>

            {/* Field 2: Stop Price */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Stop Price
                </label>
                <span className="text-[9px] font-mono text-[var(--color-ink-muted)]">
                  {inputs.entryPrice && inputs.stopLossPrice
                    ? activeSpec.category === 'forex'
                      ? `${(Math.abs(inputs.entryPrice - inputs.stopLossPrice) / (activeSpec.pipSize || 0.0001)).toFixed(1)} pips`
                      : activeSpec.category === 'deriv_synthetics'
                        ? `${Math.abs(inputs.entryPrice - inputs.stopLossPrice).toFixed(activeSpec.symbol.includes('STEP') ? 1 : 2)} pts risk`
                        : `$${Math.abs(inputs.entryPrice - inputs.stopLossPrice).toFixed(activeSpec.category === 'crypto' ? 2 : 4)} risk`
                    : inputs.stopLossDistance > 0 ? `${inputs.stopLossDistance} ${inputs.stopLossUnit}` : ''}
                </span>
              </div>
              <input
                type="number"
                step="any"
                value={inputs.stopLossPrice ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : parseFloat(e.target.value);
                  handleStopPriceChange(val);
                }}
                placeholder="e.g. Stop loss level"
                className="neat-input w-full px-2.5 py-1.5 text-xs font-mono font-semibold tabular-nums border-rose-500/30 focus:border-rose-500"
              />
            </div>

            {/* Field 3: Take Level Price */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Take Level Price
                </label>
                <span className="text-[9px] font-mono text-[var(--color-ink-muted)]">
                  (Take Profit)
                </span>
              </div>
              <input
                type="number"
                step="any"
                value={inputs.takeProfitPrice ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : parseFloat(e.target.value);
                  onChangeInput('takeProfitPrice', val);
                }}
                placeholder="e.g. Target profit level"
                className="neat-input w-full px-2.5 py-1.5 text-xs font-mono font-semibold tabular-nums border-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quick R-Multiple Target Chips */}
          <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)]/50 text-xs">
            <span className="text-[10px] text-[var(--color-ink-muted)] font-mono">
              Quick Target Presets:
            </span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setQuickTakeProfitR(r)}
                  className="neat-press text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-card)] hover:bg-[var(--color-border)] text-emerald-400 border border-[var(--color-border)] cursor-pointer"
                >
                  +{r}R
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Pips / Stop Distance Input Mode */
        <div className="p-3 rounded-lg bg-[var(--color-card-subtle)]/70 border border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink)] mb-1">
              Stop Loss ({inputs.stopLossUnit})
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.0001"
                step="any"
                value={inputs.stopLossDistance || ''}
                onChange={(e) => handleStopDistanceChange(parseFloat(e.target.value) || 0)}
                placeholder="15"
                className="neat-input w-full pl-2.5 pr-12 py-1.5 font-mono text-xs font-semibold tabular-nums"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center space-x-0.5">
                <button
                  type="button"
                  onClick={() => handleStopDistanceChange(Math.max(0.5, Number((inputs.stopLossDistance - 1).toFixed(2))))}
                  className="w-4 h-4 rounded bg-[var(--color-card)] text-[var(--color-ink)] flex items-center justify-center text-[10px] font-bold cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => handleStopDistanceChange(Number((inputs.stopLossDistance + 1).toFixed(2)))}
                  className="w-4 h-4 rounded bg-[var(--color-card)] text-[var(--color-ink)] flex items-center justify-center text-[10px] font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink)] mb-1">
              Distance Unit
            </label>
            <select
              value={inputs.stopLossUnit}
              onChange={(e) => onChangeInput('stopLossUnit', e.target.value as StopDistanceUnit)}
              className="neat-input w-full px-2.5 py-1.5 text-xs font-mono font-semibold uppercase cursor-pointer"
            >
              {activeSpec.supportedStopUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Collapsible Advanced Settings (Leverage, Spreads, Specs) */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[10px] font-mono text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] flex items-center space-x-1 cursor-pointer"
        >
          <Sliders className="w-3 h-3" />
          <span>{showAdvanced ? 'Hide Advanced Settings' : 'Advanced Settings (Leverage, Spread, Contract Specs)'}</span>
        </button>

        {showAdvanced && (
          <div className="mt-2 space-y-2 pt-2 border-t border-[var(--color-border)]">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] mb-0.5 uppercase tracking-wider">
                  Leverage
                </label>
                <select
                  value={inputs.leverage}
                  onChange={(e) => onChangeInput('leverage', parseInt(e.target.value, 10) || 100)}
                  className="neat-input w-full px-2 py-1 font-mono text-xs cursor-pointer"
                >
                  <option value="1">1:1</option>
                  <option value="10">1:10</option>
                  <option value="30">1:30</option>
                  <option value="50">1:50</option>
                  <option value="100">1:100</option>
                  <option value="200">1:200</option>
                  <option value="500">1:500</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] mb-0.5 uppercase tracking-wider">
                  Spread
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputs.spread}
                  onChange={(e) => onChangeInput('spread', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                  className="neat-input w-full px-2 py-1 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--color-ink-muted)] mb-0.5 uppercase tracking-wider">
                  Commission / Lot
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={inputs.commissionPerLot}
                  onChange={(e) => onChangeInput('commissionPerLot', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="neat-input w-full px-2 py-1 text-xs font-mono"
                />
              </div>
            </div>

            {/* Broker Specs Drawer */}
            <BrokerSpecsEditor
              spec={activeSpec}
              exchangeRate={inputs.exchangeRate}
              onUpdateSpec={onUpdateSpec}
              onUpdateExchangeRate={(rate) => onChangeInput('exchangeRate', rate)}
              onResetSpecToDefault={onResetSpecToDefault}
            />
          </div>
        )}
      </div>
    </div>
  );
};

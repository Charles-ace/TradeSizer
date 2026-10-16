import React, { useState, useMemo, useEffect } from 'react';
import type {
  CalculationInputs,
  InstrumentCategory,
  InstrumentSpec,
  StopDistanceUnit,
  TradeDirection,
  TradingModelId,
} from './types';
import {
  DEFAULT_ACCOUNT_BALANCE,
  DEFAULT_ACCOUNT_CURRENCY,
  DEFAULT_LEVERAGE,
  TRADING_MODELS,
} from './constants/models';
import { INSTRUMENT_CATALOG } from './constants/instruments';
import { USER_TRADED_INSTRUMENTS } from './constants/marketData';
import {
  calculatePlannedRisk,
  calculateTargetProfit,
  calculateTradeSizer,
} from './utils/calculator';
import { formatCurrency, formatLots } from './utils/formatters';

// Calculator Components
import { AccountOverview } from './components/AccountOverview';
import { ModelSelector } from './components/ModelSelector';
import { TradeSetupForm } from './components/TradeSetupForm';
import { ResultsPanel } from './components/ResultsPanel';
import { BrandLogo } from './components/BrandLogo';

// Icons
import {
  BookOpen,
  RotateCcw,
  Sun,
  Moon,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const App: React.FC = () => {
  // Theme state: defaults to dark carbon
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tradesizer-theme');
      if (stored) return stored === 'dark';
      return true; // Default to dark carbon mode
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tradesizer-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tradesizer-theme', 'light');
    }
  }, [isDark]);

  // Default initial instrument: EURUSD from catalog
  const defaultInstrument = INSTRUMENT_CATALOG.find((i) => i.symbol === 'EURUSD')!;

  // App States
  const [accountBalance, setAccountBalance] = useState<number>(DEFAULT_ACCOUNT_BALANCE);
  const [accountCurrency, setAccountCurrency] = useState<string>(DEFAULT_ACCOUNT_CURRENCY);
  const [selectedModelId, setSelectedModelId] = useState<TradingModelId>('A');
  const [customRiskPercentage, setCustomRiskPercentage] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState<InstrumentCategory>('forex');
  const [activeSpec, setActiveSpec] = useState<InstrumentSpec>(defaultInstrument);
  const [direction, setDirection] = useState<TradeDirection>('long');
  const [entryPrice, setEntryPrice] = useState<number | null>(1.11559);
  const [stopLossPrice, setStopLossPrice] = useState<number | null>(null);
  const [takeProfitPrice, setTakeProfitPrice] = useState<number | null>(null);
  const [stopLossDistance, setStopLossDistance] = useState<number>(15.0);
  const [stopLossUnit, setStopLossUnit] = useState<StopDistanceUnit>('pips');
  const [exchangeRate, setExchangeRate] = useState<number | null>(
    defaultInstrument.defaultExchangeRate ?? null
  );
  const [leverage, setLeverage] = useState<number>(DEFAULT_LEVERAGE);
  const [spread, setSpread] = useState<number>(0);
  const [commissionPerLot, setCommissionPerLot] = useState<number>(0);
  const [moveStopToBreakeven, setMoveStopToBreakeven] = useState<boolean>(true);
  const [customModelPartial, setCustomModelPartial] = useState<{ triggerR: number; bankedR: number; closePercentage: number }>({
    triggerR: 3,
    bankedR: 1.8,
    closePercentage: 60,
  });

  const [ticketCopied, setTicketCopied] = useState(false);

  // Reset to initial baseline
  const handleReset = () => {
    setAccountBalance(DEFAULT_ACCOUNT_BALANCE);
    setAccountCurrency(DEFAULT_ACCOUNT_CURRENCY);
    setSelectedModelId('A');
    setCustomRiskPercentage(undefined);
    setCategory('forex');
    setActiveSpec(defaultInstrument);
    setDirection('long');
    setEntryPrice(1.11559);
    setStopLossPrice(null);
    setTakeProfitPrice(null);
    setStopLossDistance(15.0);
    setStopLossUnit('pips');
    setExchangeRate(defaultInstrument.defaultExchangeRate ?? null);
    setLeverage(DEFAULT_LEVERAGE);
    setSpread(0);
    setCommissionPerLot(0);
    setMoveStopToBreakeven(true);
    setCustomModelPartial({ triggerR: 3, bankedR: 1.8, closePercentage: 60 });
  };

  // Change selected instrument
  const handleSelectInstrument = (spec: InstrumentSpec) => {
    setActiveSpec(spec);
    setStopLossUnit(spec.defaultStopUnit);
    setExchangeRate(spec.defaultExchangeRate ?? null);
    setCategory(spec.category);

    const market = USER_TRADED_INSTRUMENTS.find((m) => m.symbol === spec.symbol);
    if (market) {
      setEntryPrice(market.price);
      setStopLossDistance(market.defaultStop);
      setStopLossUnit(market.defaultStopUnit);
    } else if (spec.category === 'metals') {
      setStopLossDistance(spec.defaultStopUnit === 'price' ? 5.0 : 500);
      setEntryPrice(spec.symbol === 'XAUUSD' ? 4099.84 : spec.symbol === 'USOIL' ? 94.24 : 55.56);
    } else if (spec.category === 'indices') {
      setStopLossDistance(50);
      setEntryPrice(spec.symbol === 'NAS100' ? 29920.9 : 51574.6);
    } else if (spec.category === 'crypto') {
      setStopLossDistance(spec.symbol === 'BTCUSD' ? 650 : 35);
      setEntryPrice(spec.symbol === 'BTCUSD' ? 81837.15 : 2428.75);
    } else {
      setStopLossDistance(15.0);
      setEntryPrice(spec.symbol === 'EURUSD' ? 1.11559 : 1.31902);
    }
  };

  // Update specific contract specification attributes
  const handleUpdateSpec = (updated: Partial<InstrumentSpec>) => {
    setActiveSpec((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  // Generic input updater
  const handleInputChange = <K extends keyof CalculationInputs>(
    field: K,
    value: CalculationInputs[K]
  ) => {
    switch (field) {
      case 'accountBalance':
        setAccountBalance(value as number);
        break;
      case 'accountCurrency':
        setAccountCurrency(value as string);
        break;
      case 'selectedModelId':
        setSelectedModelId(value as TradingModelId);
        break;
      case 'category':
        setCategory(value as InstrumentCategory);
        break;
      case 'direction':
        setDirection(value as TradeDirection);
        break;
      case 'customRiskPercentage':
        setCustomRiskPercentage(value as number | undefined);
        break;
      case 'entryPrice':
        setEntryPrice(value as number | null);
        break;
      case 'stopLossPrice':
        setStopLossPrice(value as number | null);
        break;
      case 'takeProfitPrice':
        setTakeProfitPrice(value as number | null);
        break;
      case 'stopLossDistance':
        setStopLossDistance(value as number);
        break;
      case 'stopLossUnit':
        setStopLossUnit(value as StopDistanceUnit);
        break;
      case 'exchangeRate':
        setExchangeRate(value as number | null);
        break;
      case 'leverage':
        setLeverage(value as number);
        break;
      case 'spread':
        setSpread(value as number);
        break;
      case 'commissionPerLot':
        setCommissionPerLot(value as number);
        break;
      case 'moveStopToBreakeven':
        setMoveStopToBreakeven(value as boolean);
        break;
      case 'customModelPartial':
        setCustomModelPartial(value as { triggerR: number; bankedR: number; closePercentage: number });
        break;
      default:
        break;
    }
  };

  // Selected trading model definition
  const currentModel = TRADING_MODELS[selectedModelId];

  // Calculation Inputs
  const calculationInputs: CalculationInputs = useMemo(
    () => ({
      accountBalance,
      accountCurrency,
      selectedModelId,
      customRiskPercentage,
      category,
      symbol: activeSpec.symbol,
      direction,
      entryPrice,
      stopLossPrice,
      takeProfitPrice,
      stopLossDistance,
      stopLossUnit,
      exchangeRate,
      leverage,
      spread,
      commissionPerLot,
      moveStopToBreakeven,
      customModelPartial,
    }),
    [
      accountBalance,
      accountCurrency,
      selectedModelId,
      customRiskPercentage,
      category,
      activeSpec.symbol,
      direction,
      entryPrice,
      stopLossPrice,
      takeProfitPrice,
      stopLossDistance,
      stopLossUnit,
      exchangeRate,
      leverage,
      spread,
      commissionPerLot,
      moveStopToBreakeven,
      customModelPartial,
    ]
  );

  // Deterministic calculation result
  const calculationResult = useMemo(
    () => calculateTradeSizer(calculationInputs, activeSpec),
    [calculationInputs, activeSpec]
  );

  const activeRiskPercentage = customRiskPercentage !== undefined && customRiskPercentage > 0
    ? customRiskPercentage
    : currentModel.riskPercentage;

  const plannedRiskAmount = useMemo(
    () => calculatePlannedRisk(accountBalance, activeRiskPercentage),
    [accountBalance, activeRiskPercentage]
  );

  // Headline target profit (3.40R for Models A & B with 60% partial at 3R)
  const headlineTargetProfit = useMemo(() => {
    if (currentModel.hasPartial) {
      return Number((plannedRiskAmount * 3.40).toFixed(2));
    }
    return calculateTargetProfit(plannedRiskAmount, currentModel.targetR);
  }, [plannedRiskAmount, currentModel]);

  // Copy Ticket handler
  const handleCopyTicket = async () => {
    if (!calculationResult.isValid) return;
    const summary = `// TRADESIZER ORDER EXECUTION TICKET
Model      : ${currentModel.name}
Symbol     : ${activeSpec.symbol}
Direction  : ${calculationInputs.direction.toUpperCase()}
Position   : ${formatLots(calculationResult.normalizedPositionSize, activeSpec.lotStep)} ${calculationResult.lotUnitName}
Risk       : ${formatCurrency(calculationResult.actualRiskAmount, calculationInputs.accountCurrency)} (${calculationResult.actualRiskPercentage.toFixed(2)}%)
Target     : +${formatCurrency(calculationResult.actualTargetProfit, calculationInputs.accountCurrency)} (${calculationResult.rewardToRiskRatio}R)
Req Margin : ${formatCurrency(calculationResult.marginDetails.marginRequired, calculationInputs.accountCurrency)}
Parity     : BabyPips Verified • 60% Partial @ 3R (+1.80R Banked) • +3.40R Net Win`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summary);
        setTicketCopied(true);
        setTimeout(() => setTicketCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-page)] text-[var(--color-ink)] flex flex-col antialiased selection:bg-[var(--color-highlight)] transition-colors duration-150">
      {/* Compact Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-page)]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 h-11 flex items-center justify-between">
          {/* Brand & Parity Indicator */}
          <div className="flex items-center space-x-2.5">
            <BrandLogo variant="mark" size="sm" />
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm tracking-tight text-[var(--color-ink)] font-mono select-none">
                TRADE<span className="text-emerald-400">SIZER</span>
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-[var(--color-card-subtle)] text-[var(--color-ink-secondary)] border border-[var(--color-border)]">
                67 INSTRUMENTS
              </span>
              <span className="hidden md:inline-flex items-center space-x-1 text-[10px] font-mono text-[var(--color-ink-muted)]">
                <ShieldCheck className="w-3 h-3 text-[var(--color-ink-muted)]" />
                <span>BabyPips Parity</span>
              </span>
            </div>
          </div>

          {/* Quick Balance Presets Strip */}
          <div className="hidden sm:flex items-center space-x-1">
            <span className="text-[10px] font-mono text-[var(--color-ink-muted)] mr-1">Presets:</span>
            {[10000, 25000, 50000, 100000, 250000].map((preset) => (
              <button
                key={preset}
                onClick={() => setAccountBalance(preset)}
                className={`neat-press px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                  accountBalance === preset
                    ? 'bg-[var(--color-ink)] text-[var(--color-page)] font-bold shadow-xs'
                    : 'bg-[var(--color-card-subtle)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] border border-[var(--color-border)]'
                }`}
              >
                ${preset >= 1000 ? `${preset / 1000}k` : preset}
              </button>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Theme Switcher */}
            <button
              onClick={() => setIsDark((prev) => !prev)}
              className="neat-press p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] cursor-pointer"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Reset Inputs */}
            <button
              onClick={handleReset}
              className="neat-press flex items-center space-x-1 px-2.5 py-1 text-xs font-mono font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] cursor-pointer"
              title="Reset calculator inputs"
            >
              <RotateCcw className="w-3 h-3 text-[var(--color-ink-muted)]" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Copy Execution Ticket */}
            <button
              onClick={handleCopyTicket}
              className="neat-press flex items-center space-x-1 px-3 py-1 text-xs font-mono font-bold rounded-lg bg-[var(--color-ink)] text-[var(--color-page)] hover:opacity-90 cursor-pointer shadow-xs"
            >
              {ticketCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{ticketCopied ? 'Copied' : 'Copy Ticket'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Compact Console Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 py-3 space-y-2.5">
        {/* Section A: Compact Account Overview */}
        <AccountOverview
          balance={accountBalance}
          currency={accountCurrency}
          model={currentModel}
          plannedRiskAmount={plannedRiskAmount}
          plannedTargetProfit={headlineTargetProfit}
          activeRiskPercentage={activeRiskPercentage}
          isCustomRisk={customRiskPercentage !== undefined && customRiskPercentage > 0}
          onBalanceChange={(newBal) => setAccountBalance(newBal)}
        />

        {/* Section B: Compact Model Selector */}
        <ModelSelector
          selectedModelId={selectedModelId}
          onSelectModel={(id) => {
            setSelectedModelId(id);
            setCustomRiskPercentage(TRADING_MODELS[id].riskPercentage);
          }}
        />

        {/* Sections C & D: Responsive 2-Column Compact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
          {/* Left Column: Trade Setup Form with ALL 67 INSTRUMENTS (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-2.5">
            <TradeSetupForm
              inputs={calculationInputs}
              activeSpec={activeSpec}
              errors={calculationResult.errors}
              onChangeInput={handleInputChange}
              onUpdateSpec={handleUpdateSpec}
              onSelectInstrument={handleSelectInstrument}
              onResetSpecToDefault={() => {
                const found = INSTRUMENT_CATALOG.find((i) => i.symbol === activeSpec.symbol);
                if (found) setActiveSpec(found);
              }}
            />
          </div>

          {/* Right Column: Results & Neatlogs Terminal (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-2.5">
            <ResultsPanel
              result={calculationResult}
              inputs={calculationInputs}
              spec={activeSpec}
              model={currentModel}
              onToggleBreakeven={(val) => setMoveStopToBreakeven(val)}
            />

            {/* Compact Reference Rules Card */}
            <div className="neat-card p-2.5 space-y-1.5 text-[11px] text-[var(--color-ink-secondary)]">
              <div className="flex items-center space-x-1.5 text-[var(--color-ink)] font-bold pb-1 border-b border-[var(--color-border)]">
                <BookOpen className="w-3.5 h-3.5 text-[var(--color-ink-muted)]" />
                <span className="uppercase tracking-[0.06em] text-[10px]">
                  Institutional Rules (BabyPips Parity)
                </span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-[10px] leading-relaxed">
                <li>
                  <strong className="text-[var(--color-ink)]">Models A &amp; B (4R / 3R Partial):</strong> Close 60% of lots at 3R (banking 1.80R). Stop-loss raised to breakeven. 40% remainder runs to 4R yielding <strong className="text-[var(--color-success)] font-mono font-bold">+3.40R net</strong> win.
                </li>
                <li>
                  <strong className="text-[var(--color-ink)]">Models C &amp; D (3R Single):</strong> Single full exit at 3R headline with no partials (+3.00R net win).
                </li>
                <li>
                  <strong className="text-[var(--color-ink)]">Floor Rounding Guarantee:</strong> Position lots strictly floored to broker volume step to eliminate over-leverage risk.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Ultra-compact Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-section)] py-2 px-4 text-center text-[10px] text-[var(--color-ink-muted)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center space-x-1.5 font-mono">
            <span className="font-bold text-[var(--color-ink)]">TRADESIZER</span>
            <span>•</span>
            <span>BabyPips 1:1 Parity • 43 Traded Instruments • 60% Partial @ 3R (+1.80R) • 4R Net (+3.40R)</span>
          </div>
          <p className="m-0 font-mono text-[9px] text-[var(--color-ink-faint)]">
            Floor-rounded position sizing. Strict capital protection.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

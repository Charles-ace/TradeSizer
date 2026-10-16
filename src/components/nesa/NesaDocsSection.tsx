import React from 'react';
import { NesaCornerBox } from './NesaCornerBox';
import { NesaPillButton } from './NesaPillButton';
import { BookOpen, ArrowUpRight, Check, Copy } from 'lucide-react';
import type { ActiveView } from './NesaNavbar';

export interface NesaDocsSectionProps {
  onNavigate: (view: ActiveView) => void;
}

export const NesaDocsSection: React.FC<NesaDocsSectionProps> = ({ onNavigate }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="max-w-3xl mb-12 space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#E2F952] uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Documentation &amp; Formula Parity</span>
        </div>
        <h2 className="font-extrabold uppercase tracking-tight text-3xl sm:text-5xl text-white">
          DETERMINISTIC FORMULAS &amp; SPECS
        </h2>
        <p className="text-white/70 text-sm sm:text-base leading-relaxed">
          Complete mathematical reference for TradeSizer on Corda. Parity implementation of the BabyPips position sizing model with 60% partial at 3R and margin safety bounds.
        </p>
      </div>

      {/* Formula Cards */}
      <div className="space-y-8">
        {/* Formula 1: Planned Risk */}
        <NesaCornerBox strokeColor="#E2F952" badge="FORMULA 01" className="bg-[#0b0c12]/90 border border-white/5 rounded-2xl">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-white uppercase font-mono">1. Planned Cash Risk</h3>
              <span className="text-xs font-mono text-white/50">Base Currency Sizing</span>
            </div>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Calculates the maximum monetary risk permitted based on current verified account equity and model tier.
            </p>
            <div className="p-4 bg-black/60 rounded-xl border border-white/10 font-mono text-xs sm:text-sm text-[#E2F952] overflow-x-auto flex items-center justify-between">
              <code>RiskAmount ($) = AccountBalance × (RiskPercentage ÷ 100)</code>
              <button
                onClick={() => copyToClipboard('RiskAmount = AccountBalance * (RiskPercentage / 100)', 1)}
                className="ml-4 p-1.5 text-white/40 hover:text-white"
              >
                {copiedIndex === 1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-xs font-mono text-white/50">
              Example: $100,000 balance at 0.60% risk = $600.00 USD cash risk.
            </div>
          </div>
        </NesaCornerBox>

        {/* Formula 2: BabyPips Pip Value */}
        <NesaCornerBox strokeColor="#8B5CF6" badge="FORMULA 02" className="bg-[#0b0c12]/90 border border-white/5 rounded-2xl">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-white uppercase font-mono">2. BabyPips Parity Pip Value</h3>
              <span className="text-xs font-mono text-white/50">Currency Cross Conversion</span>
            </div>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Converts price pip movements and point fluctuations into account currency equivalents for all 67 market instruments across FOREX.COM, Coinbase &amp; DERIV.
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 bg-black/60 rounded-lg border border-white/10 text-white/90">
                <span className="text-[#8B5CF6] font-bold block mb-1">Direct Quote (EUR/USD, GBP/USD, AUD/USD):</span>
                <code>PipValue = ContractSize (100,000) × PipSize (0.0001) = $10.00 / lot</code>
              </div>
              <div className="p-3 bg-black/60 rounded-lg border border-white/10 text-white/90">
                <span className="text-[#8B5CF6] font-bold block mb-1">Indirect Quote (USD/JPY, USD/CHF, USD/CAD):</span>
                <code>PipValue = (100,000 × PipSize) ÷ ExchangeRate (e.g. 1000 JPY ÷ 158.345 = $6.32 / lot)</code>
              </div>
              <div className="p-3 bg-black/60 rounded-lg border border-white/10 text-white/90">
                <span className="text-[#8B5CF6] font-bold block mb-1">Deriv Synthetics (V75, V100, Step Index, Jump Indices):</span>
                <code>LotSize = CashRisk ÷ (|Entry - Stop| × ContractSize[1.0])  (e.g. $150 ÷ 196.0 points = 0.765 lots)</code>
              </div>
              <div className="p-3 bg-black/60 rounded-lg border border-white/10 text-white/90">
                <span className="text-[#8B5CF6] font-bold block mb-1">Commodities &amp; Indices (Gold, Oil, US30, NAS100):</span>
                <code>TickValue = ContractMultiplier × TickSize × ConversionRate</code>
              </div>
            </div>
          </div>
        </NesaCornerBox>

        {/* Formula 3: 60% Partial Exit at 3R */}
        <NesaCornerBox strokeColor="#B8622F" badge="FORMULA 03" className="bg-[#0b0c12]/90 border border-white/5 rounded-2xl">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-white uppercase font-mono">3. 60% Partial @ 3R Execution Ledger</h3>
              <span className="text-xs font-mono text-white/50">Two-Tiered Scaling</span>
            </div>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Standard trading strategy for institutional risk governance: bank 60% of volume at 3R, raise stop to breakeven floor, and let the 40% remainder run to 4R.
            </p>
            <div className="p-4 bg-black/60 rounded-xl border border-white/10 font-mono text-xs sm:text-sm text-orange-300 space-y-2">
              <div><strong>Partial Close Volume (60%):</strong> <code>PartialLots = Math.floor(TotalLots × 0.60 ÷ Step) × Step</code></div>
              <div><strong>Banked at 3R (+1.80R):</strong> <code>BankedReward = 0.60 × 3R = +1.80R ($1,080 on $600 risk)</code></div>
              <div><strong>Runner at 4R (+1.60R):</strong> <code>RunnerReward = 0.40 × 4R = +1.60R ($960 on $600 risk)</code></div>
              <div className="pt-2 border-t border-white/10 text-[#E2F952] font-bold">
                <strong>Net Total Win:</strong> <code>+1.80R + 1.60R = +3.40R ($2,040 on $600 risk)</code>
              </div>
            </div>
          </div>
        </NesaCornerBox>

        {/* Formula 4: Floor Rounding & Margin Safety */}
        <NesaCornerBox strokeColor="#9A9A9A" badge="FORMULA 04" className="bg-[#0b0c12]/90 border border-white/5 rounded-2xl">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-white uppercase font-mono">4. Floor Rounding &amp; Margin Guard</h3>
              <span className="text-xs font-mono text-white/50">Anti-Overleverage Protection</span>
            </div>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              To eliminate risk of over-allocating capital, TradeSizer enforces strict mathematical floor truncation.
            </p>
            <div className="p-4 bg-black/60 rounded-xl border border-white/10 font-mono text-xs text-white/90 space-y-2">
              <code>NormalizedPositionSize = Math.floor(RawLots ÷ LotStep) × LotStep</code>
              <p className="text-xs text-white/50">
                If raw calculated volume is 2.459 lots with a 0.01 lot step, it is strictly floored to 2.45 lots (never 2.46), guaranteeing actual risk never exceeds planned risk.
              </p>
            </div>
          </div>
        </NesaCornerBox>
      </div>

      {/* Launch Console Action */}
      <div className="mt-12 text-center">
        <NesaPillButton
          onClick={() => onNavigate('console')}
          accentColor="yellow"
          size="lg"
          icon={<ArrowUpRight className="w-5 h-5 text-black" />}
        >
          Open Interactive Sizing Console
        </NesaPillButton>
      </div>
    </section>
  );
};

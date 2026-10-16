import React from 'react';
import { NesaCornerBox } from './NesaCornerBox';
import { NesaPillButton } from './NesaPillButton';
import { ArrowUpRight, Layers, Activity } from 'lucide-react';
import type { ActiveView } from './NesaNavbar';

export interface NesaHeroProps {
  onNavigate: (view: ActiveView) => void;
  onSelectPair: (symbol: string) => void;
}

export const NesaHero: React.FC<NesaHeroProps> = ({ onNavigate, onSelectPair }) => {
  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#8B5CF6]/15 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-20 -left-40 w-[500px] h-[500px] bg-[#E2F952]/10 rounded-full blur-[130px]" />

      {/* Top Banner Tag */}
      <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 w-fit backdrop-blur-md mb-8">
        <span className="w-2 h-2 rounded-full bg-[#E2F952] animate-pulse" />
        <span className="text-xs uppercase tracking-widest font-mono text-white/80">
          Corda Permissioned DLT • Institutional Position Sizing Engine
        </span>
      </div>

      {/* Main Grid: Kinetic Typography (Left) + Corner Bracket Manifest (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-12">
        {/* Left Column: Kinetic Massive Typography (7 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-2 select-none">
          <h1 className="font-extrabold uppercase tracking-tight text-white leading-[0.95] text-5xl sm:text-7xl md:text-8xl xl:text-[6.5rem]">
            <span className="block text-white/90">WITNESS</span>
            <span className="block text-white">THE POWER</span>
            <span className="block bg-gradient-to-r from-[#E2F952] via-white to-[#8B5CF6] bg-clip-text text-transparent">
              OF DETERMINISTIC
            </span>
            <span className="block text-white">SIZING ON CORDA</span>
          </h1>

          {/* Dual CTAs in Nesa style */}
          <div className="pt-8 flex flex-wrap items-center gap-4">
            <NesaPillButton
              onClick={() => onNavigate('console')}
              accentColor="yellow"
              size="lg"
              icon={<ArrowUpRight className="w-5 h-5 text-black" />}
            >
              Launch Sizing Console
            </NesaPillButton>

            <NesaPillButton
              onClick={() => onNavigate('technology')}
              accentColor="purple"
              size="lg"
              icon={<Layers className="w-4 h-4 text-white" />}
            >
              Corda Architecture
            </NesaPillButton>
          </div>
        </div>

        {/* Right Column: Nesa Corner Bracket Feature Box (5 cols) */}
        <div className="lg:col-span-4 w-full">
          <NesaCornerBox
            strokeColor="#9A9A9A"
            badge="PARITY VERIFIED"
            className="bg-[#0b0c11]/80 backdrop-blur-xl border border-white/5 rounded-2xl space-y-4"
          >
            <p className="text-sm sm:text-base font-light text-white/80 leading-relaxed">
              Broadcast verified order risk on the private enterprise ledger for capital markets.
              Mathematical parity with BabyPips, automated 60% partial at 3R banking, and hardware-enforced
              margin protection across <strong className="text-white font-mono font-bold">67 institutional instruments</strong>.
            </p>

            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-white/40 block">RISK PER TRADE</span>
                <span className="text-[#E2F952] font-bold text-sm">0.60% / 0.75%</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-white/40 block">PARTIAL TARGET</span>
                <span className="text-[#8B5CF6] font-bold text-sm">60% @ 3R (+1.80R)</span>
              </div>
            </div>
          </NesaCornerBox>
        </div>
      </div>

      {/* Live Fast-Action Instrument Ticker Bar */}
      <div className="w-full pt-8 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-white/60">
            <Activity className="w-4 h-4 text-[#E2F952]" />
            <span className="uppercase tracking-wider">Quick Launch Traded Pairs (Click to Size):</span>
          </div>
          <span className="text-[11px] font-mono text-white/40">
            67 Instruments Verified across FOREX.COM, Coinbase & DERIV
          </span>
        </div>

        {/* Quick Instrument Badges */}
        <div className="flex flex-wrap gap-2">
          {[
            { s: 'VOLATILITY_75_INDEX', p: '39,464.⁵⁰', c: '+0.32%', neg: false },
            { s: 'STEP_INDEX', p: '7,270.⁹⁰', c: '+0.06%', neg: false },
            { s: 'EURUSD', p: '1.1155⁹', c: '-0.37%', neg: true },
            { s: 'GBPUSD', p: '1.3190²', c: '-0.49%', neg: true },
            { s: 'XAUUSD', p: '4,099.8⁴', c: '-1.47%', neg: true },
            { s: 'USOIL', p: '94.24³', c: '+0.33%', neg: false },
            { s: 'NAS100', p: '29,920.⁹', c: '-2.10%', neg: true },
            { s: 'US30', p: '51,574.⁶', c: '-0.19%', neg: true },
            { s: 'BTCUSD', p: '81,837.¹⁵', c: '-1.52%', neg: true },
            { s: 'ETHUSD', p: '2,428.⁷⁵', c: '-2.69%', neg: true },
          ].map((item) => (
            <button
              key={item.s}
              onClick={() => {
                onSelectPair(item.s);
                onNavigate('console');
              }}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-[#E2F952]/50 transition-all text-xs font-mono group"
            >
              <span className="font-bold text-white group-hover:text-[#E2F952] transition-colors">{item.s}</span>
              <span className="text-white/70">{item.p}</span>
              <span className={item.neg ? 'text-rose-400' : 'text-emerald-400'}>{item.c}</span>
            </button>
          ))}
          <button
            onClick={() => {
              const el = document.getElementById('market-catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3 py-1.5 rounded-lg bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/40 text-[#8B5CF6] text-xs font-mono font-bold"
          >
            View All 67 Instruments →
          </button>
        </div>
      </div>
    </div>
  );
};

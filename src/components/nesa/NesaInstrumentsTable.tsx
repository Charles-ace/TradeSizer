import React, { useState, useMemo } from 'react';
import { USER_TRADED_INSTRUMENTS } from '../../constants/marketData';
import { Search, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import type { ActiveView } from './NesaNavbar';

export interface NesaInstrumentsTableProps {
  onSelectPair: (symbol: string) => void;
  onNavigate: (view: ActiveView) => void;
}

export const NesaInstrumentsTable: React.FC<NesaInstrumentsTableProps> = ({
  onSelectPair,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'volatilities' | 'forex' | 'metals' | 'indices' | 'crypto'>('all');

  const filteredInstruments = useMemo(() => {
    return USER_TRADED_INSTRUMENTS.filter((inst) => {
      const matchesTab = activeTab === 'all' || inst.category === activeTab;
      const matchesSearch =
        inst.symbol.toLowerCase().includes(search.toLowerCase()) ||
        inst.name.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [search, activeTab]);

  const handleLaunchCalculator = (symbol: string) => {
    onSelectPair(symbol);
    onNavigate('console');
  };

  return (
    <section id="market-catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#E2F952] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#E2F952]" />
            <span>Verified Market Registry (67 Instruments)</span>
          </div>
          <h2 className="font-extrabold uppercase tracking-tight text-3xl sm:text-5xl text-white">
            INSTITUTIONAL TRADED ASSETS
          </h2>
          <p className="text-white/60 text-sm max-w-xl">
            Complete registry of all 67 traded instruments with live rates from FOREX.COM, Coinbase, and DERIV Broker with direct deterministic sizing hooks.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 67 pairs (e.g. V75, EUR, US30)..."
            className="w-full pl-10 pr-4 py-2 bg-white/[0.04] border border-white/10 focus:border-[#E2F952] rounded-full text-xs text-white placeholder-white/40 outline-none transition-all font-mono"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {[
          { id: 'all', label: 'All Instruments (67)' },
          { id: 'volatilities', label: 'Deriv Synthetics (24)' },
          { id: 'forex', label: 'Forex (30)' },
          { id: 'metals', label: 'Metals & Commodities (3)' },
          { id: 'indices', label: 'Global Indices (8)' },
          { id: 'crypto', label: 'Crypto (2)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-full text-xs font-mono font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#E2F952] text-black font-bold shadow-[0_0_15px_rgba(226,249,82,0.25)]'
                : 'bg-white/[0.03] text-white/70 hover:text-white border border-white/5 hover:border-white/15'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Instruments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filteredInstruments.map((inst) => {
          return (
            <div
              key={inst.symbol}
              className="group relative bg-[#090a0f]/80 hover:bg-[#12141c] border border-white/[0.08] hover:border-[#E2F952]/40 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between"
            >
              {/* Top Row: Symbol & Category */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-white group-hover:border-[#E2F952]/40 transition-colors">
                    {inst.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-white font-mono block leading-tight">
                      {inst.symbol}
                    </span>
                    <span className="text-[10px] text-white/40 block truncate max-w-[140px]">
                      {inst.name}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-white/[0.04] text-white/50 border border-white/5">
                  {inst.category}
                </span>
              </div>

              {/* Price & Change Row */}
              <div className="flex items-baseline justify-between my-2 font-mono">
                <div>
                  <span className="text-base font-bold text-white tracking-tight">
                    {inst.formattedPrice}
                  </span>
                  <span className="text-[10px] text-white/40 ml-1">{inst.quoteCurrency}</span>
                </div>

                <div
                  className={`flex items-center space-x-1 text-xs font-semibold ${
                    inst.isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {inst.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>{inst.changePct}</span>
                </div>
              </div>

              {/* Bottom Action: Calculate Size */}
              <button
                onClick={() => handleLaunchCalculator(inst.symbol)}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-white/[0.04] group-hover:bg-[#E2F952] border border-white/10 group-hover:border-[#E2F952] text-white/80 group-hover:text-black text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-all duration-200 active:scale-[0.98]"
              >
                <span>Calculate Size</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {filteredInstruments.length === 0 && (
        <div className="py-16 text-center text-white/40 font-mono text-sm">
          No instruments found matching "{search}".
        </div>
      )}
    </section>
  );
};

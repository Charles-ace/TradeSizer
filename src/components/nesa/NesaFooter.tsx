import React from 'react';
import type { ActiveView } from './NesaNavbar';

export interface NesaFooterProps {
  onNavigate: (view: ActiveView) => void;
}

export const NesaFooter: React.FC<NesaFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-white/10 bg-[#020305] text-white/60 py-16 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-12">
        {/* Brand Column */}
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white text-lg tracking-tight font-mono">TRADESIZER</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40">
              CORDA
            </span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            Institutional deterministic position sizing and multi-model risk governance. Built for capital markets on Corda DLT.
          </p>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Corda Notary Network Online</span>
          </div>
        </div>

        {/* Links Column 1: Platform */}
        <div className="space-y-3 font-mono text-xs">
          <span className="text-white font-bold uppercase tracking-wider block">Platform</span>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors">
                Overview
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('console')} className="hover:text-[#E2F952] text-[#E2F952] font-semibold transition-colors">
                Sizing Console ↗
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('technology')} className="hover:text-white transition-colors">
                Corda DLT Architecture
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('docs')} className="hover:text-white transition-colors">
                Documentation &amp; Math
              </button>
            </li>
          </ul>
        </div>

        {/* Links Column 2: Market Instruments */}
        <div className="space-y-3 font-mono text-xs">
          <span className="text-white font-bold uppercase tracking-wider block">Registry (67)</span>
          <ul className="space-y-2 text-white/50">
            <li>24 Deriv Synthetic Volatilities, Jump &amp; Step</li>
            <li>30 Forex Majors, Crosses &amp; Exotics</li>
            <li>Gold (XAUUSD), Silver (XAGUSD), Crude Oil (USOIL)</li>
            <li>8 Global Equity Indices (US30, NAS100, SPX, GER40...)</li>
            <li>Crypto Assets (BTC/USD, ETH/USD via Coinbase)</li>
          </ul>
        </div>

        {/* Links Column 3: Standards & Parity */}
        <div className="space-y-3 font-mono text-xs">
          <span className="text-white font-bold uppercase tracking-wider block">Compliance</span>
          <ul className="space-y-2 text-white/50">
            <li>BabyPips Position Sizing Parity</li>
            <li>60% Partial @ 3R Smart Execution</li>
            <li>Floor Truncation Margin Protection</li>
            <li>Zero Mempool Leakage Privacy</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/40">
        <p>&copy; {new Date().getFullYear()} TradeSizer. Powered by Corda Enterprise DLT. All rights reserved.</p>
        <p className="text-[11px]">Strict mathematical calculations for informational and risk management purposes.</p>
      </div>
    </footer>
  );
};

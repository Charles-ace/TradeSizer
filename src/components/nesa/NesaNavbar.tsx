import React, { useState, useEffect } from 'react';
import { NesaPillButton } from './NesaPillButton';
import { Calculator, Cpu, FileText, Menu, X, ArrowLeft, ArrowUpRight } from 'lucide-react';

export type ActiveView = 'landing' | 'console' | 'technology' | 'docs';

export interface NesaNavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onSelectPair?: (symbol: string) => void;
}

export const NesaNavbar: React.FC<NesaNavbarProps> = ({ activeView, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#030407]/90 backdrop-blur-xl border-b border-white/[0.08] py-3 shadow-2xl'
            : 'bg-transparent py-5 lg:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Monogram */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            {/* Geometric Nesa-like Hex/Cube mark */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/20 flex items-center justify-center p-1.5 transition-all duration-300 group-hover:border-[#E2F952] group-hover:shadow-[0_0_20px_rgba(226,249,82,0.3)]">
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full text-white group-hover:text-[#E2F952] transition-colors">
                <path
                  d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path d="M16 2V30M3 9.5L29 22.5M29 9.5L3 22.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                <circle cx="16" cy="16" r="3.5" fill="#E2F952" />
              </svg>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-lg text-white font-mono">TRADESIZER</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 text-[#8B5CF6] rounded">
                  CORDA DLT
                </span>
              </div>
              <span className="text-[10px] text-white/40 tracking-wider font-mono">DETERMINISTIC CAPITAL MARKETS</span>
            </div>
          </div>

          {/* Sparse Desktop Navigation (2-3 links + Primary Console Action) */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate('landing')}
              className={`text-sm font-medium tracking-wide transition-colors ${
                activeView === 'landing' ? 'text-[#E2F952]' : 'text-white/70 hover:text-white'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => onNavigate('technology')}
              className={`text-sm font-medium tracking-wide transition-colors flex items-center space-x-1 ${
                activeView === 'technology' ? 'text-[#E2F952]' : 'text-white/70 hover:text-white'
              }`}
            >
              <span>Technology</span>
            </button>

            <button
              onClick={() => {
                if (activeView !== 'landing') onNavigate('landing');
                setTimeout(() => {
                  const el = document.getElementById('market-catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-sm font-medium tracking-wide text-white/70 hover:text-white transition-colors flex items-center space-x-1"
            >
              <span>67 Instruments</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">LIVE</span>
            </button>

            <button
              onClick={() => onNavigate('docs')}
              className={`text-sm font-medium tracking-wide transition-colors ${
                activeView === 'docs' ? 'text-[#E2F952]' : 'text-white/70 hover:text-white'
              }`}
            >
              Docs &amp; Specs
            </button>
          </div>

          {/* Right Action: Signature Nesa Button */}
          <div className="hidden sm:flex items-center space-x-4">
            {activeView === 'console' ? (
              <NesaPillButton
                onClick={() => onNavigate('landing')}
                accentColor="purple"
                size="sm"
                icon={<ArrowLeft className="w-3.5 h-3.5 text-white" />}
              >
                Exit to Landing
              </NesaPillButton>
            ) : (
              <NesaPillButton
                onClick={() => onNavigate('console')}
                accentColor="yellow"
                size="md"
                icon={<ArrowUpRight className="w-4 h-4 text-black" />}
              >
                Launch Console
              </NesaPillButton>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => onNavigate(activeView === 'console' ? 'landing' : 'console')}
              className="px-3 py-1.5 rounded-full bg-[#E2F952] text-black font-bold text-xs"
            >
              {activeView === 'console' ? 'Overview' : 'Console'}
            </button>
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 text-white/80 hover:text-white bg-white/5 rounded-lg border border-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#030407]/95 backdrop-blur-2xl pt-24 px-6 md:hidden flex flex-col justify-between pb-12 animate-in fade-in duration-200">
          <div className="flex flex-col space-y-6">
            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className="text-left text-2xl font-bold uppercase tracking-wider text-white hover:text-[#E2F952]"
            >
              Overview
            </button>
            <button
              onClick={() => {
                onNavigate('console');
                setMobileMenuOpen(false);
              }}
              className="text-left text-2xl font-bold uppercase tracking-wider text-[#E2F952] flex items-center space-x-2"
            >
              <Calculator className="w-6 h-6" />
              <span>Sizing Console</span>
            </button>
            <button
              onClick={() => {
                onNavigate('technology');
                setMobileMenuOpen(false);
              }}
              className="text-left text-2xl font-bold uppercase tracking-wider text-white hover:text-[#E2F952] flex items-center space-x-2"
            >
              <Cpu className="w-6 h-6" />
              <span>Corda Architecture</span>
            </button>
            <button
              onClick={() => {
                onNavigate('docs');
                setMobileMenuOpen(false);
              }}
              className="text-left text-2xl font-bold uppercase tracking-wider text-white hover:text-[#E2F952] flex items-center space-x-2"
            >
              <FileText className="w-6 h-6" />
              <span>Formulas &amp; Specs</span>
            </button>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Corda Notary Cluster: Operational</span>
            </div>
            <p className="text-xs text-white/40">
              Deterministic calculations for 67 instruments across FOREX.COM, Coinbase & DERIV.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

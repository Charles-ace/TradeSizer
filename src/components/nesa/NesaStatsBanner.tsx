import React from 'react';
import { NesaCornerBox } from './NesaCornerBox';
import { NesaPillButton } from './NesaPillButton';
import { ArrowUpRight } from 'lucide-react';
import type { ActiveView } from './NesaNavbar';

export interface NesaStatsBannerProps {
  onNavigate: (view: ActiveView) => void;
}

export const NesaStatsBanner: React.FC<NesaStatsBannerProps> = ({ onNavigate }) => {
  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-16">
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[48px] lg:rounded-[5rem] bg-[#7C3AED] text-black px-6 py-10 sm:px-12 sm:py-16 lg:px-16 lg:py-20 shadow-2xl">
        {/* Subtle background tech pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"
        />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12 lg:gap-16">
          {/* Left Column: Heading + Narrative + CTA */}
          <div className="flex flex-col justify-between max-w-xl space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-black/30 bg-black/5 text-black text-xs font-mono font-bold uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Corda Enterprise Ledger • Active</span>
              </div>

              <h2 className="font-extrabold uppercase tracking-tight text-4xl sm:text-6xl lg:text-7xl leading-[1.0]">
                CORDA DLT
                <br />
                FOR TRADING
              </h2>

              <p className="text-black/80 text-base sm:text-lg leading-relaxed font-normal">
                TradeSizer runs on Corda's point-to-point state-machine architecture. Unlike public chains,
                sensitive position sizes, stop losses, and order margins are never broadcast to a public mempool,
                eliminating front-running and MEV exploitation for institutional desks.
              </p>
            </div>

            <div className="pt-2">
              <NesaPillButton
                onClick={() => onNavigate('console')}
                accentColor="black"
                size="lg"
                icon={<ArrowUpRight className="w-5 h-5 text-white" />}
              >
                Launch Console
              </NesaPillButton>
            </div>
          </div>

          {/* Right Column: 4 Stat Cards with Nesa Corner Brackets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 flex-1">
            {/* Stat 01 */}
            <div className="relative flex flex-col justify-between">
              <span className="font-mono text-xs font-bold text-black/50 mb-1">01</span>
              <NesaCornerBox strokeColor="#000000" className="bg-white/10 backdrop-blur-md rounded-2xl border border-black/10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline space-x-1">
                    <span className="font-extrabold text-4xl sm:text-5xl font-mono tracking-tight text-black">12.4K</span>
                    <span className="text-sm font-bold font-mono text-black/70">/sec</span>
                  </div>
                  <h3 className="text-sm font-bold text-black uppercase mt-1">Deterministic Math</h3>
                </div>
                <p className="text-xs text-black/70 mt-2 font-medium">
                  Sub-millisecond position size and margin derivations with zero floating-point error.
                </p>
              </NesaCornerBox>
            </div>

            {/* Stat 02 */}
            <div className="relative flex flex-col justify-between">
              <span className="font-mono text-xs font-bold text-black/50 mb-1">02</span>
              <NesaCornerBox strokeColor="#000000" className="bg-white/10 backdrop-blur-md rounded-2xl border border-black/10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline space-x-1">
                    <span className="font-extrabold text-4xl sm:text-5xl font-mono tracking-tight text-black">67</span>
                    <span className="text-sm font-bold font-mono text-black/70">Assets</span>
                  </div>
                  <h3 className="text-sm font-bold text-black uppercase mt-1">Verified Instruments</h3>
                </div>
                <p className="text-xs text-black/70 mt-2 font-medium">
                  24 Deriv Synthetics, 30 Forex pairs, Gold, Oil, 8 Global Indices, and Cryptos.
                </p>
              </NesaCornerBox>
            </div>

            {/* Stat 03 */}
            <div className="relative flex flex-col justify-between">
              <span className="font-mono text-xs font-bold text-black/50 mb-1">03</span>
              <NesaCornerBox strokeColor="#000000" className="bg-white/10 backdrop-blur-md rounded-2xl border border-black/10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline space-x-1">
                    <span className="font-extrabold text-4xl sm:text-5xl font-mono tracking-tight text-black">3.40R</span>
                    <span className="text-sm font-bold font-mono text-black/70">Net</span>
                  </div>
                  <h3 className="text-sm font-bold text-black uppercase mt-1">60% Partial @ 3R</h3>
                </div>
                <p className="text-xs text-black/70 mt-2 font-medium">
                  Bank 1.80R profit at 3R. 40% remainder runs to 4R for a guaranteed +3.40R total reward.
                </p>
              </NesaCornerBox>
            </div>

            {/* Stat 04 */}
            <div className="relative flex flex-col justify-between">
              <span className="font-mono text-xs font-bold text-black/50 mb-1">04</span>
              <NesaCornerBox strokeColor="#000000" className="bg-white/10 backdrop-blur-md rounded-2xl border border-black/10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline space-x-1">
                    <span className="font-extrabold text-4xl sm:text-5xl font-mono tracking-tight text-black">0.00%</span>
                    <span className="text-sm font-bold font-mono text-black/70">Risk</span>
                  </div>
                  <h3 className="text-sm font-bold text-black uppercase mt-1">Floor Lot Rounding</h3>
                </div>
                <p className="text-xs text-black/70 mt-2 font-medium">
                  Eliminates over-leverage risk by truncating down to strict broker lot-step boundaries.
                </p>
              </NesaCornerBox>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

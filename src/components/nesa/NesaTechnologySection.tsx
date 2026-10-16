import React from 'react';
import { NesaCornerBox } from './NesaCornerBox';
import { NesaPillButton } from './NesaPillButton';
import { ShieldCheck, Lock, Cpu, CheckCircle2, ArrowUpRight, Zap } from 'lucide-react';
import type { ActiveView } from './NesaNavbar';

export interface NesaTechnologySectionProps {
  onNavigate: (view: ActiveView) => void;
}

export const NesaTechnologySection: React.FC<NesaTechnologySectionProps> = ({ onNavigate }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="max-w-3xl mb-14 space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#8B5CF6] uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          <span>Distributed Ledger Architecture</span>
        </div>
        <h2 className="font-extrabold uppercase tracking-tight text-3xl sm:text-5xl text-white">
          CORDA CONSENSUS &amp; DETERMINISTIC RISK
        </h2>
        <p className="text-white/70 text-sm sm:text-base leading-relaxed">
          How Corda's enterprise distributed ledger technology replaces insecure spreadsheets and vulnerable public chains with zero-knowledge, deterministic trading governance.
        </p>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Pillar 1 */}
        <NesaCornerBox
          strokeColor="#8B5CF6"
          badge="POINT-TO-POINT PRIVACY"
          className="bg-[#0b0c12]/90 border border-white/5 rounded-2xl flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Zero Mempool Leakage</h3>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Public chains broadcast trade tickets to public mempools, exposing stops and targets to MEV bots.
              Corda communicates solely peer-to-peer between trading desks, ensuring strict confidentiality.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center space-x-2 text-xs font-mono text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Anti-Frontrunning Enforced</span>
          </div>
        </NesaCornerBox>

        {/* Pillar 2 */}
        <NesaCornerBox
          strokeColor="#E2F952"
          badge="MATHEMATICAL PARITY"
          className="bg-[#0b0c12]/90 border border-white/5 rounded-2xl flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E2F952]/10 border border-[#E2F952]/30 flex items-center justify-center text-[#E2F952]">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">BabyPips Parity Engine</h3>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Calculations are verified against the authoritative BabyPips financial model. Currency conversions
              (direct USD, indirect USD/XXX, cross-currency XXX/USD, and JPY pairs) are calculated with 8-decimal precision.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center space-x-2 text-xs font-mono text-[#E2F952]">
            <CheckCircle2 className="w-4 h-4" />
            <span>100% Deterministic Output</span>
          </div>
        </NesaCornerBox>

        {/* Pillar 3 */}
        <NesaCornerBox
          strokeColor="#B8622F"
          badge="EXECUTION GOVERNANCE"
          className="bg-[#0b0c12]/90 border border-white/5 rounded-2xl flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#B8622F]/10 border border-[#B8622F]/30 flex items-center justify-center text-[#B8622F]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">60% Partial @ 3R Ledger</h3>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Automates multi-bracket risk management: 60% position size is banked upon reaching 3R (+1.80R guaranteed profit),
              while stop-loss is raised to breakeven and remaining 40% runs to 4R (+1.60R) for a net +3.40R reward.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center space-x-2 text-xs font-mono text-orange-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Smart Contract Exit Rules</span>
          </div>
        </NesaCornerBox>
      </div>

      {/* Interactive Workflow Diagram / Terminal Card */}
      <div className="bg-[#08090d] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <h4 className="text-base font-mono font-bold text-white uppercase">Corda State Machine Lifecycle</h4>
            <p className="text-xs text-white/50">From input parameters to cryptographically signed order ticket</p>
          </div>
          <NesaPillButton
            onClick={() => onNavigate('console')}
            accentColor="yellow"
            size="sm"
            icon={<ArrowUpRight className="w-3.5 h-3.5 text-black" />}
          >
            Test in Console
          </NesaPillButton>
        </div>

        {/* 4-Step Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            {
              step: '01',
              title: 'Account Baseline',
              desc: 'Account balance and risk percentage (0.60% / 0.75%) verified against portfolio floor.',
            },
            {
              step: '02',
              title: 'Contract Multiplication',
              desc: 'Pip/point values calculated dynamically using live exchange rate pairs.',
            },
            {
              step: '03',
              title: 'Floor Truncation',
              desc: 'Strict Math.floor rounding ensures volume never exceeds broker maximum risk tolerance.',
            },
            {
              step: '04',
              title: 'Notary Receipt',
              desc: 'Execution ticket rendered with margin required and two-tier exit roadmap.',
            },
          ].map((item) => (
            <div key={item.step} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#E2F952] block">STEP {item.step}</span>
              <h5 className="text-sm font-bold text-white">{item.title}</h5>
              <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

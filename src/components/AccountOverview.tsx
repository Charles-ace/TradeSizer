import React from 'react';
import type { ModelDefinition } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AccountOverviewProps {
  balance: number;
  currency: string;
  model: ModelDefinition;
  plannedRiskAmount: number;
  plannedTargetProfit: number;
  onBalanceChange: (balance: number) => void;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({
  balance,
  currency,
  model,
  plannedRiskAmount,
  plannedTargetProfit,
}) => {
  return (
    <section className="neat-card p-2 sm:p-2.5">
      {/* 4-Column Compact Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* Metric 1: Account Balance */}
        <div className="px-3 py-2 rounded-lg bg-[var(--color-card-subtle)]/50 border border-[var(--color-border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--color-ink-muted)]">
            Account Balance
          </span>
          <div className="text-sm sm:text-base font-bold font-mono text-[var(--color-ink)] tabular-nums my-0.5">
            {formatCurrency(balance, currency)}
          </div>
          <span className="text-[10px] text-[var(--color-ink-faint)] font-mono">
            Verified Equity ({currency})
          </span>
        </div>

        {/* Metric 2: Active Model */}
        <div className="px-3 py-2 rounded-lg bg-[var(--color-card-subtle)]/50 border border-[var(--color-border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--color-ink-muted)]">
            Model Governance
          </span>
          <div className="text-sm sm:text-base font-bold text-[var(--color-ink)] truncate my-0.5">
            {model.name}
          </div>
          <span className="text-[10px] text-[var(--color-ink-faint)] font-mono">
            {model.group} • {model.riskPercentage}% Risk
          </span>
        </div>

        {/* Metric 3: Planned 1R Budget */}
        <div className="px-3 py-2 rounded-lg bg-[var(--color-card-subtle)]/50 border border-[var(--color-border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--color-ink-muted)]">
            1R Risk Budget
          </span>
          <div className="text-sm sm:text-base font-bold font-mono text-rose-400 tabular-nums my-0.5">
            -{formatCurrency(plannedRiskAmount, currency)}
          </div>
          <span className="text-[10px] text-[var(--color-ink-faint)] font-mono">
            {model.riskPercentage}% loss ceiling
          </span>
        </div>

        {/* Metric 4: Headline Target Profit */}
        <div className="px-3 py-2 rounded-lg bg-[var(--color-card-subtle)]/50 border border-[var(--color-border)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--color-ink-muted)]">
            Full Win Projection
          </span>
          <div className="text-sm sm:text-base font-bold font-mono text-emerald-400 tabular-nums my-0.5">
            +{formatCurrency(plannedTargetProfit, currency)}
          </div>
          <span className="text-[10px] text-[var(--color-ink-faint)] font-mono">
            {model.hasPartial ? '3.40R Net System' : `${model.targetR}R Target`}
          </span>
        </div>
      </div>
    </section>
  );
};

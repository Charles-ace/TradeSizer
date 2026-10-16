import React from 'react';
import type { TradingModelId } from '../types';
import { TRADING_MODELS } from '../constants/models';
import { Check } from 'lucide-react';

interface ModelSelectorProps {
  selectedModelId: TradingModelId;
  onSelectModel: (modelId: TradingModelId) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  onSelectModel,
}) => {
  const models = Object.values(TRADING_MODELS);

  return (
    <div className="neat-card p-2 sm:p-2.5">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[var(--color-border)]">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-ink-muted)] m-0 font-mono">
          Trading Models
        </h2>
        <span className="text-[10px] text-[var(--color-ink-faint)] font-mono">
          4 Prescribed Rulesets
        </span>
      </div>

      {/* Model Cards Grid (4 Compact Columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
        {models.map((model) => {
          const isSelected = selectedModelId === model.id;

          return (
            <button
              key={model.id}
              type="button"
              onClick={() => onSelectModel(model.id)}
              className={`neat-press text-left rounded-lg px-2.5 py-2 border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-[var(--color-card)] border-[var(--color-ink)]/50 ring-1 ring-[var(--color-ink)]/20 shadow-xs'
                  : 'bg-[var(--color-card-subtle)]/40 border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-card)]'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-xs text-[var(--color-ink)]">
                  {model.name}
                </span>
                {isSelected ? (
                  <span className="w-3.5 h-3.5 rounded-full bg-[var(--color-ink)] text-[var(--color-page)] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-[var(--color-ink-muted)]">
                    {model.group}
                  </span>
                )}
              </div>

              {/* Badges strip */}
              <div className="flex items-center space-x-1.5 text-[10px] font-mono mb-0.5">
                <span className="text-[var(--color-ink-secondary)]">
                  {model.riskPercentage}% Risk
                </span>
                <span className="text-[var(--color-ink-faint)]">•</span>
                <span className="font-medium text-emerald-400">
                  {model.hasPartial ? '3.40R Net' : `${model.targetR}R Target`}
                </span>
              </div>

              <p className="text-[10px] text-[var(--color-ink-muted)] m-0 leading-tight truncate">
                {model.hasPartial
                  ? '60% exit @ 3R (1.8R banked), runner to 4R'
                  : 'Single full exit at 3R'}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

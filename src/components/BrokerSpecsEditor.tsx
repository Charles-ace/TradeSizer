import React, { useState } from 'react';
import type { InstrumentSpec } from '../types';
import { Sliders, HelpCircle, ChevronDown, ChevronUp, RefreshCw, AlertTriangle } from 'lucide-react';

interface BrokerSpecsEditorProps {
  spec: InstrumentSpec;
  exchangeRate: number | null;
  onUpdateSpec: (updated: Partial<InstrumentSpec>) => void;
  onUpdateExchangeRate: (rate: number | null) => void;
  onResetSpecToDefault: () => void;
}

export const BrokerSpecsEditor: React.FC<BrokerSpecsEditorProps> = ({
  spec,
  exchangeRate,
  onUpdateSpec,
  onUpdateExchangeRate,
  onResetSpecToDefault,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const needsConversion =
    spec.conversionType && spec.conversionType !== 'none';

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-subtle)]/40 overflow-hidden transition-all text-xs">
      {/* Collapsible trigger bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-[var(--color-card)] hover:bg-[var(--color-card-subtle)] flex items-center justify-between cursor-pointer select-none transition-colors border-b border-[var(--color-border)] text-left"
      >
        <div className="flex items-center space-x-2">
          <Sliders className="w-3 h-3 text-[var(--color-ink-muted)]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-ink)]">
            Broker Contract Specifications &amp; Exchange Rates
          </span>
          {spec.isCustom && (
            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[var(--color-card-subtle)] text-[var(--color-ink-secondary)] border border-[var(--color-border)]">
              Custom
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5 text-[10px] text-[var(--color-ink-muted)]">
          <span>{isOpen ? 'Close' : 'Customize'}</span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-[var(--color-ink-muted)]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[var(--color-ink-muted)]" />
          )}
        </div>
      </button>

      {/* Expandable Specifications Area */}
      {isOpen && (
        <div className="p-3 space-y-3 bg-[var(--color-card)]">
          {/* Informational banner */}
          <div className="bg-[var(--color-card-subtle)] border border-[var(--color-border)] rounded-md p-2 text-[var(--color-ink-secondary)] text-[11px] leading-tight flex items-start space-x-2">
            <HelpCircle className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[var(--color-ink)]">
                Contract Specs for <span className="font-mono">{spec.symbol}</span>:
              </span>{' '}
              <span>{spec.description || 'Verified baseline specification.'}</span>
            </div>
          </div>

          {/* Currency Conversion Section when quote != USD */}
          {needsConversion && (
            <div className="bg-[var(--color-card-subtle)] border border-[var(--color-border)] rounded-md p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <AlertTriangle className="w-3 h-3 text-[var(--color-ink-muted)]" />
                  <span className="font-bold text-[var(--color-ink)] text-[11px]">
                    Currency Conversion Rate Required
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-[var(--color-ink)] bg-[var(--color-card)] px-1.5 py-0.2 rounded border border-[var(--color-border)]">
                  {spec.conversionPair || `${spec.quoteCurrency}/USD`}
                </span>
              </div>
              <p className="text-[10px] text-[var(--color-ink-secondary)] mb-1.5">
                Quote currency is {spec.quoteCurrency} (differs from account USD).
              </p>
              <div className="flex items-center space-x-2">
                <label className="text-[10px] text-[var(--color-ink)] font-semibold">
                  {spec.conversionPair || `${spec.quoteCurrency}/USD`} Live Rate:
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={exchangeRate ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : parseFloat(e.target.value);
                    onUpdateExchangeRate(val);
                  }}
                  placeholder="e.g. 155.00"
                  className="neat-input w-28 px-2 py-0.5 font-mono text-xs tabular-nums"
                />
              </div>
            </div>
          )}

          {/* Configurable Parameters Grid (6 Compact Columns) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <div>
              <label className="block text-[9px] text-[var(--color-ink-muted)] uppercase font-bold mb-0.5">
                Contract Size
              </label>
              <input
                type="number"
                step="any"
                value={spec.contractSize}
                onChange={(e) => onUpdateSpec({ contractSize: parseFloat(e.target.value) || 0, isCustom: true })}
                className="neat-input w-full px-1.5 py-1 font-mono text-xs tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[9px] text-[var(--color-ink-muted)] uppercase font-bold mb-0.5">
                Tick Size
              </label>
              <input
                type="number"
                step="any"
                value={spec.tickSize}
                onChange={(e) => onUpdateSpec({ tickSize: parseFloat(e.target.value) || 0, isCustom: true })}
                className="neat-input w-full px-1.5 py-1 font-mono text-xs tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[9px] text-[var(--color-ink-muted)] uppercase font-bold mb-0.5">
                Tick Value
              </label>
              <input
                type="number"
                step="any"
                value={spec.tickValue ?? ''}
                onChange={(e) => onUpdateSpec({ tickValue: parseFloat(e.target.value) || 0, isCustom: true })}
                className="neat-input w-full px-1.5 py-1 font-mono text-xs tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[9px] text-[var(--color-ink-muted)] uppercase font-bold mb-0.5">
                Min Lot
              </label>
              <input
                type="number"
                step="any"
                value={spec.minLot}
                onChange={(e) => onUpdateSpec({ minLot: parseFloat(e.target.value) || 0, isCustom: true })}
                className="neat-input w-full px-1.5 py-1 font-mono text-xs tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[9px] text-[var(--color-ink-muted)] uppercase font-bold mb-0.5">
                Lot Step
              </label>
              <input
                type="number"
                step="any"
                value={spec.lotStep}
                onChange={(e) => onUpdateSpec({ lotStep: parseFloat(e.target.value) || 0, isCustom: true })}
                className="neat-input w-full px-1.5 py-1 font-mono text-xs tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[9px] text-[var(--color-ink-muted)] uppercase font-bold mb-0.5">
                Max Lot
              </label>
              <input
                type="number"
                step="any"
                value={spec.maxLot}
                onChange={(e) => onUpdateSpec({ maxLot: parseFloat(e.target.value) || 0, isCustom: true })}
                className="neat-input w-full px-1.5 py-1 font-mono text-xs tabular-nums"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onResetSpecToDefault}
              className="neat-press flex items-center space-x-1 text-[10px] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] px-2 py-1 rounded bg-[var(--color-card-subtle)] hover:bg-[var(--color-border-hover)] border border-[var(--color-border)] cursor-pointer font-medium"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

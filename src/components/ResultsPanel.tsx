import React, { useState } from 'react';
import type { CalculationInputs, CalculationResult, InstrumentSpec, ModelDefinition } from '../types';
import { formatCurrency, formatLots } from '../utils/formatters';
import {
  Copy,
  Check,
  AlertTriangle,
  Target,
  FileSpreadsheet,
  Layers,
  Gauge,
} from 'lucide-react';

interface ResultsPanelProps {
  result: CalculationResult;
  inputs: CalculationInputs;
  spec: InstrumentSpec;
  model: ModelDefinition;
  onToggleBreakeven?: (enabled: boolean) => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  inputs,
  spec,
  model,
  onToggleBreakeven: _onToggleBreakeven,
}) => {
  const [copiedLot, setCopiedLot] = useState(false);
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Copy raw/exact position size
  const handleCopyLotSize = async () => {
    if (!result.isValid || result.normalizedPositionSize <= 0) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(result.normalizedPositionSize.toString());
      }
    } catch {
      // Fallback
    }
    setCopiedLot(true);
    setTimeout(() => setCopiedLot(false), 2000);
  };

  // Generate clean execution ticket
  const generateTicketText = () => {
    let partialText = '';
    if (result.partialDetails && result.partialDetails.canSplit) {
      const p = result.partialDetails;
      partialText = `\n-- EXIT PLAN (${p.derivedClosePercentage}% at ${p.triggerR}R) --
Stage 1 : Close ${formatLots(p.actualPartialLots, spec.lotStep)} lots at ${p.triggerR}R -> Lock +${formatCurrency(p.actualBankedDollar, inputs.accountCurrency)} (+${p.actualBankedR}R)
Stage 2 : Run ${formatLots(p.remainderLots, spec.lotStep)} lots to ${result.targetRMultiple}R -> Net +${formatCurrency(p.fullWinTotalDollar, inputs.accountCurrency)} (+${p.fullWinTotalR}R)`;
    }

    if (spec.category === 'deriv_synthetics') {
      let splitText = '';
      if (result.ticketSplits && result.ticketSplits.numTickets > 1) {
        splitText = `\nMulti-Ticket : ${result.ticketSplits.numTickets} Orders (Max ${result.ticketSplits.ticketSize} lots/ticket)`;
      }
      const execDiff = result.actualRiskAmount !== result.plannedRiskAmount
        ? `\nExecuted Risk: ${formatCurrency(result.actualRiskAmount, inputs.accountCurrency)} (${result.actualRiskPercentage.toFixed(2)}% at ${formatLots(result.normalizedPositionSize, spec.lotStep)} lots)`
        : '';
      return `// TRADESIZER DERIV MT5 EXECUTION TICKET
Broker       : DERIV BROKER (MT5 Synthetics)
Symbol       : ${spec.symbol} (${spec.name})
Direction    : ${inputs.direction.toUpperCase()}
Order Volume : ${formatLots(result.normalizedPositionSize, spec.lotStep)} Lots
Contract Size: 1 Unit / Lot (No 100k multiplier)
Point Value  : $1.00 USD per 1.0 pt
Risk Budget  : ${formatCurrency(result.plannedRiskAmount, inputs.accountCurrency)} (${result.plannedRiskPercentage.toFixed(2)}%)${execDiff}
Target Profit: +${formatCurrency(result.actualTargetProfit, inputs.accountCurrency)} (+${result.rewardToRiskRatio}R)
Req Margin   : ${formatCurrency(result.marginDetails.marginRequired, inputs.accountCurrency)} (1:${result.marginDetails.leverage})${splitText}${partialText}`;
    }

    const execDiff = result.actualRiskAmount !== result.plannedRiskAmount
      ? `\nExecuted Risk: ${formatCurrency(result.actualRiskAmount, inputs.accountCurrency)} (${result.actualRiskPercentage.toFixed(2)}% at ${formatLots(result.normalizedPositionSize, spec.lotStep)} ${result.lotUnitName})`
      : '';
    return `// TRADESIZER EXECUTION TICKET
Symbol       : ${spec.symbol} (${spec.name})
Direction    : ${inputs.direction.toUpperCase()}
Standard Lots: ${formatLots(result.normalizedPositionSize, spec.lotStep)} ${result.lotUnitName}
Mini Lots    : ${(result.miniLots ?? result.normalizedPositionSize * 10).toFixed(2)}
Micro Lots   : ${(result.microLots ?? result.normalizedPositionSize * 100).toFixed(2)}
Units        : ${(result.units ?? Math.round(result.normalizedPositionSize * spec.contractSize)).toLocaleString()}
Risk Budget  : ${formatCurrency(result.plannedRiskAmount, inputs.accountCurrency)} (${result.plannedRiskPercentage.toFixed(2)}%)${execDiff}
Target Profit: +${formatCurrency(result.actualTargetProfit, inputs.accountCurrency)} (+${result.rewardToRiskRatio}R)
Req Margin   : ${formatCurrency(result.marginDetails.marginRequired, inputs.accountCurrency)} (1:${result.marginDetails.leverage})${partialText}`;
  };

  // Copy full ticket
  const handleCopyTradeSetup = async () => {
    if (!result.isValid) return;
    const summaryText = generateTicketText();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summaryText);
      }
    } catch {
      // Fallback
    }
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  // If calculation is invalid, show instructive waiting/error state
  if (!result.isValid) {
    return (
      <div className="neat-card p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-card-subtle)] flex items-center justify-center mb-3 border border-[var(--color-border)]">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>
        <h3 className="text-xs font-bold text-[var(--color-ink)] mb-1 uppercase tracking-wide">
          Calculation Notice
        </h3>
        <p className="text-[11px] text-[var(--color-ink-muted)] max-w-xs mb-3 leading-relaxed">
          {result.errors.length > 0
            ? result.errors[0]
            : 'Enter an account balance and stop price to calculate position size.'}
        </p>
      </div>
    );
  }

  const p = result.partialDetails;
  const isPartialModel = model.hasPartial && p !== undefined;

  // BabyPips unit values
  const unitsDisplay = result.units !== undefined
    ? result.units.toLocaleString()
    : Math.round(result.normalizedPositionSize * spec.contractSize).toLocaleString();

  const standardLotsDisplay = formatLots(result.normalizedPositionSize, spec.lotStep);
  const miniLotsDisplay = result.miniLots !== undefined
    ? result.miniLots.toFixed(2)
    : (result.normalizedPositionSize * 10).toFixed(2);
  const microLotsDisplay = result.microLots !== undefined
    ? result.microLots.toFixed(2)
    : (result.normalizedPositionSize * 100).toFixed(2);

  return (
    <div className="space-y-3">
      {/* Warnings Banner if any */}
      {result.warnings.length > 0 && (
        <div className="bg-[var(--color-card-subtle)] border border-[var(--color-border)] rounded-lg p-2.5 space-y-1">
          {result.warnings.map((warn, i) => (
            <div key={i} className="flex items-start space-x-1.5 text-xs text-[var(--color-ink-secondary)] font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* PRIMARY POSITION SIZE CALLOUT */}
      <div className="neat-card p-4 relative overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-1.5 text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider font-bold mb-0.5">
              <span>
                {spec.category === 'deriv_synthetics'
                  ? 'Position Size (Deriv MT5 Volume)'
                  : spec.category === 'crypto'
                  ? 'Position Size (Crypto Lots)'
                  : 'Position Size (Standard Lots)'}
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-[var(--color-ink)] tabular-nums">
                {standardLotsDisplay}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide">
                {result.lotUnitName}
              </span>
            </div>

            <div className="text-[11px] text-[var(--color-ink-secondary)] mt-1 flex items-center flex-wrap gap-2">
              <span>
                Direction:{' '}
                <strong className={inputs.direction === 'long' ? 'text-emerald-400' : 'text-rose-400'}>
                  {inputs.direction.toUpperCase()}
                </strong>
              </span>
              <span>•</span>
              <span>
                Units:{' '}
                <span className="font-mono text-[var(--color-ink)] font-semibold">
                  {spec.category === 'deriv_synthetics' ? `${unitsDisplay} Contracts (1 unit/lot)` : unitsDisplay}
                </span>
              </span>
            </div>
          </div>

          {/* Quick Copy Lot Size Button */}
          <button
            type="button"
            onClick={handleCopyLotSize}
            disabled={result.normalizedPositionSize <= 0}
            className={`neat-press flex items-center space-x-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              copiedLot
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-xs'
                : 'bg-[var(--color-ink)] hover:opacity-90 text-[var(--color-page)] border-[var(--color-ink)] shadow-xs'
            }`}
          >
            {copiedLot ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Lots</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SIZING BREAKDOWN: DERIV CONTRACT SPECS vs BABYPIPS FOREX 1:1 */}
      {spec.category === 'deriv_synthetics' ? (
        <div className="neat-card overflow-hidden">
          <div className="px-3.5 py-2 bg-[var(--color-card-subtle)] border-b border-[var(--color-border)] flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Deriv MT5 Sizing &amp; Contract Specs
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {spec.symbol} • DERIV BROKER
            </span>
          </div>

          <div className="divide-y divide-[var(--color-border)] text-xs">
            {/* Row 1: Amount at Risk */}
            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-[var(--color-ink-secondary)] font-medium">
                Amount at Risk:
              </span>
              <div className="text-right">
                <span className="font-mono font-bold text-rose-400 text-sm tabular-nums">
                  {formatCurrency(result.plannedRiskAmount, inputs.accountCurrency)}
                </span>
                <span className="text-[10px] font-mono text-[var(--color-ink-muted)] ml-1.5">
                  ({result.plannedRiskPercentage.toFixed(2)}%)
                </span>
                {result.actualRiskAmount !== result.plannedRiskAmount && (
                  <div className="text-[10px] font-mono text-[var(--color-ink-muted)] mt-0.5">
                    Floored Exec: {formatCurrency(result.actualRiskAmount, inputs.accountCurrency)} ({result.actualRiskPercentage.toFixed(2)}% at {standardLotsDisplay} lots)
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: MT5 Order Volume */}
            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-[var(--color-ink-secondary)] font-medium">
                MT5 Order Volume:
              </span>
              <div className="text-right">
                <span className="font-mono font-bold text-[var(--color-ink)] text-sm tabular-nums">
                  {standardLotsDisplay} Lots
                </span>
                <span className="text-[10px] font-mono text-[var(--color-ink-muted)] ml-1">
                  ({unitsDisplay} units)
                </span>
                {result.maxLotCapped && (
                  <span className="text-[9px] font-mono text-amber-400 block">
                    (Capped at {spec.maxLot} lots/order)
                  </span>
                )}
              </div>
            </div>

            {/* Row 3: Contract Multiplier */}
            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-[var(--color-ink-secondary)] font-medium">
                Contract Multiplier:
              </span>
              <span className="font-mono font-bold text-[var(--color-ink)] text-xs tabular-nums">
                1 Unit / Lot (No 100k Multiplier)
              </span>
            </div>

            {/* Row 4: Point Value */}
            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-[var(--color-ink-secondary)] font-medium">
                Point Value ($/pt):
              </span>
              <span className="font-mono font-bold text-emerald-400 text-xs tabular-nums">
                $1.00 USD per 1.0 Point per 1.0 Lot
              </span>
            </div>

            {/* Row 5: Stop Loss Distance */}
            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-[var(--color-ink-secondary)] font-medium">
                Stop Loss Distance:
              </span>
              <span className="font-mono font-bold text-[var(--color-ink)] text-xs tabular-nums">
                {inputs.entryPrice && inputs.stopLossPrice
                  ? `${Math.abs(inputs.entryPrice - inputs.stopLossPrice).toFixed(spec.symbol.includes('STEP') ? 1 : 2)} Points ($${result.lossPerLotAtStop.toFixed(2)} / Lot)`
                  : `${inputs.stopLossDistance} Points ($${result.lossPerLotAtStop.toFixed(2)} / Lot)`}
              </span>
            </div>

            {/* Row 6: Broker MT5 Limits */}
            <div className="px-3.5 py-2 flex items-center justify-between bg-[var(--color-card-subtle)]/40 text-[11px]">
              <span className="text-[var(--color-ink-muted)]">
                MT5 Volume Constraints:
              </span>
              <span className="font-mono text-[var(--color-ink-muted)]">
                Min: {spec.minLot} • Step: {spec.lotStep} • Max: {spec.maxLot} Lots
              </span>
            </div>

            {/* Row 7: Ticket Splitting if applicable */}
            {result.ticketSplits && result.ticketSplits.numTickets > 1 && (
              <div className="px-3.5 py-2 bg-amber-500/10 border-t border-amber-500/20 text-[11px] flex items-center justify-between text-amber-300 font-mono">
                <span>Multi-Order Split:</span>
                <span>
                  {result.ticketSplits.numTickets} tickets (Max {result.ticketSplits.ticketSize} lots/ticket)
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* BABYPIPS 1:1 EXACT 5-ROW SIZING BREAKDOWN */
        <div className="neat-card overflow-hidden">
          <div className="px-3.5 py-2 bg-[var(--color-card-subtle)] border-b border-[var(--color-border)] flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink)] font-mono">
              BabyPips Sizing Breakdown
            </span>
            <span className="text-[9px] font-mono text-[var(--color-ink-muted)]">
              {spec.symbol}
            </span>
          </div>

          <div className="divide-y divide-[var(--color-border)] text-xs">
            {/* Row 1: Amount at Risk */}
            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-[var(--color-ink-secondary)] font-medium">
                Amount at Risk:
              </span>
              <div className="text-right">
                <span className="font-mono font-bold text-rose-400 text-sm tabular-nums">
                  {formatCurrency(result.plannedRiskAmount, inputs.accountCurrency)}
                </span>
                <span className="text-[10px] font-mono text-[var(--color-ink-muted)] ml-1.5">
                  ({result.plannedRiskPercentage.toFixed(2)}%)
                </span>
                {result.actualRiskAmount !== result.plannedRiskAmount && (
                  <div className="text-[10px] font-mono text-[var(--color-ink-muted)] mt-0.5">
                    Floored Exec: {formatCurrency(result.actualRiskAmount, inputs.accountCurrency)} ({result.actualRiskPercentage.toFixed(2)}% at {standardLotsDisplay} lots)
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Position Size (units) */}
            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-[var(--color-ink-secondary)] font-medium">
                Position Size (units):
              </span>
              <div className="text-right">
                <span className="font-mono font-bold text-[var(--color-ink)] text-sm tabular-nums">
                  {unitsDisplay}
                </span>
                {result.rawUnits !== undefined && result.rawUnits !== result.units && (
                  <span className="text-[10px] font-mono text-[var(--color-ink-muted)] ml-1.5">
                    ({result.rawUnits.toLocaleString()} exact)
                  </span>
                )}
              </div>
            </div>

            {/* Row 3: Standard Lots */}
            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-[var(--color-ink-secondary)] font-medium">
                Standard Lots (100k):
              </span>
              <span className="font-mono font-bold text-[var(--color-ink)] text-sm tabular-nums">
                {standardLotsDisplay}
              </span>
            </div>

            {/* Row 4: Mini Lots */}
            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-[var(--color-ink-secondary)] font-medium">
                Mini Lots (10k):
              </span>
              <span className="font-mono font-bold text-[var(--color-ink)] text-sm tabular-nums">
                {miniLotsDisplay}
              </span>
            </div>

            {/* Row 5: Micro Lots */}
            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-[var(--color-ink-secondary)] font-medium">
                Micro Lots (1k):
              </span>
              <span className="font-mono font-bold text-[var(--color-ink)] text-sm tabular-nums">
                {microLotsDisplay}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TARGET & MARGIN SUMMARY */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Target Profit */}
        <div className="neat-card p-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[var(--color-ink-muted)] font-bold">
            <span className="flex items-center space-x-1">
              <Target className="w-3 h-3 text-emerald-400" />
              <span>Target Profit</span>
            </span>
            <span className="font-mono text-emerald-400">+{result.rewardToRiskRatio}R</span>
          </div>
          <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
            +{formatCurrency(result.actualTargetProfit, inputs.accountCurrency)}
          </div>
          <div className="text-[10px] text-[var(--color-ink-muted)] font-mono">
            New Equity: {formatCurrency(result.estimatedGrossBalance, inputs.accountCurrency)}
          </div>
        </div>

        {/* Required Margin */}
        <div className="neat-card p-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[var(--color-ink-muted)] font-bold">
            <span className="flex items-center space-x-1">
              <Gauge className="w-3 h-3 text-[var(--color-ink-muted)]" />
              <span>Req Margin</span>
            </span>
            <span className="font-mono text-[var(--color-ink-muted)]">1:{result.marginDetails.leverage}</span>
          </div>
          <div className="text-sm font-bold font-mono text-[var(--color-ink)] tabular-nums">
            {formatCurrency(result.marginDetails.marginRequired, inputs.accountCurrency)}
          </div>
          <div className="text-[10px] text-[var(--color-ink-muted)] font-mono">
            Free: {formatCurrency(result.marginDetails.freeMarginAfter, inputs.accountCurrency)}
          </div>
        </div>
      </div>

      {/* PARTIAL EXIT SCHEDULE (Models A & B) */}
      {isPartialModel && p && p.canSplit && (
        <div className="neat-card p-3 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)]">
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--color-ink-muted)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink)] font-mono">
                Exit Plan (Model {inputs.selectedModelId})
              </span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400">
              Close {p.derivedClosePercentage}% at {p.triggerR}R
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--color-ink-secondary)]">
                Stage 1 (Partial): Close {formatLots(p.actualPartialLots, spec.lotStep)} lots @ {p.triggerR}R
              </span>
              <span className="font-bold text-emerald-400">
                +{formatCurrency(p.actualBankedDollar, inputs.accountCurrency)} (+{p.actualBankedR}R)
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--color-ink-secondary)]">
                Stage 2 (Runner): Run {formatLots(p.remainderLots, spec.lotStep)} lots @ {result.targetRMultiple}R
              </span>
              <span className="font-bold text-emerald-400">
                +{formatCurrency(p.remainderTargetAddedDollar, inputs.accountCurrency)} (+{p.remainderTargetAddedR}R)
              </span>
            </div>

            <div className="pt-1 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-bold">
              <span className="text-[var(--color-ink)]">Full Net Return:</span>
              <span className="text-emerald-400">
                +{formatCurrency(p.fullWinTotalDollar, inputs.accountCurrency)} (+{p.fullWinTotalR}R)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ORDER EXECUTION TICKET (Clean Copyable Terminal Box) */}
      <div className="neat-terminal p-3 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-terminal-border)]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
            <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
            <span className="w-2 h-2 rounded-full bg-[#28c840]" />
            <span className="text-[10px] text-[var(--color-terminal-muted)] pl-1">
              execution_ticket.log
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyTradeSetup}
            className="neat-press flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all border border-white/15"
          >
            {copiedTicket ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3 h-3" />
                <span>Copy Ticket</span>
              </>
            )}
          </button>
        </div>

        <pre className="text-[10px] text-[#d6d8dc] leading-relaxed whitespace-pre-wrap select-all m-0 font-mono">
          {generateTicketText()}
        </pre>
      </div>
    </div>
  );
};

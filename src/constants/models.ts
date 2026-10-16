import type { ModelDefinition, TradingModelId } from '../types';

export const DEFAULT_ACCOUNT_BALANCE = 25000;
export const DEFAULT_ACCOUNT_CURRENCY = 'USD';
export const DEFAULT_LEVERAGE = 100;

export const TRADING_MODELS: Record<TradingModelId, ModelDefinition> = {
  A: {
    id: 'A',
    name: 'Model A',
    group: 'Confirmation',
    riskPercentage: 0.60, // 0.60% (60 bps)
    targetR: 4, // 4R final target
    hasPartial: true,
    partialTriggerR: 3, // 3R trigger level
    partialClosePercentage: 60, // 60% partial close at 3R
    partialBankedR: 1.8, // 1.8R banked profit (60% * 3R)
    description: 'Confirmation model: 4R system with 60% partial at 3R. Banks 1.8R, remainder 40% runs to 4R (+1.6R). Full win yields 3.40R.',
  },
  B: {
    id: 'B',
    name: 'Model B',
    group: 'Confirmation',
    riskPercentage: 0.60, // 0.60% (60 bps)
    targetR: 4, // 4R final target
    hasPartial: true,
    partialTriggerR: 3, // 3R trigger level
    partialClosePercentage: 60, // 60% partial close at 3R
    partialBankedR: 1.8, // 1.8R banked profit (60% * 3R)
    description: 'Confirmation model sharing identical rules to Model A: 0.60% risk, closes 60% at 3R (1.8R banked), remainder 40% to 4R.',
  },
  C: {
    id: 'C',
    name: 'Model C',
    group: 'Risk',
    riskPercentage: 0.5, // 0.5%
    targetR: 3, // 3R
    hasPartial: false,
    description: 'Risk model with strict all-or-nothing execution. 0.5% risk, single full exit at 3R, no partial closes.',
  },
  D: {
    id: 'D',
    name: 'Model D',
    group: 'Risk',
    riskPercentage: 0.5, // 0.5%
    targetR: 3, // 3R
    hasPartial: false,
    description: 'Risk model with strict all-or-nothing execution. 0.5% risk, single full exit at 3R, no partial closes.',
  },
};

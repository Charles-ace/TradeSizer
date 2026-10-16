export type TradingModelId = 'A' | 'B' | 'C' | 'D';

export type ModelGroup = 'Confirmation' | 'Risk';

export interface ModelDefinition {
  id: TradingModelId;
  name: string;
  group: ModelGroup;
  riskPercentage: number; // e.g. 0.60 for 0.60% or 0.75 for 0.75%
  targetR: number; // Final target R (e.g. 4 for A & B, 3 for C & D)
  hasPartial: boolean;
  partialTriggerR?: number; // e.g. 3 for 3R trigger
  partialClosePercentage?: number; // e.g. 60 for 60% close at 3R
  partialBankedR?: number; // e.g. 1.8 for 1.8R banked profit
  description: string;
}

export type TradeDirection = 'long' | 'short';

export type InstrumentCategory = 'forex' | 'metals' | 'indices' | 'deriv_synthetics' | 'crypto';

export type StopDistanceUnit = 'pips' | 'points' | 'ticks' | 'price';

export type ConversionType = 'none' | 'divide_by_rate' | 'multiply_by_rate';

export interface InstrumentSpec {
  symbol: string;
  name: string;
  category: InstrumentCategory;
  quoteCurrency: string;
  baseCurrency?: string;
  contractSize: number;
  tickSize: number;
  tickValue?: number; // monetary value of 1 tick in quote currency per 1.0 lot
  pipSize?: number; // price increment for 1 pip (e.g. 0.0001 or 0.01)
  defaultStopUnit: StopDistanceUnit;
  supportedStopUnits: StopDistanceUnit[];
  minLot: number;
  lotStep: number;
  maxLot: number;
  defaultExchangeRate?: number;
  conversionPair?: string;
  conversionType?: ConversionType;
  description?: string;
  isCustom?: boolean;
}

export interface PartialExitDetails {
  isApplicable: boolean;
  canSplit: boolean;
  splitWarning?: string;
  triggerR: number;
  bankedRTarget: number;
  derivedClosePercentage: number; // e.g. 60%
  rawPartialLots: number;
  actualPartialLots: number;
  remainderLots: number;
  actualBankedDollar: number;
  actualBankedR: number;
  remainderTargetAddedDollar: number;
  remainderTargetAddedR: number;
  fullWinTotalDollar: number;
  fullWinTotalR: number; // e.g. 3.40R
  breakevenDollar: number;
  breakevenR: number; // 1.8R
  originalStopDollar: number;
  originalStopR: number; // 1.4R
  triggerPrice?: number;
  finalTargetPrice?: number;
  breakevenPrice?: number;
  stopPrice?: number;
}

export interface MarginDetails {
  leverage: number;
  marginRequired: number;
  isMarginExceeded: boolean;
  marginWarning?: string;
  freeMarginAfter: number;
}

export interface CostDetails {
  spread: number;
  commissionPerLot: number;
  spreadCost: number;
  commissionCost: number;
  totalCost: number;
  netRiskAmount: number;
  netFullWinProfit: number;
}

export interface CalculationInputs {
  accountBalance: number;
  accountCurrency: string;
  selectedModelId: TradingModelId;
  category: InstrumentCategory;
  symbol: string;
  direction: TradeDirection;
  customRiskPercentage?: number;
  entryPrice?: number | null;
  stopLossPrice?: number | null;
  takeProfitPrice?: number | null;
  stopLossDistance: number;
  stopLossUnit: StopDistanceUnit;
  exchangeRate: number | null;
  leverage: number; // e.g. 100
  spread: number; // in pips or points
  commissionPerLot: number; // $ per round lot
  moveStopToBreakeven: boolean; // toggle for A & B
  customModelPartial?: {
    triggerR: number;
    closePercentage?: number; // e.g. 60%
    bankedR?: number; // e.g. 1.8R
  };
  customSpec?: Partial<InstrumentSpec>;
}

export interface CalculationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  
  // Model & Risk
  modelId: TradingModelId;
  plannedRiskPercentage: number;
  plannedRiskAmount: number;
  
  // Execution Lot Sizing
  lossPerLotAtStop: number;
  rawPositionSize: number;
  normalizedPositionSize: number;
  actualRiskAmount: number;
  actualRiskPercentage: number;

  // BabyPips 1:1 Parity Breakdown
  units?: number;
  standardLots?: number;
  miniLots?: number;
  microLots?: number;
  
  // Target & Multi-Stage Outcomes
  targetRMultiple: number;
  referenceFullTargetProfit: number;
  plannedTargetProfit: number;
  actualTargetProfit: number;
  estimatedGrossBalance: number;
  rewardToRiskRatio: number;
  
  // Order Direction & Levels
  direction: TradeDirection;
  entryPrice?: number | null;
  stopLossPrice?: number | null;
  takeProfitPrice?: number | null;
  
  // Partial Exit Structure
  partialDetails?: PartialExitDetails;
  
  // Margin & Costs
  marginDetails: MarginDetails;
  costDetails: CostDetails;
  
  // Unit & Context
  lotUnitName: string;
  exchangeRateUsed: number | null;
  conversionNote?: string;
  isMinLotViolated: boolean;
  maxLotCapped?: boolean;
  rawUncappedLots?: number;
  ticketSplits?: {
    numTickets: number;
    ticketSize: number;
    remainderSize: number;
  };
}

import type {
  CalculationInputs,
  CalculationResult,
  CostDetails,
  InstrumentSpec,
  MarginDetails,
  PartialExitDetails,
  TradingModelId,
} from '../types';
import { TRADING_MODELS } from '../constants/models';

/**
 * Calculates planned risk amount in account currency.
 * Formula: Account Balance * (Risk Percentage / 100)
 */
export function calculatePlannedRisk(accountBalance: number, riskPercentage: number): number {
  if (accountBalance <= 0 || riskPercentage <= 0) return 0;
  return Number((accountBalance * (riskPercentage / 100)).toFixed(4));
}

/**
 * Calculates planned target profit in account currency.
 * Formula: Risk Amount * Target R Multiple
 */
export function calculateTargetProfit(riskAmount: number, targetR: number): number {
  if (riskAmount <= 0 || targetR <= 0) return 0;
  return Number((riskAmount * targetR).toFixed(4));
}

/**
 * Helper to determine decimal precision from a step number
 */
export function getDecimalPlaces(num: number): number {
  const s = num.toString();
  if (s.includes('e-')) {
    const exp = parseInt(s.split('e-')[1], 10);
    return exp;
  }
  const parts = s.split('.');
  return parts.length > 1 ? parts[1].length : 0;
}

/**
 * Calculates the monetary loss per 1.0 standard lot at the given stop distance,
 * converted into the account currency (default USD).
 */
export function calculateLossPerLot(
  inputs: CalculationInputs,
  spec: InstrumentSpec
): { lossPerLot: number; error?: string; conversionNote?: string } {
  const { stopLossDistance, stopLossUnit, exchangeRate } = inputs;

  // Derive true price distance directly if entry and stop price are both set
  let effectiveDistance = stopLossDistance;
  let effectiveUnit = stopLossUnit;

  if (
    inputs.entryPrice !== null &&
    inputs.entryPrice !== undefined &&
    inputs.stopLossPrice !== null &&
    inputs.stopLossPrice !== undefined &&
    inputs.entryPrice > 0 &&
    inputs.stopLossPrice > 0
  ) {
    const rawDelta = Math.abs(inputs.entryPrice - inputs.stopLossPrice);
    if (spec.category === 'forex') {
      const pipSize = spec.pipSize || 0.0001;
      effectiveDistance = rawDelta / pipSize;
      effectiveUnit = 'pips';
    } else {
      effectiveDistance = rawDelta;
      effectiveUnit = 'price';
    }
  }

  if (effectiveDistance <= 0) {
    return { lossPerLot: 0, error: 'Stop-loss distance must be greater than zero.' };
  }

  if (spec.contractSize <= 0) {
    return { lossPerLot: 0, error: 'Invalid instrument contract size.' };
  }

  // 1. Calculate loss in quote currency
  let lossInQuote = 0;

  if (spec.category === 'forex') {
    const pipSize = spec.pipSize || 0.0001;
    let distanceInPips = effectiveDistance;

    if (effectiveUnit === 'price') {
      distanceInPips = effectiveDistance / pipSize;
    }

    // In standard Forex, 1 standard lot = 100,000 units of base currency.
    // 1 pip in quote currency = pipSize * contractSize.
    // EURUSD: 0.0001 * 100,000 = 10 USD.
    // USDJPY: 0.01 * 100,000 = 1,000 JPY.
    const pipValueInQuote = pipSize * spec.contractSize;
    lossInQuote = distanceInPips * pipValueInQuote;
  } else if (spec.category === 'metals') {
    if (effectiveUnit === 'points') {
      // 1 point = tickSize (e.g. 0.01 on Gold)
      const tickSize = spec.tickSize || 0.01;
      const priceDistance = effectiveDistance * tickSize;
      lossInQuote = priceDistance * spec.contractSize;
    } else {
      // Unit is price distance ($)
      lossInQuote = effectiveDistance * spec.contractSize;
    }
  } else if (spec.category === 'crypto') {
    if (effectiveUnit === 'points') {
      const tickSize = spec.tickSize || 0.01;
      const priceDistance = effectiveDistance * tickSize;
      lossInQuote = priceDistance * spec.contractSize;
    } else {
      // Unit is price distance ($)
      lossInQuote = effectiveDistance * spec.contractSize;
    }
  } else if (spec.category === 'indices') {
    if (effectiveUnit === 'ticks') {
      const tickSize = spec.tickSize || 1;
      const tickVal = spec.tickValue ?? tickSize;
      lossInQuote = effectiveDistance * tickVal;
    } else {
      // Points
      const pointMultiplier = spec.tickSize > 0 && spec.tickValue !== undefined
        ? spec.tickValue / spec.tickSize
        : spec.contractSize;
      lossInQuote = effectiveDistance * pointMultiplier;
    }
  } else if (spec.category === 'deriv_synthetics') {
    // Deriv synthetics: Loss per lot = stop distance in points * contract size * point multiplier
    const pointMultiplier = spec.tickSize > 0 && spec.tickValue !== undefined
      ? spec.tickValue / spec.tickSize
      : spec.contractSize;
    lossInQuote = effectiveDistance * pointMultiplier;
  } else {
    // Generic fallback based on contract size
    lossInQuote = effectiveDistance * spec.contractSize;
  }

  // 2. Convert quote currency to Account Currency (default USD)
  const quote = (spec.quoteCurrency || 'USD').toUpperCase();
  const accountCurr = (inputs.accountCurrency || 'USD').toUpperCase();

  if (quote === accountCurr || spec.conversionType === 'none') {
    return { lossPerLot: lossInQuote };
  }

  // Currency conversion required
  if (exchangeRate === null || exchangeRate === undefined || isNaN(exchangeRate) || exchangeRate <= 0) {
    return {
      lossPerLot: 0,
      error: `Missing or invalid exchange rate for ${spec.conversionPair || quote}/${accountCurr}. Manual conversion rate is required to calculate accurate risk in ${accountCurr}.`,
    };
  }

  let convertedLoss = lossInQuote;
  let note = '';

  if (spec.conversionType === 'divide_by_rate') {
    convertedLoss = lossInQuote / exchangeRate;
    note = `Converted from ${quote} to ${accountCurr} at 1 ${accountCurr} = ${exchangeRate} ${quote}`;
  } else if (spec.conversionType === 'multiply_by_rate') {
    convertedLoss = lossInQuote * exchangeRate;
    note = `Converted from ${quote} to ${accountCurr} at 1 ${quote} = ${exchangeRate} ${accountCurr}`;
  }

  return {
    lossPerLot: convertedLoss,
    conversionNote: note,
  };
}

/**
 * Normalizes position size according to broker constraints (minLot, lotStep, maxLot)
 * by strictly rounding DOWN to ensure risk does not exceed planned budget.
 */
export function normalizePositionSize(
  rawLot: number,
  minLot: number,
  lotStep: number,
  maxLot: number
): {
  normalizedLot: number;
  isMinLotViolated: boolean;
  maxLotCapped?: boolean;
  rawUncappedLots?: number;
  warning?: string;
} {
  if (rawLot <= 0) {
    return { normalizedLot: 0, isMinLotViolated: false };
  }

  if (minLot <= 0 || lotStep <= 0) {
    return {
      normalizedLot: 0,
      isMinLotViolated: false,
      warning: 'Invalid lot step or minimum lot specification.',
    };
  }

  // If raw calculated position size is strictly less than broker minLot
  if (rawLot < minLot) {
    return {
      normalizedLot: 0,
      isMinLotViolated: true,
      warning: `Calculated position (${rawLot.toFixed(4)}) is below minimum tradable order size (${minLot}). Trading the minimum lot would exceed your risk budget.`,
    };
  }

  // Determine precision from lotStep
  const precision = getDecimalPlaces(lotStep);

  // Strictly round DOWN to nearest step
  const EPSILON = 1e-9;
  const rawSteps = (rawLot - minLot) / lotStep;
  const steps = Math.floor(rawSteps + EPSILON);

  if (steps < 0) {
    return {
      normalizedLot: 0,
      isMinLotViolated: true,
      warning: `Calculated position (${rawLot.toFixed(4)}) is below minimum tradable order size (${minLot}). Trading the minimum lot would exceed your risk budget.`,
    };
  }

  let normalized = minLot + steps * lotStep;
  normalized = Number(normalized.toFixed(precision));
  const rawUncappedLots = normalized;
  let maxLotCapped = false;
  let warningMsg: string | undefined = undefined;

  if (normalized > maxLot) {
    normalized = maxLot;
    maxLotCapped = true;
    warningMsg = `Calculated position (${rawUncappedLots.toFixed(precision)} lots) exceeds single-order broker limit (${maxLot} lots). Sizing capped to ${maxLot} lots per ticket.`;
  }

  return {
    normalizedLot: normalized,
    isMinLotViolated: false,
    maxLotCapped,
    rawUncappedLots,
    warning: warningMsg,
  };
}

/**
 * Master calculation function for TradeSizer
 */
export function calculateTradeSizer(
  inputs: CalculationInputs,
  spec: InstrumentSpec
): CalculationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const model = TRADING_MODELS[inputs.selectedModelId as TradingModelId];
  if (!model) {
    errors.push(`Invalid trading model selected: "${inputs.selectedModelId}".`);
  }

  // Input validations
  if (inputs.accountBalance <= 0 || isNaN(inputs.accountBalance)) {
    errors.push('Account balance must be a positive number greater than 0.');
  }

  if (inputs.stopLossDistance <= 0 || isNaN(inputs.stopLossDistance)) {
    errors.push('Stop-loss distance must be a positive number greater than 0.');
  }

  if (!inputs.symbol || inputs.symbol.trim() === '') {
    errors.push('Instrument symbol is required.');
  }

  if (!spec || spec.contractSize <= 0 || spec.minLot <= 0 || spec.lotStep <= 0) {
    errors.push('Instrument contract specification is invalid or incomplete.');
  }

  const modelId = model ? model.id : 'A';
  const riskPercentage = inputs.customRiskPercentage !== undefined && inputs.customRiskPercentage > 0
    ? inputs.customRiskPercentage
    : (model ? model.riskPercentage : 0);
  const targetR = model ? model.targetR : 0;

  // Validate partial exit configuration for Models A and B
  const triggerR = inputs.customModelPartial?.triggerR ?? model?.partialTriggerR ?? 3;

  let closePercentage = inputs.customModelPartial?.closePercentage;
  let bankedR = inputs.customModelPartial?.bankedR;

  if (closePercentage !== undefined) {
    bankedR = Number(((closePercentage / 100) * triggerR).toFixed(2));
  } else if (bankedR !== undefined) {
    closePercentage = Number(((bankedR / triggerR) * 100).toFixed(2));
  } else {
    closePercentage = model?.partialClosePercentage ?? 60;
    bankedR = model?.partialBankedR ?? Number(((closePercentage / 100) * triggerR).toFixed(2));
  }

  if (model?.hasPartial) {
    if (bankedR !== undefined && bankedR >= triggerR) {
      errors.push(`Partial banked R (${bankedR}R) must be strictly less than the trigger level (${triggerR}R).`);
    }
    if (closePercentage <= 0 || closePercentage >= 100) {
      errors.push(`Partial close percentage (${closePercentage}%) must be strictly between 1% and 99%.`);
    }
    if (triggerR <= 0) {
      errors.push('Partial trigger R must be a positive number greater than 0.');
    }
  }

  const plannedRiskAmount = calculatePlannedRisk(inputs.accountBalance, riskPercentage);
  const referenceFullTargetProfit = calculateTargetProfit(plannedRiskAmount, targetR);

  // Default empty margin & cost details
  const emptyMargin: MarginDetails = {
    leverage: inputs.leverage || 100,
    marginRequired: 0,
    isMarginExceeded: false,
    freeMarginAfter: inputs.accountBalance || 0,
  };

  const emptyCost: CostDetails = {
    spread: inputs.spread || 0,
    commissionPerLot: inputs.commissionPerLot || 0,
    spreadCost: 0,
    commissionCost: 0,
    totalCost: 0,
    netRiskAmount: plannedRiskAmount,
    netFullWinProfit: referenceFullTargetProfit,
  };

  // If initial validations failed, return early
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      modelId,
      direction: inputs.direction,
      entryPrice: inputs.entryPrice,
      stopLossPrice: inputs.stopLossPrice,
      takeProfitPrice: inputs.takeProfitPrice,
      plannedRiskPercentage: riskPercentage,
      plannedRiskAmount,
      lossPerLotAtStop: 0,
      rawPositionSize: 0,
      normalizedPositionSize: 0,
      actualRiskAmount: 0,
      actualRiskPercentage: 0,
      units: 0,
      standardLots: 0,
      miniLots: 0,
      microLots: 0,
      targetRMultiple: targetR,
      referenceFullTargetProfit,
      plannedTargetProfit: referenceFullTargetProfit,
      actualTargetProfit: 0,
      estimatedGrossBalance: inputs.accountBalance,
      rewardToRiskRatio: targetR,
      marginDetails: emptyMargin,
      costDetails: emptyCost,
      lotUnitName: spec?.category === 'indices' ? 'Contracts' : 'Lots',
      exchangeRateUsed: inputs.exchangeRate,
      isMinLotViolated: false,
    };
  }

  // Calculate loss per lot at stop
  const { lossPerLot, error: lossError, conversionNote } = calculateLossPerLot(inputs, spec);
  if (lossError) {
    errors.push(lossError);
  }

  if (lossPerLot <= 0 || errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      modelId,
      direction: inputs.direction,
      entryPrice: inputs.entryPrice,
      stopLossPrice: inputs.stopLossPrice,
      takeProfitPrice: inputs.takeProfitPrice,
      plannedRiskPercentage: riskPercentage,
      plannedRiskAmount,
      lossPerLotAtStop: 0,
      rawPositionSize: 0,
      normalizedPositionSize: 0,
      actualRiskAmount: 0,
      actualRiskPercentage: 0,
      units: 0,
      standardLots: 0,
      miniLots: 0,
      microLots: 0,
      targetRMultiple: targetR,
      referenceFullTargetProfit,
      plannedTargetProfit: referenceFullTargetProfit,
      actualTargetProfit: 0,
      estimatedGrossBalance: inputs.accountBalance,
      rewardToRiskRatio: targetR,
      marginDetails: emptyMargin,
      costDetails: emptyCost,
      lotUnitName: spec?.category === 'indices' ? 'Contracts' : 'Lots',
      exchangeRateUsed: inputs.exchangeRate,
      conversionNote,
      isMinLotViolated: false,
    };
  }

  // Raw position size: Risk Amount / Loss per lot at stop
  const rawPositionSize = plannedRiskAmount / lossPerLot;

  // Round down to broker lot step
  const {
    normalizedLot,
    isMinLotViolated,
    maxLotCapped,
    rawUncappedLots,
    warning: normWarning,
  } = normalizePositionSize(rawPositionSize, spec.minLot, spec.lotStep, spec.maxLot);

  if (normWarning) {
    warnings.push(normWarning);
  }

  // Calculate ticket splits if single-order limit is exceeded
  const precision = getDecimalPlaces(spec.lotStep);
  let ticketSplits: { numTickets: number; ticketSize: number; remainderSize: number } | undefined = undefined;
  if (maxLotCapped && rawUncappedLots && rawUncappedLots > spec.maxLot) {
    const numFullTickets = Math.floor(rawUncappedLots / spec.maxLot);
    const remainder = Number((rawUncappedLots - numFullTickets * spec.maxLot).toFixed(precision));
    ticketSplits = {
      numTickets: remainder > 0 ? numFullTickets + 1 : numFullTickets,
      ticketSize: spec.maxLot,
      remainderSize: remainder,
    };
  }

  // Actual risk after normalization
  const actualRiskAmount = Number((normalizedLot * lossPerLot).toFixed(2));
  const actualRiskPercentage = inputs.accountBalance > 0
    ? Number(((actualRiskAmount / inputs.accountBalance) * 100).toFixed(4))
    : 0;

  // Partial Exit calculations for Models A and B
  let partialDetails: PartialExitDetails | undefined = undefined;
  let headlineTargetProfit = 0;
  let headlineTargetR = targetR;

  if (model.hasPartial && normalizedLot > 0) {
    // Close fraction (e.g. 60% = 0.60)
    const derivedClosePercentage = closePercentage;
    const closeFraction = closePercentage / 100;
    const rawPartialLots = normalizedLot * closeFraction;

    // Round partial lot size strictly DOWN to the broker's volume increment
    const rawSteps = (rawPartialLots - spec.minLot) / spec.lotStep;
    const steps = Math.floor(rawSteps + 1e-9);
    let actualPartialLots = spec.minLot + steps * spec.lotStep;
    actualPartialLots = Number(actualPartialLots.toFixed(precision));

    // Remainder lots running to 4R final target
    const remainderLots = Number((normalizedLot - actualPartialLots).toFixed(precision));

    // Check if position is large enough to split
    const canSplit = actualPartialLots >= spec.minLot && remainderLots >= spec.minLot;

    let splitWarning: string | undefined = undefined;
    if (!canSplit) {
      splitWarning = `Position size (${normalizedLot} ${spec.category === 'indices' ? 'Contracts' : 'Lots'}) is too small to split by ${spec.lotStep} increment. The full position will run without partials.`;
      warnings.push(splitWarning);
    }

    // Actual R banked after volume increment rounding
    const actualBankedDollar = canSplit
      ? Number((actualPartialLots * triggerR * lossPerLot).toFixed(2))
      : 0;
    const actualBankedR = actualRiskAmount > 0
      ? Number((actualBankedDollar / actualRiskAmount).toFixed(2))
      : 0;

    // Remainder added at 4R
    const remainderTargetAddedDollar = canSplit
      ? Number((remainderLots * targetR * lossPerLot).toFixed(2))
      : Number((normalizedLot * targetR * lossPerLot).toFixed(2));
    const remainderTargetAddedR = actualRiskAmount > 0
      ? Number((remainderTargetAddedDollar / actualRiskAmount).toFixed(2))
      : 0;

    // Total profit if full 4R is hit: 1.80R banked + 1.60R remainder = 3.40R
    const fullWinTotalDollar = Number((actualBankedDollar + remainderTargetAddedDollar).toFixed(2));
    const fullWinTotalR = actualRiskAmount > 0
      ? Number((fullWinTotalDollar / actualRiskAmount).toFixed(2))
      : 0;

    // Breakeven scenario: partial fills at 3R (banking 1.80R), remainder stops at breakeven (adds 0)
    const breakevenDollar = actualBankedDollar;
    const breakevenR = actualBankedR;

    // Original-stop scenario: partial fills at 3R, remainder stops at original stop (-1R on remainder)
    const remainderLossDollar = remainderLots * lossPerLot;
    const originalStopDollar = Number((actualBankedDollar - remainderLossDollar).toFixed(2));
    const originalStopR = actualRiskAmount > 0
      ? Number((originalStopDollar / actualRiskAmount).toFixed(2))
      : 0;

    // Price levels if entry price is provided
    let triggerPrice: number | undefined = undefined;
    let finalTargetPrice: number | undefined = undefined;
    let stopPrice: number | undefined = undefined;
    let breakevenPrice: number | undefined = undefined;

    if (inputs.entryPrice && inputs.entryPrice > 0) {
      breakevenPrice = inputs.entryPrice;
      let priceDelta = inputs.stopLossDistance;
      if (inputs.stopLossUnit === 'pips') {
        const pipSize = spec.pipSize || 0.0001;
        priceDelta = inputs.stopLossDistance * pipSize;
      } else if (inputs.stopLossUnit === 'points') {
        const tickSize = spec.tickSize || 1.0;
        priceDelta = inputs.stopLossDistance * tickSize;
      }

      const precision = spec.category === 'forex' ? (spec.symbol.includes('JPY') ? 3 : 5) : 2;

      if (inputs.direction === 'long') {
        stopPrice = Number((inputs.entryPrice - priceDelta).toFixed(precision));
        triggerPrice = Number((inputs.entryPrice + priceDelta * triggerR).toFixed(precision));
        finalTargetPrice = Number((inputs.entryPrice + priceDelta * targetR).toFixed(precision));
      } else {
        stopPrice = Number((inputs.entryPrice + priceDelta).toFixed(precision));
        triggerPrice = Number((inputs.entryPrice - priceDelta * triggerR).toFixed(precision));
        finalTargetPrice = Number((inputs.entryPrice - priceDelta * targetR).toFixed(precision));
      }
    }

    partialDetails = {
      isApplicable: true,
      canSplit,
      splitWarning,
      triggerR,
      bankedRTarget: bankedR,
      derivedClosePercentage,
      rawPartialLots: Number(rawPartialLots.toFixed(6)),
      actualPartialLots: canSplit ? actualPartialLots : 0,
      remainderLots: canSplit ? remainderLots : normalizedLot,
      actualBankedDollar,
      actualBankedR,
      remainderTargetAddedDollar,
      remainderTargetAddedR,
      fullWinTotalDollar,
      fullWinTotalR,
      breakevenDollar,
      breakevenR,
      originalStopDollar,
      originalStopR,
      triggerPrice,
      finalTargetPrice,
      breakevenPrice,
      stopPrice,
    };

    headlineTargetProfit = fullWinTotalDollar;
    headlineTargetR = fullWinTotalR;
  } else {
    // Models C and D: single full exit at 3R, no partials
    headlineTargetProfit = Number((actualRiskAmount * targetR).toFixed(2));
    headlineTargetR = targetR;
  }

  // Margin calculation
  const leverage = inputs.leverage > 0 ? inputs.leverage : 100;
  let notionalValue = 0;
  const currentPrice = inputs.entryPrice && inputs.entryPrice > 0 ? inputs.entryPrice : 1.0;

  if (spec.category === 'forex') {
    notionalValue = normalizedLot * spec.contractSize;
  } else {
    notionalValue = normalizedLot * spec.contractSize * currentPrice;
  }

  const marginRequired = Number((notionalValue / leverage).toFixed(2));
  const isMarginExceeded = marginRequired > inputs.accountBalance;
  let marginWarning: string | undefined = undefined;

  if (isMarginExceeded) {
    marginWarning = `Required margin (${marginRequired.toLocaleString()} ${inputs.accountCurrency}) exceeds account equity (${inputs.accountBalance.toLocaleString()} ${inputs.accountCurrency}). Sizing cannot be opened at 1:${leverage} leverage.`;
    warnings.push(marginWarning);
  } else if (marginRequired > inputs.accountBalance * 0.8) {
    warnings.push(`Required margin occupies ${( (marginRequired / inputs.accountBalance) * 100 ).toFixed(1)}% of your account balance.`);
  }

  const freeMarginAfter = Number((inputs.accountBalance - marginRequired).toFixed(2));

  const marginDetails: MarginDetails = {
    leverage,
    marginRequired,
    isMarginExceeded,
    marginWarning,
    freeMarginAfter,
  };

  // Trading costs: Spread & Commission
  const spread = inputs.spread || 0;
  const commissionPerLot = inputs.commissionPerLot || 0;
  const commissionCost = Number((normalizedLot * commissionPerLot).toFixed(2));
  
  // Spread cost calculation
  let spreadCost = 0;
  if (spread > 0) {
    if (spec.category === 'forex') {
      const pipSize = spec.pipSize || 0.0001;
      const pipVal = (pipSize * spec.contractSize) / (inputs.exchangeRate || 1);
      spreadCost = Number((normalizedLot * spread * pipVal).toFixed(2));
    } else {
      const tickVal = spec.tickValue ?? spec.tickSize;
      spreadCost = Number((normalizedLot * spread * tickVal).toFixed(2));
    }
  }

  const totalCost = Number((spreadCost + commissionCost).toFixed(2));
  const netRiskAmount = Number((actualRiskAmount + totalCost).toFixed(2));
  const netFullWinProfit = Number((headlineTargetProfit - totalCost).toFixed(2));

  const costDetails: CostDetails = {
    spread,
    commissionPerLot,
    spreadCost,
    commissionCost,
    totalCost,
    netRiskAmount,
    netFullWinProfit,
  };

  const estimatedGrossBalance = Number((inputs.accountBalance + headlineTargetProfit).toFixed(2));

  // Determine lot unit name
  let lotUnitName = 'Lots';
  if (spec.category === 'indices') lotUnitName = 'Contracts';

  // BabyPips 1:1 Parity Breakdown
  const units = spec.category === 'forex' || spec.category === 'metals'
    ? Math.round(normalizedLot * spec.contractSize)
    : Number((normalizedLot * spec.contractSize).toFixed(4));
  const standardLots = normalizedLot;
  const miniLots = Number((normalizedLot * 10).toFixed(2));
  const microLots = Number((normalizedLot * 100).toFixed(2));

  // Custom take profit calculation if takeProfitPrice is specified
  if (inputs.takeProfitPrice && inputs.entryPrice && inputs.entryPrice > 0) {
    const isLong = inputs.direction === 'long';
    const profitDelta = isLong
      ? inputs.takeProfitPrice - inputs.entryPrice
      : inputs.entryPrice - inputs.takeProfitPrice;

    if (profitDelta > 0) {
      let stopDelta = inputs.stopLossDistance;
      if (inputs.stopLossUnit === 'pips' && spec.category === 'forex') {
        stopDelta = inputs.stopLossDistance * (spec.pipSize || 0.0001);
      } else if (inputs.stopLossUnit === 'points' && spec.tickSize) {
        stopDelta = inputs.stopLossDistance * spec.tickSize;
      }
      if (stopDelta > 0) {
        const customR = Number((profitDelta / stopDelta).toFixed(2));
        if (!model.hasPartial) {
          headlineTargetR = customR;
          headlineTargetProfit = Number((actualRiskAmount * customR).toFixed(2));
        }
      }
    }
  }

  // Directional sanity check
  if (inputs.entryPrice && inputs.stopLossPrice && inputs.entryPrice > 0 && inputs.stopLossPrice > 0) {
    if (inputs.direction === 'long' && inputs.stopLossPrice >= inputs.entryPrice) {
      warnings.push(`Notice: For a BUY (Long) order, Stop Price is typically below Entry Price.`);
    } else if (inputs.direction === 'short' && inputs.stopLossPrice <= inputs.entryPrice) {
      warnings.push(`Notice: For a SELL (Short) order, Stop Price is typically above Entry Price.`);
    }
  }

  return {
    isValid: true,
    errors,
    warnings,
    modelId,
    direction: inputs.direction,
    entryPrice: inputs.entryPrice,
    stopLossPrice: inputs.stopLossPrice,
    takeProfitPrice: inputs.takeProfitPrice,
    plannedRiskPercentage: riskPercentage,
    plannedRiskAmount: Number(plannedRiskAmount.toFixed(2)),
    lossPerLotAtStop: Number(lossPerLot.toFixed(4)),
    rawPositionSize: Number(rawPositionSize.toFixed(6)),
    normalizedPositionSize: normalizedLot,
    actualRiskAmount,
    actualRiskPercentage: Number(actualRiskPercentage.toFixed(2)),
    units,
    standardLots,
    miniLots,
    microLots,
    targetRMultiple: targetR,
    referenceFullTargetProfit: Number(referenceFullTargetProfit.toFixed(2)),
    plannedTargetProfit: headlineTargetProfit,
    actualTargetProfit: headlineTargetProfit,
    estimatedGrossBalance,
    rewardToRiskRatio: headlineTargetR,
    partialDetails,
    marginDetails,
    costDetails,
    lotUnitName,
    exchangeRateUsed: inputs.exchangeRate,
    conversionNote,
    isMinLotViolated,
    maxLotCapped,
    rawUncappedLots,
    ticketSplits,
  };
}

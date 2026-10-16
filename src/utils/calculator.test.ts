import { describe, it, expect } from 'vitest';
import {
  calculatePlannedRisk,
  calculateTargetProfit,
  calculateTradeSizer,
} from './calculator';
import { INSTRUMENT_CATALOG } from '../constants/instruments';
import type { CalculationInputs } from '../types';

describe('TradeSizer Core Calculation Engine — 3R/2R-Banked/4R-Final & Multi-Asset', () => {
  const eurusdSpec = INSTRUMENT_CATALOG.find((i) => i.symbol === 'EURUSD')!;
  const btcusdSpec = INSTRUMENT_CATALOG.find((i) => i.symbol === 'BTCUSD')!;

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // Test Case 1: Model A Partial Exit Logic
  // -------------------------------------------------------------
  it('1. Model A on $25,000 account: risks $150.00 (0.60%), partial closes 60% at 3R banking $270 (1.8R), remainder to 4R adds $240 (1.6R), full win $510 (3.40R)', () => {
    /**
     * Arithmetic Breakdown:
     * - Account Balance = $25,000.00
     * - Model A Risk % = 0.60% (with optional 0.75% preset)
     * - Planned Risk = $25,000 * 0.0060 = $150.00 (1R)
     * - Stop Distance = 15 pips on EURUSD (loss per 1.0 lot = 15 * $10 = $150.00)
     * - Raw Lots = $150.00 / $150.00 = 1.00 lot
     * - Normalized Lots (lot step 0.01) = 1.00 lot (Actual Risk = 1.00 * $150 = $150.00)
     * - Partial Trigger = 3R, Target Banked = 1.8R
     * - Derived Close Percentage = 60%
     * - Raw Partial Lots = 1.00 * 0.60 = 0.60 lots -> rounded down to step 0.01 = 0.60 lots
     * - Remainder Lots = 1.00 - 0.60 = 0.40 lots
     * - 3R Trigger Profit Banked = 0.60 lots * (3 * $150) = 0.60 * $450 = $270.00 (1.80R)
     * - 4R Final Target Added = 0.40 lots * (4 * $150) = 0.40 * $600 = $240.00 (1.60R)
     * - Full Win Total Profit = $270.00 + $240.00 = $510.00 (3.40R)
     * - Note: Reference unadjusted 4R = $150.00 * 4 = $600.00
     */
    const inputs: CalculationInputs = {
      accountBalance: 25000,
      accountCurrency: 'USD',
      selectedModelId: 'A',
      category: 'forex',
      symbol: 'EURUSD',
      direction: 'long',
      stopLossDistance: 15,
      stopLossUnit: 'pips',
      exchangeRate: null,
      leverage: 100,
      spread: 0,
      commissionPerLot: 0,
      moveStopToBreakeven: true,
    };

    const result = calculateTradeSizer(inputs, eurusdSpec);

    expect(result.isValid).toBe(true);
    expect(result.plannedRiskAmount).toBe(150.0);
    expect(result.actualRiskAmount).toBe(150.0);
    expect(result.normalizedPositionSize).toBe(1.00);
    expect(result.referenceFullTargetProfit).toBe(600.0);

    const partial = result.partialDetails!;
    expect(partial).toBeDefined();
    expect(partial.canSplit).toBe(true);
    expect(partial.triggerR).toBe(3);
    expect(partial.bankedRTarget).toBe(1.8);
    expect(partial.derivedClosePercentage).toBe(60);
    expect(partial.actualPartialLots).toBe(0.60);
    expect(partial.remainderLots).toBe(0.40);

    // Banked profit $270.00 (1.80R)
    expect(partial.actualBankedDollar).toBeCloseTo(270.0, 1);
    expect(partial.actualBankedR).toBeCloseTo(1.8, 1);

    // Remainder added $240.00 (1.60R)
    expect(partial.remainderTargetAddedDollar).toBeCloseTo(240.0, 1);

    // Full win $510.00 (3.40R)
    expect(partial.fullWinTotalDollar).toBeCloseTo(510.0, 1);
    expect(partial.fullWinTotalR).toBeCloseTo(3.40, 1);
    expect(result.actualTargetProfit).toBeCloseTo(510.0, 1);
  });

  // -------------------------------------------------------------
  // Test Case 2: Model B Partial Exit Logic (Identical to A)
  // -------------------------------------------------------------
  it('2. Model B on $25,000 account: identical figures to Model A (risk $150.00, banked $270.00, remainder $240.00, full win $510.00)', () => {
    /**
     * Arithmetic Breakdown:
     * - Model B follows identical rules to Model A (0.60% risk, 4R system with 3R/1.8R partial, 60% closed)
     * - $25,000 * 0.006 = $150.00 risk
     * - Partial banked at 3R = $270.00 (1.80R)
     * - Remainder to 4R adds = $240.00 (1.60R)
     * - Full win = $510.00 (3.40R)
     */
    const inputs: CalculationInputs = {
      accountBalance: 25000,
      accountCurrency: 'USD',
      selectedModelId: 'B',
      category: 'forex',
      symbol: 'EURUSD',
      direction: 'long',
      stopLossDistance: 15,
      stopLossUnit: 'pips',
      exchangeRate: null,
      leverage: 100,
      spread: 0,
      commissionPerLot: 0,
      moveStopToBreakeven: true,
    };

    const result = calculateTradeSizer(inputs, eurusdSpec);
    expect(result.isValid).toBe(true);
    expect(result.plannedRiskAmount).toBe(150.0);

    const partial = result.partialDetails!;
    expect(partial.actualBankedDollar).toBeCloseTo(270.0, 1);
    expect(partial.remainderTargetAddedDollar).toBeCloseTo(240.0, 1);
    expect(partial.fullWinTotalDollar).toBeCloseTo(510.0, 1);
  });

  // -------------------------------------------------------------
  // Test Case 3: Breakeven case and Original-Stop case
  // -------------------------------------------------------------
  it('3. Breakeven case returns $270, original-stop case returns $210', () => {
    /**
     * Arithmetic Breakdown:
     * - Partial Banked at 3R (0.60 lots * $450) = $270.00 (1.80R)
     * - Breakeven case:
     *   Remainder stops at Breakeven (0 P&L).
     *   Net profit = Banked profit = $270.00 (1.80R).
     * - Original-stop case:
     *   Remainder (0.40 lots) stops at original -1R stop.
     *   Remainder loss = 0.40 * $150 = $60.00.
     *   Net profit = $270.00 - $60.00 = $210.00 (1.40R).
     */
    const inputs: CalculationInputs = {
      accountBalance: 25000,
      accountCurrency: 'USD',
      selectedModelId: 'A',
      category: 'forex',
      symbol: 'EURUSD',
      direction: 'long',
      stopLossDistance: 15,
      stopLossUnit: 'pips',
      exchangeRate: null,
      leverage: 100,
      spread: 0,
      commissionPerLot: 0,
      moveStopToBreakeven: false,
    };

    const result = calculateTradeSizer(inputs, eurusdSpec);
    const partial = result.partialDetails!;

    // Breakeven profit
    expect(partial.breakevenDollar).toBeCloseTo(270.0, 1);
    expect(partial.breakevenR).toBeCloseTo(1.8, 1);

    // Original stop profit
    expect(partial.originalStopDollar).toBeCloseTo(210.0, 1);
    expect(partial.originalStopR).toBeCloseTo(1.4, 1);
  });

  // -------------------------------------------------------------
  // Test Case 4: Rounded partial lots never exceed total position and actual R is recalculated
  // -------------------------------------------------------------
  it('4. Rounded partial lots never exceed the position, and actual banked R is recalculated after rounding', () => {
    /**
     * Arithmetic Breakdown:
     * For any position size (e.g. 0.05 lots, 0.17 lots, 1.34 lots):
     * - partialLots <= totalLots
     * - remainderLots = totalLots - partialLots >= 0
     * - actualBankedR = actualBankedDollar / actualRiskAmount
     * - Because partial lots are rounded DOWN, actualBankedR <= 2.0R
     */
    const stops = [8, 12, 17, 22, 33];
    for (const stop of stops) {
      const inputs: CalculationInputs = {
        accountBalance: 25000,
        accountCurrency: 'USD',
        selectedModelId: 'A',
        category: 'forex',
        symbol: 'EURUSD',
        direction: 'long',
        stopLossDistance: stop,
        stopLossUnit: 'pips',
        exchangeRate: null,
        leverage: 100,
        spread: 0,
        commissionPerLot: 0,
        moveStopToBreakeven: true,
      };

      const result = calculateTradeSizer(inputs, eurusdSpec);
      const partial = result.partialDetails!;
      if (partial.canSplit) {
        expect(partial.actualPartialLots).toBeLessThan(result.normalizedPositionSize);
        expect(partial.actualPartialLots + partial.remainderLots).toBeCloseTo(result.normalizedPositionSize, 4);
        expect(partial.actualBankedR).toBeLessThanOrEqual(2.01);
      }
    }
  });

  // -------------------------------------------------------------
  // Test Case 5: Position too small to split triggers a warning, not a silent number
  // -------------------------------------------------------------
  it('5. Position too small to split triggers a warning, not a silent number', () => {
    /**
     * Arithmetic Breakdown:
     * - Account = $500, Risk 0.75% = $3.75
     * - Stop = 25 pips ($250 loss/lot) -> raw size = 0.015 lots -> normalized = 0.01 lots
     * - Minimum lot = 0.01.
     * - If position is 0.01 lots, you cannot split 0.01 into a partial and remainder!
     * - canSplit must be false, splitWarning must be present, no silent split allowed.
     */
    const inputsSmall: CalculationInputs = {
      accountBalance: 500,
      accountCurrency: 'USD',
      selectedModelId: 'A',
      category: 'forex',
      symbol: 'EURUSD',
      direction: 'long',
      stopLossDistance: 25,
      stopLossUnit: 'pips',
      exchangeRate: null,
      leverage: 100,
      spread: 0,
      commissionPerLot: 0,
      moveStopToBreakeven: true,
    };

    const result = calculateTradeSizer(inputsSmall, eurusdSpec);
    expect(result.isValid).toBe(true);
    expect(result.normalizedPositionSize).toBe(0.01);

    const partial = result.partialDetails!;
    expect(partial.canSplit).toBe(false);
    expect(partial.splitWarning).toBeDefined();
    expect(partial.splitWarning).toContain('too small to split');
    expect(result.warnings.some((w) => w.includes('too small to split'))).toBe(true);
  });

  // -------------------------------------------------------------
  // Test Case 6: Models C and D unaffected (0.5% risk, $125 risk, $375 target at 3R)
  // -------------------------------------------------------------
  it('6. Models C and D are unaffected: $125 risk, $375 target at 3R with no partial', () => {
    /**
     * Arithmetic Breakdown:
     * - Account = $25,000.00
     * - Model C/D Risk % = 0.5%
     * - Planned Risk = $25,000 * 0.005 = $125.00
     * - Target Multiple = 3R
     * - Target Profit = $125.00 * 3 = $375.00
     * - No partial exit table, single full exit.
     */
    const inputsC: CalculationInputs = {
      accountBalance: 25000,
      accountCurrency: 'USD',
      selectedModelId: 'C',
      category: 'forex',
      symbol: 'EURUSD',
      direction: 'long',
      stopLossDistance: 25,
      stopLossUnit: 'pips',
      exchangeRate: null,
      leverage: 100,
      spread: 0,
      commissionPerLot: 0,
      moveStopToBreakeven: false,
    };

    const resultC = calculateTradeSizer(inputsC, eurusdSpec);
    expect(resultC.isValid).toBe(true);
    expect(resultC.plannedRiskAmount).toBe(125.0);
    expect(resultC.actualTargetProfit).toBe(375.0);
    expect(resultC.targetRMultiple).toBe(3);
    expect(resultC.partialDetails).toBeUndefined();

    // Model D
    const resultD = calculateTradeSizer({ ...inputsC, selectedModelId: 'D' }, eurusdSpec);
    expect(resultD.isValid).toBe(true);
    expect(resultD.plannedRiskAmount).toBe(125.0);
    expect(resultD.actualTargetProfit).toBe(375.0);
    expect(resultD.targetRMultiple).toBe(3);
    expect(resultD.partialDetails).toBeUndefined();
  });

  // -------------------------------------------------------------
  // Test Case 7: Changing account balance updates risk and target profit correctly
  // -------------------------------------------------------------
  it('7. Changing account balance updates risk and target profit correctly', () => {
    /**
     * Arithmetic Breakdown:
     * - $50,000 on Model A (0.75%) -> Risk = $375.00. 4R ref = $1,500.00.
     * - $100,000 on Model C (0.5%) -> Risk = $500.00. 3R target = $1,500.00.
     */
    const risk50k = calculatePlannedRisk(50000, 0.75);
    const target50k = calculateTargetProfit(risk50k, 4);
    expect(risk50k).toBe(375.0);
    expect(target50k).toBe(1500.0);

    const risk100k = calculatePlannedRisk(100000, 0.5);
    const target100k = calculateTargetProfit(risk100k, 3);
    expect(risk100k).toBe(500.0);
    expect(target100k).toBe(1500.0);
  });

  // -------------------------------------------------------------
  // Test Case 8: Changing stop loss distance changes position size inversely
  // -------------------------------------------------------------
  it('8. Changing the stop-loss distance changes position size inversely', () => {
    /**
     * Arithmetic Breakdown:
     * - Sizing = Risk / (Stop * PipValue)
     * - Wider stop yields strictly smaller position size.
     */
    const baseInputs: CalculationInputs = {
      accountBalance: 25000,
      accountCurrency: 'USD',
      selectedModelId: 'A',
      category: 'forex',
      symbol: 'EURUSD',
      direction: 'long',
      stopLossDistance: 10,
      stopLossUnit: 'pips',
      exchangeRate: null,
      leverage: 100,
      spread: 0,
      commissionPerLot: 0,
      moveStopToBreakeven: true,
    };

    const tight = calculateTradeSizer({ ...baseInputs, stopLossDistance: 10 }, eurusdSpec);
    const wide = calculateTradeSizer({ ...baseInputs, stopLossDistance: 20 }, eurusdSpec);

    expect(tight.normalizedPositionSize).toBe(1.5);
    expect(wide.normalizedPositionSize).toBe(0.75);
    expect(tight.normalizedPositionSize).toBeGreaterThan(wide.normalizedPositionSize);
  });

  // -------------------------------------------------------------
  // Test Case 9: Crypto BTCUSD position sizing & margin verification
  // -------------------------------------------------------------
  it('9. Calculates Crypto (BTCUSD) position sizing and margin requirements correctly', () => {
    /**
     * Arithmetic Breakdown:
     * - Account = $25,000 on Model A ($150.00 risk at 0.60%)
     * - BTCUSD Entry = $90,000, Stop Distance = $750.00
     * - Contract size = 1 BTC. Loss per lot at stop = $750.00.
     * - Raw size = $150.00 / $750.00 = 0.20 BTC (lots).
     * - Lot step = 0.01 -> normalized = 0.20 BTC.
     * - Actual Risk = 0.20 * $750 = $150.00.
     * - Margin Required at 1:100 leverage = (0.20 * 1 * $90,000) / 100 = $180.00 USD.
     */
    const inputs: CalculationInputs = {
      accountBalance: 25000,
      accountCurrency: 'USD',
      selectedModelId: 'A',
      category: 'crypto',
      symbol: 'BTCUSD',
      direction: 'long',
      entryPrice: 90000,
      stopLossDistance: 750,
      stopLossUnit: 'price',
      exchangeRate: null,
      leverage: 100,
      spread: 5.0, // $5 spread
      commissionPerLot: 4.0, // $4/lot commission
      moveStopToBreakeven: true,
    };

    const result = calculateTradeSizer(inputs, btcusdSpec);
    expect(result.isValid).toBe(true);
    expect(result.normalizedPositionSize).toBe(0.2);
    expect(result.actualRiskAmount).toBe(150.0);
    expect(result.marginDetails.marginRequired).toBe(180.0);
    expect(result.marginDetails.isMarginExceeded).toBe(false);
  });

  // -------------------------------------------------------------
  // Test Case 10: Validation error when Banked R >= Trigger R
  // -------------------------------------------------------------
  it('10. Custom partial exit validation rejects banked R >= trigger R', () => {
    /**
     * Arithmetic Breakdown:
     * - If a user attempts to configure a 3R trigger but bank 3.5R,
     *   banked R >= trigger R is physically impossible on a partial exit.
     *   Engine must reject with an explicit validation error.
     */
    const inputsInvalidPartial: CalculationInputs = {
      accountBalance: 25000,
      accountCurrency: 'USD',
      selectedModelId: 'A',
      category: 'forex',
      symbol: 'EURUSD',
      direction: 'long',
      stopLossDistance: 15,
      stopLossUnit: 'pips',
      exchangeRate: null,
      leverage: 100,
      spread: 0,
      commissionPerLot: 0,
      moveStopToBreakeven: true,
      customModelPartial: { triggerR: 3, bankedR: 3.5 }, // 3.5 >= 3 invalid!
    };

    const result = calculateTradeSizer(inputsInvalidPartial, eurusdSpec);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('must be strictly less than the trigger level'))).toBe(true);
  });

  // -------------------------------------------------------------
  // Test Case 11: BabyPips 1:1 Parity Breakdown Verification
  // -------------------------------------------------------------
  it('11. BabyPips 1:1 Parity: EURUSD $10k account, 1.5% risk ($150), 50 pip stop -> 0.30 standard lots, 3.00 mini lots, 30.00 micro lots, 30,000 units', () => {
    /**
     * Exact BabyPips Reference:
     * Balance: $10,000
     * Risk: 1.5% = $150.00
     * Stop: 50 pips
     * 1 standard lot = 100,000 units -> $10/pip -> 50 pips = $500 loss per lot
     * Position Size = $150 / $500 = 0.30 lots
     * Units = 0.30 * 100,000 = 30,000 units
     * Standard lots = 0.30
     * Mini lots = 3.00
     * Micro lots = 30.00
     */
    const inputs: CalculationInputs = {
      accountBalance: 10000,
      accountCurrency: 'USD',
      selectedModelId: 'D',
      customRiskPercentage: 1.5,
      category: 'forex',
      symbol: 'EURUSD',
      direction: 'long',
      stopLossDistance: 50,
      stopLossUnit: 'pips',
      exchangeRate: null,
      leverage: 100,
      spread: 0,
      commissionPerLot: 0,
      moveStopToBreakeven: false,
    };

    const result = calculateTradeSizer(inputs, eurusdSpec);
    expect(result.isValid).toBe(true);
    expect(result.actualRiskAmount).toBe(150.0);
    expect(result.normalizedPositionSize).toBe(0.30);
    expect(result.units).toBe(30000);
    expect(result.standardLots).toBe(0.30);
    expect(result.miniLots).toBe(3.00);
    expect(result.microLots).toBe(30.00);
  });

  // -------------------------------------------------------------
  // Test Case 12: BTCUSD Position Sizing without minLot Error
  // -------------------------------------------------------------
  it('12. BTCUSD on $10,000 account, 1.5% risk ($150), Entry 81,500, Stop 80,500 ($1,000 stop) -> 0.150 BTC position size, 0 minLot violation', () => {
    /**
     * Bitcoin CFD:
     * Balance: $10,000
     * Risk: 1.5% = $150.00
     * Entry: $81,500, Stop: $80,500 -> Distance: $1,000
     * Contract Size: 1 BTC
     * Loss per 1.0 lot at stop = $1,000.00
     * Raw lots = $150 / $1000 = 0.15 BTC
     * Min lot: 0.001 -> 0.150 is well above min lot, no errors!
     */
    const inputs: CalculationInputs = {
      accountBalance: 10000,
      accountCurrency: 'USD',
      selectedModelId: 'D',
      customRiskPercentage: 1.5,
      category: 'crypto',
      symbol: 'BTCUSD',
      direction: 'long',
      entryPrice: 81500,
      stopLossPrice: 80500,
      stopLossDistance: 1000,
      stopLossUnit: 'price',
      exchangeRate: null,
      leverage: 100,
      spread: 0,
      commissionPerLot: 0,
      moveStopToBreakeven: false,
    };

    const result = calculateTradeSizer(inputs, btcusdSpec);
    expect(result.isValid).toBe(true);
    expect(result.isMinLotViolated).toBe(false);
    expect(result.errors.length).toBe(0);
    expect(result.normalizedPositionSize).toBe(0.15);
    expect(result.actualRiskAmount).toBe(150.0);
    expect(result.units).toBe(0.15);
  });

  // -------------------------------------------------------------
  // Test Case 13: Deriv Jump 100 Index — User's Case ($25,000 account, 4.44 pts risk)
  // -------------------------------------------------------------
  it('13. Deriv Jump 100 Index: accurately calculates 10% risk ($2,500) and 1% risk ($250) without artificial 50-lot cap', () => {
    const jump100Spec = INSTRUMENT_CATALOG.find((i) => i.symbol === 'JUMP_100_INDEX')!;
    expect(jump100Spec).toBeDefined();

    // Case A: 10% Risk ($2,500)
    const inputs10Pct: CalculationInputs = {
      accountBalance: 25000,
      accountCurrency: 'USD',
      selectedModelId: 'A',
      customRiskPercentage: 10,
      category: 'deriv_synthetics',
      symbol: 'JUMP_100_INDEX',
      direction: 'long',
      entryPrice: 122.19,
      stopLossPrice: 117.75,
      takeProfitPrice: 144.44,
      stopLossDistance: 4.44,
      stopLossUnit: 'price',
      exchangeRate: null,
      leverage: 100,
      spread: 0,
      commissionPerLot: 0,
      moveStopToBreakeven: false,
    };

    const result10 = calculateTradeSizer(inputs10Pct, jump100Spec);
    expect(result10.isValid).toBe(true);
    expect(result10.lossPerLotAtStop).toBe(4.44);
    expect(result10.plannedRiskAmount).toBe(2500.0);
    // 2500 / 4.44 = 563.063 -> normalized to 563.06 lots (step 0.01)
    expect(result10.normalizedPositionSize).toBe(563.06);
    expect(result10.actualRiskAmount).toBeCloseTo(2499.99, 1);
    expect(result10.actualRiskPercentage).toBe(10.0);
    expect(result10.units).toBe(563.06);

    // Case B: 1% Risk ($250)
    const inputs1Pct: CalculationInputs = {
      ...inputs10Pct,
      customRiskPercentage: 1.0,
    };

    const result1 = calculateTradeSizer(inputs1Pct, jump100Spec);
    expect(result1.isValid).toBe(true);
    // 250 / 4.44 = 56.306 -> floored strictly to 56.30 lots to never exceed $250 budget
    expect(result1.normalizedPositionSize).toBe(56.30);
    expect(result1.actualRiskAmount).toBeCloseTo(249.97, 1);
    expect(result1.actualRiskPercentage).toBe(1.0);
  });

  // -------------------------------------------------------------
  // Test Case 14: Deriv Step Index & Volatility 75 Index
  // -------------------------------------------------------------
  it('14. Deriv Step Index and V75 Index sizing precision', () => {
    const stepSpec = INSTRUMENT_CATALOG.find((i) => i.symbol === 'STEP_INDEX')!;
    const v75Spec = INSTRUMENT_CATALOG.find((i) => i.symbol === 'VOLATILITY_75_INDEX')!;

    // Step Index: $10,000 account, 1% risk ($100), 50 pts stop -> 2.00 lots
    const resultStep = calculateTradeSizer({
      accountBalance: 10000,
      accountCurrency: 'USD',
      selectedModelId: 'C',
      customRiskPercentage: 1.0,
      category: 'deriv_synthetics',
      symbol: 'STEP_INDEX',
      direction: 'long',
      entryPrice: 8500.0,
      stopLossPrice: 8450.0,
      stopLossDistance: 50.0,
      stopLossUnit: 'price',
      exchangeRate: null,
      leverage: 100,
      spread: 0,
      commissionPerLot: 0,
      moveStopToBreakeven: false,
    }, stepSpec);

    expect(resultStep.isValid).toBe(true);
    expect(resultStep.normalizedPositionSize).toBe(2.00);
    expect(resultStep.actualRiskAmount).toBe(100.0);

    // V75 Index: $5,000 account, 1% risk ($50), 1000 pts stop -> 0.050 lots
    const resultV75 = calculateTradeSizer({
      accountBalance: 5000,
      accountCurrency: 'USD',
      selectedModelId: 'D',
      customRiskPercentage: 1.0,
      category: 'deriv_synthetics',
      symbol: 'VOLATILITY_75_INDEX',
      direction: 'long',
      entryPrice: 350000.0,
      stopLossPrice: 349000.0,
      stopLossDistance: 1000.0,
      stopLossUnit: 'price',
      exchangeRate: null,
      leverage: 100,
      spread: 0,
      commissionPerLot: 0,
      moveStopToBreakeven: false,
    }, v75Spec);

    expect(resultV75.isValid).toBe(true);
    expect(resultV75.normalizedPositionSize).toBe(0.050);
    expect(resultV75.actualRiskAmount).toBe(50.0);
  });
});

/**
 * Format currency with symbol and decimal precision
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  decimals: number = 2
): string {
  if (isNaN(amount)) return '$0.00';
  
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'CA$',
    AUD: 'A$',
    CHF: 'CHF ',
  };

  const symbol = symbols[currency.toUpperCase()] || `${currency.toUpperCase()} `;
  
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format numbers with comma grouping and dynamic decimals
 */
export function formatNumber(value: number, maxDecimals: number = 4): string {
  if (isNaN(value)) return '0';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Format lots or contracts with appropriate decimal places based on lot step
 */
export function formatLots(lots: number, lotStep: number = 0.01): string {
  if (isNaN(lots)) return '0.00';
  const decimals = Math.max(2, getDecimalPlaces(lotStep));
  return lots.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function getDecimalPlaces(num: number): number {
  const s = num.toString();
  const parts = s.split('.');
  return parts.length > 1 ? parts[1].length : 0;
}

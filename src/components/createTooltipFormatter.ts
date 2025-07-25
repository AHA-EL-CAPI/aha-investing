// src/components/createTooltipFormatter.ts
export type Currency = 'COP' | 'USD';

export function createTooltipFormatter(currency: Currency) {
  return (value: number | string, name: string): [string, string] => {
    const label = String(name).toLowerCase();
    const numValue = Number(value);

    if (isNaN(numValue)) return ['N/A', name];

    if (label.includes('roe') || label.includes('%')) {
      return [`${(numValue).toFixed(2)}%`, name];
    }

    const locale = currency === 'COP' ? 'es-CO' : 'en-US';
    const unitSymbol = currency === 'COP' ? 'COP $' : 'USD $';
    const unitSuffix = currency === 'COP' ? 'M' : 'B';

    return [
      `${unitSymbol}${numValue.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })} ${unitSuffix}`,
      name,
    ];
  };
}

import type { ReactNode } from 'react';

import { ChartCard } from '@/components/ChartCard';
import { PriceChart } from '@/components/PriceChart';
import { SiteHeader } from '@/components/SiteHeader';
import { QuarterlyBase } from '@/types/QuarterlyBase';

type PricePoint = { date: string; close: number };

type Num = number | string | null | undefined;

export type DashboardMetric = {
  title: string;
  dataKey: string;
  yoy: Num;
  percent?: boolean;
};

export type ValuationTable = {
  headers: string[];
  rows: (string | number)[][];
  quantities: Record<string, string | number>;
};

type Props = {
  name: string;
  ticker: string;
  currency: 'USD' | 'COP';
  data: QuarterlyBase[];
  metrics: DashboardMetric[];
  divisor: number;
  valuationTable: ValuationTable;
  priceHistory: PricePoint[];
  note?: ReactNode;
};

const de = (value: number, digits: number) =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(value);

function Growth({ v }: { v: Num }) {
  if (typeof v !== 'number') return <span className="text-muted">N/A</span>;
  const up = v >= 0;
  return (
    <span className={up ? 'text-pos' : 'text-neg'}>
      {up ? '▲' : '▼'} {Math.abs(v).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
    </span>
  );
}

// Plantilla común de los dashboards de /dashboard/[TICKER]
export function StockDashboard({
  name,
  ticker,
  currency,
  data,
  metrics,
  divisor,
  valuationTable,
  priceHistory,
  note,
}: Props) {
  const lastData = data[data.length - 1];
  const lastPrice = priceHistory.at(-1)?.close ?? null;
  const fairPrice = Number(valuationTable.rows[2][3]);
  const cellDigits = currency === 'USD' ? 1 : 0;
  const cheap = lastPrice !== null && lastPrice < fairPrice;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-bg pb-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-8 sm:px-6">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-accent">{ticker}</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">Principales métricas de {name}</h1>
            {note}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {metrics.map((m) => (
              <ChartCard
                key={m.dataKey}
                title={m.title}
                dataKey={m.dataKey}
                data={data}
                currency={currency}
                divisor={m.percent ? undefined : divisor}
                yLabel={m.percent ? 'Porcentaje (%)' : undefined}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* Crecimiento del último trimestre */}
            {lastData && (
              <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:p-5 lg:col-span-2">
                <h2 className="text-lg font-semibold text-fg">Último trimestre: {lastData.quarter}</h2>
                <p className="text-sm text-muted">Crecimiento frente al mismo trimestre del año anterior</p>
                <table className="w-full text-sm">
                  <tbody>
                    {metrics.map((m) => (
                      <tr key={m.dataKey} className="border-t border-grid">
                        <td className="py-2.5 pr-3 text-fg">{m.title}</td>
                        <td className="py-2.5 text-right font-mono tabular-nums">
                          <Growth v={m.yoy} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Valoración */}
            <section className="flex min-w-0 flex-col gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5 lg:col-span-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold text-fg">Tabla de sensibilidad</h2>
                <span className="text-sm text-muted">
                  Precio justo:{' '}
                  <span className="font-mono text-base font-semibold text-accent">
                    {currency} $ {de(fairPrice, 0)}
                  </span>
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center font-mono text-sm tabular-nums">
                  <thead>
                    <tr>
                      {valuationTable.headers.map((header, index) => (
                        <th
                          key={index}
                          className="border-b border-line px-2 py-2 text-xs font-medium uppercase tracking-wide text-muted"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {valuationTable.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-grid">
                        {row.map((cell, colIndex) => {
                          const highlight = rowIndex === 2 && colIndex === 3;
                          const label = rowIndex === 0 || colIndex === 0;
                          return (
                            <td
                              key={colIndex}
                              className={`px-2 py-2 ${
                                highlight
                                  ? 'rounded-md bg-accent font-bold text-accent-ink'
                                  : label
                                    ? 'text-muted'
                                    : 'text-fg'
                              }`}
                            >
                              {!isNaN(Number(cell)) ? de(Number(cell), cellDigits) : cell}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-fg">Supuestos</h3>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                  {Object.entries(valuationTable.quantities).map(([key, value]) => {
                    let formattedValue: string;

                    if (key === 'Initial FCF') {
                      formattedValue = `${currency} $ ${de(value as number, cellDigits)}`;
                    } else if (key === 'Disccount Rate' || key === 'Margin of safety') {
                      formattedValue = `${value}%`;
                    } else {
                      formattedValue = String(value);
                    }

                    return (
                      <div key={key} className="flex flex-col">
                        <dt className="text-xs text-muted">{key}</dt>
                        <dd className="font-mono text-fg">{formattedValue}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </section>
          </div>

          <PriceChart priceData={priceHistory} companyName={ticker} currency={currency} />

          {/* Veredicto */}
          {lastPrice !== null && (
            <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-xl border border-line bg-surface p-6 text-center">
              <div className="grid w-full grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-widest text-muted">Último precio</span>
                  <span className="font-mono text-2xl font-semibold text-fg sm:text-3xl">
                    {currency} $ {lastPrice.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-widest text-muted">Valor justo</span>
                  <span className="font-mono text-2xl font-semibold text-accent sm:text-3xl">
                    {currency} ${' '}
                    {fairPrice.toLocaleString('es-CO', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: currency === 'USD' ? 2 : 0,
                    })}
                  </span>
                </div>
              </div>
              <span
                className={`rounded-full px-5 py-2 text-lg font-bold ${
                  cheap ? 'bg-pos/15 text-pos' : 'bg-neg/15 text-neg'
                }`}
              >
                {cheap ? 'Comprar (Precio inferior al valor justo)' : 'No comprar (Precio superior al valor justo)'}
              </span>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

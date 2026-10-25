'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { createTooltipFormatter } from './createTooltipFormatter';
import { QuarterlyBase } from '@/types/QuarterlyBase'; // ✅ NEW: shared type

type ChartCardProps = {
  title: string;
  dataKey: keyof QuarterlyBase;
  data: QuarterlyBase[];
  currency: 'USD' | 'COP';
  divisor?: number; // las cifras se muestran divididas por este número (p. ej. 1_000_000)
  yLabel?: string;
};

const isPercent = (yLabel: string) => yLabel.includes('%');

export const ChartCard = ({
  title,
  dataKey,
  data,
  currency,
  divisor,
  yLabel = currency === 'USD' ? 'Billones de USD $' : 'Billones de COP $',
}: ChartCardProps) => {
  const tickFormatter = divisor ? (value: number) => (value / divisor).toFixed(1) : undefined;
  const last = data.at(-1);
  // El rojo marca valores negativos solo en series que también tienen positivos (el CAPEX siempre es negativo)
  const mixed = data.some((d) => typeof d[dataKey] === 'number' && (d[dataKey] as number) > 0);
  const isNeg = (v: number | null) => mixed && v !== null && v < 0;
  const lastValue = typeof last?.[dataKey] === 'number' ? (last[dataKey] as number) : null;
  const lastText =
    lastValue === null
      ? 'N/A'
      : isPercent(yLabel)
        ? `${lastValue.toLocaleString('es-CO', { maximumFractionDigits: 1 })}%`
        : tickFormatter
          ? tickFormatter(lastValue).replace('.', ',')
          : lastValue.toLocaleString('es-CO', { maximumFractionDigits: 1 });

  return (
    <section className="flex w-full min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-semibold text-fg">{title}</h2>
        <span className="font-mono text-xs text-muted">{yLabel}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`font-mono text-2xl font-semibold ${isNeg(lastValue) ? 'text-neg' : 'text-fg'}`}>
          {lastText}
        </span>
        {last && <span className="text-sm text-muted">{last.quarter}</span>}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis dataKey="quarter" tickLine={false} axisLine={{ stroke: 'var(--line)' }} minTickGap={16} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={tickFormatter} width={48} />
          <Tooltip
            formatter={createTooltipFormatter(currency)}
            labelFormatter={(label) => `Trimestre: ${label}`}
            cursor={{ fill: 'var(--surface-2)' }}
            itemStyle={{ color: 'var(--fg)' }}
            wrapperStyle={{ zIndex: 1000 }}
          />
          <Bar dataKey={dataKey} name={title} radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => {
              const rawValue = entry[dataKey];
              const value = typeof rawValue === 'number' ? rawValue : null;
              const fill =
                isNeg(value) ? 'var(--neg)' : index === data.length - 1 ? 'var(--accent)' : 'var(--bar)';

              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};

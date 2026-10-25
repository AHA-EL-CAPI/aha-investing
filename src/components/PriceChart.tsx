'use client';

import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type PricePoint = { date: string; close: number };

type PriceChartProps = {
  priceData: PricePoint[];
  companyName: string; // 👈 new prop
  currency?: 'USD' | 'COP';
};

const fmt = (val: number) =>
  new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

export function PriceChart({ priceData, companyName, currency = 'USD' }: PriceChartProps) {
  const last = priceData.at(-1);
  return (
    <section className="flex w-full min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-semibold text-fg">Precio histórico ({companyName})</h2>
        <span className="font-mono text-xs text-muted">{currency} $</span>
      </div>
      {last && (
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-semibold text-fg">
            {currency} $ {fmt(last.close)}
          </span>
          <span className="text-sm text-muted">último cierre</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={priceData} margin={{ top: 8, right: 4, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={{ stroke: 'var(--line)' }}
            minTickGap={60}
            tickFormatter={(d: string) => String(d).slice(0, 7)}
          />
          <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} tickFormatter={fmt} width={56} />
          <Tooltip
            formatter={(value: number) => [`${currency} $ ${fmt(value)}`, 'Cierre']}
            labelFormatter={(label) => {
              const date = new Date(label);
              const formatted = date.toLocaleDateString('es-CO', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              });
              return `Fecha: ${formatted}`;
            }}
            itemStyle={{ color: 'var(--fg)' }}
          />
          <Area type="monotone" dataKey="close" stroke="var(--accent)" strokeWidth={2} fill="url(#priceFill)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}

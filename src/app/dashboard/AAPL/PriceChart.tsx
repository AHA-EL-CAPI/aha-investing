'use client';

import {
  LineChart, 
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// import TradingViewWidget from '@/components/TradingViewWidget';

type PricePoint = { date: string; close: number };

export function PriceChart({ priceData }: { priceData: PricePoint[] }) {
  return (
    <div className="bg-white dark:bg-black p-4 rounded-2xl shadow mb-12 w-full">
      <h2 className="text-xl font-bold mb-4 text-black dark:text-white text-center">
        Precio Histórico (AAPL)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={priceData}
          margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
        >
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis
            dataKey="date"
            tickFormatter={(val) => val}
            minTickGap={50}
            tick={{ fill: 'white' }}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fill: 'white' }}
            tickFormatter={(val) =>
              new Intl.NumberFormat('es-CO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(val)
            }
            label={{
              value: 'USD $',
              angle: -90,
              position: 'insideLeft',
              dx: -10,
              style: { fill: 'white', fontWeight: 'bold' },
            }}
          />
          <Tooltip
            formatter={(value: number) => [
              `USD $ ${new Intl.NumberFormat('es-CO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value)}`,
              'Cierre',
            ]}
            labelFormatter={(label) => {
              const date = new Date(label);
              const formatted = date.toLocaleDateString('es-CO', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              });
              return `Fecha: ${formatted}`;
            }}
            contentStyle={{
              backgroundColor: '#111',
              border: '1px solid #888',
              color: 'white',
            }}
            labelStyle={{ color: 'white' }}
          />
          <Line type="monotone" dataKey="close" stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}



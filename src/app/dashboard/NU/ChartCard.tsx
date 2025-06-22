'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// import TradingViewWidget from '@/components/TradingViewWidget';

import { stockData } from '@/data/NU/Data';

export const ChartCard = ({
  title,
  dataKey,
  tickFormatter,
  yLabel = 'Billones de USD $',
}: {
  title: string;
  dataKey: keyof typeof stockData[0];
  tickFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number, name: string) => [string, string];
  yLabel?: string;
}) => (
  <div className="bg-white dark:bg-black p-4 rounded-2xl shadow mb-6 w-full">
    <h2 className="text-xl font-bold mb-2 text-black dark:text-white">{title}</h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={stockData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
        <CartesianGrid stroke="#444444" strokeDasharray="3 3" />
        <XAxis
          dataKey="quarter"
          stroke="white"
          axisLine={{ stroke: 'white' }}
          tickLine={{ stroke: 'white' }}
          tick={{ fill: 'white' }}
          label={{
            value: 'Trimestre',
            position: 'insideBottom', // or "insideBottom", "outsideBottom"
            offset: -10,               // adjust spacing if needed
            style: { fill: 'white', fontSize: 20},
          }}
        />
        <YAxis
          stroke="white"
          tick={{ fill: 'white' }}
          tickLine={{ stroke: 'white' }}
          axisLine={{ stroke: 'white' }}
          label={{
            value: yLabel,
            angle: -90,
            position: 'insideLeft',
            dx: 10,
            dy: 45,
            style: { fill: 'white' },
          }}
          tickFormatter={tickFormatter}
        />
        <Tooltip
          formatter={(value, name) => {
            const lowerName = name.toLowerCase();

            if (lowerName.includes("roe") || lowerName.includes("%")) {
              return [`${(value * 1).toFixed(2)}%`, name];
            }

            return [
              `USD $${value.toLocaleString('es-CO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })} B`,
              name
            ];
          }}
          labelFormatter={(label) => `Trimestre: ${label}`}
          contentStyle={{
            backgroundColor: '#111', // Tooltip background
            border: '1px solid #888',
            color: 'white',
          }}
          labelStyle={{ color: 'white', fontWeight: 'bold' }} // Quarter label
          itemStyle={{ color: 'white' }} // Metric value (e.g. ROE)
          wrapperStyle={{ zIndex: 1000 }} // Ensure it's not hidden behind other elements
        />
        {/* <Legend /> */}
        <Bar dataKey={dataKey} name={title} radius={[4, 4, 0, 0]}>
          {stockData.map((entry, index) => {
            const rawValue = entry[dataKey];
            const value = typeof rawValue === 'number' ? rawValue : null;
            const fill = value !== null && value >= 0 ? '#22c55e' : '#ef4444';

            return <Cell key={`cell-${index}`} fill={fill} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);


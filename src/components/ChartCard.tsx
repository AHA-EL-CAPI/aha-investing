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

import { createTooltipFormatter } from './createTooltipFormatter';
import { QuarterlyBase } from '@/types/QuarterlyBase'; // ✅ NEW: shared type

type ChartCardProps = {
  title: string;
  dataKey: keyof QuarterlyBase;
  data: QuarterlyBase[];
  currency: 'USD' | 'COP';
  tickFormatter?: (value: number) => string;
  yLabel?: string;
};

export const ChartCard = ({
  title,
  dataKey,
  data,
  currency,
  tickFormatter,
  yLabel = currency === 'USD' ? 'Billones de USD $' : 'Billones de COP $',
}: ChartCardProps) => (
  <div className="bg-white dark:bg-black p-4 rounded-2xl shadow mb-6 w-full">
    <h2 className="text-xl font-bold mb-2 text-black dark:text-white">{title}</h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
        <CartesianGrid stroke="#444444" strokeDasharray="3 3" />
        <XAxis
          dataKey="quarter"
          stroke="white"
          axisLine={{ stroke: 'white' }}
          tickLine={{ stroke: 'white' }}
          tick={{ fill: 'white' }}
          label={{
            value: 'Trimestre',
            position: 'insideBottom',
            offset: -10,
            style: { fill: 'white', fontSize: 20 },
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
            dx: 5,
            dy: 45,
            style: { fill: 'white' },
          }}
          tickFormatter={tickFormatter}
        />
        <Tooltip
          formatter={createTooltipFormatter(currency)}
          labelFormatter={(label) => `Trimestre: ${label}`}
          contentStyle={{
            backgroundColor: '#111',
            border: '1px solid #888',
            color: 'white',
          }}
          labelStyle={{ color: 'white', fontWeight: 'bold' }}
          itemStyle={{ color: 'white' }}
          wrapperStyle={{ zIndex: 1000 }}
        />
        <Bar dataKey={dataKey} name={title} radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => {
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

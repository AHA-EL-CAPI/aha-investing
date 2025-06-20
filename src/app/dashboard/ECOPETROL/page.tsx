'use client';

import {
  LineChart, 
  Line,
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

import { stockData } from '@/data/ECOPETROL/Data';

import { valuationTable } from '@/data/ECOPETROL/ValuationData';


const formatMillions = (value: number) =>
  `${(value / 1_000).toFixed(1)}`;

// const formatROETooltip = (value: number, name: string): [string, string] => {
//   return [`${value.toFixed(2)}%`, name];
// };

const lastData = stockData[stockData.length - 1];


import { useEffect, useState } from 'react';

const ChartCard = ({
  title,
  dataKey,
  tickFormatter,
  tooltipFormatter,
  yLabel = 'Billones de COP $',
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
            dx: 5,
            dy: 45,
            style: { fill: 'white' },
          }}
          tickFormatter={tickFormatter}
        />
        <Tooltip
          formatter={
            tooltipFormatter ??
            ((value: number, name: string) => {
              const formatted = `${value.toFixed(2)}%`;
              return [formatted, name];
            })
          }
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
          {stockData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry[dataKey] >= 0 ? '#22c55e' : '#ef4444'} // green/red
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

type PricePoint = { date: string; close: number };

export function PriceChart({ priceData }: { priceData: PricePoint[] }) {
  return (
    <div className="bg-white dark:bg-black p-4 rounded-2xl shadow mb-12 w-full">
      <h2 className="text-xl font-bold mb-4 text-black dark:text-white text-center">
        Precio Histórico (ECOPETROL)
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
              value: 'COP $',
              angle: -90,
              position: 'insideLeft',
              dx: -10,
              style: { fill: 'white', fontWeight: 'bold' },
            }}
          />
          <Tooltip
            formatter={(value: number) => [
              `COP $ ${new Intl.NumberFormat('es-CO', {
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

export default function Dashboard() {
  const [priceData, setPriceData] = useState<PricePoint[]>([]);

  useEffect(() => {
    fetch('/api/history/ECOPETROL')
      .then((res) => res.json())
      .then((data) => setPriceData(data));
  }, []);

  const lastPrice = priceData.at(-1)?.close ?? null;
  const fairPrice = Number(valuationTable.rows[2][3]);

  const verdict = lastPrice !== null
    ? lastPrice < fairPrice
      ? '✅ Comprar (Precio inferior al valor justo)'
      : '❌ No comprar (Precio superior al valor justo)'
    : null;

  return (
    <main className="p-6 bg-gray-50 dark:bg-neutral-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">
        Principales Métricas de Ecopetrol
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Ingresos Totales" dataKey="Total_ingresos" tickFormatter={formatMillions} />
        <ChartCard title="Efectivo Neto Operacional" dataKey="Efectivo_neto_generado_por_las_actividades_de_operación" tickFormatter={formatMillions} />
        <ChartCard title="CAPEX" dataKey="Inversión_en_propiedad_planta_y_equipo" tickFormatter={formatMillions} />
        <ChartCard title="FCF" dataKey="FCF" tickFormatter={formatMillions} />
      </div>

      {/* Table for YoY Data */}
      {lastData && (
        <div className="w-full mt-12 flex justify-center">
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4 text-center text-black dark:text-white">
              Último Trimestre - {lastData.quarter}
            </h2>
            <table className="w-full border-collapse border border-white text-sm text-black dark:text-white">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-800">
                  <th className="border border-white px-4 py-2 text-center">Métrica</th>
                  <th className="border border-white px-4 py-2 text-center">Crecimiento YoY</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-white px-4 py-2 text-center">Ingresos</td>
                  <td className="border border-white px-4 py-2 text-center">
                    {lastData.Total_ingresos_ΔYoY_Pct !== null
                      ? `${lastData.Total_ingresos_ΔYoY_Pct.toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-white px-4 py-2 text-center">Efectivo Neto Operacional</td>
                  <td className="border border-white px-4 py-2 text-center">
                    {lastData.Efectivo_neto_generado_por_las_actividades_de_operación_ΔYoY_Pct !== null
                      ? `${lastData.Efectivo_neto_generado_por_las_actividades_de_operación_ΔYoY_Pct.toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-white px-4 py-2 text-center">CAPEX</td>
                  <td className="border border-white px-4 py-2 text-center">
                    {lastData.Inversión_en_propiedad_planta_y_equipo_ΔYoY_Pct !== null
                      ? `${lastData.Inversión_en_propiedad_planta_y_equipo_ΔYoY_Pct.toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-white px-4 py-2 text-center">FCF</td>
                  <td className="border border-white px-4 py-2 text-center">
                    {lastData.FCF_ΔYoY_Pct !== null
                      ? `${lastData.FCF_ΔYoY_Pct.toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table for valuation Data */}
      {<div className="w-full mt-12 flex justify-center">
        <div className="w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-4 text-center text-black dark:text-white">
            Tabla de Sensibilidad
          </h2>
          <table className="w-full border-collapse border border-white text-sm text-black dark:text-white text-center">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-800">
                {valuationTable.headers.map((header, index) => (
                  <th key={index} className="border border-white px-2 py-1">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {valuationTable.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => {
                    return (
                      <td
                        key={colIndex}
                        style={
                          rowIndex === 2 && colIndex === 3
                            ? {
                                backgroundColor: 'yellow',
                                color: 'black',
                                border: '4px solid yellow',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                              }
                            : {
                                border: '1px solid white',
                              }
                        }
                        className="px-2 py-1 text-center"
                      >
                        {!isNaN(Number(cell))
                          ? new Intl.NumberFormat('de-DE', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(Number(cell))
                          : cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          
          <div
            className="mt-12 text-xl font-extrabold text-center text-black dark:text-white"
            style={{ fontSize: '2rem', marginTop: '1rem' }}
          >
            Precio justo: COP&nbsp;$&nbsp;
            {new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(valuationTable.rows[2][3]))}
          </div>
          
          <div className="mt-6 text-black dark:text-white text-sm">
            <h3 className="text-lg font-semibold mb-2">Supuestos:</h3>
            <ul className="list-disc pl-6">
              {Object.entries(valuationTable.quantities).map(([key, value]) => {
                let formattedValue = value;

                if (key === "Initial FCF") {
                  formattedValue = `COP $ ${new Intl.NumberFormat('de-DE', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(value as number)}`;
                } else if (key === "Disccount Rate" || key === "Margin of safety") {
                  formattedValue = `${value}%`;
                }

                return (
                  <li key={key}>
                    <strong>{key}:</strong> {formattedValue}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* TradingView Widget for stock price */}
          {/* <div className="mt-12">
            <h3 className="text-xl font-semibold text-center text-black dark:text-white mb-4">
              Precio de la Acción
            </h3>
            <TradingViewWidget />
          </div> */}

          {/* Price chart */}
          <PriceChart priceData={priceData} />

          {/* Verdict (mejor ubicado y más grande) */}
          {<div
                className="w-full mt-12 flex justify-center"
              >
                <div
                  className="w-full max-w-2xl p-6 bg-neutral-800 rounded-xl text-center text-white shadow-lg"
                  style={{ fontSize: '2rem', lineHeight: '1.2' }} // Forzamos tamaño
                >
                  <div style={{ fontWeight: 800, marginBottom: '1rem' }}>
                    Último precio:
                    COP ${lastPrice?.toLocaleString('es-CO')}
                  </div>
                  <div style={{ fontWeight: 800, marginBottom: '1rem' }}>
                    Valor justo:
                    COP ${fairPrice?.toLocaleString('es-CO', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </div>
                  <div className="text-4xl font-extrabold text-white">
                    {verdict}
                  </div>
                </div>
              </div>}
        </div>
      </div>

      }

    </main>
  );
}

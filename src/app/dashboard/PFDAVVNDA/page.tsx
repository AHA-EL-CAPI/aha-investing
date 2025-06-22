'use client';

// import TradingViewWidget from '@/components/TradingViewWidget';

import { ChartCard } from '@/components/ChartCard';
import { PriceChart } from '@/components/PriceChart';

import { stockData } from '@/data/PFDAVVNDA/Data';

import { valuationTable } from '@/data/PFDAVVNDA/ValuationData';


const formatMillions = (value: number) =>
  `${(value / 1_000_000).toFixed(1)}`;

// const formatROETooltip = (value: number, name: string): [string, string] => {
//   return [`${value.toFixed(2)}%`, name];
// };

const lastData = stockData[stockData.length - 1];


import { useEffect, useState } from 'react';
import { priceHistory } from '@/data/PFDAVVNDA/price-history'; // adjust path as needed

type PricePoint = { date: string; close: number };

import YouTubeBanner from "@/components/YouTubeBanner";

export default function Page() {
  const [priceData, setPriceData] = useState<PricePoint[]>([]);

  useEffect(() => {
    // fetch('/api/history/BCOLOMBIA')
    //   .then((res) => res.json())
    //   .then((data) => setPriceData(data));
    setPriceData(priceHistory);
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
      <YouTubeBanner />
      
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white text-center">
        Principales Métricas de Davivienda
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Net Interest Income" dataKey="Net_Interest_Income" data={stockData} currency="COP" tickFormatter={formatMillions} />
        <ChartCard title="Net Income" dataKey="Net_Income" data={stockData} currency="COP" tickFormatter={formatMillions} />
        <ChartCard title="Equity" dataKey="Equity" data={stockData} currency="COP" tickFormatter={formatMillions} />
        <ChartCard title="ROE" dataKey="ROE" data={stockData} currency="COP" yLabel="Porcentaje (%)" />
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
                  <td className="border border-white px-4 py-2 text-center">Net Interest Income</td>
                  <td className="border border-white px-4 py-2 text-center">
                    {lastData.Net_Interest_Income_ΔYoY_Pct !== null
                      ? `${lastData.Net_Interest_Income_ΔYoY_Pct.toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-white px-4 py-2 text-center">Net Income</td>
                  <td className="border border-white px-4 py-2 text-center">
                    {lastData.Net_Income_ΔYoY_Pct !== null
                      ? `${lastData.Net_Income_ΔYoY_Pct.toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-white px-4 py-2 text-center">Equity</td>
                  <td className="border border-white px-4 py-2 text-center">
                    {lastData.Equity_ΔYoY_Pct !== null
                      ? `${lastData.Equity_ΔYoY_Pct.toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-white px-4 py-2 text-center">ROE</td>
                  <td className="border border-white px-4 py-2 text-center">
                    {lastData.ROE_ΔYoY_Pct !== null
                      ? `${lastData.ROE_ΔYoY_Pct.toFixed(2)}%`
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
                let formattedValue: string;

                if (key === "Initial FCF") {
                  formattedValue = `COP $ ${new Intl.NumberFormat('de-DE', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(value as number)}`;
                } else if (key === "Disccount Rate" || key === "Margin of safety") {
                  formattedValue = `${value}%`;
                } else {
                  formattedValue = String(value);
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
          <PriceChart priceData={priceData} companyName="PFDAVVNDA" />

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

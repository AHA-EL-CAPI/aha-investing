'use client';

// import TradingViewWidget from '@/components/TradingViewWidget';

import { ChartCard } from '@/components/ChartCard';
import { PriceChart } from '@/components/PriceChart';

import { stockData } from '@/data/META/Data';

import { valuationTable } from '@/data/META/ValuationData';

import { priceHistory } from '@/data/META/price-history'; // adjust path as needed


const formatMillions = (value: number) =>
  `${(value / 1).toFixed(1)}`;

// const formatROETooltip = (value: number, name: string): [string, string] => {
//   return [`${value.toFixed(2)}%`, name];
// };

const lastData = stockData[stockData.length - 1];


import { useEffect, useState } from 'react';


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
      
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white  text-center">
        Principales Métricas de Meta
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Ingresos Trimestrales" dataKey="Quarter_Revenue" data={stockData} currency="USD" tickFormatter={formatMillions} />
        <ChartCard title="Efectivo Neto Operacional" dataKey="Quarter_Op_Cash" data={stockData} currency="USD" tickFormatter={formatMillions} />
        <ChartCard title="CAPEX" dataKey="Quarter_CAPEX" data={stockData} currency="USD" tickFormatter={formatMillions} />
        <ChartCard title="FCF" dataKey="Quarter_FCF" data={stockData} currency="USD" tickFormatter={formatMillions} />
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
                  <td className="border border-white px-4 py-2 text-center">Ingresos Totales</td>
                  <td className="border border-white px-4 py-2 text-center">
                    {lastData.QY_on_QY_Revenue_growth !== null
                      ? `${lastData.QY_on_QY_Revenue_growth.toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-white px-4 py-2 text-center">Efectivo Neto Operacional</td>
                  <td className="border border-white px-4 py-2 text-center">
                    {lastData.QY_on_QY_Op_Cash_growth !== null
                      ? `${lastData.QY_on_QY_Op_Cash_growth.toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-white px-4 py-2 text-center">CAPEX</td>
                  <td className="border border-white px-4 py-2 text-center">
                    {lastData.QY_on_QY_Capex_growth !== null
                      ? `${lastData.QY_on_QY_Capex_growth.toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-white px-4 py-2 text-center">FCF</td>
                  <td className="border border-white px-4 py-2 text-center">
                    {lastData.QY_on_QY_FCF_growth !== null
                      ? `${lastData.QY_on_QY_FCF_growth.toFixed(2)}%`
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
                              maximumFractionDigits: 1,
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
            Precio justo: USD&nbsp;$&nbsp;
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
          <PriceChart priceData={priceData} companyName="META" />

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
                    USD ${lastPrice?.toLocaleString('es-CO')}
                  </div>
                  <div style={{ fontWeight: 800, marginBottom: '1rem' }}>
                    Valor justo:
                    USD ${fairPrice?.toLocaleString('es-CO', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
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

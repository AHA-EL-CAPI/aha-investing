import type { ReactNode } from 'react';

import { StockDashboard } from '@/components/StockDashboard';
import type { DashboardRow } from '@/lib/dashboards';

import { valuationTable } from '@/data/PFDAVVNDA/ValuationData';

type PricePoint = { date: string; close: number };

export default function Dashboard({ stockData, priceHistory, note, niiTitle }: { stockData: DashboardRow[]; priceHistory: PricePoint[]; note: ReactNode; niiTitle: string }) {
  const last = stockData[stockData.length - 1];
  return (
    <StockDashboard
      name="Davivienda"
      ticker="PFDAVVNDA"
      currency="COP"
      data={stockData}
      divisor={1_000_000}
      valuationTable={valuationTable}
      priceHistory={priceHistory}
      note={note}
      metrics={[
        { title: niiTitle, dataKey: 'Net_Interest_Income', yoy: last?.Net_Interest_Income_ΔYoY_Pct },
        { title: 'Net Income', dataKey: 'Net_Income', yoy: last?.Net_Income_ΔYoY_Pct },
        { title: 'Equity', dataKey: 'Equity', yoy: last?.Equity_ΔYoY_Pct },
        { title: 'ROE', dataKey: 'ROE', yoy: last?.ROE_ΔYoY_Pct, percent: true },
      ]}
    />
  );
}

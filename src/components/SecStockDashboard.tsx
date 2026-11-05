import Link from 'next/link';

import { StockDashboard } from '@/components/StockDashboard';
import { secDashboard } from '@/lib/sec';

// Dashboards de /dashboard/[TICKER] de empresas de EE. UU., alimentados por el pipeline sec-fundamentales
export function SecStockDashboard({ ticker, name }: { ticker: string; name: string }) {
  const { stockData, priceHistory, valuationTable, isBank, company } = secDashboard(ticker);
  const last = stockData.at(-1);
  const metrics = isBank
    ? [
        { title: 'Ingresos Netos', dataKey: 'Quarter_Revenue', yoy: last?.QY_on_QY_Revenue_growth },
        { title: 'Utilidad Neta', dataKey: 'Quarter_Profit', yoy: last?.QY_on_QY_Profit_growth },
        { title: 'Patrimonio', dataKey: 'Quarter_Equity', yoy: last?.QY_on_QY_Equity_growth },
        { title: 'ROE (trimestre anualizado)', dataKey: 'Quarter_ROE', yoy: last?.QY_on_QY_ROE_growth, percent: true },
      ]
    : [
        { title: 'Ingresos Trimestrales', dataKey: 'Quarter_Revenue', yoy: last?.QY_on_QY_Revenue_growth },
        { title: 'Efectivo Neto Operacional', dataKey: 'Quarter_Op_Cash', yoy: last?.QY_on_QY_Op_Cash_growth },
        { title: 'CAPEX', dataKey: 'Quarter_CAPEX', yoy: last?.QY_on_QY_Capex_growth },
        { title: 'FCF', dataKey: 'Quarter_FCF', yoy: last?.QY_on_QY_FCF_growth },
      ];
  return (
    <StockDashboard
      name={name}
      ticker={ticker}
      currency="USD"
      data={stockData}
      divisor={1}
      valuationTable={valuationTable}
      priceHistory={priceHistory}
      metrics={metrics}
      note={
        <div className="flex max-w-3xl flex-col gap-2 text-sm leading-relaxed text-muted">
          <p>
            Datos oficiales de la SEC (informes 10-Q y 10-K en XBRL), actualizados automáticamente. Último trimestre:{' '}
            <span className="font-mono text-fg">{last?.quarter}</span>. Cifras en miles de millones de USD. El FCF
            inicial de la tabla de sensibilidad es el {isBank ? 'EPS' : 'FCF por acción'} de los últimos 12 meses.{' '}
            <Link href={`/eeuu/${company.ticker}`} className="font-semibold text-accent hover:underline">
              Ver ficha completa y múltiplos →
            </Link>
          </p>
        </div>
      }
    />
  );
}

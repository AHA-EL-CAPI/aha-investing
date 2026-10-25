import type { ReactNode } from 'react';

import { StockDashboard } from '@/components/StockDashboard';
import type { DashboardRow } from '@/lib/dashboards';

import { valuationTable } from '@/data/ECOPETROL/ValuationData';

type PricePoint = { date: string; close: number };

export default function Dashboard({ stockData, priceHistory, note }: { stockData: DashboardRow[]; priceHistory: PricePoint[]; note: ReactNode }) {
  const last = stockData[stockData.length - 1];
  return (
    <StockDashboard
      name="Ecopetrol"
      ticker="ECOPETROL"
      currency="COP"
      data={stockData}
      divisor={1_000_000}
      valuationTable={valuationTable}
      priceHistory={priceHistory}
      note={note}
      metrics={[
        { title: 'Ingresos Totales', dataKey: 'Total_ingresos', yoy: last?.Total_ingresos_ΔYoY_Pct },
        {
          title: 'Efectivo Neto Operacional',
          dataKey: 'Efectivo_neto_generado_por_las_actividades_de_operación',
          yoy: last?.Efectivo_neto_generado_por_las_actividades_de_operación_ΔYoY_Pct,
        },
        {
          title: 'CAPEX',
          dataKey: 'Inversión_en_propiedad_planta_y_equipo',
          yoy: last?.Inversión_en_propiedad_planta_y_equipo_ΔYoY_Pct,
        },
        { title: 'FCF', dataKey: 'FCF', yoy: last?.FCF_ΔYoY_Pct },
      ]}
    />
  );
}

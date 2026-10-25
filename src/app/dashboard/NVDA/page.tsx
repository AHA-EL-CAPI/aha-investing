import { StockDashboard } from '@/components/StockDashboard';

import { stockData } from '@/data/NVDA/Data';
import { valuationTable } from '@/data/NVDA/ValuationData';
import { priceHistory } from '@/data/NVDA/price-history';

const last = stockData[stockData.length - 1];

export default function Page() {
  return (
    <StockDashboard
      name="Nvidia"
      ticker="NVDA"
      currency="USD"
      data={stockData}
      divisor={1}
      valuationTable={valuationTable}
      priceHistory={priceHistory}
      metrics={[
        { title: 'Ingresos Trimestrales', dataKey: 'Quarter_Revenue', yoy: last?.QY_on_QY_Revenue_growth },
        { title: 'Efectivo Neto Operacional', dataKey: 'Quarter_Op_Cash', yoy: last?.QY_on_QY_Op_Cash_growth },
        { title: 'CAPEX', dataKey: 'Quarter_CAPEX', yoy: last?.QY_on_QY_Capex_growth },
        { title: 'FCF', dataKey: 'Quarter_FCF', yoy: last?.QY_on_QY_FCF_growth },
      ]}
    />
  );
}

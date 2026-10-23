import { StockDashboard } from '@/components/StockDashboard';

import { stockData } from '@/data/AMZN/Data';
import { valuationTable } from '@/data/AMZN/ValuationData';
import { priceHistory } from '@/data/AMZN/price-history';

const last = stockData[stockData.length - 1];

export default function Page() {
  return (
    <StockDashboard
      name="Amazon"
      ticker="AMZN"
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

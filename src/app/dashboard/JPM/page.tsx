import { StockDashboard } from '@/components/StockDashboard';

import { stockData } from '@/data/JPM/Data';
import { valuationTable } from '@/data/JPM/ValuationData';
import { priceHistory } from '@/data/JPM/price-history';

const last = stockData[stockData.length - 1];

export default function Page() {
  return (
    <StockDashboard
      name="JPMorgan Chase & Co."
      ticker="JPM"
      currency="USD"
      data={stockData}
      divisor={1}
      valuationTable={valuationTable}
      priceHistory={priceHistory}
      metrics={[
        { title: 'Net Interest Income', dataKey: 'Quarter_Revenue', yoy: last?.QY_on_QY_Revenue_growth },
        { title: 'Net Income', dataKey: 'Quarter_Profit', yoy: last?.QY_on_QY_Profit_growth },
        { title: 'Equity', dataKey: 'Quarter_Equity', yoy: last?.QY_on_QY_Equity_growth },
        { title: 'ROE', dataKey: 'Quarter_ROE', yoy: last?.QY_on_QY_ROE_growth, percent: true },
      ]}
    />
  );
}

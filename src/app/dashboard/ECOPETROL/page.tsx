import { OfficialDataNote } from '@/components/OfficialDataNote';
import { ecopetrolDashboard } from '@/lib/dashboards';
import Dashboard from './Dashboard';

export default function Page() {
  const { stockData, priceHistory } = ecopetrolDashboard();
  return (
    <Dashboard
      stockData={stockData}
      priceHistory={priceHistory}
      note={<OfficialDataNote id="ecopetrol" lastQuarter={stockData.at(-1)?.quarter ?? ''} />}
    />
  );
}

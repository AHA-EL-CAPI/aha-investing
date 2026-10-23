import { OfficialDataNote } from '@/components/OfficialDataNote';
import { daviviendaDashboard } from '@/lib/dashboards';
import Dashboard from './Dashboard';

export default function Page() {
  const { hasNii, stockData, priceHistory } = daviviendaDashboard();
  return (
    <Dashboard
      stockData={stockData}
      priceHistory={priceHistory}
      niiTitle={hasNii ? 'Net Interest Income' : 'Ingresos totales'}
      note={<OfficialDataNote id="davivienda_bank" lastQuarter={stockData.at(-1)?.quarter ?? ''} />}
    />
  );
}

import { OfficialDataNote } from '@/components/OfficialDataNote';
import { bancolombiaDashboard } from '@/lib/dashboards';
import Dashboard from './Dashboard';

export default function Page() {
  const { hasNii, stockData, priceHistory } = bancolombiaDashboard();
  return (
    <Dashboard
      stockData={stockData}
      priceHistory={priceHistory}
      niiTitle={hasNii ? 'Net Interest Income' : 'Ingresos totales'}
      note={
        <OfficialDataNote id="bancolombia" lastQuarter={stockData.at(-1)?.quarter ?? ''}>
          En 2025 Bancolombia pasó a ser filial de Grupo Cibest y le traspasó sus bancos del exterior, por eso desde 2Q25
          sus ingresos y su patrimonio son menores.
          {hasNii ? '' : ' Bancolombia no reporta en SIMEV sus intereses por separado, así que la primera gráfica muestra los ingresos totales.'}
        </OfficialDataNote>
      }
    />
  );
}

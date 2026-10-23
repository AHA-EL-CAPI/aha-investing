import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { loadIndex } from '@/lib/bvc';
import Comparador from './Comparador';
import Glosario from './Glosario';

export const metadata: Metadata = {
  title: 'Acciones colombianas | AHA Investing',
  description: 'Comparador de las empresas de la Bolsa de Valores de Colombia con sus estados financieros oficiales.',
};

export default function Page() {
  const { companies, generated } = loadIndex();
  return (
    <>
    <SiteHeader />
    <main className="tw:pt-8 tw:pb-16 tw:bg-bg tw:min-h-screen">
      <div className="tw:max-w-7xl tw:mx-auto tw:px-4 tw:sm:px-6">
        <h1 className="tw:text-3xl tw:sm:text-4xl tw:font-extrabold tw:tracking-tight tw:font-display tw:mb-2 tw:text-fg">Acciones colombianas</h1>
        <p className="tw:text-muted tw:mb-6 tw:max-w-3xl">
          {companies.length} empresas de la BVC con sus estados financieros oficiales. Haz clic en una columna para
          ordenar y en una empresa para ver su ficha. Las cifras son de los últimos 12 meses.{' '}
          <a href="#glosario" className="tw:text-accent tw:font-semibold tw:hover:underline">
            ¿Qué significa cada métrica?
          </a>
        </p>
        <Comparador companies={companies} />
        <Glosario />
        <p className="tw:text-xs tw:text-muted tw:mt-6">
          Fuente: informes XBRL publicados por los emisores en SIMEV (Superintendencia Financiera de Colombia); precios
          de Yahoo Finance. Actualizado el {generated.slice(0, 10)}. Esto no es una recomendación de inversión.
        </p>
      </div>
    </main>
    </>
  );
}

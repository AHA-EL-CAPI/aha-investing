import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { loadSecIndex } from '@/lib/sec';
import Comparador from './Comparador';
import Glosario from './Glosario';

export const metadata: Metadata = {
  title: 'Acciones de EE. UU. | AHA Investing',
  description: 'Comparador de empresas de Estados Unidos con los estados financieros oficiales que reportan a la SEC.',
};

export default function Page() {
  const { companies, generated } = loadSecIndex();
  return (
    <>
    <SiteHeader />
    <main className="tw:pt-8 tw:pb-16 tw:bg-bg tw:min-h-screen">
      <div className="tw:max-w-7xl tw:mx-auto tw:px-4 tw:sm:px-6">
        <h1 className="tw:text-3xl tw:sm:text-4xl tw:font-extrabold tw:tracking-tight tw:font-display tw:mb-2 tw:text-fg">Acciones de EE. UU.</h1>
        <p className="tw:text-muted tw:mb-6 tw:max-w-3xl">
          {companies.length} empresas (las del S&amp;P 500 y la lista propia de AHA) con los estados financieros que
          reportan a la SEC. Haz clic en una columna para
          ordenar y en una empresa para ver su ficha. Las cifras son de los últimos 12 meses y el último informe se
          muestra en trimestre y año fiscal de cada empresa.{' '}
          <a href="#glosario" className="tw:text-accent tw:font-semibold tw:hover:underline">
            ¿Qué significa cada métrica?
          </a>
        </p>
        {companies.length === 0 ? (
          <p className="tw:text-muted tw:my-8">Los datos de EE. UU. no están disponibles en este momento. Vuelve a intentar más tarde.</p>
        ) : (
          <Comparador companies={companies} />
        )}
        <Glosario />
        <p className="tw:text-xs tw:text-muted tw:mt-6">
          Fuente: informes 10-Q, 10-K y 20-F en XBRL publicados en EDGAR (Securities and Exchange Commission); precios de
          Yahoo Finance. Actualizado el {generated.slice(0, 10)}. &quot;n.s.&quot; = no significativo (utilidad o flujo
          negativo, o patrimonio casi cero). Esto no es una recomendación de inversión.
        </p>
      </div>
    </main>
    </>
  );
}

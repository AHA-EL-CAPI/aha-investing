import type { Metadata } from 'next';
import Link from 'next/link';
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
    <main className="tw:p-6 tw:bg-gray-50 tw:dark:bg-neutral-900 tw:min-h-screen">
      <div className="tw:max-w-7xl tw:mx-auto">
        <Link href="/" className="tw:text-sm tw:text-gray-500 tw:hover:underline">
          ← AHA Investing
        </Link>
        <h1 className="tw:text-3xl tw:font-bold tw:mt-2 tw:mb-2 tw:text-black tw:dark:text-white">Acciones colombianas</h1>
        <p className="tw:text-gray-600 tw:dark:text-gray-400 tw:mb-6 tw:max-w-3xl">
          {companies.length} empresas de la BVC con sus estados financieros oficiales. Haz clic en una columna para
          ordenar y en una empresa para ver su ficha. Las cifras son de los últimos 12 meses.{' '}
          <a href="#glosario" className="tw:text-green-600 tw:font-semibold tw:hover:underline">
            ¿Qué significa cada métrica?
          </a>
        </p>
        <Comparador companies={companies} />
        <Glosario />
        <p className="tw:text-xs tw:text-gray-500 tw:mt-6">
          Fuente: informes XBRL publicados por los emisores en SIMEV (Superintendencia Financiera de Colombia); precios
          de Yahoo Finance. Actualizado el {generated.slice(0, 10)}. Esto no es una recomendación de inversión.
        </p>
      </div>
    </main>
  );
}

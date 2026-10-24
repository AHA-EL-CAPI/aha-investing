import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { companyIds, loadCompany } from '@/lib/bvc';
import { quarterLabel, sectorName } from '@/lib/bvcFormat';
import Ficha from './Ficha';
import Glosario from '../Glosario';
import InfoRelevante from './InfoRelevante';

type Params = { params: Promise<{ empresa: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return companyIds().map((empresa) => ({ empresa }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { empresa } = await params;
  const c = loadCompany(empresa);
  return {
    title: c ? `${c.name} | AHA Investing` : 'AHA Investing',
    description: c ? `Estados financieros, márgenes y múltiplos de ${c.name} con datos oficiales de SIMEV.` : undefined,
  };
}

export default async function Page({ params }: Params) {
  const { empresa } = await params;
  const c = loadCompany(empresa);
  if (!c) notFound();
  return (
    <main className="tw:p-6 tw:bg-gray-50 tw:dark:bg-neutral-900 tw:min-h-screen">
      <div className="tw:max-w-7xl tw:mx-auto">
        <Link href="/bvc" className="tw:text-sm tw:text-gray-500 tw:hover:underline">
          ← Acciones colombianas
        </Link>
        <h1 className="tw:text-3xl tw:font-bold tw:mt-2 tw:text-black tw:dark:text-white">{c.name}</h1>
        <p className="tw:text-gray-600 tw:dark:text-gray-400 tw:mb-6">
          {sectorName(c.sector)}
          {c.ticker ? ` · ${c.ticker.split(';').join(', ')}` : ''} · Estados {c.scope === 'con' ? 'consolidados' : 'separados'} ·
          Último informe {quarterLabel(c.lastPeriod)}
        </p>
        <Ficha c={c} />
        <InfoRelevante news={c.news} url={c.simevUrl} name={c.name} />
        <Glosario keys={['pe', 'pb', 'dy', 'market_cap', 'roe', 'net_margin', 'fcf', 'ttm']} />
        <p className="tw:text-xs tw:text-gray-500 tw:mt-6">
          Fuente: informes XBRL publicados por {c.name} en SIMEV (Superintendencia Financiera de Colombia); precios de
          Yahoo Finance.
          {c.missing > 0 ? ` Faltan ${c.missing} trimestres desde 2015 que no están publicados en SIMEV.` : ''} Esto no es
          una recomendación de inversión.
        </p>
      </div>
    </main>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { loadSecCompany, loadSecIndex, secTickers } from '@/lib/sec';
import { fiscalLabel, PLANTILLA, SECTOR } from '@/lib/secFormat';
import Glosario from '../Glosario';
import Ficha, { type FichaData } from './Ficha';

type Params = { params: Promise<{ ticker: string }> };

// dashboards con tabla de sensibilidad (src/app/dashboard/[TICKER])
const DASHBOARDS = new Set(['AAPL', 'AMD', 'AMZN', 'GOOGL', 'JPM', 'MELI', 'META', 'MSFT', 'NFLX', 'NKE', 'NVDA', 'TSLA']);

export const dynamicParams = false;

export function generateStaticParams() {
  return secTickers().map((ticker) => ({ ticker }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { ticker } = await params;
  const c = loadSecCompany(ticker);
  return {
    title: c ? `${c.name} (${c.ticker}) | AHA Investing` : 'AHA Investing',
    description: c ? `Estados financieros, flujo de caja libre y múltiplos de ${c.name} con datos oficiales de la SEC.` : undefined,
  };
}

export default async function Page({ params }: Params) {
  const { ticker } = await params;
  const c = loadSecCompany(ticker);
  const summary = loadSecIndex().companies.find((x) => x.ticker === ticker);
  if (!c || !summary) notFound();

  const from = Math.max(0, c.periods.findIndex((p) => p >= '2010-01-01'));
  const sl = <T,>(xs: T[]) => xs.slice(from);
  const data: FichaData = {
    ticker: c.ticker,
    isBank: c.tipo === 'banco',
    currency: c.currency,
    periods: sl(c.periods),
    fiscal: sl(c.periods.map((_, i) => fiscalLabel(c.fiscal_year[i], c.fiscal_quarter[i]))),
    quarter: Object.fromEntries(Object.entries(c.quarter).map(([k, v]) => [k, sl(v)])),
    ttm: Object.fromEntries(Object.entries(c.ttm).map(([k, v]) => [k, sl(v)])),
    fy: Object.fromEntries(Object.entries(c.fy).map(([k, v]) => [k, sl(v)])),
    ratios: Object.fromEntries(Object.entries(c.ratios).map(([k, v]) => [k, sl(v)])),
    isFy: sl(c.fiscal_quarter.map((q) => q === 4)),
    prices: c.prices.date.map((d, i) => ({ date: d, close: c.prices.close[i] })).filter((p) => p.date >= '2010-01-01'),
    multiples: c.multiples.date.map((d, i) => ({ date: d, pe: c.multiples.pe[i], pfcf: c.multiples.p_fcf[i] })),
    valuation: c.valuation,
    metrics: summary.metrics,
    lastPeriod: summary.last_period,
    // un eje con una sola parte (MA: 'Payment Solutions' = todo) no es un desglose
    segments: (c.segments ?? [])
      .filter((ax) => new Set(ax.members.filter((mm) => !mm.subtotal).map((mm) => mm.label.trim().toLowerCase())).size > 1)
      .map((ax) => ({
      ...ax,
      members: ax.members.map((mm) => ({ ...mm, quarter: sl(mm.quarter), annual: sl(mm.annual), ttm: sl(mm.ttm) })),
      ok: sl(ax.ok),
      diff: sl(ax.diff),
    })),
    filingUrl: sl(c.filing_url ?? c.periods.map(() => null)),
    filingForm: sl(c.filing_form ?? c.periods.map(() => null)),
    preliminary: sl(c.preliminary ?? c.periods.map(() => null)),
    report6k: sl(c.report_6k ?? c.periods.map(() => null)),
    calc: Object.fromEntries(Object.entries(c.calc ?? {}).map(([k, v]) => [k, sl(v)])),
    calcFy: Object.fromEntries(Object.entries(c.calc_fy ?? {}).map(([k, v]) => [k, sl(v)])),
  };
  const lastPre = c.preliminary?.at(-1);

  return (
    <>
    <SiteHeader />
    <main className="tw:pt-8 tw:pb-16 tw:bg-bg tw:min-h-screen">
      <div className="tw:max-w-7xl tw:mx-auto tw:px-4 tw:sm:px-6">
        <Link href="/eeuu" className="tw:text-sm tw:text-muted tw:hover:text-accent">
          ← Acciones de EE. UU.
        </Link>
        <h1 className="tw:text-3xl tw:sm:text-4xl tw:font-extrabold tw:tracking-tight tw:font-display tw:mt-2 tw:text-fg">{c.name}</h1>
        <p className="tw:text-muted tw:mb-6">
          {c.ticker}
          {c.plantilla && PLANTILLA[c.plantilla] ? ` · ${PLANTILLA[c.plantilla]}` : c.tipo === 'banco' ? ' · Banco' : ''}
          {c.sector ? ` · ${SECTOR[c.sector] ?? c.sector}` : ''}
          {c.sp500 ? ' · S&P 500' : ''} · Último informe {fiscalLabel(summary.fiscal_year, summary.fiscal_quarter)} (cierre{' '}
          {summary.last_period})
          {lastPre && (
            <span className="tw:ml-2 tw:inline-block tw:px-2 tw:py-0.5 tw:rounded-full tw:text-xs tw:font-semibold tw:border tw:border-accent tw:text-accent">
              {lastPre.form === '6-K' ? `6-K del ${lastPre.filed}` : `Preliminar · 8-K del ${lastPre.filed}`}
            </span>
          )}
          {DASHBOARDS.has(c.ticker) && (
            <>
              {' · '}
              <Link href={`/dashboard/${c.ticker}`} className="tw:text-accent tw:font-semibold tw:hover:underline">
                Dashboard con precio justo →
              </Link>
            </>
          )}
        </p>
        <Ficha d={data} />
        <Glosario keys={['market_cap', 'pe', 'p_fcf', 'fcf_yield', 'roe', 'roic', 'fcf', 'ttm']} />
        <p className="tw:text-xs tw:text-muted tw:mt-6">
          Fuente: informes en XBRL que {c.name} publica en{' '}
          <a href={c.sec_url} className="tw:text-accent tw:hover:underline" target="_blank" rel="noopener noreferrer">
            EDGAR (SEC)
          </a>
          ; los trimestres marcados como preliminares salen de las tablas del comunicado de resultados (8-K o 6-K) y
          se reemplazan solos por las cifras del 10-Q / 10-K cuando la empresa lo radica; precios de Yahoo Finance.
          {c.currency !== 'USD' ? ` La empresa reporta en ${c.currency}, así que no se calculan múltiplos contra el precio en dólares.` : ''}{' '}
          Esto no es una recomendación de inversión.
        </p>
      </div>
    </main>
    </>
  );
}

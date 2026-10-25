import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { Sparkline } from '@/components/Sparkline';
import { loadIndex, loadPriceTrail, type CompanySummary } from '@/lib/bvc';
import { pct, price, sectorName, times, cop } from '@/lib/bvcFormat';

// tone: 'dark' para logos negros (se muestran en blanco), 'light' para logos que necesitan fondo claro
type Company = { name: string; symbol: string; image: string; tone?: 'dark' | 'light' };

const colombia: Company[] = [
  { name: "Bancolombia", symbol: "BCOLOMBIA", image: "/logos/bcolombia.png", tone: "dark" },
  { name: "Ecopetrol", symbol: "ECOPETROL", image: "/logos/ecopetrol.png", tone: "light" },
  { name: "Davivienda", symbol: "PFDAVVNDA", image: "/logos/davivienda.png" },
];

const internacionales: Company[] = [
  { name: "Nubank", symbol: "NU", image: "/logos/nu.png" },
  { name: "AMD", symbol: "AMD", image: "/logos/amd.png" },
  { name: "Alibaba", symbol: "BABA", image: "/logos/baba.png" },
  { name: "Apple", symbol: "AAPL", image: "/logos/aapl.png" },
  { name: "Amazon", symbol: "AMZN", image: "/logos/amzn.png", tone: "dark" },
  { name: "Google", symbol: "GOOGL", image: "/logos/googl.png" },
  { name: "Mercadolibre", symbol: "MELI", image: "/logos/meli.png" },
  { name: "Meta", symbol: "META", image: "/logos/meta.png" },
  { name: "Microsoft", symbol: "MSFT", image: "/logos/msft.png" },
  { name: "Netflix", symbol: "NFLX", image: "/logos/nflx.png" },
  { name: "Nvidia", symbol: "NVDA", image: "/logos/nvda.png" },
  { name: "Tesla", symbol: "TSLA", image: "/logos/tsla.png" },
  { name: "Nike", symbol: "NKE", image: "/logos/nke.png", tone: "dark" },
  { name: "JPMorgan", symbol: "JPM", image: "/logos/jpm.png" },
];

const YOUTUBE = 'https://www.youtube.com/@ahainvesting';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
// 2026-10-25 -> 25 de octubre de 2026
const longDate = (d: string) => `${Number(d.slice(8, 10))} de ${MONTHS[Number(d.slice(5, 7)) - 1]} de ${d.slice(0, 4)}`;
const firstTicker = (t: string) => t.split(/[;,]/)[0].trim();
// Bancolombia y Grupo Cibest cotizan con la misma acción: se muestra una sola vez
const uniqueTicker = (qs: Quote[]) => qs.filter((q, i) => qs.findIndex((o) => o.ticker === q.ticker) === i);

type Quote = CompanySummary & { trail: number[]; change: number | null };

// Emisores con precio, su último año de cotizaciones y la variación a 12 meses
function loadQuotes(companies: CompanySummary[]): Quote[] {
  return companies
    .filter((c) => c.valuation?.close)
    .map((c) => {
      const trail = loadPriceTrail(c.id).map((p) => p.close);
      const change = trail.length > 1 ? trail[trail.length - 1] / trail[0] - 1 : null;
      return { ...c, trail, change };
    });
}

// El mejor valor de una métrica entre los emisores que la tienen
function best(quotes: Quote[], value: (q: Quote) => number | null | undefined, lowest = false) {
  const ok = quotes.filter((q) => {
    const v = value(q);
    return v !== null && v !== undefined && Number.isFinite(v) && (!lowest || v > 0);
  });
  ok.sort((a, b) => (lowest ? value(a)! - value(b)! : value(b)! - value(a)!));
  return ok[0];
}

function Change({ value, className = '' }: { value: number | null; className?: string }) {
  if (value === null) return <span className={`text-muted ${className}`}>—</span>;
  const up = value >= 0;
  return (
    <span className={`font-mono ${up ? 'text-pos' : 'text-neg'} ${className}`}>
      {up ? '▲' : '▼'} {pct(Math.abs(value))}
    </span>
  );
}

function CompanyCard({ name, symbol, image, tone }: Company) {
  return (
    <Link
      href={`/dashboard/${symbol}`}
      className="group flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 transition hover:-translate-y-0.5 hover:border-accent/70 hover:shadow-[0_8px_30px_-12px_rgba(232,178,58,0.35)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className={`relative aspect-[16/10] w-full overflow-hidden rounded-lg ${tone === 'light' ? 'bg-[#eef1f4]' : 'bg-surface-2'}`}>
        <Image
          src={image}
          alt={`Logo de ${name}`}
          fill
          sizes="(min-width: 1024px) 180px, 45vw"
          className={`object-contain p-4 transition duration-300 group-hover:scale-105 motion-reduce:transition-none ${tone === 'dark' ? 'brightness-0 invert' : ''}`}
        />
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 px-1">
        <span className="font-semibold text-fg group-hover:text-accent">{name}</span>
        <span className="font-mono text-xs text-muted">{symbol}</span>
      </div>
    </Link>
  );
}

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
    <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Íconos de línea para las tres herramientas del sitio
const icons = {
  table: (
    <path d="M4 6h16M4 12h16M4 18h16M9 6v12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  ),
  doc: (
    <path
      d="M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  ),
  chart: (
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  ),
};

export default function Home() {
  const { generated, companies } = loadIndex();
  const quotes = loadQuotes(companies);
  const top = uniqueTicker([...quotes].sort((a, b) => (b.valuation.market_cap ?? 0) - (a.valuation.market_cap ?? 0))).slice(0, 6);
  const tape = uniqueTicker([...quotes].sort((a, b) => (b.valuation.traded_value ?? 0) - (a.valuation.traded_value ?? 0)));
  // Destacados solo entre las acciones con negociación diaria relevante, para no premiar cifras de acciones casi sin liquidez
  const liquid = quotes.filter((q) => (q.valuation.traded_value ?? 0) >= 500e6);
  const priceDate = quotes.map((q) => q.price_date ?? '').sort().at(-1) ?? generated.slice(0, 10);
  const totalCap = quotes.reduce((s, q) => s + (q.valuation.market_cap ?? 0), 0);

  const highlights = [
    { label: 'Mayor dividendo', note: 'Rentabilidad por dividendo', q: best(liquid, (q) => q.valuation.dividend_yield), show: (q: Quote) => pct(q.valuation.dividend_yield) },
    { label: 'P/E más bajo', note: 'Precio / utilidad (12 meses)', q: best(liquid, (q) => q.valuation.pe, true), show: (q: Quote) => times(q.valuation.pe) },
    { label: 'Mayor ROE', note: 'Rentabilidad sobre el patrimonio', q: best(liquid, (q) => q.metrics.roe), show: (q: Quote) => pct(q.metrics.roe) },
    { label: 'Más subió en 12 meses', note: 'Variación del precio', q: best(liquid, (q) => q.change), show: (q: Quote) => pct(q.change) },
  ].filter((h) => h.q);

  const tools = [
    {
      icon: icons.table,
      title: 'Comparador de la BVC',
      text: `${companies.length} empresas colombianas en una sola tabla: P/E, P/B, dividendo, ROE, márgenes y deuda. Ordena y filtra por sector.`,
      href: '/bvc',
      cta: 'Abrir el comparador',
    },
    {
      icon: icons.doc,
      title: 'Ficha de cada empresa',
      text: 'Estados financieros completos como en el PDF oficial, historia trimestral desde 2015 e información relevante publicada en SIMEV.',
      href: '/bvc/ecopetrol',
      cta: 'Ver un ejemplo: Ecopetrol',
    },
    {
      icon: icons.chart,
      title: 'Dashboards de valoración',
      text: `${colombia.length + internacionales.length} dashboards con ingresos, flujo de caja libre, CAPEX, tabla de sensibilidad y precio justo.`,
      href: '#dashboards',
      cta: 'Ver los dashboards',
    },
  ];

  const steps = [
    { n: '01', title: 'Informes oficiales', text: 'Leemos los reportes XBRL que cada emisor publica en SIMEV, el registro de la Superintendencia Financiera.' },
    { n: '02', title: 'Cruce con el PDF', text: 'Comparamos las cifras clave con los estados financieros en PDF y marcamos lo que no coincide.' },
    { n: '03', title: 'Precios al día', text: 'Los múltiplos se recalculan con el precio de cierre y el sitio se actualiza todos los días.' },
  ];

  return (
    <>
      <SiteHeader />
      <main className="bg-bg">
        {/* Presentación */}
        <section className="relative overflow-hidden border-b border-line">
          <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:pb-24">
            <div className="flex flex-col gap-6">
              <span className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-surface/70 px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pos opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-pos" />
                </span>
                Actualizado el {longDate(priceDate)}
              </span>
              <h1 className="text-4xl font-extrabold leading-[1.04] tracking-tight text-fg sm:text-5xl lg:text-[3.6rem]">
                Entiende los números de las empresas <span className="text-accent">antes de invertir</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted">
                Análisis fundamental gratuito de acciones colombianas e internacionales, con los estados financieros
                oficiales de SIMEV: ingresos, utilidad, flujo de caja libre, múltiplos y dividendos.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/bvc"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-accent-ink shadow-[0_8px_30px_-10px_rgba(232,178,58,0.6)] transition hover:brightness-110"
                >
                  Comparar acciones de la BVC <ArrowIcon />
                </Link>
                <Link
                  href="#dashboards"
                  className="rounded-lg border border-line bg-surface px-5 py-3 font-semibold text-fg transition hover:border-accent"
                >
                  Ver dashboards
                </Link>
              </div>
              <dl className="mt-2 grid max-w-lg grid-cols-3 divide-x divide-line rounded-xl border border-line bg-surface/60">
                <div className="px-4 py-3">
                  <dt className="text-xs text-muted">Empresas BVC</dt>
                  <dd className="font-mono text-2xl font-semibold text-fg">{companies.length}</dd>
                </div>
                <div className="px-4 py-3">
                  <dt className="text-xs text-muted">Historia desde</dt>
                  <dd className="font-mono text-2xl font-semibold text-fg">2015</dd>
                </div>
                <div className="px-4 py-3">
                  <dt className="text-xs text-muted">Dashboards</dt>
                  <dd className="font-mono text-2xl font-semibold text-fg">{colombia.length + internacionales.length}</dd>
                </div>
              </dl>
            </div>

            {/* Panel con las más grandes de la BVC */}
            <div className="rounded-2xl border border-line bg-surface/90 p-1 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur">
              <div className="flex items-center justify-between px-4 pb-3 pt-4">
                <div>
                  <p className="font-display text-lg font-bold text-fg">Las más grandes de la BVC</p>
                  <p className="text-xs text-muted">Capitalización total: {cop(totalCap)}</p>
                </div>
                <span className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted">12 meses</span>
              </div>
              <ul className="divide-y divide-line rounded-xl bg-bg/40">
                {top.map((q) => (
                  <li key={q.id}>
                    <Link href={`/bvc/${q.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition hover:bg-surface-2 sm:grid-cols-[1fr_96px_auto]">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-fg">{q.name}</p>
                        <p className="truncate font-mono text-xs text-muted">
                          {firstTicker(q.ticker)} · P/E {times(q.valuation.pe)} · Div. {pct(q.valuation.dividend_yield)}
                        </p>
                      </div>
                      <Sparkline values={q.trail} up={(q.change ?? 0) >= 0} className="hidden h-8 w-24 sm:block" />
                      <div className="text-right">
                        <p className="font-mono font-semibold text-fg">{price(q.valuation.close)}</p>
                        <Change value={q.change} className="text-xs" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/bvc" className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-accent hover:underline">
                Ver las {companies.length} empresas <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>

        {/* Cinta de precios */}
        <section aria-label="Precios de la BVC" className="overflow-hidden border-b border-line bg-surface/50 py-3">
          <div className="marquee flex w-max gap-8">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex shrink-0 gap-8" aria-hidden={copy === 1}>
                {tape.map((q) => (
                  <li key={q.id} className="flex items-center gap-2 whitespace-nowrap text-sm">
                    <span className="font-mono font-semibold text-fg">{firstTicker(q.ticker)}</span>
                    <span className="font-mono text-muted">{price(q.valuation.close)}</span>
                    <Change value={q.change} className="text-xs" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </section>

        <div className="mx-auto flex max-w-7xl flex-col gap-20 px-4 py-16 sm:px-6 sm:py-20">
          {/* Herramientas */}
          <section className="flex flex-col gap-8">
            <div className="flex max-w-2xl flex-col gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-accent">Qué encuentras</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">Todo lo que necesitas para analizar una acción</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {tools.map((t) => (
                <Link
                  key={t.title}
                  href={t.href}
                  className="group flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 transition hover:border-accent/70"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/30">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                      {t.icon}
                    </svg>
                  </span>
                  <h3 className="text-xl font-bold text-fg">{t.title}</h3>
                  <p className="flex-1 leading-relaxed text-muted">{t.text}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
                    {t.cta}
                    <span className="transition group-hover:translate-x-1 motion-reduce:transition-none">
                      <ArrowIcon />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Destacados */}
          {highlights.length > 0 && (
            <section className="flex flex-col gap-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex max-w-2xl flex-col gap-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-accent">Destacados de la BVC</span>
                  <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">Las cifras que más llaman la atención hoy</h2>
                </div>
                <Link href="/bvc" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
                  Comparar todas <ArrowIcon />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {highlights.map(({ label, note, q, show }) => (
                  <Link
                    key={label}
                    href={`/bvc/${q!.id}`}
                    className="group flex flex-col gap-1 rounded-2xl border border-line bg-surface p-5 transition hover:border-accent/70"
                  >
                    <span className="text-sm text-muted">{label}</span>
                    <span className="font-mono text-4xl font-semibold tracking-tight text-fg">{show(q!)}</span>
                    <span className="mt-3 font-semibold text-fg group-hover:text-accent">{q!.name}</span>
                    <span className="text-xs text-muted">
                      {sectorName(q!.sector)} · {note}
                    </span>
                  </Link>
                ))}
              </div>
              <p className="text-xs text-muted">Entre las acciones que más se negocian en la BVC, con los últimos estados financieros y el precio de cierre. No es una recomendación de inversión.</p>
            </section>
          )}

          {/* Dashboards */}
          <section id="dashboards" className="flex scroll-mt-24 flex-col gap-10">
            <div className="flex max-w-2xl flex-col gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-accent">Dashboards</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">Valoración empresa por empresa</h2>
              <p className="text-muted">Gráficas trimestrales, tabla de sensibilidad y precio justo de cada acción.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-xl font-bold text-fg">Colombia</h3>
                <Link href="/bvc" className="text-sm font-semibold text-accent hover:underline">
                  Todas las empresas de la BVC →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3 lg:grid-cols-7">
                {colombia.map((c) => (
                  <CompanyCard key={c.symbol} {...c} />
                ))}
              </div>
            </div>
            <div id="internacionales" className="flex scroll-mt-24 flex-col gap-4">
              <h3 className="text-xl font-bold text-fg">Internacionales</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
                {internacionales.map((c) => (
                  <CompanyCard key={c.symbol} {...c} />
                ))}
              </div>
            </div>
          </section>

          {/* Metodología */}
          <section className="grid gap-10 rounded-2xl border border-line bg-surface p-6 sm:p-10 lg:grid-cols-[1fr_2fr]">
            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-accent">De dónde salen los datos</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-fg">Fuentes oficiales, no estimaciones</h2>
              <p className="text-muted">
                Cada cifra de las empresas colombianas se puede rastrear hasta el informe que la empresa entregó a la
                Superintendencia Financiera.
              </p>
            </div>
            <ol className="grid gap-6 sm:grid-cols-3">
              {steps.map((s) => (
                <li key={s.n} className="flex flex-col gap-2 border-t border-line pt-4">
                  <span className="font-mono text-sm text-accent">{s.n}</span>
                  <span className="font-semibold text-fg">{s.title}</span>
                  <span className="text-sm leading-relaxed text-muted">{s.text}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* YouTube */}
          <section className="relative grid items-center gap-6 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface via-surface to-[#2a1416] md:grid-cols-2">
            <div className="relative z-10 flex flex-col gap-4 p-6 sm:p-10">
              <span className="font-mono text-xs uppercase tracking-widest text-[#ff6b5e]">YouTube</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">Análisis de acciones en video</h2>
              <p className="max-w-md leading-relaxed text-muted">
                En el canal explico paso a paso los resultados de cada empresa, cómo leer sus estados financieros y qué
                significan sus múltiplos.
              </p>
              <a
                href={YOUTUBE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 self-start rounded-lg bg-[#e62117] px-5 py-3 font-semibold text-white transition hover:brightness-110"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path fill="currentColor" d="M8 5.5v13l11-6.5z" />
                </svg>
                Ver el canal en YouTube
              </a>
            </div>
            <div className="relative aspect-[4/3] w-full self-end md:aspect-auto md:h-full md:min-h-[340px]">
              <Image
                src="/me.png"
                alt="Alejandro señalando el canal de YouTube"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain object-bottom"
              />
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-line bg-bg">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="flex max-w-md flex-col gap-2">
            <Link href="/" className="font-display text-lg font-extrabold tracking-tight text-fg">
              AHA<span className="text-accent">.</span>Investing
            </Link>
            <p className="text-xs leading-relaxed text-muted">
              Fuente: informes XBRL y PDF publicados por los emisores en SIMEV (Superintendencia Financiera de Colombia);
              precios de Yahoo Finance. Contenido educativo, no es una recomendación de inversión.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <Link href="/bvc" className="hover:text-fg">
              Acciones colombianas
            </Link>
            <Link href="#dashboards" className="hover:text-fg">
              Dashboards
            </Link>
            <Link href="/bvc#glosario" className="hover:text-fg">
              Glosario
            </Link>
            <a href={YOUTUBE} target="_blank" rel="noopener noreferrer" className="hover:text-fg">
              YouTube
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
}

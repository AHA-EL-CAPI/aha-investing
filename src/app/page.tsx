import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { loadIndex } from '@/lib/bvc';

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

function CompanyCard({ name, symbol, image, tone }: Company) {
  return (
    <Link
      href={`/dashboard/${symbol}`}
      className="group flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 transition hover:-translate-y-0.5 hover:border-accent motion-reduce:transition-none"
    >
      <div className={`relative aspect-video w-full overflow-hidden rounded-lg ${tone === 'light' ? 'bg-[#eef1f4]' : 'bg-surface-2'}`}>
        <Image
          src={image}
          alt={`Logo de ${name}`}
          fill
          sizes="(min-width: 1024px) 200px, 45vw"
          className={`object-contain p-3 ${tone === 'dark' ? 'brightness-0 invert' : ''}`}
        />
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 px-1">
        <span className="font-semibold text-fg group-hover:text-accent">{name}</span>
        <span className="font-mono text-xs text-muted">{symbol}</span>
      </div>
    </Link>
  );
}

export default function Home() {
  const { companies } = loadIndex();
  const total = colombia.length + internacionales.length;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-bg pb-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 sm:px-6">
          {/* Presentación */}
          <section className="flex flex-col gap-5 pt-12 sm:pt-16">
            <span className="font-mono text-xs uppercase tracking-widest text-accent">Gratis · datos oficiales de SIMEV</span>
            <h1 className="max-w-[20ch] text-4xl font-extrabold leading-[1.05] tracking-tight text-fg sm:text-5xl lg:text-6xl">
              Análisis fundamental de acciones colombianas e internacionales
            </h1>
            <p className="max-w-2xl text-lg text-muted">
              La fuente más accesible y gratuita para entender los números de una empresa: ingresos, utilidad neta, flujo
              de caja libre, múltiplos y más.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/bvc"
                className="rounded-lg bg-accent px-5 py-3 font-semibold text-accent-ink transition hover:brightness-110"
              >
                Abrir el comparador de la BVC →
              </Link>
              <Link
                href="#internacionales"
                className="rounded-lg border border-line bg-surface px-5 py-3 font-semibold text-fg hover:border-accent"
              >
                Ver dashboards
              </Link>
            </div>
            <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <dt className="text-sm text-muted">Empresas de la BVC</dt>
                <dd className="font-mono text-2xl font-semibold text-fg">{companies.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Historia desde</dt>
                <dd className="font-mono text-2xl font-semibold text-fg">2015</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Dashboards</dt>
                <dd className="font-mono text-2xl font-semibold text-fg">{total}</dd>
              </div>
            </dl>
          </section>

          {/* Dashboards */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl font-bold text-fg">Colombia</h2>
              <Link href="/bvc" className="text-sm font-semibold text-accent hover:underline">
                Todas las empresas de la BVC →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {colombia.map((c) => (
                <CompanyCard key={c.symbol} {...c} />
              ))}
            </div>
          </section>

          <section id="internacionales" className="flex scroll-mt-20 flex-col gap-4">
            <h2 className="text-2xl font-bold text-fg">Internacionales</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {internacionales.map((c) => (
                <CompanyCard key={c.symbol} {...c} />
              ))}
            </div>
          </section>

          {/* YouTube */}
          <section className="grid items-center gap-6 overflow-hidden rounded-2xl border border-line bg-surface md:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 sm:p-10">
              <span className="font-mono text-xs uppercase tracking-widest text-accent">YouTube</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-fg">Análisis de acciones en video</h2>
              <p className="text-muted">Suscríbete al canal de AHA Investing para ver el análisis de cada empresa.</p>
              <a
                href="https://www.youtube.com/@ahainvesting"
                target="_blank"
                rel="noopener noreferrer"
                className="self-start rounded-lg bg-[#e62117] px-5 py-3 font-semibold text-white transition hover:brightness-110"
              >
                Ver el canal en YouTube
              </a>
            </div>
            <div className="relative aspect-[4/3] w-full self-end md:aspect-auto md:h-full md:min-h-[320px]">
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
    </>
  );
}

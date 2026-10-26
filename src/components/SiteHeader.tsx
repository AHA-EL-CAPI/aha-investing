import Link from 'next/link';

// Encabezado común de todo el sitio: portada, dashboards y comparador BVC
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight text-fg">
          AHA<span className="text-accent">.</span>Investing
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
          <Link href="/bvc" className="hover:text-fg">
            <span className="sm:hidden">Colombia</span>
            <span className="hidden sm:inline">Acciones colombianas</span>
          </Link>
          <Link href="/#internacionales" className="hover:text-fg">
            Internacionales
          </Link>
          <Link href="/bvc#glosario" className="hidden hover:text-fg sm:inline">
            Glosario
          </Link>
          <a
            href="https://www.youtube.com/@ahainvesting"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-line px-3 py-1 font-medium text-fg hover:border-accent"
          >
            YouTube
          </a>
        </nav>
      </div>
    </header>
  );
}

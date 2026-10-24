import type { NewsItem } from '@/lib/bvc';

const fecha = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function InfoRelevante({ news, url, name }: { news: NewsItem[]; url: string | null; name: string }) {
  if (!news.length) return null;
  return (
    <section className="tw:bg-white tw:dark:bg-black tw:p-4 tw:rounded-2xl tw:shadow tw:w-full tw:mt-6">
      <h2 className="tw:text-xl tw:font-bold tw:text-black tw:dark:text-white">Información relevante</h2>
      <p className="tw:text-sm tw:text-gray-500 tw:mb-3">
        Lo que {name} ha publicado en SIMEV: dividendos, asambleas, calificaciones, cambios en la administración y otros
        hechos que pueden mover la acción.
      </p>
      <ul className="tw:divide-y tw:divide-gray-200 tw:dark:divide-neutral-800">
        {news.map((n, i) => (
          <li key={i} className="tw:py-2 tw:flex tw:flex-col tw:md:flex-row tw:gap-1 tw:md:gap-4">
            <span className="tw:text-xs tw:text-gray-500 tw:whitespace-nowrap tw:md:w-28 tw:shrink-0 tw:pt-0.5">{fecha(n.date)}</span>
            <span className="tw:text-sm tw:text-black tw:dark:text-white">
              {n.summary}
              {n.topic && <span className="tw:ml-2 tw:text-xs tw:text-gray-500">· {n.topic}</span>}
            </span>
          </li>
        ))}
      </ul>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="tw:inline-block tw:mt-3 tw:text-sm tw:text-blue-600 tw:hover:underline">
          Ver todo y descargar los documentos en SIMEV →
        </a>
      )}
    </section>
  );
}

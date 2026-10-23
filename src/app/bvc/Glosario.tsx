import { GLOSARIO } from './glosario';

export default function Glosario({ keys = Object.keys(GLOSARIO) }: { keys?: string[] }) {
  return (
    <section id="glosario" className="tw:mt-10 tw:bg-surface tw:border tw:border-line tw:rounded-xl tw:p-6">
      <h2 className="tw:text-xl tw:font-bold tw:mb-4 tw:text-fg">¿Qué significa cada métrica?</h2>
      <dl className="tw:grid tw:gap-x-8 tw:gap-y-5 tw:md:grid-cols-2">
        {keys.map((k) => (
          <div key={k}>
            <dt className="tw:font-semibold tw:text-fg">{GLOSARIO[k].name}</dt>
            <dd className="tw:text-sm tw:text-muted tw:mt-1">{GLOSARIO[k].short}</dd>
            <dd className="tw:text-sm tw:text-fg/80 tw:mt-1">{GLOSARIO[k].long}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

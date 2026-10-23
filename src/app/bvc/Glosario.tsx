import { GLOSARIO } from './glosario';

export default function Glosario({ keys = Object.keys(GLOSARIO) }: { keys?: string[] }) {
  return (
    <section id="glosario" className="tw:mt-10 tw:bg-white tw:dark:bg-black tw:rounded-2xl tw:shadow tw:p-6">
      <h2 className="tw:text-xl tw:font-bold tw:mb-4 tw:text-black tw:dark:text-white">¿Qué significa cada métrica?</h2>
      <dl className="tw:grid tw:gap-x-8 tw:gap-y-5 tw:md:grid-cols-2">
        {keys.map((k) => (
          <div key={k}>
            <dt className="tw:font-semibold tw:text-black tw:dark:text-white">{GLOSARIO[k].name}</dt>
            <dd className="tw:text-sm tw:text-gray-500 tw:mt-1">{GLOSARIO[k].short}</dd>
            <dd className="tw:text-sm tw:text-gray-700 tw:dark:text-gray-300 tw:mt-1">{GLOSARIO[k].long}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

'use client';

import { useMemo, useState } from 'react';
import type { CompanyView } from '@/lib/bvc';
import { quarterLabel } from '@/lib/bvcFormat';

type Vista = 'quarter' | 'ytd' | 'year';
type Num = number | null;

const VISTAS: [Vista, string][] = [
  ['quarter', 'Trimestre'],
  ['ytd', 'Acumulado del año'],
  ['year', 'Año completo'],
];
const COLS = 8;

const nf = (digits: number) =>
  new Intl.NumberFormat('es-CO', { minimumFractionDigits: digits, maximumFractionDigits: digits });

// como en los estados: millones de pesos y negativos entre parentesis
function cell(v: Num, perShare: boolean): string {
  if (v === null) return '';
  const s = perShare ? nf(2).format(Math.abs(v)) : nf(0).format(Math.abs(v) / 1e6);
  if (s === '0' || s === '0,00') return '-';
  return v < 0 ? `(${s})` : s;
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`tw:px-3 tw:py-1 tw:rounded-full tw:text-sm tw:border ${
        on
          ? 'tw:bg-black tw:text-white tw:border-black tw:dark:bg-white tw:dark:text-black tw:dark:border-white'
          : 'tw:border-gray-300 tw:text-gray-600 tw:dark:border-neutral-700 tw:dark:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

export default function EstadosPdf({ pdf, name }: { pdf: NonNullable<CompanyView['pdf']>; name: string }) {
  const [code, setCode] = useState(pdf.statements[0].code);
  const [vista, setVista] = useState<Vista>('quarter');
  const last = pdf.periods.length - 1;
  const [hasta, setHasta] = useState(last);
  const stmt = pdf.statements.find((s) => s.code === code) ?? pdf.statements[0];
  const isBs = stmt.code === 'BS';
  const v: Vista = isBs && vista === 'ytd' ? 'quarter' : vista;

  // columnas: los ultimos 8 trimestres (o cierres de diciembre) hasta el informe elegido
  const cols = useMemo(() => {
    const idx = pdf.periods.map((_, i) => i).filter((i) => i <= hasta);
    const pick = v === 'year' ? idx.filter((i) => pdf.periods[i].slice(5, 7) === '12' || i === hasta) : idx;
    return pick.slice(-COLS);
  }, [pdf.periods, hasta, v]);

  const rows = stmt.rows
    .map((r) => ({ ...r, cells: cols.map((i) => (v === 'quarter' ? r.quarter[i] : r.ytd[i]) ?? null) }))
    .filter((r) => r.cells.some((x) => x !== null));

  const head = (i: number) => {
    const p = pdf.periods[i];
    const mark = stmt.unverified.includes(p) ? ' *' : '';
    if (v !== 'year') return quarterLabel(p) + mark;
    return (p.slice(5, 7) === '12' ? p.slice(0, 4) : `${p.slice(0, 4)} (a ${quarterLabel(p)})`) + mark;
  };
  const marked = cols.some((i) => stmt.unverified.includes(pdf.periods[i]));
  const subtitle = isBs
    ? 'Saldo al cierre de cada trimestre'
    : v === 'quarter'
      ? 'Cada trimestre por separado (3 meses)'
      : v === 'ytd'
        ? 'Acumulado desde enero hasta el cierre de cada trimestre, como en el informe'
        : 'Enero a diciembre de cada año';

  return (
    <section className="tw:bg-white tw:dark:bg-black tw:p-4 tw:rounded-2xl tw:shadow tw:w-full">
      <h2 className="tw:text-xl tw:font-bold tw:text-black tw:dark:text-white">Estados financieros</h2>
      <p className="tw:text-sm tw:text-gray-500 tw:mb-3">
        Cuenta por cuenta, como aparecen en los informes en PDF que {name} publica en SIMEV. {subtitle}. Millones de pesos.
      </p>
      <div className="tw:flex tw:flex-wrap tw:gap-2 tw:mb-2">
        {pdf.statements.map((s) => (
          <Pill key={s.code} on={s.code === stmt.code} onClick={() => setCode(s.code)}>
            {s.title}
          </Pill>
        ))}
      </div>
      <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-2 tw:mb-3">
        {VISTAS.filter(([k]) => !(isBs && k === 'ytd')).map(([k, label]) => (
          <Pill key={k} on={v === k} onClick={() => setVista(k)}>
            {isBs && k === 'quarter' ? 'Trimestral' : isBs && k === 'year' ? 'Cierre de año' : label}
          </Pill>
        ))}
        <label className="tw:text-sm tw:text-gray-600 tw:dark:text-gray-300 tw:ml-auto">
          Hasta{' '}
          <select
            value={hasta}
            onChange={(e) => setHasta(Number(e.target.value))}
            className="tw:border tw:border-gray-300 tw:dark:border-neutral-700 tw:rounded tw:px-2 tw:py-1 tw:bg-transparent"
          >
            {pdf.periods
              .map((p, i) => [p, i] as const)
              .reverse()
              .map(([p, i]) => (
                <option key={p} value={i}>
                  {quarterLabel(p)}
                </option>
              ))}
          </select>
        </label>
      </div>
      <div className="tw:overflow-x-auto">
        <table className="tw:w-full tw:text-xs tw:md:text-sm tw:text-black tw:dark:text-white">
          <thead>
            <tr className="tw:bg-gray-200 tw:dark:bg-neutral-800">
              <th className="tw:px-3 tw:py-2 tw:text-left tw:sticky tw:left-0 tw:bg-gray-200 tw:dark:bg-neutral-800">Cuenta</th>
              {cols.map((i) => (
                <th key={i} className="tw:px-3 tw:py-2 tw:text-right tw:whitespace-nowrap">
                  {head(i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, n) => (
              <tr
                key={n}
                className={`tw:border-t tw:border-gray-200 tw:dark:border-neutral-800 ${r.total ? 'tw:font-semibold' : ''}`}
              >
                <td
                  className="tw:py-1.5 tw:pr-3 tw:min-w-44 tw:md:min-w-72 tw:sticky tw:left-0 tw:bg-white tw:dark:bg-black"
                  style={{ paddingLeft: `${0.75 + r.level}rem` }}
                >
                  {r.label}
                  {r.perShare ? ' (pesos)' : ''}
                </td>
                {r.cells.map((x, i) => (
                  <td key={i} className="tw:px-3 tw:py-1.5 tw:text-right tw:whitespace-nowrap tw:tabular-nums">
                    {cell(x, r.perShare)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {marked && (
        <p className="tw:text-xs tw:text-gray-500 tw:mt-2">
          * Ninguna cifra clave de esta columna coincide con el reporte XBRL de SIMEV (a veces por diferencias de
          presentación). Antes de usarla, compárala con el PDF.
        </p>
      )}
      {v !== 'ytd' && !isBs && (
        <p className="tw:text-xs tw:text-gray-500 tw:mt-2">
          {v === 'quarter'
            ? 'Cuando el informe no trae los 3 meses por separado, el trimestre es el acumulado menos el del trimestre anterior.'
            : 'El año en curso aparece con el acumulado hasta el último informe.'}
        </p>
      )}
    </section>
  );
}

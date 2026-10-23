'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { CompanySummary } from '@/lib/bvc';
import { cop, pct, price, quarterLabel, sectorName, times } from '@/lib/bvcFormat';
import { GLOSARIO } from './glosario';

type Col = {
  key: string;
  label: string;
  get: (c: CompanySummary) => number | null | undefined;
  show: (v: number | null | undefined) => string;
};

const COLS: Col[] = [
  { key: 'close', label: 'Precio', get: (c) => c.valuation.close, show: price },
  { key: 'market_cap', label: 'Cap. bursátil', get: (c) => c.valuation.market_cap, show: cop },
  { key: 'pe', label: 'P/E', get: (c) => c.valuation.pe, show: (v) => times(v) },
  { key: 'pb', label: 'P/B', get: (c) => c.valuation.pb, show: (v) => times(v, 2) },
  { key: 'dy', label: 'Dividendo', get: (c) => c.valuation.dividend_yield, show: (v) => pct(v) },
  { key: 'roe', label: 'ROE', get: (c) => c.metrics.roe, show: (v) => pct(v) },
  { key: 'net_margin', label: 'Margen neto', get: (c) => c.metrics.net_margin, show: (v) => pct(v) },
  { key: 'growth', label: 'Crec. ingresos', get: (c) => c.metrics.revenue_growth_yoy, show: (v) => pct(v) },
  { key: 'nd_ebitda', label: 'Deuda neta / EBITDA', get: (c) => c.metrics.net_debt_to_ebitda, show: (v) => (v != null && Math.abs(v) > 100 ? 'n.s.' : times(v)) },
];

export default function Comparador({ companies }: { companies: CompanySummary[] }) {
  const [sector, setSector] = useState('todos');
  const [sort, setSort] = useState<{ key: string; desc: boolean }>({ key: 'market_cap', desc: true });

  const sectors = useMemo(() => [...new Set(companies.map((c) => c.sector))].sort(), [companies]);

  const rows = useMemo(() => {
    const col = COLS.find((c) => c.key === sort.key);
    const list = companies.filter((c) => sector === 'todos' || c.sector === sector);
    if (!col) return [...list].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return [...list].sort((a, b) => {
      const va = col.get(a);
      const vb = col.get(b);
      if (va == null) return 1;
      if (vb == null) return -1;
      return sort.desc ? vb - va : va - vb;
    });
  }, [companies, sector, sort]);

  const toggle = (key: string) =>
    setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== 'name' }));

  return (
    <div>
      <div className="tw:flex tw:flex-wrap tw:gap-2 tw:mb-4">
        {['todos', ...sectors].map((s) => (
          <button
            key={s}
            onClick={() => setSector(s)}
            className={`tw:px-3 tw:py-1 tw:rounded-full tw:text-sm tw:border tw:transition-colors ${
              sector === s
                ? 'tw:bg-black tw:text-white tw:border-black tw:dark:bg-white tw:dark:text-black tw:dark:border-white'
                : 'tw:border-gray-300 tw:text-gray-700 tw:hover:border-gray-500 tw:dark:border-neutral-700 tw:dark:text-gray-300'
            }`}
          >
            {s === 'todos' ? 'Todos' : sectorName(s)}
          </button>
        ))}
      </div>

      <div className="tw:overflow-x-auto tw:rounded-2xl tw:shadow tw:bg-white tw:dark:bg-black">
        <table className="tw:w-full tw:text-sm tw:text-black tw:dark:text-white">
          <thead>
            <tr className="tw:bg-gray-200 tw:dark:bg-neutral-800">
              <th className="tw:px-3 tw:py-2 tw:text-left tw:cursor-pointer tw:whitespace-nowrap" onClick={() => toggle('name')}>
                Empresa {sort.key === 'name' ? (sort.desc ? '↓' : '↑') : ''}
              </th>
              <th className="tw:px-3 tw:py-2 tw:text-left tw:whitespace-nowrap">Último informe</th>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className="tw:px-3 tw:py-2 tw:text-right tw:cursor-pointer tw:whitespace-nowrap tw:select-none"
                  onClick={() => toggle(c.key)}
                  title={GLOSARIO[c.key] ? `${GLOSARIO[c.key].name}: ${GLOSARIO[c.key].short}` : undefined}
                >
                  {c.label}
                  {GLOSARIO[c.key] && <span className="tw:ml-1 tw:text-gray-400 tw:cursor-help">ⓘ</span>}{' '}
                  {sort.key === c.key ? (sort.desc ? '↓' : '↑') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="tw:border-t tw:border-gray-200 tw:dark:border-neutral-800 tw:hover:bg-gray-50 tw:dark:hover:bg-neutral-900">
                <td className="tw:px-3 tw:py-2 tw:whitespace-nowrap">
                  <Link href={`/bvc/${c.id}`} className="tw:font-semibold tw:hover:underline">
                    {c.name}
                  </Link>
                  <div className="tw:text-xs tw:text-gray-500">
                    {sectorName(c.sector)}
                    {c.ticker ? ` · ${c.ticker.split(';').join(', ')}` : ''}
                  </div>
                </td>
                <td className="tw:px-3 tw:py-2 tw:whitespace-nowrap">{quarterLabel(c.last_period)}</td>
                {COLS.map((col) => (
                  <td key={col.key} className="tw:px-3 tw:py-2 tw:text-right tw:whitespace-nowrap tw:tabular-nums">
                    {col.show(col.get(c))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

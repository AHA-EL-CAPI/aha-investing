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

// Encabezado fijo al bajar por la tabla
const TH = 'tw:sticky tw:top-0 tw:z-10 tw:bg-surface tw:border-b tw:border-line tw:px-3 tw:py-2.5 tw:whitespace-nowrap tw:font-mono tw:text-xs tw:font-medium tw:uppercase tw:tracking-wider tw:text-muted';

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
                ? 'tw:bg-accent tw:text-accent-ink tw:border-accent tw:font-semibold'
                : 'tw:border-line tw:text-muted tw:hover:border-accent tw:hover:text-fg'
            }`}
          >
            {s === 'todos' ? 'Todos' : sectorName(s)}
          </button>
        ))}
      </div>

      <div className="tw:overflow-auto tw:max-h-[75vh] tw:rounded-xl tw:border tw:border-line tw:bg-surface">
        <table className="tw:w-full tw:text-sm tw:text-fg">
          <thead>
            <tr>
              <th className={`${TH} tw:text-left tw:cursor-pointer ${sort.key === 'name' ? 'tw:text-accent' : ''}`} onClick={() => toggle('name')}>
                Empresa {sort.key === 'name' ? (sort.desc ? '↓' : '↑') : ''}
              </th>
              <th className={`${TH} tw:text-left`}>Último informe</th>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className={`${TH} tw:text-right tw:cursor-pointer tw:select-none ${sort.key === c.key ? 'tw:text-accent' : ''}`}
                  onClick={() => toggle(c.key)}
                  title={GLOSARIO[c.key] ? `${GLOSARIO[c.key].name}: ${GLOSARIO[c.key].short}` : undefined}
                >
                  {c.label}
                  {GLOSARIO[c.key] && <span className="tw:ml-1 tw:text-muted tw:cursor-help">ⓘ</span>}{' '}
                  {sort.key === c.key ? (sort.desc ? '↓' : '↑') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="tw:border-t tw:border-grid tw:hover:bg-surface-2">
                <td className="tw:px-3 tw:py-2.5 tw:whitespace-nowrap">
                  <Link href={`/bvc/${c.id}`} className="tw:font-semibold tw:text-fg tw:hover:text-accent">
                    {c.name}
                  </Link>
                  <div className="tw:text-xs tw:text-muted">
                    {sectorName(c.sector)}
                    {c.ticker ? ` · ${c.ticker.split(';').join(', ')}` : ''}
                  </div>
                </td>
                <td className="tw:px-3 tw:py-2.5 tw:whitespace-nowrap tw:font-mono tw:text-muted">{quarterLabel(c.last_period)}</td>
                {COLS.map((col) => (
                  <td key={col.key} className="tw:px-3 tw:py-2.5 tw:text-right tw:whitespace-nowrap tw:tabular-nums tw:font-mono">
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

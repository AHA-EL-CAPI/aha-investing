'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { SecSummary } from '@/lib/sec';
import { fiscalLabel, pct, times, usd, usdPrice } from '@/lib/secFormat';
import { GLOSARIO } from './terminos';

type Col = {
  key: string;
  label: string;
  get: (c: SecSummary) => number | null | undefined;
  show: (v: number | null | undefined) => string;
};

const TH = 'tw:sticky tw:top-0 tw:z-10 tw:bg-surface tw:border-b tw:border-line tw:px-3 tw:py-2.5 tw:whitespace-nowrap tw:font-mono tw:text-xs tw:font-medium tw:uppercase tw:tracking-wider tw:text-muted';

const ns = (v: number | null | undefined, f: (x: number) => string, max = 1000) =>
  v == null ? '—' : v <= 0 || v > max ? 'n.s.' : f(v);

const COLS: Col[] = [
  { key: 'close', label: 'Precio', get: (c) => c.valuation.close, show: (v) => usdPrice(v) },
  { key: 'market_cap', label: 'Cap. bursátil', get: (c) => c.valuation.market_cap, show: usd },
  { key: 'pe', label: 'P/E', get: (c) => c.valuation.pe, show: (v) => ns(v, (x) => times(x)) },
  { key: 'p_fcf', label: 'P/FCF', get: (c) => c.valuation.p_fcf, show: (v) => ns(v, (x) => times(x)) },
  { key: 'fcf_yield', label: 'FCF yield', get: (c) => c.valuation.fcf_yield, show: (v) => pct(v) },
  { key: 'ev_ebit', label: 'EV/EBIT', get: (c) => c.valuation.ev_ebit, show: (v) => ns(v, (x) => times(x)) },
  { key: 'growth', label: 'Crec. ingresos', get: (c) => c.metrics.revenue_ttm_yoy, show: (v) => pct(v) },
  { key: 'operating_margin', label: 'Margen operac.', get: (c) => c.metrics.operating_margin, show: (v) => pct(v) },
  { key: 'fcf_margin', label: 'Margen FCF', get: (c) => c.metrics.fcf_margin, show: (v) => pct(v) },
  { key: 'roe', label: 'ROE', get: (c) => c.metrics.roe, show: (v) => (v != null && Math.abs(v) > 5 ? 'n.s.' : pct(v)) },
  { key: 'roic', label: 'ROIC', get: (c) => c.metrics.roic, show: (v) => (v != null && Math.abs(v) > 5 ? 'n.s.' : pct(v)) },
  {
    key: 'nd_ebitda',
    label: 'Deuda neta / EBITDA',
    get: (c) => (c.tipo === 'banco' ? null : c.metrics.net_debt_to_ebitda),
    show: (v) => (v != null && Math.abs(v) > 100 ? 'n.s.' : times(v)),
  },
];

const GROUPS = [
  ['todas', 'Todas'],
  ['general', 'Empresas'],
  ['banco', 'Bancos'],
] as const;

export default function Comparador({ companies }: { companies: SecSummary[] }) {
  const [group, setGroup] = useState<string>('todas');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: string; desc: boolean }>({ key: 'market_cap', desc: true });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = companies.filter(
      (c) =>
        (group === 'todas' || c.tipo === group) &&
        (!q || c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)),
    );
    const col = COLS.find((c) => c.key === sort.key);
    if (!col) return [...list].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return [...list].sort((a, b) => {
      const va = col.get(a);
      const vb = col.get(b);
      if (va == null) return 1;
      if (vb == null) return -1;
      return sort.desc ? vb - va : va - vb;
    });
  }, [companies, group, query, sort]);

  const toggle = (key: string) =>
    setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== 'name' }));

  return (
    <div>
      <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-2 tw:mb-4">
        {GROUPS.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setGroup(k)}
            className={`tw:px-3 tw:py-1 tw:rounded-full tw:text-sm tw:border tw:transition-colors ${
              group === k
                ? 'tw:bg-accent tw:text-accent-ink tw:border-accent tw:font-semibold'
                : 'tw:border-line tw:text-muted tw:hover:border-accent tw:hover:text-fg'
            }`}
          >
            {label}
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar empresa o ticker"
          className="tw:ml-auto tw:min-w-0 tw:w-56 tw:px-3 tw:py-1.5 tw:rounded-lg tw:border tw:border-line tw:bg-surface tw:text-sm tw:text-fg"
        />
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
              <tr key={c.ticker} className="tw:border-t tw:border-grid tw:hover:bg-surface-2">
                <td className="tw:px-3 tw:py-2.5 tw:whitespace-nowrap">
                  <Link href={`/eeuu/${c.ticker}`} className="tw:font-semibold tw:text-fg tw:hover:text-accent">
                    {c.name}
                  </Link>
                  <div className="tw:text-xs tw:text-muted">
                    {c.ticker}
                    {c.tipo === 'banco' ? ' · Banco' : ''}
                  </div>
                </td>
                <td className="tw:px-3 tw:py-2.5 tw:whitespace-nowrap tw:font-mono tw:text-muted">
                  {fiscalLabel(c.fiscal_year, c.fiscal_quarter)}
                </td>
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

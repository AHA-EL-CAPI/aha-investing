'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SecValuation } from '@/lib/sec';
import { pct, quarterLabel, times, usd, usdPrice, usdShort } from '@/lib/secFormat';
import { GLOSARIO } from '../terminos';

type Num = number | null;

export type FichaData = {
  ticker: string;
  isBank: boolean;
  currency: string;
  periods: string[];
  fiscal: string[];
  quarter: Record<string, Num[]>;
  ttm: Record<string, Num[]>;
  fy: Record<string, Num[]>;
  ratios: Record<string, Num[]>;
  isFy: boolean[];
  prices: { date: string; close: Num }[];
  multiples: { date: string; pe: Num; pfcf: Num }[];
  valuation: SecValuation;
  metrics: Record<string, Num>;
  lastPeriod: string;
};

const AXIS = { fontSize: 11 };
const GRID = 'var(--grid)';
const TOOLTIP = { itemStyle: { color: 'var(--fg)' }, cursor: { fill: 'var(--surface-2)' } };
const BLUE = 'var(--series-1)';
const AMBER = 'var(--series-2)';
const GREEN = 'var(--series-3)';
const PURPLE = 'var(--series-4)';

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="tw:bg-surface tw:border tw:border-line tw:p-4 tw:sm:p-5 tw:rounded-xl tw:w-full tw:min-w-0">
      <h2 className="tw:text-lg tw:font-semibold tw:text-fg">{title}</h2>
      {subtitle && <p className="tw:text-sm tw:text-muted tw:mb-2">{subtitle}</p>}
      {children}
    </section>
  );
}

function Tile({ label, value, note, term }: { label: string; value: string; note?: string; term?: string }) {
  const help = term ? GLOSARIO[term] : undefined;
  return (
    <div className="tw:bg-surface tw:border tw:border-line tw:rounded-xl tw:p-4" title={help ? `${help.name}: ${help.short}` : undefined}>
      <div className="tw:text-xs tw:uppercase tw:tracking-wider tw:text-muted">
        {label}
        {help && (
          <a href="#glosario" className="tw:ml-1 tw:text-muted tw:no-underline" aria-label={`Qué es ${help.name}`}>
            ⓘ
          </a>
        )}
      </div>
      <div className="tw:text-2xl tw:font-semibold tw:font-mono tw:text-fg tw:tabular-nums">{value}</div>
      {note && <div className="tw:text-xs tw:text-muted tw:mt-1">{note}</div>}
    </div>
  );
}

function Toggle<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="tw:flex tw:flex-wrap tw:gap-2 tw:mb-2">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`tw:px-3 tw:py-1 tw:rounded-full tw:text-sm tw:border ${
            value === v
              ? 'tw:bg-accent tw:text-accent-ink tw:border-accent tw:font-semibold'
              : 'tw:border-line tw:text-muted tw:hover:border-accent tw:hover:text-fg'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

type View = 'quarter' | 'ttm' | 'fy';

export default function Ficha({ d }: { d: FichaData }) {
  const [view, setView] = useState<View>('quarter');
  const [tableView, setTableView] = useState<View>('quarter');
  const v = d.valuation;
  const m = d.metrics;
  const cur = d.currency === 'USD' ? 'US$' : `${d.currency} `;
  const money = (x: Num | undefined) => usd(x).replace('US$', cur);
  const hasPrice = d.currency === 'USD' && v.close != null;

  // serie segun la vista: trimestre, 12 meses o ano fiscal (solo en los trimestres que cierran el ano)
  const pick = (key: string, which: View): Num[] => {
    if (which === 'fy') return (d.fy[key] ?? []).map((x, i) => (d.isFy[i] ? x : null));
    return (which === 'ttm' ? d.ttm[key] : d.quarter[key]) ?? d.periods.map(() => null);
  };
  const idx = d.periods.map((_, i) => i).filter((i) => view !== 'fy' || d.isFy[i]);
  const revKey = 'revenue';
  const bars = idx.map((i) => ({
    label: view === 'fy' ? d.fiscal[i].split(' ')[1] : quarterLabel(d.periods[i]),
    Ingresos: pick(revKey, view)[i],
    Utilidad: pick('net_income', view)[i],
    FCF: d.isBank ? null : pick('fcf', view)[i],
  }));

  const margins = d.periods.map((p, i) => ({
    label: quarterLabel(p),
    'Margen bruto': d.isBank ? null : d.ratios.gross_margin?.[i] ?? null,
    'Margen operacional': d.isBank ? null : d.ratios.operating_margin?.[i] ?? null,
    'Margen neto': d.ratios.net_margin?.[i] ?? null,
    'Margen FCF': d.isBank ? null : d.ratios.fcf_margin?.[i] ?? null,
  }));
  const returns = d.periods.map((p, i) => {
    const roe = d.ratios.roe?.[i] ?? null;
    const roic = d.ratios.roic?.[i] ?? null;
    return {
      label: quarterLabel(p),
      ROE: roe != null && Math.abs(roe) < 3 ? roe : null,
      ROIC: d.isBank || roic == null || Math.abs(roic) > 3 ? null : roic,
    };
  });
  const perShare = d.periods.map((p, i) => ({
    label: quarterLabel(p),
    'EPS (12 meses)': d.ttm.eps?.[i] ?? null,
    'FCF por acción (12 meses)': d.isBank ? null : d.ttm.fcf_ps?.[i] ?? null,
  }));

  // multiplos frente a su historia (5 anos)
  const hist = useMemo(() => {
    const last = d.multiples.at(-1)?.date ?? '';
    const from = `${Number(last.slice(0, 4)) - 5}${last.slice(4)}`;
    const recent = d.multiples.filter((p) => p.date >= from);
    const ok = (x: Num, max: number): x is number => x !== null && x > 0 && x < max;
    return {
      pe: median(recent.map((p) => p.pe).filter((x): x is number => ok(x, 150))),
      pfcf: median(recent.map((p) => p.pfcf).filter((x): x is number => ok(x, 200))),
      series: recent.map((p) => ({ date: p.date, 'P/E': ok(p.pe, 150) ? p.pe : null, 'P/FCF': ok(p.pfcf, 200) ? p.pfcf : null })),
    };
  }, [d.multiples]);
  const vsHist = (now: Num | undefined, med: number | null) =>
    now && med && now > 0 ? `${now > med ? '+' : ''}${pct(now / med - 1, 0)} vs. su mediana de 5 años (${times(med)})` : undefined;
  const posTimes = (x: Num | undefined) => (x == null ? '—' : x <= 0 ? 'n.s.' : times(x));

  // tabla estilo notebook
  const rows: { label: string; key: string; kind: 'money' | 'ps' | 'shares' }[] = d.isBank
    ? [
        { label: 'Ingresos netos', key: 'revenue', kind: 'money' },
        { label: 'Margen neto de intereses', key: 'nii', kind: 'money' },
        { label: 'Utilidad neta', key: 'net_income', kind: 'money' },
        { label: 'EPS diluido', key: 'eps', kind: 'ps' },
        { label: 'Patrimonio', key: 'equity', kind: 'money' },
        { label: 'Acciones diluidas', key: 'shares', kind: 'shares' },
      ]
    : [
        { label: 'Ingresos', key: 'revenue', kind: 'money' },
        { label: 'Flujo de caja operativo', key: 'cfo', kind: 'money' },
        { label: 'CAPEX', key: 'capex', kind: 'money' },
        { label: 'Flujo de caja libre (FCF)', key: 'fcf', kind: 'money' },
        { label: 'FCF por acción', key: 'fcf_ps', kind: 'ps' },
        { label: 'Utilidad neta', key: 'net_income', kind: 'money' },
        { label: 'EPS diluido', key: 'eps', kind: 'ps' },
        { label: 'Acciones diluidas', key: 'shares', kind: 'shares' },
      ];
  const tIdx = d.periods.map((_, i) => i).filter((i) => tableView !== 'fy' || d.isFy[i]);
  const cell = (key: string, i: number): Num => {
    if (key === 'shares' || key === 'equity') return d.quarter[key]?.[i] ?? null;
    if (key === 'capex' && tableView === 'ttm') return null;
    if (tableView === 'ttm') return d.ttm[key]?.[i] ?? null;
    if (tableView === 'fy') return d.fy[key]?.[i] ?? null;
    return d.quarter[key]?.[i] ?? null;
  };
  const growthRow = (key: string, i: number, pos: number): Num => {
    const lag = tableView === 'quarter' ? 4 : tableView === 'ttm' ? 4 : 1;
    const j = pos - lag;
    if (j < 0) return null;
    const now = cell(key, i);
    const before = cell(key, tIdx[j]);
    return now == null || before == null || before === 0 ? null : (now - before) / Math.abs(before);
  };
  const tableRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (tableRef.current) tableRef.current.scrollLeft = tableRef.current.scrollWidth;
  }, [tableView]);
  const fmtCell = (x: Num, kind: string) =>
    x === null ? '—' : kind === 'ps' ? usdPrice(x).replace('US$', '') : kind === 'shares' ? `${(x / 1e9).toLocaleString('es-CO', { maximumFractionDigits: 3 })}` : usdShort(x);

  return (
    <div className="tw:space-y-6">
      <div className="tw:grid tw:grid-cols-2 tw:md:grid-cols-3 tw:lg:grid-cols-6 tw:gap-4">
        <Tile label="Precio" value={hasPrice ? usdPrice(v.close) : '—'} note={v.date ? `Cierre ${v.date}` : undefined} />
        <Tile label="Cap. bursátil" value={hasPrice ? usd(v.market_cap) : '—'} term="market_cap" />
        <Tile label="P/E" value={posTimes(v.pe)} note={vsHist(v.pe, hist.pe)} term="pe" />
        {d.isBank ? (
          <Tile label="P/B" value={posTimes(v.pb)} note="Capitalización ÷ patrimonio" />
        ) : (
          <Tile label="P/FCF" value={posTimes(v.p_fcf)} note={vsHist(v.p_fcf, hist.pfcf)} term="p_fcf" />
        )}
        <Tile
          label={d.isBank ? 'Dividendo' : 'FCF yield'}
          value={pct(d.isBank ? v.dividend_yield : v.fcf_yield)}
          note={d.isBank ? 'Dividendos de 12 meses ÷ capitalización' : undefined}
          term={d.isBank ? undefined : 'fcf_yield'}
        />
        <Tile
          label={d.isBank ? 'ROE' : 'ROIC'}
          value={pct(d.isBank ? m.roe : m.roic != null && Math.abs(m.roic) < 5 ? m.roic : null)}
          note={`ROE ${m.roe != null && Math.abs(m.roe) < 5 ? pct(m.roe) : 'n.s.'}`}
          term={d.isBank ? 'roe' : 'roic'}
        />
      </div>

      <Card
        title={d.isBank ? 'Ingresos y utilidad' : 'Ingresos, utilidad y flujo de caja libre'}
        subtitle={
          view === 'quarter' ? 'Cada trimestre por separado' : view === 'ttm' ? 'Últimos 12 meses a cada trimestre' : 'Año fiscal'
        }
      >
        <Toggle<View>
          value={view}
          onChange={setView}
          options={[
            ['quarter', 'Trimestre'],
            ['ttm', '12 meses'],
            ['fy', 'Año fiscal'],
          ]}
        />
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={bars} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" tick={AXIS} minTickGap={20} />
            <YAxis tick={AXIS} tickFormatter={usdShort} width={60} />
            <Tooltip formatter={(val: number) => money(val)} {...TOOLTIP} />
            <Legend />
            <Bar dataKey="Ingresos" fill={BLUE} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Utilidad" fill={GREEN} radius={[3, 3, 0, 0]} />
            {!d.isBank && <Bar dataKey="FCF" fill={AMBER} radius={[3, 3, 0, 0]} />}
          </BarChart>
        </ResponsiveContainer>
        <p className="tw:text-xs tw:text-muted">Miles de millones de {d.currency === 'USD' ? 'dólares' : d.currency}.</p>
      </Card>

      <div className="tw:grid tw:grid-cols-1 tw:lg:grid-cols-2 tw:gap-6">
        <Card title="Por acción" subtitle="Últimos 12 meses, ajustado por splits">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={perShare} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={AXIS} minTickGap={20} />
              <YAxis tick={AXIS} />
              <Tooltip formatter={(val: number) => usdPrice(val).replace('US$', cur)} {...TOOLTIP} />
              <Legend />
              <Line dataKey="EPS (12 meses)" stroke={BLUE} dot={false} connectNulls />
              {!d.isBank && <Line dataKey="FCF por acción (12 meses)" stroke={GREEN} dot={false} connectNulls />}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title={d.isBank ? 'Margen neto' : 'Márgenes'} subtitle="Últimos 12 meses">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={margins} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={AXIS} minTickGap={20} />
              <YAxis tick={AXIS} tickFormatter={(x: number) => pct(x, 0)} />
              <Tooltip formatter={(val: number) => pct(val)} {...TOOLTIP} />
              <Legend />
              {!d.isBank && <Line dataKey="Margen bruto" stroke={BLUE} dot={false} connectNulls />}
              {!d.isBank && <Line dataKey="Margen operacional" stroke={AMBER} dot={false} connectNulls />}
              <Line dataKey="Margen neto" stroke={GREEN} dot={false} connectNulls />
              {!d.isBank && <Line dataKey="Margen FCF" stroke={PURPLE} dot={false} connectNulls />}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Rentabilidad" subtitle="Últimos 12 meses sobre capital promedio">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={returns} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={AXIS} minTickGap={20} />
              <YAxis tick={AXIS} tickFormatter={(x: number) => pct(x, 0)} />
              <Tooltip formatter={(val: number) => pct(val)} {...TOOLTIP} />
              <Legend />
              <Line dataKey="ROE" stroke={PURPLE} dot={false} connectNulls />
              {!d.isBank && <Line dataKey="ROIC" stroke={BLUE} dot={false} connectNulls />}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {hasPrice && (
          <Card title="¿Cara o barata frente a su historia?" subtitle="Múltiplos semanales de los últimos 5 años; la línea punteada es la mediana">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hist.series} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="date" tick={AXIS} minTickGap={60} tickFormatter={(x: string) => x.slice(0, 7)} />
                <YAxis tick={AXIS} tickFormatter={(x: number) => times(x, 0)} />
                <Tooltip formatter={(val: number) => times(val)} {...TOOLTIP} />
                <Legend />
                <Line dataKey="P/E" stroke={BLUE} dot={false} connectNulls />
                {!d.isBank && <Line dataKey="P/FCF" stroke={GREEN} dot={false} connectNulls />}
                {hist.pe && <ReferenceLine y={hist.pe} stroke={BLUE} strokeDasharray="4 4" />}
                {!d.isBank && hist.pfcf && <ReferenceLine y={hist.pfcf} stroke={GREEN} strokeDasharray="4 4" />}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {d.prices.length > 0 && (
          <Card title="Precio de la acción" subtitle="Cierre en dólares (semanal hasta hace año y medio, luego diario)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={d.prices} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="date" tick={AXIS} minTickGap={60} tickFormatter={(x: string) => x.slice(0, 4)} />
                <YAxis tick={AXIS} domain={['auto', 'auto']} tickFormatter={(x: number) => usdPrice(x, 0)} width={80} />
                <Tooltip formatter={(val: number) => usdPrice(val)} {...TOOLTIP} />
                <Line dataKey="close" name="Precio" stroke="var(--accent)" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      <Card
        title="Cifras clave"
        subtitle={`Miles de millones de ${d.currency === 'USD' ? 'dólares' : d.currency}; por acción en ${d.currency === 'USD' ? 'dólares' : d.currency}; acciones en miles de millones. Debajo de cada cifra, el crecimiento ${tableView === 'fy' ? 'frente al año anterior' : 'frente al mismo periodo del año anterior'}. Desliza a la izquierda para ver la historia.`}
      >
        <Toggle<View>
          value={tableView}
          onChange={setTableView}
          options={[
            ['quarter', 'Trimestre'],
            ['ttm', '12 meses'],
            ['fy', 'Año fiscal'],
          ]}
        />
        <div ref={tableRef} className="tw:overflow-x-auto">
          <table className="tw:w-full tw:text-sm tw:text-fg">
            <thead>
              <tr className="tw:bg-surface tw:border-b tw:border-line">
                <th className="tw:sticky tw:left-0 tw:z-10 tw:bg-surface tw:px-3 tw:py-2 tw:text-left tw:text-xs tw:font-medium tw:uppercase tw:tracking-wider tw:text-muted">Cuenta</th>
                {tIdx.map((i) => (
                  <th key={i} className="tw:px-3 tw:py-2 tw:text-right tw:whitespace-nowrap tw:font-mono tw:text-xs tw:font-medium tw:text-muted">
                    {tableView === 'fy' ? d.fiscal[i].split(' ')[1] : d.fiscal[i]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="tw:border-t tw:border-grid">
                  <td className="tw:sticky tw:left-0 tw:z-10 tw:bg-surface tw:px-3 tw:py-1.5 tw:whitespace-nowrap">{r.label}</td>
                  {tIdx.map((i, pos) => {
                    const g = r.kind === 'shares' ? null : growthRow(r.key, i, pos);
                    return (
                      <td key={i} className="tw:px-3 tw:py-1.5 tw:text-right tw:whitespace-nowrap tw:tabular-nums tw:font-mono">
                        <div>{fmtCell(cell(r.key, i), r.kind)}</div>
                        {g !== null && (
                          <div className={`tw:text-xs ${g >= 0 ? 'tw:text-pos' : 'tw:text-neg'}`}>{pct(g, 0)}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

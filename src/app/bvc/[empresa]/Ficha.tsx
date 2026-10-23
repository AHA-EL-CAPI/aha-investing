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
import type { CompanyView } from '@/lib/bvc';
import { cop, copShort, pct, price, quarterLabel, times } from '@/lib/bvcFormat';
import { GLOSARIO } from '../glosario';

// Colores de la paleta del sitio (globals.css); los textos de ejes y tooltip se estilan allí
const AXIS = { fontSize: 11 };
const GRID = 'var(--grid)';
const TOOLTIP = {
  itemStyle: { color: 'var(--fg)' },
  cursor: { fill: 'var(--surface-2)' },
};
const GREEN = 'var(--series-3)';
const BLUE = 'var(--series-1)';
const AMBER = 'var(--series-2)';
const PURPLE = 'var(--series-4)';

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="tw:bg-surface tw:border tw:border-line tw:p-4 tw:sm:p-5 tw:rounded-xl tw:w-full">
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

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export default function Ficha({ c }: { c: CompanyView }) {
  const [ttm, setTtm] = useState(false);
  const [stmt, setStmt] = useState(c.statements[0]?.code ?? 'IS');
  const v = c.summary.valuation;
  const m = c.summary.metrics;
  const revLabel = c.isBank ? 'Margen neto de intereses' : 'Ingresos';

  const bars = c.quarters.map((q) => ({
    label: quarterLabel(q.period),
    [revLabel]: ttm ? q.revenueTtm : q.revenue,
    Utilidad: ttm ? q.netIncomeTtm : q.netIncome,
  }));
  const margins = c.quarters
    .filter((q) => q.roe !== null || q.netMargin !== null)
    .map((q) => ({
      label: quarterLabel(q.period),
      'Margen bruto': c.isBank ? null : q.grossMargin,
      'Margen operacional': c.isBank ? null : q.operatingMargin,
      'Margen neto': q.netMargin,
      ROE: q.roe,
    }));
  const fcf = c.quarters.filter((q) => q.fcfTtm !== null).map((q) => ({ label: quarterLabel(q.period), FCF: q.fcfTtm }));

  // Multiplos frente a su propia historia (ultimos 5 anos)
  const hist = useMemo(() => {
    const last = c.prices.at(-1)?.date ?? '';
    const from = `${Number(last.slice(0, 4)) - 5}${last.slice(4)}`;
    const recent = c.prices.filter((p) => p.date >= from);
    const ok = (x: number | null, max: number): x is number => x !== null && x > 0 && x < max;
    return {
      pe: median(recent.map((p) => p.pe).filter((x): x is number => ok(x, 100))),
      pb: median(recent.map((p) => p.pb).filter((x): x is number => ok(x, 20))),
      series: recent.map((p) => ({ date: p.date, 'P/E': ok(p.pe, 100) ? p.pe : null, 'P/B': ok(p.pb, 20) ? p.pb : null })),
    };
  }, [c.prices]);
  const vsHist = (now: number | null | undefined, med: number | null) =>
    now && med ? `${now > med ? '+' : ''}${pct(now / med - 1, 0)} vs. su mediana de 5 años (${times(med, med < 3 ? 2 : 1)})` : undefined;

  const current = c.statements.find((s) => s.code === stmt);

  // La tabla trae todo el historial; arranca mostrando los trimestres más recientes (a la derecha)
  const tableRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (tableRef.current) tableRef.current.scrollLeft = tableRef.current.scrollWidth;
  }, [stmt]);

  return (
    <div className="tw:space-y-6">
      <div className="tw:grid tw:grid-cols-2 tw:md:grid-cols-3 tw:lg:grid-cols-6 tw:gap-4">
        <Tile label="Precio" value={price(v.close)} note={c.summary.price_date ? `Cierre ${c.summary.price_date}` : undefined} />
        <Tile label="Cap. bursátil" value={cop(v.market_cap)} term="market_cap" />
        <Tile label="P/E" value={times(v.pe)} note={vsHist(v.pe, hist.pe)} term="pe" />
        <Tile label="P/B" value={times(v.pb, 2)} note={vsHist(v.pb, hist.pb)} term="pb" />
        <Tile label="Dividendo" value={pct(v.dividend_yield)} note="Últimos 12 meses / precio" term="dy" />
        <Tile label="ROE" value={pct(m.roe)} note={`A ${quarterLabel(c.lastPeriod)}`} term="roe" />
      </div>

      <Card
        title={`${revLabel} y utilidad`}
        subtitle={ttm ? 'Últimos 12 meses a cada trimestre' : 'Cada trimestre por separado'}
      >
        <div className="tw:flex tw:gap-2 tw:mb-2">
          {[
            [false, 'Trimestre'],
            [true, '12 meses'],
          ].map(([val, label]) => (
            <button
              key={String(label)}
              onClick={() => setTtm(val as boolean)}
              className={`tw:px-3 tw:py-1 tw:rounded-full tw:text-sm tw:border ${
                ttm === val
                  ? 'tw:bg-accent tw:text-accent-ink tw:border-accent tw:font-semibold'
                  : 'tw:border-line tw:text-muted tw:hover:border-accent tw:hover:text-fg'
              }`}
            >
              {label as string}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={bars} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" tick={AXIS} minTickGap={20} />
            <YAxis tick={AXIS} tickFormatter={copShort} width={70} />
            <Tooltip formatter={(val: number) => cop(val)} {...TOOLTIP} />
            <Legend />
            <Bar dataKey={revLabel} fill={BLUE} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Utilidad" fill={GREEN} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="tw:text-xs tw:text-muted">B = billones de pesos, MM = miles de millones.</p>
      </Card>

      <div className="tw:grid tw:grid-cols-1 tw:lg:grid-cols-2 tw:gap-6">
        <Card title={c.isBank ? 'Rentabilidad' : 'Márgenes y rentabilidad'} subtitle="Últimos 12 meses">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={margins} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={AXIS} minTickGap={20} />
              <YAxis tick={AXIS} tickFormatter={(x: number) => pct(x, 0)} />
              <Tooltip formatter={(val: number) => pct(val)} {...TOOLTIP} />
              <Legend />
              {!c.isBank && <Line dataKey="Margen bruto" stroke={BLUE} dot={false} connectNulls />}
              {!c.isBank && <Line dataKey="Margen operacional" stroke={AMBER} dot={false} connectNulls />}
              <Line dataKey="Margen neto" stroke={GREEN} dot={false} connectNulls />
              <Line dataKey="ROE" stroke={PURPLE} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="¿Cara o barata frente a su historia?" subtitle="Múltiplos diarios de los últimos 5 años; la línea punteada es la mediana">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hist.series} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="date" tick={AXIS} minTickGap={60} tickFormatter={(d: string) => d.slice(0, 7)} />
              <YAxis yAxisId="pe" tick={AXIS} tickFormatter={(x: number) => times(x, 0)} />
              <YAxis yAxisId="pb" orientation="right" tick={AXIS} tickFormatter={(x: number) => times(x, 1)} />
              <Tooltip formatter={(val: number) => times(val, 2)} {...TOOLTIP} />
              <Legend />
              <Line yAxisId="pe" dataKey="P/E" stroke={BLUE} dot={false} connectNulls />
              <Line yAxisId="pb" dataKey="P/B" stroke={AMBER} dot={false} connectNulls />
              {hist.pe && <ReferenceLine yAxisId="pe" y={hist.pe} stroke={BLUE} strokeDasharray="4 4" />}
              {hist.pb && <ReferenceLine yAxisId="pb" y={hist.pb} stroke={AMBER} strokeDasharray="4 4" />}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {!c.isBank && fcf.length > 0 && (
          <Card title="Flujo de caja libre" subtitle="Flujo de operación menos inversiones en activos, últimos 12 meses">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fcf} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="label" tick={AXIS} minTickGap={20} />
                <YAxis tick={AXIS} tickFormatter={copShort} width={70} />
                <Tooltip formatter={(val: number) => cop(val)} {...TOOLTIP} />
                <Bar dataKey="FCF" fill={GREEN} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        <Card title="Precio de la acción" subtitle="Cierre semanal en pesos">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={c.prices} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="date" tick={AXIS} minTickGap={60} tickFormatter={(d: string) => d.slice(0, 4)} />
              <YAxis tick={AXIS} domain={['auto', 'auto']} tickFormatter={(x: number) => price(x)} width={80} />
              <Tooltip formatter={(val: number) => price(val)} {...TOOLTIP} />
              <Line dataKey="close" name="Precio" stroke="var(--accent)" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {current && (
        <Card title="Estados financieros" subtitle={`Cifras de cada trimestre (el balance es el saldo al cierre). ${current.periods.length} trimestres desde ${quarterLabel(current.periods[0])}; desliza a la izquierda para ver los anteriores.`}>
          <div className="tw:flex tw:gap-2 tw:mb-3">
            {c.statements.map((s) => (
              <button
                key={s.code}
                onClick={() => setStmt(s.code)}
                className={`tw:px-3 tw:py-1 tw:rounded-full tw:text-sm tw:border ${
                  stmt === s.code
                    ? 'tw:bg-accent tw:text-accent-ink tw:border-accent tw:font-semibold'
                    : 'tw:border-line tw:text-muted tw:hover:border-accent tw:hover:text-fg'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
          <div ref={tableRef} className="tw:overflow-x-auto">
            <table className="tw:w-full tw:text-sm tw:text-fg">
              <thead>
                <tr className="tw:bg-surface tw:border-b tw:border-line">
                  <th className="tw:sticky tw:left-0 tw:z-10 tw:bg-surface tw:px-3 tw:py-2 tw:text-left tw:text-xs tw:font-medium tw:uppercase tw:tracking-wider tw:text-muted">Cuenta</th>
                  {current.periods.map((p) => (
                    <th key={p} className="tw:px-3 tw:py-2 tw:text-right tw:whitespace-nowrap tw:font-mono tw:text-xs tw:font-medium tw:text-muted">
                      {quarterLabel(p)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {current.rows.map((r) => (
                  <tr key={r.label} className="tw:border-t tw:border-grid">
                    <td className="tw:sticky tw:left-0 tw:z-10 tw:bg-surface tw:px-3 tw:py-1.5 tw:whitespace-nowrap">{r.label}</td>
                    {r.values.map((x, i) => (
                      <td key={i} className="tw:px-3 tw:py-1.5 tw:text-right tw:whitespace-nowrap tw:tabular-nums tw:font-mono">
                        {x === null ? '—' : r.label.startsWith('UPA') || r.label.startsWith('Acciones') ? price(x) : copShort(x)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

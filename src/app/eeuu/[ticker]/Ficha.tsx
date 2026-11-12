'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SecPreliminary, SecValuation, SegmentAxis } from '@/lib/sec';
import { pct, quarterLabel, times, usd, usdPrice, usdShort } from '@/lib/secFormat';
import { GLOSARIO } from '../terminos';
import { useSeriesToggle } from '@/components/useSeriesToggle';

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
  segments: SegmentAxis[];
  filingUrl: (string | null)[];
  filingForm: (string | null)[];
  preliminary: SecPreliminary[];
};

const SEG_COLORS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)', '#e879f9', '#22d3ee', '#f87171', '#a3e635'];

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
  const [segAxis, setSegAxis] = useState<string>(d.segments[0]?.axis ?? '');
  const [s1, s2, s3, s4, s5, s6] = [useSeriesToggle(), useSeriesToggle(), useSeriesToggle(), useSeriesToggle(), useSeriesToggle(), useSeriesToggle()];
  const [segView, setSegView] = useState<View>('ttm');
  const v = d.valuation;
  const m = d.metrics;
  const cur = d.currency === 'USD' ? 'US$' : `${d.currency} `;
  const money = (x: Num | undefined) => usd(x).replace('US$', cur);
  const hasPrice = d.currency === 'USD' && v.close != null;
  // trimestres con cifras del comunicado de resultados (8-K) que aun no estan en el 10-Q / 10-K: se marcan con *
  const pre = (i: number) => d.preliminary[i] ?? null;
  const isPre = (i: number) => pre(i) !== null && pre(i)!.form !== '6-K';
  const qLabel = (i: number) => `${quarterLabel(d.periods[i])}${isPre(i) ? '*' : ''}`;
  const lastPre = pre(d.periods.length - 1);
  const anyPre8 = d.periods.some((_, i) => isPre(i));

  // serie segun la vista: trimestre, 12 meses o ano fiscal (solo en los trimestres que cierran el ano)
  const pick = (key: string, which: View): Num[] => {
    if (which === 'fy') return (d.fy[key] ?? []).map((x, i) => (d.isFy[i] ? x : null));
    return (which === 'ttm' ? d.ttm[key] : d.quarter[key]) ?? d.periods.map(() => null);
  };
  const idx = d.periods.map((_, i) => i).filter((i) => view !== 'fy' || d.isFy[i]);
  const revKey = 'revenue';
  const bars = idx.map((i) => ({
    label: view === 'fy' ? `${d.fiscal[i].split(' ')[1]}${isPre(i) ? '*' : ''}` : qLabel(i),
    pre: isPre(i),
    Ingresos: pick(revKey, view)[i],
    Utilidad: pick('net_income', view)[i],
    FCF: d.isBank ? null : pick('fcf', view)[i],
  }));

  const margins = d.periods.map((p, i) => ({
    label: qLabel(i),
    'Margen bruto': d.isBank ? null : d.ratios.gross_margin?.[i] ?? null,
    'Margen operacional': d.isBank ? null : d.ratios.operating_margin?.[i] ?? null,
    'Margen neto': d.ratios.net_margin?.[i] ?? null,
    'Margen FCF': d.isBank ? null : d.ratios.fcf_margin?.[i] ?? null,
  }));
  const returns = d.periods.map((p, i) => {
    const roe = d.ratios.roe?.[i] ?? null;
    const roic = d.ratios.roic?.[i] ?? null;
    return {
      label: qLabel(i),
      ROE: roe != null && Math.abs(roe) < 3 ? roe : null,
      ROIC: d.isBank || roic == null || Math.abs(roic) > 3 ? null : roic,
    };
  });
  const perShare = d.periods.map((p, i) => ({
    label: qLabel(i),
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

  // ingresos por segmento: los 7 miembros mas grandes y "Otros"; los subtotales no se apilan
  const seg = d.segments.find((x) => x.axis === segAxis);
  const segData = useMemo(() => {
    if (!seg) return { rows: [] as Record<string, string | number | null>[], keys: [] as string[], lastIdx: -1 };
    // un miembro que cambio de nombre XBRL (p. ej. us-gaap: -> srt: en 2018) puede llegar dos veces con la misma
    // etiqueta: se une en una sola serie (gana la primera, la mas grande hoy); si no, Recharts las cruza por dataKey
    const byLabel = new Map<string, SegmentAxis['members'][number]>();
    for (const mm of seg.members.filter((x) => !x.subtotal)) {
      const k = mm.label.trim().toLowerCase();
      const prev = byLabel.get(k);
      if (!prev) {
        byLabel.set(k, mm);
        continue;
      }
      const join = (a: Num[], b: Num[]) => a.map((x, i) => (x ?? b[i] ?? null));
      byLabel.set(k, { ...prev, quarter: join(prev.quarter, mm.quarter), annual: join(prev.annual, mm.annual), ttm: join(prev.ttm, mm.ttm) });
    }
    const field = segView === 'quarter' ? 'quarter' : segView === 'ttm' ? 'ttm' : 'annual';
    // las 7 partes mas grandes del periodo mas reciente de esta vista (un desglose nuevo no queda en "Otros")
    const latest = (mm: SegmentAxis['members'][number]) => {
      const a = mm[field];
      for (let i = a.length - 1; i >= 0; i--) if (a[i] != null) return [i, Math.abs(a[i] as number)];
      return [-1, 0];
    };
    const parts = [...byLabel.values()].sort((a, b) => {
      const [ia, va] = latest(a);
      const [ib, vb] = latest(b);
      return ib - ia || vb - va;
    });
    const top = parts.slice(0, 7);
    const rest = parts.slice(7);
    const keys = [...top.map((mm) => mm.label), ...(rest.length ? ['Otros'] : [])];
    const rows: Record<string, string | number | null>[] = [];
    let lastIdx = -1;
    d.periods.forEach((p, i) => {
      if (segView === 'fy' && !d.isFy[i]) return;
      const vals = top.map((mm) => mm[field][i]);
      const other = rest.reduce<number | null>((acc, mm) => (mm[field][i] == null ? acc : (acc ?? 0) + (mm[field][i] as number)), null);
      if (vals.every((x) => x == null) && other == null) return;
      // periodos en que la empresa solo desglosó una parte (o el desglose no cuadra): no se dibujan para no
      // mostrar barras que no corresponden a los ingresos del periodo
      const tot = (segView === 'quarter' ? d.quarter : segView === 'ttm' ? d.ttm : d.fy).revenue?.[i];
      const sum = vals.reduce<number>((a, x) => a + (x ?? 0), 0) + (other ?? 0);
      if (tot && (sum < 0.5 * tot || sum > 1.5 * tot)) return;
      const row: Record<string, string | number | null> = { label: segView === 'fy' ? d.fiscal[i].split(' ')[1] : quarterLabel(p) };
      top.forEach((mm, k) => (row[mm.label] = vals[k]));
      if (rest.length) row.Otros = other;
      rows.push(row);
      lastIdx = i;
    });
    return { rows, keys, lastIdx };
  }, [seg, segView, d.periods, d.isFy, d.fiscal, d.quarter, d.ttm, d.fy]);
  const segCheck = seg && segData.lastIdx >= 0 ? { ok: seg.ok[segData.lastIdx], diff: seg.diff[segData.lastIdx] } : null;
  const segChecked = seg ? seg.ok.filter((x) => x !== null) : [];
  const segOkShare = segChecked.length ? segChecked.filter(Boolean).length / segChecked.length : null;

  return (
    <div className="tw:space-y-6">
      {lastPre && (
        <div className="tw:border tw:border-accent tw:bg-surface tw:rounded-xl tw:p-4 tw:text-sm tw:text-fg">
          <span className="tw:font-semibold tw:text-accent">
            {lastPre.form === '6-K' ? 'Cifras del informe de resultados (6-K)' : 'Resultados preliminares'}
          </span>{' '}
          {lastPre.form === '6-K' ? (
            <>
              del {d.fiscal.at(-1)}, radicado el {lastPre.filed}. Esta empresa es emisora extranjera: no radica 10-Q, así que
              sus trimestres salen del 6-K (sin auditar) y las cifras anuales se confirman con el 20-F.
            </>
          ) : (
            <>
              del {d.fiscal.at(-1)}, tomados del comunicado de resultados (8-K) del {lastPre.filed}. Se reemplazan solos por las
              cifras oficiales en cuanto la empresa radique el 10-Q / 10-K.
            </>
          )}{' '}
          {lastPre.url && (
            <a href={lastPre.url} target="_blank" rel="noopener noreferrer" className="tw:text-accent tw:hover:underline">
              Ver comunicado ↗
            </a>
          )}
        </div>
      )}
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
            <Legend {...s1.legend} />
            <Bar hide={s1.hidden('Ingresos')} dataKey="Ingresos" fill={BLUE} radius={[3, 3, 0, 0]}>
              {bars.map((b, k) => (
                <Cell key={k} fillOpacity={b.pre ? 0.45 : 1} stroke={b.pre ? BLUE : undefined} strokeDasharray="3 2" />
              ))}
            </Bar>
            <Bar hide={s1.hidden('Utilidad')} dataKey="Utilidad" fill={GREEN} radius={[3, 3, 0, 0]}>
              {bars.map((b, k) => (
                <Cell key={k} fillOpacity={b.pre ? 0.45 : 1} stroke={b.pre ? GREEN : undefined} strokeDasharray="3 2" />
              ))}
            </Bar>
            {!d.isBank && <Bar hide={s1.hidden('FCF')} dataKey="FCF" fill={AMBER} radius={[3, 3, 0, 0]}>
              {bars.map((b, k) => (
                <Cell key={k} fillOpacity={b.pre ? 0.45 : 1} stroke={b.pre ? AMBER : undefined} strokeDasharray="3 2" />
              ))}
            </Bar>}
          </BarChart>
        </ResponsiveContainer>
        <p className="tw:text-xs tw:text-muted">
          Miles de millones de {d.currency === 'USD' ? 'dólares' : d.currency}.
          {anyPre8 && ' * Preliminar: cifras del comunicado de resultados (8-K), barras más claras.'}
        </p>
      </Card>

      {seg && (
        <Card
          title="¿De dónde vienen los ingresos?"
          subtitle="Desglose que la empresa reporta en las notas de sus 10-Q y 10-K, leído directamente del XBRL de cada informe."
        >
          <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-x-4">
            <Toggle<string>
              value={segAxis}
              onChange={setSegAxis}
              options={d.segments.map((x) => [x.axis, x.title] as [string, string])}
            />
            <Toggle<View>
              value={segView}
              onChange={setSegView}
              options={[
                ['quarter', 'Trimestre'],
                ['ttm', '12 meses'],
                ['fy', 'Año fiscal'],
              ]}
            />
          </div>
          {segData.rows.length === 0 ? (
            <p className="tw:text-sm tw:text-muted tw:py-6">
              Esta empresa publica este desglose solo en su informe anual: elige «Año fiscal».
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={segData.rows} stackOffset="sign" margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="label" tick={AXIS} minTickGap={20} />
                <YAxis tick={AXIS} tickFormatter={usdShort} width={60} />
                <Tooltip formatter={(val: number) => money(val)} {...TOOLTIP} />
                <Legend {...s2.legend} />
                {segData.keys.map((k, n) => (
                  <Bar hide={s2.hidden(k)} key={k} dataKey={k} stackId="seg" fill={SEG_COLORS[n % SEG_COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="tw:text-xs tw:text-muted tw:mt-1">
            {segCheck?.ok === true && <span className="tw:text-pos tw:font-semibold">✓ Verificado: </span>}
            {segCheck?.ok === false && <span className="tw:text-neg tw:font-semibold">⚠ No cuadra: </span>}
            {segCheck?.ok != null &&
              (segCheck.ok
                ? 'en el último periodo las partes suman los ingresos totales del estado de resultados. '
                : `en el último periodo las partes difieren ${pct(segCheck.diff, 1)} de los ingresos totales (la empresa no desglosa todo). `)}
            {segOkShare !== null && `Cuadra en ${pct(segOkShare, 0)} de los periodos con datos. `}
            Miles de millones de {d.currency === 'USD' ? 'dólares' : d.currency}. Las cifras históricas usan la versión
            más reciente que publicó la empresa (los segmentos a veces se reclasifican).
          </p>
        </Card>
      )}

      <div className="tw:grid tw:grid-cols-1 tw:lg:grid-cols-2 tw:gap-6">
        <Card title="Por acción" subtitle="Últimos 12 meses, ajustado por splits">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={perShare} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={AXIS} minTickGap={20} />
              <YAxis tick={AXIS} />
              <Tooltip formatter={(val: number) => usdPrice(val).replace('US$', cur)} {...TOOLTIP} />
              <Legend {...s3.legend} />
              <Line hide={s3.hidden('EPS (12 meses)')} dataKey="EPS (12 meses)" stroke={BLUE} dot={false} connectNulls />
              {!d.isBank && <Line hide={s3.hidden('FCF por acción (12 meses)')} dataKey="FCF por acción (12 meses)" stroke={GREEN} dot={false} connectNulls />}
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
              <Legend {...s4.legend} />
              {!d.isBank && <Line hide={s4.hidden('Margen bruto')} dataKey="Margen bruto" stroke={BLUE} dot={false} connectNulls />}
              {!d.isBank && <Line hide={s4.hidden('Margen operacional')} dataKey="Margen operacional" stroke={AMBER} dot={false} connectNulls />}
              <Line hide={s4.hidden('Margen neto')} dataKey="Margen neto" stroke={GREEN} dot={false} connectNulls />
              {!d.isBank && <Line hide={s4.hidden('Margen FCF')} dataKey="Margen FCF" stroke={PURPLE} dot={false} connectNulls />}
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
              <Legend {...s5.legend} />
              <Line hide={s5.hidden('ROE')} dataKey="ROE" stroke={PURPLE} dot={false} connectNulls />
              {!d.isBank && <Line hide={s5.hidden('ROIC')} dataKey="ROIC" stroke={BLUE} dot={false} connectNulls />}
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
                <Legend {...s6.legend} />
                <Line hide={s6.hidden('P/E')} dataKey="P/E" stroke={BLUE} dot={false} connectNulls />
                {!d.isBank && <Line hide={s6.hidden('P/FCF')} dataKey="P/FCF" stroke={GREEN} dot={false} connectNulls />}
                {hist.pe && !s6.hidden('P/E') && <ReferenceLine y={hist.pe} stroke={BLUE} strokeDasharray="4 4" />}
                {!d.isBank && hist.pfcf && !s6.hidden('P/FCF') && <ReferenceLine y={hist.pfcf} stroke={GREEN} strokeDasharray="4 4" />}
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
        subtitle={`Miles de millones de ${d.currency === 'USD' ? 'dólares' : d.currency}; por acción en ${d.currency === 'USD' ? 'dólares' : d.currency}; acciones en miles de millones. Debajo de cada cifra, el crecimiento ${tableView === 'fy' ? 'frente al año anterior' : 'frente al mismo periodo del año anterior'}. Desliza a la izquierda para ver la historia. Haz clic en 10-Q / 10-K para abrir el informe original y verificar cada cifra.${anyPre8 ? ' Las columnas «Preliminar» salen del comunicado de resultados (8-K) y se reemplazan por el 10-Q / 10-K cuando llega.' : ''}`}
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
                    <div>{tableView === 'fy' ? d.fiscal[i].split(' ')[1] : d.fiscal[i]}</div>
                    {isPre(i) && (
                      <div className="tw:text-[10px] tw:font-sans tw:font-semibold tw:uppercase tw:text-accent" title={`Comunicado de resultados del ${pre(i)!.filed}; se reemplaza cuando llegue el 10-Q / 10-K`}>
                        Preliminar
                      </div>
                    )}
                    {d.filingUrl[i] && (
                      <a
                        href={d.filingUrl[i]!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tw:text-accent tw:normal-case tw:hover:underline"
                        title="Abre el informe original en el visor de la SEC"
                      >
                        {d.filingForm[i] ?? 'informe'} ↗
                      </a>
                    )}
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
                      <td key={i} className={`tw:px-3 tw:py-1.5 tw:text-right tw:whitespace-nowrap tw:tabular-nums tw:font-mono ${isPre(i) ? 'tw:italic tw:bg-surface-2' : ''}`}>
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

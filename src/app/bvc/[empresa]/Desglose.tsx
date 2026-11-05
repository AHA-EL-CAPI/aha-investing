'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Breakdown } from '@/lib/bvc';
import { cop, copShort, pct, quarterLabel } from '@/lib/bvcFormat';
import { useSeriesToggle } from '@/components/useSeriesToggle';

const AXIS = { fontSize: 11 };
const GRID = 'var(--grid)';
const TOOLTIP = { itemStyle: { color: 'var(--fg)' }, cursor: { fill: 'var(--surface-2)' } };
const COLORS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)'];

type View = 'quarter' | 'ttm' | 'fy';
type Num = number | null;

const TEXT: Record<Breakdown['axis'], { title: string; subtitle: string; note: string }> = {
  geografia: {
    title: '¿De dónde vienen los ingresos?',
    subtitle: 'Ingresos en Colombia y en el exterior, leídos de la nota de información geográfica del XBRL de cada informe.',
    note:
      'La Superfinanciera solo pide separar Colombia del exterior (no país por país); el detalle por país o por línea de negocio está en las notas del PDF.',
  },
  cartera: {
    title: '¿A quién le presta el banco?',
    subtitle: 'Cartera de créditos por modalidad (saldo bruto al cierre de cada periodo), leída del XBRL de cada informe.',
    note:
      'Las tarjetas de crédito y la libranza están dentro de consumo; el leasing va en la modalidad que corresponda (casi todo en comercial). La Superfinanciera no pide separarlas en el XBRL.',
  },
};

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

// Si solo hay datos de cierre de año, la vista por trimestre o 12 meses quedaría vacía
function hasData(a: Breakdown, field: 'quarter' | 'ttm' | 'annual') {
  return a.members.some((m) => m[field].some((x) => x !== null));
}

function Grafica({ periods, a, financial }: { periods: string[]; a: Breakdown; financial: boolean }) {
  const stock = a.kind === 'stock';
  const views: [View, string][] = stock
    ? [
        ['quarter', 'Trimestre'],
        ['fy', 'Cierre de año'],
      ]
    : [
        ['quarter', 'Trimestre'],
        ['ttm', '12 meses'],
        ['fy', 'Año'],
      ];
  const available = views.filter(([v]) => hasData(a, v === 'fy' ? 'annual' : v));
  // con saldos el trimestre ya trae los cierres de año: si solo hay anuales no se ofrece la vista trimestral
  const offered = stock && !a.members.some((m) => m.quarter.some((x, i) => x !== null && m.annual[i] === null))
    ? available.filter(([v]) => v === 'fy')
    : available;
  const [view, setView] = useState<View>(
    offered.find(([v]) => v === (stock ? 'quarter' : 'ttm'))?.[0] ?? offered[0]?.[0] ?? 'fy',
  );
  const [share, setShare] = useState<'abs' | 'pct'>('abs');
  // leyenda clicable: ocultar Colombia o exterior (o una modalidad); el % se recalcula sobre lo visible
  const series = useSeriesToggle();
  const t = TEXT[a.axis];

  const data = useMemo(() => {
    const field = view === 'quarter' ? 'quarter' : view === 'ttm' ? 'ttm' : 'annual';
    const rows: Record<string, string | Num>[] = [];
    let lastIdx = -1;
    periods.forEach((p, i) => {
      const vals = a.members.map((m) => m[field][i]);
      if (vals.every((x) => x === null)) return;
      const tot = vals.reduce<number>((s, x, k) => s + (series.hidden(a.members[k].label) ? 0 : x ?? 0), 0);
      const row: Record<string, string | Num> = { label: view === 'fy' ? p.slice(0, 4) : quarterLabel(p) };
      a.members.forEach((m, k) => (row[m.label] = share === 'pct' ? (tot ? (vals[k] ?? 0) / tot : null) : vals[k]));
      rows.push(row);
      lastIdx = i;
    });
    return { rows, lastIdx };
  }, [a, periods, view, share, series]);

  // en bancos y holdings financieros la nota usa ingresos brutos: la comparacion con el estado de resultados no aplica
  const verify = !stock && !financial;
  const check = verify && data.lastIdx >= 0 ? { ok: a.ok[data.lastIdx], diff: a.diff[data.lastIdx] } : null;
  const checked = a.ok.filter((x) => x !== null);
  const okShare = verify && checked.length ? checked.filter(Boolean).length / checked.length : null;
  // participacion del ultimo periodo para el subtitulo
  const last = data.rows.at(-1);
  const lastTot = last
    ? a.members.reduce((s, m) => s + ((share === 'pct' || series.hidden(m.label) ? null : (last[m.label] as Num)) ?? 0), 0)
    : 0;

  if (!offered.length) return null;
  return (
    <section className="tw:bg-surface tw:border tw:border-line tw:p-4 tw:sm:p-5 tw:rounded-xl tw:w-full tw:min-w-0">
      <h2 className="tw:text-lg tw:font-semibold tw:text-fg">{t.title}</h2>
      <p className="tw:text-sm tw:text-muted tw:mb-2">{t.subtitle}</p>
      <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-x-4">
        {offered.length > 1 && <Toggle<View> value={view} onChange={setView} options={offered} />}
        <Toggle<'abs' | 'pct'>
          value={share}
          onChange={setShare}
          options={[
            ['abs', 'Pesos'],
            ['pct', '% del total'],
          ]}
        />
      </div>
      {offered.length === 1 && view === 'fy' && !stock && (
        <p className="tw:text-xs tw:text-muted tw:mb-1">Esta empresa publica este desglose solo en su informe de cierre de año.</p>
      )}
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={data.rows}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={AXIS} minTickGap={20} />
          <YAxis
            tick={AXIS}
            width={70}
            domain={share === 'pct' ? [0, 1] : undefined}
            tickFormatter={(x: number) => (share === 'pct' ? pct(x, 0) : copShort(x))}
          />
          <Tooltip formatter={(val: number) => (share === 'pct' ? pct(val) : cop(val))} {...TOOLTIP} />
          <Legend {...series.legend} />
          {a.members.map((m, n) => (
            <Bar key={m.label} dataKey={m.label} stackId="d" fill={COLORS[n % COLORS.length]} hide={series.hidden(m.label)} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <p className="tw:text-xs tw:text-muted tw:mt-1">
        {check?.ok === true && <span className="tw:text-pos tw:font-semibold">✓ Verificado: </span>}
        {check?.ok === false && <span className="tw:text-neg tw:font-semibold">⚠ No cuadra: </span>}
        {check?.ok != null &&
          (check.ok
            ? 'en el último periodo Colombia + exterior suman los ingresos del estado de resultados. '
            : `en el último periodo la suma difiere ${pct(check.diff, 1)} de los ingresos del estado de resultados. `)}
        {okShare !== null && `Cuadra en ${pct(okShare, 0)} de los periodos con datos. `}
        {!stock && financial &&
          'En bancos y holdings financieros esta nota usa ingresos brutos (intereses, comisiones y otros), así que no coincide con la línea de ingresos del estado de resultados: sirve para ver la proporción. '}
        {stock && last && share === 'abs' && lastTot > 0 && `Cartera ${a.members.some((m) => series.hidden(m.label)) ? 'visible' : 'total'} al cierre de ${last.label}: ${cop(lastTot)}. `}
        {t.note} B = billones de pesos, MM = miles de millones.
      </p>
    </section>
  );
}

export default function Desglose({ periods, axes, financial }: { periods: string[]; axes: Breakdown[]; financial: boolean }) {
  if (!axes.length) return null;
  return (
    <>
      {axes.map((a) => (
        <Grafica key={a.axis} periods={periods} a={a} financial={financial} />
      ))}
    </>
  );
}

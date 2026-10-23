// Datos de los dashboards originales (/dashboard/ECOPETROL, BCOLOMBIA, PFDAVVNDA) a partir de los JSON
// del pipeline bvc-fundamentales. Mantiene los nombres de campo que ya usaban esas paginas.
// Cifras en millones de COP, porcentajes en %. Solo se usa en componentes de servidor.
import fs from 'node:fs';
import path from 'node:path';

type Num = number | null;
type Row = { item: string; quarter: Num[]; ttm: Num[] };
type CompanyFile = {
  periods: string[];
  statements: Record<string, { rows: Row[] }>;
  metric_periods: string[];
  metrics: Record<string, Num[]>;
  prices?: { date: string[]; close: Num[] };
};

export type DashboardRow = { quarter: string } & Record<string, Num | string>;
export type PricePoint = { date: string; close: number };

const DIR = path.join(process.cwd(), 'src', 'data', 'bvc');
const FROM = '2015-03-31';

function read(id: string): CompanyFile {
  return JSON.parse(fs.readFileSync(path.join(DIR, `${id}.json`), 'utf-8')) as CompanyFile;
}

// 2025-03-31 -> 1Q25 (mismo formato que tenian los dashboards)
const label = (p: string) => `${Math.ceil(Number(p.slice(5, 7)) / 3)}Q${p.slice(2, 4)}`;

// fin del trimestre n trimestres antes de p
function prevQ(p: string, n: number): string {
  const q = Number(p.slice(0, 4)) * 4 + Math.ceil(Number(p.slice(5, 7)) / 3) - 1 - n;
  const y = Math.floor(q / 4);
  const m = (q % 4) * 3 + 3;
  return `${y}-${String(m).padStart(2, '0')}-${m === 3 || m === 12 ? '31' : '30'}`;
}

type Series = Map<string, Num>;

function series(c: CompanyFile, code: string, item: string, kind: 'quarter' | 'ttm' = 'quarter'): Series {
  const row = c.statements[code]?.rows.find((r) => r.item === item);
  return new Map(c.periods.map((p, i) => [p, row?.[kind][i] ?? null]));
}

function metric(c: CompanyFile, key: string): Series {
  return new Map(c.metric_periods.map((p, i) => [p, c.metrics[key]?.[i] ?? null]));
}

function combine(a: Series, b: Series, f: (x: number, y: number) => number): Series {
  return new Map([...a].map(([p, x]) => {
    const y = b.get(p);
    return [p, x == null || y == null ? null : f(x, y)];
  }));
}

const scale = (s: Series, k: number): Series => new Map([...s].map(([p, v]) => [p, v == null ? null : v * k]));

function ttm(s: Series, p: string): Num {
  let sum = 0;
  for (let n = 0; n < 4; n++) {
    const v = s.get(prevQ(p, n));
    if (v == null) return null;
    sum += v;
  }
  return sum;
}

function yoy(s: Series, p: string): Num {
  const now = s.get(p);
  const before = s.get(prevQ(p, 4));
  if (now == null || before == null || before === 0) return null;
  return ((now - before) / Math.abs(before)) * 100;
}

const M = 1e-6; // pesos -> millones

// fields: nombre en el dashboard -> serie trimestral; withTtm/withYoy: a cuales sacar TTM y variacion anual
function build(c: CompanyFile, fields: Record<string, Series>, withTtm: string[], withYoy: string[]): DashboardRow[] {
  return c.periods
    .filter((p) => p >= FROM)
    .map((p) => {
      const row: DashboardRow = { quarter: label(p) };
      for (const [k, s] of Object.entries(fields)) row[k] = s.get(p) ?? null;
      for (const k of withTtm) row[`${k}_TTM`] = ttm(fields[k], p);
      for (const k of withYoy) row[`${k}_ΔYoY_Pct`] = yoy(fields[k], p);
      return row;
    });
}

// ultimo ano de precios diarios
function prices(c: CompanyFile): PricePoint[] {
  if (!c.prices) return [];
  const { date, close } = c.prices;
  const last = date.at(-1) ?? '';
  const from = `${Number(last.slice(0, 4)) - 1}${last.slice(4)}`;
  return date
    .map((d, i) => ({ date: d, close: close[i] }))
    .filter((x): x is PricePoint => x.date > from && x.close != null);
}

export function ecopetrolDashboard() {
  const c = read('ecopetrol');
  const cfo = scale(series(c, 'CF', 'cfo'), M);
  const capex = scale(series(c, 'CF', 'capex_ppe'), -M); // negativo: salida de caja
  const fields = {
    Total_ingresos: scale(series(c, 'IS', 'revenue'), M),
    Efectivo_neto_generado_por_las_actividades_de_operación: cfo,
    Inversión_en_propiedad_planta_y_equipo: capex,
    FCF: combine(cfo, capex, (a, b) => a + b),
  };
  const keys = Object.keys(fields);
  return { stockData: build(c, fields, keys, keys), priceHistory: prices(c) };
}

function bankFields(c: CompanyFile) {
  const ni = scale(series(c, 'IS', 'net_income_parent'), M);
  const ii = series(c, 'IS', 'interest_income');
  const ie = series(c, 'IS', 'interest_expense');
  const hasNii = [...ii.values()].some((v) => v != null);
  return {
    hasNii,
    // sin intereses reportados por separado se usan los ingresos totales
    Net_Interest_Income: hasNii ? scale(combine(ii, ie, (a, b) => a - b), M) : scale(series(c, 'IS', 'revenue'), M),
    Net_Income: ni,
    Equity: scale(series(c, 'BS', 'equity_parent'), M),
    ROE: scale(metric(c, 'roe'), 100),
  };
}

export function bancolombiaDashboard() {
  const c = read('bancolombia');
  const { hasNii, ...fields } = bankFields(c);
  return {
    hasNii,
    stockData: build(c, fields, ['Net_Interest_Income', 'Net_Income'], Object.keys(fields)),
    priceHistory: prices(c),
  };
}

export function daviviendaDashboard() {
  const c = read('davivienda_bank');
  const { hasNii, ...bank } = bankFields(c);
  const shares = series(c, 'BS', 'shares_outstanding');
  const fields = {
    ...bank,
    EPS: combine(bank.Net_Income, shares, (n, s) => (s ? (n * 1e6) / s : 0)),
    Shares: shares,
  };
  const stockData = build(c, fields, ['Net_Interest_Income', 'Net_Income', 'EPS'], ['Net_Interest_Income', 'Net_Income', 'EPS', 'Equity', 'ROE']);
  return { hasNii, stockData, priceHistory: prices(c) };
}

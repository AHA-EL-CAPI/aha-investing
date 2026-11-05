// Datos de empresas de EE. UU. generados por el pipeline sec-fundamentales (API XBRL oficial de la SEC).
// Solo se usa en componentes de servidor: lee los JSON de src/data/sec en el build.
import fs from 'node:fs';
import path from 'node:path';

import type { QuarterlyBase } from '@/types/QuarterlyBase';

type Num = number | null;

export type SecValuation = {
  date?: string;
  close?: Num;
  market_cap?: Num;
  pe?: Num;
  p_fcf?: Num;
  fcf_yield?: Num;
  ps?: Num;
  pb?: Num;
  ev_ebit?: Num;
  ev_ebitda?: Num;
  dividend_yield?: Num;
  shareholder_yield?: Num;
};

export type SecSummary = {
  ticker: string;
  name: string;
  currency: string;
  tipo: 'general' | 'banco';
  last_period: string;
  fiscal_year: number;
  fiscal_quarter: number;
  metrics: Record<string, Num>;
  valuation: SecValuation;
};

type Dcf = { growth: [number, number, number]; multiple: number; discount: number; safety: number };

export type SecCompany = {
  ticker: string;
  name: string;
  currency: string;
  tipo: 'general' | 'banco';
  generated: string;
  cik: number;
  sec_url: string;
  periods: string[];
  fiscal_year: number[];
  fiscal_quarter: number[];
  available: (string | null)[];
  quarter: Record<'revenue' | 'cfo' | 'capex' | 'fcf' | 'shares' | 'fcf_ps' | 'net_income' | 'eps' | 'equity' | 'nii', Num[]>;
  ttm: Record<'revenue' | 'cfo' | 'fcf' | 'fcf_ps' | 'net_income' | 'eps' | 'nii' | 'operating_income' | 'sbc' | 'dividends' | 'buybacks', Num[]>;
  fy: Record<'revenue' | 'cfo' | 'capex' | 'fcf' | 'fcf_ps' | 'net_income' | 'eps', Num[]>;
  ratios: Record<string, Num[]>;
  prices: { date: string[]; close: Num[] };
  multiples: { date: string[]; pe: Num[]; p_fcf: Num[] };
  valuation: SecValuation;
  dcf: Dcf;
  segments?: SegmentAxis[];
  filing_url?: (string | null)[];
  filing_form?: (string | null)[];
};

// Ingresos por segmento / producto / pais (cifras con dimension del XBRL de cada informe), alineados con periods.
// ok/diff: si los miembros suman los ingresos totales de ese trimestre (tolerancia 1 %)
export type SegmentAxis = {
  axis: 'segmento' | 'producto' | 'geografia';
  title: string;
  members: { label: string; subtotal: boolean; quarter: Num[]; annual: Num[]; ttm: Num[] }[];
  ok: (boolean | null)[];
  diff: Num[];
};

const DIR = path.join(process.cwd(), 'src', 'data', 'sec');

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf-8')) as T;
}

export function loadSecIndex(): { generated: string; companies: SecSummary[] } {
  return readJson('index.json');
}

export function secTickers(): string[] {
  return loadSecIndex().companies.map((c) => c.ticker);
}

export function loadSecCompany(ticker: string): SecCompany | null {
  const file = path.join(DIR, `${ticker}.json`);
  return fs.existsSync(file) ? readJson<SecCompany>(`${ticker}.json`) : null;
}

// 2025-03-29 -> Q1-25 (trimestre calendario del cierre, como en los dashboards originales)
export const dashLabel = (p: string) => `Q${Math.ceil(Number(p.slice(5, 7)) / 3)}-${p.slice(2, 4)}`;

// ---------- Tabla de sensibilidad (misma formula de los notebooks: final_value_calculator) ----------
function fairValue(fcf0: number, g1: number, g2: number, multiple: number, dr: number, ms: number): number {
  const flows: number[] = [];
  let f = fcf0;
  for (let t = 0; t < 5; t++) flows.push((f *= 1 + g1 / 100));
  for (let t = 0; t < 5; t++) flows.push((f *= 1 + g2 / 100));
  flows.push(multiple * f);
  const pv = flows.reduce((s, x, i) => s + x / (1 + dr / 100) ** (i + 1), 0);
  return Math.round((1 - ms / 100) * pv * 100) / 100;
}

export function sensitivityTable(c: SecCompany, initial: number | null) {
  const { growth, multiple, discount, safety } = c.dcf;
  const names = ['Bear', 'Basis', 'Bull'];
  const fcf0 = initial ?? 0;
  return {
    headers: ['Unidades', `${c.currency} $`, 'Bear', 'Basis', 'Bull'],
    rows: [
      [c.ticker, 'GRF5Y\\GRL5Y', ...growth.map(String)],
      ...growth.map((g1, i) => [names[i], String(g1), ...growth.map((g2) => fairValue(fcf0, g1, g2, multiple, discount, safety))]),
    ],
    quantities: {
      'Initial FCF': Math.round(fcf0 * 100) / 100,
      'FCF multiple': multiple,
      'Disccount Rate': discount,
      'Margin of safety': safety,
    },
  };
}

// ---------- Dashboards /dashboard/[TICKER] con los nombres de campo de los notebooks ----------
const B = 1e-9; // USD -> miles de millones (la unidad de los dashboards)

function growth(s: Num[], i: number, lag: number): Num {
  const now = s[i];
  const before = i - lag >= 0 ? s[i - lag] : null;
  if (now == null || before == null || before === 0) return null;
  return ((now - before) / Math.abs(before)) * 100;
}

const scale = (s: Num[], k: number) => s.map((v) => (v == null ? null : v * k));
const ratio = (a: Num[], b: Num[]) => a.map((v, i) => (v == null || !b[i] ? null : (v / (b[i] as number)) * 100));

export function secDashboard(ticker: string, from = '2010-01-01') {
  const c = loadSecCompany(ticker);
  if (!c) throw new Error(`Sin datos de la SEC para ${ticker}`);
  const q = c.quarter;
  const isBank = c.tipo === 'banco';
  const isQ4 = c.fiscal_quarter.map((x) => x === 4);
  const onlyQ4 = (s: Num[]) => s.map((v, i) => (isQ4[i] ? v : null));

  // series base (miles de millones, CAPEX negativo como en los notebooks)
  const fields: Record<string, Num[]> = isBank
    ? {
        Quarter_Revenue: scale(q.revenue, B),
        Quarter_Profit: scale(q.net_income, B),
        Quarter_Equity: scale(q.equity, B),
        // ROE del trimestre anualizado, en %
        Quarter_ROE: q.net_income.map((n, i) => (n == null || !q.equity[i] ? null : ((n * 4) / (q.equity[i] as number)) * 100)),
        Adj_Diluted_Shares: scale(q.shares, B),
        Quarter_EPS: q.eps,
        Quarter_Profit_Revenue_Pct: ratio(q.net_income, q.revenue),
        Annual_Revenue: scale(onlyQ4(c.fy.revenue), B),
        Annual_Profit: scale(onlyQ4(c.fy.net_income), B),
        Annual_EPS: onlyQ4(c.fy.eps),
      }
    : {
        Quarter_Revenue: scale(q.revenue, B),
        Quarter_Op_Cash: scale(q.cfo, B),
        Quarter_CAPEX: scale(q.capex, -B),
        Adj_Diluted_Shares: scale(q.shares, B),
        Quarter_FCF: scale(q.fcf, B),
        Quarter_FCF_Share: q.fcf_ps,
        Quarter_Op_Cash_Revenue_Pct: ratio(q.cfo, q.revenue),
        Quarter_CAPEX_Revenue_Pct: ratio(q.capex, q.revenue),
        Quarter_FCF_Revenue_Pct: ratio(q.fcf, q.revenue),
        Annual_Revenue: scale(onlyQ4(c.fy.revenue), B),
        Annual_Op_Cash: scale(onlyQ4(c.fy.cfo), B),
        Annual_CAPEX: scale(onlyQ4(c.fy.capex), -B),
        Annual_FCF: scale(onlyQ4(c.fy.fcf), B),
        Annual_FCF_Share: onlyQ4(c.fy.fcf_ps),
        TTM_FCF_Share: c.ttm.fcf_ps,
      };
  // crecimientos: Q on Q (1 trimestre), QY on QY (4), QfiveY on QfiveY (20)
  const bases = isBank
    ? { Revenue: 'Quarter_Revenue', Profit: 'Quarter_Profit', Equity: 'Quarter_Equity', ROE: 'Quarter_ROE', EPS: 'Quarter_EPS', Adj_Diluted_Shares: 'Adj_Diluted_Shares' }
    : { Revenue: 'Quarter_Revenue', Op_Cash: 'Quarter_Op_Cash', Capex: 'Quarter_CAPEX', Adj_Diluted_Shares: 'Adj_Diluted_Shares', FCF: 'Quarter_FCF', FCF_Share: 'Quarter_FCF_Share' };
  const annual = isBank
    ? { Revenue: 'Annual_Revenue', Profit: 'Annual_Profit', EPS: 'Annual_EPS' }
    : { Revenue: 'Annual_Revenue', Op_Cash: 'Annual_Op_Cash', Capex: 'Annual_CAPEX', FCF: 'Annual_FCF', FCF_Share: 'Annual_FCF_Share' };

  const rows: QuarterlyBase[] = [];
  c.periods.forEach((p, i) => {
    if (p < from) return;
    const row: QuarterlyBase = { quarter: dashLabel(p) };
    for (const [k, s] of Object.entries(fields)) row[k] = s[i];
    for (const [name, key] of Object.entries(bases)) {
      row[`Q_on_Q_${name}_growth`] = growth(fields[key], i, 1);
      row[`QY_on_QY_${name}_growth`] = growth(fields[key], i, 4);
      row[`QfiveY_on_QfiveY_${name}_growth`] = growth(fields[key], i, 20);
    }
    for (const [name, key] of Object.entries(annual)) {
      row[`Y_on_Y_${name}_growth`] = isQ4[i] ? growth(fields[key], i, 4) : null;
      row[`fiveY_on_fiveY_${name}_growth`] = isQ4[i] ? growth(fields[key], i, 20) : null;
    }
    rows.push(row);
  });

  // precios diarios del ultimo ano
  const last = c.prices.date.at(-1) ?? '';
  const since = `${Number(last.slice(0, 4)) - 1}${last.slice(4)}`;
  const priceHistory = c.prices.date
    .map((d, i) => ({ date: d, close: c.prices.close[i] }))
    .filter((x): x is { date: string; close: number } => x.date > since && x.close != null);

  // FCF inicial de la tabla: FCF por accion de los ultimos 12 meses (bancos: UPA de 12 meses)
  const n = c.periods.length - 1;
  const initial = isBank ? c.ttm.eps[n] : c.ttm.fcf_ps[n];
  return { company: c, stockData: rows, priceHistory, valuationTable: sensitivityTable(c, initial), isBank };
}

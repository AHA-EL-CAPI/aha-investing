// Datos de emisores colombianos generados por el pipeline bvc-fundamentales (XBRL oficiales de SIMEV).
// Solo se usa en componentes de servidor: lee los JSON de src/data/bvc en el build.
import fs from 'node:fs';
import path from 'node:path';

export type Fmt = 'cop' | 'pct' | 'x' | 'cop_ps';
export type MetricDef = { key: string; label: string; fmt: Fmt };
type Num = number | null;

export type Valuation = {
  close?: Num;
  traded_value?: Num;
  pe?: Num;
  pb?: Num;
  dividend_yield?: Num;
  market_cap?: Num;
};

export type CompanySummary = {
  id: string;
  name: string;
  sector: string;
  ticker: string;
  last_period: string;
  metrics: Record<string, Num>;
  price_date: string | null;
  valuation: Valuation;
};

type StatementRow = { item: string; label: string; quarter: Num[]; ttm: Num[] };

// Estados completos leidos del PDF de cada informe (bvc-fundamentales/bvc/pdfingest.py): cada linea con su
// etiqueta original; el balance trae el saldo y los demas el acumulado del ano (ytd) y el trimestre aislado
type PdfLine = { label: string; level: number; per_share?: boolean; values?: Num[]; ytd?: Num[]; quarter?: Num[] };
// unverified: informes cuyo estado no coincide con ninguna cifra clave del XBRL (se muestran marcados)
type PdfFile = { periods: string[]; unverified?: Partial<Record<'BS' | 'IS' | 'CF', string[]>> } & Partial<
  Record<'BS' | 'IS' | 'CF', PdfLine[]>
>;

export type PdfStatement = {
  code: 'BS' | 'IS' | 'CF';
  title: string;
  rows: { label: string; level: number; perShare: boolean; total: boolean; quarter: Num[]; ytd: Num[] }[];
  unverified: string[];
};

type CompanyFile = {
  id: string;
  name: string;
  sector: string;
  scope: 'con' | 'ind';
  tickers_bvc: string;
  periods: string[];
  statements: Record<string, { title: string; rows: StatementRow[] }>;
  metric_periods: string[];
  metrics: Record<string, Num[]>;
  coverage: Record<string, string>;
  prices?: { date: string[]; close: Num[]; pe: Num[]; pb: Num[]; dividend_yield: Num[]; market_cap: Num[] };
  metric_defs: MetricDef[];
  pdf?: PdfFile;
  news?: NewsItem[];
  simev_url?: string;
};

// Informacion relevante publicada en SIMEV (bvc-fundamentales/bvc/inforel.py)
export type NewsItem = { date: string; topic: string; summary: string };

// Lo que recibe la ficha en el navegador: solo las series que se grafican
export type CompanyView = {
  id: string;
  name: string;
  sector: string;
  scope: 'con' | 'ind';
  ticker: string;
  isBank: boolean;
  quarters: {
    period: string;
    revenue: Num;
    revenueTtm: Num;
    netIncome: Num;
    netIncomeTtm: Num;
    fcfTtm: Num;
    grossMargin: Num;
    operatingMargin: Num;
    netMargin: Num;
    roe: Num;
  }[];
  prices: { date: string; close: Num; pe: Num; pb: Num; dy: Num }[];
  statements: { code: string; title: string; periods: string[]; rows: { label: string; values: Num[] }[] }[];
  pdf: { periods: string[]; statements: PdfStatement[] } | null;
  news: NewsItem[];
  simevUrl: string | null;
  missing: number;
  lastPeriod: string;
  summary: CompanySummary;
  metricDefs: MetricDef[];
};

const DIR = path.join(process.cwd(), 'src', 'data', 'bvc');
const BANKS = new Set(['banca']);

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf-8')) as T;
}

export function loadIndex(): { generated: string; metric_defs: MetricDef[]; companies: CompanySummary[] } {
  return readJson('index.json');
}

export function companyIds(): string[] {
  return loadIndex().companies.map((c) => c.id);
}

export function loadCompany(id: string): CompanyView | null {
  const index = loadIndex();
  const summary = index.companies.find((c) => c.id === id);
  if (!summary) return null;
  const c = readJson<CompanyFile>(`${id}.json`);
  const isBank = BANKS.has(c.sector);
  const row = (code: string, item: string) => c.statements[code]?.rows.find((r) => r.item === item);
  const rev = isBank ? row('IS', 'net_interest_income') ?? row('IS', 'revenue') : row('IS', 'revenue');
  const ni = row('IS', 'net_income_parent') ?? row('IS', 'net_income');
  const metricAt = (key: string, p: string) => {
    const i = c.metric_periods.indexOf(p);
    return i < 0 ? null : c.metrics[key]?.[i] ?? null;
  };

  // desde 2015 (inicio de NIIF en SIMEV)
  const from = c.periods.findIndex((p) => p >= '2015-03-31');
  const idx = c.periods.map((_, i) => i).slice(from < 0 ? 0 : from);
  const quarters = idx.map((i) => {
    const p = c.periods[i];
    return {
      period: p,
      revenue: rev?.quarter[i] ?? null,
      revenueTtm: rev?.ttm[i] ?? null,
      netIncome: ni?.quarter[i] ?? null,
      netIncomeTtm: ni?.ttm[i] ?? null,
      fcfTtm: metricAt('fcf_ttm', p),
      grossMargin: metricAt('gross_margin', p),
      operatingMargin: metricAt('operating_margin', p),
      netMargin: metricAt('net_margin', p),
      roe: metricAt('roe', p),
    };
  });

  // precios semanales desde 2015 para que la pagina sea liviana
  const prices: CompanyView['prices'] = [];
  if (c.prices) {
    let lastWeek = '';
    c.prices.date.forEach((d, i) => {
      if (d < '2015-01-01') return;
      const week = weekKey(d);
      const point = { date: d, close: c.prices!.close[i], pe: c.prices!.pe[i], pb: c.prices!.pb[i], dy: c.prices!.dividend_yield[i] };
      if (week === lastWeek) prices[prices.length - 1] = point;
      else prices.push(point);
      lastWeek = week;
    });
  }

  // estados financieros: todo el historial, desde el primer trimestre con alguna cifra
  const statements = Object.entries(c.statements).map(([code, s]) => {
    const first = c.periods.findIndex((_, i) => s.rows.some((r) => r.quarter[i] !== null));
    const off = first < 0 ? 0 : first;
    return {
      code,
      title: s.title,
      periods: c.periods.slice(off),
      rows: s.rows
        .map((r) => ({ label: r.label, values: r.quarter.slice(off) }))
        .filter((r) => r.values.some((v) => v !== null)),
    };
  });

  const missing = Object.entries(c.coverage).filter(([p, e]) => p >= '2015-03-31' && e === 'falta').length;

  return {
    id: c.id,
    name: c.name,
    sector: c.sector,
    scope: c.scope,
    ticker: c.tickers_bvc,
    isBank,
    quarters,
    prices,
    statements,
    pdf: pdfStatements(c.pdf),
    news: c.news ?? [],
    simevUrl: c.simev_url ?? null,
    missing,
    lastPeriod: summary.last_period,
    summary,
    metricDefs: index.metric_defs,
  };
}

const PDF_TITLES = { BS: 'Situación financiera', IS: 'Resultados', CF: 'Flujos de efectivo' } as const;
const TOTAL = /^(total|ganancia neta|utilidad neta|resultado neto|p[eé]rdida neta|efectivo .*al final|flujos? (de efectivo )?net|efectivo neto)/i;

function pdfStatements(f: PdfFile | undefined): CompanyView['pdf'] {
  if (!f) return null;
  const statements = (['BS', 'IS', 'CF'] as const)
    .filter((code) => f[code]?.length)
    .map((code) => ({
      code,
      title: PDF_TITLES[code],
      rows: f[code]!.map((r) => ({
        label: r.label,
        level: r.level,
        perShare: !!r.per_share,
        total: TOTAL.test(r.label.trim()),
        // en el balance no hay trimestre aislado: ambas vistas muestran el saldo al cierre
        quarter: r.quarter ?? r.values ?? [],
        ytd: r.ytd ?? r.values ?? [],
      })),
      unverified: f.unverified?.[code] ?? [],
    }));
  return statements.length ? { periods: f.periods, statements } : null;
}

function weekKey(d: string): string {
  const t = new Date(d + 'T00:00:00Z');
  const monday = new Date(t);
  monday.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

// Precios del último año de cada emisor para la portada (minigráfica y variación a 12 meses)
export function loadPriceTrail(id: string): { date: string; close: number }[] {
  const c = readJson<CompanyFile>(`${id}.json`);
  if (!c.prices || c.prices.date.length === 0) return [];
  const last = c.prices.date[c.prices.date.length - 1];
  const from = `${Number(last.slice(0, 4)) - 1}${last.slice(4)}`;
  const out: { date: string; close: number }[] = [];
  c.prices.date.forEach((d, i) => {
    const v = c.prices!.close[i];
    if (d >= from && v !== null) out.push({ date: d, close: v });
  });
  return out;
}

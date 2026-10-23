// Formatos en espanol para las cifras de los emisores de la BVC (se usan en servidor y navegador).
type Num = number | null | undefined;

const nf = (digits: number) =>
  new Intl.NumberFormat('es-CO', { minimumFractionDigits: digits, maximumFractionDigits: digits });

// Billones colombianos (10^12) para cifras grandes, miles de millones para las medianas
export function cop(v: Num): string {
  if (v === null || v === undefined) return '—';
  const a = Math.abs(v);
  if (a >= 1e12) return `$${nf(2).format(v / 1e12)} billones`;
  if (a >= 1e9) return `$${nf(0).format(v / 1e9)} mil millones`;
  if (a >= 1e6) return `$${nf(0).format(v / 1e6)} millones`;
  return `$${nf(0).format(v)}`;
}

export function copShort(v: Num): string {
  if (v === null || v === undefined) return '';
  const a = Math.abs(v);
  if (a >= 1e12) return `${nf(1).format(v / 1e12)} B`;
  if (a >= 1e9) return `${nf(0).format(v / 1e9)} MM`;
  return nf(0).format(v);
}

export function price(v: Num): string {
  return v === null || v === undefined ? '—' : `$${nf(0).format(v)}`;
}

export function pct(v: Num, digits = 1): string {
  return v === null || v === undefined ? '—' : `${nf(digits).format(v * 100)}%`;
}

export function times(v: Num, digits = 1): string {
  return v === null || v === undefined ? '—' : `${nf(digits).format(v)}x`;
}

export function fmt(v: Num, kind: string): string {
  if (kind === 'pct') return pct(v);
  if (kind === 'x') return times(v);
  if (kind === 'cop_ps') return price(v);
  return cop(v);
}

// 2025-06-30 -> 2T25
export function quarterLabel(p: string): string {
  const m = Number(p.slice(5, 7));
  return `${Math.ceil(m / 3)}T${p.slice(2, 4)}`;
}

export const SECTORS: Record<string, string> = {
  banca: 'Banca',
  holding_financiero: 'Holding financiero',
  servicios_financieros: 'Servicios financieros',
  energia: 'Energía',
  petroleo_gas: 'Petróleo y gas',
  cemento: 'Cemento',
  construccion: 'Construcción',
  holding: 'Holding',
  manufactura: 'Manufactura',
  telecomunicaciones: 'Telecomunicaciones',
  comercio: 'Comercio',
  alimentos: 'Alimentos',
  mineria: 'Minería',
  inmobiliario: 'Inmobiliario',
};

export const sectorName = (s: string) => SECTORS[s] ?? s;

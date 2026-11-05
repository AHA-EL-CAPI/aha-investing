// Formatos en espanol para cifras en dolares de las empresas de EE. UU. (servidor y navegador).
type Num = number | null | undefined;

const nf = (digits: number) =>
  new Intl.NumberFormat('es-CO', { minimumFractionDigits: digits, maximumFractionDigits: digits });

// billón = 10^12 (trillion en inglés); mil millones = 10^9 (billion en inglés)
export function usd(v: Num): string {
  if (v === null || v === undefined) return '—';
  const a = Math.abs(v);
  if (a >= 1e12) return `US$${nf(2).format(v / 1e12)} billones`;
  if (a >= 1e9) return `US$${nf(1).format(v / 1e9)} mil millones`;
  if (a >= 1e6) return `US$${nf(0).format(v / 1e6)} millones`;
  return `US$${nf(0).format(v)}`;
}

// ejes de las graficas: miles de millones
export function usdShort(v: Num): string {
  if (v === null || v === undefined) return '';
  return nf(Math.abs(v) >= 1e10 ? 0 : 1).format(v / 1e9);
}

export function usdPrice(v: Num, digits = 2): string {
  return v === null || v === undefined ? '—' : `US$${nf(digits).format(v)}`;
}

export function pct(v: Num, digits = 1): string {
  return v === null || v === undefined ? '—' : `${nf(digits).format(v * 100)}%`;
}

export function times(v: Num, digits = 1): string {
  return v === null || v === undefined ? '—' : `${nf(digits).format(v)}x`;
}

// 2025-06-28 -> 2T25 (trimestre calendario del cierre)
export function quarterLabel(p: string): string {
  return `${Math.ceil(Number(p.slice(5, 7)) / 3)}T${p.slice(2, 4)}`;
}

// trimestre fiscal: T4 AF26
export const fiscalLabel = (fy: number, fq: number) => `T${fq} AF${String(fy).slice(2)}`;

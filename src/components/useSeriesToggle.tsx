'use client';

import { useCallback, useState } from 'react';

/**
 * Leyenda clicable para gráficas de recharts con 2 o más series.
 * Clic en un elemento de la leyenda lo oculta o lo vuelve a mostrar; recharts
 * recalcula el eje Y y vuelve a apilar las barras sin la serie oculta.
 *
 * Uso:
 *   const s = useSeriesToggle();
 *   <Legend {...s.legend} />
 *   <Bar dataKey="Ingresos" hide={s.hidden('Ingresos')} />
 */
export function useSeriesToggle() {
  const [off, setOff] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((key: string) => {
    setOff((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const hidden = useCallback((key: string) => off.has(key), [off]);

  const legend = {
    onClick: (entry: { dataKey?: unknown; value?: unknown }) => {
      const key = entry.dataKey ?? entry.value;
      if (key != null) toggle(String(key));
    },
    inactiveColor: 'var(--line)',
    wrapperStyle: { cursor: 'pointer', userSelect: 'none' as const },
    formatter: (value: string, item: unknown) => {
      const entry = item as { inactive?: boolean };
      return (
      <span
        style={{
          color: entry.inactive ? 'var(--muted)' : undefined,
          opacity: entry.inactive ? 0.5 : 1,
          textDecoration: entry.inactive ? 'line-through' : undefined,
        }}
      >
        {value}
      </span>
      );
    },
  };

  return { hidden, legend, toggle };
}

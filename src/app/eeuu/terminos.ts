// Explicacion de cada metrica de /eeuu: el texto corto va en el tooltip, el largo en el glosario
export type Term = { name: string; short: string; long: string };

export const GLOSARIO: Record<string, Term> = {
  market_cap: {
    name: 'Capitalización bursátil',
    short: 'Precio de la acción × acciones en circulación.',
    long: 'Lo que vale la empresa completa según el precio de la bolsa. Sirve para comparar tamaños entre empresas.',
  },
  pe: {
    name: 'P/E (precio / utilidad)',
    short: 'Precio de la acción ÷ utilidad por acción diluida de los últimos 12 meses.',
    long:
      'Cuántos dólares pagas hoy por cada dólar que la empresa ganó en el último año. Un P/E de 20x quiere decir que, si la utilidad se mantuviera igual, tardarías 20 años en "recuperar" el precio. No se calcula cuando la utilidad es negativa.',
  },
  p_fcf: {
    name: 'P/FCF (precio / flujo de caja libre)',
    short: 'Capitalización bursátil ÷ flujo de caja libre de los últimos 12 meses.',
    long:
      'Como el P/E, pero con el efectivo que de verdad le queda a la empresa en vez de la utilidad contable. Es la base de la tabla de sensibilidad (flujo de caja descontado) de los dashboards.',
  },
  fcf_yield: {
    name: 'Rentabilidad por FCF',
    short: 'Flujo de caja libre de 12 meses ÷ capitalización bursátil.',
    long: 'Es el inverso del P/FCF: qué porcentaje del precio genera la empresa en caja libre cada año.',
  },
  ev_ebit: {
    name: 'EV/EBIT',
    short: '(Capitalización + deuda neta) ÷ utilidad operacional de 12 meses.',
    long:
      'Compara el valor de toda la empresa, incluida su deuda, con lo que gana con su operación antes de intereses e impuestos. Sirve para comparar empresas con distinto nivel de deuda.',
  },
  growth: {
    name: 'Crecimiento de ingresos',
    short: 'Ingresos de los últimos 12 meses frente a los 12 meses anteriores.',
    long: 'Cuánto crecieron (o cayeron) las ventas en el último año, comparando periodos completos de 12 meses.',
  },
  operating_margin: {
    name: 'Margen operacional',
    short: 'Utilidad operacional ÷ ingresos, últimos 12 meses.',
    long: 'Qué parte de cada dólar vendido queda después de los costos y gastos de la operación, antes de intereses e impuestos.',
  },
  fcf_margin: {
    name: 'Margen de FCF',
    short: 'Flujo de caja libre ÷ ingresos, últimos 12 meses.',
    long: 'Qué parte de cada dólar vendido termina como efectivo libre para los accionistas.',
  },
  roe: {
    name: 'ROE (rentabilidad sobre el patrimonio)',
    short: 'Utilidad neta de 12 meses ÷ patrimonio promedio.',
    long:
      'Cuánto gana la empresa por cada dólar de los accionistas. Las empresas que recompran muchas acciones (como Apple) pueden tener un patrimonio muy pequeño y un ROE de más de 100%; en esos casos el ROIC es más útil.',
  },
  roic: {
    name: 'ROIC (rentabilidad sobre el capital invertido)',
    short: 'Utilidad operacional después de impuestos ÷ (patrimonio + deuda − caja).',
    long: 'Cuánto rinde todo el capital que la empresa usa en su negocio, venga de los accionistas o de los prestamistas.',
  },
  nd_ebitda: {
    name: 'Deuda neta / EBITDA',
    short: '(Deuda financiera − caja e inversiones) ÷ EBITDA de 12 meses.',
    long:
      'Cuántos años de EBITDA necesitaría la empresa para pagar su deuda neta. Un valor negativo quiere decir que tiene más caja que deuda. No aplica para bancos.',
  },
  fcf: {
    name: 'Flujo de caja libre (FCF)',
    short: 'Flujo de caja de la operación − CAPEX (compras de propiedad, planta y equipo).',
    long: 'El efectivo que le queda a la empresa después de operar e invertir en sus activos: lo que puede usar en dividendos, recompras o pagar deuda.',
  },
  ttm: {
    name: '12 meses (TTM)',
    short: 'Suma de los últimos cuatro trimestres.',
    long: 'En inglés trailing twelve months. Si el trimestre cierra el año fiscal, es la cifra anual del 10-K.',
  },
};

// Explicacion de cada metrica: el texto corto va en el tooltip, el largo en la seccion del glosario
export type Term = { name: string; short: string; long: string };

export const GLOSARIO: Record<string, Term> = {
  pe: {
    name: 'P/E (precio / utilidad)',
    short: 'Precio de la acción ÷ utilidad por acción de los últimos 12 meses.',
    long:
      'Cuántos pesos pagas hoy por cada peso que la empresa ganó en el último año. Un P/E de 8x quiere decir que, si la utilidad se mantuviera igual, tardarías 8 años en "recuperar" el precio con las ganancias. Más bajo suele ser más barato, pero también puede ser señal de que el mercado espera que la utilidad caiga. En español también se escribe P/U o PER. No se calcula cuando la utilidad es negativa.',
  },
  pb: {
    name: 'P/B (precio / valor en libros)',
    short: 'Precio de la acción ÷ patrimonio contable por acción.',
    long:
      'Compara lo que vale la empresa en bolsa con lo que vale su patrimonio en los libros contables. 1x significa que el mercado la paga exactamente a su valor en libros; menos de 1x, que cotiza por debajo. Es el múltiplo más usado para bancos y holdings, cuyos activos son sobre todo financieros. En español también se escribe P/VL.',
  },
  dy: {
    name: 'Dividendo (rentabilidad por dividendo)',
    short: 'Dividendos pagados en los últimos 12 meses ÷ capitalización bursátil.',
    long:
      'El porcentaje del precio que la empresa te devolvió en efectivo durante el último año. Un 8% quiere decir que por cada $100 invertidos recibiste $8 en dividendos. Se calcula con los dividendos efectivamente pagados según el flujo de caja.',
  },
  market_cap: {
    name: 'Capitalización bursátil',
    short: 'Precio de la acción × número de acciones en circulación.',
    long: 'Lo que vale la empresa completa según el precio de la bolsa. Sirve para comparar tamaños entre empresas.',
  },
  roe: {
    name: 'ROE (rentabilidad sobre el patrimonio)',
    short: 'Utilidad neta de los últimos 12 meses ÷ patrimonio promedio.',
    long:
      'Cuánto gana la empresa por cada peso que han puesto los accionistas. Un ROE de 15% significa $15 de utilidad al año por cada $100 de patrimonio. Para comparar, es útil tenerlo por encima de la tasa que pagan los CDT o los TES.',
  },
  net_margin: {
    name: 'Margen neto',
    short: 'Utilidad neta ÷ ingresos, ambos de los últimos 12 meses.',
    long:
      'Qué parte de cada peso vendido queda como utilidad para los accionistas después de costos, gastos, intereses e impuestos. En holdings puede superar el 100% porque buena parte de su utilidad viene de las empresas en las que invierten y no de sus ventas.',
  },
  growth: {
    name: 'Crecimiento de ingresos',
    short: 'Ingresos de los últimos 12 meses frente a los 12 meses anteriores.',
    long:
      'Cuánto crecieron (o cayeron) las ventas en el último año. Se comparan periodos de 12 meses completos para que no influya la estacionalidad de un solo trimestre.',
  },
  nd_ebitda: {
    name: 'Deuda neta / EBITDA',
    short: '(Deuda financiera − caja) ÷ EBITDA de los últimos 12 meses.',
    long:
      'Cuántos años de EBITDA (utilidad operativa antes de depreciaciones y amortizaciones) necesitaría la empresa para pagar su deuda neta. Por debajo de 3x se considera, en general, manejable. Un valor negativo quiere decir que tiene más caja que deuda. "n.s." (no significativo) aparece cuando el EBITDA es casi cero y el número no se puede interpretar. No aplica para bancos, cuya deuda es su materia prima.',
  },
  fcf: {
    name: 'Flujo de caja libre (FCF)',
    short: 'Flujo de caja de la operación − inversiones en activos fijos.',
    long:
      'El efectivo que le queda a la empresa después de operar e invertir en mantener y ampliar sus activos. Es el dinero disponible para pagar dividendos, recomprar acciones o reducir deuda.',
  },
  ttm: {
    name: '12 meses (TTM)',
    short: 'Suma de los últimos cuatro trimestres.',
    long:
      'En inglés trailing twelve months. Sumar cuatro trimestres evita que un trimestre muy bueno o muy malo distorsione la foto del año.',
  },
};

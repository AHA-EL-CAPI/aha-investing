# Auditoría de huecos en los estados financieros (5 nov 2026)

Revisé las 28 empresas de /bvc (desde 2015) y las 23 de /eeuu (toda la historia, también antes de 2015).
Toda cifra que no viene del XBRL oficial queda marcada en la base con su fuente (columna `concept` de `canonical`,
también en la hoja "cuentas" del Excel) y se vuelve a calcular cada noche, así que no se pierde con la actualización diaria.

## Colombia (/bvc)

**Qué se completó**

| Fuente | Cifras | Marca en la base |
|---|---|---|
| PDF oficial del mismo informe en SIMEV (cuando el XBRL no trae la cuenta) | 460 cifras en 167 informes | `pdf: <renglón del PDF>` |
| Informe anual de Fabricato 2021 (fabricato.com) | 33 cuentas de dic-2021 | `complemento: …` |
| Informe de resultados 2T2016 de Grupo Aval (6-K en la SEC) | balance de jun-2015 y jun-2016 | `complemento: …` |

Lo más visible:
- **Grupo Argos** dic-2025 y mar-2026: el XBRL de SIMEV está dañado (uno no cargó y el otro viene fechado sep-2025); ahora salen del PDF.
- **Ecopetrol** 2018: flujo de caja de los dos primeros trimestres y depreciación de 2018 (antes salía 16.800 millones en vez de 2,07 billones).
- **Celsia Colombia** flujo de caja operativo 2024 y 2026; **ETB** flujos de 2016-2017 (antes en cero); **Éxito**, **Aval**, **Promotora de Café** y **Banco de Bogotá** 2015; intereses de **GEB** y **Enka**; cartera y deuda de **Grupo Bolívar** 2015.
- **Fabricato** dic-2021: ingresos, utilidad, balance y flujo de caja del año (estados individuales: el informe 2021 no trae consolidados y en Fabricato difieren menos de 0,2%).

Reglas para no meter datos malos: la línea del PDF que corresponde a cada cuenta se aprende de la historia del mismo emisor (debe coincidir con el XBRL en al menos 3 trimestres y en el 80% de los que tienen ambos), se descartan cifras que se salen 20 veces de la escala de la empresa, un renglón de inversión o financiación nunca se toma como flujo operativo, y nunca se reemplaza un dato que ya trae el XBRL.

**Lo que no se pudo completar (no existe en ninguna fuente pública que encontré)**

- **Grupos financieros que cerraban por semestre hasta 2016-2018** (Aval, Corficolombiana, Banco de Bogotá, Promigas): SIMEV no tiene los cierres de junio y sus estados de dic/sep son del semestre, no del año corrido, así que no se puede sacar el trimestre. Promigas solo publica informes trimestrales desde 2019 en su página. De Aval sí tomé el balance de junio de su informe a la SEC; los resultados de ese informe están en NIIF plena y difieren más de 30% de la NIIF colombiana en la utilidad, así que no los mezclé.
- **PEI 2015-2019**: también cerraba por semestre y su XBRL rotula el semestre como trimestre. Por eso el PDF solo completa saldos de balance en esos años, no resultados (el "cuarto trimestre" que saldría sería el segundo semestre).
- **Fabricato jun-2021 a mar-2022**: no están en SIMEV ni en su página (solo publica el informe anual). Quedó el cierre de 2021.
- **Celsia Colombia 2025** flujo operativo: el rótulo del PDF cambió otra vez y no coincide con suficientes trimestres para aprenderlo sin riesgo.
- Huecos sueltos: Banco de Bogotá balance mar-2022, Cibest balance 2024-2025 (fusión con Bancolombia), BVC ingresos dic-2020, BAC jun-2021, Éxito ingresos dic-2015, Promotora de Café balance 2016-2017.

## Estados Unidos (/eeuu)

**Qué se completó**

- **Disney y Alphabet**: cambiaron de CIK (2018 y 2015). Ahora se une la historia del CIK anterior (config/cik_anteriores.csv), así que ambas tienen datos desde 2007.
- **American Express** 2008-2015: ingresos derivados (ingresos no financieros + intereses recibidos − intereses pagados), como los presenta su estado de resultados.
- **Visa**: acciones diluidas y UPA desde 2014 (solo las reporta por clase de acción; se usa la UPA de la clase A, que en Visa es la convertida). Antes no tenía P/U ni FCF por acción.
- **Alphabet** acciones de sep-2015; **Nike y Microsoft** acciones de 2007-2009 y **Tesla** jun-2013.
- **NVIDIA**: capex del cuarto trimestre de 2014 a 2021 y de tres trimestres de 2022 (usa un concepto propio que no viene en companyfacts).
- **Amazon** capex 2T2017 (ese trimestre cambió de concepto): año fiscal − los otros tres trimestres.
- **Múltiplos**: cuando varios trimestres se publicaron el mismo día (el primer XBRL de cada empresa en 2009-2010), el P/U y el P/FCF tomaban un trimestre al azar. Ahora toma siempre el más reciente. Ejemplo: Apple oct-2009 a abr-2010 mostraba P/U de 48 y ahora 21.

**Lo que queda**

- El primer trimestre de cada empresa y el 1S de 2008 no tienen flujo trimestral: el primer XBRL solo trae el acumulado de 6 meses (es estructural).
- **Visa** acciones 2008-2014, **NVIDIA** capex 2009-2013, **Tesla** 2010: solo están en el XBRL de cada informe y el pipeline baja esos informes desde 2016. Se puede ampliar a 2009 (una descarga única de unos 400 informes) si quieres.
- **Alphabet** acciones jun-2015: ese trimestre la clase C tuvo un pago especial y su UPA no sirve para derivar acciones.
- **Alibaba y Nu** reportan con 20-F (solo anual); los trimestres están en comunicados 6-K sin XBRL.

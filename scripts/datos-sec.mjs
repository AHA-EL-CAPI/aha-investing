// Baja los datos de /eeuu antes del build (y de `npm run dev`).
//
// Los JSON de las ~500 empresas de EE. UU. (pipeline sec-fundamentales) no se versionan en este repo: cambian cada
// noche con los precios y harian crecer el repo ~50 MB por dia. Viven en un repo de datos aparte que se reescribe sin
// historial; aqui solo esta el puntero src/data/sec/fuente.json ({repo, sha}) con el commit exacto de los datos, asi
// que cada despliegue usa siempre los mismos datos. Este script baja ese commit (un .tar.gz de GitHub) y deja los JSON
// en src/data/sec, que es donde los lee src/lib/sec.ts.
//
// Si los JSON ya estan y son de ese commit (src/data/sec/.sha), no hace nada. Si GitHub ya no tiene ese commit (el repo
// de datos se reescribe), usa el ultimo de main. Sin puntero (copia local con los JSON exportados a mano) no hace nada.
// Nunca hace fallar el build: si no puede bajar, avisa y sigue, y /eeuu muestra que no hay datos.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const DIR = path.join(process.cwd(), 'src', 'data', 'sec');
const FUENTE = path.join(DIR, 'fuente.json');
const MARCA = path.join(DIR, '.sha');

if (!fs.existsSync(FUENTE)) {
  console.log('datos SEC: sin src/data/sec/fuente.json; se usan los JSON que haya en la carpeta');
  process.exit(0);
}
const fuente = JSON.parse(fs.readFileSync(FUENTE, 'utf8'));
if (
  fs.existsSync(MARCA) &&
  fs.readFileSync(MARCA, 'utf8').trim() === fuente.sha &&
  fs.existsSync(path.join(DIR, 'index.json'))
) {
  console.log(`datos SEC: ya estan (${fuente.sha.slice(0, 7)})`);
  process.exit(0);
}

async function bajar(ref) {
  for (let intento = 1; intento <= 4; intento++) {
    try {
      const r = await fetch(`https://codeload.github.com/${fuente.repo}/tar.gz/${ref}`);
      if (r.status === 404) throw Object.assign(new Error(`GitHub no tiene ${ref}`), { final: true });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return Buffer.from(await r.arrayBuffer());
    } catch (e) {
      if (e.final || intento === 4) throw e;
      await new Promise((ok) => setTimeout(ok, 2000 * intento));
    }
  }
}

let gz;
let ref = fuente.sha;
try {
  try {
    gz = await bajar(fuente.sha);
  } catch (e) {
    console.warn(`datos SEC: ${e.message}; uso el ultimo commit de main`);
    ref = 'main';
    gz = await bajar('main');
  }
} catch (e) {
  // sin red o sin repo de datos: el despliegue sigue (BVC y el resto del sitio no dependen de esto) y /eeuu
  // muestra que no hay datos
  console.warn(`datos SEC: no se pudieron bajar (${e.message}); el build sigue sin datos de EE. UU.`);
  process.exit(0);
}

// .tar.gz de GitHub: una carpeta <repo>-<sha>/ con los JSON. Lector minimo de tar (cabeceras de 512 bytes).
const tar = zlib.gunzipSync(gz);
const archivos = [];
const texto = (b) => b.toString('utf8').replace(/\0[\s\S]*$/, '');
let largo = null;
for (let off = 0; off + 512 <= tar.length; ) {
  const h = tar.subarray(off, off + 512);
  if (h.every((b) => b === 0)) break;
  const prefijo = texto(h.subarray(345, 500));
  const nombre = (prefijo ? `${prefijo}/` : '') + texto(h.subarray(0, 100));
  const tam = parseInt(texto(h.subarray(124, 136)).trim() || '0', 8);
  const tipo = String.fromCharCode(h[156]);
  const cuerpo = tar.subarray(off + 512, off + 512 + tam);
  if (tipo === 'L') largo = texto(cuerpo);
  else if (tipo === '0' || tipo === '\0') {
    const base = path.basename(largo || nombre);
    largo = null;
    if (base.endsWith('.json') && base !== 'fuente.json') archivos.push([base, cuerpo]);
  }
  off += 512 + Math.ceil(tam / 512) * 512;
}
if (!archivos.some(([n]) => n === 'index.json')) {
  console.warn('datos SEC: el paquete no trae index.json; el build sigue sin datos de EE. UU.');
  process.exit(0);
}

for (const f of fs.readdirSync(DIR)) {
  if (f.endsWith('.json') && f !== 'fuente.json') fs.unlinkSync(path.join(DIR, f));
}
for (const [n, cuerpo] of archivos) fs.writeFileSync(path.join(DIR, n), cuerpo);
fs.writeFileSync(MARCA, ref === 'main' ? 'main' : fuente.sha);
console.log(`datos SEC: ${archivos.length} archivos de ${fuente.repo}@${ref.slice(0, 7)}`);

// Genera `components/sections/mapa/estados-geometria.ts`: la geometría SVG de
// las 32 entidades federativas para el mapa de la home, derivada del Marco
// Geoestadístico del INEGI (capa 00ent, Áreas Geoestadísticas Estatales),
// edición fijada en las constantes EDICION/UPC.
//
// El producto oficial es un zip de ~3 GB; este script extrae únicamente los
// cinco archivos de la capa estatal mediante peticiones HTTP con Range. El
// paquete integrado anidado puede venir almacenado sin recompresión (2024:
// se lee el zip interno directamente por rangos) o deflated (2025: se infla
// el flujo por tramos y se corta en cuanto aparecen los cinco archivos, sin
// descargar el paquete completo). Los archivos se cachean en el directorio
// temporal del sistema; borrar ese directorio fuerza una descarga nueva.
//
// Pipeline (mapshaper y svgo pineados, ejecutados vía npx; no son
// dependencias del proyecto):
//   1. filter-islands min-area=50km2 — limpieza de islotes sub-pixel.
//   2. erase de dos rectángulos: Isla Guadalupe y archipiélago de
//      Revillagigedo. Es un recorte de ENCUADRE cartográfico (a cientos de
//      km del litoral, comprimen el territorio continental en el lienzo),
//      no de pertenencia: ambos son territorio mexicano (BC y Colima).
//   3. clean — unifica las fronteras duplicadas del shapefile fuente en
//      arcos topológicos compartidos; garantiza que la simplificación
//      trate cada frontera interior una sola vez (sin huecos ni traslapes).
//   4. simplify visvalingam weighted keep-shapes interval=2500 (metros).
//   5. Exportación SVG (viewBox de 1000 de ancho, precisión 0.1) + svgo.
//   6. Emisión del módulo TS con clave, NOMGEO literal del DBF (ISO-8859-1,
//      según el .cpg del producto), nombre corto convencional y path.
//
// La capa viene en la proyección nativa del producto: Cónica Conforme de
// Lambert para México ITRF2008 (EPSG:6372). No se reproyecta.
//
// Ejecución manual: npx tsx scripts/build-mapa-estados.ts

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createInflateRaw, gzipSync, inflateRawSync } from "node:zlib";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "components", "sections", "mapa", "estados-geometria.ts");

const EDICION = "2025";
const UPC = "794551163061";
const MG_URL = `https://www.inegi.org.mx/contenidos/productos/prod_serv/contenidos/espanol/bvinegi/productos/geografia/marcogeo/${UPC}_s.zip`;
const PAQUETE_INTEGRADO = `mg_${EDICION}_integrado.zip`;
const CAPA = "conjunto_de_datos/00ent";
const EXTS = ["shp", "shx", "dbf", "prj", "cpg"] as const;

const MAPSHAPER = "mapshaper@0.7.47";
const SVGO = "svgo@4.0.2";
const SIMPLIFY_INTERVAL_M = 2500;
const MIN_ISLA_KM2 = 50;
// Rectángulos de encuadre en coordenadas EPSG:6372 (metros), derivados de los
// bounds medidos de los anillos correspondientes en la propia capa.
const ERASE_GUADALUPE = "900000,1950000,935000,2000000";
const ERASE_REVILLAGIGEDO = "1100000,700000,1650000,900000";

// Nombre corto convencional por clave, decisión editorial del observatorio.
// El nombre oficial (NOMGEO) se extrae literal del DBF y ambos se emiten al
// módulo para que la correspondencia completa quede revisable.
const NOMBRE_CORTO: Record<string, string> = {
  "01": "Aguascalientes",
  "02": "Baja California",
  "03": "Baja California Sur",
  "04": "Campeche",
  "05": "Coahuila",
  "06": "Colima",
  "07": "Chiapas",
  "08": "Chihuahua",
  "09": "Ciudad de México",
  "10": "Durango",
  "11": "Guanajuato",
  "12": "Guerrero",
  "13": "Hidalgo",
  "14": "Jalisco",
  "15": "Estado de México",
  "16": "Michoacán",
  "17": "Morelos",
  "18": "Nayarit",
  "19": "Nuevo León",
  "20": "Oaxaca",
  "21": "Puebla",
  "22": "Querétaro",
  "23": "Quintana Roo",
  "24": "San Luis Potosí",
  "25": "Sinaloa",
  "26": "Sonora",
  "27": "Tabasco",
  "28": "Tamaulipas",
  "29": "Tlaxcala",
  "30": "Veracruz",
  "31": "Yucatán",
  "32": "Zacatecas",
};

// ---------------------------------------------------------------------------
// Lectura de zip remoto por rangos HTTP
// ---------------------------------------------------------------------------

async function fetchRange(start: number, end: number): Promise<Buffer> {
  for (let intento = 1; ; intento++) {
    try {
      const res = await fetch(MG_URL, {
        headers: { Range: `bytes=${start}-${end}` },
      });
      if (res.status !== 206 && res.status !== 200) {
        throw new Error(`HTTP ${res.status} pidiendo bytes ${start}-${end}`);
      }
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (intento >= 3) throw err;
      await new Promise((r) => setTimeout(r, 2000 * intento));
    }
  }
}

type EntradaZip = {
  nombre: string;
  metodo: number;
  tamanoComprimido: number;
  offsetHeaderLocal: number;
};

// Parsea el directorio central de un zip que ocupa los bytes
// [base, base+tamano) del recurso remoto.
async function leerDirectorioCentral(base: number, tamano: number): Promise<EntradaZip[]> {
  const colaLen = Math.min(tamano, 66 * 1024);
  const cola = await fetchRange(base + tamano - colaLen, base + tamano - 1);
  let eocd = -1;
  for (let i = cola.length - 22; i >= 0; i--) {
    if (cola.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("No se encontró el fin de directorio central del zip");
  let cdOffset: number = cola.readUInt32LE(eocd + 16);
  let cdSize: number = cola.readUInt32LE(eocd + 12);
  if (cdOffset === 0xffffffff || cdSize === 0xffffffff) {
    // Variante zip64: el localizador precede al EOCD.
    const locPos = eocd - 20;
    if (locPos < 0 || cola.readUInt32LE(locPos) !== 0x07064b50) {
      throw new Error("Zip64 sin localizador de EOCD64");
    }
    const eocd64Off = Number(cola.readBigUInt64LE(locPos + 8));
    const eocd64 = await fetchRange(base + eocd64Off, base + eocd64Off + 55);
    if (eocd64.readUInt32LE(0) !== 0x06064b50) throw new Error("EOCD64 inválido");
    cdSize = Number(eocd64.readBigUInt64LE(40));
    cdOffset = Number(eocd64.readBigUInt64LE(48));
  }
  const cd = await fetchRange(base + cdOffset, base + cdOffset + cdSize - 1);
  const entradas: EntradaZip[] = [];
  let p = 0;
  while (p + 46 <= cd.length && cd.readUInt32LE(p) === 0x02014b50) {
    const metodo = cd.readUInt16LE(p + 10);
    let tamanoComprimido: number = cd.readUInt32LE(p + 20);
    const nombreLen = cd.readUInt16LE(p + 28);
    const extraLen = cd.readUInt16LE(p + 30);
    const comentLen = cd.readUInt16LE(p + 32);
    let offsetHeaderLocal: number = cd.readUInt32LE(p + 42);
    const nombre = cd.toString("latin1", p + 46, p + 46 + nombreLen);
    // Campos de 64 bits en el extra 0x0001, si el valor de 32 bits desborda.
    let q = p + 46 + nombreLen;
    const extraFin = q + extraLen;
    while (q + 4 <= extraFin) {
      const id = cd.readUInt16LE(q);
      const len = cd.readUInt16LE(q + 2);
      if (id === 0x0001) {
        let r = q + 4;
        const leer64 = () => {
          const v = Number(cd.readBigUInt64LE(r));
          r += 8;
          return v;
        };
        if (cd.readUInt32LE(p + 24) === 0xffffffff) leer64(); // tamaño original
        if (tamanoComprimido === 0xffffffff) tamanoComprimido = leer64();
        if (offsetHeaderLocal === 0xffffffff) offsetHeaderLocal = leer64();
      }
      q += 4 + len;
    }
    entradas.push({ nombre, metodo, tamanoComprimido, offsetHeaderLocal });
    p += 46 + nombreLen + extraLen + comentLen;
  }
  return entradas;
}

async function inicioDatos(base: number, entrada: EntradaZip): Promise<number> {
  const abs = base + entrada.offsetHeaderLocal;
  const h = await fetchRange(abs, abs + 29);
  if (h.readUInt32LE(0) !== 0x04034b50) throw new Error(`Header local inválido: ${entrada.nombre}`);
  return abs + 30 + h.readUInt16LE(26) + h.readUInt16LE(28);
}

async function descargarCapa(destino: string): Promise<void> {
  if (EXTS.every((ext) => existsSync(path.join(destino, `00ent.${ext}`)))) {
    console.log(`[mapa] capa 00ent ya en caché: ${destino}`);
    return;
  }
  mkdirSync(destino, { recursive: true });
  const head = await fetch(MG_URL, { method: "HEAD" });
  const total = Number(head.headers.get("content-length"));
  if (!total) throw new Error("No se pudo leer Content-Length del producto INEGI");
  console.log(`[mapa] producto remoto: ${(total / 1e9).toFixed(2)} GB — extracción por rangos`);

  const exteriores = await leerDirectorioCentral(0, total);
  const paquete = exteriores.find((e) => e.nombre === PAQUETE_INTEGRADO);
  if (!paquete) throw new Error(`No aparece ${PAQUETE_INTEGRADO} en el zip exterior`);
  const inicio = await inicioDatos(0, paquete);
  if (paquete.metodo === 0) {
    await extraeAlmacenado(destino, inicio, paquete.tamanoComprimido);
  } else if (paquete.metodo === 8) {
    await extraeDeflated(destino, inicio, paquete.tamanoComprimido);
  } else {
    throw new Error(`Método de compresión ${paquete.metodo} no contemplado en ${PAQUETE_INTEGRADO}`);
  }
}

// Paquete integrado almacenado sin recompresión (edición 2024): el zip
// interno se lee directamente por rangos, entrada por entrada.
async function extraeAlmacenado(destino: string, base: number, tamano: number): Promise<void> {
  const internas = await leerDirectorioCentral(base, tamano);
  for (const ext of EXTS) {
    const nombre = `${CAPA}.${ext}`;
    const entrada = internas.find((e) => e.nombre === nombre);
    if (!entrada) throw new Error(`No aparece ${nombre} en ${PAQUETE_INTEGRADO}`);
    const inicio = await inicioDatos(base, entrada);
    const crudo = await fetchRange(inicio, inicio + entrada.tamanoComprimido - 1);
    const datos = entrada.metodo === 8 ? inflateRawSync(crudo) : crudo;
    writeFileSync(path.join(destino, `00ent.${ext}`), datos);
    console.log(`[mapa] extraído ${nombre} (${datos.length} bytes)`);
  }
}

// Paquete integrado deflated (edición 2025): el flujo se infla por tramos y
// se parsean los headers locales del zip interno sobre la marcha; la
// descarga se corta en cuanto aparecen los cinco archivos de la capa.
async function extraeDeflated(destino: string, base: number, tamano: number): Promise<void> {
  const objetivos = new Set(EXTS.map((ext) => `${CAPA}.${ext}`));
  const inflador = createInflateRaw();
  let buf = Buffer.alloc(0);
  inflador.on("data", (d: Buffer) => {
    buf = Buffer.concat([buf, d]);
  });

  let transferidos = 0;
  let encontrados = 0;

  // Devuelve true al llegar al directorio central (fin de los miembros).
  const procesa = (): boolean => {
    for (;;) {
      if (buf.length < 30) return false;
      const sig = buf.readUInt32LE(0);
      if (sig === 0x02014b50 || sig === 0x06054b50) return true;
      if (sig !== 0x04034b50) {
        throw new Error(`Firma inesperada en el zip interno: 0x${sig.toString(16)}`);
      }
      const flags = buf.readUInt16LE(6);
      const metodo = buf.readUInt16LE(8);
      const csize = buf.readUInt32LE(18);
      const nlen = buf.readUInt16LE(26);
      const elen = buf.readUInt16LE(28);
      if (flags & 0x08) {
        throw new Error("El zip interno usa data descriptors; ajustar el extractor");
      }
      const total = 30 + nlen + elen + csize;
      if (buf.length < total) return false;
      const nombre = buf.toString("latin1", 30, 30 + nlen);
      if (objetivos.has(nombre)) {
        let datos: Buffer = buf.subarray(30 + nlen + elen, total);
        if (metodo === 8) datos = inflateRawSync(datos);
        else if (metodo !== 0) throw new Error(`Método ${metodo} en ${nombre}`);
        writeFileSync(path.join(destino, path.basename(nombre)), datos);
        console.log(
          `[mapa] extraído ${nombre} (${datos.length} bytes) — ${Math.round(transferidos / 1e6)} MB transferidos`,
        );
        encontrados++;
      }
      buf = buf.subarray(total);
    }
  };

  const CHUNK = 4 * 1024 * 1024;
  let offset = base;
  const fin = base + tamano;
  while (offset < fin && encontrados < objetivos.size) {
    const tramo = await fetchRange(offset, Math.min(offset + CHUNK, fin) - 1);
    offset += tramo.length;
    transferidos += tramo.length;
    await new Promise<void>((res, rej) => inflador.write(tramo, (err) => (err ? rej(err) : res())));
    if (procesa()) break;
  }
  inflador.destroy();
  if (encontrados < objetivos.size) {
    throw new Error(`Solo aparecieron ${encontrados} de ${objetivos.size} archivos 00ent en ${PAQUETE_INTEGRADO}`);
  }
}

// ---------------------------------------------------------------------------
// Pipeline cartográfico
// ---------------------------------------------------------------------------

function npx(args: string[]): string {
  // stderr se fusiona a stdout: mapshaper reporta sus estadísticas ahí.
  const res = spawnSync("npx", ["-y", ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
  if (res.status !== 0) {
    throw new Error(`npx ${args[0]} falló:\n${res.stdout}\n${res.stderr}`);
  }
  return `${res.stdout}\n${res.stderr}`;
}

function main(): Promise<void> {
  return (async () => {
    const cacheDir = path.join(os.tmpdir(), `mg${EDICION}-00ent`);
    await descargarCapa(cacheDir);
    const shp = path.join(cacheDir, "00ent.shp");

    const shaShp = createHash("sha256").update(readFileSync(shp)).digest("hex");
    const shaDbf = createHash("sha256")
      .update(readFileSync(path.join(cacheDir, "00ent.dbf")))
      .digest("hex");

    const trabajo = path.join(os.tmpdir(), `mg${EDICION}-mapa-build`);
    mkdirSync(trabajo, { recursive: true });
    const svgCrudo = path.join(trabajo, "mapa-crudo.svg");
    const svgFinal = path.join(trabajo, "mapa-final.svg");
    const csv = path.join(trabajo, "nomgeo.csv");

    console.log("[mapa] mapshaper: filtro de islas, encuadre, topología y simplificación…");
    const salida = npx([
      MAPSHAPER,
      shp,
      "encoding=latin1",
      "-filter-islands",
      `min-area=${MIN_ISLA_KM2}km2`,
      "-erase",
      `bbox=${ERASE_GUADALUPE}`,
      "-erase",
      `bbox=${ERASE_REVILLAGIGEDO}`,
      "-clean",
      "-simplify",
      "visvalingam",
      "weighted",
      "keep-shapes",
      `interval=${SIMPLIFY_INTERVAL_M}`,
      "stats",
      "-o",
      "format=svg",
      "id-field=CVE_ENT",
      "width=1000",
      "precision=0.1",
      svgCrudo,
    ]);
    process.stdout.write(salida);
    const removidos = Number(salida.match(/Removed vertices: ([\d,]+)/)?.[1]?.replace(/,/g, "") ?? NaN);
    const totales = Number(salida.match(/of ([\d,]+) unique coordinate locations/)?.[1]?.replace(/,/g, "") ?? NaN);
    const statsLinea =
      Number.isFinite(removidos) && Number.isFinite(totales)
        ? `Vértices únicos: ${totales.toLocaleString("en-US")} → ${(totales - removidos).toLocaleString("en-US")} (${((removidos / totales) * 100).toFixed(1)} % eliminados)`
        : "";
    const reparadas = salida.match(/Repaired [^\n]*intersection[^\n]*/)?.[0]?.trim() ?? "";

    npx([
      MAPSHAPER,
      shp,
      "encoding=latin1",
      "-filter-fields",
      "CVE_ENT,NOMGEO",
      "-o",
      "format=csv",
      csv,
    ]);

    const svgoCfg = path.join(trabajo, "svgo.config.mjs");
    // cleanupIds desactivado: los ids de los paths son las claves de entidad.
    writeFileSync(
      svgoCfg,
      "export default { plugins: [{ name: 'preset-default', params: { overrides: { cleanupIds: false, collapseGroups: false } } }] };\n",
    );
    npx([SVGO, "--config", svgoCfg, "-i", svgCrudo, "-o", svgFinal]);

    // ------------------------------------------------------------------
    // Emisión del módulo
    // ------------------------------------------------------------------
    const svg = readFileSync(svgFinal, "utf8");
    const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
    if (!viewBox) throw new Error("El SVG final no trae viewBox");

    // svgo recorta los ceros iniciales de los ids numéricos ("01" → "1"),
    // pero preserva el orden de los elementos. La asociación clave→path se
    // hace por orden de documento: ids del SVG crudo de mapshaper + datos de
    // path del SVG optimizado, con verificación de 32 en ambos lados.
    const crudo = readFileSync(svgCrudo, "utf8");
    const idsCrudo = Array.from(crudo.matchAll(/<path\b[^>]*>/g), (m) => {
      const id = m[0].match(/\bid="([^"]+)"/)?.[1];
      if (!id) throw new Error("Path sin id en el SVG de mapshaper");
      return id;
    });
    const dFinal = Array.from(svg.matchAll(/<path\b[^>]*>/g), (m) => {
      const d = m[0].match(/\bd="([^"]+)"/)?.[1];
      if (!d) throw new Error("Path sin datos en el SVG optimizado");
      return d;
    });
    if (idsCrudo.length !== dFinal.length) {
      throw new Error(`Desfase de paths: ${idsCrudo.length} crudos vs ${dFinal.length} optimizados`);
    }
    const paths = new Map<string, string>(idsCrudo.map((id, i) => [id, dFinal[i]]));

    const nombres = new Map<string, string>();
    for (const linea of readFileSync(csv, "utf8").trim().split("\n").slice(1)) {
      const coma = linea.indexOf(",");
      nombres.set(linea.slice(0, coma), linea.slice(coma + 1));
    }

    const claves = Array.from({ length: 32 }, (_, i) => String(i + 1).padStart(2, "0"));
    for (const clave of claves) {
      if (!paths.has(clave)) throw new Error(`Falta el path de la entidad ${clave}`);
      if (!nombres.has(clave)) throw new Error(`Falta NOMGEO de la entidad ${clave}`);
      if (!NOMBRE_CORTO[clave]) throw new Error(`Falta nombre corto de la entidad ${clave}`);
    }
    if (paths.size !== 32) throw new Error(`El SVG trae ${paths.size} paths; se esperaban 32`);

    const entradas = claves
      .map((clave) => {
        const oficial = nombres.get(clave)!;
        const corto = NOMBRE_CORTO[clave];
        return `  {\n    clave: "${clave}",\n    nombreOficial: ${JSON.stringify(oficial)},\n    nombreCorto: ${JSON.stringify(corto)},\n    d: ${JSON.stringify(paths.get(clave)!)},\n  },`;
      })
      .join("\n");

    const ahora = new Date();
    const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;
    const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;

    const modulo = `// Geometría de las 32 entidades federativas para el mapa de la home.
// ARCHIVO GENERADO por scripts/build-mapa-estados.ts — no editar a mano.
//
// Fuente: INEGI, Marco Geoestadístico ${EDICION} (UPC ${UPC}), paquete
// ${PAQUETE_INTEGRADO}, capa 00ent (Áreas Geoestadísticas Estatales),
// descargada de inegi.org.mx. Uso conforme a los Términos de Libre Uso
// de la Información del INEGI; cita: «Fuente: INEGI. Marco Geoestadístico
// ${EDICION}». SHA-256 de la fuente — 00ent.shp: ${shaShp.slice(0, 16)}…,
// 00ent.dbf: ${shaDbf.slice(0, 16)}….
//
// Proyección: Cónica Conforme de Lambert para México ITRF2008 (EPSG:6372),
// la nativa del producto; sin reproyección.
//
// Procesamiento (${MAPSHAPER} + ${SVGO}): islas menores a ${MIN_ISLA_KM2} km²
// eliminadas (limpieza sub-pixel); Isla Guadalupe y el archipiélago de
// Revillagigedo fuera del lienzo por ENCUADRE cartográfico —no de
// pertenencia: son territorio mexicano (BC y Colima)—; fronteras unificadas
// en topología compartida y simplificación Visvalingam ponderada
// (keep-shapes, tolerancia ${SIMPLIFY_INTERVAL_M} m).
// ${statsLinea}${reparadas ? `; ${reparadas}` : ""}.
// Coordenadas en viewBox ${viewBox}, precisión 0.1.
//
// nombreOficial: NOMGEO literal del DBF fuente (ISO-8859-1).
// nombreCorto: forma convencional, decisión editorial del observatorio.
// Generado: ${hoy}.

export type ClaveEntidad =
  ${claves
    .reduce<string[]>((filas, c, i) => {
      const fila = Math.floor(i / 8);
      filas[fila] = (filas[fila] ?? "") + `| "${c}" `;
      return filas;
    }, [])
    .map((f) => f.trim())
    .join("\n  ")};

export interface EstadoGeometria {
  clave: ClaveEntidad;
  nombreOficial: string;
  nombreCorto: string;
  d: string;
}

export const MAPA_VIEWBOX = "${viewBox}";

export const ESTADOS: readonly EstadoGeometria[] = [
${entradas}
];
`;

    mkdirSync(path.dirname(OUT), { recursive: true });
    writeFileSync(OUT, modulo);
    const gz = gzipSync(Buffer.from(modulo)).length;
    console.log(
      `[mapa] escrito ${path.relative(ROOT, OUT)} — ${kb(Buffer.byteLength(modulo))} (${kb(gz)} gzip); svg optimizado: ${kb(svg.length)}`,
    );
  })();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

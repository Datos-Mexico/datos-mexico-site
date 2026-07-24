// Genera `components/sections/mapa/indicadores-datos.ts`: los indicadores
// estatales de la coropleta de la home, extraídos programáticamente de sus
// fuentes oficiales. Cero valores tecleados: si una fuente cambia de forma,
// el script aborta antes que degradar a transcripción manual.
//
// Indicadores y fuentes (fichas validadas por dirección):
//   1. informalidad     TIL1 ENOE, API PxWeb de tabulados INEGI (export xlsx).
//   2. pobreza-laboral  INEGI "Pobreza Laboral" (metodología CONEVAL),
//                       tabulado pl_*.xlsx, Cuadro 9.
//   3. empleo-formal    IMSS Datos Abiertos, CSV mensual ASG (~400 MB) en
//                       streaming, agregado `ta` por entidad, normalizado a
//                       puestos por cada 100 personas de 15+ (CONAPO).
//   4. pib              PIBE base 2018, zip de datos abiertos, bloque de
//                       pesos corrientes, per cápita (población CONAPO 2024).
//   5. poblacion        CONAPO, proyecciones 2020-2070, mitad de 2026.
//   6. ingreso          Mismo tabulado PL, Cuadro 5, columna deflactada con
//                       INPC (pesos constantes del 1T 2020).
//
// Verificaciones duras antes de emitir: 32/32 entidades por indicador,
// agregado IMSS = total nacional del propio CSV, y cruce de cada valor
// nacional contra la cifra publicada en el boletín/comunicado oficial
// correspondiente (tolerancia solo de redondeo).
//
// TLS de CONAPO: el servidor entrega la cadena incompleta; se valida con la
// cadena de CA pública de GoDaddy (raíz + intermedia G2) incluida en
// scripts/certs/conapo-ca-chain.pem — sin desactivar la verificación.
//
// Quirks incorporados: inegi.org.mx responde soft-404 (HTTP 200 con HTML)
// ante rutas inexistentes — se valida content-type, no el código; el nombre
// del tabulado PL cambia cada trimestre — se descubre vía la API de descarga
// masiva; el CSV del IMSS es pipe-delimited en latin-1.
//
// Ejecución manual: npx tsx scripts/build-mapa-indicadores.ts

import { createHash } from "node:crypto";
import { createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import https from "node:https";
import os from "node:os";
import path from "node:path";
import { inflateRawSync, gzipSync } from "node:zlib";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "components", "sections", "mapa", "indicadores-datos.ts");
const CACHE = path.join(os.tmpdir(), "mapa-indicadores-cache");
const CONAPO_CA = path.join(__dirname, "certs", "conapo-ca-chain.pem");

// ---------------------------------------------------------------------------
// Fuentes
// ---------------------------------------------------------------------------

const URL_PXWEB_EXPORT = "https://www.inegi.org.mx/app/api/tabulados/pxwebv2/api/export";
const PXWEB_MATRIZ = "BISE/BISE_O3vRvROl_240322084032"; // indicadores estratégicos ENOE
const PXWEB_TIL1 = "1000236"; // "10.9. Tasa de informalidad laboral (TIL 1)"

const URL_PL_DESCUBRIMIENTO =
  "https://www.inegi.org.mx/app/api/descarga/componente/descargamasiva/lista/archivoscompaginacion?tema=0&subtema=0&areaGeografica=0&proyecto=0&anio=0&tipodocto=5&agrupacion=VG9kYXM%3D&idBiinegi=3429&desde=1&hasta=60&textoBuscar=&ordenar=orden&ingles=0&datosAbiertos=0&orden=";
const URL_PL_BASE = "https://www.inegi.org.mx";

const URL_IMSS_CSV = "http://datos.imss.gob.mx/sites/default/files/asg-2026-06-30.csv";
const PERIODO_IMSS = "jun 2026";

const URL_PIBE_ZIP =
  "https://www.inegi.org.mx/contenidos/programas/pibent/2018/datosabiertos/conjunto_de_datos_pibe_csv.zip";
const PIBE_ANIO = "2024";

// SESNSP/CNI — RNID, serie estatal 2015-2025 (share-links estables de
// SharePoint; el nombre del archivo interno cambia por corte mensual, la
// ruta real se resuelve por redirect en cada corrida).
const URL_SESNSP_VICTIMAS =
  "https://sspcgob-my.sharepoint.com/:u:/g/personal/cni_sspc_gob_mx/IQAjMphIBZwaQZy25I_oN-HWAaJZJFxQWE1y2k3seT0lj74?e=6FGvmI";
const URL_SESNSP_CARPETAS =
  "https://sspcgob-my.sharepoint.com/:u:/g/personal/cni_sspc_gob_mx/IQCImg0CgaACTJdHIpZ_yZKpAYKWg8wsEgtzU0nN3o-GVKU?e=dqWCtz";
// Año RNID de la vista de seguridad: homicidios, mujeres asesinadas y robo
// de coches usan el mismo año completo del registro.
const RNID_ANIO = "2025";

const URL_ENVIPE_XLSX =
  "https://www.inegi.org.mx/contenidos/programas/envipe/2025/tabulados/V_percepcion_seguridad_2025_est.xlsx";
const ENVIPE_CUADRO = "5.13"; // percepción sobre la seguridad en la entidad federativa

// ENVIPE, sección I "Nivel de victimización y delincuencia" (mismo dominio y
// patrón de nombre que el tabulado de percepción; refresh conjunto ~10-sep).
const URL_ENVIPE_VICT_XLSX =
  "https://www.inegi.org.mx/contenidos/programas/envipe/2025/tabulados/I_nivel_victimizacion_2025_est.xlsx";
const ENVIPE_PREVALENCIA_CUADRO = "1.1"; // tasa de prevalencia delictiva por entidad (residencia)
const ENVIPE_TOP_DELITOS_CUADRO = "1.13"; // incidencia nacional: "los cinco delitos más frecuentes"
// La frase humana de víctimas de delito afirma que fraude, extorsión y robo
// o asalto en calle o transporte público son los delitos más comunes. Ese
// enunciado queda anclado al bloque nacional del cuadro 1.13: si el top-3
// cambia en un refresh, el generador aborta para forzar revisión del copy.
const ENVIPE_TOP3_ESPERADO = ["Fraude", "Robo o asalto en calle o transporte público", "Extorsión"];

const PXWEB_TD = "1000229"; // "10.2. Tasa de desocupación"

// Grado promedio de escolaridad 15+ (Censo 2020) vía API BISE; el token es
// personal y viaja SOLO por la variable de entorno INEGI_TOKEN (registro
// gratuito en inegi.org.mx/servicios/api_indicadores.html). Jamás se
// escribe al repositorio.
const BISE_ESCOLARIDAD = "1005000038";

const URL_CONAPO_CSV =
  "https://conapo.segob.gob.mx/work/models/CONAPO/Datos_Abiertos/pry23/00_Pob_Mitad_1950_2070.csv";

// Anclas de validación: cifras nacionales PUBLICADAS en el boletín o
// comunicado oficial de cada fuente (no son datos del mapa; son asserts).
// Si el cruce falla más allá del redondeo, el script aborta.
const ANCLAS = {
  informalidadNacional: 54.8, // boletín ENOE 1T 2026 (enoe2026_05.pdf)
  pobrezaNacional: 30.7, // boletín PL 1T 2026 (pl2026_05.pdf)
  imssTotalNacional: 22_779_704, // comunicado IMSS 362/2026, junio 2026
  pibeNacionalMdp: 33_582_899.273, // PIBE 2024 corrientes, datos abiertos 02-jul-2026
  poblacionNacional2026: 134_407_258, // CONAPO pry23, mitad de 2026
  ingresoNacional: 3_653, // boletín PL 1T 2026, pesos constantes 1T 2020
  homicidiosVictimas2025: 23_611, // RNID víctimas, homicidio doloso 2025 (corte jun-2026)
  homicidiosCarpetas2025: 20_193, // RNID carpetas, homicidio doloso 2025 (corte jun-2026)
  mujeresAsesinadas2025: 2_818, // RNID víctimas 2025: feminicidio (733, todas mujeres) + homicidio doloso mujer (2,085)
  mujeresAsesinadasTasa2025: 4.14, // evidencia Fase A Ola 2: tasa por 100 mil mujeres, CONAPO mitad-2025
  prevalenciaNacional: 24_135, // comunicado ENVIPE 127/25: víctimas de delito por 100 mil habitantes de 18+, 2024
  prevalenciaMaxEdomex: 34_851, // comunicado 127/25: tasa más alta (México)
  prevalenciaMinChiapas: 15_576, // comunicado 127/25: tasa más baja (Chiapas)
  roboCochesCarpetas2025: 70_409, // RNID carpetas 2025: robo de coche de 4 ruedas, con y sin violencia (corte jun-2026)
  roboCochesTasa2025: 52.8, // evidencia Fase A Ola 2: tasa por 100 mil habitantes, CONAPO mitad-2025
  percepcionNacional: 75.6, // boletín ENVIPE 2025: % 18+ que considera insegura su entidad
  desocupacionNacional: 2.6, // boletín ENOE 301/26, TD nacional 1T 2026 (% de la PEA)
  escolaridadNacional: 9.74, // Censo 2020, grado promedio de escolaridad 15+
} as const;

// ---------------------------------------------------------------------------
// Entidades
// ---------------------------------------------------------------------------

type Clave = string; // "01".."32"
const CLAVES: Clave[] = Array.from({ length: 32 }, (_, i) => String(i + 1).padStart(2, "0"));

// Nombre → clave para las fuentes que identifican por nombre. Incluye las
// variantes oficiales largas y cortas observadas en cada fuente; cualquier
// nombre fuera de esta tabla aborta la corrida.
const NOMBRE_A_CLAVE: Record<string, Clave> = {
  "Aguascalientes": "01",
  "Baja California": "02",
  "Baja California Sur": "03",
  "Campeche": "04",
  "Coahuila de Zaragoza": "05",
  "Coahuila": "05",
  "Colima": "06",
  "Chiapas": "07",
  "Chihuahua": "08",
  "Ciudad de México": "09",
  "Durango": "10",
  "Guanajuato": "11",
  "Guerrero": "12",
  "Hidalgo": "13",
  "Jalisco": "14",
  "México": "15",
  "Estado de México": "15",
  "Michoacán de Ocampo": "16",
  "Michoacán": "16",
  "Morelos": "17",
  "Nayarit": "18",
  "Nuevo León": "19",
  "Oaxaca": "20",
  "Puebla": "21",
  "Querétaro": "22",
  "Quintana Roo": "23",
  "San Luis Potosí": "24",
  "Sinaloa": "25",
  "Sonora": "26",
  "Tabasco": "27",
  "Tamaulipas": "28",
  "Tlaxcala": "29",
  "Veracruz de Ignacio de la Llave": "30",
  "Veracruz": "30",
  "Yucatán": "31",
  "Zacatecas": "32",
};
const NACIONAL = new Set(["Estados Unidos Mexicanos", "Nacional", "República Mexicana"]);

// Clave → primer nombre registrado (los oficiales largos van primero en la
// tabla); para citas técnicas generadas que nombran una entidad.
const CLAVE_A_NOMBRE: Record<Clave, string> = {};
for (const [nombre, clave] of Object.entries(NOMBRE_A_CLAVE)) {
  if (!(clave in CLAVE_A_NOMBRE)) CLAVE_A_NOMBRE[clave] = nombre;
}

function claveDe(nombre: string): Clave | "00" | null {
  const limpio = nombre.trim().replace(/\s+/g, " ");
  if (NACIONAL.has(limpio)) return "00";
  return NOMBRE_A_CLAVE[limpio] ?? null;
}

// ---------------------------------------------------------------------------
// Descarga con caché y validación de content-type (soft-404 de INEGI)
// ---------------------------------------------------------------------------

async function descarga(url: string, nombreCache: string, tipoEsperado: RegExp, opciones?: RequestInit): Promise<{ buf: Buffer; sha256: string }> {
  mkdirSync(CACHE, { recursive: true });
  const ruta = path.join(CACHE, nombreCache);
  if (existsSync(ruta)) {
    const buf = readFileSync(ruta);
    return { buf, sha256: createHash("sha256").update(buf).digest("hex") };
  }
  const res = await fetch(url, opciones);
  const tipo = res.headers.get("content-type") ?? "";
  if (res.status !== 200 || !tipoEsperado.test(tipo)) {
    throw new Error(`Descarga inválida de ${url}: HTTP ${res.status}, content-type "${tipo}"`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(ruta, buf);
  return { buf, sha256: createHash("sha256").update(buf).digest("hex") };
}

// CONAPO exige cadena de CA explícita (node:https con `ca`).
function descargaConapo(): Promise<{ ruta: string; sha256: string }> {
  mkdirSync(CACHE, { recursive: true });
  const ruta = path.join(CACHE, "conapo-pob-mitad.csv");
  if (existsSync(ruta)) {
    return Promise.resolve({ ruta, sha256: sha256Archivo(ruta) });
  }
  const ca = readFileSync(CONAPO_CA);
  return new Promise((resolve, reject) => {
    const out = createWriteStream(ruta + ".tmp");
    https
      .get(URL_CONAPO_CSV, { ca }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`CONAPO HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(out);
        out.on("finish", () => {
          out.close(() => {
            renameSync(ruta + ".tmp", ruta);
            resolve({ ruta, sha256: sha256Archivo(ruta) });
          });
        });
      })
      .on("error", reject);
  });
}

function sha256Archivo(ruta: string): string {
  return createHash("sha256").update(readFileSync(ruta)).digest("hex");
}

// ---------------------------------------------------------------------------
// Lectores: zip local, xlsx, csv
// ---------------------------------------------------------------------------

function entradasZip(buf: Buffer): Map<string, Buffer> {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 66 * 1024); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Zip sin directorio central");
  const cdOffset = buf.readUInt32LE(eocd + 16);
  const total = buf.readUInt16LE(eocd + 10);
  const out = new Map<string, Buffer>();
  let p = cdOffset;
  for (let e = 0; e < total; e++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error("Entrada de directorio central inválida");
    const metodo = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28);
    const elen = buf.readUInt16LE(p + 30);
    const clen = buf.readUInt16LE(p + 32);
    const off = buf.readUInt32LE(p + 42);
    const nombre = buf.toString("utf8", p + 46, p + 46 + nlen);
    const lnlen = buf.readUInt16LE(off + 26);
    const lelen = buf.readUInt16LE(off + 28);
    const inicio = off + 30 + lnlen + lelen;
    const datos = buf.subarray(inicio, inicio + csize);
    out.set(nombre, metodo === 8 ? inflateRawSync(datos) : Buffer.from(datos));
    p += 46 + nlen + elen + clen;
  }
  return out;
}

type Fila = Map<string, string>; // columna ("A", "B", …) → valor

function hojasXlsx(buf: Buffer): Map<string, Fila[]> {
  const z = entradasZip(buf);
  const dec = (b?: Buffer) => (b ? b.toString("utf8") : "");
  const ssXml = dec(z.get("xl/sharedStrings.xml"));
  const ss: string[] = [];
  for (const m of ssXml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    ss.push(
      Array.from(m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g), (t) => t[1])
        .join("")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">"),
    );
  }
  const wb = dec(z.get("xl/workbook.xml"));
  const rels = new Map(
    Array.from(dec(z.get("xl/_rels/workbook.xml.rels")).matchAll(/Id="(rId\d+)"[^>]*Target="([^"]*)"/g), (m) => [m[1], m[2]]),
  );
  const hojas = new Map<string, Fila[]>();
  for (const m of wb.matchAll(/<sheet[^>]*name="([^"]*)"[^>]*r:id="(rId\d+)"/g)) {
    const target = rels.get(m[2]);
    if (!target || !target.includes("worksheets")) continue;
    const xml = dec(z.get("xl/" + target.replace(/^\//, "")));
    const filas: Fila[] = [];
    for (const rm of xml.matchAll(/<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
      const r = Number(rm[1]);
      const celdas: Fila = new Map();
      // Cada celda es self-closing (<c …/>) o contenedora (<c …>…</c>); el
      // <v> se busca solo dentro del cuerpo de SU celda.
      for (const cm of rm[2].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const attrs = cm[1];
        const cuerpo = cm[2];
        if (cuerpo === undefined) continue;
        const col = attrs.match(/r="([A-Z]+)\d+"/)?.[1];
        const t = attrs.match(/t="([^"]*)"/)?.[1];
        const v = cuerpo.match(/<v>([^<]*)<\/v>/)?.[1];
        if (!col || v === undefined) continue;
        celdas.set(col, t === "s" ? ss[Number(v)] : v);
      }
      while (filas.length < r - 1) filas.push(new Map());
      filas.push(celdas);
    }
    hojas.set(m[1], filas);
  }
  return hojas;
}

function colAIndice(col: string): number {
  let n = 0;
  for (const ch of col) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

function indiceACol(n: number): string {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// CSV con comillas (RFC 4180 básico), suficiente para los productos INEGI.
function parseCsv(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let enComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          campo += '"';
          i++;
        } else enComillas = false;
      } else campo += c;
    } else if (c === '"') enComillas = true;
    else if (c === ",") {
      fila.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
    } else campo += c;
  }
  if (campo !== "" || fila.length) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas;
}

// ---------------------------------------------------------------------------
// Extractores por fuente
// ---------------------------------------------------------------------------

type Serie = { valores: Record<Clave, number>; nacional: number | null; sha256: string; url: string };

async function extraePxwebTasa(indicador: string, etiquetaFila: RegExp, nombreCache: string): Promise<Serie & { periodo: string }> {
  const cuerpo = {
    showdecimals: 2,
    file: PXWEB_MATRIZ,
    lang: "es",
    query: {
      query: [
        { code: "Indicador", variableType: null, selection: { filter: "item", values: [indicador] } },
        { code: "Área geográfica", variableType: null, selection: { filter: "item", values: ["00", ...CLAVES] } },
        { code: "Sexo", variableType: null, selection: { filter: "item", values: ["0"] } },
        { code: "Tipo de dato", variableType: null, selection: { filter: "item", values: ["0"] } },
        { code: "Periodo", variableType: null, selection: { filter: "top", values: ["1"] } },
      ],
      response: { format: "xlsx", params: null },
    },
    heading: ["Periodo", "Tipo de dato", "Sexo"],
    stub: ["Indicador", "Área geográfica"],
    notaPie: null,
    statist: "",
    hiderows: false,
  };
  const { buf, sha256 } = await descarga(URL_PXWEB_EXPORT, nombreCache, /spreadsheetml/, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  const hojas = hojasXlsx(buf);
  const filas = hojas.values().next().value as Fila[];
  let periodo = "";
  let nacional: number | null = null;
  const valores: Record<Clave, number> = {};
  for (const f of filas) {
    const a = f.get("A") ?? "";
    const b = f.get("B") ?? "";
    const c = f.get("C") ?? "";
    if (a === "Indicador" && /\dT/.test(c)) periodo = c; // fila de encabezado con "2026 1T"
    if (etiquetaFila.test(a) && b) {
      const clave = claveDe(b);
      if (clave === null) throw new Error(`PxWeb ${indicador}: entidad desconocida "${b}"`);
      const v = Number(c);
      if (!Number.isFinite(v)) throw new Error(`PxWeb ${indicador}: valor inválido para ${b}`);
      if (clave === "00") nacional = v;
      else valores[clave] = v;
    }
  }
  if (!periodo) throw new Error(`PxWeb ${indicador}: no se encontró el periodo en el export`);
  if (nacional === null) throw new Error(`PxWeb ${indicador}: falta la fila nacional (área 00)`);
  return { valores, nacional, sha256, url: `${URL_PXWEB_EXPORT} (matriz ${PXWEB_MATRIZ}, indicador ${indicador})`, periodo };
}

// -------------------------------------------------------------------------
// SESNSP/CNI (RNID): el share-link de SharePoint exige un handshake de
// cookies anónimas (FedAuth); la ruta real del archivo viene en el
// parámetro `id` de la URL final de redirección.
// -------------------------------------------------------------------------

const UA_NAVEGADOR = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)";

async function descargaSharepoint(shareUrl: string, nombreCache: string): Promise<{ buf: Buffer; sha256: string }> {
  mkdirSync(CACHE, { recursive: true });
  const ruta = path.join(CACHE, nombreCache);
  if (existsSync(ruta)) {
    const buf = readFileSync(ruta);
    return { buf, sha256: createHash("sha256").update(buf).digest("hex") };
  }
  const jar: string[] = [];
  let url = shareUrl;
  for (let salto = 0; salto < 8; salto++) {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": UA_NAVEGADOR, ...(jar.length ? { Cookie: jar.join("; ") } : {}) },
    });
    for (const sc of res.headers.getSetCookie()) jar.push(sc.split(";")[0]);
    const loc = res.headers.get("location");
    if (!loc) break;
    url = new URL(loc, url).toString();
  }
  const id = new URL(url).searchParams.get("id");
  if (!id) throw new Error(`SharePoint: la redirección no trae la ruta del archivo (${url.slice(0, 120)})`);
  const urlArchivo = `${new URL(url).origin}${encodeURI(id)}?ga=1`;
  const res = await fetch(urlArchivo, {
    headers: { "User-Agent": UA_NAVEGADOR, Cookie: jar.join("; ") },
  });
  const tipo = res.headers.get("content-type") ?? "";
  if (res.status !== 200 || !/zip|octet/.test(tipo)) {
    throw new Error(`SharePoint: HTTP ${res.status}, content-type "${tipo}" al bajar ${id}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(ruta, buf);
  return { buf, sha256: createHash("sha256").update(buf).digest("hex") };
}

// Suma anual por entidad de un CSV RNID (latin-1, columnas Enero..Diciembre)
// filtrando por subtipo del año indicado y, opcionalmente, por prefijo de
// modalidad y por sexo de la víctima (la columna Sexo solo existe en el
// archivo de víctimas; la de Modalidad, en ambos).
function sumaRnid(
  csvLatin1: Buffer,
  anio: string,
  filtro: { subtipo: string; modalidadPrefijo?: string; sexo?: string },
): { porEntidad: Record<Clave, number>; total: number } {
  const filas = parseCsv(csvLatin1.toString("latin1"));
  const enc = filas[0];
  const iAnio = enc.indexOf("Año");
  const iCve = enc.indexOf("Clave_Ent");
  const iSub = enc.indexOf("Subtipo de delito");
  const iMod = enc.indexOf("Modalidad");
  const iSexo = enc.indexOf("Sexo");
  const iEnero = enc.indexOf("Enero");
  if (iAnio < 0 || iCve < 0 || iSub < 0 || iEnero < 0) {
    throw new Error(`RNID: encabezado inesperado: ${enc.slice(0, 8).join(",")}`);
  }
  if (filtro.sexo !== undefined && iSexo < 0) throw new Error("RNID: el archivo no trae la columna Sexo");
  if (filtro.modalidadPrefijo !== undefined && iMod < 0) throw new Error("RNID: el archivo no trae la columna Modalidad");
  const porEntidad: Record<Clave, number> = {};
  let total = 0;
  for (let i = 1; i < filas.length; i++) {
    const f = filas[i];
    if (f.length < iEnero + 12) continue;
    if (f[iAnio] !== anio || f[iSub].trim() !== filtro.subtipo) continue;
    if (filtro.modalidadPrefijo !== undefined && !f[iMod].trim().startsWith(filtro.modalidadPrefijo)) continue;
    if (filtro.sexo !== undefined && f[iSexo].trim() !== filtro.sexo) continue;
    const cve = Number(f[iCve]); // pad inconsistente entre archivos: numérico
    if (!(cve >= 1 && cve <= 32)) throw new Error(`RNID: Clave_Ent inválida "${f[iCve]}"`);
    let suma = 0;
    for (let m = 0; m < 12; m++) {
      const v = f[iEnero + m].trim();
      if (v !== "") suma += Number(v);
    }
    const clave = String(cve).padStart(2, "0");
    porEntidad[clave] = (porEntidad[clave] ?? 0) + suma;
    total += suma;
  }
  return { porEntidad, total };
}

// Las tres series RNID de la vista de seguridad salen de los mismos dos zips:
// homicidios (rey, víctimas), mujeres asesinadas (víctimas: feminicidio +
// homicidio doloso con víctima mujer — la suma neutraliza la tipificación
// heterogénea entre fiscalías y no duplica: cada víctima vive en exactamente
// un subtipo) y robo de coches (carpetas: coche de 4 ruedas, sin motos).
async function extraeRnid(): Promise<{
  homicidios: Serie & { carpetasTotal: number };
  mujeres: Serie & { noIdent: { total: number; pctNacional: number; pctMax: number; claveMax: Clave } };
  roboCoches: Serie & { pctConViolencia: number };
}> {
  const victimas = await descargaSharepoint(URL_SESNSP_VICTIMAS, "sesnsp-victimas.zip");
  const carpetas = await descargaSharepoint(URL_SESNSP_CARPETAS, "sesnsp-carpetas.zip");
  const csvV = Array.from(entradasZip(victimas.buf).values())[0];
  const csvC = Array.from(entradasZip(carpetas.buf).values())[0];

  const hd = sumaRnid(csvV, RNID_ANIO, { subtipo: "Homicidio doloso" });
  const hdCarpetas = sumaRnid(csvC, RNID_ANIO, { subtipo: "Homicidio doloso" });

  // Mujeres asesinadas: feminicidio (verificando que el registro no traiga
  // víctimas de otro sexo — si aparecieran, la suma dejaría de ser limpia y
  // el generador aborta) + homicidio doloso con víctima mujer.
  const fem = sumaRnid(csvV, RNID_ANIO, { subtipo: "Feminicidio" });
  const femMujer = sumaRnid(csvV, RNID_ANIO, { subtipo: "Feminicidio", sexo: "Mujer" });
  if (fem.total !== femMujer.total) {
    throw new Error(`RNID: feminicidio con víctimas de sexo distinto de mujer (${fem.total} vs ${femMujer.total})`);
  }
  const hdMujer = sumaRnid(csvV, RNID_ANIO, { subtipo: "Homicidio doloso", sexo: "Mujer" });
  const mujeresValores: Record<Clave, number> = {};
  for (const c of CLAVES) mujeresValores[c] = (fem.porEntidad[c] ?? 0) + (hdMujer.porEntidad[c] ?? 0);
  const mujeresTotal = fem.total + hdMujer.total;

  // Matiz piso-no-techo de la cita técnica: víctimas de homicidio doloso con
  // sexo no identificado (no atribuibles a la serie de mujeres).
  const hdNoIdent = sumaRnid(csvV, RNID_ANIO, { subtipo: "Homicidio doloso", sexo: "No identificado" });
  let claveMax: Clave = CLAVES[0];
  let pctMax = 0;
  for (const c of CLAVES) {
    const pct = hd.porEntidad[c] ? (100 * (hdNoIdent.porEntidad[c] ?? 0)) / hd.porEntidad[c] : 0;
    if (pct > pctMax) {
      pctMax = pct;
      claveMax = c;
    }
  }

  const coches = sumaRnid(csvC, RNID_ANIO, {
    subtipo: "Robo de vehículo automotor",
    modalidadPrefijo: "Robo de coche de 4 ruedas",
  });
  const cochesViolencia = sumaRnid(csvC, RNID_ANIO, {
    subtipo: "Robo de vehículo automotor",
    modalidadPrefijo: "Robo de coche de 4 ruedas Con violencia",
  });

  return {
    homicidios: {
      valores: hd.porEntidad,
      nacional: hd.total,
      carpetasTotal: hdCarpetas.total,
      sha256: victimas.sha256,
      url: URL_SESNSP_VICTIMAS,
    },
    mujeres: {
      valores: mujeresValores,
      nacional: mujeresTotal,
      noIdent: {
        total: hdNoIdent.total,
        pctNacional: (100 * hdNoIdent.total) / hd.total,
        pctMax,
        claveMax,
      },
      sha256: victimas.sha256,
      url: URL_SESNSP_VICTIMAS,
    },
    roboCoches: {
      valores: coches.porEntidad,
      nacional: coches.total,
      pctConViolencia: (100 * cochesViolencia.total) / coches.total,
      sha256: carpetas.sha256,
      url: URL_SESNSP_CARPETAS,
    },
  };
}

// -------------------------------------------------------------------------
// ENVIPE: Cuadro 5.13 — % de población de 18+ que considera insegura su
// entidad federativa (columna H, "Inseguro / Relativos").
// -------------------------------------------------------------------------

async function extraePercepcion(): Promise<Serie> {
  const { buf, sha256 } = await descarga(URL_ENVIPE_XLSX, "envipe.xlsx", /spreadsheetml/);
  const hojas = hojasXlsx(buf);
  const filas = hojas.get(ENVIPE_CUADRO);
  if (!filas) throw new Error(`ENVIPE: no existe el cuadro ${ENVIPE_CUADRO}`);
  const sub = filas[8]; // fila 9: "Absolutos/Relativos"
  if (!/Relativos/.test(sub.get("H") ?? "")) {
    throw new Error(`ENVIPE: la columna H del cuadro ${ENVIPE_CUADRO} ya no es "Relativos" de Inseguro`);
  }
  const valores: Record<Clave, number> = {};
  let nacional: number | null = null;
  for (const f of filas.slice(10)) {
    const nombre = f.get("A");
    if (!nombre) continue;
    const clave = claveDe(nombre);
    if (clave === null) continue;
    const v = Number(f.get("H"));
    if (!Number.isFinite(v)) throw new Error(`ENVIPE: valor inválido para ${nombre}`);
    if (clave === "00") nacional = v;
    else valores[clave] = v;
  }
  return { valores, nacional, sha256, url: `${URL_ENVIPE_XLSX} (cuadro ${ENVIPE_CUADRO})` };
}

// -------------------------------------------------------------------------
// ENVIPE victimización: Cuadro 1.1 — tasa de prevalencia delictiva por
// entidad federativa por cada 100 mil habitantes de 18+ (columna B, "Tasa
// total de prevalencia"). El denominador del cuadro es la población de 18+
// RESIDENTE en la entidad (Nota 2 del propio cuadro): serie por residencia,
// la del diseño muestral de la encuesta. El mismo tabulado ancla la cláusula
// "los más comunes" contra el bloque nacional del cuadro 1.13.
// -------------------------------------------------------------------------

async function extraePrevalencia(): Promise<Serie & { top3: string[] }> {
  const { buf, sha256 } = await descarga(URL_ENVIPE_VICT_XLSX, "envipe-victimizacion.xlsx", /spreadsheetml/);
  const hojas = hojasXlsx(buf);
  const filas = hojas.get(ENVIPE_PREVALENCIA_CUADRO);
  if (!filas) throw new Error(`ENVIPE victimización: no existe el cuadro ${ENVIPE_PREVALENCIA_CUADRO}`);
  const enc = filas[6]; // fila 7: encabezados de columna
  if (!/Tasa total de prevalencia/.test(enc.get("B") ?? "")) {
    throw new Error(`ENVIPE victimización: la columna B del cuadro ${ENVIPE_PREVALENCIA_CUADRO} ya no es "Tasa total de prevalencia"`);
  }
  const valores: Record<Clave, number> = {};
  let nacional: number | null = null;
  for (const f of filas.slice(9)) {
    const nombre = f.get("A");
    if (!nombre) continue;
    const clave = claveDe(nombre);
    if (clave === null) continue;
    const v = Number(f.get("B"));
    if (!Number.isFinite(v)) throw new Error(`ENVIPE victimización: valor inválido para ${nombre}`);
    if (clave === "00") nacional = v;
    else valores[clave] = v;
  }

  // Anclaje del copy: el bloque nacional del cuadro 1.13 lista los delitos
  // más frecuentes con su tasa de incidencia; el top-3 debe seguir siendo
  // {fraude, robo o asalto en calle o transporte público, extorsión}.
  const filas13 = hojas.get(ENVIPE_TOP_DELITOS_CUADRO);
  if (!filas13) throw new Error(`ENVIPE victimización: no existe el cuadro ${ENVIPE_TOP_DELITOS_CUADRO}`);
  const delitos: { nombre: string; tasa: number }[] = [];
  let enNacional = false;
  for (const f of filas13.slice(7)) {
    const a = (f.get("A") ?? "").trim();
    if (!a) continue;
    if (claveDe(a) === "00") {
      enNacional = true;
      continue;
    }
    if (!enNacional) continue;
    if (claveDe(a) !== null) break; // empezó la siguiente entidad
    const tasa = Number(f.get("C"));
    if (!Number.isFinite(tasa)) continue;
    delitos.push({ nombre: a.replace(/\d+$/, ""), tasa }); // "Fraude1" → "Fraude" (nota al pie)
  }
  const top3 = delitos
    .sort((a, b) => b.tasa - a.tasa)
    .slice(0, 3)
    .map((d) => d.nombre);
  const esperado = new Set(ENVIPE_TOP3_ESPERADO);
  if (top3.length !== 3 || !top3.every((n) => esperado.has(n))) {
    throw new Error(
      `ENVIPE: el top-3 nacional de incidencia cambió (${top3.join(" · ")}) — revisar la frase de víctimas de delito antes de regenerar`,
    );
  }
  console.log(`[indicadores] anclaje OK — los delitos más comunes (cuadro ${ENVIPE_TOP_DELITOS_CUADRO}): ${top3.join(" · ")}`);

  return { valores, nacional, sha256, url: `${URL_ENVIPE_VICT_XLSX} (cuadro ${ENVIPE_PREVALENCIA_CUADRO})`, top3 };
}

// -------------------------------------------------------------------------
// Escolaridad (BISE): una llamada por área geográfica; se toma la
// observación no nula más reciente y se exige que el año coincida en las 33.
// -------------------------------------------------------------------------

async function extraeEscolaridad(): Promise<Serie & { periodo: string }> {
  mkdirSync(CACHE, { recursive: true });
  const rutaCache = path.join(CACHE, "escolaridad.json");
  let crudo: Record<string, unknown>;
  if (existsSync(rutaCache)) {
    crudo = JSON.parse(readFileSync(rutaCache, "utf8"));
  } else {
    // El token solo hace falta cuando hay que llamar a la API; una corrida
    // sobre caché (fuentes congeladas de una ola) no lo exige.
    const token = process.env.INEGI_TOKEN;
    if (!token) {
      throw new Error(
        "Falta INEGI_TOKEN en el entorno (token gratuito: inegi.org.mx/servicios/api_indicadores.html). No se escribe al repositorio.",
      );
    }
    crudo = {};
    for (const geo of ["00", ...CLAVES]) {
      const res = await fetch(
        `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${BISE_ESCOLARIDAD}/es/${geo}/false/BISE/2.0/${token}?type=json`,
      );
      if (res.status !== 200) throw new Error(`BISE escolaridad: HTTP ${res.status} para geo ${geo}`);
      crudo[geo] = await res.json();
    }
    writeFileSync(rutaCache, JSON.stringify(crudo));
  }
  const sha256 = createHash("sha256").update(JSON.stringify(crudo)).digest("hex");
  const valores: Record<Clave, number> = {};
  let nacional: number | null = null;
  let periodo = "";
  for (const [geo, d] of Object.entries(crudo)) {
    const obs = (d as { Series: { OBSERVATIONS: { TIME_PERIOD: string; OBS_VALUE: string | null }[] }[] })
      .Series[0].OBSERVATIONS.filter((o) => o.OBS_VALUE !== null);
    const reciente = obs.reduce((a, b) => (Number(b.TIME_PERIOD) > Number(a.TIME_PERIOD) ? b : a));
    if (!periodo) periodo = reciente.TIME_PERIOD;
    if (reciente.TIME_PERIOD !== periodo) {
      throw new Error(`BISE escolaridad: periodos mezclados (${periodo} vs ${reciente.TIME_PERIOD} en geo ${geo})`);
    }
    const v = Number(reciente.OBS_VALUE);
    if (!Number.isFinite(v)) throw new Error(`BISE escolaridad: valor inválido en geo ${geo}`);
    if (geo === "00") nacional = v;
    else valores[geo] = v;
  }
  return {
    valores,
    nacional,
    sha256,
    url: `https://www.inegi.org.mx/app/api/indicadores/.../INDICATOR/${BISE_ESCOLARIDAD}/es/{00..32}/false/BISE/2.0/{INEGI_TOKEN}`,
    periodo,
  };
}

async function descubreTabuladoPl(): Promise<string> {
  const { buf } = await descarga(URL_PL_DESCUBRIMIENTO, "pl-descubrimiento.json", /json/);
  const lista = JSON.parse(buf.toString("utf8"));
  const items: { pathLogico?: string }[] = Array.isArray(lista) ? lista : (lista.archivos ?? lista.datos ?? []);
  for (const item of items) {
    const p = item.pathLogico ?? "";
    // pathLogico llega sin extensión ni prefijo: "/desarrollosocial/pl/tabulados/pl_2005t_2026t"
    if (/pl_2005t_\d{4}t$/.test(p)) return `${URL_PL_BASE}/contenidos${p}.xlsx`;
  }
  throw new Error("No se encontró el tabulado pl_2005t_*.xlsx en la API de descubrimiento");
}

async function extraePl(): Promise<{ pobreza: Serie; ingreso: Serie; periodo: string }> {
  const url = await descubreTabuladoPl();
  const { buf, sha256 } = await descarga(url, "pl-tabulado.xlsx", /spreadsheetml/);
  const hojas = hojasXlsx(buf);

  const titulo = (hojas.get("Cuadro 9") ?? [])[0]?.get("A") ?? "";
  const perM = titulo.match(/(\d)(?:er|do|to)? trimestre (\d{4})/);
  if (!perM) throw new Error(`PL: no se pudo leer el periodo del título "${titulo}"`);
  const periodo = `${perM[1]}T ${perM[2]}`;

  // Cuadro 9: fila 6 = nombres de entidad por columna; última fila = último
  // trimestre. Cuadro 5: el nombre de la entidad (fila 6) ancla la columna
  // "deflactado con el INPC" (fila 7).
  const c9 = hojas.get("Cuadro 9");
  const c5 = hojas.get("Cuadro 5");
  if (!c9 || !c5) throw new Error("PL: faltan Cuadro 9 o Cuadro 5");

  const extrae = (filas: Fila[], modo: "directa" | "inpc"): Serie => {
    const encabezado = filas[5]; // fila 6 (1-indexada): nombres de entidad
    const sub = filas[6]; // fila 7: subencabezados (solo Cuadro 5)
    const nombres: { idx: number; clave: Clave | "00" }[] = [];
    for (const [col, nombre] of encabezado) {
      const clave = claveDe(nombre);
      if (clave === null) continue;
      nombres.push({ idx: colAIndice(col), clave });
    }
    nombres.sort((a, b) => a.idx - b.idx);
    if (nombres.length !== 33) throw new Error(`PL: se esperaban 33 columnas de entidad, hay ${nombres.length}`);

    let columnas: { col: string; clave: Clave | "00" }[];
    if (modo === "directa") {
      // Cuadro 9: la columna del nombre contiene el dato.
      columnas = nombres.map((n) => ({ col: indiceACol(n.idx), clave: n.clave }));
    } else {
      // Cuadro 5: cada bloque de entidad tiene subcolumnas (corrientes, INPC,
      // canasta) con offset variable; se toma la primera subcolumna INPC
      // dentro del bloque [nombre, siguiente nombre).
      const inpc = Array.from(sub)
        .filter(([, v]) => /deflactado con el INPC/.test(v))
        .map(([col]) => colAIndice(col))
        .sort((a, b) => a - b);
      columnas = nombres.map((n, i) => {
        const fin = nombres[i + 1]?.idx ?? Infinity;
        const objetivo = inpc.find((x) => x >= n.idx && x < fin);
        if (!objetivo) throw new Error(`PL Cuadro 5: sin subcolumna INPC para el bloque en índice ${n.idx}`);
        return { col: indiceACol(objetivo), clave: n.clave };
      });
    }
    // Última fila con dato en todas las columnas de entidad.
    let ultima: Fila | null = null;
    for (let i = filas.length - 1; i > 6; i--) {
      if (columnas.every(({ col }) => filas[i]?.get(col) !== undefined)) {
        ultima = filas[i];
        break;
      }
    }
    if (!ultima) throw new Error("PL: no se encontró la última fila completa");
    const valores: Record<Clave, number> = {};
    let nacional: number | null = null;
    for (const { col, clave } of columnas) {
      const v = Number(ultima.get(col));
      if (!Number.isFinite(v)) throw new Error(`PL: valor inválido en columna ${col}`);
      if (clave === "00") nacional = v;
      else valores[clave] = v;
    }
    return { valores, nacional, sha256, url };
  };

  return { pobreza: extrae(c9, "directa"), ingreso: extrae(c5, "inpc"), periodo };
}

async function extraeImss(): Promise<Serie> {
  mkdirSync(CACHE, { recursive: true });
  const rutaAgregado = path.join(CACHE, "imss-agregado.json");
  if (existsSync(rutaAgregado)) {
    return JSON.parse(readFileSync(rutaAgregado, "utf8"));
  }
  const res = await fetch(URL_IMSS_CSV);
  const tipo = res.headers.get("content-type") ?? "";
  if (res.status !== 200 || !/csv|octet/.test(tipo)) {
    throw new Error(`IMSS: HTTP ${res.status}, content-type "${tipo}"`);
  }
  const hash = createHash("sha256");
  const sumas = new Map<number, number>();
  let resto = "";
  let encabezado: string[] | null = null;
  let iEntidad = -1;
  let iTa = -1;
  let bytes = 0;
  const reader = (res.body as ReadableStream<Uint8Array>).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    hash.update(value);
    bytes += value.length;
    const texto = resto + Buffer.from(value).toString("latin1");
    const lineas = texto.split("\n");
    resto = lineas.pop() ?? "";
    for (const linea of lineas) {
      const campos = linea.replace(/\r$/, "").split("|");
      if (!encabezado) {
        encabezado = campos;
        iEntidad = campos.indexOf("cve_entidad");
        iTa = campos.indexOf("ta");
        if (iEntidad < 0 || iTa < 0) throw new Error(`IMSS: encabezado inesperado: ${campos.join(",")}`);
        continue;
      }
      const ent = Number(campos[iEntidad]);
      const ta = Number(campos[iTa]);
      if (Number.isFinite(ent) && ent >= 1 && ent <= 32 && Number.isFinite(ta)) {
        sumas.set(ent, (sumas.get(ent) ?? 0) + ta);
      }
    }
    if (bytes % (64 * 1024 * 1024) < value.length) {
      console.log(`[indicadores] IMSS: ${Math.round(bytes / 1e6)} MB procesados…`);
    }
  }
  if (resto.trim()) {
    const campos = resto.split("|");
    const ent = Number(campos[iEntidad]);
    const ta = Number(campos[iTa]);
    if (Number.isFinite(ent) && ent >= 1 && ent <= 32 && Number.isFinite(ta)) {
      sumas.set(ent, (sumas.get(ent) ?? 0) + ta);
    }
  }
  const valores: Record<Clave, number> = {};
  let total = 0;
  for (const [ent, suma] of sumas) {
    valores[String(ent).padStart(2, "0")] = suma;
    total += suma;
  }
  const serie: Serie = { valores, nacional: total, sha256: hash.digest("hex"), url: URL_IMSS_CSV };
  writeFileSync(rutaAgregado, JSON.stringify(serie));
  console.log(`[indicadores] IMSS: ${Math.round(bytes / 1e6)} MB en streaming, total nacional ${total.toLocaleString("en-US")}`);
  return serie;
}

async function extraePibe(): Promise<Serie> {
  const { buf, sha256 } = await descarga(URL_PIBE_ZIP, "pibe.zip", /zip/);
  const z = entradasZip(buf);
  let csv: Buffer | null = null;
  for (const [nombre, datos] of z) {
    if (/pibe_actividad_pibe\d{4}_r\.csv$/.test(nombre)) csv = datos;
  }
  if (!csv) throw new Error("PIBE: no se encontró el CSV del PIB total");
  const filas = parseCsv(csv.toString("utf8"));
  const encabezado = filas[0];
  let iAnio = -1;
  for (let i = 0; i < encabezado.length; i++) {
    if (encabezado[i].startsWith(PIBE_ANIO)) iAnio = i; // "2024<R>"
  }
  if (iAnio < 0) throw new Error(`PIBE: no existe la columna del año ${PIBE_ANIO}`);
  const valores: Record<Clave, number> = {};
  let nacional: number | null = null;
  for (const fila of filas) {
    const d = fila[0] ?? "";
    if (!d.startsWith("Millones de pesos|PIBPM")) continue; // bloque corrientes
    const nombre = d.match(/\|([^|<]+)<C1>$/)?.[1];
    if (!nombre) continue;
    const clave = claveDe(nombre);
    if (clave === null) throw new Error(`PIBE: entidad desconocida "${nombre}"`);
    const v = Number(fila[iAnio]);
    if (!Number.isFinite(v)) throw new Error(`PIBE: valor inválido para ${nombre}`);
    if (clave === "00") nacional = v;
    else valores[clave] = v;
  }
  return { valores, nacional, sha256, url: URL_PIBE_ZIP };
}

type Conapo = {
  total2026: Record<Clave, number>;
  m15mas2026: Record<Clave, number>;
  total2024: Record<Clave, number>;
  total2025: Record<Clave, number>;
  mujeres2025: Record<Clave, number>;
  nacional2026: number;
  sha256: string;
};

async function extraeConapo(): Promise<Conapo> {
  const { ruta, sha256 } = await descargaConapo();
  const texto = readFileSync(ruta, "utf8").replace(/^﻿/, "");
  const filas = texto.split("\n");
  const encabezado = filas[0].split(",").map((c) => c.trim().replace(/"/g, ""));
  const iAnio = encabezado.findIndex((c) => /^A/.test(c) && /O$/i.test(c.normalize("NFD").replace(/\p{M}/gu, "")));
  const iCve = encabezado.indexOf("CVE_GEO");
  const iEdad = encabezado.indexOf("EDAD");
  const iSexo = encabezado.indexOf("SEXO");
  const iPob = encabezado.indexOf("POBLACION");
  if (iAnio < 0 || iCve < 0 || iEdad < 0 || iSexo < 0 || iPob < 0) {
    throw new Error(`CONAPO: encabezado inesperado: ${encabezado.join(",")}`);
  }
  const total2026: Record<Clave, number> = {};
  const m15mas2026: Record<Clave, number> = {};
  const total2024: Record<Clave, number> = {};
  const total2025: Record<Clave, number> = {};
  const mujeres2025: Record<Clave, number> = {};
  let nacional2026 = 0;
  for (let i = 1; i < filas.length; i++) {
    const f = filas[i].split(",");
    if (f.length < 5) continue;
    const anio = Number(f[iAnio]);
    if (anio !== 2024 && anio !== 2025 && anio !== 2026) continue;
    const cve = Number(f[iCve]);
    const edad = Number(f[iEdad]);
    const pob = Number(f[iPob]);
    if (!Number.isFinite(pob)) continue;
    if (cve === 0) {
      if (anio === 2026) nacional2026 += pob;
      continue;
    }
    if (cve < 1 || cve > 32) continue;
    const clave = String(cve).padStart(2, "0");
    if (anio === 2026) {
      total2026[clave] = (total2026[clave] ?? 0) + pob;
      if (edad >= 15) m15mas2026[clave] = (m15mas2026[clave] ?? 0) + pob;
    } else if (anio === 2025) {
      total2025[clave] = (total2025[clave] ?? 0) + pob;
      if (f[iSexo].trim() === "Mujeres") mujeres2025[clave] = (mujeres2025[clave] ?? 0) + pob;
    } else {
      total2024[clave] = (total2024[clave] ?? 0) + pob;
    }
  }
  return { total2026, m15mas2026, total2024, total2025, mujeres2025, nacional2026, sha256 };
}

// ---------------------------------------------------------------------------
// Quintiles, formato y emisión
// ---------------------------------------------------------------------------

function quintiles(valores: Record<Clave, number>): { asignacion: Record<Clave, number>; rangos: [number, number][] } {
  const orden = CLAVES.slice().sort((a, b) => valores[a] - valores[b]);
  const tamanos = [7, 6, 6, 6, 7];
  const asignacion: Record<Clave, number> = {};
  let pos = 0;
  tamanos.forEach((t, q) => {
    for (let i = 0; i < t; i++) asignacion[orden[pos++]] = q + 1;
  });
  // Empates: valores iguales comparten el quintil inferior del grupo.
  for (const a of CLAVES) {
    for (const b of CLAVES) {
      if (valores[a] === valores[b] && asignacion[b] < asignacion[a]) asignacion[a] = asignacion[b];
    }
  }
  const rangos: [number, number][] = [];
  for (let q = 1; q <= 5; q++) {
    const del = CLAVES.filter((c) => asignacion[c] === q).map((c) => valores[c]);
    rangos.push([Math.min(...del), Math.max(...del)]);
  }
  return { asignacion, rangos };
}

const fmtMx = (dec: number) =>
  new Intl.NumberFormat("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });

type Formato = { valor: (v: number) => string; leyenda: (v: number) => string };

const FORMATOS: Record<string, Formato> = {
  pct: { valor: (v) => `${fmtMx(1).format(v)} %`, leyenda: (v) => fmtMx(1).format(v) },
  tasa100: { valor: (v) => fmtMx(1).format(v), leyenda: (v) => fmtMx(1).format(v) },
  pesos: { valor: (v) => `$${fmtMx(0).format(v)}`, leyenda: (v) => `$${fmtMx(0).format(v)}` },
  pesosMiles: {
    valor: (v) => `$${fmtMx(0).format(v)}`,
    leyenda: (v) => `$${fmtMx(0).format(Math.round(v / 1000))} mil`,
  },
  personas: {
    valor: (v) => fmtMx(0).format(v),
    leyenda: (v) => `${fmtMx(1).format(v / 1e6)} M`,
  },
  tasa100k: { valor: (v) => fmtMx(1).format(v), leyenda: (v) => fmtMx(1).format(v) },
  tasa100kEnteros: { valor: (v) => fmtMx(0).format(v), leyenda: (v) => fmtMx(0).format(v) },
  anios: { valor: (v) => fmtMx(1).format(v), leyenda: (v) => fmtMx(1).format(v) },
};

type Definicion = {
  id: string;
  grupo: "laboral" | "panorama";
  nombre: string;
  unidad: string;
  tooltipSufijo: string;
  periodo: string;
  fuenteCita: string;
  formato: keyof typeof FORMATOS;
  valores: Record<Clave, number>;
  nacional: number;
  procedencia: string[];
};

async function main(): Promise<void> {
  console.log("[indicadores] extrayendo fuentes…");
  const [til1, td, pl, imss, pibe, conapo, rnid, percepcion, prevalencia, escolaridad] = await Promise.all([
    extraePxwebTasa(PXWEB_TIL1, /TIL 1/, "til1.xlsx"),
    extraePxwebTasa(PXWEB_TD, /Tasa de desocupación/, "td.xlsx"),
    extraePl(),
    extraeImss(),
    extraePibe(),
    extraeConapo(),
    extraeRnid(),
    extraePercepcion(),
    extraePrevalencia(),
    extraeEscolaridad(),
  ]);
  const homicidios = rnid.homicidios;

  const hoyD = new Date();
  const hoy = `${hoyD.getFullYear()}-${String(hoyD.getMonth() + 1).padStart(2, "0")}-${String(hoyD.getDate()).padStart(2, "0")}`;

  // Derivados
  const empleoFormal: Record<Clave, number> = {};
  for (const c of CLAVES) empleoFormal[c] = (imss.valores[c] / conapo.m15mas2026[c]) * 100;
  const m15Nacional = CLAVES.reduce((s, c) => s + conapo.m15mas2026[c], 0);
  const empleoNacional = ((imss.nacional ?? 0) / m15Nacional) * 100;

  const pibPc: Record<Clave, number> = {};
  for (const c of CLAVES) pibPc[c] = (pibe.valores[c] * 1e6) / conapo.total2024[c];
  const pobNacional2024 = CLAVES.reduce((s, c) => s + conapo.total2024[c], 0);
  const pibPcNacional = ((pibe.nacional ?? 0) * 1e6) / pobNacional2024;

  const tasaHomicidios: Record<Clave, number> = {};
  for (const c of CLAVES) tasaHomicidios[c] = (homicidios.valores[c] / conapo.total2025[c]) * 100_000;
  const pob2025Nacional = CLAVES.reduce((sum, c) => sum + conapo.total2025[c], 0);
  const tasaHomicidiosNacional = ((homicidios.nacional ?? 0) / pob2025Nacional) * 100_000;

  const tasaMujeres: Record<Clave, number> = {};
  for (const c of CLAVES) tasaMujeres[c] = (rnid.mujeres.valores[c] / conapo.mujeres2025[c]) * 100_000;
  const mujeres2025Nacional = CLAVES.reduce((sum, c) => sum + conapo.mujeres2025[c], 0);
  const tasaMujeresNacional = ((rnid.mujeres.nacional ?? 0) / mujeres2025Nacional) * 100_000;

  const tasaRoboCoches: Record<Clave, number> = {};
  for (const c of CLAVES) tasaRoboCoches[c] = (rnid.roboCoches.valores[c] / conapo.total2025[c]) * 100_000;
  const tasaRoboCochesNacional = ((rnid.roboCoches.nacional ?? 0) / pob2025Nacional) * 100_000;

  const perPl = pl.periodo; // "1T 2026"
  const perTil = til1.periodo.replace(/(\d{4}) (\d)T/, "$2T $1");
  const perTd = td.periodo.replace(/(\d{4}) (\d)T/, "$2T $1");

  const defs: Definicion[] = [
    {
      id: "informalidad",
      grupo: "laboral",
      nombre: "Informalidad laboral",
      unidad: "% de la población ocupada",
      tooltipSufijo: "de la población ocupada",
      periodo: perTil,
      formato: "pct",
      valores: til1.valores,
      nacional: til1.nacional ?? NaN,
      fuenteCita: `Fuente: INEGI, ENOE. Tasa de informalidad laboral (TIL1), ${perTil}. Porcentaje de la población ocupada.`,
      procedencia: [
        `Serie: "10.9. Tasa de informalidad laboral (TIL 1)", indicadores estratégicos ENOE 15+.`,
        `Extracción: ${til1.url}`,
        `SHA-256 export: ${til1.sha256}`,
      ],
    },
    {
      id: "pobreza-laboral",
      grupo: "laboral",
      nombre: "Pobreza laboral",
      unidad: "% de la población",
      tooltipSufijo: "de la población",
      periodo: perPl,
      formato: "pct",
      valores: pl.pobreza.valores,
      nacional: pl.pobreza.nacional ?? NaN,
      fuenteCita: `Fuente: INEGI, Pobreza Laboral (metodología CONEVAL), ${perPl}. Población con ingreso laboral inferior a la canasta alimentaria.`,
      procedencia: [
        `Serie: Cuadro 9 del tabulado de Pobreza Laboral (INEGI publica desde ago 2025; 2006-2024 estimaciones CONEVAL).`,
        `Extracción: ${pl.pobreza.url}`,
        `SHA-256 tabulado: ${pl.pobreza.sha256}`,
      ],
    },
    {
      id: "empleo-formal",
      grupo: "laboral",
      nombre: "Empleo formal",
      unidad: "puestos IMSS por cada 100 personas de 15+",
      tooltipSufijo: "puestos por cada 100 personas de 15+",
      periodo: PERIODO_IMSS,
      formato: "tasa100",
      valores: empleoFormal,
      nacional: empleoNacional,
      fuenteCita: `Fuente: IMSS, puestos de trabajo afiliados, ${PERIODO_IMSS} (entidad de registro patronal, no residencia); población 15+ CONAPO 2026.`,
      procedencia: [
        `Numerador: agregado del campo "ta" por cve_entidad del CSV mensual de Datos Abiertos IMSS (ASG), en streaming.`,
        `Extracción: ${imss.url}`,
        `SHA-256 CSV IMSS: ${imss.sha256}`,
        `Denominador: población de 15+ a mitad de 2026, CONAPO pry23 (SHA-256 ${conapo.sha256}).`,
      ],
    },
    {
      id: "pib",
      grupo: "panorama",
      nombre: "PIB per cápita",
      unidad: "pesos corrientes por habitante",
      tooltipSufijo: "por habitante, pesos corrientes",
      periodo: PIBE_ANIO,
      formato: "pesosMiles",
      valores: pibPc,
      nacional: pibPcNacional,
      fuenteCita: `Fuente: INEGI, PIBE base 2018, cifras revisadas ${PIBE_ANIO}, pesos corrientes; población CONAPO ${PIBE_ANIO}. Campeche y Tabasco incluyen actividad petrolera.`,
      procedencia: [
        `Numerador: bloque "Millones de pesos" (corrientes) del CSV pibe_actividad_pibe${PIBE_ANIO}_r, columna ${PIBE_ANIO}<R>.`,
        `Extracción: ${pibe.url}`,
        `SHA-256 zip PIBE: ${pibe.sha256}`,
        `Denominador: población total a mitad de ${PIBE_ANIO}, CONAPO pry23 (SHA-256 ${conapo.sha256}).`,
      ],
    },
    {
      id: "poblacion",
      grupo: "panorama",
      nombre: "Población",
      unidad: "personas",
      tooltipSufijo: "personas",
      periodo: "2026",
      formato: "personas",
      valores: conapo.total2026,
      nacional: conapo.nacional2026,
      fuenteCita: `Fuente: CONAPO, Proyecciones de la Población de México 2020-2070; población a mitad de 2026. Único indicador en niveles absolutos: el dato ES la población.`,
      procedencia: [
        `Serie: población a mitad de año, todas las edades y sexos, año 2026.`,
        `Extracción: ${URL_CONAPO_CSV} (TLS validado con cadena CA GoDaddy en scripts/certs/).`,
        `SHA-256 CSV CONAPO: ${conapo.sha256}`,
      ],
    },
    {
      id: "ingreso",
      grupo: "panorama",
      nombre: "Ingreso laboral",
      unidad: "pesos mensuales por persona (constantes 1T 2020)",
      tooltipSufijo: "mensuales por persona (1T 2020)",
      periodo: perPl,
      formato: "pesos",
      valores: pl.ingreso.valores,
      nacional: pl.ingreso.nacional ?? NaN,
      fuenteCita: `Fuente: INEGI, Pobreza Laboral. Ingreso laboral real per cápita, pesos constantes del 1T 2020 (INPC), ${perPl}.`,
      procedencia: [
        `Serie: Cuadro 5 del tabulado de Pobreza Laboral, columna deflactada con el INPC.`,
        `Extracción: ${pl.ingreso.url}`,
        `SHA-256 tabulado: ${pl.ingreso.sha256}`,
      ],
    },
    {
      id: "desempleo",
      grupo: "laboral",
      nombre: "Desempleo",
      unidad: "% de la población económicamente activa",
      tooltipSufijo: "de la población económicamente activa",
      periodo: perTd,
      formato: "pct",
      valores: td.valores,
      nacional: td.nacional ?? NaN,
      fuenteCita: `Fuente: INEGI, ENOE. Tasa de desocupación (% de la PEA), ${perTd}. En México el desempleo bajo convive con alta informalidad.`,
      procedencia: [
        `Serie: "10.2. Tasa de desocupación", indicadores estratégicos ENOE 15+.`,
        `Extracción: ${td.url}`,
        `SHA-256 export: ${td.sha256}`,
      ],
    },
    {
      id: "homicidios",
      grupo: "panorama",
      nombre: "Homicidios",
      unidad: "víctimas de homicidio doloso por 100 mil habitantes",
      tooltipSufijo: "víctimas de homicidio doloso por cada 100 mil habitantes",
      periodo: RNID_ANIO,
      formato: "tasa100k",
      valores: tasaHomicidios,
      nacional: tasaHomicidiosNacional,
      fuenteCita: `Fuente: SESNSP/CNI (RNID), víctimas de homicidio doloso en carpetas de investigación, ${RNID_ANIO}; tasa por 100 mil habitantes con población CONAPO. Cifra oficial de fiscalías: el registro no captura todos los casos.`,
      procedencia: [
        `Serie: RNID estatal, víctimas, subtipo "Homicidio doloso", año ${RNID_ANIO} completo (corte jun-2026).`,
        `Extracción: ${homicidios.url} (SharePoint CNI, ruta resuelta por redirect)`,
        `SHA-256 zip víctimas: ${homicidios.sha256}`,
        `Denominador: población a mitad de ${RNID_ANIO}, CONAPO pry23 (SHA-256 ${conapo.sha256}).`,
      ],
    },
    {
      id: "mujeres-asesinadas",
      grupo: "panorama",
      nombre: "Mujeres asesinadas",
      unidad: "víctimas mujeres de feminicidio u homicidio doloso por 100 mil mujeres",
      tooltipSufijo: "mujeres asesinadas por cada 100 mil mujeres",
      periodo: RNID_ANIO,
      formato: "tasa100k",
      valores: tasaMujeres,
      nacional: tasaMujeresNacional,
      fuenteCita: `Fuente: SESNSP/CNI (RNID), víctimas mujeres de feminicidio y de homicidio doloso en carpetas de investigación, ${RNID_ANIO}; tasa por 100 mil mujeres con población CONAPO. Se suman ambos subtipos porque la tipificación de feminicidio varía por fiscalía. Excluye víctimas de sexo no identificado (${rnid.mujeres.noIdent.total} en ${RNID_ANIO}, ${fmtMx(1).format(rnid.mujeres.noIdent.pctNacional)} % nacional y hasta ${fmtMx(1).format(rnid.mujeres.noIdent.pctMax)} % en ${CLAVE_A_NOMBRE[rnid.mujeres.noIdent.claveMax]}): el conteo es piso, no techo. Cifra oficial de fiscalías: el registro no captura todos los casos.`,
      procedencia: [
        `Serie: RNID estatal, víctimas, subtipo "Feminicidio" (todas las víctimas son mujeres; el generador lo verifica) + subtipo "Homicidio doloso" con Sexo "Mujer", año ${RNID_ANIO} completo (corte jun-2026). Subtipos disjuntos: la suma no duplica.`,
        `Extracción: ${rnid.mujeres.url} (SharePoint CNI, ruta resuelta por redirect)`,
        `SHA-256 zip víctimas: ${rnid.mujeres.sha256}`,
        `Denominador: mujeres a mitad de ${RNID_ANIO}, CONAPO pry23 (SHA-256 ${conapo.sha256}).`,
      ],
    },
    {
      id: "victimas-delito",
      grupo: "panorama",
      nombre: "Víctimas de delito",
      unidad: "víctimas de delito por 100 mil habitantes de 18+ (entidad de residencia)",
      tooltipSufijo: "víctimas de delito por cada 100 mil adultos",
      periodo: "2024",
      formato: "tasa100kEnteros",
      valores: prevalencia.valores,
      nacional: prevalencia.nacional ?? NaN,
      fuenteCita: `Fuente: INEGI, ENVIPE 2025, Cuadro 1.1. Víctimas de delito por cada 100 mil habitantes de 18 años y más, por entidad de residencia; delitos ocurridos en 2024. Estimación de encuesta: margen de error promedio por entidad de 7 %.`,
      procedencia: [
        `Serie: ENVIPE, tasa de prevalencia delictiva por entidad federativa (residencia: víctimas de 18+ entre población de 18+ residente, Nota 2 del cuadro).`,
        `Extracción: ${prevalencia.url}`,
        `SHA-256 tabulado: ${prevalencia.sha256}`,
        `Anclaje del copy: top-3 nacional de incidencia (cuadro ${ENVIPE_TOP_DELITOS_CUADRO}) = ${prevalencia.top3.join(" · ")}.`,
      ],
    },
    {
      id: "robo-coches",
      grupo: "panorama",
      nombre: "Robo de coches",
      unidad: "carpetas por robo de coche de 4 ruedas por 100 mil habitantes",
      tooltipSufijo: "robos de coche por cada 100 mil habitantes",
      periodo: RNID_ANIO,
      formato: "tasa100k",
      valores: tasaRoboCoches,
      nacional: tasaRoboCochesNacional,
      fuenteCita: `Fuente: SESNSP/CNI (RNID), carpetas de investigación por robo de coche de 4 ruedas, con y sin violencia (excluye motocicletas y embarcaciones), ${RNID_ANIO}; tasa por 100 mil habitantes con población CONAPO. ${fmtMx(1).format(rnid.roboCoches.pctConViolencia)} % de las carpetas fue con violencia.`,
      procedencia: [
        `Serie: RNID estatal, carpetas, subtipo "Robo de vehículo automotor", modalidades "Robo de coche de 4 ruedas" con y sin violencia, año ${RNID_ANIO} completo (corte jun-2026).`,
        `Extracción: ${rnid.roboCoches.url} (SharePoint CNI, ruta resuelta por redirect)`,
        `SHA-256 zip carpetas: ${rnid.roboCoches.sha256}`,
        `Denominador: población a mitad de ${RNID_ANIO}, CONAPO pry23 (SHA-256 ${conapo.sha256}).`,
      ],
    },
    {
      id: "percepcion",
      grupo: "panorama",
      nombre: "Percepción de inseguridad",
      unidad: "% de la población de 18+ que considera insegura su entidad",
      tooltipSufijo: "de cada 100 adultos la consideran insegura",
      periodo: "2025",
      formato: "pct",
      valores: percepcion.valores,
      nacional: percepcion.nacional ?? NaN,
      fuenteCita: `Fuente: INEGI, ENVIPE 2025 (levantamiento marzo-abril 2025), Cuadro 5.13. Población de 18 años y más que considera insegura su entidad federativa.`,
      procedencia: [
        `Serie: ENVIPE, percepción sobre la seguridad en la entidad federativa (relativos, "Inseguro").`,
        `Extracción: ${percepcion.url}`,
        `SHA-256 tabulado: ${percepcion.sha256}`,
      ],
    },
    {
      id: "escolaridad",
      grupo: "panorama",
      nombre: "Escolaridad",
      unidad: "años promedio de escolaridad (población de 15+)",
      tooltipSufijo: "años de escuela en promedio",
      periodo: `Censo ${escolaridad.periodo}`,
      formato: "anios",
      valores: escolaridad.valores,
      nacional: escolaridad.nacional ?? NaN,
      fuenteCita: `Fuente: INEGI, Censo de Población y Vivienda ${escolaridad.periodo} (BISE ${BISE_ESCOLARIDAD}). Grado promedio de escolaridad de la población de 15 años y más. Se actualiza con la Encuesta Intercensal 2025 (sep 2026).`,
      procedencia: [
        `Serie: grado promedio de escolaridad 15+, BISE ${BISE_ESCOLARIDAD}.`,
        `Extracción: ${escolaridad.url}`,
        `SHA-256 respuestas API: ${escolaridad.sha256}`,
      ],
    },
  ];

  // -------------------------------------------------------------------
  // Verificaciones duras
  // -------------------------------------------------------------------
  for (const d of defs) {
    const faltan = CLAVES.filter((c) => !Number.isFinite(d.valores[c]));
    if (faltan.length) throw new Error(`${d.id}: faltan entidades ${faltan.join(", ")}`);
  }
  const aprox = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
  const cruces: [string, number, number, number][] = [
    ["informalidad vs boletín", til1.nacional ?? NaN, ANCLAS.informalidadNacional, 0.06],
    ["pobreza vs boletín", pl.pobreza.nacional ?? NaN, ANCLAS.pobrezaNacional, 0.05],
    ["IMSS vs comunicado", imss.nacional ?? NaN, ANCLAS.imssTotalNacional, 0],
    ["PIBE vs datos abiertos", pibe.nacional ?? NaN, ANCLAS.pibeNacionalMdp, 0.001],
    ["población vs CONAPO", conapo.nacional2026, ANCLAS.poblacionNacional2026, 1],
    ["ingreso vs boletín", pl.ingreso.nacional ?? NaN, ANCLAS.ingresoNacional, 0.5],
    ["desocupación vs boletín ENOE", td.nacional ?? NaN, ANCLAS.desocupacionNacional, 0.06],
    ["homicidios víctimas vs RNID", homicidios.nacional ?? NaN, ANCLAS.homicidiosVictimas2025, 0],
    ["homicidios carpetas vs RNID", homicidios.carpetasTotal, ANCLAS.homicidiosCarpetas2025, 0],
    ["mujeres asesinadas vs suma RNID", rnid.mujeres.nacional ?? NaN, ANCLAS.mujeresAsesinadas2025, 0],
    ["mujeres asesinadas tasa vs evidencia Fase A", tasaMujeresNacional, ANCLAS.mujeresAsesinadasTasa2025, 0.005],
    ["prevalencia vs comunicado ENVIPE", prevalencia.nacional ?? NaN, ANCLAS.prevalenciaNacional, 0.5],
    ["prevalencia Edomex vs comunicado", prevalencia.valores["15"], ANCLAS.prevalenciaMaxEdomex, 0.5],
    ["prevalencia Chiapas vs comunicado", prevalencia.valores["07"], ANCLAS.prevalenciaMinChiapas, 0.5],
    ["robo de coches carpetas vs RNID", rnid.roboCoches.nacional ?? NaN, ANCLAS.roboCochesCarpetas2025, 0],
    ["robo de coches tasa vs evidencia Fase A", tasaRoboCochesNacional, ANCLAS.roboCochesTasa2025, 0.05],
    ["percepción vs boletín ENVIPE", percepcion.nacional ?? NaN, ANCLAS.percepcionNacional, 0.06],
    ["escolaridad vs Censo", escolaridad.nacional ?? NaN, ANCLAS.escolaridadNacional, 0.05],
  ];
  for (const [nombre, obtenido, esperado, tol] of cruces) {
    if (!aprox(obtenido, esperado, tol)) {
      throw new Error(`Cruce fallido ${nombre}: obtenido ${obtenido}, publicado ${esperado}`);
    }
    console.log(`[indicadores] cruce OK — ${nombre}: ${obtenido} ≈ ${esperado}`);
  }

  // -------------------------------------------------------------------
  // Emisión
  // -------------------------------------------------------------------
  const bloques = defs.map((d) => {
    const fmt = FORMATOS[d.formato];
    const { asignacion, rangos } = quintiles(d.valores);
    const valoresFmt: Record<Clave, string> = {};
    for (const c of CLAVES) valoresFmt[c] = fmt.valor(d.valores[c]);
    const rangosFmt = rangos.map(([a, b]) => [fmt.leyenda(a), fmt.leyenda(b)]);
    const nacionalFmt = fmt.valor(d.nacional);
    const proc = d.procedencia.map((l) => `  // ${l}`).join("\n");
    return `${proc}\n  {\n    id: ${JSON.stringify(d.id)},\n    grupo: ${JSON.stringify(d.grupo)},\n    nombre: ${JSON.stringify(d.nombre)},\n    unidad: ${JSON.stringify(d.unidad)},\n    tooltipSufijo: ${JSON.stringify(d.tooltipSufijo)},\n    periodo: ${JSON.stringify(d.periodo)},\n    fuenteCita: ${JSON.stringify(d.fuenteCita)},\n    valorNacional: ${JSON.stringify(d.nacional)},\n    valorNacionalFmt: ${JSON.stringify(nacionalFmt)},\n    valores: ${JSON.stringify(d.valores)},\n    valoresFmt: ${JSON.stringify(valoresFmt)},\n    quintil: ${JSON.stringify(asignacion)},\n    rangosQuintil: ${JSON.stringify(rangosFmt)},\n  },`;
  });

  const modulo = `// Datos estatales de la coropleta de la home — ${defs.length} indicadores.
// ARCHIVO GENERADO por scripts/build-mapa-indicadores.ts — no editar a mano.
// Cero transcripción: cada valor fue extraído programáticamente de su fuente
// oficial y cruzado contra la cifra nacional publicada (el generador aborta
// si el cruce falla). La procedencia por indicador (fuente, serie, URL,
// SHA-256 del archivo fuente) acompaña a cada bloque.
// Quintiles: rank sobre los 32 valores (grupos 7-6-6-6-7, ascendente);
// empates comparten el quintil inferior. Formateo es-MX precomputado.
// Fecha de extracción: ${hoy}.

import type { ClaveEntidad } from "./estados-geometria";

export type IndicadorId =
  ${defs.map((d) => JSON.stringify(d.id)).join(" | ")};

export interface IndicadorMapa {
  id: IndicadorId;
  grupo: "laboral" | "panorama";
  nombre: string;
  unidad: string;
  tooltipSufijo: string;
  periodo: string;
  fuenteCita: string;
  valorNacional: number;
  valorNacionalFmt: string;
  valores: Record<ClaveEntidad, number>;
  valoresFmt: Record<ClaveEntidad, string>;
  quintil: Record<ClaveEntidad, 1 | 2 | 3 | 4 | 5>;
  rangosQuintil: [string, string][];
}

export const GRUPOS: Record<IndicadorMapa["grupo"], string> = {
  laboral: "Tríada laboral",
  panorama: "Panorama general",
};

export const INDICADOR_DEFAULT: IndicadorId = "informalidad";

export const INDICADORES: readonly IndicadorMapa[] = [
${bloques.join("\n")}
];
`;

  writeFileSync(OUT, modulo);
  const gz = gzipSync(Buffer.from(modulo)).length;
  console.log(
    `[indicadores] escrito ${path.relative(ROOT, OUT)} — ${(Buffer.byteLength(modulo) / 1024).toFixed(1)} KB (${(gz / 1024).toFixed(1)} KB gzip)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

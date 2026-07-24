// Capa humana del canon — registro dual (ver docs/principios-editoriales.md).
// Este módulo es la VOZ: nombres claros, frase explicativa nacional y
// tooltip humanizado por indicador. Es editable sin tocar el pipeline.
//
// Regla dura: ninguna frase afirma nada que su serie no afirme; los valores
// SIEMPRE llegan como parámetro desde indicadores-datos (aquí no vive ni una
// cifra). Los formateadores son deterministas (sin Intl) para que servidor y
// cliente rendericen idéntico.
//
// Nota de mantenimiento: la frase de escolaridad ancla "apenas pasa de la
// secundaria terminada" al valor vigente (~9.7 años; secundaria = 9). Al
// refrescar con la Intercensal 2025, revisar que la cláusula siga siendo
// cierta.

import type { IndicadorId } from "./indicadores-datos";

export type GrupoPregunta = "vive-de" | "vive-como";

export const GRUPOS_PREGUNTA: Record<GrupoPregunta, string> = {
  "vive-de": "¿De qué se vive?",
  "vive-como": "¿Cómo se vive?",
};

// Orden editorial del selector: dos columnas de cinco.
export const ORDEN_CANON: Record<GrupoPregunta, IndicadorId[]> = {
  "vive-de": ["informalidad", "desempleo", "empleo-formal", "ingreso", "pobreza-laboral"],
  "vive-como": ["homicidios", "percepcion", "poblacion", "escolaridad", "pib"],
};

// --- formateadores deterministas -----------------------------------------

const de100 = (v: number) => String(Math.round(v));
const dec1 = (v: number) => (Math.round(v * 10) / 10).toFixed(1);
const comas = (v: number) =>
  String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const miles = (v: number) => comas(Math.round(v / 1000));
const millones = (v: number) => dec1(v / 1e6);

// "1T 2026" → "inicios de 2026"; "jun 2026" → "junio de 2026".
const MESES: Record<string, string> = {
  ene: "enero", feb: "febrero", mar: "marzo", abr: "abril", may: "mayo",
  jun: "junio", jul: "julio", ago: "agosto", sep: "septiembre",
  oct: "octubre", nov: "noviembre", dic: "diciembre",
};
const TRIMESTRES: Record<string, string> = {
  "1T": "inicios de", "2T": "mediados de", "3T": "la segunda mitad de", "4T": "el cierre de",
};
function periodoHumano(periodo: string): string {
  const t = periodo.match(/^([1-4]T) (\d{4})$/);
  if (t) return `${TRIMESTRES[t[1]]} ${t[2]}`;
  const m = periodo.match(/^([a-z]{3}) (\d{4})$/);
  if (m && MESES[m[1]]) return `${MESES[m[1]]} de ${m[2]}`;
  return periodo;
}

// --- copy por indicador ---------------------------------------------------

export interface CopyIndicador {
  nombreHumano: string;
  grupoPregunta: GrupoPregunta;
  frase: (valorNacional: number, periodo: string) => string;
  tooltip: (valor: number, periodo: string) => string;
}

export const COPY: Record<IndicadorId, CopyIndicador> = {
  informalidad: {
    nombreHumano: "Trabajo informal",
    grupoPregunta: "vive-de",
    frase: (v, p) =>
      `En México, ${de100(v)} de cada 100 personas que trabajan lo hacen en la informalidad: sin acceso a seguridad social por su empleo (${periodoHumano(p)}).`,
    tooltip: (v, p) => `${de100(v)} de cada 100 ocupados trabajan en la informalidad · ${p}`,
  },
  "pobreza-laboral": {
    nombreHumano: "El trabajo no alcanza para comer",
    grupoPregunta: "vive-de",
    frase: (v, p) =>
      `${de100(v)} de cada 100 personas viven en hogares donde lo que se gana trabajando no alcanza ni para la canasta alimentaria — aunque se gastara todo en comida (${periodoHumano(p)}).`,
    tooltip: (v, p) => `${de100(v)} de cada 100: el ingreso del hogar no cubre la canasta alimentaria · ${p}`,
  },
  "empleo-formal": {
    nombreHumano: "Empleo formal",
    grupoPregunta: "vive-de",
    frase: (v, p) =>
      `Hay ${de100(v)} puestos de trabajo formales —registrados en el IMSS— por cada 100 personas en edad de trabajar (${periodoHumano(p)}). Son puestos, no personas.`,
    tooltip: (v, p) => `${dec1(v)} puestos formales (IMSS) por cada 100 personas de 15+ · ${p}`,
  },
  ingreso: {
    nombreHumano: "Lo que deja el trabajo",
    grupoPregunta: "vive-de",
    frase: (v, p) =>
      `El trabajo deja $${comas(v)} al mes por persona, repartido entre todos los miembros del hogar (pesos de 2020, ${periodoHumano(p)}).`,
    tooltip: (v, p) => `el trabajo deja $${comas(v)} al mes por persona (pesos de 2020) · ${p}`,
  },
  desempleo: {
    nombreHumano: "Desempleo",
    grupoPregunta: "vive-de",
    frase: (v, p) =>
      `Solo ${dec1(v)} de cada 100 personas en la fuerza laboral buscan trabajo sin encontrarlo (${periodoHumano(p)}) — en México el desempleo es bajo hasta donde hay pobreza: sin seguro de desempleo, la gente se ocupa en lo que haya.`,
    tooltip: (v, p) => `${dec1(v)} de cada 100 en la fuerza laboral buscan empleo sin hallarlo · ${p}`,
  },
  homicidios: {
    nombreHumano: "Homicidios",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `En ${p} se registraron ${dec1(v)} víctimas de homicidio doloso por cada 100 mil habitantes. Es la cifra oficial de las fiscalías; el registro no captura todo.`,
    tooltip: (v, p) => `${dec1(v)} víctimas de homicidio por cada 100 mil habitantes · ${p}`,
  },
  percepcion: {
    nombreHumano: "Sentirse inseguro",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `${de100(v)} de cada 100 mexicanos adultos consideran inseguro vivir en su estado (ENVIPE, levantada en ${p}).`,
    tooltip: (v, p) => `${de100(v)} de cada 100 adultos consideran inseguro su estado · ${p}`,
  },
  poblacion: {
    nombreHumano: "Población",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `En México vivimos ${millones(v)} millones de personas (proyección oficial a mitad de ${p}).`,
    tooltip: (v, p) => `${comas(v)} habitantes · ${p}`,
  },
  escolaridad: {
    nombreHumano: "Años de escuela",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `El mexicano promedio de 15 años o más estudió ${dec1(v)} años: apenas pasa de la secundaria terminada (${p}; se actualiza con la Intercensal en sep 2026).`,
    tooltip: (v, p) => `${dec1(v)} años de escuela en promedio · ${p}`,
  },
  pib: {
    nombreHumano: "Producción por habitante",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `La economía mexicana produjo en ${p} el equivalente a ${miles(v)} mil pesos por habitante. Mide producción, no lo que gana la gente.`,
    tooltip: (v, p) => `su economía produce $${comas(v)} al año por habitante · ${p}`,
  },
};

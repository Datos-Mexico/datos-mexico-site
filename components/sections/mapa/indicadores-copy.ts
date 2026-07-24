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
// Serie en tasa por 100 mil → "N de cada 100" en la capa humana.
const de100k = (v: number) => String(Math.round(v / 1000));
const dec1 = (v: number) => (Math.round(v * 10) / 10).toFixed(1);
const dec3 = (v: number) => (Math.round(v * 1000) / 1000).toFixed(3);
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
  // Micro-etiqueta para la retícula de la mini-ficha de estado (F4):
  // corta, en minúsculas, con la unidad insinuada donde hace falta.
  fichaLabel: string;
  grupoPregunta: GrupoPregunta;
  frase: (valorNacional: number, periodo: string) => string;
  tooltip: (valor: number, periodo: string) => string;
}

export const COPY: Record<IndicadorId, CopyIndicador> = {
  informalidad: {
    fichaLabel: "trabajo informal",
    nombreHumano: "Trabajo informal",
    grupoPregunta: "vive-de",
    frase: (v, p) =>
      `En México, ${de100(v)} de cada 100 personas que trabajan lo hacen en la informalidad: sin acceso a seguridad social por su empleo (${periodoHumano(p)}).`,
    tooltip: (v, p) => `${de100(v)} de cada 100 ocupados trabajan en la informalidad · ${p}`,
  },
  "pobreza-laboral": {
    fichaLabel: "no alcanza para comer",
    nombreHumano: "El trabajo no alcanza para comer",
    grupoPregunta: "vive-de",
    frase: (v, p) =>
      `${de100(v)} de cada 100 personas viven en hogares donde lo que se gana trabajando no alcanza ni para la canasta alimentaria — aunque se gastara todo en comida (${periodoHumano(p)}).`,
    tooltip: (v, p) => `${de100(v)} de cada 100: el ingreso del hogar no cubre la canasta alimentaria · ${p}`,
  },
  "empleo-formal": {
    fichaLabel: "empleo formal /100",
    nombreHumano: "Empleo formal",
    grupoPregunta: "vive-de",
    frase: (v, p) =>
      `Hay ${de100(v)} puestos de trabajo formales —registrados en el IMSS— por cada 100 personas en edad de trabajar (${periodoHumano(p)}). Son puestos, no personas.`,
    tooltip: (v, p) => `${dec1(v)} puestos formales (IMSS) por cada 100 personas de 15+ · ${p}`,
  },
  ingreso: {
    fichaLabel: "deja el trabajo /mes",
    nombreHumano: "Lo que deja el trabajo",
    grupoPregunta: "vive-de",
    frase: (v, p) =>
      `El trabajo deja $${comas(v)} al mes por persona, repartido entre todos los miembros del hogar (pesos de 2020, ${periodoHumano(p)}).`,
    tooltip: (v, p) => `el trabajo deja $${comas(v)} al mes por persona (pesos de 2020) · ${p}`,
  },
  desempleo: {
    fichaLabel: "desempleo",
    nombreHumano: "Desempleo",
    grupoPregunta: "vive-de",
    frase: (v, p) =>
      `Solo ${dec1(v)} de cada 100 personas en la fuerza laboral buscan trabajo sin encontrarlo (${periodoHumano(p)}). El desempleo bajo no es bienestar: sin seguro de desempleo, la gente se ocupa en lo que haya.`,
    tooltip: (v, p) => `${dec1(v)} de cada 100 en la fuerza laboral buscan empleo sin hallarlo · ${p}`,
  },
  homicidios: {
    fichaLabel: "homicidios /100 mil",
    nombreHumano: "Homicidios",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `En ${p} se registraron ${dec1(v)} víctimas de homicidio doloso por cada 100 mil habitantes. Es la cifra oficial de las fiscalías; el registro no captura todo.`,
    tooltip: (v, p) => `${dec1(v)} víctimas de homicidio por cada 100 mil habitantes · ${p}`,
  },
  // El renglón más delicado del canon: cuenta feminicidio + homicidio doloso
  // con víctima mujer porque separarlos compararía criterios de tipificación
  // de fiscalías, no violencia (evidencia y dictamen de la Ola 2).
  "mujeres-asesinadas": {
    fichaLabel: "asesinadas /100 mil mujeres",
    nombreHumano: "Mujeres asesinadas",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `En ${p} fueron asesinadas ${dec1(v)} de cada 100 mil mujeres en México, contando juntos feminicidios y homicidios dolosos: separarlos compararía el criterio de cada fiscalía, no la violencia. Es registro de fiscalías; no captura todo.`,
    tooltip: (v, p) => `${dec1(v)} mujeres asesinadas (feminicidio + homicidio doloso) por cada 100 mil mujeres · ${p}`,
  },
  // La cláusula "los más comunes" está anclada al top-3 nacional de
  // incidencia (ENVIPE, cuadro 1.13); el pipeline aborta si cambia.
  "victimas-delito": {
    fichaLabel: "víctimas /100 mil adultos",
    nombreHumano: "Víctimas de delito",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `${de100k(v)} de cada 100 adultos fueron víctimas de algún delito durante ${p} — fraude, extorsión y robo o asalto en la calle o el transporte público son los más comunes (ENVIPE). Al venir de encuesta y no de denuncias, cuenta también lo que nunca llegó a una fiscalía.`,
    tooltip: (v, p) => `${de100k(v)} de cada 100 adultos fueron víctimas de un delito · ${p}`,
  },
  "robo-coches": {
    fichaLabel: "robos de coche /100 mil",
    nombreHumano: "Robo de coches",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `En ${p} se abrieron ${dec1(v)} carpetas por robo de coche por cada 100 mil habitantes. Es de los delitos que más se denuncian — el seguro lo exige —, así que su registro se acerca a la realidad más que el de otros delitos.`,
    tooltip: (v, p) => `${dec1(v)} carpetas por robo de coche por cada 100 mil habitantes · ${p}`,
  },
  // Los seis "derechos básicos" de la frase son exactamente las seis
  // carencias sociales de la medición (rezago educativo, salud, seguridad
  // social, calidad de la vivienda, servicios básicos, alimentación).
  pobreza: {
    fichaLabel: "en pobreza /100",
    nombreHumano: "Pobreza",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `${de100(v)} de cada 100 personas viven en pobreza según la medición oficial: su ingreso no alcanza para lo indispensable y además les falta al menos uno de seis derechos básicos — escuela, salud, seguridad social, vivienda digna, servicios en casa o comida (${p}).`,
    tooltip: (v, p) => `${de100(v)} de cada 100 personas viven en pobreza (medición multidimensional) · ${p}`,
  },
  "pobreza-extrema": {
    fichaLabel: "en pobreza extrema /100",
    nombreHumano: "Pobreza extrema",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `${dec1(v)} de cada 100 personas viven en pobreza extrema: ni gastando todo su ingreso en comida cubrirían la canasta alimentaria, y además les faltan tres o más de los seis derechos básicos (${p}).`,
    tooltip: (v, p) => `${dec1(v)} de cada 100 personas viven en pobreza extrema · ${p}`,
  },
  "falta-comida": {
    fichaLabel: "les falta comida /100",
    nombreHumano: "Falta de comida",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `${de100(v)} de cada 100 personas viven en hogares donde por falta de dinero se comió poco, mal o con angustia de que no alcanzara: la carencia oficial de acceso a la alimentación (${p}). Son personas, no hogares.`,
    tooltip: (v, p) => `${de100(v)} de cada 100 personas viven en hogares donde falta comida · ${p}`,
  },
  // El "$N al mes" es derivado en módulo (trimestral ÷ 3, redondeado):
  // condición mecánica del dictamen — jamás hardcodeado.
  "ingreso-hogar": {
    fichaLabel: "junta un hogar /trimestre",
    nombreHumano: "Lo que junta un hogar",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `Un hogar junta en promedio $${comas(v)} al trimestre — unos $${comas(v / 3)} al mes — sumando sueldos, negocios, apoyos y lo no monetario, como el valor de vivir en casa propia (ENIGH, pesos de ${p}).`,
    tooltip: (v, p) => `un hogar junta $${comas(v)} al trimestre en promedio · ${p}`,
  },
  // La cláusula "14 veces" está anclada al ratio de deciles X/I del mismo
  // Cuadro 2.1 (rango duro [13.5, 14.5] en el pipeline; aborta si se mueve).
  gini: {
    fichaLabel: "desigualdad (Gini 0-1)",
    nombreHumano: "Desigualdad",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `Los hogares del décimo más rico juntan 14 veces lo que los del décimo más pobre. El coeficiente de Gini resume esa concentración en ${dec3(v)}, en una escala donde 0 es ingreso parejo y 1 es todo en un solo hogar (${p}).`,
    tooltip: (v, p) => `Gini de ${dec3(v)}: 0 = ingreso parejo, 1 = todo en un hogar · ${p}`,
  },
  percepcion: {
    fichaLabel: "se sienten inseguros",
    nombreHumano: "Sentirse inseguro",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `${de100(v)} de cada 100 mexicanos adultos consideran inseguro vivir en su estado (ENVIPE, levantada en ${p}).`,
    tooltip: (v, p) => `${de100(v)} de cada 100 adultos consideran inseguro su estado · ${p}`,
  },
  poblacion: {
    fichaLabel: "habitantes",
    nombreHumano: "Población",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `En México vivimos ${millones(v)} millones de personas (proyección oficial a mitad de ${p}).`,
    tooltip: (v, p) => `${comas(v)} habitantes · ${p}`,
  },
  escolaridad: {
    fichaLabel: "años de escuela",
    nombreHumano: "Años de escuela",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `El mexicano promedio de 15 años o más estudió ${dec1(v)} años: apenas pasa de la secundaria terminada (${p}; se actualiza con la Intercensal en sep 2026).`,
    tooltip: (v, p) => `${dec1(v)} años de escuela en promedio · ${p}`,
  },
  pib: {
    fichaLabel: "produce /hab",
    nombreHumano: "Producción por habitante",
    grupoPregunta: "vive-como",
    frase: (v, p) =>
      `La economía mexicana produjo en ${p} el equivalente a ${miles(v)} mil pesos por habitante. Mide producción, no lo que gana la gente.`,
    tooltip: (v, p) => `su economía produce $${comas(v)} al año por habitante · ${p}`,
  },
};

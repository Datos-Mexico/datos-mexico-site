/* Contenido del journey "Tu retiro" — copy portado VERBATIM del original
   (journey.v2.js). La extracción es estructural, no editorial: las únicas
   transformaciones son (a) branding del origen → observatorio Datos México,
   (b) hrefs remapeados a /pensiones/calculadoras/* y a la serie SAR-29,
   (c) 5.5: se omiten `course`/`resource` (cards de curso/guía del Frente 5
   que no se portan por veracidad). El texto sustantivo no cambia. */

export type Segment = {
  key: string;
  name: string;
  desc: string;
  enganche: { title: string; body: string };
};

export const SEGMENTS: Record<string, Segment> = {
  lt35: {
    key: "jovenes",
    name: "Construyendo desde temprano",
    desc: "Tu activo más poderoso es el tiempo. El sistema mexicano de retiro tiene 28 años de trayectoria bajo el esquema de cuentas individuales —tu generación es la primera que lo recorrerá completo.",
    enganche: {
      title: "El retiro no se improvisa. Se diseña, y ese diseño empieza con tu primer ahorro.",
      body: "En tu etapa no hace falta ahorrar mucho —hace falta empezar. El SAR mexicano administraba 8.3 billones de pesos al cierre de 2025, equivalentes a 23.8% del PIB; ese sistema es el que recibirá tus aportaciones durante las próximas cuatro décadas. Lo que decides hoy sobre cuánto aportar, dónde y con qué constancia, define el saldo que verás al final de un horizonte largo.",
    },
  },
  "35_49": {
    key: "adultos",
    name: "Ajustando el rumbo",
    desc: "Estás en la ventana donde más se puede hacer: tienes tiempo y capacidad para construir el retiro que quieres, y la información del sistema ya te permite tomar decisiones concretas en lugar de aspiracionales.",
    enganche: {
      title: "Tienes tiempo, pero también tienes datos. Es el momento de decidir con los dos.",
      body: "En tu etapa, la diferencia entre actuar hoy y postergar diez años es matemática, no opinión. La reforma de pensiones de 2020 cambia las reglas para quienes coticen sus últimos años bajo el régimen reformado —aumenta progresivamente la aportación patronal entre 2023 y 2030 y reduce el requisito de semanas cotizadas de 1,250 a 750. Esto te afecta directamente; el siguiente paso es ver dónde estás parado.",
    },
  },
  "50_64": {
    key: "pre-retiro",
    name: "Aterrizando decisiones",
    desc: "Este es el momento de poner números, fechas y decisiones sobre la mesa. Si cotizaste antes de julio de 1997 puedes elegir entre Ley 73 y Ley 97 al jubilarte, y esa elección define el resto.",
    enganche: {
      title: "Es hora de aterrizar fechas, números y la decisión que define tu retiro.",
      body: "En tu etapa, posponer el retiro tres años puede mover la pensión mensual hacia arriba de forma significativa, y la elección entre Ley 73 y Ley 97 (si te aplica) puede cambiar la naturaleza misma de tu pensión —de salario promedio garantizado a saldo acumulado en cuenta individual. No son opciones intercambiables. Veamos un panorama claro con los datos que tienes.",
    },
  },
  gte65: {
    key: "jubilados",
    name: "Diseñando esta etapa",
    desc: "Tu retiro también se diseña, se administra y se disfruta. El reto cambia de naturaleza: ya no es acumular; es hacer durar lo construido, protegerlo de la inflación y la longevidad, y vivir esta etapa con sentido.",
    enganche: {
      title: "Tu retiro sigue siendo una etapa que puedes diseñar. La pregunta cambia: no es cuánto tendrás, es cómo administrar lo que tienes.",
      body: "En 2025 el rendimiento real estimado del sistema fue de aproximadamente 9% —es decir, los recursos administrados crecieron más rápido que la inflación (3.69%). Para quien ya está jubilado, esto importa porque define el ritmo al que se puede retirar capital sin agotar el fondo. Si te jubilaste bajo Ley 73, tu pensión está protegida; si fue bajo Ley 97 con renta vitalicia o retiros programados, conviene revisar el escenario actuarial.",
    },
  },
};

export type Worry = { shortLabel: string; acknowledge: string; inReading: string };

export const WORRIES: Record<string, Worry> = {
  cuanto_voy: {
    shortLabel: "cuánto vas a recibir",
    acknowledge: "Querías una primera estimación de cuánto podrías recibir al jubilarte.",
    inReading: "Esto responde a tu pregunta principal: la cifra de arriba es la primera lectura de cuánto podrías recibir. Es ilustrativa, no actuarial.",
  },
  cuanto_necesito: {
    shortLabel: "cuánto vas a necesitar",
    acknowledge: "Querías saber cuánto necesitarías para el retiro que quieres.",
    inReading: "Esto se conecta con tu pregunta: la barra azul de la gráfica estima el ingreso necesario (~75% de tu salario es la lectura clásica para el SAR mexicano); la dorada estima lo que recibirías; la distancia entre ambas es tu brecha.",
  },
  que_me_falta: {
    shortLabel: "qué te falta para el retiro que quieres",
    acknowledge: "Querías saber qué te falta para el retiro que quieres.",
    inReading: "Tu pregunta era directa: qué falta. La distancia entre lo que necesitarías y lo estimado es exactamente esa brecha, y su magnitud depende de las decisiones que tomes desde hoy.",
  },
  que_hago_hoy: {
    shortLabel: "qué puedes hacer desde hoy",
    acknowledge: "Querías saber qué puedes hacer desde hoy.",
    inReading: "Tu pregunta es la más práctica: qué hacer ya. Los tres datos del sistema de abajo dan contexto a las decisiones que están a tu alcance —aportar voluntariamente, revisar tu AFORE, planificar tu fecha de retiro.",
  },
  como_sera: {
    shortLabel: "cómo será tu vida en el retiro",
    acknowledge: "Querías una idea de cómo será tu vida cuando te retires.",
    inReading: "Tu pregunta es más amplia que la cifra: cómo será la vida en retiro. La cifra del SAR responde solo al ingreso; la otra capa —estilo de vida, salud, propósito, relaciones— es la que hace que dos retiros del mismo monto se vivan muy distinto.",
  },
};

export type WorkContext = { calcFraming: string; insight: string };

export const WORK_CONTEXTS: Record<string, WorkContext> = {
  empleado: {
    calcFraming: "Eres asalariado: tu patrón aporta a tu AFORE de forma obligatoria. Las semanas cotizadas avanzan automáticamente mes con mes.",
    insight: "Como asalariado, las aportaciones obligatorias siguen contribuyendo sin que tengas que hacer nada extra; la reforma 2020 está subiéndolas progresivamente entre 2023 y 2030, lo cual mejora tu cifra real frente a esta estimación.",
  },
  independiente: {
    calcFraming: "Eres independiente o por honorarios: no hay un patrón aportando a tu AFORE; eres tú quien decide aportar.",
    insight: "Como independiente, las aportaciones voluntarias dejan de ser opcionales y se vuelven la pieza central. Cada peso que aportes hoy tiene efecto compuesto durante años; la deducción fiscal asociada (hasta los topes que marca la Ley) reduce el costo efectivo de aportar.",
  },
  mixto: {
    calcFraming: "Tu situación es mixta: combinas ingresos formales (patrón aportando) con ingresos independientes (tú decides aportar).",
    insight: "Tu situación mixta es la más común y la menos visibilizada del SAR: tienes la base del sistema formal y la flexibilidad de aportar más por tu cuenta. La estrategia útil es aprovechar ambos canales, no asumir que el formal solo basta.",
  },
  transicion: {
    calcFraming: "Estás en transición: cuando vuelvas a tener actividad formal, las semanas cotizadas y el saldo seguirán desde donde quedaron.",
    insight: "En transición tu plan se pone en pausa, no se reinicia: las semanas y el saldo quedan ahí. Cuando retomes actividad, retomas la trayectoria —y conviene revisar el saldo y la AFORE antes de hacerlo.",
  },
  jubilado: {
    calcFraming: "Ya estás jubilado o pensionado: tu pensión real está dada por tu régimen y tu trayectoria. Este cálculo es solo referencia comparativa.",
    insight: "Como ya jubilado, esta estimación es informativa, no determinante para ti. El foco práctico se mueve a administrar bien lo que tienes —ritmo de retiro, longevidad, gastos médicos.",
  },
};

export type SystemAnchor = {
  label: string;
  value: string;
  unit: string;
  detail: string;
  sourceLabel: string;
  sourceLink: string;
};

/* Anclas reales al sistema. La cita al Panorama 2025 (originalmente el paper
   016) apunta a su equivalente DM-SAR-2025 según el mapa de renombre de F1. */
export const SYSTEM_ANCHORS: Record<string, SystemAnchor> = {
  tamano: {
    label: "Tamaño del sistema",
    value: "8.3 billones",
    unit: "de pesos al cierre de 2025",
    detail: "23.8% del PIB. El SAR creció 22.1% en 2025 respecto a 2024.",
    sourceLabel: "Panorama 2025",
    sourceLink: "/pensiones/sar-29/DM-SAR-2025.html",
  },
  comisiones: {
    label: "Comisiones a la baja",
    value: "0.547%",
    unit: "comisión promedio (2025)",
    detail: "Era ~1.55% en 2010. En 17 años bajó casi 1 punto porcentual; tu saldo final se beneficia de esa trayectoria.",
    sourceLabel: "Panoramas 2010–2025",
    sourceLink: "/pensiones/sar-29/DM-SAR-2025.html",
  },
  rendimiento: {
    label: "Rendimiento real 2025",
    value: "~9%",
    unit: "por encima de la inflación",
    detail: "Rendimiento nominal estimado del sistema ~13%; inflación 3.69%. Los ahorros del sistema preservaron y aumentaron su poder adquisitivo.",
    sourceLabel: "Panorama 2025",
    sourceLink: "/pensiones/sar-29/DM-SAR-2025.html",
  },
  reforma2020: {
    label: "Reforma 2020",
    value: "1,250 → 750",
    unit: "semanas cotizadas requeridas",
    detail: "La reforma publicada en diciembre de 2020 redujo el requisito y aumenta progresivamente la aportación patronal entre 2023 y 2030.",
    sourceLabel: "Panorama 2025",
    sourceLink: "/pensiones/sar-29/DM-SAR-2025.html",
  },
  cuentas: {
    label: "Cuentas en el sistema",
    value: "77.77 M",
    unit: "cuentas individuales (2025)",
    detail: "69.4 millones clasificadas como activas (con al menos una aportación en los últimos 12 meses).",
    sourceLabel: "Panorama 2025",
    sourceLink: "/pensiones/sar-29/DM-SAR-2025.html",
  },
  fpb: {
    label: "Alternativa sin comisión",
    value: "FPB",
    unit: "opera desde 2024",
    detail: "El Fondo de Pensiones para el Bienestar es alternativa sin comisión a las AFOREs comerciales; 2025 fue su primer año completo de operación.",
    sourceLabel: "Panorama 2025",
    sourceLink: "/pensiones/sar-29/DM-SAR-2025.html",
  },
};

/* Plantillas de lectura (paso 4). Copy verbatim; el observatorio es el
   sujeto que "estudia el sistema". */
export const READING = {
  lead: {
    verde: (coverage: number) =>
      `Tu pensión estimada cubriría aproximadamente el ${coverage}% del ingreso que probablemente necesitarás en el retiro. Estás en zona razonable, lo cual no significa "ya está hecho": significa que tienes una base sobre la que ahora conviene proteger y optimizar.`,
    amarillo: (coverage: number) =>
      `Tu pensión estimada cubriría aproximadamente el ${coverage}% del ingreso que probablemente necesitarás. Hay brecha, pero es manejable. Las decisiones que tomes en los próximos años pueden cerrar buena parte de ella.`,
    rojo: (coverage: number) =>
      `Tu pensión estimada cubriría aproximadamente el ${coverage}% del ingreso que probablemente necesitarás. La brecha es importante, y eso es información, no veredicto: reconocerla a tiempo es la diferencia entre llegar al retiro con un plan y llegar sin uno.`,
  },
  lente: {
    ley73: " Si tu situación efectivamente queda bajo Ley 73 al jubilarte, tu pensión se calcula sobre tu salario promedio de los últimos cinco años cotizados, no sobre el saldo de tu cuenta individual. Esto cambia la lectura: el saldo deja de ser el indicador central; lo es la trayectoria salarial y las semanas cotizadas. La elección Ley 73 vs Ley 97 al momento del retiro la define la ley, pero quien cotizó antes de julio de 1997 conserva el derecho a optar por el régimen que le convenga.",
    ley97: " Bajo Ley 97, tu pensión depende del saldo que acumules en tu cuenta individual. La reforma de pensiones de 2020 está aumentando progresivamente la aportación patronal entre 2023 y 2030 —los estudios Panorama del SAR documentan esta trayectoria—, lo cual mueve las tasas de reemplazo al alza para quienes coticen sus últimos años bajo el régimen reformado. Tu cifra estimada no incorpora aún el efecto completo de esa transición; el cálculo real será mejor para muchos casos.",
    no_se: " Las dos vías legales tienen lógicas distintas: bajo Ley 73 la pensión se calcula sobre salario promedio; bajo Ley 97 sobre el saldo de tu cuenta individual. La elección depende de cuándo empezaste a cotizar. Aclarar tu régimen es uno de los primeros pasos prácticos —y nadie debería decirte qué te conviene sin haber visto tu situación concreta.",
  } as Record<string, string>,
  matiz: {
    lt35: " En tu etapa, el activo principal es el tiempo: el interés compuesto trabaja a tu favor durante décadas, y entras a un sistema donde las comisiones cayeron de ~1.55% (2010) a 0.547% (2025) —cada punto base que pagas menos en comisión es un punto base más que se queda en tu cuenta.",
    "35_49": " En tu etapa, decisiones tomadas ahora pesan más que las mismas decisiones tomadas en diez años. El sistema tiene 28 años de trayectoria bajo cuentas individuales y la información disponible permite planificar con realismo, no con esperanza.",
    "50_64": " Cada año cuenta y cada decisión tiene impacto cercano. Posponer el retiro unos años suele tener un efecto mayor en la pensión mensual que cualquier decisión de inversión en esta ventana; y si la opción Ley 73 / Ley 97 te aplica, esa decisión la tomas una sola vez en la vida.",
    gte65: " En esta etapa el foco se mueve de acumular a administrar: hacer durar lo construido, protegerlo de la longevidad y de los picos de gasto médico, y vivir esta etapa con sentido. En 2025 el sistema generó rendimientos reales estimados de ~9%, lo cual deja margen para retiros prudentes sin comprometer la base.",
  } as Record<string, string>,
};

/* Selección de anclas por perfil (idéntica al original). */
export function pickAnchorsFor(age: string | undefined, law: string): SystemAnchor[] {
  const ageKey = age || "lt35";
  const byAge: Record<string, string[]> = {
    lt35: ["tamano", "comisiones", "rendimiento"],
    "35_49": ["comisiones", "reforma2020", "rendimiento"],
    "50_64": ["reforma2020", "comisiones", "cuentas"],
    gte65: ["rendimiento", "tamano", "fpb"],
  };
  let keys = byAge[ageKey] || byAge["35_49"];
  if (law === "ley73" && !keys.includes("cuentas")) {
    keys = ["tamano", "comisiones", "cuentas"];
  } else if (law === "ley97" && !keys.includes("reforma2020")) {
    keys = [...keys];
    keys[1] = "reforma2020";
  }
  return keys.map((k) => SYSTEM_ANCHORS[k]).filter(Boolean);
}

/* Prefill y rutas de CTA por etapa. Rutas remapeadas a las 10 calculadoras
   publicadas bajo /pensiones/calculadoras/*. */
export const PREFILL_AGE: Record<string, number> = { lt35: 30, "35_49": 42, "50_64": 57, gte65: 67 };
export const PREFILL_YEARS: Record<string, number> = { lt5: 3, "5_10": 8, "11_20": 16, gt20: 25, no_se: 10 };

export const CALC_POR_ETAPA: Record<string, string> = {
  lt35: "/pensiones/calculadoras/ahorro",
  "35_49": "/pensiones/calculadoras/brecha",
  "50_64": "/pensiones/calculadoras/pension",
  gte65: "/pensiones/calculadoras/gasto-vida",
};

export const CALC_EXTRA_POR_ETAPA: Record<string, { href: string; texto: string }[]> = {
  lt35: [
    { href: "/pensiones/calculadoras/aportaciones", texto: "calculadora de aportaciones voluntarias" },
    { href: "/pensiones/calculadoras/interes-compuesto", texto: "calculadora de interés compuesto" },
  ],
  "35_49": [
    { href: "/pensiones/calculadoras/aportaciones", texto: "calculadora de aportaciones voluntarias" },
    { href: "/pensiones/calculadoras/reemplazo", texto: "calculadora de reemplazo de ingreso" },
  ],
  "50_64": [{ href: "/pensiones/calculadoras/elegibilidad", texto: "calculadora de elegibilidad de retiro" }],
  gte65: [{ href: "/pensiones/calculadoras/gastos-medicos", texto: "calculadora de gastos médicos en retiro" }],
};

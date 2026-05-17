import { SectionHeader } from "@/components/ui/SectionHeader";
import { Small } from "@/components/typography";
import { PipelineStep } from "./PipelineStep";

const steps = [
  {
    number: "01",
    title: "Ingesta y verificación de integridad",
    body:
      "Descargamos el dataset desde la fuente oficial (INEGI, CONSAR, Banxico, Datos Abiertos CDMX, etc.). Calculamos hash criptográfico (MD5 o SHA-256) del archivo descargado. Ese hash queda registrado en metadatos del observatorio y se vuelve a calcular en cada paso del pipeline.",
    example:
      "El CSV de recursos CONSAR (1998-2025) tiene MD5 19083c9a46d9d958b1428056c2f5f0b1. Ese mismo hash debe aparecer en el archivo original, en la base local Docker y en la base serverless Neon de producción. Si no coincide, hay un problema.",
  },
  {
    number: "02",
    title: "Carga en base de datos con esquema documentado",
    body:
      "El microdato se carga en PostgreSQL con un esquema explícito: tipos de columna, constraints, claves foráneas, catálogos de referencia. Cada tabla lleva un comentario SQL que apunta al diccionario de datos oficial de la fuente.",
    example:
      "Las tablas de ENIGH preservan los nombres y tipos del diccionario INEGI (folioviv, foliohog, factor, ing_cor). El catálogo de entidades federativas usa la clave INEGI 01-32, no nombres.",
  },
  {
    number: "03",
    title: "Procesamiento factor-weighted",
    body:
      "Las encuestas oficiales usan factores de expansión para pasar de la muestra al universo nacional. Aplicamos siempre la metodología oficial de la fuente — para INEGI, agregación factor-weighted (SUM(columna × factor) / SUM(factor)), no agregados muestrales simples ni NTILE. El método está documentado en el comunicado oficial de cada encuesta.",
  },
  {
    number: "04",
    title: "Validación cruzada contra publicación oficial",
    body:
      "Antes de exponer una cifra, la reproducimos contra la publicación oficial de la fuente. Cada validación documenta: la cifra calculada, la cifra oficial, el delta porcentual, y la tolerancia admisible. Si una validación falla, el dataset no se publica.",
    example:
      "Para ENIGH 2024 NS, las 13 cifras del Comunicado INEGI 112/25 (cuadro 2) se reproducen en nuestro pipeline con delta máximo de 0.078%. Las 13 validaciones quedan expuestas públicamente en el endpoint de validación de la API.",
  },
  {
    number: "05",
    title: "Publicación con metadatos embebidos",
    body:
      "La cifra llega al sitio acompañada de su nota metodológica: unidad, fuente, edición, fórmula, fecha de validación, link a la documentación oficial. Esa nota aparece en el componente que renderiza la cifra, no en una sección aparte que se pueda ignorar.",
  },
];

export function Pipeline() {
  return (
    <section id="pipeline" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="Pipeline técnico"
        title="Del archivo fuente a la cifra publicada."
        lead="Cada dataset que entra al observatorio recorre el mismo camino. Documentar este recorrido permite que cualquiera pueda replicarlo, auditarlo o señalar dónde estamos cometiendo errores."
      />

      <ol className="mt-14">
        {steps.map((s, i) => (
          <PipelineStep
            key={s.number}
            number={s.number}
            title={s.title}
            body={s.body}
            example={s.example}
            isLast={i === steps.length - 1}
          />
        ))}
      </ol>

      <Small className="mt-2 max-w-3xl text-[14px] leading-[1.6]">
        Este pipeline se aplica hoy a tres datasets en producción: ENIGH 2024
        Nueva Serie, recursos del SAR (CONSAR 1998–2025) y nombramientos del
        Gobierno de la Ciudad de México. Cada nuevo dataset que se incorpore al
        observatorio recorrerá el mismo camino antes de publicarse.
      </Small>
    </section>
  );
}

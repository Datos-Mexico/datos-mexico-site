import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body } from "@/components/typography";
import Link from "next/link";

const capas = [
  {
    n: "3.1",
    eyebrow: "El núcleo",
    title: "Misión propia.",
    body: [
      "La misión propia es la agenda de transparencia del observatorio sobre el aparato público y las realidades cuantificables de México. Es el trabajo de fondo: los ciclos temáticos profundos —pensiones, vivienda, salud pública, educación, seguridad, mercado laboral—, los papers académicos que respaldan cada ciclo, los datasets incorporados al SDK público, los artículos del corpus pregunta-respuesta que se publican uno a uno.",
      "Es el núcleo del observatorio. El resto de las capas existe para sostener, multiplicar o financiar este núcleo, no para reemplazarlo. Una organización cuyo trabajo central sean los encargos pagados sería una consultora con fachada académica; el observatorio es lo contrario: una agenda académica pública que se sostiene parcialmente con trabajo de encargo bajo reglas estrictas.",
    ],
  },
  {
    n: "3.2",
    eyebrow: "Músculo cívico",
    title: "Investigaciones express.",
    body: [
      "Las investigaciones express son trabajos de corto alcance que el observatorio toma por convicción cívica, gratuitos o casi. Responden preguntas acotadas —de medios, periodistas o ciudadanía— que requieren rigor pero no la profundidad de un ciclo completo. Su producto típico es un dossier de hechos verificados, una cronología trazable, un análisis de fuentes públicas.",
      "No son el pilar económico del observatorio. Existen porque hacerlas es coherente con la misión, porque generan presencia pública, porque construyen relaciones con periodistas y porque cimientan la reputación del observatorio como organismo al que se puede acudir. Son el músculo cívico del proyecto.",
    ],
    footnote: true,
  },
  {
    n: "3.3",
    eyebrow: "La crema",
    title: "Investigaciones profundas por encargo.",
    body: [
      "Las investigaciones profundas por encargo son trabajos prolongados, sostenidos en el tiempo, que producen hallazgos nuevos sobre opacidades reales. Toman meses; requieren acceso formal a información que un actor individual no puede solicitar; cruzan microdatos oficiales con archivo, con solicitudes de transparencia, con análisis técnico de profundidad.",
      "Esta capa es la que se cobra. Es trabajo de calidad y duración equivalente a la consultoría académica seria, y se cotiza con esa lógica. El cliente puede ser una fundación con agenda temática propia, una asociación empresarial con interés legítimo en un mercado, un despacho que requiere análisis técnico independiente, un medio que financia un reportaje de investigación largo.",
      "Lo que el cliente compra es trabajo riguroso producido bajo las reglas públicas del observatorio. Lo que el cliente no compra está descrito explícitamente en la siguiente sección.",
    ],
  },
];

export function TresCapas() {
  return (
    <section id="tres-capas" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="§3 · Tres capas, una sola misión"
        title="Tres formas de cumplir la misma misión."
        lead="El trabajo del observatorio se organiza en tres capas. No son un menú de servicios. Las describimos en orden de centralidad, no de volumen."
      />

      <ol className="mt-14 space-y-14 md:space-y-16">
        {capas.map((c) => (
          <li key={c.n} className="grid grid-cols-[auto_1fr] gap-x-6 md:gap-x-10">
            <span className="font-serif text-[32px] font-semibold leading-none text-accent tabular-nums md:text-[40px]">
              {c.n}
            </span>
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-subtle">
                {c.eyebrow}
              </p>
              <h3 className="mt-2 font-serif text-[22px] font-semibold leading-[1.3] text-foreground md:text-[26px]">
                {c.title}
              </h3>
              <div className="mt-5 space-y-5">
                {c.body.map((p, i) => (
                  <Body key={i} className="text-[16px] leading-[1.7]">
                    {p}
                  </Body>
                ))}
              </div>
              {c.footnote && (
                <p className="mt-5 font-sans text-[14px] leading-[1.6] text-text-subtle">
                  El primer caso público del observatorio bajo esta capa fue
                  el caso sobre los precios del jitomate y los contratos del
                  SuperISSSTE, atendido a partir de la pregunta original de
                  una periodista. Disponible en{" "}
                  <Link
                    href="/transparencia/001-jitomate-superissste"
                    prefetch={false}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    /transparencia
                  </Link>
                  .
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

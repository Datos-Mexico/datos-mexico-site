import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body } from "@/components/typography";

const reglas = [
  {
    titulo: "Quien encarga propone el tema y el alcance. Nunca el hallazgo.",
    cuerpo: (
      <>
        El cliente puede proponer la pregunta.{" "}
        <em className="text-foreground">
          “¿Cuál ha sido la trayectoria de los rendimientos de los bonos del
          gobierno en los últimos diez años?”
        </em>{" "}
        es pregunta.{" "}
        <em className="text-foreground">
          “Documenten que la trayectoria ha sido desfavorable”
        </em>{" "}
        no es pregunta: es conclusión presupuesta, y no es objeto de un
        encargo legítimo.
      </>
    ),
  },
  {
    titulo: "El observatorio elige si toma el encargo.",
    cuerpo:
      "El observatorio tiene misión propia y criterio propio. No acepta cualquier pedido. Un encargo se acepta cuando es coherente con la misión, cuando es técnicamente respondible con rigor académico, y cuando no compromete la independencia del observatorio frente a otros temas, otros actores o el corpus existente. Cuando un encargo no cumple estos criterios, se rechaza sin negociación.",
  },
  {
    titulo: "El método es público.",
    cuerpo:
      "La metodología bajo la que se responde la pregunta se publica. No hay método propietario, ni cláusula que oculte cómo se llegó al hallazgo. Quien encarga sabe, desde la firma, que la metodología es auditable por cualquier tercero bajo los mismos cinco principios académicos del Manifesto: verificabilidad, transparencia metodológica, honestidad sobre incertidumbre, trazabilidad de fuentes, disciplina de errata.",
  },
  {
    titulo: "Todo se publica abiertamente, salga lo que salga.",
    cuerpo:
      "El hallazgo del encargo se publica en el corpus público del observatorio, con la misma disciplina de citación, errata y trazabilidad que el resto. Se publica incluso si el hallazgo perjudica a quien encargó, incluso si contradice las hipótesis con las que el cliente llegó, incluso si confirma lo que el cliente preferiría que no se confirmara. La publicación abierta no es negociable y es parte explícita del precio.",
  },
];

export function ReglaIndependencia() {
  // La <section> rompe el contenedor por intención de diseño (fondo
  // full-bleed que distingue al §4 como corazón del documento). El
  // contenido debe ir DENTRO de un <Container> para alinearse con el
  // resto del documento — sin él, el HTML queda pegado al borde del
  // viewport y se ve desplazado respecto a §1–§3 y §5–§7.
  return (
    <section
      id="independencia"
      className="border-y border-border bg-muted/60 py-20 md:py-28"
    >
      <Container>
        <SectionHeader
          eyebrow="§4 · La regla de independencia"
          title="El corazón del modelo."
          lead="Es la regla que vuelve posible que el observatorio acepte financiamiento sin perder independencia, y la regla que cualquier cliente o financiador acepta por escrito antes de que el observatorio tome un encargo."
        />

        <ol className="mt-14 space-y-12">
          {reglas.map((r, i) => (
            <li
              key={i}
              className="max-w-3xl border-l-2 border-accent pl-6 md:pl-8"
            >
              <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
                {r.titulo}
              </h3>
              <Body className="mt-4 text-[16px] leading-[1.7]">{r.cuerpo}</Body>
            </li>
          ))}
        </ol>

        <div className="mt-16 max-w-3xl rounded-lg border border-foreground/20 bg-background px-8 py-10 md:px-12 md:py-12">
          <p className="font-serif text-[24px] font-semibold leading-[1.25] text-foreground md:text-[28px]">
            Lo que el observatorio vende es el rigor, no el silencio.
          </p>
          <Body className="mt-5 text-[16px] leading-[1.7]">
            Esta es la frase corta que resume las cuatro anteriores. Lo que se
            compra es trabajo riguroso, hecho a fondo, sobre una pregunta
            legítima. No se compra una conclusión preferida, ni se compra
            silencio sobre lo encontrado, ni se compra una versión maquillada
            de los hechos. El precio incluye el riesgo de que el hallazgo no le
            guste al cliente. Quien no acepta ese riesgo no es cliente del
            observatorio.
          </Body>
        </div>
      </Container>
    </section>
  );
}

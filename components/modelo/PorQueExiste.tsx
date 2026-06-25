import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body } from "@/components/typography";

export function PorQueExiste() {
  return (
    <section id="por-que-existe" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="§1 · Qué es y por qué existe"
        title="Infraestructura informacional pública sobre México."
      />

      <div className="mt-12 max-w-3xl space-y-6">
        <Body>
          El Observatorio Datos México es infraestructura informacional pública
          sobre México. No es think tank, no es consultora, no es medio de
          comunicación, no es institución de gobierno. Es un organismo
          académico cuya función es articular datos oficiales en respuestas
          verificables a preguntas que la sociedad mexicana tiene derecho a
          poder responder.
        </Body>
        <Body>
          Existe porque México tiene datos oficiales sustanciales —en INEGI,
          CONSAR, CONEVAL, Banxico, secretarías federales, gobiernos estatales
          y municipales— pero no tiene infraestructura accesible que los
          articule en respuestas concretas con metodología transparente. Esa
          carga recae hoy, una y otra vez, sobre cada periodista,
          investigador, estudiante o ciudadano interesado.
        </Body>
        <Body>
          Existe también en un momento particular del país. La desaparición
          del INAI dejó un vacío institucional en la garantía del derecho de
          acceso a la información pública. Ese vacío no es la razón de ser
          del observatorio —el observatorio existiría con o sin INAI—, pero
          sí define el horizonte público en el que opera: el costo civil de
          la opacidad subió, y la responsabilidad de organismos académicos
          independientes frente a los datos públicos subió con él.
        </Body>
      </div>
    </section>
  );
}

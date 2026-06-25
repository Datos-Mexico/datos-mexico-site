import { Check } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body } from "@/components/typography";

const formalizado = [
  "La identidad pública del observatorio y su dominio (datosmexico.org).",
  "La doctrina académica (MANIFESTO) y su gobernanza editorial (ARQUITECTURA-ARTICULOS, SCHEMA, CITACION, PROTOCOLO-PRENSA).",
  "El régimen operacional del corpus.",
  "Los compromisos públicos de gobernanza visibles en /quienes-somos.",
];

const enConstruccion = [
  "Constitución de la Asociación Civil (hoy en fase preparatoria, sin trámite formal iniciado).",
  "Estatutos formales y reglamento interno.",
  "Política formal de conflictos de interés y de aceptación o rechazo de encargos.",
  "Composición y funcionamiento de un consejo académico externo de revisión.",
  "Política formal de aceptación de apoyos filantrópicos, complementaria del §5.3.",
];

export function ModeloGobernanza() {
  return (
    <section id="gobernanza" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="§6 · Gobernanza y figura legal"
        title="Lo formalizado y lo que está en construcción."
      />

      <div className="mt-14 max-w-3xl space-y-12">
        <div>
          <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
            6.1 No-dependencia individual.
          </h3>
          <Body className="mt-4 text-[16px] leading-[1.7]">
            El observatorio no depende de ningún integrante en particular.
            Su continuidad está en la misión y en el método, no en personas
            individuales. Esta propiedad es deliberada y estructural: si una
            persona se incorpora, se aleja o cambia de rol, el observatorio
            sobrevive porque su identidad reside en la doctrina pública, en
            el corpus versionado, en los datasets reproducibles y en el
            método que vuelve cualquier afirmación auditable por un tercero.
          </Body>
          <Body className="mt-4 text-[16px] leading-[1.7]">
            El trabajo del observatorio lo sostiene un núcleo de personas
            comprometidas con la misión y una comunidad más amplia que
            participa en las sesiones abiertas, en la revisión académica,
            en la incorporación de datasets, en la discusión de los ciclos
            en curso. Esa comunidad fluctúa por construcción y es parte
            saludable del proyecto: una institución académica no se define
            por su headcount, sino por la disciplina con la que sostiene su
            trabajo a lo largo del tiempo.
          </Body>
        </div>

        <div>
          <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
            6.2 Figura legal.
          </h3>
          <Body className="mt-4 text-[16px] leading-[1.7]">
            El observatorio opera hoy de manera informal. Su intención
            formal es constituirse como Asociación Civil bajo la legislación
            mexicana. A la fecha de este documento, el trámite legal de
            constitución no ha sido iniciado: estamos en fase preparatoria,
            no en expediente abierto. Declararlo así es parte del
            compromiso de no sobreafirmar la institucionalidad del proyecto
            mientras se construye.
          </Body>
        </div>

        <div>
          <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
            6.3 Lo formalizado y lo en construcción.
          </h3>

          <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-text-subtle">
                Formalizado hoy
              </p>
              <ul className="mt-4 space-y-3">
                {formalizado.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check
                        className="h-3 w-3 text-primary"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="font-sans text-[15px] leading-[1.6] text-text">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-text-subtle">
                En construcción
              </p>
              <ul className="mt-4 space-y-3">
                {enConstruccion.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-1 inline-block h-5 w-5 flex-shrink-0 rounded-full border border-border"
                      aria-hidden="true"
                    />
                    <span className="font-sans text-[15px] leading-[1.6] text-text">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Body className="mt-8 text-[16px] leading-[1.7]">
            Este documento se actualizará explícitamente conforme cada uno
            de estos elementos quede formalizado. La transparencia sobre lo
            que aún no está construido es parte del compromiso del
            observatorio con quien lo lee.
          </Body>
        </div>
      </div>
    </section>
  );
}

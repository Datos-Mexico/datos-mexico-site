import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body } from "@/components/typography";

const firmes = [
  {
    n: "01",
    titulo: "Publicación de todo encargo aceptado.",
    cuerpo:
      "En el registro público del observatorio, con la pregunta original, las fuentes utilizadas, el equipo que ejecutó el trabajo y el hallazgo entregado.",
  },
  {
    n: "02",
    titulo: "Publicación de los apoyos filantrópicos recibidos.",
    cuerpo:
      "Con el nombre de la fundación, el monto, el periodo cubierto y la confirmación explícita de la cláusula de no-dirección de contenido (§5.3).",
  },
  {
    n: "03",
    titulo: "Errata pública.",
    cuerpo:
      "Sobre cualquier afirmación de este documento que requiera corrección, bajo el mismo régimen aplicable a los artículos del corpus.",
  },
];

export function Compromisos() {
  return (
    <section id="compromisos" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="§7 · Compromisos asociados"
        title="Tres compromisos firmes y un derecho reservado."
        lead="El observatorio asume públicamente, asociado a este modelo, los siguientes compromisos. Tres son firmes y aplican sin excepción; el cuarto reconoce un derecho del observatorio a comunicar, sujeto al criterio propio que rige cualquier decisión institucional."
      />

      <div className="mt-12 max-w-3xl space-y-10">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-text-subtle">
            Firmes
          </p>
          <ol className="mt-5 space-y-8">
            {firmes.map((c) => (
              <li
                key={c.n}
                className="grid grid-cols-[auto_1fr] gap-x-5 md:gap-x-7"
              >
                <span className="font-serif text-[24px] font-semibold leading-none text-accent tabular-nums md:text-[28px]">
                  {c.n}
                </span>
                <div>
                  <h3 className="font-serif text-[18px] font-semibold leading-[1.3] text-foreground md:text-[20px]">
                    {c.titulo}
                  </h3>
                  <Body className="mt-2 text-[16px] leading-[1.65]">
                    {c.cuerpo}
                  </Body>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 px-6 py-7 md:px-8 md:py-8">
          <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-text-subtle">
            Derecho reservado
          </p>
          <h3 className="mt-3 font-serif text-[18px] font-semibold leading-[1.3] text-foreground md:text-[20px]">
            04 · Comunicación pública de encargos rechazados, cuando proceda.
          </h3>
          <Body className="mt-3 text-[16px] leading-[1.65]">
            El observatorio podrá hacer público un encargo rechazado cuando
            el rechazo en sí mismo sea de interés público, con el motivo del
            rechazo. La decisión de comunicar queda en el criterio del
            observatorio, coherente con que el observatorio siempre elige
            (§3.3, §4). No se revela comunicación privada con quien
            encargó, salvo autorización expresa.
          </Body>
        </div>
      </div>
    </section>
  );
}

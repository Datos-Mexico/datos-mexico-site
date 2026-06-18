import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Mono, Small } from "@/components/typography";
import { asesores } from "@/lib/asesores";

export function Asesoria() {
  return (
    <section
      id="asesoria"
      className="border-b border-border py-20 md:py-24"
    >
      <Container>
        <SectionHeader
          eyebrow="Asesoría académica"
          title="Asesor del observatorio."
          lead="Profesor del ITAM que asesora al equipo en el desarrollo del observatorio."
        />

        {/* Lista deliberadamente sobria: la asesoría es una relación,
            no un sello institucional. Jerarquía tipográfica sutil:
            nombre destacado, rol e institución como metadatos. */}
        <ul className="mt-12 max-w-2xl divide-y divide-border border-y border-border">
          {asesores.map((a) => (
            <li
              key={a.id}
              className="grid grid-cols-1 gap-1 py-5 md:grid-cols-[1fr_auto] md:items-baseline md:gap-6"
            >
              <p className="font-serif text-[18px] font-medium leading-[1.3] text-foreground">
                {a.name}
              </p>
              <Mono className="md:text-right">{a.role} · {a.institution}</Mono>
            </li>
          ))}
        </ul>

        <Small className="mt-6 max-w-2xl">
          La asesoría es a título personal del profesor. El observatorio no
          representa al ITAM.
        </Small>
      </Container>
    </section>
  );
}

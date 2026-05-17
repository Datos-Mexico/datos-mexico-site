import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Small } from "@/components/typography";
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

        <ul className="mt-12 max-w-2xl space-y-8">
          {asesores.map((a) => (
            <li key={a.id}>
              <p className="font-sans text-[17px] font-medium text-foreground">
                {a.name}
              </p>
              <Small className="mt-1">
                {a.role} — {a.institution}
              </Small>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

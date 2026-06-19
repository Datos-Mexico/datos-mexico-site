import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Eyebrow } from "@/components/typography";
import { MemberCard } from "./MemberCard";
import { team, teamTagLabels, type TeamTag } from "@/lib/team";

type TierProps = {
  tag: TeamTag;
  description: string;
};

function Tier({ tag, description }: TierProps) {
  const members = team.filter((m) => m.tag === tag);
  if (members.length === 0) return null;

  return (
    <div>
      <header className="border-t border-border pt-10">
        <Eyebrow className="text-accent">{teamTagLabels[tag]}</Eyebrow>
        <Body className="mt-3 max-w-2xl text-[15px] leading-[1.6] text-text-subtle">
          {description}
        </Body>
      </header>

      {/* Grid responsivo: 1 col móvil, 2 col tablet, 3 col laptop, 5 col
          desktop. La fila de 5 absorbe el crecimiento del equipo sin que
          cada card abarque tanto espacio. */}
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

export function Equipo() {
  return (
    <section id="equipo" className="border-b border-border py-20 md:py-24">
      <Container>
        <SectionHeader
          eyebrow="Equipo"
          title="Quién está detrás del observatorio."
          lead="El observatorio se organiza en dos tiers: el equipo técnico fundador, que sostiene la infraestructura y la investigación cuantitativa; y el equipo del observatorio, que aporta a la investigación desde otras disciplinas."
        />

        <div className="mt-14 space-y-16">
          <Tier
            tag="equipo-tecnico-fundador"
            description="Estudiantes que iniciaron el proyecto y mantienen la base técnica: procesamiento de microdatos, validación, dashboards, código abierto."
          />
          <Tier
            tag="equipo-del-observatorio"
            description="Colaboradores que se integraron al observatorio desde economía, ciencia política, psicología y administración, ampliando el ámbito de la investigación."
          />
        </div>
      </Container>
    </section>
  );
}

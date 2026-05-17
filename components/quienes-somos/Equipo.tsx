import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MemberCard } from "./MemberCard";
import { team } from "@/lib/team";

export function Equipo() {
  return (
    <section id="equipo" className="border-b border-border py-20 md:py-24">
      <Container>
        <SectionHeader
          eyebrow="Equipo"
          title="Quién está detrás del observatorio."
          lead="Somos un equipo de 7 personas — estudiantes y egresados del ITAM — que trabajamos de manera horizontal en la investigación, infraestructura técnica y comunicación del observatorio."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </Container>
    </section>
  );
}

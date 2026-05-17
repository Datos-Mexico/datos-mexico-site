import { BookOpen, Database, Megaphone } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Small } from "@/components/typography";
import { AreaCard } from "./AreaCard";

const areas = [
  {
    icon: BookOpen,
    title: "Investigación y análisis",
    description:
      "Definimos las preguntas, procesamos los datos y escribimos los análisis. Esta área es responsable del rigor metodológico y de las publicaciones del observatorio.",
  },
  {
    icon: Database,
    title: "Datos e ingeniería",
    description:
      "Construimos y mantenemos la infraestructura técnica: pipelines de ingesta, validación contra fuentes oficiales, APIs públicas y los dashboards interactivos del observatorio.",
  },
  {
    icon: Megaphone,
    title: "Comunicación y operaciones",
    description:
      "Traducimos el trabajo técnico a un lenguaje accesible. Coordinamos publicaciones, redes sociales, vínculos con prensa y gestión interna del proyecto.",
  },
];

export function Areas() {
  return (
    <section id="areas" className="border-b border-border py-20 md:py-24">
      <Container>
        <SectionHeader
          eyebrow="Áreas de trabajo"
          title="Cómo nos organizamos."
          lead="El trabajo del observatorio se distribuye en tres áreas funcionales que colaboran de manera transversal."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {areas.map((a) => (
            <AreaCard
              key={a.title}
              icon={a.icon}
              title={a.title}
              description={a.description}
            />
          ))}
        </div>

        <Small className="mt-10 max-w-3xl">
          Hoy estas áreas funcionan de manera flexible — los miembros colaboran
          transversalmente. La estructura formal se irá consolidando con el
          crecimiento del equipo.
        </Small>
      </Container>
    </section>
  );
}

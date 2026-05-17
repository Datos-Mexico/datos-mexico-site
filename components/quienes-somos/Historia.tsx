import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Historia() {
  return (
    <section id="historia" className="border-b border-border py-20 md:py-24">
      <Container>
        <SectionHeader
          eyebrow="Historia"
          title="De Datos ITAM a Datos México."
        />

        <div className="mt-12 max-w-3xl space-y-7 font-sans text-[18px] leading-[1.75] text-text md:text-[19px]">
          <p>
            Datos México nació en Primavera 2026 como un proyecto académico
            dentro del ITAM, originalmente bajo el nombre de{" "}
            <strong className="font-semibold text-foreground">Datos ITAM</strong>.
            Lo que empezó como un ejercicio para procesar microdatos públicos y
            validarlos al peso contra publicaciones oficiales se fue ampliando hasta
            consolidarse como una infraestructura técnica seria: dashboards en vivo,
            validación automatizada, código abierto.
          </p>

          <p>
            A lo largo de cuatro meses construimos lo que hoy es la base del
            observatorio: el
            procesamiento de la ENIGH 2024, las series históricas del SAR desde 1998,
            el análisis salarial de los servidores públicos de la Ciudad de México,
            y las primeras lecturas cruzadas entre datasets. Esa infraestructura
            sigue viva en{" "}
            <a
              href="https://datos-itam.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              datos-itam.org
            </a>{" "}
            y será migrada progresivamente a este sitio.
          </p>

          <p>
            En abril 2026, para evitar riesgos asociados al uso del nombre
            institucional, el proyecto pasó a llamarse{" "}
            <strong className="font-semibold text-foreground">Datos México</strong>.
            El cambio coincide con un momento natural de expansión: dejamos de ser
            un proyecto académico privado y pasamos a posicionarnos como lo que
            somos — un observatorio público de datos sobre México, con alcance
            nacional y vocación de servicio.
          </p>

          <p>
            El equipo sigue siendo, casi en su totalidad, gente del ITAM. Pero la
            organización ya no es del ITAM, ni representa al ITAM. Somos un
            observatorio independiente.
          </p>
        </div>
      </Container>
    </section>
  );
}

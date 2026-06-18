import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Small } from "@/components/typography";

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
        </div>

        {/* Tríptico editorial del equipo en la sala de cómputo, día de la
            presentación oficial. Las tres fotos comparten el mismo set y
            funcionan como una sola unidad visual. */}
        <figure className="mt-14 md:mt-16">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted">
              <Image
                src="/quienes-somos/presentacion/sala-01.webp"
                alt="Integrantes del equipo de Datos México de pie en la sala de cómputo durante la presentación oficial."
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted">
              <Image
                src="/quienes-somos/presentacion/sala-02.webp"
                alt="Otro encuadre del equipo en la misma sala, durante la presentación oficial."
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted">
              <Image
                src="/quienes-somos/presentacion/sala-03.webp"
                alt="El equipo junto a un invitado adicional al cerrar la presentación."
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
          <figcaption className="mt-4">
            <Small>Día de la presentación del observatorio, sala de cómputo.</Small>
          </figcaption>
        </figure>

        <div className="mt-14 max-w-3xl space-y-7 font-sans text-[18px] leading-[1.75] text-text md:text-[19px]">
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
            organización ya no es del ITAM: somos un observatorio independiente.
          </p>
        </div>

        {/* Foto del set del auditorio del ITAM al mismo tamaño que cada
            imagen del tríptico de arriba. Sin caption. */}
        <figure className="mt-14 md:mt-16">
          <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-md border border-border bg-muted">
            <Image
              src="/quienes-somos/presentacion/auditorio.webp"
              alt="Escenario del auditorio del ITAM con la pantalla de Datos México de fondo."
              fill
              sizes="(min-width: 640px) 384px, 100vw"
              className="object-cover"
            />
          </div>
        </figure>

      </Container>
    </section>
  );
}

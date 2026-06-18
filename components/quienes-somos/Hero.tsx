import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Eyebrow, H1, H2, Lead, Body } from "@/components/typography";

export function QuienesSomosHero() {
  return (
    <section className="border-b border-border">
      {/* Desktop (md+): UNA sola foto entera del auditorio como fondo de la
          sección. Tres cards flotan encima: la introducción "Quiénes somos"
          arriba a la izquierda (sobre la madera + pantalla), y Misión +
          Visión abajo (sobre la fila de los rostros). El texto editorial
          real es lo que cubre las caras — no hay scrim sobre rostros, no
          hay blur, no hay recorte. La foto se conserva original y completa.
      */}
      <div className="relative hidden md:block">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src="/quienes-somos/presentacion/auditorio.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0">
            <Container className="flex h-full flex-col justify-between py-8 lg:py-12">
              <article className="max-w-2xl border border-border bg-background p-6 shadow-xl lg:p-8">
                <Eyebrow className="mb-3 text-accent">Quiénes somos</Eyebrow>
                <H1 className="text-[26px] leading-[1.15] md:text-[32px] lg:text-[40px]">
                  Un observatorio académico, transparente y en construcción.
                </H1>
                <Lead className="mt-4 text-[15px] leading-[1.5] lg:text-[17px] lg:leading-[1.55]">
                  Datos México es un observatorio independiente con respaldo
                  institucional del ITAM, formado por estudiantes, egresados y
                  colaboradores con experiencia en ciencia de datos, economía y
                  otras disciplinas. Trabajamos con microdatos oficiales y
                  publicamos análisis verificables, con metodología abierta y
                  sin agenda partidista.
                </Lead>
              </article>

              <div className="grid grid-cols-2 gap-5 lg:gap-8">
                <article className="border border-border bg-background p-5 shadow-xl lg:p-7">
                  <Eyebrow className="mb-2 text-accent">Misión</Eyebrow>
                  <H2 className="text-[20px] leading-[1.2] lg:text-[26px]">
                    Por qué existimos.
                  </H2>
                  <Body className="mt-3 text-[14px] leading-[1.55] lg:text-[15px] lg:leading-[1.6]">
                    Procesar, validar y poner al alcance de todos los datos
                    públicos de México, con rigor académico y claridad
                    expositiva, para que ciudadanía, prensa, academia y gobierno
                    tomen decisiones informadas.
                  </Body>
                </article>
                <article className="border border-border bg-background p-5 shadow-xl lg:p-7">
                  <Eyebrow className="mb-2 text-accent">Visión</Eyebrow>
                  <H2 className="text-[20px] leading-[1.2] lg:text-[26px]">
                    Hacia dónde vamos.
                  </H2>
                  <Body className="mt-3 text-[14px] leading-[1.55] lg:text-[15px] lg:leading-[1.6]">
                    Ser el observatorio de datos de referencia en México: el
                    lugar donde cualquier persona puede consultar, reproducir y
                    entender los números que describen al país.
                  </Body>
                </article>
              </div>
            </Container>
          </div>
        </div>
      </div>

      {/* Móvil (< md): foto arriba en aspect-[16/9], todo el texto en flujo
          normal debajo. La superposición no se sostiene en pantallas chicas. */}
      <div className="md:hidden">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src="/quienes-somos/presentacion/auditorio.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <Container>
          <div className="space-y-14 pt-12 pb-16">
            <div>
              <Eyebrow className="mb-4 text-accent">Quiénes somos</Eyebrow>
              <H1>Un observatorio académico, transparente y en construcción.</H1>
              <Lead className="mt-6">
                Datos México es un observatorio independiente con respaldo
                institucional del ITAM, formado por estudiantes, egresados y
                colaboradores con experiencia en ciencia de datos, economía y
                otras disciplinas. Trabajamos con microdatos oficiales y
                publicamos análisis verificables, con metodología abierta y sin
                agenda partidista.
              </Lead>
            </div>
            <div className="grid grid-cols-1 gap-12">
              <div>
                <Eyebrow className="mb-3 text-accent">Misión</Eyebrow>
                <H2>Por qué existimos.</H2>
                <Body className="mt-5 text-[17px] leading-[1.7]">
                  Procesar, validar y poner al alcance de todos los datos
                  públicos de México, con rigor académico y claridad expositiva,
                  para que ciudadanía, prensa, academia y gobierno tomen
                  decisiones informadas.
                </Body>
              </div>
              <div>
                <Eyebrow className="mb-3 text-accent">Visión</Eyebrow>
                <H2>Hacia dónde vamos.</H2>
                <Body className="mt-5 text-[17px] leading-[1.7]">
                  Ser el observatorio de datos de referencia en México: el lugar
                  donde cualquier persona puede consultar, reproducir y entender
                  los números que describen al país.
                </Body>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

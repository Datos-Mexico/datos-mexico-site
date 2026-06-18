import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Eyebrow, H1, H2, Lead, Body } from "@/components/typography";

export function QuienesSomosHero() {
  return (
    <section className="border-b border-border bg-background py-12 md:py-16 lg:py-20">
      <Container>
        {/* Desktop (md+): la foto vive contenida dentro del Container (no
            edge-to-edge). El bg blanco del sitio sigue visible a izquierda
            y derecha. Tres cards de cristal mate (light frosted glass) con
            backdrop-blur-xl flotan sobre la mitad inferior: intro card
            arriba, Misión/Visión abajo. El blur fuerte difumina los rostros
            que viven detrás del cristal — caras presentes pero ya no
            reconocibles. La pantalla con "Datos México" sigue visible
            arriba sin que ninguna card la cubra. */}
        <div className="relative hidden md:block">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border border-border">
            <Image
              src="/quienes-somos/presentacion/auditorio.webp"
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="(min-width: 1280px) 1152px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0">
              <div className="flex h-full flex-col justify-end gap-3 p-5 lg:gap-4 lg:p-8">
                <article className="max-w-2xl border border-white/40 bg-background/55 p-5 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 lg:p-7">
                  <Eyebrow className="mb-2 text-accent">Quiénes somos</Eyebrow>
                  <H1 className="text-[20px] leading-[1.18] md:text-[24px] lg:text-[28px]">
                    Un observatorio académico, transparente y en construcción.
                  </H1>
                  <Lead className="mt-3 text-[13px] leading-[1.55] lg:text-[14px] lg:leading-[1.6]">
                    Datos México es un observatorio independiente con respaldo
                    institucional del ITAM, formado por estudiantes, egresados
                    y colaboradores con experiencia en ciencia de datos,
                    economía y otras disciplinas. Trabajamos con microdatos
                    oficiales y publicamos análisis verificables, con
                    metodología abierta y sin agenda partidista.
                  </Lead>
                </article>

                <div className="grid grid-cols-2 gap-3 lg:gap-5">
                  <article className="border border-white/40 bg-background/55 p-4 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 lg:p-6">
                    <Eyebrow className="mb-2 text-accent">Misión</Eyebrow>
                    <H2 className="text-[16px] leading-[1.2] lg:text-[20px]">
                      Por qué existimos.
                    </H2>
                    <Body className="mt-2 text-[12.5px] leading-[1.5] lg:text-[13.5px] lg:leading-[1.55]">
                      Procesar, validar y poner al alcance de todos los datos
                      públicos de México, con rigor académico y claridad
                      expositiva, para que ciudadanía, prensa, academia y
                      gobierno tomen decisiones informadas.
                    </Body>
                  </article>
                  <article className="border border-white/40 bg-background/55 p-4 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 lg:p-6">
                    <Eyebrow className="mb-2 text-accent">Visión</Eyebrow>
                    <H2 className="text-[16px] leading-[1.2] lg:text-[20px]">
                      Hacia dónde vamos.
                    </H2>
                    <Body className="mt-2 text-[12.5px] leading-[1.5] lg:text-[13.5px] lg:leading-[1.55]">
                      Ser el observatorio de datos de referencia en México: el
                      lugar donde cualquier persona puede consultar, reproducir
                      y entender los números que describen al país.
                    </Body>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Móvil (< md): la foto va arriba contenida y el texto en flujo
            normal debajo. La superposición no se sostiene a esa anchura. */}
        <div className="md:hidden">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border border-border">
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
          <div className="space-y-14 pt-12">
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
                  públicos de México, con rigor académico y claridad
                  expositiva, para que ciudadanía, prensa, academia y gobierno
                  tomen decisiones informadas.
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
        </div>
      </Container>
    </section>
  );
}

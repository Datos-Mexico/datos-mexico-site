import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Eyebrow, H1, H2, Lead, Body } from "@/components/typography";

export function QuienesSomosHero() {
  return (
    <section className="border-b border-border">
      {/* Desktop (md+): una sola foto entera del auditorio como fondo. Todo
          el texto se acomoda en la mitad inferior de la foto, sobre la
          banda de los rostros — la mitad superior (pantalla "Datos México"
          + lema + logo ITAM + mapa) queda completamente visible. El texto
          editorial es lo que cubre las caras; no hay scrim, blur ni
          recorte sobre la imagen. */}
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
            <Container className="flex h-full flex-col justify-end gap-4 pb-8 lg:gap-5 lg:pb-10">
              <article className="max-w-3xl border border-white/10 bg-gradient-to-br from-black/55 to-black/75 p-5 shadow-2xl backdrop-blur-md lg:p-7">
                <Eyebrow className="mb-2 text-accent">Quiénes somos</Eyebrow>
                <H1 className="text-[22px] leading-[1.18] text-white md:text-[26px] lg:text-[30px]">
                  Un observatorio académico, transparente y en construcción.
                </H1>
                <Lead className="mt-3 text-[14px] leading-[1.55] text-zinc-100 lg:text-[15px] lg:leading-[1.6]">
                  Datos México es un observatorio independiente con respaldo
                  institucional del ITAM, formado por estudiantes, egresados y
                  colaboradores con experiencia en ciencia de datos, economía y
                  otras disciplinas. Trabajamos con microdatos oficiales y
                  publicamos análisis verificables, con metodología abierta y
                  sin agenda partidista.
                </Lead>
              </article>

              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                <article className="border border-white/10 bg-gradient-to-br from-black/55 to-black/75 p-4 shadow-2xl backdrop-blur-md lg:p-6">
                  <Eyebrow className="mb-2 text-accent">Misión</Eyebrow>
                  <H2 className="text-[18px] leading-[1.2] text-white lg:text-[22px]">
                    Por qué existimos.
                  </H2>
                  <Body className="mt-2 text-[13px] leading-[1.5] text-zinc-100 lg:text-[14px] lg:leading-[1.55]">
                    Procesar, validar y poner al alcance de todos los datos
                    públicos de México, con rigor académico y claridad
                    expositiva, para que ciudadanía, prensa, academia y gobierno
                    tomen decisiones informadas.
                  </Body>
                </article>
                <article className="border border-white/10 bg-gradient-to-br from-black/55 to-black/75 p-4 shadow-2xl backdrop-blur-md lg:p-6">
                  <Eyebrow className="mb-2 text-accent">Visión</Eyebrow>
                  <H2 className="text-[18px] leading-[1.2] text-white lg:text-[22px]">
                    Hacia dónde vamos.
                  </H2>
                  <Body className="mt-2 text-[13px] leading-[1.5] text-zinc-100 lg:text-[14px] lg:leading-[1.55]">
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
          normal debajo. La superposición no se sostiene a esa anchura. */}
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

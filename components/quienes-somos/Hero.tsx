import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Eyebrow, H1, H2, Lead, Body } from "@/components/typography";

const glassPanel =
  // Premium frosted glass: gradient bg + inset ring + top light highlight
  // + soft drop shadow. backdrop-blur + saturate + contrast realzan la
  // textura del vidrio sin perder transparencia.
  "relative overflow-hidden rounded-xl border border-white/50 " +
  "bg-gradient-to-br from-white/45 via-white/25 to-white/15 " +
  "ring-1 ring-inset ring-white/30 " +
  "backdrop-blur-2xl backdrop-saturate-150 backdrop-contrast-110 " +
  "shadow-[0_24px_60px_-20px_rgba(15,15,15,0.35)] " +
  "before:absolute before:inset-x-0 before:top-0 before:h-px " +
  "before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent";

export function QuienesSomosHero() {
  return (
    <section className="border-b border-border bg-background py-14 md:py-20 lg:py-24">
      <Container>
        {/* Desktop (md+): foto contenida con marco editorial. Dos paneles de
            vidrio premium flotan sobre la mitad inferior: presentación
            arriba a la izquierda (sobre madera, fuera de pantalla y
            rostros), y un panel unificado abajo dividido en Misión/Visión
            que cubre la fila completa de rostros. Gradiente sutil al pie
            de la foto ancla los paneles sin ensuciar la imagen. */}
        <div className="relative hidden md:block">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)]">
            <Image
              src="/quienes-somos/presentacion/auditorio.webp"
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="(min-width: 1280px) 1152px, 100vw"
              className="object-cover"
            />

            {/* Gradiente direccional al pie: difumina la transición entre
                foto y paneles sin uniforme oscurecimiento sobre rostros. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/35 via-black/10 to-transparent"
            />

            <div className="absolute inset-0">
              <div className="flex h-full flex-col justify-end gap-5 p-6 lg:gap-7 lg:p-10">
                <article className={`${glassPanel} max-w-xl p-6 lg:p-8`}>
                  <Eyebrow className="mb-2 text-accent">Quiénes somos</Eyebrow>
                  <H1 className="text-balance text-[20px] leading-[1.18] md:text-[24px] lg:text-[26px]">
                    Un observatorio académico, transparente y en construcción.
                  </H1>
                  <Lead className="mt-3 text-[13.5px] leading-[1.6] text-text lg:text-[14px]">
                    Datos México es un observatorio independiente con respaldo
                    institucional del ITAM, formado por estudiantes, egresados
                    y colaboradores con experiencia en ciencia de datos,
                    economía y otras disciplinas. Trabajamos con microdatos
                    oficiales y publicamos análisis verificables, con
                    metodología abierta y sin agenda partidista.
                  </Lead>
                </article>

                <article className={glassPanel}>
                  <div className="grid grid-cols-2 divide-x divide-white/30">
                    <div className="p-5 lg:p-7">
                      <Eyebrow className="mb-2 text-accent">Misión</Eyebrow>
                      <H2 className="text-[17px] leading-[1.2] lg:text-[20px]">
                        Por qué existimos.
                      </H2>
                      <Body className="mt-2 text-[13px] leading-[1.6] text-text lg:text-[13.5px]">
                        Procesar, validar y poner al alcance de todos los datos
                        públicos de México, con rigor académico y claridad
                        expositiva, para que ciudadanía, prensa, academia y
                        gobierno tomen decisiones informadas.
                      </Body>
                    </div>
                    <div className="p-5 lg:p-7">
                      <Eyebrow className="mb-2 text-accent">Visión</Eyebrow>
                      <H2 className="text-[17px] leading-[1.2] lg:text-[20px]">
                        Hacia dónde vamos.
                      </H2>
                      <Body className="mt-2 text-[13px] leading-[1.6] text-text lg:text-[13.5px]">
                        Ser el observatorio de datos de referencia en México:
                        el lugar donde cualquier persona puede consultar,
                        reproducir y entender los números que describen al
                        país.
                      </Body>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>

        {/* Móvil (< md): foto contenida arriba, texto debajo en flujo
            normal. El overlay no se sostiene a esa anchura. */}
        <div className="md:hidden">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)]">
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

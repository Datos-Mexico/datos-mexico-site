import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Eyebrow, H1, H2, Lead, Body } from "@/components/typography";

const glassStrip =
  // Cristal premium ligero: gradiente diagonal sutil, backdrop blur fuerte,
  // inner ring + top highlight. Más transparente que antes porque la
  // estrella es la foto, no el cristal.
  "relative overflow-hidden rounded-xl border border-white/40 " +
  "bg-gradient-to-br from-white/30 via-white/15 to-white/10 " +
  "ring-1 ring-inset ring-white/30 " +
  "backdrop-blur-2xl backdrop-saturate-150 " +
  "shadow-[0_24px_60px_-20px_rgba(15,15,15,0.4)] " +
  "before:absolute before:inset-x-0 before:top-0 before:h-px " +
  "before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent";

export function QuienesSomosHero() {
  return (
    <section className="border-b border-border bg-background">
      {/* Desktop (md+): la foto vive a sangre (sin Container), aspect 16/9,
          para que se aprecie la presentación. La mitad superior — pantalla
          "Datos México", lema, logo ITAM, mapa, madera del auditorio,
          banderas — queda totalmente visible. Solo una franja de cristal
          ligero al pie con Misión/Visión cubre la fila de los rostros.
          La intro vive en flujo normal abajo, con respiro editorial. */}
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

          {/* Anclaje sutil al pie — gradiente direccional, no scrim */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/30 to-transparent"
          />

          {/* Franja de cristal sobre los rostros */}
          <div className="absolute inset-x-0 bottom-0 top-[58%]">
            <Container className="flex h-full items-end pb-6 lg:pb-10">
              <article className={`${glassStrip} w-full`}>
                <div className="grid grid-cols-2 divide-x divide-white/30">
                  <div className="p-5 lg:p-8">
                    <Eyebrow className="mb-2 text-accent">Misión</Eyebrow>
                    <H2 className="text-[18px] leading-[1.2] lg:text-[22px]">
                      Por qué existimos.
                    </H2>
                    <Body className="mt-2 text-[13px] leading-[1.6] text-text lg:text-[14px]">
                      Procesar, validar y poner al alcance de todos los datos
                      públicos de México, con rigor académico y claridad
                      expositiva, para que ciudadanía, prensa, academia y
                      gobierno tomen decisiones informadas.
                    </Body>
                  </div>
                  <div className="p-5 lg:p-8">
                    <Eyebrow className="mb-2 text-accent">Visión</Eyebrow>
                    <H2 className="text-[18px] leading-[1.2] lg:text-[22px]">
                      Hacia dónde vamos.
                    </H2>
                    <Body className="mt-2 text-[13px] leading-[1.6] text-text lg:text-[14px]">
                      Ser el observatorio de datos de referencia en México: el
                      lugar donde cualquier persona puede consultar, reproducir
                      y entender los números que describen al país.
                    </Body>
                  </div>
                </div>
              </article>
            </Container>
          </div>
        </div>
      </div>

      {/* Móvil (< md): foto a sangre arriba; intro + Misión + Visión en
          flujo normal debajo. La superposición no se sostiene a esa
          anchura. */}
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
      </div>

      {/* Intro editorial debajo de la foto, en flujo normal */}
      <Container>
        <div className="py-16 md:py-20 lg:py-24">
          <div className="max-w-3xl">
            <Eyebrow className="mb-5 text-accent">Quiénes somos</Eyebrow>
            <H1>Un observatorio académico, transparente y en construcción.</H1>
            <Lead className="mt-7">
              Datos México es un observatorio independiente con respaldo
              institucional del ITAM, formado por estudiantes, egresados y
              colaboradores con experiencia en ciencia de datos, economía y
              otras disciplinas. Trabajamos con microdatos oficiales y publicamos
              análisis verificables, con metodología abierta y sin agenda
              partidista.
            </Lead>
          </div>

          {/* Móvil-only: Misión + Visión bajan al flujo normal con el resto */}
          <div className="mt-14 grid grid-cols-1 gap-12 md:hidden">
            <div>
              <Eyebrow className="mb-3 text-accent">Misión</Eyebrow>
              <H2>Por qué existimos.</H2>
              <Body className="mt-5 text-[17px] leading-[1.7]">
                Procesar, validar y poner al alcance de todos los datos públicos
                de México, con rigor académico y claridad expositiva, para que
                ciudadanía, prensa, academia y gobierno tomen decisiones
                informadas.
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
    </section>
  );
}

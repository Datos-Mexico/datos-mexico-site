import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Eyebrow, H2, Body } from "@/components/typography";

const principios = [
  {
    n: "01",
    title: "Reproducibilidad al peso.",
    body: "Cada cifra que publicamos puede ser reconstruida desde el microdato oficial.",
  },
  {
    n: "02",
    title: "Transparencia metodológica.",
    body: "Toda gráfica viene con su nota de método, su fuente y su fecha de validación.",
  },
  {
    n: "03",
    title: "Lecturas cruzadas.",
    body: "No vemos los datasets aislados — los cruzamos para revelar lo que cada uno por separado oculta.",
  },
  {
    n: "04",
    title: "Honestidad intelectual.",
    body: "Distinguimos entre lo que los datos dicen, lo que sugieren, y lo que requeriría más investigación.",
  },
];

export function MisionVision() {
  return (
    <section id="mision" className="border-b border-border">
      {/* Foto del auditorio entera y sin tratamiento. Las cards de Misión y
          Visión se posicionan deliberadamente sobre la banda de los rostros
          en desktop: el texto editorial es lo que cubre las caras, no un
          blur ni un overlay puntual. En móvil la foto va arriba y el texto
          debajo en flujo normal (el overlap a esa anchura no se sostiene). */}

      {/* Desktop: foto + cards superpuestos */}
      <div className="relative hidden md:block">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src="/quienes-somos/presentacion/auditorio.webp"
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-x-0 bottom-0 top-[52%]">
            <Container className="flex h-full items-end pb-8 lg:pb-12">
              <div className="grid w-full grid-cols-2 gap-6 lg:gap-10">
                <article className="border border-border bg-background p-7 shadow-xl lg:p-9">
                  <Eyebrow className="mb-3 text-accent">Misión</Eyebrow>
                  <H2 className="text-[24px] leading-[1.2] md:text-[28px] lg:text-[32px]">
                    Por qué existimos.
                  </H2>
                  <Body className="mt-4 text-[15px] leading-[1.6] lg:text-[16px] lg:leading-[1.65]">
                    Procesar, validar y poner al alcance de todos los datos
                    públicos de México, con rigor académico y claridad
                    expositiva, para que ciudadanía, prensa, academia y gobierno
                    tomen decisiones informadas.
                  </Body>
                </article>
                <article className="border border-border bg-background p-7 shadow-xl lg:p-9">
                  <Eyebrow className="mb-3 text-accent">Visión</Eyebrow>
                  <H2 className="text-[24px] leading-[1.2] md:text-[28px] lg:text-[32px]">
                    Hacia dónde vamos.
                  </H2>
                  <Body className="mt-4 text-[15px] leading-[1.6] lg:text-[16px] lg:leading-[1.65]">
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

      {/* Móvil: foto arriba, texto debajo en flujo normal */}
      <div className="md:hidden">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src="/quienes-somos/presentacion/auditorio.webp"
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <Container>
          <div className="grid grid-cols-1 gap-12 py-12">
            <div>
              <Eyebrow className="mb-4 text-accent">Misión</Eyebrow>
              <H2>Por qué existimos.</H2>
              <Body className="mt-6 text-[17px] leading-[1.7]">
                Procesar, validar y poner al alcance de todos los datos públicos
                de México, con rigor académico y claridad expositiva, para que
                ciudadanía, prensa, academia y gobierno tomen decisiones
                informadas.
              </Body>
            </div>
            <div>
              <Eyebrow className="mb-4 text-accent">Visión</Eyebrow>
              <H2>Hacia dónde vamos.</H2>
              <Body className="mt-6 text-[17px] leading-[1.7]">
                Ser el observatorio de datos de referencia en México: el lugar
                donde cualquier persona puede consultar, reproducir y entender
                los números que describen al país.
              </Body>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="border-t border-border py-20 md:py-24">
          <Eyebrow className="mb-6 text-accent">Principios</Eyebrow>
          <ol className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-10">
            {principios.map((p) => (
              <li key={p.n} className="flex gap-5">
                <span className="font-serif text-[24px] font-semibold leading-none text-accent tabular-nums md:text-[26px]">
                  {p.n}
                </span>
                <div>
                  <h3 className="font-serif text-[18px] font-semibold leading-[1.3] text-foreground md:text-[19px]">
                    {p.title}
                  </h3>
                  <Body className="mt-2 text-[15px] leading-[1.6] text-text-subtle">
                    {p.body}
                  </Body>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

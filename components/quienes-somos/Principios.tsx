import { Container } from "@/components/layout/Container";
import { Eyebrow, Body } from "@/components/typography";

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

export function Principios() {
  return (
    <section id="principios" className="border-b border-border py-20 md:py-24">
      <Container>
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
      </Container>
    </section>
  );
}

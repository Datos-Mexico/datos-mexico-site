import { Container } from "@/components/layout/Container";
import { H2, H3, Body, Lead } from "@/components/typography";

const principios = [
  {
    n: "01",
    titulo: "Reproducibilidad al peso.",
    desc: "Cada cifra que publicamos puede ser reconstruida desde el microdato oficial. Validamos contra publicaciones de INEGI, Banxico, CONSAR y otras fuentes.",
  },
  {
    n: "02",
    titulo: "Transparencia metodológica.",
    desc: "Toda gráfica viene con su nota de método, su fuente y su fecha de validación.",
  },
  {
    n: "03",
    titulo: "Lecturas cruzadas.",
    desc: "No vemos los datasets aislados — los cruzamos para revelar lo que cada uno por separado oculta.",
  },
  {
    n: "04",
    titulo: "Honestidad intelectual.",
    desc: "Distinguimos entre lo que los datos dicen, lo que sugieren, y lo que requeriría más investigación.",
  },
];

export function Principios() {
  return (
    <section className="border-b border-border py-20 md:py-28">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <H2>Cómo trabajamos.</H2>
          <Lead className="mt-5">
            Cuatro principios que ordenan todo lo que hacemos.
          </Lead>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-16 md:gap-y-14">
          {principios.map((p) => (
            <article key={p.n} className="flex flex-col">
              <span className="font-serif text-[44px] font-semibold leading-none text-accent tabular-nums">
                {p.n}
              </span>
              <H3 className="mt-5">{p.titulo}</H3>
              <Body className="mt-3 max-w-md">{p.desc}</Body>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

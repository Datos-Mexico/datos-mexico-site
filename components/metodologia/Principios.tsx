import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body } from "@/components/typography";

const principios = [
  {
    n: "01",
    title: "Reproducibilidad al peso desde el microdato.",
    body: "Trabajamos con la unidad mínima publicada por la fuente oficial — no con tabulados agregados. Cualquier cifra que mostramos puede ser reconstruida bajándose el microdato original y aplicando el mismo procesamiento que documentamos.",
  },
  {
    n: "02",
    title: "Validación cruzada contra la publicación oficial.",
    body: "Cuando la fuente publica cifras agregadas (un comunicado, un cuadro oficial), reproducimos esas cifras al peso desde nuestro pipeline antes de publicar nada nuevo. Si nuestra cifra no coincide con la oficial dentro de la tolerancia documentada, paramos.",
  },
  {
    n: "03",
    title: "Transparencia metodológica por defecto.",
    body: "Toda gráfica del observatorio carga su nota de método embebida: unidad de medida, fuente, edición, fórmula de cálculo, fecha de última validación. No hay cifra sin contexto.",
  },
  {
    n: "04",
    title: "Distinción entre lo descriptivo y lo interpretativo.",
    body: "Separamos explícitamente los hechos cuantificables del análisis interpretativo. Una cifra es una cifra; lo que esa cifra significa para política pública es otra cosa, y se etiqueta como tal.",
  },
  {
    n: "05",
    title: "Caveats explícitos sobre límites del dato.",
    body: "Cada análisis lleva una sección que dice qué los datos SÍ permiten afirmar y qué NO. Las hipótesis no probadas se nombran como hipótesis. Los outliers, las definiciones operativas y los artefactos de la fuente se hacen visibles.",
  },
];

export function Principios() {
  return (
    <section id="principios" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="Principios"
        title="Cinco compromisos no negociables."
        lead="Antes del código y de las cifras, está el método. Estos cinco principios ordenan toda decisión técnica del observatorio."
      />

      <ol className="mt-14 space-y-12 md:space-y-14">
        {principios.map((p) => (
          <li key={p.n} className="grid grid-cols-[auto_1fr] gap-x-6 md:gap-x-10">
            <span className="font-serif text-[36px] font-semibold leading-none text-accent tabular-nums md:text-[44px]">
              {p.n}
            </span>
            <div>
              <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
                {p.title}
              </h3>
              <Body className="mt-3 max-w-2xl text-[16px] leading-[1.7]">
                {p.body}
              </Body>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

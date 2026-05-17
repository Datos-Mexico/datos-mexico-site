import { Check } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const cifras = [
  {
    title: "Toda cifra lleva su unidad explícita.",
    body: "“Pesos mensuales por hogar” no es lo mismo que “pesos trimestrales por persona”. La unidad va junto al número.",
  },
  {
    title: "Toda cifra lleva su fuente y fecha.",
    body: "Nada de “según estimaciones recientes”. La fuente se nombra y se enlaza al documento oficial.",
  },
  {
    title: "Las comparaciones declaran si son nominales o reales.",
    body: "Cuando comparamos a través del tiempo, decimos si está deflactado y con qué índice.",
  },
  {
    title: "Los promedios vienen acompañados de medianas y percentiles relevantes.",
    body: "Un promedio sin distribución es engañoso. Reportamos al menos p25/p50/p75 cuando la distribución importa.",
  },
  {
    title: "Los porcentajes nombran su denominador.",
    body: "“37% de los hogares” no significa nada sin saber sobre qué universo se calcula.",
  },
];

const narrativa = [
  {
    title: "Separamos descripción de interpretación.",
    body: "Las secciones descriptivas reportan lo que los datos dicen; las interpretativas se etiquetan como tales y citan las fuentes en que se apoyan.",
  },
  {
    title: "Las hipótesis no probadas se nombran como hipótesis.",
    body: "Si los datos sugieren algo pero no lo demuestran, lo decimos: “los datos son consistentes con X, pero no prueban X”.",
  },
  {
    title: "Los caveats no van al final, van junto al hallazgo.",
    body: "Cuando una cifra tiene una limitación importante, esa limitación va al lado de la cifra, no en una sección de notas que nadie lee.",
  },
  {
    title: "No usamos lenguaje persuasivo sobre lo que muestran los datos.",
    body: "Evitamos “alarmante”, “preocupante”, “esperanzador”. Reportamos magnitudes y dejamos que el lector valore.",
  },
  {
    title: "Las rectificaciones son públicas.",
    body: "Cuando detectamos un error en una publicación previa, lo corregimos visiblemente y documentamos qué cambió y por qué.",
  },
];

function StandardList({
  heading,
  items,
}: {
  heading: string;
  items: { title: string; body: string }[];
}) {
  return (
    <div>
      <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
        {heading}
      </h3>
      <ul className="mt-6 space-y-6">
        {items.map((item) => (
          <li key={item.title} className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-3 w-3 text-primary" aria-hidden="true" />
            </span>
            <div>
              <p className="font-sans text-[16px] font-semibold leading-[1.4] text-foreground">
                {item.title}
              </p>
              <p className="mt-1.5 font-sans text-[15px] leading-[1.6] text-text-subtle">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Editorial() {
  return (
    <section id="editorial" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="Estándares editoriales"
        title="Cómo escribimos sobre lo que medimos."
        lead="Tener buenas cifras no basta. La forma en que las presentamos determina si son útiles o si se prestan a malinterpretación. Estos son los estándares editoriales que aplicamos a toda publicación."
      />

      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-14">
        <StandardList heading="Sobre las cifras" items={cifras} />
        <StandardList heading="Sobre la narrativa" items={narrativa} />
      </div>
    </section>
  );
}

import { FileText, Notebook, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Mono, Small } from "@/components/typography";

const formatos: {
  icon: LucideIcon;
  title: string;
  description: string;
  cadencia: string;
  lectura: string;
}[] = [
  {
    icon: FileText,
    title: "Análisis profundo",
    description:
      "Estudios completos sobre un tema, con metodología detallada, validación contra fuentes oficiales y caveats explícitos. Son las publicaciones más densas del observatorio.",
    cadencia: "Mensual",
    lectura: "10–20 min",
  },
  {
    icon: Notebook,
    title: "Notas breves",
    description:
      "Lecturas cortas sobre una cifra específica, una publicación reciente del INEGI, o un dato que vale la pena situar en contexto. Pensadas para leerse en café.",
    cadencia: "Semanal",
    lectura: "3–5 min",
  },
  {
    icon: Activity,
    title: "Comentarios de coyuntura",
    description:
      "Reacciones a publicaciones oficiales el mismo día que salen (ENIGH, ITAEE, Encuesta Banxico, etc.). Sin opinión política, solo la cifra puesta en perspectiva metodológica.",
    cadencia: "Cuando publica la fuente",
    lectura: "2–3 min",
  },
];

export function Formatos() {
  return (
    <section id="que-recibes" className="border-b border-border py-16 md:py-20">
      <SectionHeader
        eyebrow="Qué publicamos"
        title="Tres formatos editoriales."
        lead="El boletín no es un solo tipo de contenido. Es el canal por el que te llegan los distintos formatos del observatorio, en distintas cadencias."
      />

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {formatos.map((f) => (
          <article
            key={f.title}
            className="flex flex-col rounded-lg border border-border bg-background p-6 md:p-7"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <f.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-serif text-[20px] font-semibold leading-[1.3] text-foreground">
              {f.title}
            </h3>
            <Body className="mt-3 text-[15px] leading-[1.6] text-text-subtle">
              {f.description}
            </Body>
            <dl className="mt-6 space-y-1 border-t border-border pt-4">
              <div className="flex justify-between gap-3">
                <Mono className="text-[12px] uppercase tracking-[0.08em]">
                  Cadencia
                </Mono>
                <Mono className="text-[12px] text-foreground">{f.cadencia}</Mono>
              </div>
              <div className="flex justify-between gap-3">
                <Mono className="text-[12px] uppercase tracking-[0.08em]">
                  Lectura
                </Mono>
                <Mono className="text-[12px] text-foreground">{f.lectura}</Mono>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <Small className="mt-10 mx-auto max-w-2xl text-center text-[14px] leading-[1.6]">
        En conjunto, esto significa aproximadamente entre 3 y 5 envíos por
        semana. Si prefieres recibir un solo resumen semanal, podrás
        configurarlo en tus preferencias una vez nos hayas definido un proveedor
        de boletín.{" "}
        <span className="text-text-subtle/80">
          [PENDIENTE: confirmar al elegir proveedor]
        </span>
      </Small>
    </section>
  );
}

import { H1, Lead, Eyebrow } from "@/components/typography";

export function MetodologiaHero() {
  return (
    <section className="border-b border-border pt-24 pb-16 md:pt-32 md:pb-20">
      <div className="max-w-3xl">
        <Eyebrow className="mb-5 text-accent">Metodología</Eyebrow>
        <H1>Cómo construimos cifras que se pueden auditar.</H1>
        <Lead className="mt-7">
          Esta página documenta el método con el que el observatorio procesa,
          valida y publica datos. No es un manifiesto: es la especificación
          operativa que aplicamos a cada análisis.
        </Lead>
      </div>
    </section>
  );
}

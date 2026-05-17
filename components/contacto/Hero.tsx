import { H1, Lead, Eyebrow } from "@/components/typography";

export function ContactoHero() {
  return (
    <section className="border-b border-border pt-24 pb-12 md:pt-32 md:pb-16">
      <div className="mx-auto max-w-3xl">
        <Eyebrow className="mb-5 text-accent">Contacto</Eyebrow>
        <H1>¿En qué te ayudamos?</H1>
        <Lead className="mt-7">
          El observatorio tiene varios canales de contacto según el tipo de
          consulta. Elige abajo el que mejor describe tu caso para que llegues a
          la persona indicada.
        </Lead>
      </div>
    </section>
  );
}

import { Mail } from "lucide-react";
import { H1, Lead, Eyebrow } from "@/components/typography";

export function PrensaHero() {
  return (
    <section
      id="contacto"
      className="border-b border-border pt-24 pb-16 md:pt-32 md:pb-20"
    >
      <div className="mx-auto max-w-3xl">
        <Eyebrow className="mb-5 text-accent">Prensa</Eyebrow>
        <H1>Recursos para periodistas y medios.</H1>
        <Lead className="mt-7">
          Esta página es nuestro canal único con los medios. Aquí encuentras
          nuestra información de contacto directa, las personas del equipo que
          hablan sobre cada tema, lineamientos para citarnos y recursos
          descargables.
        </Lead>

        <aside
          aria-label="Contacto directo de prensa"
          className="mt-10 rounded-lg border border-border bg-muted p-6 md:p-8"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-6">
            <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-text-subtle">
                Contacto directo de prensa
              </p>
              <a
                href="mailto:prensa@datosmexico.org"
                className="mt-2 inline-block font-serif text-[22px] font-semibold text-foreground hover:text-primary transition-colors md:text-[24px]"
              >
                prensa@datosmexico.org
              </a>
              <p className="mt-3 max-w-xl font-sans text-[15px] leading-[1.6] text-text-subtle">
                Respuesta en menos de 24 horas hábiles. Para entrevistas en vivo
                o coyuntura, indícalo en el asunto del correo.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

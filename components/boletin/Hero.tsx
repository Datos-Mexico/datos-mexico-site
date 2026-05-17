import { H1, Lead, Eyebrow, Small } from "@/components/typography";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";

export function BoletinHero() {
  return (
    <section
      id="suscribete"
      className="border-b border-border pt-24 pb-16 md:pt-32 md:pb-20"
    >
      <div className="mx-auto max-w-3xl">
        <Eyebrow className="mb-5 text-accent">Boletín del observatorio</Eyebrow>
        <H1>Recibe nuestros análisis directamente.</H1>
        <Lead className="mt-7">
          El boletín de Datos México es la forma más directa de mantenerte al
          tanto de lo que el observatorio publica. Análisis, notas breves y
          comentarios sobre coyuntura económica de México, con la misma
          metodología verificable que aplicamos a todo nuestro trabajo.
        </Lead>

        <div className="mt-10 max-w-2xl">
          <NewsletterForm size="lg" />
        </div>

        <Small className="mt-5 text-[13px]">
          Sin spam, sin paywalls, sin venta de datos. Puedes darte de baja en
          cualquier momento.
        </Small>
      </div>
    </section>
  );
}

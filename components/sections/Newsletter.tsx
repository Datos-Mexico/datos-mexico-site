import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";

export function Newsletter() {
  return (
    <section
      id="newsletter"
      className="bg-foreground py-20 text-text-inverse md:py-28"
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-[26px] font-semibold leading-[1.2] text-text-inverse md:text-[36px]">
            Recibe nuestros análisis.
          </h2>
          <p className="mt-5 font-sans text-[18px] leading-[1.5] text-white/75 md:text-[20px]">
            Boletín quincenal con los últimos análisis del observatorio.
            Sin spam, sin paywalls.
          </p>

          <div className="mt-10 text-left">
            <NewsletterForm size="sm" variant="dark" showLabel={false} />
          </div>

          <p className="mt-5 font-sans text-[13px] text-white/50">
            Puedes darte de baja en cualquier momento.
          </p>

          <Link
            href="/boletin"
            className="mt-6 inline-flex items-center gap-1 font-sans text-[14px] text-white/75 hover:text-white hover:gap-2 transition-[gap,color]"
          >
            Más sobre el boletín
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}

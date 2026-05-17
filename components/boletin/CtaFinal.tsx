import { NewsletterForm } from "@/components/newsletter/NewsletterForm";

export function CtaFinal() {
  return (
    <section className="bg-foreground py-20 text-text-inverse md:py-24">
      <div className="mx-auto max-w-2xl px-6 text-center md:px-0">
        <h3 className="font-serif text-[26px] font-semibold leading-[1.2] text-text-inverse md:text-[32px]">
          ¿Convencido? Suscríbete.
        </h3>
        <p className="mt-4 font-sans text-[16px] leading-[1.6] text-white/75 md:text-[17px]">
          Es la forma más fácil de no perderte nada del observatorio.
        </p>

        <div className="mt-8">
          <NewsletterForm size="sm" variant="dark" showLabel={false} />
        </div>
      </div>
    </section>
  );
}

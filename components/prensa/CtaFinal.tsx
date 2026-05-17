import { Mail } from "lucide-react";

export function PrensaCtaFinal() {
  return (
    <section className="bg-foreground py-20 text-text-inverse md:py-24">
      <div className="mx-auto max-w-2xl px-6 text-center md:px-0">
        <h3 className="font-serif text-[26px] font-semibold leading-[1.2] text-text-inverse md:text-[32px]">
          ¿Periodista con un plazo?
        </h3>
        <p className="mt-4 font-sans text-[16px] leading-[1.6] text-white/75 md:text-[17px]">
          Escríbenos directamente. Respondemos rápido.
        </p>

        <div className="mt-8">
          <a
            href="mailto:prensa@datosmexico.org"
            className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-6 py-3 font-sans text-[16px] font-medium text-text-inverse transition-colors hover:bg-white/10 hover:border-white/40"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            prensa@datosmexico.org
          </a>
        </div>
      </div>
    </section>
  );
}

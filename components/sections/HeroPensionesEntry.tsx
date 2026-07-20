import { ArrowRight } from "lucide-react";
import { HeroSar29Mini } from "./HeroSar29Mini";

/**
 * Entrada a la sección /pensiones desde el hero de la home.
 *
 * Pieza subordinada: vive como último elemento del bloque del hero, después
 * del mensaje principal. No compite con el titular ni introduce requests
 * externos. La miniatura de 29 barras (HeroSar29Mini, único client component)
 * es decorativa (aria-hidden), en gris y sin cifras — insinúa la forma de la
 * serie; el dato exacto es la recompensa de entrar a /pensiones.
 */
export function HeroPensionesEntry() {
  return (
    <a
      href="/pensiones"
      className="group mt-12 block rounded-lg border border-border bg-muted/40 p-5 transition-colors hover:border-foreground md:mt-14 md:p-6"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-accent">
            Pensiones
          </p>
          <h2 className="mt-2 font-serif text-[19px] font-semibold leading-[1.25] text-foreground md:text-[21px]">
            Veintinueve años del SAR, documentados año por año.
          </h2>
          <p className="mt-1.5 font-sans text-[14px] leading-[1.55] text-text-subtle md:text-[15px]">
            Serie descriptiva 1997–2025 verificada contra CONSAR, diez
            calculadoras de pensión IMSS con supuestos públicos y el recorrido
            «Tu retiro».
          </p>
        </div>

        <div
          className="hidden md:block md:h-14 md:w-[220px] lg:w-[248px]"
          aria-hidden="true"
        >
          <HeroSar29Mini />
        </div>

        <span className="inline-flex flex-shrink-0 items-center gap-1.5 font-sans text-[15px] font-medium text-primary transition-[gap] group-hover:gap-2.5">
          Ver la sección de pensiones
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}

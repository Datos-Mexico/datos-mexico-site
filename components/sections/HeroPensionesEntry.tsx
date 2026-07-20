import { ArrowRight } from "lucide-react";
import { sar29Entregas } from "@/lib/pensiones/sar29";

/**
 * Entrada a la sección /pensiones desde el hero de la home.
 *
 * Pieza subordinada: vive como último elemento del bloque del hero, después
 * del mensaje principal. No compite con el titular ni introduce requests
 * externos. El skyline de 29 barras es decorativo (aria-hidden), estático y
 * derivado de los mismos `barH` de la serie — insinúa la forma del SAR en 29
 * años sin animación (nada que condicionar bajo reduced-motion).
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
            El SAR en 29 años, diez calculadoras y un recorrido personal.
          </h2>
          <p className="mt-1.5 font-sans text-[14px] leading-[1.55] text-text-subtle md:text-[15px]">
            La serie completa 1997–2025, las calculadoras de pensión IMSS y el
            recorrido «Tu retiro», reunidos en una sola sección.
          </p>
        </div>

        <div
          className="hidden items-end gap-[3px] md:flex md:h-14 md:w-[220px] lg:w-[248px]"
          aria-hidden="true"
        >
          {sar29Entregas.map((e) => (
            <span
              key={e.year}
              className="flex-1 rounded-[1px] bg-primary/25 transition-colors group-hover:bg-primary/40"
              style={{ height: `max(2px, ${e.barH})` }}
            />
          ))}
        </div>

        <span className="inline-flex flex-shrink-0 items-center gap-1.5 font-sans text-[15px] font-medium text-primary transition-[gap] group-hover:gap-2.5">
          Entrar a la sección
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}

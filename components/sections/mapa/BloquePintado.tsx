import type { IndicadorMapa } from "./indicadores-datos";
import { COPY } from "./indicadores-copy";

/**
 * Encabezado de lo pintado, bajo el mapa: nombre humano, valor nacional
 * grande y periodo, con regla inferior. Es la respuesta permanente a
 * "¿qué estoy viendo?": siempre describe al indicador pintado, cambie por
 * hover o —desde la Ola 2— por el pulso. La frase editorial va debajo.
 */
export function BloquePintado({ indicador }: { indicador: IndicadorMapa }) {
  return (
    <div className="mt-4 flex items-baseline justify-between gap-4 border-b border-border pb-2">
      <span className="font-sans text-[15px] font-semibold leading-tight text-foreground">
        {COPY[indicador.id].nombreHumano}
      </span>
      <span className="whitespace-nowrap">
        <span className="font-mono text-[20px] font-medium text-foreground">
          {indicador.valorNacionalFmt}
        </span>
        <span className="ml-2 font-mono text-[11px] text-text-subtle">{indicador.periodo}</span>
      </span>
    </div>
  );
}

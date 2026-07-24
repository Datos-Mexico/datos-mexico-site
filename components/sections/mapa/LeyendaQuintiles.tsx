import type { IndicadorMapa } from "./indicadores-datos";
import { QUINTIL_FILLS } from "./rampa";

/**
 * Leyenda de quintiles de la coropleta: cinco pasos de la rampa con el rango
 * real (min-max) de cada quintil y la declaración de dirección de la escala.
 * La cita de fuente vive al final de la columna (HeroMapaInteligencia): su
 * largo varía por indicador y lo interactivo debe quedar por encima de ella.
 */
export function LeyendaQuintiles({ indicador }: { indicador: IndicadorMapa }) {
  return (
    <div className="mt-4">
      <div className="flex gap-1" aria-hidden="true">
        {indicador.rangosQuintil.map(([min, max], i) => (
          <div key={i} className="min-w-0 flex-1">
            <div
              className="h-2 rounded-[2px]"
              style={{ backgroundColor: QUINTIL_FILLS[i] }}
            />
            <p className="mt-1 truncate text-center font-mono text-[10px] leading-tight text-text-subtle">
              {min === max ? min : `${min}–${max}`}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
        Quintiles de las 32 entidades · más oscuro = mayor valor
      </p>
    </div>
  );
}

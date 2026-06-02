import { H1, Mono } from "@/components/typography";
import { formatDateLong } from "@/lib/publicaciones/format";
import type { Articulo } from "@/lib/preguntas/types";
import { EstadoBadge } from "./EstadoBadge";
import { TipoTemporalBadge } from "./TipoTemporalBadge";

export function ArticuloHeader({ articulo }: { articulo: Articulo }) {
  return (
    <header className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-2">
        <EstadoBadge estado={articulo.estado} />
        <TipoTemporalBadge tipo={articulo.tipo_temporal} />
      </div>
      <H1 className="mt-5">{articulo.pregunta}</H1>
      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Mono className="text-[13px]">
          Publicado el {formatDateLong(articulo.fecha_creacion)}
        </Mono>
        {articulo.fecha_ultima_actualizacion !== articulo.fecha_creacion && (
          <>
            <span aria-hidden="true" className="text-text-subtle">
              ·
            </span>
            <Mono className="text-[13px]">
              Actualizado el {formatDateLong(articulo.fecha_ultima_actualizacion)}
            </Mono>
          </>
        )}
        <span aria-hidden="true" className="text-text-subtle">
          ·
        </span>
        <Mono className="text-[13px]">Versión {articulo.version}</Mono>
      </div>
    </header>
  );
}

import Link from "next/link";
import { H3, Body, Mono } from "@/components/typography";
import { formatDateShort } from "@/lib/publicaciones/format";
import type { Articulo } from "@/lib/preguntas/types";
import { EstadoBadge } from "./EstadoBadge";
import { TipoTemporalBadge } from "./TipoTemporalBadge";

export function ArticuloCard({ articulo }: { articulo: Articulo }) {
  const respuestaCorta = articulo.caveats[0] ?? articulo.metodo;
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-background p-6 transition-colors hover:border-foreground/20 md:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <EstadoBadge estado={articulo.estado} />
        <TipoTemporalBadge tipo={articulo.tipo_temporal} />
      </div>

      <H3 className="mt-4">
        <Link
          href={`/preguntas/${articulo.slug}`}
          className="hover:underline underline-offset-4"
        >
          {articulo.pregunta}
        </Link>
      </H3>

      <Body className="mt-3 line-clamp-3 text-[15px] leading-[1.6] text-text-subtle">
        {respuestaCorta}
      </Body>

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
        <Mono className="text-[13px] capitalize">
          {articulo.tags_tema_principal}
        </Mono>
        <span aria-hidden="true" className="text-text-subtle">
          ·
        </span>
        <Mono className="text-[13px]">
          {formatDateShort(articulo.fecha_ultima_actualizacion)}
        </Mono>
      </div>
    </article>
  );
}

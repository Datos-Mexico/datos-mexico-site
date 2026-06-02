import { ExternalLink } from "lucide-react";
import { Body, Mono, Small } from "@/components/typography";
import { formatDateLong } from "@/lib/publicaciones/format";
import type { Articulo } from "@/lib/preguntas/types";

export function ArticuloMeta({ articulo }: { articulo: Articulo }) {
  const autoria =
    articulo.estado === "pre-firma"
      ? "Equipo de Datos México (responsabilidad institucional colectiva)"
      : (articulo.revisor ?? "Equipo de Datos México");

  return (
    <aside
      aria-label="Citación y metadatos del artículo"
      className="mt-14 max-w-3xl rounded-lg border border-border bg-muted/40 p-6 md:p-7"
    >
      <Mono className="block text-[12px] uppercase tracking-[0.12em]">
        Citación y metadatos
      </Mono>

      <div className="mt-4 space-y-5">
        <div>
          <Small className="font-medium text-text">Identificador canónico</Small>
          <Mono className="mt-1 block text-[13px] text-text">
            {articulo.id_canonico}
          </Mono>
        </div>

        <div>
          <Small className="font-medium text-text">Versión</Small>
          <Body className="mt-1 text-[14px] leading-[1.6] text-text-subtle">
            v{articulo.version} · publicado {formatDateLong(articulo.fecha_creacion)}
            {articulo.fecha_ultima_actualizacion !== articulo.fecha_creacion &&
              ` · actualizado ${formatDateLong(
                articulo.fecha_ultima_actualizacion,
              )}`}
          </Body>
        </div>

        <div>
          <Small className="font-medium text-text">Autoría</Small>
          <Body className="mt-1 text-[14px] leading-[1.6] text-text-subtle">
            {autoria}
            {articulo.fecha_firma && ` · firmado el ${formatDateLong(articulo.fecha_firma)}`}
          </Body>
        </div>

        <div>
          <Small className="font-medium text-text">Fuentes de datos</Small>
          <ul className="mt-2 space-y-2">
            {articulo.datasets.map((d) => (
              <li
                key={`${d.nombre}-${d.url_fuente}`}
                className="flex flex-col gap-0.5"
              >
                <a
                  href={d.url_fuente}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-sans text-[14px] font-medium text-primary hover:underline underline-offset-4"
                >
                  {d.nombre}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
                <Mono className="text-[12px]">
                  Versión de captura: {d.version_captura}
                </Mono>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Small className="font-medium text-text">Errata</Small>
          <Body className="mt-1 text-[14px] leading-[1.6] text-text-subtle">
            Si detectas una discrepancia respecto de la fuente oficial,
            escríbenos a{" "}
            <a
              href="mailto:correcciones@datosmexico.org"
              className="text-primary underline-offset-4 hover:underline"
            >
              correcciones@datosmexico.org
            </a>
            .
          </Body>
        </div>
      </div>
    </aside>
  );
}

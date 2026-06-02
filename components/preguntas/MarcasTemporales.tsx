import { Body, Mono } from "@/components/typography";
import type { Articulo } from "@/lib/preguntas/types";

function formatDateTimeUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm} UTC`;
}

export function MarcasTemporales({ articulo }: { articulo: Articulo }) {
  if (articulo.tipo_temporal !== "puente" || !articulo.marcas_temporales_puente) {
    return null;
  }
  const m = articulo.marcas_temporales_puente;
  return (
    <aside
      aria-label="Marcas temporales de vigencia"
      className="mt-10 max-w-3xl rounded-lg border border-border bg-muted/40 p-6 md:p-7"
    >
      <Mono className="block text-[12px] uppercase tracking-[0.12em]">
        Marcas temporales de vigencia
      </Mono>
      <Body className="mt-3 text-[15px] leading-[1.6] text-text-subtle">
        Cómputo de esta respuesta:{" "}
        <span className="font-medium text-text">
          {formatDateTimeUtc(m.fecha_computo_respuesta)}
        </span>
        . Versión del dataset subyacente:{" "}
        <span className="font-medium text-text">
          {formatDateTimeUtc(m.fecha_version_dataset)}
        </span>
        . El lector puede verificar la vigencia cotejando ambas marcas con la
        fuente oficial.
      </Body>
      {m.divergencia_detectada && (
        <Body className="mt-3 text-[15px] leading-[1.6] text-warning">
          Divergencia detectada respecto de la versión más reciente publicada
          por la fuente. El artículo está bajo auditoría.
        </Body>
      )}
    </aside>
  );
}

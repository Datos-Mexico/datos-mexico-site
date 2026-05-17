import { Body, Mono, Small } from "@/components/typography";
import { ExternalLink } from "lucide-react";
import { formatDateLong } from "@/lib/publicaciones/format";
import type { Publication } from "@/lib/publicaciones/types";

type Props = {
  publication: Publication;
};

export function PublicationMeta({ publication }: Props) {
  return (
    <aside
      aria-label="Nota metodológica"
      className="mt-14 max-w-3xl rounded-lg border border-border bg-muted/40 p-6 md:p-7"
    >
      <Mono className="block text-[12px] uppercase tracking-[0.12em]">
        Nota metodológica
      </Mono>

      <div className="mt-4 space-y-4">
        <div>
          <Small className="font-medium text-text">Fuentes de datos</Small>
          <ul className="mt-2 space-y-2">
            {publication.dataSource.map((src) => (
              <li
                key={`${src.name}-${src.url}`}
                className="flex flex-col gap-0.5"
              >
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-sans text-[14px] font-medium text-primary hover:underline underline-offset-4"
                >
                  {src.name}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
                <Mono className="text-[12px]">
                  Consultado el {formatDateLong(src.accessedAt)}
                </Mono>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Small className="font-medium text-text">Validación</Small>
          <Body className="mt-1 text-[14px] leading-[1.6] text-text-subtle">
            Las cifras se validan contra publicaciones oficiales de la fuente
            citada en la fecha indicada. Si encuentras una discrepancia,
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

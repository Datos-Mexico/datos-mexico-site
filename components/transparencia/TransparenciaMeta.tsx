import { Body, Mono } from "@/components/typography";
import { ExternalLink } from "lucide-react";

type Props = {
  caso: string;
  repoPath?: string;
};

const REPO_BASE =
  "https://github.com/Datos-Mexico/observatorio/tree/main";

export function TransparenciaMeta({ caso, repoPath }: Props) {
  const casoUrl = repoPath ? `${REPO_BASE}/${repoPath}` : null;

  return (
    <aside
      aria-label="Material de trabajo del caso"
      className="mt-14 max-w-3xl rounded-lg border border-border bg-muted/40 p-6 md:p-7"
    >
      <Mono className="block text-[12px] uppercase tracking-[0.12em]">
        Material auditable del caso {caso}
      </Mono>

      <div className="mt-4 space-y-4">
        <Body className="text-[14px] leading-[1.6] text-text-subtle">
          El dossier de hechos verificados, el inventario de fuentes por
          hito, el sustento normativo, el análisis del marco de
          transparencia y las bitácoras de cierre de cada etapa son
          públicos y auditables en el repositorio del observatorio.
          Cada cifra, cita y artículo citado en esta pieza remite, en ese
          material, a su fuente primaria con fecha de consulta.
        </Body>

        {casoUrl && (
          <a
            href={casoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-sans text-[14px] font-medium text-primary hover:underline underline-offset-4"
          >
            Ver material completo del caso
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </div>
    </aside>
  );
}

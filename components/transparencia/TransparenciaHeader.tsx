import { H1, Lead, Mono, Eyebrow } from "@/components/typography";
import { formatDateLong } from "@/lib/publicaciones/format";
import type { TransparenciaPiece } from "@/lib/transparencia/types";

type Props = {
  pieza: TransparenciaPiece;
};

export function TransparenciaHeader({ pieza }: Props) {
  return (
    <header className="max-w-3xl">
      <Eyebrow className="text-accent">
        Transparencia · Caso {pieza.caso}
      </Eyebrow>
      <H1 className="mt-5">{pieza.title}</H1>
      <Lead className="mt-6">{pieza.excerpt}</Lead>

      <aside
        aria-label="Pregunta del encargo"
        className="mt-8 rounded-md border-l-2 border-primary bg-muted/40 px-5 py-4"
      >
        <Mono className="block text-[11px] uppercase tracking-[0.12em] text-text-subtle">
          La pregunta del encargo
        </Mono>
        <p className="mt-2 font-serif text-[17px] leading-[1.5] text-foreground">
          {pieza.pregunta}
        </p>
      </aside>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Mono className="text-[13px]">
          {formatDateLong(pieza.publishedAt)}
        </Mono>
        {pieza.updatedAt && pieza.updatedAt !== pieza.publishedAt && (
          <>
            <span aria-hidden="true" className="text-text-subtle">·</span>
            <Mono className="text-[13px]">
              Actualizado el {formatDateLong(pieza.updatedAt)}
            </Mono>
          </>
        )}
      </div>
    </header>
  );
}

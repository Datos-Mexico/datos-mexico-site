import Link from "next/link";
import { H3, Body, Mono } from "@/components/typography";
import { formatDateShort } from "@/lib/publicaciones/format";
import type { TransparenciaPiece } from "@/lib/transparencia/types";

type Props = {
  pieza: TransparenciaPiece;
};

export function TransparenciaCard({ pieza }: Props) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-background p-6 transition-colors hover:border-foreground/20 md:p-7">
      <div className="flex items-center gap-2">
        <Mono className="text-[12px] uppercase tracking-[0.12em] text-text-subtle">
          Caso {pieza.caso}
        </Mono>
        {pieza.status === "draft" && (
          <span className="rounded border border-dashed border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-subtle">
            Borrador
          </span>
        )}
      </div>

      <H3 className="mt-3">
        <Link
          href={`/transparencia/${pieza.slug}`}
          className="hover:underline underline-offset-4"
        >
          {pieza.title}
        </Link>
      </H3>

      <Body className="mt-3 line-clamp-3 text-[15px] leading-[1.6] text-text-subtle">
        {pieza.excerpt}
      </Body>

      <div className="mt-auto pt-6">
        <Mono className="text-[13px]">
          {formatDateShort(pieza.publishedAt)}
        </Mono>
      </div>
    </article>
  );
}

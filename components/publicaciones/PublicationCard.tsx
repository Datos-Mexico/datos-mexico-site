import Link from "next/link";
import { H3, Body, Mono } from "@/components/typography";
import { CategoryBadge } from "./CategoryBadge";
import { formatDateShort, formatReadingTime } from "@/lib/publicaciones/format";
import type { Publication } from "@/lib/publicaciones/types";

type Props = {
  publication: Publication;
};

export function PublicationCard({ publication }: Props) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-background p-6 transition-colors hover:border-foreground/20 md:p-7">
      <CategoryBadge category={publication.category} />

      <H3 className="mt-4">
        <Link
          href={`/publicaciones/${publication.slug}`}
          className="hover:underline underline-offset-4"
        >
          {publication.title}
        </Link>
      </H3>

      <Body className="mt-3 line-clamp-2 text-[15px] leading-[1.6] text-text-subtle">
        {publication.excerpt}
      </Body>

      <div className="mt-auto flex items-center gap-3 pt-6">
        <Mono className="text-[13px]">
          {formatDateShort(publication.publishedAt)}
        </Mono>
        <span aria-hidden="true" className="text-text-subtle">·</span>
        <Mono className="text-[13px]">
          {formatReadingTime(publication.readingTime)}
        </Mono>
      </div>
    </article>
  );
}

import { H1, Lead, Mono } from "@/components/typography";
import { CategoryBadge } from "./CategoryBadge";
import { formatDateLong, formatReadingTime } from "@/lib/publicaciones/format";
import type { Publication } from "@/lib/publicaciones/types";

type Props = {
  publication: Publication;
};

export function PublicationHeader({ publication }: Props) {
  return (
    <header className="max-w-3xl">
      <CategoryBadge category={publication.category} />
      <H1 className="mt-5">{publication.title}</H1>
      <Lead className="mt-6">{publication.excerpt}</Lead>
      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Mono className="text-[13px]">
          {formatDateLong(publication.publishedAt)}
        </Mono>
        <span aria-hidden="true" className="text-text-subtle">·</span>
        <Mono className="text-[13px]">
          {formatReadingTime(publication.readingTime)}
        </Mono>
        {publication.updatedAt && publication.updatedAt !== publication.publishedAt && (
          <>
            <span aria-hidden="true" className="text-text-subtle">·</span>
            <Mono className="text-[13px]">
              Actualizado el {formatDateLong(publication.updatedAt)}
            </Mono>
          </>
        )}
      </div>
    </header>
  );
}

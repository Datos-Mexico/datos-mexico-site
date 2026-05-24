import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Eyebrow, H2, H3, Body, Mono } from "@/components/typography";
import { getAllPublications } from "@/lib/publicaciones/loader";
import { getCategoryBySlug } from "@/lib/publicaciones/categories";
import { formatDateShort } from "@/lib/publicaciones/format";

export async function Publicaciones() {
  const all = await getAllPublications();
  const items = all.slice(0, 3);

  return (
    <section className="border-b border-border py-20 md:py-28">
      <Container>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="mb-4">Análisis recientes</Eyebrow>
            <H2>Publicaciones recientes.</H2>
          </div>
          <Link
            href="/publicaciones"
            className="hidden items-center gap-1.5 font-sans text-[15px] font-medium text-primary md:inline-flex hover:gap-2.5 transition-[gap]"
          >
            Ver todas las publicaciones
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 -mx-6 overflow-x-auto px-6 md:mx-0 md:overflow-visible md:px-0">
          <ul className="flex w-max gap-6 md:grid md:w-full md:grid-cols-3 md:gap-8">
            {items.map((pub) => {
              const categoryLabel =
                getCategoryBySlug(pub.category)?.label ?? pub.category;
              return (
                <li
                  key={pub.slug}
                  className="w-[320px] flex-shrink-0 md:w-auto"
                >
                  <Link
                    href={`/publicaciones/${pub.slug}`}
                    className="group flex h-full flex-col rounded-lg border border-border bg-background p-6 transition-colors hover:border-foreground/30 hover:bg-muted/40"
                  >
                    <Mono className="text-[12px] uppercase tracking-[0.1em] text-accent">
                      {categoryLabel}
                    </Mono>
                    <H3 className="mt-3 text-[20px] leading-[1.3] md:text-[22px] group-hover:text-primary transition-colors">
                      {pub.title}
                    </H3>
                    <Body className="mt-3 text-[15px] leading-[1.55] text-text-subtle">
                      {pub.excerpt}
                    </Body>
                    <div className="mt-auto flex items-center justify-between border-t border-border pt-4 mt-6">
                      <Mono className="text-[12px]">
                        {formatDateShort(pub.publishedAt)}
                      </Mono>
                      <Mono className="text-[12px]">{`${pub.readingTime} min`}</Mono>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-10 md:hidden">
          <Link
            href="/publicaciones"
            className="inline-flex items-center gap-1.5 font-sans text-[15px] font-medium text-primary"
          >
            Ver todas las publicaciones
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}

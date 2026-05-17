import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Mono } from "@/components/typography";
import { PublicationCard } from "@/components/publicaciones/PublicationCard";
import { getAllPublications } from "@/lib/publicaciones/loader";

export const metadata: Metadata = {
  title: "Publicaciones",
  description:
    "Análisis del observatorio Datos México: piezas breves, descriptivas, basadas en microdatos públicos con metodología explícita.",
  alternates: { canonical: "/publicaciones" },
  openGraph: {
    title: "Publicaciones — Datos México",
    description:
      "Análisis del observatorio Datos México: piezas breves, descriptivas, basadas en microdatos públicos con metodología explícita.",
    url: "/publicaciones",
    type: "website",
  },
};

const PAGE_SIZE = 10;

export default async function PublicacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const all = await getAllPublications();
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const items = all.slice(start, start + PAGE_SIZE);

  return (
    <section className="border-b border-border py-20 md:py-24">
      <Container>
        <SectionHeader
          eyebrow="Publicaciones"
          title="Análisis del observatorio."
          lead="Piezas breves, descriptivas, basadas en microdatos públicos. Cada publicación incluye su nota metodológica, fuentes citadas y caveats sobre lo que los datos no muestran."
        />

        {items.length === 0 ? (
          <div className="mt-14 max-w-2xl rounded-lg border-2 border-dashed border-border bg-muted/40 p-10 text-center">
            <Body className="text-[16px] leading-[1.6] text-text-subtle">
              Estamos preparando las primeras publicaciones del observatorio.
              Pronto disponible.
            </Body>
          </div>
        ) : (
          <>
            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {items.map((pub) => (
                <PublicationCard key={pub.slug} publication={pub} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Paginación de publicaciones"
                className="mt-14 flex items-center justify-center gap-2"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                  const isActive = n === safePage;
                  return (
                    <Link
                      key={n}
                      href={n === 1 ? "/publicaciones" : `/publicaciones?page=${n}`}
                      aria-current={isActive ? "page" : undefined}
                      className={
                        isActive
                          ? "inline-flex h-9 w-9 items-center justify-center rounded-md bg-foreground font-mono text-[13px] text-text-inverse"
                          : "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border font-mono text-[13px] text-text-subtle transition-colors hover:border-foreground hover:text-foreground"
                      }
                    >
                      {n}
                    </Link>
                  );
                })}
              </nav>
            )}

            <Mono className="mt-10 block text-center text-[12px]">
              {all.length} {all.length === 1 ? "publicación" : "publicaciones"} ·
              página {safePage} de {totalPages}
            </Mono>
          </>
        )}
      </Container>
    </section>
  );
}

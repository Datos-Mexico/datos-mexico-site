import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body } from "@/components/typography";
import { PublicationCard } from "@/components/publicaciones/PublicationCard";
import {
  categories,
  getCategoryBySlug,
} from "@/lib/publicaciones/categories";
import { getPublicationsByCategory } from "@/lib/publicaciones/loader";

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return {};
  return {
    title: `Publicaciones · ${cat.label}`,
    description: cat.description,
    alternates: { canonical: `/publicaciones/categoria/${cat.slug}` },
    openGraph: {
      title: `Publicaciones · ${cat.label} — Datos México`,
      description: cat.description,
      url: `/publicaciones/categoria/${cat.slug}`,
      type: "website",
    },
  };
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const items = await getPublicationsByCategory(cat.slug);

  return (
    <section className="border-b border-border py-20 md:py-24">
      <Container>
        <SectionHeader
          eyebrow={`Publicaciones · ${cat.label}`}
          title={`Análisis sobre ${cat.label.toLowerCase()}.`}
          lead={cat.description}
        />

        {items.length === 0 ? (
          <div className="mt-14 max-w-2xl rounded-lg border-2 border-dashed border-border bg-muted/40 p-10 text-center">
            <Body className="text-[16px] leading-[1.6] text-text-subtle">
              Aún no publicamos análisis en esta categoría. Estamos trabajando
              en las primeras piezas.
            </Body>
          </div>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {items.map((pub) => (
              <PublicationCard key={pub.slug} publication={pub} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

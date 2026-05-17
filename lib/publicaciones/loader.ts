import type { ComponentType } from "react";
import type { Publication, PublicationFrontmatter } from "./types";
import { isValidCategorySlug } from "./categories";
import { registry } from "./registry";

export type PublicationWithComponent = Publication & {
  Component: ComponentType;
};

function validateFrontmatter(
  fm: Partial<PublicationFrontmatter>,
  filename: string,
): PublicationFrontmatter {
  if (
    !fm.title ||
    !fm.slug ||
    !fm.category ||
    !fm.publishedAt ||
    !fm.excerpt ||
    typeof fm.readingTime !== "number" ||
    !Array.isArray(fm.dataSource) ||
    !fm.status
  ) {
    throw new Error(
      `Frontmatter incompleto en ${filename}: requiere title, slug, category, publishedAt, excerpt, readingTime, dataSource[], status`,
    );
  }
  if (!isValidCategorySlug(fm.category)) {
    throw new Error(
      `Categoría inválida "${fm.category}" en ${filename}. Ver lib/publicaciones/categories.ts`,
    );
  }
  return fm as PublicationFrontmatter;
}

function toPublication(filename: string, fm: PublicationFrontmatter): Publication {
  return { ...fm, filename, content: "" };
}

export async function getAllPublications(): Promise<Publication[]> {
  const visible = registry.filter((e) => !e.filename.startsWith("_"));
  return visible
    .map((e) => toPublication(e.filename, validateFrontmatter(e.module.meta, e.filename)))
    .filter((p) => p.status === "published")
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getAllSlugs(): Promise<string[]> {
  return registry.map(
    (e) => validateFrontmatter(e.module.meta, e.filename).slug,
  );
}

export async function getPublicationBySlug(
  slug: string,
): Promise<PublicationWithComponent | null> {
  for (const entry of registry) {
    const fm = validateFrontmatter(entry.module.meta, entry.filename);
    if (fm.slug === slug) {
      return {
        ...toPublication(entry.filename, fm),
        Component: entry.module.default,
      };
    }
  }
  return null;
}

export async function getPublicationsByCategory(
  categorySlug: string,
): Promise<Publication[]> {
  const all = await getAllPublications();
  return all.filter((p) => p.category === categorySlug);
}

export async function getRelatedPublications(
  currentSlug: string,
  limit: number,
): Promise<Publication[]> {
  const current = await getPublicationBySlug(currentSlug);
  if (!current) return [];
  const all = await getAllPublications();
  return all
    .filter((p) => p.slug !== currentSlug && p.category === current.category)
    .slice(0, limit);
}

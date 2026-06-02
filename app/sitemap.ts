import type { MetadataRoute } from "next";
import { getAllPublications } from "@/lib/publicaciones/loader";
import { categories } from "@/lib/publicaciones/categories";
import { getAllArticulos } from "@/lib/preguntas/loader";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://datosmexico.org";
  const lastModified = new Date("2026-05-07");

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/quienes-somos`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/metodologia`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/publicaciones`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/preguntas`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/agenda`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/boletin`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/prensa`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/contacto`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/publicaciones/categoria/${c.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const pubs = await getAllPublications();
  const publicationEntries: MetadataRoute.Sitemap = pubs.map((p) => ({
    url: `${base}/publicaciones/${p.slug}`,
    lastModified: new Date(p.updatedAt ?? p.publishedAt),
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const articulos = await getAllArticulos();
  const articuloEntries: MetadataRoute.Sitemap = articulos.map((a) => ({
    url: `${base}/preguntas/${a.slug}`,
    lastModified: new Date(a.fecha_ultima_actualizacion),
    changeFrequency: a.tipo_temporal === "puente" ? "monthly" : "yearly",
    priority: 0.9,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...publicationEntries,
    ...articuloEntries,
  ];
}

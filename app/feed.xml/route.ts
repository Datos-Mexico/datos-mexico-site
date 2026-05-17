import { getAllPublications } from "@/lib/publicaciones/loader";
import { getCategoryBySlug } from "@/lib/publicaciones/categories";
import { formatRfc822 } from "@/lib/publicaciones/format";

const SITE_URL = "https://datosmexico.org";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const pubs = await getAllPublications();
  const lastBuild = pubs[0]?.publishedAt
    ? formatRfc822(pubs[0].publishedAt)
    : new Date().toUTCString();

  const items = pubs
    .map((p) => {
      const cat = getCategoryBySlug(p.category);
      const link = `${SITE_URL}/publicaciones/${p.slug}`;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(p.excerpt)}</description>
      <pubDate>${formatRfc822(p.publishedAt)}</pubDate>
      ${cat ? `<category>${escapeXml(cat.label)}</category>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Datos México — Publicaciones</title>
    <link>${SITE_URL}/publicaciones</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Análisis del observatorio Datos México: piezas breves, descriptivas, basadas en microdatos públicos.</description>
    <language>es-MX</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

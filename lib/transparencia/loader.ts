import matter from "gray-matter";
import { rawPiezas } from "./registry.generated";
import type {
  TocEntry,
  TransparenciaFrontmatter,
  TransparenciaPiece,
  TransparenciaStatus,
  TransparenciaSummary,
  TransparenciaSummaryHtml,
} from "./types";

const STATUSES: readonly TransparenciaStatus[] = ["draft", "published"];

function fail(filename: string, msg: string): never {
  throw new Error(`Frontmatter inválido en ${filename}: ${msg}`);
}

function toIsoDateString(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") return v;
  return String(v);
}

function asString(v: unknown, filename: string, field: string): string {
  if (typeof v !== "string" || v.length === 0) {
    fail(filename, `campo "${field}" debe ser string no vacío`);
  }
  return v;
}

function asStringArray(
  v: unknown,
  filename: string,
  field: string,
): string[] {
  if (!Array.isArray(v) || !v.every((x) => typeof x === "string")) {
    fail(filename, `campo "${field}" debe ser lista de strings`);
  }
  return v as string[];
}

function asEnum<T extends string>(
  v: unknown,
  allowed: readonly T[],
  filename: string,
  field: string,
): T {
  if (typeof v !== "string" || !(allowed as readonly string[]).includes(v)) {
    fail(
      filename,
      `campo "${field}" debe ser uno de [${allowed.join(", ")}], recibido: ${String(v)}`,
    );
  }
  return v as T;
}

function parseSummary(
  v: unknown,
  filename: string,
): TransparenciaSummary {
  if (!v || typeof v !== "object") {
    fail(filename, `campo "summary" debe ser objeto`);
  }
  const o = v as Record<string, unknown>;
  return {
    pregunta: asString(o.pregunta, filename, "summary.pregunta"),
    precios: asString(o.precios, filename, "summary.precios"),
    contratos: asString(o.contratos, filename, "summary.contratos"),
    frontera: asString(o.frontera, filename, "summary.frontera"),
  };
}

function parseToc(v: unknown, filename: string): TocEntry[] {
  if (!Array.isArray(v) || v.length === 0) {
    fail(filename, `campo "toc" debe ser lista no vacía`);
  }
  return v.map((e, i) => {
    if (!e || typeof e !== "object") {
      fail(filename, `toc[${i}] debe ser objeto`);
    }
    const o = e as Record<string, unknown>;
    return {
      anchor: asString(o.anchor, filename, `toc[${i}].anchor`),
      label: asString(o.label, filename, `toc[${i}].label`),
      sub: typeof o.sub === "string" ? o.sub : undefined,
    };
  });
}

function parseFrontmatter(
  filename: string,
  fm: Record<string, unknown>,
): TransparenciaFrontmatter {
  const slug = asString(fm.slug, filename, "slug");
  const fileStem = filename.replace(/\.md$/, "");
  if (slug !== fileStem) {
    fail(
      filename,
      `slug "${slug}" no coincide con el nombre del archivo "${fileStem}"`,
    );
  }
  return {
    title: asString(fm.title, filename, "title"),
    slug,
    caso: asString(fm.caso, filename, "caso"),
    pregunta: asString(fm.pregunta, filename, "pregunta"),
    publishedAt: toIsoDateString(fm.publishedAt),
    updatedAt: fm.updatedAt ? toIsoDateString(fm.updatedAt) : undefined,
    excerpt: asString(fm.excerpt, filename, "excerpt"),
    status: asEnum(fm.status, STATUSES, filename, "status"),
    keywords: fm.keywords
      ? asStringArray(fm.keywords, filename, "keywords")
      : undefined,
    repoPath: typeof fm.repoPath === "string" ? fm.repoPath : undefined,
    summary: parseSummary(fm.summary, filename),
    toc: parseToc(fm.toc, filename),
  };
}

function parseRawPieza(
  filename: string,
  raw: string,
  html: string,
  summaryHtml: TransparenciaSummaryHtml,
): TransparenciaPiece {
  const parsed = matter(raw);
  const fm = parseFrontmatter(filename, parsed.data as Record<string, unknown>);
  return { ...fm, filename, content: parsed.content, html, summaryHtml };
}

let cache: TransparenciaPiece[] | null = null;

async function getAllPiecesIncludingDrafts(): Promise<TransparenciaPiece[]> {
  if (cache) return cache;
  const pieces = rawPiezas.map((r) =>
    parseRawPieza(r.filename, r.raw, r.html, r.summaryHtml),
  );
  pieces.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  cache = pieces;
  return pieces;
}

export async function getAllPiezas(): Promise<TransparenciaPiece[]> {
  const all = await getAllPiecesIncludingDrafts();
  if (process.env.NODE_ENV === "development") {
    return all;
  }
  return all.filter((p) => p.status === "published");
}

export async function getPiezaPorSlug(
  slug: string,
): Promise<TransparenciaPiece | null> {
  const all = await getAllPiecesIncludingDrafts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const all = await getAllPiecesIncludingDrafts();
  return all.filter((p) => p.status === "published").map((p) => p.slug);
}

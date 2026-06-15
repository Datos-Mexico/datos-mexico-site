import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type {
  TransparenciaFrontmatter,
  TransparenciaPiece,
  TransparenciaStatus,
} from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content", "transparencia");

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
  };
}

async function readPieceFile(filename: string): Promise<TransparenciaPiece> {
  const full = path.join(CONTENT_DIR, filename);
  const raw = await readFile(full, "utf8");
  const parsed = matter(raw);
  const fm = parseFrontmatter(filename, parsed.data as Record<string, unknown>);
  return { ...fm, filename, content: parsed.content };
}

let cache: TransparenciaPiece[] | null = null;

async function getAllPiecesIncludingDrafts(): Promise<TransparenciaPiece[]> {
  if (cache) return cache;
  const entries = await readdir(CONTENT_DIR);
  const files = entries
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort();
  const pieces = await Promise.all(files.map((f) => readPieceFile(f)));
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

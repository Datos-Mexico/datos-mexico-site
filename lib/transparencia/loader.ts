import matter from "gray-matter";
import { rawPiezas } from "./registry.generated";
import type {
  BodyChunk,
  ChartData,
  ChartV2,
  ChartV2Item,
  ChartV3,
  ChartV3Item,
  ChartV4,
  ChartV4Item,
  TimelineLane,
  TimelineLaneId,
  TimelineNode,
  TimelineV5,
  TocEntry,
  TransparenciaFrontmatter,
  TransparenciaPiece,
  TransparenciaStatus,
  TransparenciaSummary,
  TransparenciaSummaryHtml,
} from "./types";

const TIMELINE_LANE_IDS: readonly TimelineLaneId[] = [
  "medicion",
  "verificacion",
  "declaracion",
];

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

function asNumber(v: unknown, filename: string, field: string): number {
  if (typeof v !== "number" || !Number.isFinite(v)) {
    fail(filename, `campo "${field}" debe ser número finito`);
  }
  return v;
}

function parseV2Item(v: unknown, filename: string, i: number): ChartV2Item {
  if (!v || typeof v !== "object") {
    fail(filename, `chartData.v2.items[${i}] debe ser objeto`);
  }
  const o = v as Record<string, unknown>;
  return {
    store: asString(o.store, filename, `chartData.v2.items[${i}].store`),
    min: asNumber(o.min, filename, `chartData.v2.items[${i}].min`),
    max: asNumber(o.max, filename, `chartData.v2.items[${i}].max`),
  };
}

function parseV3Item(v: unknown, filename: string, i: number): ChartV3Item {
  if (!v || typeof v !== "object") {
    fail(filename, `chartData.v3.items[${i}] debe ser objeto`);
  }
  const o = v as Record<string, unknown>;
  return {
    variety: asString(o.variety, filename, `chartData.v3.items[${i}].variety`),
    min: asNumber(o.min, filename, `chartData.v3.items[${i}].min`),
    max: asNumber(o.max, filename, `chartData.v3.items[${i}].max`),
  };
}

function parseV4Item(v: unknown, filename: string, i: number): ChartV4Item {
  if (!v || typeof v !== "object") {
    fail(filename, `chartData.v4.items[${i}] debe ser objeto`);
  }
  const o = v as Record<string, unknown>;
  return {
    variety: asString(o.variety, filename, `chartData.v4.items[${i}].variety`),
    origins: asString(o.origins, filename, `chartData.v4.items[${i}].origins`),
    min: asNumber(o.min, filename, `chartData.v4.items[${i}].min`),
    max: asNumber(o.max, filename, `chartData.v4.items[${i}].max`),
  };
}

function parseChartV2(v: unknown, filename: string): ChartV2 {
  if (!v || typeof v !== "object") {
    fail(filename, `chartData.v2 debe ser objeto`);
  }
  const o = v as Record<string, unknown>;
  if (!Array.isArray(o.items) || o.items.length === 0) {
    fail(filename, `chartData.v2.items debe ser lista no vacía`);
  }
  return {
    eyebrow: asString(o.eyebrow, filename, `chartData.v2.eyebrow`),
    title: asString(o.title, filename, `chartData.v2.title`),
    note: asString(o.note, filename, `chartData.v2.note`),
    domainMax: asNumber(o.domainMax, filename, `chartData.v2.domainMax`),
    items: o.items.map((it, i) => parseV2Item(it, filename, i)),
  };
}

function parseChartV3(v: unknown, filename: string): ChartV3 {
  if (!v || typeof v !== "object") {
    fail(filename, `chartData.v3 debe ser objeto`);
  }
  const o = v as Record<string, unknown>;
  if (!Array.isArray(o.items) || o.items.length === 0) {
    fail(filename, `chartData.v3.items debe ser lista no vacía`);
  }
  return {
    eyebrow: asString(o.eyebrow, filename, `chartData.v3.eyebrow`),
    title: asString(o.title, filename, `chartData.v3.title`),
    note: asString(o.note, filename, `chartData.v3.note`),
    domainMax: asNumber(o.domainMax, filename, `chartData.v3.domainMax`),
    items: o.items.map((it, i) => parseV3Item(it, filename, i)),
  };
}

function parseChartV4(v: unknown, filename: string): ChartV4 {
  if (!v || typeof v !== "object") {
    fail(filename, `chartData.v4 debe ser objeto`);
  }
  const o = v as Record<string, unknown>;
  if (!Array.isArray(o.items) || o.items.length === 0) {
    fail(filename, `chartData.v4.items debe ser lista no vacía`);
  }
  return {
    eyebrow: asString(o.eyebrow, filename, `chartData.v4.eyebrow`),
    title: asString(o.title, filename, `chartData.v4.title`),
    note: asString(o.note, filename, `chartData.v4.note`),
    domainMax: asNumber(o.domainMax, filename, `chartData.v4.domainMax`),
    items: o.items.map((it, i) => parseV4Item(it, filename, i)),
  };
}

function parseTimelineLane(
  v: unknown,
  filename: string,
  i: number,
): TimelineLane {
  if (!v || typeof v !== "object") {
    fail(filename, `timeline.lanes[${i}] debe ser objeto`);
  }
  const o = v as Record<string, unknown>;
  return {
    id: asEnum(
      o.id,
      TIMELINE_LANE_IDS,
      filename,
      `timeline.lanes[${i}].id`,
    ),
    label: asString(o.label, filename, `timeline.lanes[${i}].label`),
  };
}

function parseTimelineNode(
  v: unknown,
  filename: string,
  i: number,
): TimelineNode {
  if (!v || typeof v !== "object") {
    fail(filename, `timeline.nodes[${i}] debe ser objeto`);
  }
  const o = v as Record<string, unknown>;
  return {
    id: asString(o.id, filename, `timeline.nodes[${i}].id`),
    lane: asEnum(
      o.lane,
      TIMELINE_LANE_IDS,
      filename,
      `timeline.nodes[${i}].lane`,
    ),
    date: toIsoDateString(o.date),
    dateLabel: asString(
      o.dateLabel,
      filename,
      `timeline.nodes[${i}].dateLabel`,
    ),
    headline: asString(
      o.headline,
      filename,
      `timeline.nodes[${i}].headline`,
    ),
    description: asString(
      o.description,
      filename,
      `timeline.nodes[${i}].description`,
    ),
  };
}

function parseTimeline(v: unknown, filename: string): TimelineV5 {
  if (!v || typeof v !== "object") {
    fail(filename, `campo "timeline" debe ser objeto`);
  }
  const o = v as Record<string, unknown>;
  if (!Array.isArray(o.lanes) || o.lanes.length === 0) {
    fail(filename, `timeline.lanes debe ser lista no vacía`);
  }
  if (!Array.isArray(o.nodes) || o.nodes.length === 0) {
    fail(filename, `timeline.nodes debe ser lista no vacía`);
  }
  return {
    eyebrow: asString(o.eyebrow, filename, `timeline.eyebrow`),
    title: asString(o.title, filename, `timeline.title`),
    note: asString(o.note, filename, `timeline.note`),
    startDate: toIsoDateString(o.startDate),
    endDate: toIsoDateString(o.endDate),
    lanes: o.lanes.map((l, i) => parseTimelineLane(l, filename, i)),
    nodes: o.nodes.map((n, i) => parseTimelineNode(n, filename, i)),
  };
}

function parseChartData(v: unknown, filename: string): ChartData {
  if (!v || typeof v !== "object") {
    fail(filename, `campo "chartData" debe ser objeto`);
  }
  const o = v as Record<string, unknown>;
  return {
    v2: parseChartV2(o.v2, filename),
    v3: parseChartV3(o.v3, filename),
    v4: parseChartV4(o.v4, filename),
    v5: parseTimeline(o.v5, filename),
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
    chartData: parseChartData(fm.chartData, filename),
  };
}

function parseRawPieza(
  filename: string,
  raw: string,
  html: string,
  bodyChunks: ReadonlyArray<BodyChunk>,
  summaryHtml: TransparenciaSummaryHtml,
): TransparenciaPiece {
  const parsed = matter(raw);
  const fm = parseFrontmatter(filename, parsed.data as Record<string, unknown>);
  return {
    ...fm,
    filename,
    content: parsed.content,
    html,
    bodyChunks,
    summaryHtml,
  };
}

let cache: TransparenciaPiece[] | null = null;

async function getAllPiecesIncludingDrafts(): Promise<TransparenciaPiece[]> {
  if (cache) return cache;
  const pieces = rawPiezas.map((r) =>
    parseRawPieza(r.filename, r.raw, r.html, r.bodyChunks, r.summaryHtml),
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

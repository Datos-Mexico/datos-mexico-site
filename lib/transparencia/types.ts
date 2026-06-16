export type TransparenciaStatus = "draft" | "published";

export type TransparenciaSummary = {
  pregunta: string;
  precios: string;
  contratos: string;
  frontera: string;
};

export type TransparenciaSummaryHtml = {
  pregunta: string;
  precios: string;
  contratos: string;
  frontera: string;
};

export type TocEntry = {
  anchor: string;
  label: string;
  sub?: string;
};

export type ChartV2Item = {
  store: string;
  min: number;
  max: number;
};

export type ChartV3Item = {
  variety: string;
  min: number;
  max: number;
};

export type ChartV4Item = {
  variety: string;
  origins: string;
  min: number;
  max: number;
};

export type ChartV2 = {
  eyebrow: string;
  title: string;
  note: string;
  domainMax: number;
  items: ChartV2Item[];
};

export type ChartV3 = {
  eyebrow: string;
  title: string;
  note: string;
  domainMax: number;
  items: ChartV3Item[];
};

export type ChartV4 = {
  eyebrow: string;
  title: string;
  note: string;
  domainMax: number;
  items: ChartV4Item[];
};

export type ChartData = {
  v2: ChartV2;
  v3: ChartV3;
  v4: ChartV4;
};

export type BodyChunk = {
  html: string;
  chartAfter: "V2" | "V3" | "V4" | null;
};

export type TransparenciaFrontmatter = {
  title: string;
  slug: string;
  caso: string;
  pregunta: string;
  publishedAt: string;
  updatedAt?: string;
  excerpt: string;
  status: TransparenciaStatus;
  keywords?: string[];
  repoPath?: string;
  summary: TransparenciaSummary;
  toc: TocEntry[];
  chartData: ChartData;
};

export type TransparenciaPiece = TransparenciaFrontmatter & {
  filename: string;
  content: string;
  html: string;
  bodyChunks: ReadonlyArray<BodyChunk>;
  summaryHtml: TransparenciaSummaryHtml;
};

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
};

export type TransparenciaPiece = TransparenciaFrontmatter & {
  filename: string;
  content: string;
  html: string;
  summaryHtml: TransparenciaSummaryHtml;
};

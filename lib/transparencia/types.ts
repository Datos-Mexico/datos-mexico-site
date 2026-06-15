export type TransparenciaStatus = "draft" | "published";

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
};

export type TransparenciaPiece = TransparenciaFrontmatter & {
  filename: string;
  content: string;
};

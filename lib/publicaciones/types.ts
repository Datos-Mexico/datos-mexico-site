export type CategorySlug = "mercado-laboral" | "pensiones" | "hogares-bienestar";

export type Category = {
  slug: CategorySlug;
  label: string;
  description: string;
};

export type DataSource = {
  name: string;
  url: string;
  accessedAt: string;
};

export type PublicationStatus = "draft" | "published";

export type PublicationFrontmatter = {
  title: string;
  slug: string;
  category: CategorySlug;
  publishedAt: string;
  updatedAt?: string;
  excerpt: string;
  abstract?: string;
  keywords?: string[];
  /**
   * IDs de miembros del equipo (ver `lib/team.ts`). Se resuelven a nombres
   * reales en `generateMetadata` para emitir `citation_author` múltiples.
   * Si se omite, el HTML cae a la firma institucional única.
   */
  authors?: string[];
  readingTime: number;
  dataSource: DataSource[];
  status: PublicationStatus;
};

export type Publication = PublicationFrontmatter & {
  filename: string;
  content: string;
};

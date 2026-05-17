import type { ComponentType } from "react";
import type { PublicationFrontmatter } from "./types";

import * as servidoresPublicosCdmx from "@/content/publicaciones/servidores-publicos-cdmx.mdx";
import * as sarRecursosAdministrados from "@/content/publicaciones/sar-recursos-administrados.mdx";
import * as hogaresMexicanosEnigh2024 from "@/content/publicaciones/hogares-mexicanos-enigh-2024.mdx";

export type PublicationModule = {
  default: ComponentType;
  meta: PublicationFrontmatter;
};

export type RegistryEntry = {
  filename: string;
  module: PublicationModule;
};

export const registry: readonly RegistryEntry[] = [
  {
    filename: "servidores-publicos-cdmx.mdx",
    module: servidoresPublicosCdmx as unknown as PublicationModule,
  },
  {
    filename: "sar-recursos-administrados.mdx",
    module: sarRecursosAdministrados as unknown as PublicationModule,
  },
  {
    filename: "hogares-mexicanos-enigh-2024.mdx",
    module: hogaresMexicanosEnigh2024 as unknown as PublicationModule,
  },
];

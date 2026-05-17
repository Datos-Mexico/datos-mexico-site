import type { MDXComponents } from "mdx/types";
import { publicationMdxComponents } from "@/components/publicaciones/mdx-components";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...publicationMdxComponents,
    ...components,
  };
}

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "@/lib/preguntas/markdown";
import { getBannerCanonico } from "@/lib/preguntas/loader";
import type { Articulo } from "@/lib/preguntas/types";

export async function ArticuloBanner({ articulo }: { articulo: Articulo }) {
  if (articulo.estado !== "pre-firma") return null;
  const copy = await getBannerCanonico(articulo.estado);
  if (!copy) return null;

  return (
    <aside
      aria-label="Aviso de estado del artículo"
      className="mt-10 max-w-3xl rounded-lg border border-warning/40 bg-warning/5 p-6 md:p-7"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {copy}
      </ReactMarkdown>
    </aside>
  );
}

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "@/lib/preguntas/markdown";

export function TransparenciaBody({ content }: { content: string }) {
  return (
    <div className="mt-12 max-w-3xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

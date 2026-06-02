import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "@/lib/preguntas/markdown";

function stripBannerMarker(content: string): string {
  return content
    .split("\n")
    .filter((line) => !line.trim().startsWith("<!-- BANNER:"))
    .join("\n");
}

function stripTitulo(content: string): string {
  const lines = content.split("\n");
  const firstH1 = lines.findIndex((l) => l.startsWith("# "));
  if (firstH1 === -1) return content;
  return lines
    .filter((_, i) => i !== firstH1)
    .join("\n")
    .replace(/^\n+/, "");
}

function stripDisclaimerBlockquote(content: string): string {
  const lines = content.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith("> **Marcas temporales de vigencia.")) {
      while (i < lines.length && lines[i].startsWith(">")) i++;
      while (i < lines.length && lines[i].trim() === "") i++;
      continue;
    }
    out.push(line);
    i++;
  }
  return out.join("\n");
}

export function ArticuloBody({ content }: { content: string }) {
  const cleaned = stripDisclaimerBlockquote(
    stripTitulo(stripBannerMarker(content)),
  ).trim();

  return (
    <div className="mt-10 max-w-3xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {cleaned}
      </ReactMarkdown>
    </div>
  );
}

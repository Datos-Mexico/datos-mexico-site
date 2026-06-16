export function stripBannerMarker(content: string): string {
  return content
    .split("\n")
    .filter((line) => !line.trim().startsWith("<!-- BANNER:"))
    .join("\n");
}

export function stripTitulo(content: string): string {
  const lines = content.split("\n");
  const firstH1 = lines.findIndex((l) => l.startsWith("# "));
  if (firstH1 === -1) return content;
  return lines
    .filter((_, i) => i !== firstH1)
    .join("\n")
    .replace(/^\n+/, "");
}

export function stripDisclaimerBlockquote(content: string): string {
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

export function stripAllForArticulo(content: string): string {
  return stripDisclaimerBlockquote(
    stripTitulo(stripBannerMarker(content)),
  ).trim();
}

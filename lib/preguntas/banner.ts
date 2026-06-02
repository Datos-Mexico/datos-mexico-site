export function extractCanonicalCopy(
  bannerMd: string,
  sectionTitle: string,
): string {
  const lines = bannerMd.split("\n");
  const heading = `## ${sectionTitle}`;
  const startIdx = lines.findIndex((l) => l.trim() === heading);
  if (startIdx === -1) {
    throw new Error(
      `Banner sin sección "${heading}". Verifica el archivo de banner del observatorio.`,
    );
  }
  const after = lines.slice(startIdx + 1);
  const endRel = after.findIndex((l) => l.trim() === "---");
  const block = endRel === -1 ? after : after.slice(0, endRel);
  return block.join("\n").trim();
}

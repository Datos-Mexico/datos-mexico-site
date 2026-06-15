import { Body, Mono } from "@/components/typography";

export function BannerBorrador() {
  return (
    <aside
      role="status"
      aria-label="Pieza en borrador, no publicada"
      className="mx-auto mb-10 max-w-3xl rounded-lg border-2 border-dashed border-border bg-muted/60 px-6 py-5"
    >
      <Mono className="block text-[11px] uppercase tracking-[0.14em] text-text-subtle">
        Borrador no publicado
      </Mono>
      <Body className="mt-2 text-[14px] leading-[1.55] text-text-subtle">
        Esta pieza está en proceso de validación humana del observatorio.
        No forma parte todavía del contenido público publicado y no es
        indexable.
      </Body>
    </aside>
  );
}

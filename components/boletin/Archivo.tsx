import { Mail } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Archivo() {
  return (
    <section id="archivo" className="border-b border-border py-16 md:py-20">
      <SectionHeader
        eyebrow="Archivo"
        title="Boletines anteriores."
        lead="Todos los boletines que enviamos quedan archivados públicamente. Puedes consultarlos sin necesidad de suscribirte."
      />

      <div className="mt-12 rounded-md border border-dashed border-border p-12 text-center">
        <Mail
          className="mx-auto h-10 w-10 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <p className="mt-5 mx-auto max-w-md font-sans text-[15px] leading-[1.65] text-text-subtle">
          El primer boletín se enviará cuando lancemos oficialmente el
          observatorio. Los suscritos lo recibirán en su correo y aparecerá aquí
          poco después.
        </p>
      </div>

      {/* TODO: cuando exista archivo real, sustituir este bloque por <BoletinArchive items={...} />
          Estructura sugerida: lista cronológica con fecha, título, badge del tipo
          (análisis/nota/coyuntura), excerpt, link al boletín completo. */}
    </section>
  );
}

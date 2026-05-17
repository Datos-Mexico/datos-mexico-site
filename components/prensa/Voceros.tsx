import { Mail } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Mono } from "@/components/typography";

export function Voceros() {
  return (
    <section
      id="voceros"
      aria-label="Vocería"
      className="border-b border-border py-20 md:py-24"
    >
      <SectionHeader
        eyebrow="Vocería"
        title="Quién habla con prensa."
        lead="Las consultas de medios se canalizan a través de un email único. El equipo responde de manera coordinada según el tema y la urgencia. Para coyuntura del día, indícalo en el asunto del correo."
      />

      <div className="mt-12 mx-auto max-w-2xl rounded-lg border border-border bg-background p-8 text-center">
        <a
          href="mailto:prensa@datosmexico.org"
          className="inline-flex items-center gap-3 font-serif text-[22px] font-semibold text-primary underline-offset-4 hover:underline md:text-[24px]"
        >
          <Mail className="h-5 w-5" aria-hidden="true" />
          prensa@datosmexico.org
        </a>
        <Mono className="mt-4 block text-[13px] text-text-subtle">
          24 horas hábiles · mismo día para coyuntura
        </Mono>
      </div>
    </section>
  );
}

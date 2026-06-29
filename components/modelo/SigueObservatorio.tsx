import { Body } from "@/components/typography";
import { Button } from "@/components/ui/Button";

export function SigueObservatorio() {
  return (
    <section
      id="sigue-observatorio"
      className="border-b border-border py-20 md:py-24"
    >
      <div className="max-w-3xl">
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-text-subtle">
          Boletín del observatorio
        </p>
        <h3 className="mt-5 font-serif text-[22px] font-semibold leading-[1.3] text-foreground md:text-[24px]">
          Sigue lo que publica el observatorio.
        </h3>
        <Body className="mt-5 text-[16px] leading-[1.65] md:text-[17px]">
          Cada quince días enviamos un boletín con los análisis, notas
          breves y comentarios de coyuntura publicados en el periodo.
          Si quieres seguir el trabajo del observatorio, suscríbete —
          sin spam, sin paywalls, sin venta de datos.
        </Body>
        <div className="mt-8">
          <Button href="/boletin" variant="outline" size="lg">
            Suscríbete al boletín →
          </Button>
        </div>
      </div>
    </section>
  );
}

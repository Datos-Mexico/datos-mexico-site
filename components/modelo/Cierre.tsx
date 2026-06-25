import { Button } from "@/components/ui/Button";
import { Body } from "@/components/typography";

export function Cierre() {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-2xl rounded-lg bg-muted px-6 py-12 text-center md:px-12 md:py-16">
        <h3 className="font-serif text-[24px] font-semibold leading-[1.3] text-foreground md:text-[28px]">
          ¿Quieres conversar sobre un encargo o un apoyo institucional?
        </h3>
        <Body className="mt-5 text-[16px] leading-[1.65] text-text md:text-[17px]">
          Si representas a un medio, un despacho, una asociación o una
          fundación y quieres conversar con el observatorio sobre una
          investigación por encargo o un apoyo a la capacidad operativa,
          escríbenos. La regla de independencia del §4 es punto de partida
          de cualquier conversación.
        </Body>
        <div className="mt-8 flex justify-center">
          <Button
            href="mailto:contacto@datosmexico.org"
            variant="outline"
            size="lg"
          >
            Escríbenos a contacto@datosmexico.org
          </Button>
        </div>
      </div>
    </section>
  );
}

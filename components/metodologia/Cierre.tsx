import { Button } from "@/components/ui/Button";
import { Body } from "@/components/typography";

export function Cierre() {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-2xl rounded-lg bg-muted px-6 py-12 text-center md:px-12 md:py-16">
        <h3 className="font-serif text-[24px] font-semibold leading-[1.3] text-foreground md:text-[28px]">
          ¿Quieres revisar nuestro método más a fondo?
        </h3>
        <Body className="mt-5 text-[16px] leading-[1.65] text-text md:text-[17px]">
          Si eres investigador, periodista de datos, o trabajas con encuestas
          oficiales y quieres revisar cómo procesamos algún dataset específico,
          escríbenos. Compartimos código, esquemas y procedimientos sin
          restricciones.
        </Body>
        <div className="mt-8 flex justify-center">
          <Button
            href="mailto:academia@datosmexico.org"
            variant="outline"
            size="lg"
          >
            Escríbenos a academia@datosmexico.org
          </Button>
        </div>
      </div>
    </section>
  );
}

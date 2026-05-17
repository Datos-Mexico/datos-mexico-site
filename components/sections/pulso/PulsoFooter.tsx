import { Container } from "@/components/layout/Container";
import { H2, Mono } from "@/components/typography";
import { Button } from "@/components/ui/Button";

export function PulsoFooter() {
  return (
    <section className="border-b border-border bg-foreground py-20 text-text-inverse md:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <H2 className="text-text-inverse">
              Detrás de cada cifra, un microdato auditable.
            </H2>
            <p className="mt-6 max-w-xl font-sans text-[17px] leading-[1.65] text-text-inverse/75">
              Cada número de esta pantalla viene de fuentes oficiales —
              CONSAR, INEGI, Datos Abiertos CDMX — y se valida al peso
              contra los reportes públicos antes de publicarse.
            </p>
          </div>
          <div className="flex flex-col justify-end gap-3 lg:col-span-5">
            <Button href="/publicaciones" variant="primary" size="lg">
              Lee las publicaciones
            </Button>
            <Button
              href="/metodologia"
              variant="outline"
              size="lg"
              className="border-text-inverse/30 bg-transparent text-text-inverse hover:bg-text-inverse/10"
            >
              Ver metodología
            </Button>
            <Mono className="mt-2 text-text-inverse/55">
              CONSAR · INEGI ENIGH · Datos Abiertos CDMX
            </Mono>
          </div>
        </div>
      </Container>
    </section>
  );
}

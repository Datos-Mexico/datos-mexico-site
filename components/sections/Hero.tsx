import { Container } from "@/components/layout/Container";
import { Display, Lead, Eyebrow, Mono } from "@/components/typography";
import { Button } from "@/components/ui/Button";
import { ExternalLinkIcon } from "@/components/ui/ExternalLinkIcon";
import { HeroMapaMexico } from "@/components/sections/mapa/HeroMapaMexico";
import { HeroPensionesEntry } from "./HeroPensionesEntry";

export function Hero() {
  return (
    <section className="relative border-b border-border">
      <Container>
        <div className="flex min-h-[80vh] flex-col justify-center py-20 md:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="max-w-4xl lg:col-span-7">
              <Eyebrow className="mb-6">
                Observatorio independiente · Desde el ITAM
              </Eyebrow>

              <Display>Del microdato a la conversación pública.</Display>

              <Lead className="mt-8 max-w-3xl">
                Procesamos y validamos datos públicos de México con rigor académico,
                para que ciudadanía, prensa, academia y gobierno tomen decisiones
                informadas.
              </Lead>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button
                  href="https://datos-itam.org"
                  external
                  variant="primary"
                  size="lg"
                >
                  Explora el observatorio
                  <ExternalLinkIcon />
                </Button>
                <Button href="/publicaciones" variant="outline" size="lg">
                  Lee nuestras publicaciones
                </Button>
              </div>

              <Mono className="mt-10 block text-[13px]">
                Validado al peso contra INEGI · CONSAR · Banxico
              </Mono>
            </div>

            <div className="lg:col-span-5">
              <HeroMapaMexico />
            </div>
          </div>

          <HeroPensionesEntry />
        </div>
      </Container>
    </section>
  );
}

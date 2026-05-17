import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { H2, Lead, Body } from "@/components/typography";

const items = [
  "Microdatos descargables",
  "Notas metodológicas en cada gráfica",
  "Hash SHA-256 de integridad",
  "Código abierto en repositorio público",
];

export function Metodologia() {
  return (
    <section className="border-b border-border py-20 md:py-28">
      <Container>
        <div className="rounded-lg bg-muted px-6 py-12 md:px-12 md:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col">
              <H2>Toda cifra publicada es reproducible.</H2>
              <Lead className="mt-5 max-w-xl">
                Documentamos fuentes, supuestos y código de cada análisis.
                Cualquiera puede auditar lo que decimos.
              </Lead>
              <Link
                href="/metodologia"
                className="mt-8 inline-flex items-center gap-1.5 font-sans text-[15px] font-medium text-primary hover:gap-2.5 transition-[gap]"
              >
                Lee nuestra metodología
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <ul className="space-y-4 lg:pt-2">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check
                      className="h-3 w-3 text-primary"
                      aria-hidden="true"
                    />
                  </span>
                  <Body as="span" className="text-[16px]">
                    {item}
                  </Body>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

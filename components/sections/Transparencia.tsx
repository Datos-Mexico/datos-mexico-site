import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Eyebrow, H2, Body } from "@/components/typography";
import { TransparenciaCard } from "@/components/transparencia/TransparenciaCard";
import { getAllPiezas } from "@/lib/transparencia/loader";

export async function Transparencia() {
  const all = await getAllPiezas();
  const items = all.slice(0, 3);

  if (items.length === 0) return null;

  const gridClass =
    items.length === 1
      ? "mt-12 max-w-xl"
      : items.length === 2
        ? "mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
        : "mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8";

  return (
    <section className="border-b border-border py-20 md:py-28">
      <Container>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="mb-4">Transparencia</Eyebrow>
            <H2>Transparencia y rendición de cuentas.</H2>
          </div>
          <Link
            href="/transparencia"
            className="hidden items-center gap-1.5 font-sans text-[15px] font-medium text-primary md:inline-flex hover:gap-2.5 transition-[gap]"
          >
            Ir a Transparencia
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <Body className="mt-6 max-w-2xl text-[15px] leading-[1.6] text-text-subtle md:text-[16px] md:leading-[1.7]">
          El observatorio atiende encargos de prensa sobre transparencia
          y rendición de cuentas. Cada caso queda público con su
          pregunta, sus fuentes verificadas, su marco aplicable y la
          pieza firmada.
        </Body>

        <div className={gridClass}>
          {items.map((pieza) => (
            <TransparenciaCard key={pieza.slug} pieza={pieza} />
          ))}
        </div>

        <div className="mt-10 md:hidden">
          <Link
            href="/transparencia"
            className="inline-flex items-center gap-1.5 font-sans text-[15px] font-medium text-primary"
          >
            Ir a Transparencia
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}

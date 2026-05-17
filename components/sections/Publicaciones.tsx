import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Eyebrow, H2, H3, Body, Mono } from "@/components/typography";

type Publicacion = {
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  href: string;
};

const publicaciones: Publicacion[] = [
  {
    category: "Mercado laboral",
    title:
      "Servidores públicos CDMX: el 88% gana menos de 20 mil pesos al mes",
    excerpt:
      "Procesamos las nóminas de 246,831 servidores públicos de la CDMX para describir la distribución real del gasto en remuneraciones.",
    date: "22 abr 2026",
    readingTime: "8 min",
    href: "/publicaciones",
  },
  {
    category: "Pensiones",
    title:
      "El SAR mexicano supera los 10 billones de pesos: composición y caveats",
    excerpt:
      "Reconstruimos la serie 1998–2025 de CONSAR y mostramos cómo se comparan rendimientos reales por SIEFORE, controlando por inflación.",
    date: "18 abr 2026",
    readingTime: "12 min",
    href: "/publicaciones",
  },
  {
    category: "Geografía económica",
    title:
      "Nuevo León supera a la CDMX en ingreso por hogar: lo que dice la ENIGH 2024",
    excerpt:
      "Cruzamos ENIGH 2024 con datos de actividad económica para entender qué está pasando en el norte y por qué la convergencia se acelera.",
    date: "12 abr 2026",
    readingTime: "10 min",
    href: "/publicaciones",
  },
];

export function Publicaciones() {
  return (
    <section className="border-b border-border py-20 md:py-28">
      <Container>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="mb-4">Análisis recientes</Eyebrow>
            <H2>Publicaciones recientes.</H2>
          </div>
          <Link
            href="/publicaciones"
            className="hidden items-center gap-1.5 font-sans text-[15px] font-medium text-primary md:inline-flex hover:gap-2.5 transition-[gap]"
          >
            Ver todas las publicaciones
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 -mx-6 overflow-x-auto px-6 md:mx-0 md:overflow-visible md:px-0">
          <ul className="flex w-max gap-6 md:grid md:w-full md:grid-cols-3 md:gap-8">
            {publicaciones.map((pub) => (
              <li
                key={pub.title}
                className="w-[320px] flex-shrink-0 md:w-auto"
              >
                <Link
                  href={pub.href}
                  className="group flex h-full flex-col rounded-lg border border-border bg-background p-6 transition-colors hover:border-foreground/30 hover:bg-muted/40"
                >
                  <Mono className="text-[12px] uppercase tracking-[0.1em] text-accent">
                    {pub.category}
                  </Mono>
                  <H3 className="mt-3 text-[20px] leading-[1.3] md:text-[22px] group-hover:text-primary transition-colors">
                    {pub.title}
                  </H3>
                  <Body className="mt-3 text-[15px] leading-[1.55] text-text-subtle">
                    {pub.excerpt}
                  </Body>
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4 mt-6">
                    <Mono className="text-[12px]">{pub.date}</Mono>
                    <Mono className="text-[12px]">{pub.readingTime}</Mono>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 md:hidden">
          <Link
            href="/publicaciones"
            className="inline-flex items-center gap-1.5 font-sans text-[15px] font-medium text-primary"
          >
            Ver todas las publicaciones
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}

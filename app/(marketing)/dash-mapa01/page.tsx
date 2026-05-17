import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { Mono } from "@/components/typography";
import { IngresoPorDecil } from "@/components/sections/pulso/IngresoPorDecil";
import { PulsoFooter } from "@/components/sections/pulso/PulsoFooter";
import { PulsoHero } from "@/components/sections/pulso/PulsoHero";
import { SarHistorico } from "@/components/sections/pulso/SarHistorico";

export const metadata: Metadata = {
  title: "Pulso de México — el país en cifras vivas",
  description:
    "Una vista en vivo del observatorio: ahorros para el retiro, hogares mexicanos, ingreso mediano, brecha de género y desigualdad por decil — todo validado al peso contra fuentes oficiales.",
  alternates: { canonical: "/dash-mapa01" },
  openGraph: {
    title: "Pulso de México — el país en cifras vivas",
    description:
      "Cifras vivas del observatorio Datos México: SAR, ENIGH, CDMX. Validadas al peso contra INEGI, CONSAR y Banxico.",
    url: "/dash-mapa01",
  },
};

function HeroSkeleton() {
  return (
    <section className="border-b border-border bg-background">
      <Container>
        <div className="py-20 md:py-28">
          <div className="h-3 w-44 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-16 w-80 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-5 w-96 animate-pulse rounded bg-muted" />
          <div className="mt-16 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="h-32 w-72 animate-pulse rounded bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-8 lg:col-span-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ChartSkeleton() {
  return (
    <section className="border-b border-border bg-muted/40 py-20 md:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-3">
            <div className="h-3 w-28 animate-pulse rounded bg-muted-foreground/15" />
            <div className="h-10 w-64 animate-pulse rounded bg-muted-foreground/15" />
          </div>
          <div className="h-[380px] animate-pulse rounded bg-muted-foreground/10 lg:col-span-8" />
        </div>
      </Container>
    </section>
  );
}

export default function DashMapa01Page() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <PulsoHero />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <SarHistorico />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <IngresoPorDecil />
      </Suspense>
      <PulsoFooter />
      <section className="bg-background py-10">
        <Container>
          <Mono className="block text-center text-[12px]">
            Vista experimental · /dash-mapa01 · iteración 01
          </Mono>
        </Container>
      </section>
    </>
  );
}

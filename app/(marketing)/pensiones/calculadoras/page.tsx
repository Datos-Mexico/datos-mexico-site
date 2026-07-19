import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Mono } from "@/components/typography";
import { calculadoras } from "@/lib/pensiones/calc/indice";

export const metadata: Metadata = {
  title: "Calculadoras de pensiones",
  description:
    "Diez herramientas educativas de pensión IMSS (Ley 73, Ley 97 y transición) del observatorio Datos México: escenarios en pesos de hoy, supuestos públicos y metodología validada actuarialmente. No es asesoría financiera.",
  alternates: { canonical: "/pensiones/calculadoras" },
  openGraph: {
    title: "Calculadoras de pensiones — Datos México",
    description:
      "Diez herramientas de pensión IMSS con supuestos públicos y metodología validada actuarialmente.",
    url: "/pensiones/calculadoras",
    type: "website",
  },
};

function Grid({ familia }: { familia: "proyeccion" | "presupuesto" }) {
  const items = calculadoras.filter((c) => c.familia === familia);
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((c) => (
        <a
          key={c.slug}
          href={`/pensiones/calculadoras/${c.slug}`}
          className="group rounded-lg border border-border bg-background p-6 transition-colors hover:border-foreground"
        >
          <h3 className="font-serif text-[18px] font-semibold text-foreground">{c.titulo}</h3>
          <p className="mt-2 font-sans text-[15px] leading-[1.6] text-text-subtle">{c.descripcion}</p>
          <span className="mt-3 inline-block font-mono text-[12px] text-primary">Abrir calculadora →</span>
        </a>
      ))}
    </div>
  );
}

export default function CalculadorasPage() {
  return (
    <section className="border-b border-border py-20 md:py-24">
      <Container>
        <SectionHeader
          eyebrow="Pensiones · Herramientas"
          title="Calculadoras de pensiones."
          lead="Diez herramientas educativas para entender tu retiro IMSS: proyección de pensión (Ley 73, Ley 97 y transición) y presupuesto (gasto, salud, reemplazo). En pesos de hoy, con supuestos públicos y metodología validada actuarialmente. Informan; las decisiones son tuyas."
        />

        <a
          href="/pensiones/tu-retiro"
          className="group mt-12 flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-6 transition-colors hover:border-foreground sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <span className="font-mono text-[12px] text-accent">¿No sabes por dónde empezar?</span>
            <h3 className="mt-1 font-serif text-[18px] font-semibold text-foreground">Tu retiro — un recorrido personal</h3>
            <p className="mt-1 font-sans text-[15px] leading-[1.6] text-text-subtle">Un test breve te lleva a la lectura y la calculadora más relevantes para tu etapa.</p>
          </div>
          <span className="shrink-0 font-mono text-[13px] text-primary">Comenzar el recorrido →</span>
        </a>

        <div className="mt-12">
          <Mono className="block text-[12px]">Proyección · motor actuarial</Mono>
          <Grid familia="proyeccion" />
        </div>

        <div className="mt-12">
          <Mono className="block text-[12px]">Presupuesto y hábitos</Mono>
          <Grid familia="presupuesto" />
        </div>

        <div className="mt-12">
          <a
            href="/pensiones/calculadoras/metodologia"
            className="font-mono text-[13px] text-primary underline-offset-4 hover:underline"
          >
            Metodología consolidada y marco [R]/[V]/[S] →
          </a>
        </div>

        <Mono className="mt-10 block text-[12px]">
          Proyecciones educativas · no constituyen asesoría financiera
        </Mono>
      </Container>
    </section>
  );
}

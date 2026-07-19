import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Mono } from "@/components/typography";
import { Sar29Timeline } from "@/components/pensiones/Sar29Timeline";
import { sar29Entregas, sar29Dataset } from "@/lib/pensiones/sar29";
import { calculadoras } from "@/lib/pensiones/calc/indice";

export const metadata: Metadata = {
  title: "Pensiones",
  description:
    "El frente de pensiones del observatorio Datos México: la serie “El SAR en 29 años” (1997–2025), diez calculadoras de pensión IMSS, el recorrido personal “Tu retiro” y el panel de datos abierto DM-SAR-DATA-001. En pesos de hoy, con supuestos públicos.",
  alternates: { canonical: "/pensiones" },
  openGraph: {
    title: "Pensiones — Datos México",
    description:
      "La serie “El SAR en 29 años”, diez calculadoras de pensión IMSS, el recorrido “Tu retiro” y el panel de datos abierto del SAR — en una sola sección.",
    url: "/pensiones",
    type: "website",
  },
};

const proyeccion = calculadoras.filter((c) => c.familia === "proyeccion");
const presupuesto = calculadoras.filter((c) => c.familia === "presupuesto");

function CalcCard({ slug, titulo, descripcion }: { slug: string; titulo: string; descripcion: string }) {
  return (
    <a
      href={`/pensiones/calculadoras/${slug}`}
      className="group rounded-lg border border-border bg-background p-5 transition-colors hover:border-foreground"
    >
      <h4 className="font-serif text-[16px] font-semibold text-foreground">{titulo}</h4>
      <p className="mt-1.5 font-sans text-[14px] leading-[1.55] text-text-subtle">{descripcion}</p>
    </a>
  );
}

export default function PensionesHub() {
  return (
    <>
      {/* BLOQUE 1 — Pieza visual SAR-29 (componente sin modificar; el dato primero) */}
      <Sar29Timeline />

      {/* BLOQUE 2 — La serie: acceso compacto a las 29 entregas + panel de datos */}
      <section id="serie-entregas" className="border-b border-t border-border py-16 md:py-20 scroll-mt-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <Mono className="block text-[12px] text-accent">La serie</Mono>
              <h2 className="mt-3 font-serif text-[28px] font-semibold leading-[1.15] text-foreground md:text-[34px]">
                29 entregas, año por año.
              </h2>
              <p className="mt-4 font-sans text-[16px] leading-[1.65] text-text-subtle">
                Cada año del Sistema de Ahorro para el Retiro, de 1997 a 2025, es un documento
                autocontenido con cifras verificadas contra fuentes oficiales (CONSAR, INEGI, Banxico).
                Serie descriptiva-retrospectiva: no realiza proyecciones propias.
              </p>
              <div className="mt-6 rounded-lg border border-border bg-muted/40 p-6">
                <Mono className="block text-[12px]">{sar29Dataset.id}</Mono>
                <p className="mt-2 font-sans text-[15px] leading-[1.6] text-text-subtle">
                  Panel mensual del SAR por AFORE, 1997–2025 — la base que alimenta la serie.
                </p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <a href={sar29Dataset.csv} className="font-mono text-[13px] text-primary underline-offset-4 hover:underline">Descargar CSV</a>
                  <a href={sar29Dataset.diccionario} className="font-mono text-[13px] text-primary underline-offset-4 hover:underline">Diccionario</a>
                  <a href={sar29Dataset.apendice} className="font-mono text-[13px] text-primary underline-offset-4 hover:underline">Apéndice</a>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <p className="mb-3 font-mono text-[12px] text-text-subtle">Abre cualquier año</p>
              <ol className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8">
                {sar29Entregas.map((e) => (
                  <li key={e.year}>
                    <a
                      href={e.href}
                      className="flex items-center justify-center rounded-md border border-border py-2.5 font-mono text-[14px] text-text-subtle transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {e.year}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </section>

      {/* BLOQUE 3 — Tu situación: journey + 10 calculadoras por familia */}
      <section id="tu-situacion" className="border-b border-border py-16 md:py-20 scroll-mt-20">
        <Container>
          <Mono className="block text-[12px] text-accent">Tu situación</Mono>
          <h2 className="mt-3 font-serif text-[28px] font-semibold leading-[1.15] text-foreground md:text-[34px]">
            Del sistema a tu caso.
          </h2>
          <p className="mt-4 max-w-2xl font-sans text-[16px] leading-[1.65] text-text-subtle">
            Herramientas educativas para entender tu retiro IMSS: proyección de pensión (Ley 73, Ley 97
            y transición) y presupuesto. En pesos de hoy, con supuestos públicos y metodología validada
            actuarialmente. Informan; las decisiones son tuyas.
          </p>

          <a
            href="/pensiones/tu-retiro"
            className="group mt-8 flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-6 transition-colors hover:border-foreground sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <span className="font-mono text-[12px] text-accent">¿No sabes por dónde empezar?</span>
              <h3 className="mt-1 font-serif text-[18px] font-semibold text-foreground">Tu retiro — un recorrido personal</h3>
              <p className="mt-1 font-sans text-[15px] leading-[1.6] text-text-subtle">Un test breve te lleva a la lectura y la calculadora más relevantes para tu etapa.</p>
            </div>
            <span className="shrink-0 font-mono text-[13px] text-primary">Comenzar el recorrido →</span>
          </a>

          <div className="mt-10">
            <div className="flex items-baseline justify-between gap-4">
              <Mono className="block text-[12px]">Proyección · motor actuarial</Mono>
              <a href="/pensiones/calculadoras" className="font-mono text-[12px] text-primary underline-offset-4 hover:underline">
                Ver el índice completo →
              </a>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {proyeccion.map((c) => <CalcCard key={c.slug} {...c} />)}
            </div>
          </div>
          <div className="mt-8">
            <Mono className="block text-[12px]">Presupuesto y hábitos</Mono>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {presupuesto.map((c) => <CalcCard key={c.slug} {...c} />)}
            </div>
          </div>
        </Container>
      </section>

      {/* BLOQUE 4 — Metodología: resumen [R]/[V]/[S] + acceso a la página completa */}
      <section id="metodologia" className="border-b border-border py-16 md:py-20 scroll-mt-20">
        <Container>
          <Mono className="block text-[12px] text-accent">Metodología</Mono>
          <h2 className="mt-3 font-serif text-[28px] font-semibold leading-[1.15] text-foreground md:text-[34px]">
            Cada cifra, con su etiqueta.
          </h2>
          <p className="mt-4 max-w-2xl font-sans text-[16px] leading-[1.65] text-text-subtle">
            Las calculadoras comparten un motor común y un marco de transparencia: cada valor declara su
            naturaleza. Los montos van en pesos de hoy salvo indicación contraria.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/40 p-5">
              <span className="inline-block rounded bg-primary px-2 py-0.5 font-mono text-[11px] font-bold text-primary-foreground">R</span>
              <span className="ml-2 font-semibold text-foreground">Reglas de ley</span>
              <p className="mt-2 font-sans text-[14px] leading-[1.55] text-text-subtle">Requisitos de edad y semanas, aportaciones art. 168, tablas de la Ley 73 y la matriz de pensión garantizada art. 170 — con fuente oficial versionada.</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-5">
              <span className="inline-block rounded bg-success px-2 py-0.5 font-mono text-[11px] font-bold text-primary-foreground">V</span>
              <span className="ml-2 font-semibold text-foreground">Datos verificados</span>
              <p className="mt-2 font-sans text-[14px] leading-[1.55] text-text-subtle">UMA y salario mínimo 2026, tablas EMSSA-09, gasto de los hogares por edad (ENIGH 2024) y referencias OIT/OCDE. Son datos, no escenarios.</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-5">
              <span className="inline-block rounded bg-accent px-2 py-0.5 font-mono text-[11px] font-bold text-accent-foreground">S</span>
              <span className="ml-2 font-semibold text-foreground">Escenario ilustrativo</span>
              <p className="mt-2 font-sans text-[14px] leading-[1.55] text-text-subtle">Rendimiento real (1.5/3.0/4.5%), crecimiento salarial y constancia de cotización — hipótesis declaradas, siempre en rango, nunca cifra única.</p>
            </div>
          </div>
          <div className="mt-6">
            <a href="/pensiones/calculadoras/metodologia" className="font-mono text-[13px] text-primary underline-offset-4 hover:underline">
              Metodología completa y conversión saldo→pensión →
            </a>
          </div>
          <Mono className="mt-10 block text-[12px]">
            Proyecciones educativas · no constituyen asesoría financiera ni médica
          </Mono>
        </Container>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Mono } from "@/components/typography";
import { calculadoras } from "@/lib/pensiones/calc/indice";

export const metadata: Metadata = {
  title: "Metodología de las calculadoras de pensiones",
  description:
    "Marco metodológico consolidado de las diez calculadoras de pensiones del observatorio Datos México: reglas de ley [R], datos verificados [V] y supuestos de escenario ilustrativo [S], con sus fuentes oficiales versionadas.",
  alternates: { canonical: "/pensiones/calculadoras/metodologia" },
  openGraph: {
    title: "Metodología de las calculadoras de pensiones — Datos México",
    description:
      "El marco [R]/[V]/[S] completo: reglas de ley, datos verificados y supuestos de escenario, con fuentes oficiales versionadas.",
    url: "/pensiones/calculadoras/metodologia",
    type: "website",
  },
};

export default function MetodologiaPage() {
  return (
    <section className="border-b border-border py-20 md:py-24">
      <Container>
        <SectionHeader
          eyebrow="Pensiones · Herramientas"
          title="Metodología de las calculadoras."
          lead="Las diez calculadoras comparten un motor común y un marco de transparencia: cada cifra lleva una etiqueta que declara su naturaleza. Los montos se expresan en pesos de hoy (términos reales) salvo indicación contraria. Estas herramientas informan; no constituyen asesoría financiera."
        />

        <div className="mt-14 max-w-3xl space-y-10 font-sans text-[16px] leading-[1.7] text-text">
          <div>
            <h2 className="font-serif text-[22px] font-semibold text-foreground">El marco de tres etiquetas</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-5">
                <span className="inline-block rounded bg-primary px-2 py-0.5 font-mono text-[11px] font-bold text-primary-foreground">R</span>
                <span className="ml-2 font-semibold text-foreground">Reglas de ley</span>
                <p className="mt-2 text-[15px] text-text-subtle">Parámetros que la ley fija y el cálculo aplica sin aproximar: requisitos de edad y semanas (LSS arts. 154, 162 y transitorio Cuarto del decreto DOF 16-dic-2020), aportaciones del art. 168, cuota patronal de cesantía y vejez por banda salarial, cuota social, tope de 25 UMA (art. 28), la fórmula de la Ley 73 (arts. 167, 171, 164, 168, 169, cotejada contra el facsímil DOF 27-dic-1990) y la matriz de pensión garantizada del art. 170 (decreto DOF 16-dic-2020, transcrita con doble verificación independiente). Cada valor cita su fuente oficial versionada.</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-5">
                <span className="inline-block rounded bg-success px-2 py-0.5 font-mono text-[11px] font-bold text-primary-foreground">V</span>
                <span className="ml-2 font-semibold text-foreground">Datos verificados</span>
                <p className="mt-2 text-[15px] text-text-subtle">Cifras oficiales vigentes con respaldo documental: UMA 2026 ($117.31 diaria, DOF 09-ene-2026), salario mínimo 2026 ($315.04 diario, DOF 09-dic-2025), comisiones AFORE (promedio 0.538%, CONSAR), las tablas de supervivencia EMSSAH-09/EMSSAM-09 (CNSF, DOF 14-ago-2009), el gasto de los hogares 65+ y por edad (ENIGH 2024, INEGI, con cálculo propio sobre microdatos validado contra los cuadros publicados), el factor de actualización INPC (1.0655) y las referencias de tasa de reemplazo OIT/OCDE. Son datos, no escenarios.</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-5">
                <span className="inline-block rounded bg-accent px-2 py-0.5 font-mono text-[11px] font-bold text-accent-foreground">S</span>
                <span className="ml-2 font-semibold text-foreground">Supuestos de escenario ilustrativo</span>
                <p className="mt-2 text-[15px] text-text-subtle">Parámetros que no son ley ni dato observado, sino hipótesis de proyección declaradas y discutibles. Se presentan siempre en rango, nunca como cifra única: rendimiento real neto (1.5% / 3.0% / 4.5%), crecimiento salarial real (+1.0%), constancia de cotización (presets 90/60/40), y la inflación médica diferencial. <strong>Son parámetros de escenario ilustrativo, no pronósticos</strong> — cada calculadora los marca junto a su control.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-[22px] font-semibold text-foreground">La conversión de saldo a pensión</h2>
            <p className="mt-4 text-text-subtle">El factor que traduce un saldo acumulado en pensión mensual es el punto donde un actuario mira primero. Se calcula como una renta vitalicia actualizable con inflación (pensión que conserva poder adquisitivo), sobre las tablas EMSSA-09 por sexo y con <strong>tasa técnica real de 2.5%</strong>. El divisor mensual publicado por edad de retiro (60–70) es común a todas las calculadoras que convierten saldo en renta.</p>
          </div>

          <div>
            <h2 className="font-serif text-[22px] font-semibold text-foreground">Cobertura por calculadora</h2>
            <p className="mt-4 text-text-subtle">Cada herramienta usa un subconjunto del marco según su pregunta. Las de proyección comparten el motor de la Ley 97 validado; las de presupuesto operan sobre datos ENIGH y aritmética en pesos de hoy.</p>
            <ul className="mt-5 space-y-2">
              {calculadoras.map((c) => (
                <li key={c.slug} className="flex flex-col gap-1 border-b border-border pb-2 sm:flex-row sm:items-baseline sm:gap-3">
                  <a href={`/pensiones/calculadoras/${c.slug}`} className="font-semibold text-primary underline-offset-4 hover:underline">{c.titulo}</a>
                  <span className="text-[14px] text-text-subtle">{c.descripcion}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-[22px] font-semibold text-foreground">Validación y perímetro</h2>
            <p className="mt-4 text-text-subtle">El documento base de supuestos actuariales tuvo validación actuarial externa (2026-07-02) y revisión legal externa sobre los textos. El perímetro de las calculadoras es el régimen IMSS (Ley 73, Ley 97 y transición); ISSSTE, retiro anticipado antes de los 60 y cuidados de largo plazo quedan declarados fuera del alcance de esta versión. Todo el cálculo ocurre en tu dispositivo: no se guarda ni se envía ningún dato.</p>
          </div>
        </div>

        <Mono className="mt-12 block text-[12px]">
          Proyecciones educativas · no constituyen asesoría financiera ni médica
        </Mono>
      </Container>
    </section>
  );
}

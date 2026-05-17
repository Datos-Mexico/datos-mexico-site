import { Container } from "@/components/layout/Container";
import { Display, Eyebrow, Lead, Mono } from "@/components/typography";
import { fetchApiData } from "@/lib/api/fetcher";
import type {
  DashboardStats,
  EnighDecilRow,
  EnighSummary,
  SarSerieTotales,
} from "@/lib/api/types";
import { BigCounter } from "./BigCounter";
import { PulseDot } from "./PulseDot";

function monthYear(iso: string) {
  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  const [y, m] = iso.split("-");
  return `${months[Number(m) - 1] ?? m} ${y}`;
}

export async function PulsoHero() {
  const [sarRes, hogaresRes, decilesRes, statsRes] = await Promise.allSettled([
    fetchApiData<SarSerieTotales>("/api/v1/consar/recursos/totales"),
    fetchApiData<EnighSummary>("/api/v1/enigh/hogares/summary"),
    fetchApiData<EnighDecilRow[]>("/api/v1/enigh/hogares/by-decil"),
    fetchApiData<DashboardStats>("/api/v1/dashboard/stats"),
  ]);

  const sar = sarRes.status === "fulfilled" ? sarRes.value : null;
  const hogares = hogaresRes.status === "fulfilled" ? hogaresRes.value : null;
  const deciles = decilesRes.status === "fulfilled" ? decilesRes.value : null;
  const stats = statsRes.status === "fulfilled" ? statsRes.value : null;

  const sarLast = sar?.serie[sar.serie.length - 1];
  const sarBillones = sarLast ? sarLast.monto_mxn_mm / 1_000_000 : 0;
  const sarFecha = sarLast ? monthYear(sarLast.fecha.slice(0, 7)) : "—";

  const hogaresMillones = hogares ? hogares.n_hogares_expandido / 1_000_000 : 0;

  const decilSorted = deciles
    ? [...deciles].sort((a, b) => a.decil - b.decil)
    : [];
  const d5 = decilSorted.find((d) => d.decil === 5);
  const d1 = decilSorted.find((d) => d.decil === 1);
  const d10 = decilSorted.find((d) => d.decil === 10);
  const ingresoMediano = d5 ? d5.mean_ing_cor_mensual : 0;
  const multiplicador =
    d1 && d10 && d1.mean_ing_cor_mensual > 0
      ? d10.mean_ing_cor_mensual / d1.mean_ing_cor_mensual
      : 0;

  const brechaPct = stats ? Math.abs(stats.genderGapPercent) : 0;

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #0A0A0A 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />

      <Container>
        <div className="relative py-20 md:py-28">
          <div className="flex items-center gap-3">
            <PulseDot />
            <Eyebrow>
              Pulso de México · {sarLast ? monthYear(sarLast.fecha.slice(0, 7)) : "Datos vivos"}
            </Eyebrow>
          </div>

          <Display className="mt-6 max-w-4xl">El país, hoy.</Display>

          <Lead className="mt-6 max-w-2xl">
            Cifras vivas del observatorio, validadas al peso contra fuentes
            oficiales. Una sola pantalla para entender la escala de México.
          </Lead>

          <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Mono className="block text-[12px] uppercase tracking-[0.14em]">
                Sistema de ahorro para el retiro
              </Mono>
              <p className="mt-4 font-serif text-[80px] font-semibold leading-[0.95] text-primary md:text-[112px]">
                $
                <BigCounter target={sarBillones} decimals={2} />
              </p>
              <p className="mt-3 font-serif text-2xl text-text">
                billones de pesos administrados
              </p>
              <Mono className="mt-4 block">
                CONSAR · corte {sarFecha} · MXN corrientes
              </Mono>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-5 lg:gap-10">
              <KpiCell
                label="Hogares mexicanos"
                value={
                  <>
                    <BigCounter
                      target={hogaresMillones}
                      decimals={1}
                      delayMs={150}
                    />
                    <span className="ml-1 font-sans text-2xl font-normal text-text-subtle">
                      M
                    </span>
                  </>
                }
                source="INEGI ENIGH 2024"
              />

              <KpiCell
                label="Ingreso del hogar mediano"
                value={
                  <>
                    $
                    <BigCounter target={ingresoMediano} delayMs={300} />
                  </>
                }
                source="ENIGH · decil 5 · MXN/mes"
              />

              <KpiCell
                label="Brecha del decil 10 vs decil 1"
                value={
                  <>
                    <BigCounter
                      target={multiplicador}
                      decimals={1}
                      delayMs={450}
                    />
                    <span className="ml-1 font-serif text-3xl text-text-subtle">
                      ×
                    </span>
                  </>
                }
                source="ENIGH · veces el ingreso del más pobre"
              />

              <KpiCell
                label="Brecha salarial de género"
                value={
                  <>
                    <BigCounter
                      target={brechaPct}
                      decimals={1}
                      delayMs={600}
                    />
                    <span className="ml-1 font-serif text-3xl text-text-subtle">
                      %
                    </span>
                  </>
                }
                source="CDMX · servidores públicos"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function KpiCell({
  label,
  value,
  source,
}: {
  label: string;
  value: React.ReactNode;
  source: string;
}) {
  return (
    <div className="border-l-2 border-primary/30 pl-5">
      <Mono className="block text-[11px] uppercase tracking-[0.14em]">
        {label}
      </Mono>
      <p className="mt-3 font-serif text-[40px] font-semibold leading-none text-foreground md:text-[44px]">
        {value}
      </p>
      <Mono className="mt-3 block text-[12px]">{source}</Mono>
    </div>
  );
}

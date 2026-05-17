import { Container } from "@/components/layout/Container";
import { H2, Eyebrow, Mono } from "@/components/typography";
import { fetchApiData } from "@/lib/api/fetcher";
import type { SarSerieTotales } from "@/lib/api/types";
import { AreaSeriesViz } from "./AreaSeriesViz";

const fmt2 = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const fmt0 = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });

export async function SarHistorico() {
  let data: SarSerieTotales | null = null;
  try {
    data = await fetchApiData<SarSerieTotales>("/api/v1/consar/recursos/totales");
  } catch {
    return null;
  }

  const byYear = new Map<string, { fecha: string; monto_mxn_mm: number }>();
  for (const p of data.serie) {
    const year = p.fecha.slice(0, 4);
    const prev = byYear.get(year);
    if (!prev || p.fecha > prev.fecha) {
      byYear.set(year, { fecha: p.fecha, monto_mxn_mm: p.monto_mxn_mm });
    }
  }

  const rows = Array.from(byYear.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([year, p]) => ({
      x: year,
      y: Number((p.monto_mxn_mm / 1_000_000).toFixed(3)),
    }));

  const first = rows[0];
  const last = rows[rows.length - 1];
  const multiplicador = first && first.y > 0 ? last.y / first.y : 0;

  return (
    <section className="border-b border-border bg-muted/40 py-20 md:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Eyebrow>Serie histórica</Eyebrow>
            <H2 className="mt-4">
              El ahorro nacional, año con año.
            </H2>
            <p className="mt-6 font-sans text-[17px] leading-[1.65] text-text-subtle">
              En {last.x} el SAR administra <strong className="font-semibold text-foreground">${fmt2.format(last.y)} billones de pesos</strong> — {fmt0.format(multiplicador)} veces lo que tenía en {first.x}.
            </p>
            <Mono className="mt-6 block">
              Fuente: CONSAR · último mes disponible de cada año · MXN corrientes
            </Mono>
          </div>

          <div className="lg:col-span-8">
            <AreaSeriesViz
              data={rows}
              yLabel="Billones MXN"
              prefix="$"
              suffix="B"
              decimals={2}
              height={380}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

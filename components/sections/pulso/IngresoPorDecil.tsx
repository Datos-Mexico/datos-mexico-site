import { Container } from "@/components/layout/Container";
import { H2, Eyebrow, Mono } from "@/components/typography";
import { fetchApiData } from "@/lib/api/fetcher";
import type { EnighDecilRow } from "@/lib/api/types";

const fmt = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });

export async function IngresoPorDecil() {
  let data: EnighDecilRow[] | null = null;
  try {
    data = await fetchApiData<EnighDecilRow[]>("/api/v1/enigh/hogares/by-decil");
  } catch {
    return null;
  }

  const rows = [...data]
    .sort((a, b) => a.decil - b.decil)
    .map((d) => ({
      decil: d.decil,
      ingreso: Math.round(d.mean_ing_cor_mensual),
    }));

  const max = Math.max(...rows.map((r) => r.ingreso), 1);

  return (
    <section className="border-b border-border bg-background py-20 md:py-24">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>Desigualdad del ingreso</Eyebrow>
          <H2 className="mt-4">
            Diez hogares, diez Méxicos.
          </H2>
          <p className="mt-6 font-sans text-[17px] leading-[1.65] text-text-subtle">
            Ordenando los 38.8 millones de hogares de menor a mayor ingreso, el promedio
            mensual cambia drásticamente entre decil y decil.
          </p>
        </div>

        <ul
          className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-x-12"
          aria-label="Ingreso medio mensual por decil"
        >
          {rows.map((r) => {
            const pct = (r.ingreso / max) * 100;
            const isTop = r.decil === 10;
            const isBottom = r.decil === 1;
            return (
              <li
                key={r.decil}
                className="flex items-center gap-4 border-b border-border py-3"
              >
                <span className="w-12 shrink-0 font-mono text-[13px] uppercase tracking-[0.1em] text-text-subtle">
                  D{r.decil}
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={
                      "absolute inset-y-0 left-0 rounded-full " +
                      (isTop
                        ? "bg-accent"
                        : isBottom
                          ? "bg-danger/70"
                          : "bg-primary/80")
                    }
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span
                  className={
                    "w-28 shrink-0 text-right font-serif text-lg font-semibold tabular-nums " +
                    (isTop
                      ? "text-accent"
                      : isBottom
                        ? "text-danger"
                        : "text-foreground")
                  }
                >
                  ${fmt.format(r.ingreso)}
                </span>
              </li>
            );
          })}
        </ul>

        <Mono className="mt-8 block">
          Fuente: INEGI ENIGH 2024 · Ingreso corriente promedio mensual del hogar · MXN
        </Mono>
      </Container>
    </section>
  );
}

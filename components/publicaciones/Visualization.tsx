import { fetchApiData } from "@/lib/api/fetcher";
import type {
  DashboardStats,
  EnighDecilRow,
  EnighGastoRubro,
  EnighSummary,
  SarImssVsIssste,
  SarPorAfore,
  SarPorComponente,
  SarSerieTotales,
} from "@/lib/api/types";
import { BarChartViz } from "./charts/BarChartViz";
import { DonutChartViz } from "./charts/DonutChartViz";
import { KpiGrid } from "./charts/KpiGrid";
import { LineChartViz } from "./charts/LineChartViz";

type VisualizationProps = {
  id: string;
};

// Las cuatro vistas CDMX (`cdmx-*`) golpean el mismo endpoint
// `/api/v1/dashboard/stats`. Next.js dedupea automáticamente fetches
// idénticos en el mismo render, así que no hace falta cachear manualmente.

export async function Visualization({ id }: VisualizationProps) {
  switch (id) {
    case "cdmx-overview":
      return <CdmxOverview />;
    case "cdmx-distribucion-edad":
      return <CdmxDistribucionEdad />;
    case "cdmx-tipos-contratacion":
      return <CdmxTiposContratacion />;
    case "cdmx-top-sectores":
      return <CdmxTopSectores />;
    case "sar-kpi":
      return <SarKpi />;
    case "sar-totales-historico":
      return <SarTotalesHistorico />;
    case "sar-por-afore":
      return <SarPorAforeViz />;
    case "sar-por-componente":
      return <SarPorComponenteViz />;
    case "sar-imss-vs-issste":
      return <SarImssVsIsssteViz />;
    case "enigh-summary":
      return <EnighSummaryViz />;
    case "enigh-por-decil":
      return <EnighPorDecilViz />;
    case "enigh-gastos-rubro":
      return <EnighGastosRubroViz />;

    default:
      return (
        <div className="my-8 rounded-md border-2 border-dashed border-border bg-muted p-12 text-center">
          <p className="font-mono text-sm text-text-subtle">
            Visualización no implementada — id: <code>{id}</code>
          </p>
        </div>
      );
  }
}

const fmt = new Intl.NumberFormat("es-MX");
const fmt1 = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 });
const fmt2 = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

async function CdmxOverview() {
  const data = await fetchApiData<DashboardStats>("/api/v1/dashboard/stats");

  const kpis = [
    {
      label: "Servidores públicos",
      value: fmt.format(data.totalServidores),
      emphasis: true,
    },
    { label: "Sectores", value: fmt.format(data.totalSectors) },
    {
      label: "Sueldo bruto medio",
      value: `$${fmt.format(Math.round(data.avgSalary))}`,
      unit: "MXN",
    },
    {
      label: "Sueldo bruto mediano",
      value: `$${fmt.format(Math.round(data.medianSalary))}`,
      unit: "MXN",
    },
  ];

  return (
    <>
      <KpiGrid
        items={kpis}
        caption="Fuente: Datos Abiertos CDMX, mayo 2026 · 246,831 servidores"
      />
      <BarChartViz
        data={data.salaryDistribution}
        xKey="label"
        yKey="count"
        yLabel="Servidores"
        caption="Distribución de servidores por rango salarial"
        highlight
      />
    </>
  );
}

async function CdmxDistribucionEdad() {
  const data = await fetchApiData<DashboardStats>("/api/v1/dashboard/stats");
  return (
    <BarChartViz
      data={data.ageDistribution}
      xKey="label"
      yKey="count"
      yLabel="Servidores"
      caption="Distribución por edad · Fuente: Datos Abiertos CDMX, mayo 2026"
    />
  );
}

async function CdmxTiposContratacion() {
  const data = await fetchApiData<DashboardStats>("/api/v1/dashboard/stats");
  const top = [...data.contractTypes]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  return (
    <BarChartViz
      data={top}
      xKey="label"
      yKey="count"
      yLabel="Servidores"
      caption="Tipos de contratación (top 8) · Fuente: Datos Abiertos CDMX, mayo 2026"
    />
  );
}

async function CdmxTopSectores() {
  const data = await fetchApiData<DashboardStats>("/api/v1/dashboard/stats");
  const rows = data.top15Sectors.map((s) => ({
    label: s.name.length > 28 ? `${s.name.slice(0, 26)}…` : s.name,
    count: s.count,
  }));
  return (
    <BarChartViz
      data={rows}
      xKey="label"
      yKey="count"
      yLabel="Servidores"
      caption="Top 15 sectores por número de servidores · Fuente: Datos Abiertos CDMX, mayo 2026"
      height={420}
    />
  );
}

async function SarKpi() {
  const data = await fetchApiData<SarSerieTotales>(
    "/api/v1/consar/recursos/totales",
  );
  const last = data.serie[data.serie.length - 1];
  const totalBillones = last.monto_mxn_mm / 1_000_000;
  const fechaCorta = last.fecha.slice(0, 7);

  const kpis = [
    {
      label: "Total SAR",
      value: `$${fmt2.format(totalBillones)}`,
      unit: "billones MXN",
      emphasis: true,
    },
    { label: "AFOREs reportando", value: fmt.format(last.n_afores) },
    { label: "Corte", value: fechaCorta },
    { label: "Meses de serie", value: fmt.format(data.n_puntos) },
  ];

  return (
    <KpiGrid
      items={kpis}
      caption={`Fuente: CONSAR · Cifras al ${last.fecha.slice(0, 10)} · MXN corrientes`}
    />
  );
}

async function SarTotalesHistorico() {
  const data = await fetchApiData<SarSerieTotales>(
    "/api/v1/consar/recursos/totales",
  );

  // Downsample anual: para cada año tomar el último mes disponible.
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
      year,
      billones: Number((p.monto_mxn_mm / 1_000_000).toFixed(3)),
    }));

  return (
    <LineChartViz
      data={rows}
      xKey="year"
      yKeys={[{ key: "billones", label: "Billones MXN" }]}
      caption="Recursos totales SAR (anual, último mes disponible) · Fuente: CONSAR · MXN corrientes"
    />
  );
}

async function SarPorAforeViz() {
  const data = await fetchApiData<SarPorAfore>(
    "/api/v1/consar/recursos/por-afore?fecha=2025-06-01",
  );
  const rows = [...data.afores]
    .sort((a, b) => b.pct_sistema - a.pct_sistema)
    .map((a) => ({
      afore: a.afore_nombre_corto,
      pct: a.pct_sistema,
    }));
  const totalCorto = fmt2.format(data.total_sistema_mm);

  return (
    <BarChartViz
      data={rows}
      xKey="afore"
      yKey="pct"
      yLabel="% del sistema"
      caption={`Distribución por AFORE al 1 de junio de 2025 · Total sistema: ${totalCorto} mdp (millones de pesos corrientes) · Fuente: CONSAR`}
      highlight
      height={360}
    />
  );
}

async function SarPorComponenteViz() {
  const data = await fetchApiData<SarPorComponente>(
    "/api/v1/consar/recursos/por-componente?fecha=2025-06-01",
  );
  const rows = data.componentes
    .filter((c) => c.categoria === "component" && c.pct_del_sar_total != null)
    .map((c) => ({
      name: c.tipo_nombre_corto,
      value: Number(c.pct_del_sar_total),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <DonutChartViz
      data={rows}
      caption="Composición por tipo de recurso · Snapshot al 1 de junio de 2025 · Fuente: CONSAR"
    />
  );
}

async function SarImssVsIsssteViz() {
  const data = await fetchApiData<SarImssVsIssste>(
    "/api/v1/consar/recursos/imss-vs-issste",
  );

  // Downsample anual y convertir a billones.
  const byYear = new Map<
    string,
    { fecha: string; rcv_imss_mm: number | null; rcv_issste_mm: number | null }
  >();
  for (const p of data.serie) {
    const year = p.fecha.slice(0, 4);
    const prev = byYear.get(year);
    if (!prev || p.fecha > prev.fecha) {
      byYear.set(year, p);
    }
  }
  const rows = Array.from(byYear.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([year, p]) => ({
      year,
      imss: p.rcv_imss_mm == null ? 0 : Number((p.rcv_imss_mm / 1_000_000).toFixed(3)),
      issste:
        p.rcv_issste_mm == null
          ? 0
          : Number((p.rcv_issste_mm / 1_000_000).toFixed(3)),
    }));

  return (
    <LineChartViz
      data={rows}
      xKey="year"
      yKeys={[
        { key: "imss", label: "RCV-IMSS (privado)" },
        { key: "issste", label: "RCV-ISSSTE (público)" },
      ]}
      caption="Privado vs público a lo largo del tiempo · Billones MXN corrientes · Fuente: CONSAR"
    />
  );
}

async function EnighSummaryViz() {
  const data = await fetchApiData<EnighSummary>(
    "/api/v1/enigh/hogares/summary",
  );

  const kpis = [
    {
      label: "Hogares (expandidos)",
      value: fmt.format(data.n_hogares_expandido),
      emphasis: true,
    },
    { label: "Muestra", value: fmt.format(data.n_hogares_muestra) },
    {
      label: "Ingreso medio mensual",
      value: `$${fmt.format(Math.round(data.mean_ing_cor_mensual))}`,
      unit: "MXN",
    },
    {
      label: "Gasto medio mensual",
      value: `$${fmt.format(Math.round(data.mean_gasto_mon_mensual))}`,
      unit: "MXN",
    },
  ];

  return (
    <KpiGrid
      items={kpis}
      caption={`Fuente: ${data.source}`}
    />
  );
}

async function EnighPorDecilViz() {
  const data = await fetchApiData<EnighDecilRow[]>(
    "/api/v1/enigh/hogares/by-decil",
  );
  const rows = data.map((d) => ({
    decil: `D${d.decil}`,
    ingreso: Math.round(d.mean_ing_cor_mensual),
  }));

  return (
    <BarChartViz
      data={rows}
      xKey="decil"
      yKey="ingreso"
      yLabel="MXN/mes"
      caption="Ingreso corriente medio mensual por decil de hogares · Fuente: INEGI ENIGH 2024 NS"
      highlight
    />
  );
}

async function EnighGastosRubroViz() {
  const data = await fetchApiData<EnighGastoRubro>(
    "/api/v1/enigh/gastos/by-rubro",
  );
  const rows = data.rubros
    .map((r) => ({ name: r.nombre, value: r.pct_del_monetario }))
    .sort((a, b) => b.value - a.value);

  return (
    <DonutChartViz
      data={rows}
      caption="Composición del gasto monetario nacional · Fuente: INEGI ENIGH 2024 NS"
    />
  );
}

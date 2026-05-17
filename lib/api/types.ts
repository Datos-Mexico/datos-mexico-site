export type DistributionItem = {
  label: string;
  count: number;
};

export type SalaryByAgeItem = {
  label: string;
  avg: number;
};

export type SectorTopItem = {
  name: string;
  count: number;
  avgSalary: number;
  avgMale?: number;
  avgFemale?: number;
};

export type SarSeriePunto = {
  fecha: string;
  monto_mxn_mm: number;
  n_afores: number;
};

export type SarSerieTotales = {
  unit: string;
  n_puntos: number;
  fecha_min: string;
  fecha_max: string;
  serie: SarSeriePunto[];
};

export type SarAforeRow = {
  afore_codigo: string;
  afore_nombre_corto: string;
  sar_total_mm: number;
  recursos_trabajadores_mm: number | null;
  recursos_administrados_mm?: number | null;
  pct_sistema: number;
};

export type SarPorAfore = {
  fecha: string;
  unit: string;
  total_sistema_mm: number;
  n_afores_reportando: number;
  afores: SarAforeRow[];
  caveats?: string[];
};

export type SarComponenteRow = {
  tipo_codigo: string;
  tipo_nombre_corto: string;
  categoria: string;
  monto_mxn_mm: number;
  pct_del_sar_total: number | null;
};

export type SarPorComponente = {
  fecha: string;
  unit: string;
  sar_total_mm: number;
  n_componentes: number;
  componentes: SarComponenteRow[];
  caveats?: string[];
};

export type SarImssVsIsssteRow = {
  fecha: string;
  rcv_imss_mm: number | null;
  rcv_issste_mm: number | null;
  ratio_issste_sobre_imss: number | null;
};

export type SarImssVsIssste = {
  unit: string;
  n_puntos: number;
  serie: SarImssVsIsssteRow[];
};

export type EnighSummary = {
  n_hogares_muestra: number;
  n_hogares_expandido: number;
  mean_ing_cor_trim: number;
  mean_ing_cor_mensual: number;
  mean_gasto_mon_trim: number;
  mean_gasto_mon_mensual: number;
  edition: string;
  source: string;
};

export type EnighDecilRow = {
  decil: number;
  n_hogares_muestra: number;
  n_hogares_expandido: number;
  mean_ing_cor_trim: number;
  mean_ing_cor_mensual: number;
  mean_gasto_mon_trim: number;
  share_factor_pct: number;
};

export type EnighRubroRow = {
  slug: string;
  nombre: string;
  mean_gasto_trim: number;
  mean_gasto_mensual: number;
  pct_del_monetario: number;
  oficial_mensual?: number;
  bound_delta_pct?: number;
};

export type EnighGastoRubro = {
  decil: number | null;
  mean_gasto_mon_trim: number;
  rubros: EnighRubroRow[];
};

export type DashboardStats = {
  totalServidores: number;
  totalSectors: number;
  avgSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  genderGapPercent: number;
  hombres: number;
  mujeres: number;
  avgSalaryMale: number;
  avgSalaryFemale: number;
  salaryDistribution: DistributionItem[];
  ageDistribution: DistributionItem[];
  contractTypes: DistributionItem[];
  personalTypes: DistributionItem[];
  salaryByAge: SalaryByAgeItem[];
  top15Sectors: SectorTopItem[];
  allSectors?: SectorTopItem[];
};

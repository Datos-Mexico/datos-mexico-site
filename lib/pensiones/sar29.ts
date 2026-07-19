export type Sar29Entrega = {
  year: number;
  href: string;
};

const YEARS: readonly number[] = Array.from({ length: 29 }, (_, i) => 1997 + i);

export const sar29Entregas: readonly Sar29Entrega[] = YEARS.map((year) => ({
  year,
  href: `/pensiones/sar-29/DM-SAR-${year}.html`,
}));

export const sar29Dataset = {
  id: "DM-SAR-DATA-001",
  csv: "/pensiones/sar-29/datos/DM-SAR-DATA-001/DM-SAR-DATA-001.csv",
  diccionario: "/pensiones/sar-29/datos/DM-SAR-DATA-001/DICCIONARIO.txt",
  apendice: "/pensiones/sar-29/datos/DM-SAR-DATA-001/apendice.html",
} as const;

import type { Metadata } from "next";
import { BrechaCalculator } from "@/components/pensiones/calc/BrechaCalculator";

export const metadata: Metadata = {
  title: "Calculadora de brecha de retiro",
  description:
    "Calculadora educativa del observatorio Datos México: la distancia entre el gasto mensual que deseas en el retiro y el ingreso que tu pensión IMSS sostendría, en pesos de hoy. No es asesoría financiera.",
  alternates: { canonical: "/pensiones/calculadoras/brecha" },
  openGraph: {
    title: "Calculadora de brecha de retiro — Datos México",
    description:
      "Compara el gasto que deseas contra el ingreso que tu trayectoria IMSS sostendría, con el capital equivalente de la brecha bajo tres escenarios.",
    url: "/pensiones/calculadoras/brecha",
    type: "website",
  },
};

export default function BrechaPage() {
  return (
    <section className="border-b border-border py-10 md:py-14">
      <BrechaCalculator />
    </section>
  );
}

import type { Metadata } from "next";
import { GastoVidaCalculator } from "@/components/pensiones/calc/GastoVidaCalculator";

export const metadata: Metadata = {
  title: "Calculadora de gasto de vida en retiro",
  description:
    "Calculadora educativa del observatorio Datos México: arma tu presupuesto mensual de retiro rubro por rubro partiendo del gasto real de los hogares 65+ (ENIGH 2024, INEGI). No es asesoría financiera.",
  alternates: { canonical: "/pensiones/calculadoras/gasto-vida" },
  openGraph: {
    title: "Calculadora de gasto de vida en retiro — Datos México",
    description:
      "¿Cuánto cuesta al mes la vida que quieres en tu retiro? Arma tu canasta desde la referencia ENIGH 2024 y ve tu retiro completo en pesos de hoy.",
    url: "/pensiones/calculadoras/gasto-vida",
    type: "website",
  },
};

export default function GastoVidaPage() {
  return (
    <section className="border-b border-border py-10 md:py-14">
      <GastoVidaCalculator />
    </section>
  );
}

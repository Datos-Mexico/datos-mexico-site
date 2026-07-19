import type { Metadata } from "next";
import { ComparadorCalculator } from "@/components/pensiones/calc/ComparadorCalculator";

export const metadata: Metadata = {
  title: "Comparador de escenarios de retiro",
  description:
    "Compara tres edades de retiro lado a lado con el motor validado de la calculadora de pensión IMSS del observatorio Datos México: mensualidad, requisitos y acumulado esperado. No es asesoría financiera.",
  alternates: { canonical: "/pensiones/calculadoras/comparador" },
  openGraph: {
    title: "Comparador de escenarios de retiro — Datos México",
    description:
      "Retirarte antes, a tiempo o después: compara tres rutas con la mensualidad, los requisitos y el acumulado esperado de cada una.",
    url: "/pensiones/calculadoras/comparador",
    type: "website",
  },
};

export default function ComparadorPage() {
  return (
    <section className="border-b border-border py-10 md:py-14">
      <ComparadorCalculator />
    </section>
  );
}

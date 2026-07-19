import type { Metadata } from "next";
import { InteresCompuestoCalculator } from "@/components/pensiones/calc/InteresCompuestoCalculator";

export const metadata: Metadata = {
  title: "Calculadora de interés compuesto",
  description:
    "Calculadora educativa del observatorio Datos México: cuánto cuesta esperar para empezar a ahorrar, comparando la versión que empieza hoy contra la que espera, en pesos de hoy. No es asesoría financiera.",
  alternates: { canonical: "/pensiones/calculadoras/interes-compuesto" },
  openGraph: {
    title: "Calculadora de interés compuesto — Datos México",
    description:
      "El interés compuesto trabaja para quien le da tiempo: compara empezar hoy vs esperar, con el año más caro y el desglose bolsillo/rendimiento.",
    url: "/pensiones/calculadoras/interes-compuesto",
    type: "website",
  },
};

export default function InteresCompuestoPage() {
  return (
    <section className="border-b border-border py-10 md:py-14">
      <InteresCompuestoCalculator />
    </section>
  );
}

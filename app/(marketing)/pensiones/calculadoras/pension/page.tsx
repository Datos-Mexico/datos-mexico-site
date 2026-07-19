import type { Metadata } from "next";
import { PensionCalculator } from "@/components/pensiones/calc/PensionCalculator";

export const metadata: Metadata = {
  title: "Calculadora de pensión estimada",
  description:
    "Calculadora educativa de pensión IMSS (Ley 73, Ley 97 y transición) del observatorio Datos México: tres escenarios en pesos de hoy, supuestos públicos y validación actuarial. No es asesoría financiera.",
  alternates: { canonical: "/pensiones/calculadoras/pension" },
  openGraph: {
    title: "Calculadora de pensión estimada — Datos México",
    description:
      "Proyección educativa de tu pensión IMSS bajo tres escenarios, en pesos de hoy, con supuestos públicos y metodología validada actuarialmente.",
    url: "/pensiones/calculadoras/pension",
    type: "website",
  },
};

export default function PensionPage() {
  return (
    <section className="border-b border-border py-10 md:py-14">
      <PensionCalculator />
    </section>
  );
}

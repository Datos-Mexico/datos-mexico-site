import type { Metadata } from "next";
import { AhorroCalculator } from "@/components/pensiones/calc/AhorroCalculator";

export const metadata: Metadata = {
  title: "Calculadora de ahorro para el retiro",
  description:
    "Calculadora educativa del observatorio Datos México: la aportación adicional que alcanzaría tu meta de ingreso en el retiro, en pesos de hoy, con supuestos públicos. No es asesoría financiera.",
  alternates: { canonical: "/pensiones/calculadoras/ahorro" },
  openGraph: {
    title: "Calculadora de ahorro para el retiro — Datos México",
    description:
      "Elige tu meta de ingreso en el retiro y descubre la aportación adicional que la alcanzaría sobre tu trayectoria obligatoria.",
    url: "/pensiones/calculadoras/ahorro",
    type: "website",
  },
};

export default function AhorroPage() {
  return (
    <section className="border-b border-border py-10 md:py-14">
      <AhorroCalculator />
    </section>
  );
}

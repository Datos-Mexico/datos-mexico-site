import type { Metadata } from "next";
import { ReemplazoCalculator } from "@/components/pensiones/calc/ReemplazoCalculator";

export const metadata: Metadata = {
  title: "Calculadora de reemplazo de ingreso",
  description:
    "Calculadora educativa del observatorio Datos México: qué parte de tu ingreso actual necesitaría tu retiro, armado desde tu propio presupuesto, con referencias documentadas OIT/OCDE. No es asesoría financiera.",
  alternates: { canonical: "/pensiones/calculadoras/reemplazo" },
  openGraph: {
    title: "Calculadora de reemplazo de ingreso — Datos México",
    description:
      "Arma tu tasa de reemplazo al revés: parte de tu ingreso, quita lo que desaparece y suma lo que aumenta. Referencias OIT/OCDE como contexto.",
    url: "/pensiones/calculadoras/reemplazo",
    type: "website",
  },
};

export default function ReemplazoPage() {
  return (
    <section className="border-b border-border py-10 md:py-14">
      <ReemplazoCalculator />
    </section>
  );
}

import type { Metadata } from "next";
import { GastosMedicosCalculator } from "@/components/pensiones/calc/GastosMedicosCalculator";

export const metadata: Metadata = {
  title: "Calculadora de gastos médicos en retiro",
  description:
    "Calculadora educativa del observatorio Datos México: el orden de magnitud del gasto de bolsillo en salud durante el retiro, basado en ENIGH 2024 e inflación médica del INPC, en rangos. No es asesoría financiera ni médica.",
  alternates: { canonical: "/pensiones/calculadoras/gastos-medicos" },
  openGraph: {
    title: "Calculadora de gastos médicos en retiro — Datos México",
    description:
      "El gasto de bolsillo en salud sube con la edad: proyección documentada por edad, en rangos y en pesos de hoy, con la incertidumbre honesta entre escenarios.",
    url: "/pensiones/calculadoras/gastos-medicos",
    type: "website",
  },
};

export default function GastosMedicosPage() {
  return (
    <section className="border-b border-border py-10 md:py-14">
      <GastosMedicosCalculator />
    </section>
  );
}

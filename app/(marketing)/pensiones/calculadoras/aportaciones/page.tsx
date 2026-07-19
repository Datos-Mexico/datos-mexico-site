import type { Metadata } from "next";
import { AportacionesCalculator } from "@/components/pensiones/calc/AportacionesCalculator";

export const metadata: Metadata = {
  title: "Calculadora de aportaciones voluntarias",
  description:
    "Calculadora educativa del observatorio Datos México: cuánto sumaría a tu saldo y a tu pensión mensual una aportación voluntaria adicional, en pesos de hoy. No es asesoría financiera.",
  alternates: { canonical: "/pensiones/calculadoras/aportaciones" },
  openGraph: {
    title: "Calculadora de aportaciones voluntarias — Datos México",
    description:
      "Explora la consecuencia de aportar un poco más: saldo y pensión adicionales, con la parte que pone tu bolsillo y la que pone el rendimiento.",
    url: "/pensiones/calculadoras/aportaciones",
    type: "website",
  },
};

export default function AportacionesPage() {
  return (
    <section className="border-b border-border py-10 md:py-14">
      <AportacionesCalculator />
    </section>
  );
}

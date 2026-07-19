import type { Metadata } from "next";
import { ElegibilidadCalculator } from "@/components/pensiones/calc/ElegibilidadCalculator";

export const metadata: Metadata = {
  title: "Calculadora de elegibilidad de retiro",
  description:
    "Calculadora educativa de elegibilidad de retiro IMSS del observatorio Datos México: ¿cumples los requisitos de edad y semanas para pensionarte, y si no, cuándo los cumplirías? No es asesoría financiera.",
  alternates: { canonical: "/pensiones/calculadoras/elegibilidad" },
  openGraph: {
    title: "Calculadora de elegibilidad de retiro — Datos México",
    description:
      "¿Cumples los requisitos de edad y semanas para pensionarte, y si no, cuándo los alcanzarías? El requisito sube +25 semanas por año hasta 2031.",
    url: "/pensiones/calculadoras/elegibilidad",
    type: "website",
  },
};

export default function ElegibilidadPage() {
  return (
    <section className="border-b border-border py-10 md:py-14">
      <ElegibilidadCalculator />
    </section>
  );
}

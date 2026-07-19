import type { Metadata } from "next";
import { JourneyTuRetiro } from "@/components/pensiones/journey/JourneyTuRetiro";

export const metadata: Metadata = {
  title: "Tu retiro — recorrido personal",
  description:
    "Recorrido breve del observatorio Datos México para entender tu situación personal de retiro: un test de cuatro preguntas, una estimación orientativa y tu lectura con contexto del SAR. La calculadora es un ejemplo, no un cálculo financiero real.",
  alternates: { canonical: "/pensiones/tu-retiro" },
  openGraph: {
    title: "Tu retiro — recorrido personal | Datos México",
    description:
      "Un recorrido breve para entender tu situación de retiro, con datos oficiales del SAR. La estimación es ilustrativa; las calculadoras validadas ya están publicadas.",
    url: "/pensiones/tu-retiro",
    type: "website",
  },
};

export default function TuRetiroPage() {
  return <JourneyTuRetiro />;
}

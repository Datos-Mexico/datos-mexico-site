import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FAQ, type FAQItem } from "@/components/ui/FAQ";

const faqs: FAQItem[] = [
  {
    question: "¿Pueden darme una entrevista para mi nota de hoy?",
    answer: (
      <>
        Sí. Para coyuntura del día, escríbenos a{" "}
        <a
          href="mailto:prensa@datosmexico.org"
          className="text-primary underline-offset-4 hover:underline"
        >
          prensa@datosmexico.org
        </a>{" "}
        con “Coyuntura” en el asunto y mencionando tu plazo. Respondemos lo más
        rápido que podamos. Si el tema requiere un vocero específico, lo
        contactamos internamente.
      </>
    ),
  },
  {
    question: "¿Tienen datos sobre [tema X]?",
    answer:
      "Hoy publicamos análisis sobre tres datasets: la Encuesta Nacional de Ingresos y Gastos de los Hogares (ENIGH 2024 NS) del INEGI, los recursos del SAR (CONSAR 1998–2025) y las remuneraciones de servidores públicos de la Ciudad de México. Si tu tema cae fuera de estos, podemos orientarte sobre dónde buscarlo en fuentes oficiales aunque no tengamos análisis propio.",
  },
  {
    question: "¿Cuánto tardan en responder?",
    answer: (
      <>
        Para correos a{" "}
        <a
          href="mailto:prensa@datosmexico.org"
          className="text-primary underline-offset-4 hover:underline"
        >
          prensa@datosmexico.org
        </a>
        , menos de 24 horas hábiles. Para coyuntura el mismo día. Para
        colaboraciones más extensas (reportajes profundos, investigaciones
        especiales), entre 1 y 3 días.
      </>
    ),
  },
  {
    question: "¿Cobran por entrevistas o consultas?",
    answer:
      "No. Somos un proyecto académico independiente sin fines de lucro. Toda atención a medios es gratuita.",
  },
  {
    question: "¿Puedo reproducir una de sus gráficas en mi nota?",
    answer:
      "Sí, con atribución a “Datos México (datosmexico.org)”. Si necesitas la gráfica en alta resolución o en formato específico para imprenta, escríbenos y la generamos.",
  },
  {
    question: "¿Tienen postura sobre [debate político actual]?",
    answer: (
      <>
        No tenemos postura política. Publicamos cifras y análisis con la
        metodología documentada en nuestra{" "}
        <Link
          href="/metodologia"
          className="text-primary underline-offset-4 hover:underline"
        >
          página de Metodología
        </Link>
        . Lo que las cifras significan para política pública es competencia de
        quien las interpreta — periodistas, legisladores, ciudadanía.
      </>
    ),
  },
  {
    question: "¿Pueden recomendarme expertos externos al observatorio?",
    answer:
      "En la medida de lo posible, sí. Trabajamos con una red informal de investigadores y profesores. Si pides recomendación, indícanos el tema específico y la naturaleza de la nota.",
  },
];

export function Preguntas() {
  return (
    <section id="preguntas" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="Preguntas frecuentes"
        title="Lo que los periodistas suelen preguntar."
      />

      <div className="mt-10">
        <FAQ items={faqs} />
      </div>
    </section>
  );
}

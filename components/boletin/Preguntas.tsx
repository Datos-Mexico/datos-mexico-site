import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FAQ, type FAQItem } from "@/components/ui/FAQ";

const faqs: FAQItem[] = [
  {
    question: "¿Tengo que pagar?",
    answer:
      "No. El boletín y todo el contenido del observatorio son gratuitos. No tenemos paywall, no tenemos modelo freemium, no planeamos cobrar por nuestro trabajo. Es un proyecto académico independiente.",
  },
  {
    question: "¿Cómo manejan mi correo?",
    answer:
      "Lo guardamos exclusivamente para enviarte el boletín. No lo cedemos, no lo vendemos, no lo usamos para nada más. Cuando elijamos un proveedor de boletín — actualmente estamos evaluando opciones — la información estará en una plataforma con estándares de protección de datos. Hasta entonces, los correos quedan en una lista privada.",
  },
  {
    question: "¿Puedo darme de baja?",
    answer:
      "Sí, en cualquier momento, con un solo click desde el pie de cualquier boletín. No vamos a intentar retenerte con encuestas ni con varios pasos de confirmación.",
  },
  {
    question: "¿Cada cuánto envían correos?",
    answer:
      "Aproximadamente entre 3 y 5 envíos por semana, distribuidos entre análisis profundos, notas breves y comentarios de coyuntura. Si te parece mucho, podrás configurar un resumen semanal una vez activemos el proveedor.",
  },
  {
    question: "¿Quién escribe los boletines?",
    answer: (
      <>
        El equipo del observatorio. Cada publicación lleva el nombre de quien la
        escribió. Si quieres conocer al equipo, mira la página{" "}
        <Link
          href="/quienes-somos"
          className="text-primary underline-offset-4 hover:underline"
        >
          Quiénes Somos
        </Link>
        .
      </>
    ),
  },
  {
    question: "¿Reciben colaboraciones externas?",
    answer: (
      <>
        Eventualmente sí, especialmente de investigadores y periodistas de
        datos. Por ahora todo el contenido se produce en casa. Si te interesa
        colaborar, escríbenos a{" "}
        <a
          href="mailto:academia@datosmexico.org"
          className="text-primary underline-offset-4 hover:underline"
        >
          academia@datosmexico.org
        </a>
        .
      </>
    ),
  },
  {
    question: "¿Cómo notifican rectificaciones?",
    answer: (
      <>
        Cuando detectamos un error en una publicación previa, lo corregimos
        visiblemente en el sitio y enviamos una nota al boletín explicando qué
        cambió y por qué. Las rectificaciones quedan registradas en nuestra{" "}
        <Link
          href="/metodologia#cambios"
          className="text-primary underline-offset-4 hover:underline"
        >
          página de Metodología
        </Link>
        .
      </>
    ),
  },
];

export function Preguntas() {
  return (
    <section id="preguntas" className="border-b border-border py-16 md:py-20">
      <SectionHeader
        eyebrow="Preguntas frecuentes"
        title="Lo que la gente suele preguntar antes de suscribirse."
      />

      <div className="mt-10">
        <FAQ items={faqs} />
      </div>
    </section>
  );
}

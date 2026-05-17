import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FAQ, type FAQItem } from "@/components/ui/FAQ";

const faqs: FAQItem[] = [
  {
    question: "¿Tienen postura sobre [tema político / coyuntura]?",
    answer: (
      <>
        No. Datos México publica cifras y análisis con la metodología
        documentada. Lo que las cifras significan para política pública es
        competencia de quien las interpreta. Si necesitas comentario sobre un
        tema específico,{" "}
        <Link
          href="#canales"
          className="text-primary underline-offset-4 hover:underline"
        >
          escríbenos como prensa
        </Link>{" "}
        y vemos si podemos ayudar dentro de nuestro alcance.
      </>
    ),
  },
  {
    question: "¿Aceptan donaciones o financiamiento?",
    answer: (
      <>
        Hoy operamos con recursos del equipo fundador y no tenemos figura legal
        para recibir donaciones formales. Si tu organización está interesada en
        apoyar el trabajo del observatorio,{" "}
        <Link
          href="#canales"
          className="text-primary underline-offset-4 hover:underline"
        >
          escríbenos a contacto
        </Link>{" "}
        y conversamos sobre los caminos viables.
      </>
    ),
  },
  {
    question: "¿Puedo proponer un análisis o tema?",
    answer: (
      <>
        Sí. Si crees que un dataset público merece análisis del observatorio,{" "}
        <Link
          href="#canales"
          className="text-primary underline-offset-4 hover:underline"
        >
          escríbenos a contacto
        </Link>{" "}
        explicando el dataset, la pregunta que tienes en mente y por qué crees
        que importa. Evaluamos según fit con nuestro método y prioridades.
      </>
    ),
  },
  {
    question:
      "Hice una tesis/proyecto basado en sus datos. ¿Lo enlazan?",
    answer: (
      <>
        Posiblemente. Si tu trabajo cita correctamente y aporta análisis
        original (no solo reproduce nuestras cifras),{" "}
        <Link
          href="#canales"
          className="text-primary underline-offset-4 hover:underline"
        >
          escríbenos a academia
        </Link>{" "}
        con el enlace y lo evaluamos. No hacemos compromisos automáticos pero
        nos interesa el ecosistema.
      </>
    ),
  },
  {
    question: "¿Dónde puedo ver el código del observatorio?",
    answer: (
      <>
        En nuestro repositorio público de GitHub.{" "}
        {/* [PENDIENTE: link al repositorio] */}
        <a
          href="#"
          className="text-primary underline-offset-4 hover:underline"
        >
          [PENDIENTE: link al repositorio]
        </a>
        . Si quieres reportar un bug técnico (no metodológico), abre un issue
        ahí directamente — es más eficiente que el correo.
      </>
    ),
  },
  {
    question: "¿Tienen oficina física?",
    answer:
      "No tenemos oficina pública. Operamos de manera distribuida. Para reuniones presenciales (entrevistas, mesas de diálogo, presentaciones), las coordinamos caso por caso vía correo.",
  },
];

export function Preguntas() {
  return (
    <section id="preguntas" className="border-b border-border py-16 md:py-20">
      <SectionHeader
        eyebrow="Preguntas frecuentes"
        title="Antes de escribir."
        lead="Algunas consultas se responden más rápido en otras páginas del sitio. Aquí dejamos las más comunes."
      />

      <div className="mt-10">
        <FAQ items={faqs} />
      </div>
    </section>
  );
}

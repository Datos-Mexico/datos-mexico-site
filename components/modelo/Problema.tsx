import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body } from "@/components/typography";

const casos = [
  {
    titulo: "Información oficial técnicamente exigible pero no publicada.",
    cuerpo:
      "Existen estudios actuariales, evaluaciones, modelos y documentos técnicos que las instituciones públicas mexicanas producen por mandato y que deben existir, pero que no se publican o que se entregan parcialmente. Un ciudadano individual difícilmente logra que la institución los entregue. Una organización académica con identidad pública sí puede solicitarlos formalmente, documentar la respuesta —concedida, parcial o negada— y, en cualquier caso, reconstruir por fuera lo que el dato disponible permita inferir. El observatorio puede sostener ese trabajo durante los meses que toma; un individuo no.",
  },
  {
    titulo: "Información oficial publicada pero ilegible.",
    cuerpo:
      "Existen datos públicos —rendimientos de subastas de deuda, ejecuciones presupuestales, padrones, contratos— que se publican técnicamente pero de forma dispersa, sin serie histórica consolidada, sin documentación accesible que vuelva el dato utilizable. Alguien tiene que organizarlo, mantenerlo en el tiempo y volverlo citable. Es exactamente el tipo de trabajo por el que un despacho de análisis, una asociación empresarial o un medio especializado pueden financiar el encargo — y por el que el observatorio puede aceptarlo porque produce, como subproducto, un dataset público permanente.",
  },
];

export function Problema() {
  return (
    <section id="problema" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="§2 · El problema que resuelve"
        title="No es falta de datos. Es falta de infraestructura."
        lead="México no carece de datos. Carece de infraestructura que vuelva los datos respondibles. Y carece, en una capa más profunda, de organismos capaces de levantar el dato cuando éste existe pero no está públicamente accesible."
      />

      <div className="mt-12 max-w-3xl space-y-6">
        <Body>
          El observatorio ocupa un lugar que ni una voz individual ni una
          institución con agenda propia pueden ocupar. Tiene la identidad
          pública para solicitar formalmente lo que existe pero no se ve.
          Tiene la independencia para investigar por fuera lo que no se
          entrega. Tiene la disciplina académica para que el trabajo quede
          registrado bien y de manera permanente.
        </Body>
        <Body>
          Dos casos ilustran el tipo de trabajo que nadie estructuralmente
          está haciendo hoy en México:
        </Body>
      </div>

      <ul className="mt-10 space-y-6 md:space-y-8">
        {casos.map((c) => (
          <li
            key={c.titulo}
            className="max-w-3xl rounded-lg border border-border bg-muted/40 px-6 py-7 md:px-8 md:py-8"
          >
            <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
              {c.titulo}
            </h3>
            <Body className="mt-3 text-[16px] leading-[1.7]">{c.cuerpo}</Body>
          </li>
        ))}
      </ul>
    </section>
  );
}

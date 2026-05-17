import { Check } from "lucide-react";
import { Eyebrow, H2 } from "@/components/typography";

const siHacemos = [
  "Enviar análisis y notas con el mismo rigor metodológico de toda nuestra publicación",
  "Citar siempre la fuente oficial y enlazarla",
  "Documentar nuestras correcciones cuando detectemos errores",
  "Permitirte darte de baja con un solo click",
  "Mantener tu correo solo para enviarte el boletín — nunca lo compartimos",
];

const noHacemos = [
  "No enviamos publicidad ni patrocinios",
  "No vendemos ni cedemos tu correo a terceros",
  "No usamos clickbait ni titulares persuasivos",
  "No tenemos paywall: todo nuestro contenido es público",
  "No te enviamos contenido si no estás suscrito (el boletín es opt-in estricto)",
];

export function Compromisos() {
  return (
    <section id="frecuencia" className="border-b border-border py-16 md:py-20">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <Eyebrow className="mb-4 text-accent">Compromisos</Eyebrow>
          <H2>Lo que prometemos y lo que no.</H2>
        </div>

        <div className="space-y-10">
          <div>
            <h3 className="font-mono text-[12px] uppercase tracking-[0.12em] text-foreground">
              Lo que sí hacemos
            </h3>
            <ul className="mt-5 space-y-3.5">
              {siHacemos.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check
                      className="h-3 w-3 text-primary"
                      aria-hidden="true"
                    />
                  </span>
                  <p className="font-sans text-[15px] leading-[1.6] text-text">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[12px] uppercase tracking-[0.12em] text-foreground">
              Lo que no hacemos
            </h3>
            <ul className="mt-5 space-y-3">
              {noHacemos.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 font-sans text-[15px] leading-[1.6] text-text-subtle"
                >
                  <span aria-hidden="true" className="mt-2.5 h-px w-3 flex-shrink-0 bg-text-subtle/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

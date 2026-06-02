import { Container } from "@/components/layout/Container";
import { Body, Eyebrow, H2 } from "@/components/typography";
import { ExternalLinkIcon } from "@/components/ui/ExternalLinkIcon";

const REPO_BASE = "https://github.com/Datos-Mexico/observatorio/blob/main";

const documentos = [
  {
    title: "Manifiesto institucional",
    description:
      "Identidad doctrinal del observatorio: misión, principios y modelo de crecimiento por ciclos.",
    href: `${REPO_BASE}/MANIFESTO.md`,
  },
  {
    title: "Arquitectura del corpus pregunta–respuesta",
    description:
      "Operación doctrinal del corpus editorial: estructura, criterios y cadencia de las publicaciones diarias.",
    href: `${REPO_BASE}/ARQUITECTURA-ARTICULOS.md`,
  },
];

export function AgendaCierre() {
  return (
    <section
      id="documentos"
      aria-label="Documentos institucionales"
      className="py-20 md:py-24"
    >
      <Container>
        <div className="max-w-3xl">
          <Eyebrow className="mb-4 text-accent">Documentos institucionales</Eyebrow>
          <H2>El marco doctrinal del que se desprende la agenda.</H2>
          <Body className="mt-6 text-[17px] leading-[1.7] text-text-subtle">
            La planificación que aparece arriba se sostiene en dos documentos
            publicados en el repositorio institucional del observatorio. El
            manifiesto declara la identidad del proyecto; la arquitectura del
            corpus describe cómo se produce cada publicación.
          </Body>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {documentos.map((d) => (
            <li key={d.href}>
              <a
                href={d.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col justify-between rounded-lg border border-border bg-background p-6 transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
                <div>
                  <p className="font-serif text-[20px] font-semibold leading-tight text-foreground">
                    {d.title}
                  </p>
                  <Body className="mt-3 text-[15px] leading-[1.6] text-text-subtle">
                    {d.description}
                  </Body>
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 font-sans text-[14px] font-medium text-primary">
                  Ver en repositorio
                  <ExternalLinkIcon className="text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

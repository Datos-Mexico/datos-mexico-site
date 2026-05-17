import { Download, CodeXml, FileText } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GithubIcon } from "@/components/ui/SocialIcons";
import { Body } from "@/components/typography";

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

type AuditCard = {
  icon: IconCmp;
  title: string;
  body: string;
  link?: { label: string; href: string };
  note?: string;
};

const cards: AuditCard[] = [
  {
    icon: Download,
    title: "Microdatos descargables",
    body: "Cada análisis enlaza al microdato original en el portal oficial de la fuente. No alojamos copias; remitimos al dato canónico para que la trazabilidad llegue hasta el origen.",
  },
  {
    icon: GithubIcon,
    title: "Cliente Python oficial",
    body: "Publicamos un cliente Python (datos-mexico) que cubre la lectura pública del API completa con tipos validados, caché integrado y manejo robusto de errores. Investigadores pueden trabajar con los datos del observatorio desde sus propios scripts y notebooks. El código del cliente es abierto bajo licencia MIT.",
    link: { label: "Repositorio en GitHub", href: "https://github.com/datos-mexico/datos-mexico-py" },
  },
  {
    icon: CodeXml,
    title: "API pública con validaciones",
    body: "El observatorio expone una API REST documentada (Swagger/OpenAPI). Algunos endpoints exponen explícitamente las validaciones contra publicaciones oficiales: cifra calculada, cifra oficial, delta, estado pass/fail.",
    link: { label: "Documentación de la API", href: "https://api.datos-itam.org/docs" },
  },
  {
    icon: FileText,
    title: "Notas metodológicas embebidas",
    body: "Cada gráfica del observatorio incluye su nota metodológica completa (unidad, fuente, edición, fórmula, fecha de validación). La nota está en el componente, no en un PDF separado.",
  },
];

export function Auditoria() {
  return (
    <section id="auditoria" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="Auditoría pública"
        title="Lo que ponemos a disposición para que cualquiera nos revise."
        lead="El rigor metodológico no se demuestra diciéndolo, sino exponiéndose a ser auditado. Estos son los recursos que abrimos públicamente para que cualquier persona pueda verificar nuestro trabajo."
      />

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {cards.map((c) => (
          <article
            key={c.title}
            className="flex flex-col rounded-lg border border-border bg-background p-6 md:p-7"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <c.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-serif text-[20px] font-semibold leading-[1.3] text-foreground">
              {c.title}
            </h3>
            <Body className="mt-3 text-[15px] leading-[1.6] text-text-subtle">
              {c.body}
            </Body>
            {c.link && (
              <a
                href={c.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1 font-sans text-[14px] font-medium text-primary hover:underline underline-offset-4"
              >
                {c.link.label} →
              </a>
            )}
            {c.note && (
              <p className="mt-5 font-sans text-[14px] leading-[1.6] text-text-subtle">
                {c.note}
              </p>
            )}
          </article>
        ))}
      </div>

      <aside
        aria-label="Reporte de errores"
        className="mt-12 rounded-lg bg-muted px-6 py-8 md:px-10 md:py-10"
      >
        <p className="font-sans text-[16px] leading-[1.65] text-text md:text-[17px]">
          <strong className="font-semibold text-foreground">
            ¿Encontraste un error o una inconsistencia?
          </strong>{" "}
          Escríbenos a{" "}
          <a
            href="mailto:errores@datosmexico.org"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            errores@datosmexico.org
          </a>{" "}
          . Documentamos las correcciones públicamente en la sección de cambios y,
          si aplica, en una nota visible en la publicación corregida. Las
          observaciones bien fundamentadas son siempre bienvenidas.
        </p>
      </aside>
    </section>
  );
}

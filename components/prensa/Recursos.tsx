import type { ComponentType, SVGProps } from "react";
import { Image as ImageIcon, FileText, Database, Download, ExternalLink } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Small } from "@/components/typography";
import { Badge } from "@/components/ui/Badge";

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

type Recurso = {
  icon: IconCmp;
  title: string;
  body: string;
  ctaLabel: string;
  available: boolean;
  // [PENDIENTE: enlaces reales]
  href: string;
};

const recursos: Recurso[] = [
  {
    icon: ImageIcon,
    title: "Logos",
    body:
      "Logo principal y variantes (color, monocromo, fondo claro, fondo oscuro) en formato SVG y PNG.",
    ctaLabel: "Descargar (.zip)",
    available: false,
    href: "#",
  },
  {
    icon: FileText,
    title: "Kit de prensa",
    body:
      "Documento PDF con resumen del proyecto, equipo, datasets activos, metodología y datos de contacto. Útil para periodistas que cubren el observatorio por primera vez.",
    ctaLabel: "Descargar (.pdf)",
    available: false,
    href: "#",
  },
  {
    icon: Database,
    title: "Datos del observatorio",
    body:
      "Todos nuestros datasets están disponibles públicamente vía nuestra API y enlazan a la fuente oficial original. Documentación técnica disponible.",
    ctaLabel: "Ver API",
    available: true,
    href: "https://api.datos-itam.org/docs",
  },
];

export function Recursos() {
  return (
    <section id="recursos" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="Recursos"
        title="Material para descargar."
        lead="Logos, kit de prensa y enlaces útiles para periodistas."
      />

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {recursos.map((r) => (
          <article
            key={r.title}
            className="flex h-full flex-col rounded-lg border border-border bg-background p-6"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <r.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="mt-5 flex items-start gap-3">
              <h3 className="font-serif text-[19px] font-semibold leading-[1.3] text-foreground md:text-[20px]">
                {r.title}
              </h3>
              {!r.available && (
                <Badge variant="outline" className="mt-1">
                  Próximamente
                </Badge>
              )}
            </div>
            <Body className="mt-3 text-[15px] leading-[1.6] text-text-subtle">
              {r.body}
            </Body>
            <div className="mt-auto pt-5">
              {r.available ? (
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 font-sans text-[14px] font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  {r.ctaLabel}
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled
                  title="Próximamente"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 font-sans text-[14px] font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {r.ctaLabel}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <Small className="mt-10 mx-auto max-w-2xl text-center text-[14px] leading-[1.6]">
        Si necesitas un recurso que no está aquí (datos crudos en formato
        específico, gráfica en alta resolución, citación específica para un
        artículo), escríbenos directamente a{" "}
        <a
          href="mailto:prensa@datosmexico.org"
          className="text-primary underline-offset-4 hover:underline"
        >
          prensa@datosmexico.org
        </a>
        .
      </Small>
    </section>
  );
}

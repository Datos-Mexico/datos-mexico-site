import type { ComponentType, SVGProps } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import {
  TwitterIcon,
  LinkedinIcon,
  GithubIcon,
  YoutubeIcon,
} from "@/components/ui/SocialIcons";

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

type Red = {
  icon: IconCmp;
  platform: string;
  handle: string;
  description: string;
  href: string;
  disabled?: boolean;
};

// [PENDIENTE: confirmar handles y URLs reales para las 4 plataformas]
const redes: Red[] = [
  {
    icon: TwitterIcon,
    platform: "Twitter / X",
    handle: "@MexicoDato81513",
    description:
      "Notas breves, actualizaciones de publicaciones y comentarios de coyuntura.",
    href: "https://x.com/MexicoDato81513",
  },
  {
    icon: LinkedinIcon,
    platform: "LinkedIn",
    handle: "Datos México",
    description:
      "Análisis profundos, anuncios institucionales y oportunidades de colaboración.",
    href: "https://www.linkedin.com/company/datos-m%C3%A9xico",
  },
  {
    icon: GithubIcon,
    platform: "GitHub",
    handle: "datos-mexico",
    description:
      "Código fuente del observatorio, datasets procesados y documentación técnica.",
    href: "https://github.com/datos-mexico",
  },
  {
    icon: YoutubeIcon,
    platform: "YouTube",
    handle: "@datosméxico",
    description:
      "Explicaciones en video sobre metodología y análisis. Próximamente.",
    href: "https://www.youtube.com/@datosm%C3%A9xico",
  },
];

function RedCard({ icon: Icon, platform, handle, description, href, disabled }: Red) {
  const className =
    "flex h-full flex-col rounded-md border border-border bg-background p-5 transition-colors";
  const enabledClass = "hover:border-foreground/20";
  const disabledClass = "opacity-60 cursor-not-allowed";

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">
          <Icon className="h-4 w-4" />
        </span>
        {disabled && <Badge variant="outline">Próximamente</Badge>}
      </div>
      <h3 className="mt-4 font-serif text-[17px] font-semibold leading-[1.3] text-foreground">
        {platform}
      </h3>
      <p className="mt-1 font-mono text-[12px] text-text-subtle">{handle}</p>
      <p className="mt-3 font-sans text-[14px] leading-[1.55] text-text-subtle">
        {description}
      </p>
    </>
  );

  if (disabled) {
    return (
      <div
        className={`${className} ${disabledClass}`}
        aria-disabled="true"
        title="Próximamente"
      >
        {inner}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} ${enabledClass}`}
    >
      {inner}
    </a>
  );
}

export function Redes() {
  return (
    <section id="redes" className="border-b border-border py-16 md:py-20">
      <SectionHeader
        eyebrow="Redes"
        title="También estamos en estas plataformas."
        lead="Las redes sociales son canales informativos, no de soporte. Para consultas que requieran respuesta, usa los canales de arriba."
      />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {redes.map((r) => (
          <RedCard key={r.platform} {...r} />
        ))}
      </div>
    </section>
  );
}

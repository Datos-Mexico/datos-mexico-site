import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { ExternalLinkIcon } from "@/components/ui/ExternalLinkIcon";
import { brand, navigation } from "@/lib/design-tokens";

const resources = [
  { label: "Boletín", href: "/boletin", external: false },
  { label: "Repositorio público", href: "https://github.com/datos-mexico/datos-mexico-py", external: true },
  { label: "Docs SDK", href: "https://docs.datosmexico.org", external: true },
  { label: "API documentación", href: "https://api.datos-itam.org/docs", external: true },
] as const;

const contact = [
  { label: "Ver canales de contacto →", href: "/contacto" },
] as const;

export function Footer() {
  return (
    <footer className="bg-foreground text-text-inverse">
      <Container>
        <div className="grid grid-cols-1 gap-10 py-16 md:grid-cols-2 md:gap-12 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo variant="mono-white" withWordmark size="md" />
            <p className="font-sans text-[14px] leading-[1.6] text-white/70">
              {brand.shortTagline}
            </p>
            <p className="font-sans text-[14px] leading-[1.6] text-white/50">
              Del microdato a la conversación pública.
            </p>
          </div>

          <FooterColumn title="Navegación">
            {navigation.map((item) => (
              <FooterLink
                key={item.href}
                href={item.href}
                external={item.external}
              >
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Recursos">
            {resources.map((item) => (
              <FooterLink
                key={item.label}
                href={item.href}
                external={"external" in item ? item.external : false}
              >
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Contacto">
            {contact.map((item) => (
              <FooterLink key={item.label} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        <div className="border-t border-white/10 py-8">
          <p className="font-sans text-[13px] leading-[1.6] text-white/50">
            © {new Date().getFullYear()} {brand.name}. Datos públicos bajo licencias abiertas.
            Equipo conformado por estudiantes y egresados del ITAM.
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-mono text-[12px] uppercase tracking-[0.12em] text-white/50">
        {title}
      </h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  external,
  pending,
  children,
}: {
  href: string;
  external?: boolean;
  pending?: boolean;
  children: React.ReactNode;
}) {
  const className =
    "inline-flex items-center gap-1 font-sans text-[14px] text-white/80 hover:text-white transition-colors";

  if (pending) {
    return (
      <li>
        <span className={`${className} cursor-not-allowed opacity-60`}>
          {children}
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
            (próximo)
          </span>
        </span>
      </li>
    );
  }

  if (external) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {children}
          <ExternalLinkIcon className="text-white/40" />
        </a>
      </li>
    );
  }

  return (
    <li>
      <Link href={href} className={className}>
        {children}
      </Link>
    </li>
  );
}

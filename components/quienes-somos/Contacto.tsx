import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Mono } from "@/components/typography";

const emails = [
  { label: "General", address: "contacto@datosmexico.org" },
  { label: "Prensa", address: "prensa@datosmexico.org" },
  { label: "Colaboraciones académicas", address: "academia@datosmexico.org" },
];

const socials = [
  // [PENDIENTE: handle real de GitHub para esta sección]
  { label: "Twitter / X", href: "https://x.com/MexicoDato81513" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/datos-m%C3%A9xico" },
  { label: "GitHub", href: "https://github.com/datos-mexico" },
];

export function Contacto() {
  return (
    <section id="contacto" className="py-20 md:py-24">
      <Container>
        <SectionHeader eyebrow="Contacto" title="Escríbenos." />

        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <Body className="max-w-xl text-[17px] leading-[1.7]">
              Si eres periodista, investigadora, parte de una organización aliada,
              o si te interesa colaborar con el observatorio, este es nuestro canal.
              Respondemos en un plazo máximo de 5 días hábiles.
            </Body>
          </div>

          <div className="space-y-8">
            {emails.map((e) => (
              <div key={e.label}>
                <Mono className="block text-[12px] uppercase tracking-[0.1em] text-text-subtle">
                  {e.label}
                </Mono>
                <a
                  href={`mailto:${e.address}`}
                  className="mt-2 inline-block font-sans text-[18px] font-medium text-foreground hover:text-primary transition-colors"
                >
                  {e.address}
                </a>
              </div>
            ))}

            <div>
              <Mono className="block text-[12px] uppercase tracking-[0.1em] text-text-subtle">
                Redes sociales
              </Mono>
              <ul className="mt-3 flex flex-wrap items-center gap-3">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-md border border-border px-3 py-2 font-sans text-[14px] text-foreground hover:border-foreground transition-colors"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

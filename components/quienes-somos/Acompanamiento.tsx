import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Small } from "@/components/typography";
import { academicos } from "@/lib/academicos";

export function Acompanamiento() {
  return (
    <section
      id="acompanamiento"
      className="border-b border-border py-20 md:py-24"
    >
      <Container>
        <SectionHeader
          eyebrow="Acompañamiento académico"
          title="Profesores que acompañan el desarrollo del observatorio."
          lead="Académicos del ITAM que están al pendiente del proyecto y han ofrecido retroalimentación sobre su desarrollo."
        />

        <ul className="mt-12 max-w-2xl space-y-8">
          {academicos.map((a) => (
            <li key={a.id}>
              <p className="font-sans text-[17px] font-medium text-foreground">
                {a.name}
              </p>
              <Small className="mt-1">
                {a.role} — {a.institution}
              </Small>
            </li>
          ))}
        </ul>

        <a
          href="https://epiclab.itam.mx/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="EpicLab — ITAM"
          className="mt-10 inline-block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/epiclab.avif"
            alt="EpicLab"
            className="h-12 w-auto"
            loading="lazy"
            decoding="async"
          />
        </a>
      </Container>
    </section>
  );
}

import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Mono, Small } from "@/components/typography";
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

        {/* Mismo tratamiento sobrio que Asesoría: lista con jerarquía
            tipográfica sutil, sin cards prominentes. El acompañamiento
            informa al observatorio, no lo respalda institucionalmente. */}
        <ul className="mt-12 max-w-2xl divide-y divide-border border-y border-border">
          {academicos.map((a) => (
            <li
              key={a.id}
              className="grid grid-cols-1 gap-1 py-5 md:grid-cols-[1fr_auto] md:items-baseline md:gap-6"
            >
              <p className="font-serif text-[18px] font-medium leading-[1.3] text-foreground">
                {a.name}
              </p>
              <Mono className="md:text-right">{a.role} · {a.institution}</Mono>
            </li>
          ))}
        </ul>

        <Small className="mt-6 max-w-2xl">
          El acompañamiento es a título personal de cada académico. El
          observatorio no representa al ITAM.
        </Small>

        <a
          href="https://epiclab.itam.mx/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="EpicLab — ITAM"
          className="mt-10 inline-block opacity-70 transition-opacity hover:opacity-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/epiclab.avif"
            alt="EpicLab"
            className="h-10 w-auto"
            loading="lazy"
            decoding="async"
          />
        </a>
      </Container>
    </section>
  );
}

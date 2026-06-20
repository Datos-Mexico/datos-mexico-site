import type { ReactNode } from "react";
import { H1, Lead, Eyebrow, Body } from "@/components/typography";
import { Button } from "@/components/ui/Button";

export type ResultadoTone = "exito" | "neutral" | "error";

export function ResultadoEnlace({
  tone,
  eyebrow,
  title,
  lead,
  body,
  primary,
  secondary,
}: {
  tone: ResultadoTone;
  eyebrow: string;
  title: string;
  lead: string;
  body?: ReactNode;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  const eyebrowClass =
    tone === "exito"
      ? "text-primary"
      : tone === "error"
        ? "text-danger"
        : "text-accent";

  return (
    <section className="border-b border-border pt-24 pb-20 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-3xl">
        <Eyebrow className={`mb-5 ${eyebrowClass}`}>{eyebrow}</Eyebrow>
        <H1>{title}</H1>
        <Lead className="mt-7">{lead}</Lead>

        {body ? <div className="mt-6 space-y-4">{body}</div> : null}

        {(primary || secondary) && (
          <div className="mt-10 flex flex-wrap gap-3">
            {primary ? (
              <Button href={primary.href} variant="primary" size="lg">
                {primary.label}
              </Button>
            ) : null}
            {secondary ? (
              <Button href={secondary.href} variant="outline" size="lg">
                {secondary.label}
              </Button>
            ) : null}
          </div>
        )}

        <Body className="mt-12 text-text-subtle">
          ¿Algún problema?{" "}
          <a
            href="mailto:contacto@datosmexico.org"
            className="text-primary underline-offset-4 hover:underline"
          >
            contacto@datosmexico.org
          </a>
        </Body>
      </div>
    </section>
  );
}

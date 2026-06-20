import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Container } from "@/components/layout/Container";
import { ResultadoEnlace } from "@/components/boletin/ResultadoEnlace";
import { processUnsubscribe } from "@/lib/newsletter/handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Baja del boletín",
  description:
    "Estado de la baja del boletín del observatorio Datos México.",
  alternates: { canonical: "/boletin/baja" },
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ token?: string | string[] }>;

type Estado =
  | { kind: "baja_confirmada" }
  | { kind: "ya_de_baja" }
  | { kind: "invalido" }
  | { kind: "error_servidor" };

function buildPrivacyUrl(): string {
  return "https://datosmexico.org/privacidad";
}

async function resolverEstado(token: string): Promise<Estado> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.NEWSLETTER_DB;
    if (!db) {
      return { kind: "error_servidor" };
    }
    const outcome = await processUnsubscribe(db, env, token, buildPrivacyUrl());
    if (outcome.kind === "unsubscribed") {
      return { kind: "baja_confirmada" };
    }
    if (outcome.kind === "already_unsubscribed") {
      return { kind: "ya_de_baja" };
    }
    return { kind: "invalido" };
  } catch {
    return { kind: "error_servidor" };
  }
}

export default async function BajaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token } = await searchParams;
  const tokenString = typeof token === "string" ? token : "";
  const estado = tokenString
    ? await resolverEstado(tokenString)
    : ({ kind: "invalido" } as const);

  if (estado.kind === "baja_confirmada") {
    return (
      <Container>
        <ResultadoEnlace
          tone="exito"
          eyebrow="Baja confirmada"
          title="Te dimos de baja del boletín."
          lead="Tu correo ya no recibirá más envíos del observatorio. Gracias por el tiempo que estuviste con nosotros — seguimos publicando con la misma transparencia metodológica en datosmexico.org."
          primary={{ label: "Volver al inicio", href: "/" }}
          secondary={{ label: "Ver publicaciones", href: "/publicaciones" }}
        />
      </Container>
    );
  }

  if (estado.kind === "ya_de_baja") {
    return (
      <Container>
        <ResultadoEnlace
          tone="neutral"
          eyebrow="Baja del boletín"
          title="Tu correo ya estaba dado de baja."
          lead="No hace falta hacer nada más. Ya no recibirás envíos del boletín."
          primary={{ label: "Volver al inicio", href: "/" }}
        />
      </Container>
    );
  }

  if (estado.kind === "invalido") {
    return (
      <Container>
        <ResultadoEnlace
          tone="neutral"
          eyebrow="Enlace de baja"
          title="Este enlace ya no es válido."
          lead="Probablemente el enlace está mal formado, expiró, o se abrió desde un correo viejo. Si necesitas darte de baja, escríbenos y lo hacemos manualmente."
          primary={{ label: "Volver al inicio", href: "/" }}
        />
      </Container>
    );
  }

  return (
    <Container>
      <ResultadoEnlace
        tone="error"
        eyebrow="Baja del boletín"
        title="Algo no funcionó de nuestro lado."
        lead="Tuvimos un problema procesando tu baja. No es culpa tuya — intenta de nuevo en unos minutos o escríbenos para resolverlo manualmente."
        primary={{ label: "Volver al inicio", href: "/" }}
      />
    </Container>
  );
}

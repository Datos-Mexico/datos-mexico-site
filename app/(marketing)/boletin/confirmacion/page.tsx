import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Container } from "@/components/layout/Container";
import { ResultadoEnlace } from "@/components/boletin/ResultadoEnlace";
import { processConfirm } from "@/lib/newsletter/handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirmación de suscripción",
  description:
    "Estado de la confirmación de suscripción al boletín del observatorio Datos México.",
  alternates: { canonical: "/boletin/confirmacion" },
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ token?: string | string[] }>;

type Estado =
  | { kind: "exito" }
  | { kind: "invalido" }
  | { kind: "error_servidor" };

async function resolverEstado(token: string): Promise<Estado> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.NEWSLETTER_DB;
    if (!db) {
      return { kind: "error_servidor" };
    }
    const outcome = await processConfirm(db, token);
    if (outcome.kind === "confirmed") {
      return { kind: "exito" };
    }
    // `invalid_shape`, `invalid`, `already_used` colapsan en el mismo
    // mensaje hacia fuera — un token mal formado, gastado o nunca
    // emitido son indistinguibles desde el usuario.
    return { kind: "invalido" };
  } catch {
    return { kind: "error_servidor" };
  }
}

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token } = await searchParams;
  const tokenString = typeof token === "string" ? token : "";
  const estado = tokenString
    ? await resolverEstado(tokenString)
    : ({ kind: "invalido" } as const);

  if (estado.kind === "exito") {
    return (
      <Container>
        <ResultadoEnlace
          tone="exito"
          eyebrow="Suscripción confirmada"
          title="Listo — quedaste suscrito al boletín."
          lead="Tu correo está confirmado. A partir del próximo envío, recibirás las publicaciones del observatorio directamente en tu bandeja."
          primary={{ label: "Volver al inicio", href: "/" }}
          secondary={{ label: "Ver publicaciones", href: "/publicaciones" }}
        />
      </Container>
    );
  }

  if (estado.kind === "invalido") {
    return (
      <Container>
        <ResultadoEnlace
          tone="neutral"
          eyebrow="Enlace de confirmación"
          title="Este enlace ya no es válido."
          lead="Probablemente el enlace ya se usó, expiró, o se abrió desde un correo viejo. Si quieres suscribirte, puedes pedir un nuevo enlace de confirmación desde la página del boletín."
          primary={{ label: "Ir al boletín", href: "/boletin#suscribete" }}
          secondary={{ label: "Volver al inicio", href: "/" }}
        />
      </Container>
    );
  }

  return (
    <Container>
      <ResultadoEnlace
        tone="error"
        eyebrow="Confirmación de suscripción"
        title="Algo no funcionó de nuestro lado."
        lead="Tuvimos un problema procesando tu confirmación. No es culpa tuya — intenta de nuevo en unos minutos o escríbenos para resolverlo."
        primary={{ label: "Reintentar", href: "/boletin#suscribete" }}
      />
    </Container>
  );
}

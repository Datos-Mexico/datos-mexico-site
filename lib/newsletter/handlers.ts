import { isValidEmail } from "@/lib/newsletter";
import { confirm, subscribe, unsubscribe } from "./db";
import {
  type EmailEnv,
  sendConfirmationEmail,
  sendUnsubscribeReceiptEmail,
} from "./email";
import { isValidTokenShape } from "./tokens";

const PRIVACY_PATH = "/privacidad";
const CONFIRM_PATH = "/api/newsletter/confirm";
const UNSUBSCRIBE_PATH = "/api/newsletter/unsubscribe";

// Respuesta uniforme para /subscribe. La misma para correo nuevo,
// pendiente reissue, ya confirmado y ya dado de baja → no filtramos
// si un correo está o no en la lista.
const SUBSCRIBE_UNIFORM_BODY = {
  ok: true,
  message:
    "Si el correo es válido, te enviamos un enlace de confirmación. Revisa tu bandeja (y spam).",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function buildOrigin(request: Request): string {
  try {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "https://datosmexico.org";
  }
}

export async function handleSubscribe(
  db: D1Database,
  env: EmailEnv,
  request: Request,
): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "json_invalido" }, 400);
  }

  const email =
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as { email?: unknown }).email === "string"
      ? ((payload as { email: string }).email as string)
      : "";

  if (!isValidEmail(email)) {
    return jsonResponse({ ok: false, error: "correo_invalido" }, 400);
  }

  const outcome = await subscribe(db, email);
  const origin = buildOrigin(request);

  if (outcome.kind === "created" || outcome.kind === "reissued") {
    const { subscriber } = outcome;
    if (subscriber.confirmationToken) {
      await sendConfirmationEmail(
        {
          to: subscriber.email,
          confirmUrl: `${origin}${CONFIRM_PATH}?token=${subscriber.confirmationToken}`,
          unsubscribeUrl: `${origin}${UNSUBSCRIBE_PATH}?token=${subscriber.unsubscribeToken}`,
          privacyUrl: `${origin}${PRIVACY_PATH}`,
        },
        env,
      );
    }
  }

  return jsonResponse(SUBSCRIBE_UNIFORM_BODY, 200);
}

export async function handleConfirm(
  db: D1Database,
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";

  if (!isValidTokenShape(token)) {
    return jsonResponse({ ok: false, error: "token_invalido" }, 400);
  }

  const outcome = await confirm(db, token);

  if (outcome.kind === "confirmed") {
    return jsonResponse(
      {
        ok: true,
        kind: "confirmed",
        message: "Tu suscripción quedó confirmada.",
      },
      200,
    );
  }

  // Para `invalid` y `already_used` devolvemos la misma forma:
  // un token gastado o un token nunca emitido son indistinguibles
  // desde fuera.
  return jsonResponse(
    {
      ok: false,
      kind: "invalid",
      error: "token_invalido_o_caducado",
    },
    400,
  );
}

export async function handleUnsubscribe(
  db: D1Database,
  env: EmailEnv,
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";

  if (!isValidTokenShape(token)) {
    return jsonResponse({ ok: false, error: "token_invalido" }, 400);
  }

  const outcome = await unsubscribe(db, token);

  if (outcome.kind === "unsubscribed") {
    await sendUnsubscribeReceiptEmail(
      {
        to: outcome.subscriber.email,
        privacyUrl: `${buildOrigin(request)}${PRIVACY_PATH}`,
      },
      env,
    );
    return jsonResponse(
      {
        ok: true,
        kind: "unsubscribed",
        message: "Te dimos de baja del boletín.",
      },
      200,
    );
  }

  if (outcome.kind === "already_unsubscribed") {
    return jsonResponse(
      {
        ok: true,
        kind: "already_unsubscribed",
        message: "Ya estabas dado de baja.",
      },
      200,
    );
  }

  return jsonResponse(
    {
      ok: false,
      kind: "invalid",
      error: "token_invalido",
    },
    400,
  );
}

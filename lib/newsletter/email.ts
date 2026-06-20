// Envío transaccional del boletín vía Resend.
//
// La función es defensiva: si falta la API key o si Resend responde
// un error, se registra y se devuelve sin lanzar. El handler de
// /subscribe no debe romperse cuando el envío falla — la fila del
// suscriptor ya quedó en `pendiente` y un reintento humano del
// formulario re-emite token y vuelve a intentar el envío.
//
// El HTML del correo se compone con el sistema de plantilla en
// `email-layout.ts`. Los tres correos del observatorio (confirmación,
// recibo de baja, boletín quincenal de la Fase 4) usan la misma
// plantilla — la identidad visual queda en un solo lugar.
//
// Variables que el código espera del entorno de Cloudflare:
//   - RESEND_API_KEY               (secret, requerida)
//   - NEWSLETTER_FROM              (opcional, default "Datos México · Boletín <boletin@mail.datosmexico.org>")
//   - NEWSLETTER_REPLY_TO          (opcional, default "contacto@datosmexico.org")

import {
  renderButton,
  renderDivider,
  renderEmailLayout,
  renderHeading,
  renderInlineLink,
  renderLead,
  renderParagraph,
  renderSubtle,
} from "./email-layout";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const DEFAULT_FROM = "Datos México · Boletín <boletin@mail.datosmexico.org>";
const DEFAULT_REPLY_TO = "contacto@datosmexico.org";

export type EmailEnv = {
  RESEND_API_KEY?: string;
  NEWSLETTER_FROM?: string;
  NEWSLETTER_REPLY_TO?: string;
};

export type ConfirmationEmail = {
  to: string;
  confirmUrl: string;
  unsubscribeUrl: string;
  privacyUrl: string;
};

export type UnsubscribeReceiptEmail = {
  to: string;
  privacyUrl: string;
};

type ResendMessage = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
  headers?: Record<string, string>;
};

type SendResult =
  | { kind: "sent"; id: string }
  | { kind: "skipped"; reason: string }
  | { kind: "error"; status: number; body: string };

export type Sender = (message: ResendMessage, apiKey: string) => Promise<SendResult>;

// Sender por defecto: HTTP POST a la API de Resend. La factorización
// permite inyectar un sender de prueba en los tests.
export const defaultResendSender: Sender = async (message, apiKey) => {
  let response: Response;
  try {
    response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  } catch (networkError) {
    return {
      kind: "error",
      status: 0,
      body: networkError instanceof Error ? networkError.message : String(networkError),
    };
  }
  if (response.ok) {
    let id = "";
    try {
      const data = (await response.json()) as { id?: string };
      id = data.id ?? "";
    } catch {
      // Resend siempre devuelve JSON, pero por seguridad
    }
    return { kind: "sent", id };
  }
  const body = await response.text().catch(() => "");
  return { kind: "error", status: response.status, body };
};

function pickFrom(env: EmailEnv): string {
  return env.NEWSLETTER_FROM?.trim() || DEFAULT_FROM;
}

function pickReplyTo(env: EmailEnv): string {
  return env.NEWSLETTER_REPLY_TO?.trim() || DEFAULT_REPLY_TO;
}

function logSend(kind: string, info: Record<string, unknown>): void {
  // El log no incluye la API key ni el cuerpo del correo. Solo
  // metadata para auditoría: a qué dirección, qué resultado, qué id
  // devolvió Resend.
  try {
    console.log(`[newsletter] ${kind}`, JSON.stringify(info));
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────────
// Correo de confirmación de suscripción
// ─────────────────────────────────────────────────────────────────────

export function buildConfirmationMessage(
  payload: ConfirmationEmail,
  from: string,
  replyTo: string,
): ResendMessage {
  const { to, confirmUrl, unsubscribeUrl, privacyUrl } = payload;

  const subject = "Confirma tu suscripción al boletín de Datos México";

  const bodyHtml = [
    renderHeading("Confirma tu suscripción"),
    renderLead(
      "Recibimos una solicitud para suscribir este correo al boletín del observatorio. Para activarla, abre el siguiente enlace:",
    ),
    renderButton({ href: confirmUrl, label: "Confirmar mi suscripción" }),
    renderParagraph(
      "El enlace es válido para un solo uso. Si no confirmas, no recibirás más mensajes nuestros — tu dirección no entra a ninguna lista.",
    ),
    renderDivider(),
    renderSubtle(
      "Si no fuiste tú quien introdujo este correo en el formulario de datosmexico.org, ignora este mensaje. No hicimos nada con tu dirección.",
    ),
  ].join("\n");

  const html = renderEmailLayout({
    preheader:
      "Abre el enlace de confirmación para activar tu suscripción al boletín del observatorio.",
    eyebrow: "Confirmación de suscripción",
    bodyHtml,
    privacyUrl,
    unsubscribeUrl,
    whyReceivingText:
      "Recibes este correo porque alguien — probablemente tú — introdujo esta dirección en el formulario del boletín. Pedimos un clic de confirmación para evitar suscribir personas sin su permiso.",
  });

  const text = `Datos México · Boletín
Observatorio académico independiente

CONFIRMACIÓN DE SUSCRIPCIÓN

Recibimos una solicitud para suscribir este correo al boletín del
observatorio. Para activarla, abre el siguiente enlace:

  ${confirmUrl}

El enlace es válido para un solo uso. Si no confirmas, no recibirás
más mensajes nuestros — tu dirección no entra a ninguna lista.

Si no fuiste tú quien introdujo este correo en el formulario de
datosmexico.org, ignora este mensaje. No hicimos nada con tu
dirección.

—

Recibes este correo porque alguien introdujo esta dirección en el
formulario del boletín de datosmexico.org. Pedimos un clic para
evitar suscribir personas sin su permiso.

Aviso de privacidad:  ${privacyUrl}
Darme de baja:        ${unsubscribeUrl}

Datos México · Observatorio académico independiente
datosmexico.org · contacto@datosmexico.org
`;

  return {
    from,
    to: [to],
    subject,
    html,
    text,
    reply_to: replyTo,
    headers: {
      // RFC 2369 / 8058: botón nativo de baja en Gmail/Outlook.
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

export async function sendConfirmationEmail(
  payload: ConfirmationEmail,
  env: EmailEnv,
  sender: Sender = defaultResendSender,
): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    logSend("confirmation.skipped", { reason: "missing_api_key", to: payload.to });
    return;
  }
  const message = buildConfirmationMessage(
    payload,
    pickFrom(env),
    pickReplyTo(env),
  );
  const result = await sender(message, apiKey);
  if (result.kind === "sent") {
    logSend("confirmation.sent", { to: payload.to, resend_id: result.id });
  } else if (result.kind === "error") {
    logSend("confirmation.error", {
      to: payload.to,
      status: result.status,
      body: result.body.slice(0, 500),
    });
  } else {
    logSend("confirmation.skipped", { to: payload.to, reason: result.reason });
  }
}

// ─────────────────────────────────────────────────────────────────────
// Recibo de baja
// ─────────────────────────────────────────────────────────────────────

export function buildUnsubscribeReceiptMessage(
  payload: UnsubscribeReceiptEmail,
  from: string,
  replyTo: string,
): ResendMessage {
  const { to, privacyUrl } = payload;
  const subject = "Te dimos de baja del boletín de Datos México";

  const bodyHtml = [
    renderHeading("Te dimos de baja"),
    renderLead(
      "Confirmamos que tu correo ya no recibirá el boletín de Datos México. No hace falta que hagas nada más.",
    ),
    renderParagraph(
      `Si esto fue un error, escríbenos a ${renderInlineLink("mailto:contacto@datosmexico.org", "contacto@datosmexico.org")} y lo revertimos.`,
      { html: true },
    ),
    renderDivider(),
    renderSubtle(
      "Gracias por el tiempo que estuviste con nosotros. Seguimos publicando con la misma transparencia metodológica en datosmexico.org.",
    ),
  ].join("\n");

  const html = renderEmailLayout({
    preheader:
      "Confirmamos que tu correo ya no recibirá el boletín de Datos México.",
    eyebrow: "Baja confirmada",
    bodyHtml,
    privacyUrl,
    // Sin unsubscribeUrl: ya está de baja; el enlace no aplica.
  });

  const text = `Datos México · Boletín
Observatorio académico independiente

BAJA CONFIRMADA

Confirmamos que tu correo ya no recibirá el boletín de Datos México.
No hace falta que hagas nada más.

Si esto fue un error, escríbenos a contacto@datosmexico.org y lo
revertimos.

Gracias por el tiempo que estuviste con nosotros. Seguimos publicando
con la misma transparencia metodológica en datosmexico.org.

—

Aviso de privacidad:  ${privacyUrl}

Datos México · Observatorio académico independiente
datosmexico.org · contacto@datosmexico.org
`;

  return {
    from,
    to: [to],
    subject,
    html,
    text,
    reply_to: replyTo,
  };
}

export async function sendUnsubscribeReceiptEmail(
  payload: UnsubscribeReceiptEmail,
  env: EmailEnv,
  sender: Sender = defaultResendSender,
): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    logSend("unsubscribe_receipt.skipped", {
      reason: "missing_api_key",
      to: payload.to,
    });
    return;
  }
  const message = buildUnsubscribeReceiptMessage(
    payload,
    pickFrom(env),
    pickReplyTo(env),
  );
  const result = await sender(message, apiKey);
  if (result.kind === "sent") {
    logSend("unsubscribe_receipt.sent", {
      to: payload.to,
      resend_id: result.id,
    });
  } else if (result.kind === "error") {
    logSend("unsubscribe_receipt.error", {
      to: payload.to,
      status: result.status,
      body: result.body.slice(0, 500),
    });
  }
}

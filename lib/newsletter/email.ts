// Envío transaccional del boletín vía Resend.
//
// La función es defensiva: si falta la API key o si Resend responde
// un error, se registra y se devuelve sin lanzar. El handler de
// /subscribe no debe romperse cuando el envío falla — la fila del
// suscriptor ya quedó en `pendiente` y un reintento humano del
// formulario re-emite token y vuelve a intentar el envío.
//
// Diseño del remitente:
//   - Dominio de envío: subdominio dedicado (default `mail.datosmexico.org`)
//     para aislar la reputación del envío transaccional y mantener
//     intacto el SPF/MX del Email Routing de Cloudflare en el dominio
//     raíz (contacto@, prensa@, academia@, correcciones@).
//   - Reply-To en el dominio raíz para que las respuestas humanas
//     aterricen en una bandeja monitoreada (default `contacto@datosmexico.org`).
//
// Variables que el código espera del entorno de Cloudflare:
//   - RESEND_API_KEY               (secret, requerida)
//   - NEWSLETTER_FROM              (opcional, default "Datos México <boletin@mail.datosmexico.org>")
//   - NEWSLETTER_REPLY_TO          (opcional, default "contacto@datosmexico.org")

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const DEFAULT_FROM = "Datos México <boletin@mail.datosmexico.org>";
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

// Default sender: HTTP POST a la API de Resend. La factorización
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
  // devolvió Resend (si lo hubo).
  try {
    console.log(`[newsletter] ${kind}`, JSON.stringify(info));
  } catch {
    // ignore
  }
}

// ------------------------------------------------------------------
// Correo de confirmación de suscripción
// ------------------------------------------------------------------

export function buildConfirmationMessage(
  payload: ConfirmationEmail,
  from: string,
  replyTo: string,
): ResendMessage {
  const { to, confirmUrl, unsubscribeUrl, privacyUrl } = payload;

  const subject = "Confirma tu suscripción al boletín de Datos México";

  const text = `Datos México — Observatorio independiente de datos públicos

Hola,

Recibimos una solicitud para suscribir este correo al boletín de
Datos México. Para confirmarla, abre el siguiente enlace:

${confirmUrl}

El enlace es válido para un solo uso. Si no confirmas, no recibirás
más mensajes nuestros.

Si no fuiste tú quien introdujo este correo en el formulario de
datosmexico.org, ignora este mensaje. No hicimos nada con tu dirección.

—

Aviso de privacidad:
${privacyUrl}

Darme de baja:
${unsubscribeUrl}

Datos México
datosmexico.org · contacto@datosmexico.org
`;

  const html = renderConfirmationHtml({
    confirmUrl,
    unsubscribeUrl,
    privacyUrl,
  });

  return {
    from,
    to: [to],
    subject,
    html,
    text,
    reply_to: replyTo,
    headers: {
      // RFC 2369: permite a los clientes (Gmail, Outlook) ofrecer un
      // botón de "darse de baja" con un solo clic.
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

function renderConfirmationHtml(args: {
  confirmUrl: string;
  unsubscribeUrl: string;
  privacyUrl: string;
}): string {
  const { confirmUrl, unsubscribeUrl, privacyUrl } = args;
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Confirma tu suscripción al boletín de Datos México</title>
  </head>
  <body style="margin:0; padding:0; background:#f6f5f1; font-family: Georgia, 'Source Serif 4', 'Times New Roman', serif; color:#1c1c1c;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f1; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background:#ffffff; border: 1px solid #e5e3dc; border-radius: 6px; padding: 40px 36px;">
            <tr>
              <td style="padding-bottom: 24px; border-bottom: 1px solid #e5e3dc;">
                <div style="font-family: Georgia, 'Source Serif 4', serif; font-size: 20px; line-height: 1.2; color:#1c1c1c; letter-spacing: 0.02em;">Datos México</div>
                <div style="font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 12px; line-height: 1.4; color:#666; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em;">Observatorio independiente de datos públicos</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 28px 0 8px 0; font-family: Georgia, 'Source Serif 4', serif; font-size: 17px; line-height: 1.6; color:#1c1c1c;">
                <p style="margin: 0 0 16px 0;">Hola,</p>
                <p style="margin: 0 0 16px 0;">Recibimos una solicitud para suscribir este correo al boletín de Datos México. Para confirmarla, abre el enlace:</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0 24px 0;" align="left">
                <a href="${escapeAttr(confirmUrl)}" style="display: inline-block; background:#1c1c1c; color:#ffffff; font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 15px; font-weight: 500; line-height: 1; padding: 14px 24px; text-decoration: none; border-radius: 4px;">Confirmar mi suscripción</a>
              </td>
            </tr>
            <tr>
              <td style="font-family: Georgia, 'Source Serif 4', serif; font-size: 15px; line-height: 1.6; color:#3a3a3a; padding-bottom: 8px;">
                <p style="margin: 0 0 12px 0;">El enlace es válido para un solo uso. Si no confirmas, no recibirás más mensajes nuestros.</p>
                <p style="margin: 0 0 12px 0;">Si no fuiste tú quien introdujo este correo en el formulario de <a href="https://datosmexico.org" style="color:#1c1c1c; text-decoration: underline;">datosmexico.org</a>, ignora este mensaje. No hicimos nada con tu dirección.</p>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 28px; border-top: 1px solid #e5e3dc; font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.5; color:#666;">
                <p style="margin: 0 0 8px 0;">¿Por qué recibes esto? Para evitar añadir personas sin su permiso, pedimos un clic de confirmación a quien se da de alta en el boletín.</p>
                <p style="margin: 16px 0 4px 0;">
                  <a href="${escapeAttr(privacyUrl)}" style="color:#1c1c1c; text-decoration: underline;">Aviso de privacidad</a>
                  &nbsp;·&nbsp;
                  <a href="${escapeAttr(unsubscribeUrl)}" style="color:#1c1c1c; text-decoration: underline;">Darme de baja</a>
                </p>
                <p style="margin: 16px 0 0 0; color:#999;">Datos México · datosmexico.org · contacto@datosmexico.org</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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

// ------------------------------------------------------------------
// Recibo de baja
// ------------------------------------------------------------------

export function buildUnsubscribeReceiptMessage(
  payload: UnsubscribeReceiptEmail,
  from: string,
  replyTo: string,
): ResendMessage {
  const { to, privacyUrl } = payload;
  const subject = "Te dimos de baja del boletín de Datos México";

  const text = `Hola,

Confirmamos que tu correo ya no recibirá el boletín de Datos México.
No hace falta que hagas nada más.

Si esto fue un error, escríbenos a contacto@datosmexico.org y lo
revertimos.

—

Aviso de privacidad:
${privacyUrl}

Datos México
datosmexico.org
`;

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Te dimos de baja del boletín de Datos México</title>
  </head>
  <body style="margin:0; padding:0; background:#f6f5f1; font-family: Georgia, 'Source Serif 4', 'Times New Roman', serif; color:#1c1c1c;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f1; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background:#ffffff; border: 1px solid #e5e3dc; border-radius: 6px; padding: 40px 36px;">
            <tr>
              <td style="padding-bottom: 24px; border-bottom: 1px solid #e5e3dc;">
                <div style="font-family: Georgia, 'Source Serif 4', serif; font-size: 20px; line-height: 1.2; color:#1c1c1c; letter-spacing: 0.02em;">Datos México</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 28px 0; font-family: Georgia, 'Source Serif 4', serif; font-size: 17px; line-height: 1.6; color:#1c1c1c;">
                <p style="margin: 0 0 16px 0;">Hola,</p>
                <p style="margin: 0 0 16px 0;">Confirmamos que tu correo ya no recibirá el boletín de Datos México. No hace falta que hagas nada más.</p>
                <p style="margin: 0;">Si esto fue un error, escríbenos a <a href="mailto:contacto@datosmexico.org" style="color:#1c1c1c; text-decoration: underline;">contacto@datosmexico.org</a> y lo revertimos.</p>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 16px; border-top: 1px solid #e5e3dc; font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.5; color:#666;">
                <p style="margin: 0;">
                  <a href="${escapeAttr(privacyUrl)}" style="color:#1c1c1c; text-decoration: underline;">Aviso de privacidad</a>
                </p>
                <p style="margin: 16px 0 0 0; color:#999;">Datos México · datosmexico.org</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

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
    logSend("unsubscribe_receipt.skipped", { reason: "missing_api_key", to: payload.to });
    return;
  }
  const message = buildUnsubscribeReceiptMessage(
    payload,
    pickFrom(env),
    pickReplyTo(env),
  );
  const result = await sender(message, apiKey);
  if (result.kind === "sent") {
    logSend("unsubscribe_receipt.sent", { to: payload.to, resend_id: result.id });
  } else if (result.kind === "error") {
    logSend("unsubscribe_receipt.error", {
      to: payload.to,
      status: result.status,
      body: result.body.slice(0, 500),
    });
  }
}

// ------------------------------------------------------------------
// Utilidades
// ------------------------------------------------------------------

function escapeAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

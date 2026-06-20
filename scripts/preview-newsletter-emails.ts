// Genera vistas previas de los correos del observatorio para revisión
// visual antes de mergear cambios al sistema de correos.
//
// Modo offline (siempre):
//   Escribe archivos HTML en `.email-previews/` (gitignored) que
//   puedes abrir en cualquier navegador. Cada archivo es el mismo HTML
//   que Resend enviaría — sirve para iterar diseño sin gastar envíos.
//
// Modo online (opt-in):
//   Si se setean las variables RESEND_API_KEY y PREVIEW_TO_EMAIL en el
//   entorno, también re-envía los correos a esa dirección vía la API
//   de Resend. Útil para validar en clientes reales (Gmail, Apple Mail).
//
//   Uso recomendado (para no dejar la key en el historial del shell):
//
//     read -rs RESEND_API_KEY && export RESEND_API_KEY
//     export PREVIEW_TO_EMAIL="df.avila.diaz@gmail.com"
//     npm run preview:newsletter
//     unset RESEND_API_KEY PREVIEW_TO_EMAIL
//
//   Las vistas previas reales NO usan los endpoints de producción
//   (no entran a D1, no son una "alta" real). Los tokens son ficticios
//   y los enlaces apuntan a /api/newsletter/{confirm,unsubscribe}
//   con tokens-placeholder que el endpoint rechazará por inválidos —
//   eso es deseable: previa = solo para juzgar el formato.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildConfirmationMessage,
  buildUnsubscribeReceiptMessage,
  defaultResendSender,
} from "../lib/newsletter/email";
import {
  renderDivider,
  renderEmailLayout,
  renderHeading,
  renderInlineLink,
  renderLead,
  renderParagraph,
  renderSubtle,
} from "../lib/newsletter/email-layout";

const OUT_DIR = join(import.meta.dirname ?? __dirname, "..", ".email-previews");
mkdirSync(OUT_DIR, { recursive: true });

const FROM = "Datos México · Boletín <boletin@mail.datosmexico.org>";
const REPLY_TO = "contacto@datosmexico.org";
const PRIVACY_URL = "https://datosmexico.org/privacidad";

// Tokens-placeholder claramente identificables como muestra.
const SAMPLE_CONFIRM_TOKEN = "a".repeat(64);
const SAMPLE_UNSUB_TOKEN = "b".repeat(64);

const samples = {
  confirmation: buildConfirmationMessage(
    {
      to: process.env.PREVIEW_TO_EMAIL ?? "destinatario@ejemplo.org",
      confirmUrl: `https://datosmexico.org/api/newsletter/confirm?token=${SAMPLE_CONFIRM_TOKEN}`,
      unsubscribeUrl: `https://datosmexico.org/api/newsletter/unsubscribe?token=${SAMPLE_UNSUB_TOKEN}`,
      privacyUrl: PRIVACY_URL,
    },
    FROM,
    REPLY_TO,
  ),
  unsubscribeReceipt: buildUnsubscribeReceiptMessage(
    {
      to: process.env.PREVIEW_TO_EMAIL ?? "destinatario@ejemplo.org",
      privacyUrl: PRIVACY_URL,
    },
    FROM,
    REPLY_TO,
  ),
  // Muestra del boletín quincenal (Fase 4) — ilustra cómo la misma
  // plantilla base sostiene la pieza editorial. NO es producción, solo
  // un sample para validar la identidad visual.
  boletinSample: buildBoletinSampleMessage(),
};

function buildBoletinSampleMessage() {
  const bodyHtml = [
    renderHeading("Lo que ya está disponible y lo que sigue cuestionando"),
    renderLead(
      "Esta segunda entrega del boletín resume cuatro publicaciones del corpus que ahora viven en datosmexico.org y los datos que dejaron abierta una pregunta.",
    ),
    renderParagraph(
      "Esta semana publicamos dos piezas nuevas en el corpus de preguntas: una sobre la composición del SAR y otra sobre la geografía del acceso a hospital público. Ambas integran los microdatos en el cuerpo del artículo, no como anexo.",
    ),
    renderParagraph(
      `Si te interesa el método antes que el dato, te recomendamos empezar por ${renderInlineLink("https://datosmexico.org/metodologia", "/metodologia")} — el documento se actualizó la semana pasada con los criterios de errata vigentes.`,
      { html: true },
    ),
    renderDivider(),
    renderParagraph(
      "Tres lecturas externas que hicimos esta quincena y nos parecieron necesarias para entender el contexto:",
    ),
    renderParagraph(
      `· Reporte del INEGI sobre ENIGH 2024 (${renderInlineLink("https://www.inegi.org.mx/", "inegi.org.mx")}). Hay una caída en el ingreso medio del decil más bajo que no se explica con el cambio metodológico.<br>· Comunicado de la SHCP sobre la trayectoria del déficit. Lo leímos contrastándolo con los criterios del PEF.<br>· Una nota del CIDE sobre acceso a información pública. Vale la pena la sección de método.`,
      { html: true },
    ),
    renderDivider(),
    renderSubtle(
      "Próxima entrega quincenal: 4 de julio. Si quieres proponernos un dato o un tema, escríbenos a contacto@datosmexico.org.",
    ),
  ].join("\n");

  const html = renderEmailLayout({
    preheader:
      "Cuatro piezas nuevas, tres lecturas externas y la pregunta abierta de la quincena.",
    eyebrow: "Boletín · Entrega 002",
    bodyHtml,
    privacyUrl: PRIVACY_URL,
    unsubscribeUrl: `https://datosmexico.org/api/newsletter/unsubscribe?token=${SAMPLE_UNSUB_TOKEN}`,
    whyReceivingText:
      "Recibes este correo porque te suscribiste al boletín de Datos México. Si ya no quieres recibirlo, puedes darte de baja con un clic abajo.",
  });

  return {
    from: FROM,
    to: [process.env.PREVIEW_TO_EMAIL ?? "destinatario@ejemplo.org"],
    subject: "Boletín · Entrega 002 — Lo que ya está disponible",
    html,
    text:
      "Esta es una muestra del boletín quincenal de la Fase 4. La versión real se construye después de validar el sistema de correos.\n",
    reply_to: REPLY_TO,
    headers: {
      "List-Unsubscribe": `<https://datosmexico.org/api/newsletter/unsubscribe?token=${SAMPLE_UNSUB_TOKEN}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

function writeHtml(filename: string, msg: { subject: string; html: string }): void {
  // Envoltorio mínimo que ayuda a los navegadores locales (file://)
  // a aplicar el viewport correcto. El HTML del correo en sí no se
  // modifica.
  const path = join(OUT_DIR, filename);
  writeFileSync(path, msg.html);
  console.log(`  ${filename.padEnd(28)} → ${path}`);
}

async function maybeSendViaResend(label: string, msg: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
  headers?: Record<string, string>;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.PREVIEW_TO_EMAIL;
  if (!apiKey || !to) {
    return;
  }
  const messageToSend = { ...msg, to: [to] };
  const result = await defaultResendSender(messageToSend, apiKey);
  if (result.kind === "sent") {
    console.log(`  ✓ ${label}: enviado (resend_id: ${result.id})`);
  } else if (result.kind === "error") {
    console.error(
      `  ✗ ${label}: error de Resend (status ${result.status}): ${result.body.slice(0, 200)}`,
    );
  }
}

async function main(): Promise<void> {
  console.log("Generando previas en .email-previews/ …\n");
  writeHtml("01-confirmation.html", samples.confirmation);
  writeHtml("02-unsubscribe-receipt.html", samples.unsubscribeReceipt);
  writeHtml("03-boletin-sample.html", samples.boletinSample);

  console.log("\nÁbrelos en tu navegador para ver el resultado:");
  console.log(`  file://${OUT_DIR}/01-confirmation.html`);
  console.log(`  file://${OUT_DIR}/02-unsubscribe-receipt.html`);
  console.log(`  file://${OUT_DIR}/03-boletin-sample.html`);

  if (process.env.RESEND_API_KEY && process.env.PREVIEW_TO_EMAIL) {
    console.log(
      `\nRESEND_API_KEY y PREVIEW_TO_EMAIL detectados — re-enviando a ${process.env.PREVIEW_TO_EMAIL} …\n`,
    );
    await maybeSendViaResend("confirmation", samples.confirmation);
    await maybeSendViaResend("unsubscribe receipt", samples.unsubscribeReceipt);
    await maybeSendViaResend("boletin sample", samples.boletinSample);
    console.log("\nRevisa la bandeja en cliente real (Gmail recomendado).");
  } else {
    console.log(
      "\n(Sin RESEND_API_KEY + PREVIEW_TO_EMAIL — solo se generaron los HTML offline.\n" +
        " Para validar en Gmail real:\n" +
        "   read -rs RESEND_API_KEY && export RESEND_API_KEY\n" +
        "   export PREVIEW_TO_EMAIL='df.avila.diaz@gmail.com'\n" +
        "   npm run preview:newsletter\n" +
        "   unset RESEND_API_KEY PREVIEW_TO_EMAIL)",
    );
  }
}

main().catch((err) => {
  console.error("error inesperado:", err);
  process.exit(1);
});

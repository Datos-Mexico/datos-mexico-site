// Muestras de los correos del observatorio para juicio visual.
//
// Compartido entre:
//   - scripts/preview-newsletter-emails.ts (vista previa local; HTML
//     a disco y envío opcional vía Resend con la key en env local).
//   - app/api/newsletter/__preview-send/route.ts (endpoint temporal
//     que el worker invoca para enviar al Gmail del CEO usando la
//     RESEND_API_KEY ya cargada en Cloudflare — sin que la key salga
//     del entorno del worker).
//
// Los tokens son placeholders fijos y reconocibles ('a' × 64,
// 'b' × 64). Los enlaces apuntan a las páginas reales del sitio
// (/boletin/confirmacion, /boletin/baja), pero la lógica rechaza
// estos tokens con "enlace inválido" — no entra nada a D1.

import {
  renderDivider,
  renderEmailLayout,
  renderHeading,
  renderInlineLink,
  renderLead,
  renderParagraph,
  renderSubtle,
} from "./email-layout";
import {
  buildConfirmationMessage,
  buildUnsubscribeReceiptMessage,
} from "./email";

export const SAMPLE_PRIVACY_URL = "https://datosmexico.org/privacidad";
export const SAMPLE_CONFIRM_TOKEN = "a".repeat(64);
export const SAMPLE_UNSUB_TOKEN = "b".repeat(64);

const SAMPLE_FROM = "Datos México · Boletín <boletin@mail.datosmexico.org>";
const SAMPLE_REPLY_TO = "contacto@datosmexico.org";

export type SampleMessage = {
  label: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
  headers?: Record<string, string>;
};

export function buildSampleMessages(recipient: string): SampleMessage[] {
  const confirmation = buildConfirmationMessage(
    {
      to: recipient,
      confirmUrl: `https://datosmexico.org/boletin/confirmacion?token=${SAMPLE_CONFIRM_TOKEN}`,
      unsubscribeUrl: `https://datosmexico.org/boletin/baja?token=${SAMPLE_UNSUB_TOKEN}`,
      privacyUrl: SAMPLE_PRIVACY_URL,
    },
    SAMPLE_FROM,
    SAMPLE_REPLY_TO,
  );

  const unsubscribeReceipt = buildUnsubscribeReceiptMessage(
    {
      to: recipient,
      privacyUrl: SAMPLE_PRIVACY_URL,
    },
    SAMPLE_FROM,
    SAMPLE_REPLY_TO,
  );

  const boletinSample = buildBoletinSampleMessage(recipient);

  return [
    { label: "confirmation", ...confirmation },
    { label: "unsubscribe-receipt", ...unsubscribeReceipt },
    { label: "boletin-sample", ...boletinSample },
  ];
}

function buildBoletinSampleMessage(recipient: string) {
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
    privacyUrl: SAMPLE_PRIVACY_URL,
    unsubscribeUrl: `https://datosmexico.org/boletin/baja?token=${SAMPLE_UNSUB_TOKEN}`,
    whyReceivingText:
      "Recibes este correo porque te suscribiste al boletín de Datos México. Si ya no quieres recibirlo, puedes darte de baja con un clic abajo.",
  });

  return {
    from: SAMPLE_FROM,
    to: [recipient],
    subject: "Boletín · Entrega 002 — Lo que ya está disponible",
    html,
    text:
      "Esta es una muestra del boletín quincenal de la Fase 4. La versión real se construye después de validar el sistema de correos.\n",
    reply_to: SAMPLE_REPLY_TO,
    headers: {
      "List-Unsubscribe": `<https://datosmexico.org/boletin/baja?token=${SAMPLE_UNSUB_TOKEN}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

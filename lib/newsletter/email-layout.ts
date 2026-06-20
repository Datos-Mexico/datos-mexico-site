// Sistema de plantilla base para los correos del observatorio.
//
// Esta función es el fundamento visual de los tres correos del boletín:
//   1. Confirmación de suscripción (doble opt-in)
//   2. Recibo de baja
//   3. Boletín quincenal (Fase 4 — heredará esta plantilla)
//
// Decisiones de diseño:
//
//   - Layout en tablas y CSS inline: requisito para Outlook y muchos
//     clientes corporativos que ignoran <style> en <head>.
//   - Ancho máximo 600px (canónico para correo). Padding interno 32px.
//   - Tipografía sin web fonts: Georgia (serif) + system sans. Cualquier
//     cliente las tiene. Las web fonts del sitio (Source Serif 4 / Inter)
//     no cargan de forma fiable en correo.
//   - Paleta tomada de `lib/design-tokens.ts`: misma identidad que el sitio.
//   - Logo como PNG (servido desde /brand/logo-email{,@2x}.png). El header
//     se mantiene legible aunque el cliente bloquee imágenes — la primera
//     línea es texto: "Datos México" + tagline.
//   - `color-scheme: light` y `supported-color-schemes: light` declaran
//     que el correo está diseñado para claro y evitan inversiones agresivas
//     de los modos oscuros de Apple Mail / Outlook iOS.
//   - Preheader: línea oculta que los clientes muestran en el inbox como
//     vista previa. Crítico para una primera impresión clara.

import { brand } from "@/lib/design-tokens";

const SITE_URL = `https://${brand.domain}`;

export const EMAIL_PALETTE = {
  pageBg: "#F5F5F4",          // muted — el fondo fuera del card
  cardBg: "#FFFFFF",           // card central
  border: "#E7E5E4",           // border tokens
  brandRule: "#15803D",        // primary — la línea fina superior
  foreground: "#0A0A0A",       // foreground — texto principal
  text: "#1F2937",             // text
  textSubtle: "#4B5563",       // textSubtle — texto secundario
  footerText: "#6B7280",       // gris ligeramente más claro para el pie
  link: "#15803D",             // primary — links en el cuerpo
} as const;

export const EMAIL_FONTS = {
  // Stack serif: Georgia es universal. Source Serif 4 está como hint
  // por si algún cliente lo tuviera instalado.
  //
  // Comillas simples adentro porque estos strings se inyectan dentro
  // de atributos style="..." (con comillas dobles); usar dobles aquí
  // truncaría el atributo en clientes estrictos.
  serif:
    "Georgia, 'Source Serif 4', 'Times New Roman', Times, serif",
  sans:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const;

export type EmailLayoutInput = {
  // Vista previa en inbox (línea oculta que muchos clientes muestran).
  // Mantener corta — ~90 caracteres caben en la vista previa.
  preheader: string;
  // Etiqueta corta en el header bajo el logo (e.g. "Confirmación de
  // suscripción", "Boletín 003 — Octubre"). Opcional.
  eyebrow?: string;
  // Cuerpo HTML del correo. Usar los helpers `renderParagraph`,
  // `renderButton`, `renderDivider`, `renderHeading` para mantener
  // consistencia tipográfica.
  bodyHtml: string;
  // URLs del pie. Si `unsubscribeUrl` es undefined, el bloque de baja
  // se omite (e.g. en el recibo de baja, ya no aplica).
  privacyUrl: string;
  unsubscribeUrl?: string;
  // Texto a mostrar en el pie sobre por qué la persona recibe el correo.
  // Permite que cada plantilla aporte su contexto específico.
  whyReceivingText?: string;
};

export function renderEmailLayout(input: EmailLayoutInput): string {
  const {
    preheader,
    eyebrow,
    bodyHtml,
    privacyUrl,
    unsubscribeUrl,
    whyReceivingText,
  } = input;

  const logoUrl = `${SITE_URL}/brand/logo-email.png`;
  const logoUrl2x = `${SITE_URL}/brand/logo-email@2x.png`;

  return `<!doctype html>
<html lang="es" dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Datos México</title>
    <style>
      /* Reset mínimo aplicable; los clientes que respetan <style> lo usan;
         los que no, caen al CSS inline más abajo. */
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
      img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
      a { text-decoration: none; }
      /* Móvil: el card respeta el viewport. */
      @media only screen and (max-width: 620px) {
        .email-card { width: 100% !important; }
        .email-padded { padding-left: 24px !important; padding-right: 24px !important; }
        .email-cta { width: 100% !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background:${EMAIL_PALETTE.pageBg}; color:${EMAIL_PALETTE.text}; font-family:${EMAIL_FONTS.sans};">
    <!-- Preheader: oculto visualmente, visible en la vista previa del inbox. -->
    <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; visibility:hidden; opacity:0; color:transparent; height:0; width:0;">
      ${escapeHtml(preheader)}
      <!-- Espacios invisibles que evitan que el cuerpo se cuele en la vista previa. -->
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${EMAIL_PALETTE.pageBg};">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <!-- Card central -->
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="email-card" style="width:600px; max-width:600px; background:${EMAIL_PALETTE.cardBg}; border:1px solid ${EMAIL_PALETTE.border}; border-radius:8px; overflow:hidden;">

            <!-- Filete verde superior — marca de identidad. 4px de altura. -->
            <tr>
              <td style="background:${EMAIL_PALETTE.brandRule}; height:4px; line-height:4px; font-size:0;">&nbsp;</td>
            </tr>

            <!-- Header con logo + wordmark + tagline. -->
            <tr>
              <td class="email-padded" style="padding: 32px 40px 24px 40px; border-bottom:1px solid ${EMAIL_PALETTE.border};">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td valign="middle" style="padding-right:16px; width:64px;">
                      <a href="${escapeAttr(SITE_URL)}" style="text-decoration:none; border:0;">
                        <img src="${escapeAttr(logoUrl)}" srcset="${escapeAttr(logoUrl)} 1x, ${escapeAttr(logoUrl2x)} 2x" width="64" height="48" alt="" style="display:block; width:64px; height:48px; border:0;">
                      </a>
                    </td>
                    <td valign="middle" style="font-family:${EMAIL_FONTS.serif}; color:${EMAIL_PALETTE.foreground};">
                      <a href="${escapeAttr(SITE_URL)}" style="color:${EMAIL_PALETTE.foreground}; text-decoration:none;">
                        <div style="font-size:22px; line-height:1.15; font-weight:700; letter-spacing:-0.01em;">Datos México</div>
                      </a>
                      <div style="margin-top:4px; font-family:${EMAIL_FONTS.sans}; font-size:12px; line-height:1.4; color:${EMAIL_PALETTE.textSubtle}; text-transform:uppercase; letter-spacing:0.08em;">${escapeHtml(brand.shortTagline)}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            ${
              eyebrow
                ? `<!-- Eyebrow: etiqueta de la pieza. -->
            <tr>
              <td class="email-padded" style="padding: 24px 40px 0 40px;">
                <div style="font-family:${EMAIL_FONTS.sans}; font-size:11px; line-height:1.4; color:${EMAIL_PALETTE.textSubtle}; text-transform:uppercase; letter-spacing:0.12em; font-weight:600;">${escapeHtml(eyebrow)}</div>
              </td>
            </tr>`
                : ""
            }

            <!-- Cuerpo del correo (cada plantilla aporta el HTML). -->
            <tr>
              <td class="email-padded" style="padding: 24px 40px 32px 40px; font-family:${EMAIL_FONTS.serif}; color:${EMAIL_PALETTE.text}; font-size:17px; line-height:1.65;">
                ${bodyHtml}
              </td>
            </tr>

            <!-- Pie. -->
            <tr>
              <td class="email-padded" style="padding: 24px 40px 32px 40px; background:#FAFAF9; border-top:1px solid ${EMAIL_PALETTE.border}; font-family:${EMAIL_FONTS.sans}; font-size:13px; line-height:1.55; color:${EMAIL_PALETTE.footerText};">
                ${
                  whyReceivingText
                    ? `<p style="margin:0 0 12px 0; color:${EMAIL_PALETTE.footerText};">${escapeHtml(whyReceivingText)}</p>`
                    : ""
                }
                <p style="margin:0 0 12px 0;">
                  <a href="${escapeAttr(privacyUrl)}" style="color:${EMAIL_PALETTE.foreground}; text-decoration:underline;">Aviso de privacidad</a>${
                    unsubscribeUrl
                      ? `&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${escapeAttr(unsubscribeUrl)}" style="color:${EMAIL_PALETTE.foreground}; text-decoration:underline;">Darme de baja</a>`
                      : ""
                  }
                </p>
                <p style="margin:0; color:${EMAIL_PALETTE.footerText};">
                  <strong style="color:${EMAIL_PALETTE.foreground}; font-weight:600;">Datos México</strong><br>
                  Observatorio académico independiente.<br>
                  <a href="${escapeAttr(SITE_URL)}" style="color:${EMAIL_PALETTE.foreground}; text-decoration:underline;">datosmexico.org</a>
                  &nbsp;·&nbsp;
                  <a href="mailto:contacto@datosmexico.org" style="color:${EMAIL_PALETTE.foreground}; text-decoration:underline;">contacto@datosmexico.org</a>
                </p>
              </td>
            </tr>
          </table>
          <!-- Microcopy bajo el card -->
          <div style="margin-top:16px; font-family:${EMAIL_FONTS.sans}; font-size:11px; line-height:1.5; color:${EMAIL_PALETTE.footerText};">
            ${escapeHtml(brand.name)} · ${escapeHtml(brand.domain)}
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers de composición del cuerpo
// ─────────────────────────────────────────────────────────────────────────

export function renderHeading(text: string): string {
  return `<h1 style="margin:0 0 16px 0; font-family:${EMAIL_FONTS.serif}; font-size:28px; line-height:1.2; font-weight:700; letter-spacing:-0.01em; color:${EMAIL_PALETTE.foreground};">${escapeHtml(text)}</h1>`;
}

export function renderLead(text: string): string {
  return `<p style="margin:0 0 20px 0; font-family:${EMAIL_FONTS.serif}; font-size:19px; line-height:1.55; color:${EMAIL_PALETTE.foreground};">${escapeHtml(text)}</p>`;
}

export function renderParagraph(textOrHtml: string, opts?: { html?: boolean }): string {
  const content = opts?.html ? textOrHtml : escapeHtml(textOrHtml);
  return `<p style="margin:0 0 16px 0; font-family:${EMAIL_FONTS.serif}; font-size:17px; line-height:1.65; color:${EMAIL_PALETTE.text};">${content}</p>`;
}

export function renderSubtle(text: string): string {
  return `<p style="margin:0 0 16px 0; font-family:${EMAIL_FONTS.sans}; font-size:14px; line-height:1.55; color:${EMAIL_PALETTE.textSubtle};">${escapeHtml(text)}</p>`;
}

export function renderButton(args: { href: string; label: string }): string {
  // Botón "bulletproof" para correo: tabla + padding generoso. Funciona
  // en Outlook (que ignora border-radius en muchas versiones — degrada
  // a rectángulo limpio).
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 8px 0 24px 0;">
    <tr>
      <td align="center" bgcolor="${EMAIL_PALETTE.foreground}" style="background:${EMAIL_PALETTE.foreground}; border-radius:6px;">
        <a href="${escapeAttr(args.href)}" class="email-cta" style="display:inline-block; font-family:${EMAIL_FONTS.sans}; font-size:15px; font-weight:600; line-height:1; color:#FFFFFF; text-decoration:none; padding:14px 28px; border-radius:6px;">${escapeHtml(args.label)}</a>
      </td>
    </tr>
  </table>`;
}

export function renderDivider(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:8px 0 24px 0;"><tr><td style="border-top:1px solid ${EMAIL_PALETTE.border}; line-height:1px; font-size:0;">&nbsp;</td></tr></table>`;
}

export function renderInlineLink(href: string, label: string): string {
  return `<a href="${escapeAttr(href)}" style="color:${EMAIL_PALETTE.link}; text-decoration:underline;">${escapeHtml(label)}</a>`;
}

// ─────────────────────────────────────────────────────────────────────────
// Utilidades de escape
// ─────────────────────────────────────────────────────────────────────────

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function escapeAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Genera vistas previas locales de los correos del observatorio en
// archivos HTML, para juicio visual sin gastar envíos ni depender
// del worker desplegado.
//
// Los HTML generados embeben el PNG del logo como `data:` URL leída
// del propio repo (`public/brand/logo-email@2x.png`). Eso garantiza
// que el navegador local renderiza con la versión del PNG que está
// en esta rama — no la cacheada por el bucket de assets del worker
// en producción. Útil para juzgar cambios en el asset (e.g. fondo
// transparente del logo) antes de mergear.
//
// Modo opcional con envío vía Resend (key local en env):
//
//   read -rs RESEND_API_KEY && export RESEND_API_KEY
//   export PREVIEW_TO_EMAIL='df.avila.diaz@gmail.com'
//   npm run preview:newsletter
//   unset RESEND_API_KEY PREVIEW_TO_EMAIL
//
// Para juicios visuales puntuales que necesiten la key del worker
// sin sacarla del secret de Cloudflare, se puede stand-up un endpoint
// temporal en una rama (ver historial: PR #30 introdujo
// `/api/newsletter/preview-send`; PR de cleanup lo retiró tras la
// prueba). Volver a montarlo si hace falta otra ronda.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { defaultResendSender } from "../lib/newsletter/email";
import { buildSampleMessages } from "../lib/newsletter/samples";

const ROOT = join(import.meta.dirname ?? __dirname, "..");
const OUT_DIR = join(ROOT, ".email-previews");
mkdirSync(OUT_DIR, { recursive: true });

const recipient = process.env.PREVIEW_TO_EMAIL ?? "destinatario@ejemplo.org";
const samples = buildSampleMessages(recipient);

// Embebe el PNG local del logo como data URL para que la previa
// offline rinda EXACTAMENTE el asset del repo, no el cacheado en
// producción. Solo aplica al HTML escrito a disco; los correos que
// se envían vía Resend siguen usando la URL pública.
function readLogoAsDataUrl(filename: string): string {
  const buf = readFileSync(join(ROOT, "public", "brand", filename));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const LOGO_PUBLIC_URL_1X = "https://datosmexico.org/brand/logo-email.png";
const LOGO_PUBLIC_URL_2X = "https://datosmexico.org/brand/logo-email@2x.png";
const LOGO_DATA_URL_1X = readLogoAsDataUrl("logo-email.png");
const LOGO_DATA_URL_2X = readLogoAsDataUrl("logo-email@2x.png");

function htmlForLocalPreview(html: string): string {
  return html
    .replaceAll(LOGO_PUBLIC_URL_2X, LOGO_DATA_URL_2X)
    .replaceAll(LOGO_PUBLIC_URL_1X, LOGO_DATA_URL_1X);
}

function writeHtml(filename: string, msg: { subject: string; html: string }): void {
  const path = join(OUT_DIR, filename);
  writeFileSync(path, htmlForLocalPreview(msg.html));
  console.log(`  ${filename.padEnd(28)} → ${path}`);
}

async function maybeSendViaResend(msg: (typeof samples)[number]): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.PREVIEW_TO_EMAIL;
  if (!apiKey || !to) {
    return;
  }
  // El envío real usa el HTML original (con URL pública del PNG)
  // porque Gmail/Apple Mail cargan la imagen vía red — no necesita
  // data URL (y los clientes de correo en general no la respetan).
  const result = await defaultResendSender({ ...msg, to: [to] }, apiKey);
  if (result.kind === "sent") {
    console.log(`  ✓ ${msg.label}: enviado (resend_id: ${result.id})`);
  } else if (result.kind === "error") {
    console.error(
      `  ✗ ${msg.label}: error de Resend (status ${result.status}): ${result.body.slice(0, 200)}`,
    );
  }
}

async function main(): Promise<void> {
  console.log("Generando previas en .email-previews/ (logo embebido como data URL) …\n");
  const filenames = [
    "01-confirmation.html",
    "02-unsubscribe-receipt.html",
    "03-boletin-sample.html",
  ];
  samples.forEach((msg, i) => writeHtml(filenames[i]!, msg));

  console.log("\nÁbrelos en tu navegador para ver el resultado:");
  for (const name of filenames) {
    console.log(`  file://${OUT_DIR}/${name}`);
  }

  if (process.env.RESEND_API_KEY && process.env.PREVIEW_TO_EMAIL) {
    console.log(
      `\nRESEND_API_KEY y PREVIEW_TO_EMAIL detectados — re-enviando a ${process.env.PREVIEW_TO_EMAIL} …\n`,
    );
    for (const msg of samples) {
      await maybeSendViaResend(msg);
    }
    console.log("\nRevisa la bandeja en cliente real (Gmail recomendado).");
  } else {
    console.log(
      "\n(HTML offline con el PNG embebido — rinde fiel al asset del repo.\n" +
        " Para validar también en Gmail real, exporta RESEND_API_KEY y\n" +
        " PREVIEW_TO_EMAIL antes de correr el script — ver cabecera.)",
    );
  }
}

main().catch((err) => {
  console.error("error inesperado:", err);
  process.exit(1);
});

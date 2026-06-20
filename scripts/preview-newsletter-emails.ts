// Genera vistas previas locales de los correos del observatorio en
// archivos HTML, para juicio visual sin gastar envíos.
//
// Modo opcional con envío vía Resend (key local):
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

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { defaultResendSender } from "../lib/newsletter/email";
import { buildSampleMessages } from "../lib/newsletter/samples";

const OUT_DIR = join(import.meta.dirname ?? __dirname, "..", ".email-previews");
mkdirSync(OUT_DIR, { recursive: true });

const recipient = process.env.PREVIEW_TO_EMAIL ?? "destinatario@ejemplo.org";
const samples = buildSampleMessages(recipient);

function writeHtml(filename: string, msg: { subject: string; html: string }): void {
  const path = join(OUT_DIR, filename);
  writeFileSync(path, msg.html);
  console.log(`  ${filename.padEnd(28)} → ${path}`);
}

async function maybeSendViaResend(msg: (typeof samples)[number]): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.PREVIEW_TO_EMAIL;
  if (!apiKey || !to) {
    return;
  }
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
  console.log("Generando previas en .email-previews/ …\n");
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
      "\n(Solo se generaron los HTML offline.\n" +
        " Para ver en Gmail real, exporta RESEND_API_KEY + PREVIEW_TO_EMAIL\n" +
        " temporalmente — ver instrucciones al inicio del script.)",
    );
  }
}

main().catch((err) => {
  console.error("error inesperado:", err);
  process.exit(1);
});

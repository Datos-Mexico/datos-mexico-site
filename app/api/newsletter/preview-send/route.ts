// Endpoint TEMPORAL para validar el sistema de correos en un cliente
// real (Gmail), sin que el secret RESEND_API_KEY salga del entorno
// del worker.
//
// Diseño defensivo:
//   - Destinatario HARDCODED al correo personal del CEO. No acepta
//     query params ni body — no es un vector de envío arbitrario.
//   - Sin escritura a D1: usa los samples con tokens placeholder
//     que los handlers reales rechazan con 400.
//   - GET (lectura idempotente desde la perspectiva del cliente).
//   - Vive solo durante la prueba de juicio visual del rediseño;
//     se elimina en un PR de seguimiento inmediato.
//
// Daño máximo si alguien externo descubriera el path: spam de los
// 3 correos hacia el buzón del CEO (única dirección autorizada) y
// consumo de la cuota gratuita de Resend. La vida del endpoint es
// de horas, no de semanas.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { defaultResendSender } from "@/lib/newsletter/email";
import { buildSampleMessages } from "@/lib/newsletter/samples";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hardcoded — único destinatario permitido. Cambiar requiere PR.
const PREVIEW_RECIPIENT = "df.avila.diaz@gmail.com";

export async function GET(): Promise<Response> {
  const { env } = await getCloudflareContext({ async: true });
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ ok: false, error: "resend_api_key_missing" }),
      { status: 503, headers: { "content-type": "application/json; charset=utf-8" } },
    );
  }

  const from = env.NEWSLETTER_FROM?.trim() ||
    "Datos México · Boletín <boletin@mail.datosmexico.org>";
  const samples = buildSampleMessages(PREVIEW_RECIPIENT).map((m) => ({
    ...m,
    from,
  }));

  const results: { label: string; result: string; status?: number; id?: string }[] = [];
  for (const msg of samples) {
    const r = await defaultResendSender(msg, apiKey);
    if (r.kind === "sent") {
      results.push({ label: msg.label, result: "sent", id: r.id });
    } else if (r.kind === "error") {
      results.push({ label: msg.label, result: "error", status: r.status });
    } else {
      results.push({ label: msg.label, result: "skipped" });
    }
  }

  const allOk = results.every((r) => r.result === "sent");
  return new Response(
    JSON.stringify({
      ok: allOk,
      recipient: PREVIEW_RECIPIENT,
      results,
      note: "Endpoint temporal de juicio visual. Sin escritura a D1. Será removido en un PR de seguimiento.",
    }),
    { status: 200, headers: { "content-type": "application/json; charset=utf-8" } },
  );
}

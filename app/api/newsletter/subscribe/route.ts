import { getCloudflareContext } from "@opennextjs/cloudflare";
import { handleSubscribe } from "@/lib/newsletter/handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// DESACTIVADO en el formulario público: NewsletterForm.tsx sigue usando
// `defaultSimulatedSubmit`. Esta ruta existe y funciona contra D1, pero
// no se enchufa a la UI hasta que Resend esté montado.
export async function POST(request: Request): Promise<Response> {
  const { env } = await getCloudflareContext({ async: true });
  const db = env.NEWSLETTER_DB;
  if (!db) {
    return new Response(
      JSON.stringify({ ok: false, error: "binding_no_configurado" }),
      { status: 503, headers: { "content-type": "application/json; charset=utf-8" } },
    );
  }
  return handleSubscribe(db, request);
}

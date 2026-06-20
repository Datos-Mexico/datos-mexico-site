import { getCloudflareContext } from "@opennextjs/cloudflare";
import { handleUnsubscribe } from "@/lib/newsletter/handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const { env } = await getCloudflareContext({ async: true });
  const db = env.NEWSLETTER_DB;
  if (!db) {
    return new Response(
      JSON.stringify({ ok: false, error: "binding_no_configurado" }),
      { status: 503, headers: { "content-type": "application/json; charset=utf-8" } },
    );
  }
  return handleUnsubscribe(db, env, request);
}

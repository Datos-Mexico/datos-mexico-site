/**
 * Verifica el estado real del deploy de Cloudflare Workers Builds para un
 * commit. Reemplaza el patrón frágil de "curl al sitio y mirar el HTML",
 * que produce falsos positivos cuando el build aún no termina (los builds
 * típicos tardan 3-7 minutos; un curl prematuro ve la versión anterior y
 * declara "colgado" cuando en realidad el deploy está en vuelo).
 *
 * Lee la GitHub Checks API y distingue cuatro estados:
 *
 *   1) DESPLEGADO   check-run con conclusion=success.
 *   2) EN CURSO     check-suite creado, aún sin conclusión, dentro del
 *                   umbral razonable (<15 min).
 *   3) COLGADO      check-suite en "queued" sin check-run después del
 *                   umbral — el patrón observado en el PR #19, fallo
 *                   transitorio del scheduler de Cloudflare.
 *   4) FALLÓ        check-run con conclusion=failure (o cancelled, etc.).
 *
 * USO
 *   npm run check:deploy            # verifica el HEAD actual de main (origin)
 *   npm run check:deploy -- <sha>   # verifica un commit específico
 *   npx tsx scripts/check-deploy.ts <sha>
 *
 * REQUISITO
 *   El comando `gh` (GitHub CLI) debe estar instalado y autenticado contra
 *   el repo. Es la misma herramienta que usamos para abrir PRs.
 *
 * VARIABLES DE ENTORNO
 *   DEPLOY_STUCK_MINUTES    Umbral en minutos para declarar "colgado".
 *                           Default 15. Solo aplica cuando NO hay check-run
 *                           y el check-suite lleva ≥ este tiempo en queued.
 *   DEPLOY_REPO             Owner/repo. Default "Datos-Mexico/datos-mexico-site".
 *
 * SALIDA
 *   Exit 0 si está DESPLEGADO o EN CURSO (estados normales).
 *   Exit 2 si está COLGADO o FALLÓ (requiere acción humana).
 *   Exit 1 si hubo error consultando la API (problema del entorno, no del deploy).
 *
 * NO se integra en prebuild/CI — esto es una herramienta de verificación
 * post-merge, a demanda. El equipo la corre después de mergear un PR.
 */

import { execFileSync } from "node:child_process";

const REPO = process.env.DEPLOY_REPO ?? "Datos-Mexico/datos-mexico-site";
const STUCK_MIN = Number(process.env.DEPLOY_STUCK_MINUTES ?? 15);
const CLOUDFLARE_APP_SLUG = "cloudflare-workers-and-pages";

type CheckRun = {
  id: number;
  name: string;
  status: "queued" | "in_progress" | "completed";
  conclusion:
    | "success"
    | "failure"
    | "neutral"
    | "cancelled"
    | "skipped"
    | "timed_out"
    | "action_required"
    | null;
  started_at: string | null;
  completed_at: string | null;
  details_url: string | null;
  output: { summary: string | null } | null;
  app: { slug: string } | null;
};

type CheckSuite = {
  id: number;
  status: "queued" | "in_progress" | "completed" | "pending" | null;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  app: { slug: string } | null;
};

function ghApi<T>(path: string): T {
  try {
    const out = execFileSync("gh", ["api", path], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return JSON.parse(out) as T;
  } catch (err) {
    const e = err as { stderr?: Buffer | string; message: string };
    const stderr = e.stderr
      ? typeof e.stderr === "string"
        ? e.stderr
        : e.stderr.toString()
      : "";
    throw new Error(
      `gh api ${path} falló:\n${stderr || e.message}`.trim(),
    );
  }
}

function resolveSha(arg: string | undefined): string {
  if (arg && /^[0-9a-f]{7,40}$/i.test(arg)) return arg;
  // HEAD actual de main según el remote
  const data = ghApi<{ sha: string }>(`repos/${REPO}/commits/main`);
  return data.sha;
}

function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

function getCommitSubject(sha: string): string {
  try {
    const data = ghApi<{ commit: { message: string } }>(
      `repos/${REPO}/commits/${sha}`,
    );
    return data.commit.message.split("\n")[0];
  } catch {
    return "(no se pudo leer el subject)";
  }
}

function parseIso(s: string | null): Date | null {
  return s ? new Date(s) : null;
}

function minutesBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 60_000);
}

function extractVersionId(summary: string | null): string | undefined {
  if (!summary) return undefined;
  const m = summary.match(/Version ID:\s*([0-9a-f-]+)/i);
  return m?.[1];
}

function findCloudflareCheckRun(sha: string): CheckRun | null {
  const data = ghApi<{ check_runs: CheckRun[] }>(
    `repos/${REPO}/commits/${sha}/check-runs`,
  );
  const runs = data.check_runs.filter(
    (r) => r.app?.slug === CLOUDFLARE_APP_SLUG,
  );
  if (runs.length === 0) return null;
  // El más reciente — si hubiera retries.
  return runs.sort((a, b) => (b.started_at ?? "").localeCompare(a.started_at ?? ""))[0];
}

function findCloudflareCheckSuite(sha: string): CheckSuite | null {
  const data = ghApi<{ check_suites: CheckSuite[] }>(
    `repos/${REPO}/commits/${sha}/check-suites`,
  );
  const suites = data.check_suites.filter(
    (s) => s.app?.slug === CLOUDFLARE_APP_SLUG,
  );
  if (suites.length === 0) return null;
  return suites.sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
}

function reportDeployed(run: CheckRun, suite: CheckSuite): void {
  const completed = parseIso(run.completed_at);
  const suiteCreated = parseIso(suite.created_at);
  const versionId = extractVersionId(run.output?.summary ?? null);
  console.log("Estado: ✓ DESPLEGADO");
  if (run.conclusion && run.conclusion !== "success") {
    console.log(`Conclusión: ${run.conclusion}`);
  }
  if (suiteCreated) console.log(`Push recibido: ${suiteCreated.toISOString()}`);
  if (completed) console.log(`Versión viva:  ${completed.toISOString()}`);
  if (suiteCreated && completed) {
    const minutes = minutesBetween(suiteCreated, completed);
    // El build real de Cloudflare suele tardar 3-7 min. La API reporta
    // started_at == completed_at en el check-run, por eso medimos
    // suite.created_at → run.completed_at (tiempo desde push hasta vivo).
    console.log(`Tiempo total:  ${minutes} min (push → versión publicada)`);
  }
  if (versionId) console.log(`Versión ID:    ${versionId}`);
  if (run.details_url) console.log(`Detalle:       ${run.details_url}`);
  console.log("");
  console.log(
    "Acción: ninguna — el sitio se sirve con esta versión. Confirma en navegador si quieres ver una sección puntual.",
  );
}

function reportInProgress(
  suite: CheckSuite,
  run: CheckRun | null,
  ageMin: number,
): void {
  console.log("Estado: ⏳ EN CURSO");
  console.log(
    `El deploy está en vuelo (lleva ${ageMin} min desde que Cloudflare recibió el evento).`,
  );
  if (run) {
    console.log(`Estado check-run: ${run.status}`);
    if (run.started_at) console.log(`Inició: ${run.started_at}`);
    if (run.details_url) console.log(`Detalle: ${run.details_url}`);
  } else {
    console.log(
      `Check-suite creado a ${suite.created_at}; el runner aún no recoge el trabajo (esto es normal en los primeros minutos).`,
    );
  }
  const remaining = Math.max(0, STUCK_MIN - ageMin);
  console.log("");
  console.log(
    `Acción: espera ~${remaining} min más antes de declarar "colgado". Re-ejecuta este script para refrescar.`,
  );
}

function reportStuck(suite: CheckSuite, ageMin: number): void {
  console.log("Estado: ⚠️  COLGADO");
  console.log(
    `El check-suite lleva ${ageMin} min en "queued" sin que un check-run arrancara (umbral: ${STUCK_MIN} min).`,
  );
  console.log("");
  console.log(
    "Este es el patrón del PR #19 — Cloudflare aceptó el evento push pero el",
  );
  console.log(
    "runner nunca lo recogió. Es fallo transitorio de Cloudflare, no del repo.",
  );
  console.log("");
  console.log("Acción — dos opciones:");
  console.log(
    "  1. Re-disparar con commit vacío:",
  );
  console.log(
    "       git checkout main && git pull",
  );
  console.log(
    "       git commit --allow-empty -m \"chore: re-disparar deploy\"",
  );
  console.log(
    "       (luego push y mergea por GitHub, como cualquier otro PR)",
  );
  console.log(
    "  2. Trigger manual desde el dashboard de Cloudflare:",
  );
  console.log(
    "       dash.cloudflare.com → Workers → datosmexico → Builds → Retry",
  );
  console.log("");
  console.log(`check-suite id: ${suite.id}`);
}

function reportFailed(run: CheckRun): void {
  console.log("Estado: ✗ BUILD FALLÓ");
  console.log(`Conclusión: ${run.conclusion}`);
  if (run.started_at) console.log(`Inició:  ${run.started_at}`);
  if (run.completed_at) console.log(`Terminó: ${run.completed_at}`);
  if (run.details_url) console.log(`Detalle: ${run.details_url}`);
  console.log("");
  console.log(
    "Acción: abrir los logs en el dashboard de Cloudflare (link arriba) y revisar qué",
  );
  console.log(
    "rompió. Suele ser typecheck, lint o un script de prebuild que falla. Una vez",
  );
  console.log(
    "arreglado en el código y mergeado, el siguiente commit re-dispara el deploy.",
  );
}

function reportNoEvent(sha: string): void {
  console.log("Estado: ⚠️  SIN EVENTO");
  console.log(
    "No hay check-suite de Cloudflare para este commit. Esto puede significar:",
  );
  console.log("  - El push acaba de ocurrir (espera 30-60 s y reintenta).");
  console.log(
    "  - Cloudflare no recibió el evento (raro; revisar la GitHub App).",
  );
  console.log(
    "  - El commit no está en una rama que dispare Workers Builds (¿es main?).",
  );
  console.log("");
  console.log(`commit consultado: ${sha}`);
}

function main(): number {
  const argSha = process.argv[2];
  const sha = resolveSha(argSha);
  const subject = getCommitSubject(sha);

  console.log(`Verificando deploy de ${shortSha(sha)} ("${subject}") ...`);
  console.log("");

  const suite = findCloudflareCheckSuite(sha);
  if (!suite) {
    reportNoEvent(sha);
    return 2;
  }

  const run = findCloudflareCheckRun(sha);
  const now = new Date();
  const suiteCreated = parseIso(suite.created_at) ?? now;
  const ageMin = minutesBetween(suiteCreated, now);

  if (run && run.status === "completed") {
    if (run.conclusion === "success") {
      reportDeployed(run, suite);
      return 0;
    }
    reportFailed(run);
    return 2;
  }

  // No hay check-run completo todavía.
  if (ageMin < STUCK_MIN) {
    reportInProgress(suite, run, ageMin);
    return 0;
  }

  // Pasó el umbral sin completarse.
  if (!run) {
    reportStuck(suite, ageMin);
    return 2;
  }

  // Hay run pero no terminó después del umbral — caso intermedio.
  console.log("Estado: ⚠️  EN CURSO MÁS DE LO ESPERADO");
  console.log(
    `El check-run existe (${run.status}) pero lleva ${ageMin} min sin terminar (umbral ${STUCK_MIN}).`,
  );
  if (run.details_url) console.log(`Detalle: ${run.details_url}`);
  console.log("");
  console.log(
    "Acción: abrir el detalle en Cloudflare. Si el build sigue corriendo y no hay error, esperar; si está atorado, cancelar y re-disparar.",
  );
  return 2;
}

try {
  process.exit(main());
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("Error consultando GitHub API:");
  console.error(msg);
  console.error("");
  console.error(
    "Verifica: (a) que `gh` está autenticado (`gh auth status`), (b) que el SHA existe en el repo, (c) que tienes red.",
  );
  process.exit(1);
}

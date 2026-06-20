// Validación end-to-end contra el D1 REMOTO en producción.
//
// Implementa un adaptador `D1Database` que reenvía cada llamada
// `prepare().bind().run|first|all()` a `wrangler d1 execute --remote`.
// De esa forma los handlers de las rutas (los mismos que se compilan
// para producción) se ejecutan contra la base real, no una imitación.
//
// El script:
//   1. limpia residuos previos (DELETE FROM subscribers)
//   2. ejecuta el flujo doble opt-in: alta, duplicado, reissue,
//      confirmación, re-uso, baja, idempotencia, baja previa que no
//      se re-suscribe, inputs inválidos
//   3. limpia al terminar — la BD remota queda VACÍA
//
// Latencia esperada: ~500–800ms por query D1 remoto. El test corre
// la docena de queries en ~10–20s.

import { spawnSync } from "node:child_process";

import type { EmailEnv } from "../lib/newsletter/email";
import { handleConfirm, handleSubscribe, handleUnsubscribe } from "../lib/newsletter/handlers";

const DB_NAME = "datosmexico-newsletter";

type D1ExecuteResult = {
  results?: Record<string, unknown>[];
  success?: boolean;
  meta?: Record<string, unknown>;
}[];

function shellQuery(sql: string, bindings: unknown[]): D1ExecuteResult[0] {
  // wrangler d1 execute --json --command sustituye los placeholders
  // por las JSON-serializables que pasemos por --param. Como el CLI
  // no acepta múltiples --param ?N de forma estable, hacemos el bind
  // a mano: reemplazamos ?N por literales SQL serializados.
  //
  // Es seguro porque los valores que pasamos son siempre o (a)
  // strings producidos por nosotros (correos, tokens hex, ISO8601) o
  // (b) números (id). Cualquier comilla en el correo se escapa con
  // SQL standard ('').
  let bound = sql;
  for (let i = bindings.length - 1; i >= 0; i--) {
    const v = bindings[i];
    let literal: string;
    if (v === null || v === undefined) {
      literal = "NULL";
    } else if (typeof v === "number") {
      if (!Number.isFinite(v)) {
        throw new Error(`binding numérico no finito: ${v}`);
      }
      literal = String(v);
    } else if (typeof v === "string") {
      literal = `'${v.replaceAll("'", "''")}'`;
    } else if (typeof v === "boolean") {
      literal = v ? "1" : "0";
    } else {
      throw new Error(`tipo de binding no soportado: ${typeof v}`);
    }
    bound = bound.replaceAll(`?${i + 1}`, literal);
  }
  const result = spawnSync(
    "npx",
    ["wrangler", "d1", "execute", DB_NAME, "--remote", "--json", "--command", bound],
    { encoding: "utf-8", maxBuffer: 16 * 1024 * 1024 },
  );
  const stdout = (result.stdout ?? "").toString();
  const stderr = (result.stderr ?? "").toString();
  if (result.status !== 0) {
    // Con --json, los detalles del error de D1 (incluido el mensaje
    // "UNIQUE constraint failed" o similar) vienen en stdout como JSON
    // estructurado, no en stderr. Concatenamos ambos para que el
    // mensaje del error sea propagable.
    let detail = "";
    try {
      const errPayload = JSON.parse(stdout) as {
        error?: { text?: string; notes?: { text?: string }[] };
      };
      const notes = (errPayload.error?.notes ?? [])
        .map((n) => n.text ?? "")
        .filter(Boolean)
        .join(" | ");
      detail = [errPayload.error?.text, notes].filter(Boolean).join(" — ");
    } catch {
      detail = stdout || stderr;
    }
    throw new Error(
      `wrangler d1 execute falló (status ${result.status}): ${detail}\n  SQL: ${bound}`,
    );
  }
  let parsed: D1ExecuteResult;
  try {
    parsed = JSON.parse(stdout) as D1ExecuteResult;
  } catch {
    throw new Error(
      `no se pudo parsear stdout de wrangler como JSON:\n${stdout.slice(0, 2000)}`,
    );
  }
  if (!parsed[0]) {
    throw new Error(`wrangler d1 execute devolvió array vacío para SQL: ${bound}`);
  }
  return parsed[0];
}

function adaptRemoteD1(): D1Database {
  function makeStatement(query: string) {
    let bindings: unknown[] = [];
    const api = {
      bind(...values: unknown[]) {
        bindings = values;
        return api;
      },
      async run() {
        shellQuery(query, bindings);
        return { success: true, results: [], meta: {} } as unknown as D1Result;
      },
      async first<T>(): Promise<T | null> {
        const result = shellQuery(query, bindings);
        const row = result.results?.[0];
        return (row as T | undefined) ?? null;
      },
      async all<T>() {
        const result = shellQuery(query, bindings);
        return {
          results: (result.results ?? []) as T[],
          success: true,
          meta: {},
        } as unknown as D1Result<T>;
      },
      async raw() {
        return [] as unknown[];
      },
    };
    return api;
  }
  return {
    prepare(query: string) {
      return makeStatement(query) as unknown as D1PreparedStatement;
    },
    batch() {
      throw new Error("batch not supported in shell adapter");
    },
    exec() {
      throw new Error("exec not supported in shell adapter");
    },
    dump() {
      throw new Error("dump not supported in shell adapter");
    },
    withSession() {
      throw new Error("withSession not supported in shell adapter");
    },
  } as unknown as D1Database;
}

function postJson(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function getJson(url: string): Request {
  return new Request(url, { method: "GET" });
}

const BASE = "https://datosmexico.org";

type Check = { name: string; ok: boolean; detail?: string };
const checks: Check[] = [];

function assert(name: string, condition: boolean, detail?: string): void {
  checks.push({ name, ok: condition, detail });
  const mark = condition ? "PASS" : "FAIL";
  const tail = detail ? ` — ${detail}` : "";
  process.stdout.write(`  [${mark}] ${name}${tail}\n`);
}

type SubscriberRow = {
  id: number;
  email: string;
  status: string;
  confirmation_token: string | null;
  confirmation_token_used_at: string | null;
  unsubscribe_token: string;
  created_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
};

function fetchSubscriber(email: string): SubscriberRow | null {
  const result = shellQuery(
    "SELECT * FROM subscribers WHERE email = ?1",
    [email],
  );
  return (result.results?.[0] as SubscriberRow | undefined) ?? null;
}

function rowCount(): number {
  const result = shellQuery("SELECT COUNT(*) AS c FROM subscribers", []);
  return ((result.results?.[0] as { c?: number })?.c) ?? 0;
}

async function cleanup(): Promise<void> {
  shellQuery("DELETE FROM subscribers", []);
}

const TEST_EMAIL_A = "test-flow-remote-alpha@datosmexico.org";
const TEST_EMAIL_B = "test-flow-remote-beta@datosmexico.org";

async function main(): Promise<void> {
  const db = adaptRemoteD1();
  // Env vacío: sin RESEND_API_KEY los envíos se omiten en silencio.
  const env: EmailEnv = {};

  console.log("Pre-flight: limpiando residuos previos en la BD remota...");
  await cleanup();
  assert("pre-flight: BD remota vacía", rowCount() === 0);

  // ------------------------------------------------------------------
  console.log("\n1) Alta nueva contra D1 remoto");
  let firstConfirmToken: string;
  let firstUnsubToken: string;
  {
    const res = await handleSubscribe(
      db,
      env,
      postJson(`${BASE}/api/newsletter/subscribe`, { email: TEST_EMAIL_A.toUpperCase() }),
    );
    assert("subscribe: status 200", res.status === 200, `got ${res.status}`);
    const row = fetchSubscriber(TEST_EMAIL_A);
    assert("subscribe: fila creada en BD remota", !!row);
    assert("subscribe: email normalizado", row?.email === TEST_EMAIL_A);
    assert("subscribe: status pendiente", row?.status === "pendiente");
    assert(
      "subscribe: token confirmación 64 hex",
      !!row?.confirmation_token && /^[a-f0-9]{64}$/.test(row.confirmation_token),
    );
    firstConfirmToken = row!.confirmation_token!;
    firstUnsubToken = row!.unsubscribe_token;
  }

  // ------------------------------------------------------------------
  console.log("\n2) Re-alta del mismo correo en pendiente: reissue interno");
  {
    const res = await handleSubscribe(
      db,
      env,
      postJson(`${BASE}/api/newsletter/subscribe`, { email: TEST_EMAIL_A }),
    );
    assert("re-subscribe: status 200 (idéntico)", res.status === 200);
    const row = fetchSubscriber(TEST_EMAIL_A);
    assert(
      "re-subscribe: nuevo confirmation_token",
      row?.confirmation_token !== firstConfirmToken,
    );
    assert(
      "re-subscribe: unsubscribe_token preservado",
      row?.unsubscribe_token === firstUnsubToken,
    );
    assert("re-subscribe: una sola fila", rowCount() === 1);
  }

  // ------------------------------------------------------------------
  console.log("\n3) Confirmación con token vigente");
  {
    const row = fetchSubscriber(TEST_EMAIL_A);
    const currentToken = row!.confirmation_token!;
    const res = await handleConfirm(
      db,
      getJson(`${BASE}/api/newsletter/confirm?token=${currentToken}`),
    );
    assert("confirm: status 200", res.status === 200);
    const body = (await res.clone().json()) as { kind: string };
    assert("confirm: kind=confirmed", body.kind === "confirmed");
    const after = fetchSubscriber(TEST_EMAIL_A);
    assert("confirm: status=confirmado en BD remota", after?.status === "confirmado");
    assert("confirm: confirmed_at poblado", !!after?.confirmed_at);
    assert("confirm: confirmation_token anulado", after?.confirmation_token === null);
  }

  // ------------------------------------------------------------------
  console.log("\n4) Re-uso del mismo token: indistinguible de inválido");
  {
    const res = await handleConfirm(
      db,
      getJson(`${BASE}/api/newsletter/confirm?token=${firstConfirmToken}`),
    );
    assert("confirm reuse: status 400", res.status === 400);
  }

  // ------------------------------------------------------------------
  console.log("\n5) Re-alta de correo ya confirmado: respuesta uniforme, sin reissue");
  {
    const before = fetchSubscriber(TEST_EMAIL_A);
    const res = await handleSubscribe(
      db,
      env,
      postJson(`${BASE}/api/newsletter/subscribe`, { email: TEST_EMAIL_A }),
    );
    assert("subscribe confirmed: status 200", res.status === 200);
    const after = fetchSubscriber(TEST_EMAIL_A);
    assert("subscribe confirmed: sigue confirmado", after?.status === "confirmado");
    assert(
      "subscribe confirmed: NO se re-emite confirmation_token",
      after?.confirmation_token === before?.confirmation_token,
    );
  }

  // ------------------------------------------------------------------
  console.log("\n6) Baja con token válido");
  {
    const res = await handleUnsubscribe(
      db,
      env,
      getJson(`${BASE}/api/newsletter/unsubscribe?token=${firstUnsubToken}`),
    );
    assert("unsubscribe: status 200", res.status === 200);
    const after = fetchSubscriber(TEST_EMAIL_A);
    assert("unsubscribe: status=baja en BD remota", after?.status === "baja");
    assert("unsubscribe: unsubscribed_at poblado", !!after?.unsubscribed_at);
  }

  // ------------------------------------------------------------------
  console.log("\n7) Segundo clic en link de baja: idempotente");
  {
    const res = await handleUnsubscribe(
      db,
      env,
      getJson(`${BASE}/api/newsletter/unsubscribe?token=${firstUnsubToken}`),
    );
    assert("unsubscribe twice: status 200", res.status === 200);
    const body = (await res.clone().json()) as { kind: string };
    assert("unsubscribe twice: kind=already_unsubscribed", body.kind === "already_unsubscribed");
  }

  // ------------------------------------------------------------------
  console.log("\n8) Re-alta de correo en baja: NO se re-suscribe");
  {
    const res = await handleSubscribe(
      db,
      env,
      postJson(`${BASE}/api/newsletter/subscribe`, { email: TEST_EMAIL_A }),
    );
    assert("subscribe after baja: status 200", res.status === 200);
    const after = fetchSubscriber(TEST_EMAIL_A);
    assert("subscribe after baja: sigue en baja", after?.status === "baja");
    assert(
      "subscribe after baja: confirmation_token sigue NULL",
      after?.confirmation_token === null,
    );
  }

  // ------------------------------------------------------------------
  console.log("\n9) UNIQUE(email) ejercido por D1 real");
  {
    // Alta de un segundo correo distinto
    await handleSubscribe(
      db,
      env,
      postJson(`${BASE}/api/newsletter/subscribe`, { email: TEST_EMAIL_B }),
    );
    assert("dos correos distintos coexisten", rowCount() === 2);

    // Intento manual de violar UNIQUE: debe fallar a nivel D1
    let constraintFailed = false;
    try {
      shellQuery(
        "INSERT INTO subscribers (email, status, unsubscribe_token) VALUES (?1, 'pendiente', ?2)",
        [TEST_EMAIL_B, "x".repeat(64)],
      );
    } catch (err) {
      constraintFailed =
        err instanceof Error && err.message.toLowerCase().includes("unique");
    }
    assert("UNIQUE(email) rechaza duplicado a nivel D1", constraintFailed);
  }

  // ------------------------------------------------------------------
  console.log("\n10) Validación de inputs (sin tocar la BD)");
  {
    const r1 = await handleSubscribe(
      db,
      env,
      postJson(`${BASE}/api/newsletter/subscribe`, { email: "no-es-correo" }),
    );
    assert("invalid email: status 400", r1.status === 400);

    const r2 = await handleConfirm(
      db,
      getJson(`${BASE}/api/newsletter/confirm?token=corto`),
    );
    assert("malformed confirm token: status 400", r2.status === 400);

    const r3 = await handleUnsubscribe(
      db,
      env,
      getJson(`${BASE}/api/newsletter/unsubscribe`),
    );
    assert("missing unsub token: status 400", r3.status === 400);

    const r4 = await handleConfirm(
      db,
      getJson(`${BASE}/api/newsletter/confirm?token=${"a".repeat(64)}`),
    );
    assert("nonexistent confirm token: status 400", r4.status === 400);
  }

  // ------------------------------------------------------------------
  console.log("\n11) Cleanup final: BD remota queda VACÍA");
  await cleanup();
  const count = rowCount();
  assert("BD remota queda vacía post-test", count === 0, `count=${count}`);

  // ------------------------------------------------------------------
  const failed = checks.filter((c) => !c.ok);
  console.log("\n" + "=".repeat(60));
  console.log(`Resultado contra D1 REMOTO: ${checks.length - failed.length}/${checks.length} checks pasaron.`);
  if (failed.length > 0) {
    console.log("FALLOS:");
    for (const f of failed) {
      console.log(`  - ${f.name}${f.detail ? ` (${f.detail})` : ""}`);
    }
    process.exit(1);
  }
  console.log("OK — flujo doble opt-in validado contra D1 remoto real.");
}

main().catch(async (err) => {
  console.error("\nERROR — intentando cleanup defensivo...");
  try {
    await cleanup();
    console.error("cleanup OK. BD remota vacía.");
  } catch (cleanupErr) {
    console.error("cleanup FALLÓ:", cleanupErr);
  }
  console.error(err);
  process.exit(1);
});

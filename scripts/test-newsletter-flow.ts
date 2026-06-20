// Prueba end-to-end de los endpoints del boletín contra un D1
// emulado por `node:sqlite` (mismo dialecto SQL, mismas restricciones
// de UNIQUE/CHECK que D1).
//
// Cubre:
//   1) alta nueva → estado pendiente
//   2) alta duplicada del mismo correo en pendiente → 200 idéntico, reissue interno
//   3) alta de un correo ya confirmado → 200 idéntico, sin reissue
//   4) confirmación → estado confirmado
//   5) confirmación con token gastado → 400 invalido_o_caducado
//   6) baja → estado baja, idempotente al segundo clic
//   7) token de baja inválido → 400
//   8) shape del token: rechaza inputs malformados
//
// El stub sendConfirmationEmail() permanece no-op. Esto es plomería
// desactivada: no sale un solo correo.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync, type StatementSync } from "node:sqlite";

import type { EmailEnv } from "../lib/newsletter/email";
import { handleConfirm, handleSubscribe, handleUnsubscribe } from "../lib/newsletter/handlers";

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

function adaptD1(sqlite: DatabaseSync): D1Database {
  type Builder = { stmt: StatementSync; bindings: Record<string, unknown> };
  function makeStatement(query: string) {
    const stmt = sqlite.prepare(query);
    const builder: Builder = { stmt, bindings: {} };
    const api = {
      bind(...values: unknown[]) {
        const obj: Record<string, unknown> = {};
        for (let i = 0; i < values.length; i++) {
          obj[String(i + 1)] = values[i] as never;
        }
        builder.bindings = obj;
        return api;
      },
      async run() {
        builder.stmt.run(builder.bindings);
        return { success: true, results: [], meta: {} } as unknown as D1Result;
      },
      async first<T>(): Promise<T | null> {
        const row = builder.stmt.get(builder.bindings);
        return (row as T | undefined) ?? null;
      },
      async all<T>() {
        const rows = builder.stmt.all(builder.bindings) as T[];
        return { results: rows, success: true, meta: {} } as unknown as D1Result<T>;
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
      throw new Error("batch not supported in test adapter");
    },
    exec() {
      throw new Error("exec not supported in test adapter");
    },
    dump() {
      throw new Error("dump not supported in test adapter");
    },
    withSession() {
      throw new Error("withSession not supported in test adapter");
    },
  } as unknown as D1Database;
}

function loadMigration(): string {
  return readFileSync(
    join(__dirname, "..", "migrations", "0001_create_subscribers.sql"),
    "utf-8",
  );
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

async function main(): Promise<void> {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(loadMigration());
  const db = adaptD1(sqlite);
  // Env vacío: no hay RESEND_API_KEY → los envíos se omiten en silencio
  // y los handlers responden igual. La parte de envío se testea aparte
  // con scripts/test-newsletter-email-mock.ts.
  const env: EmailEnv = {};

  console.log("Migración aplicada en SQLite en memoria.");

  // ------------------------------------------------------------------
  console.log("\n1) Alta nueva");
  {
    const res = await handleSubscribe(
      db,
      env,
      postJson(`${BASE}/api/newsletter/subscribe`, { email: "ALICE@example.com" }),
    );
    assert("subscribe: status 200", res.status === 200, `got ${res.status}`);
    const body = (await res.clone().json()) as { ok: boolean };
    assert("subscribe: ok=true", body.ok === true);
    const row = sqlite
      .prepare("SELECT * FROM subscribers WHERE email = ?1")
      .get({ 1: "alice@example.com" }) as SubscriberRow | undefined;
    assert("subscribe: fila creada", !!row);
    assert("subscribe: email normalizado a minúsculas", row?.email === "alice@example.com");
    assert("subscribe: status pendiente", row?.status === "pendiente");
    assert("subscribe: token de confirmación emitido", !!row?.confirmation_token);
    assert(
      "subscribe: token tiene 64 chars hex",
      !!row?.confirmation_token && /^[a-f0-9]{64}$/.test(row.confirmation_token),
    );
    assert("subscribe: token de baja emitido", !!row?.unsubscribe_token);
    assert(
      "subscribe: tokens distintos",
      row?.confirmation_token !== row?.unsubscribe_token,
    );
  }

  // ------------------------------------------------------------------
  console.log("\n2) Alta duplicada (pendiente): reissue interno, respuesta idéntica");
  let firstToken: string;
  {
    const initial = sqlite
      .prepare("SELECT confirmation_token FROM subscribers WHERE email = ?1")
      .get({ 1: "alice@example.com" }) as { confirmation_token: string };
    firstToken = initial.confirmation_token;

    const res = await handleSubscribe(
      db,
      env,
      postJson(`${BASE}/api/newsletter/subscribe`, { email: "alice@example.com" }),
    );
    assert("duplicado pendiente: status 200", res.status === 200);

    const row = sqlite
      .prepare("SELECT * FROM subscribers WHERE email = ?1")
      .get({ 1: "alice@example.com" }) as SubscriberRow;
    assert("duplicado pendiente: misma fila (id preservado)", row.id === 1);
    assert(
      "duplicado pendiente: nuevo token de confirmación",
      row.confirmation_token !== null && row.confirmation_token !== firstToken,
    );
    const count = (
      sqlite.prepare("SELECT COUNT(*) AS c FROM subscribers").get() as { c: number }
    ).c;
    assert("duplicado pendiente: no se duplicó la fila", count === 1);
  }

  // ------------------------------------------------------------------
  console.log("\n3) Confirmación con token vigente");
  let currentToken: string;
  {
    const row = sqlite
      .prepare("SELECT confirmation_token FROM subscribers WHERE email = ?1")
      .get({ 1: "alice@example.com" }) as { confirmation_token: string };
    currentToken = row.confirmation_token;

    const res = await handleConfirm(
      db,
      getJson(`${BASE}/api/newsletter/confirm?token=${currentToken}`),
    );
    assert("confirm: status 200", res.status === 200);
    const body = (await res.clone().json()) as { ok: boolean; kind: string };
    assert("confirm: kind=confirmed", body.kind === "confirmed");

    const after = sqlite
      .prepare("SELECT * FROM subscribers WHERE email = ?1")
      .get({ 1: "alice@example.com" }) as SubscriberRow;
    assert("confirm: status=confirmado", after.status === "confirmado");
    assert("confirm: confirmed_at poblado", !!after.confirmed_at);
    assert("confirm: token anulado (NULL)", after.confirmation_token === null);
    assert("confirm: confirmation_token_used_at poblado", !!after.confirmation_token_used_at);
  }

  // ------------------------------------------------------------------
  console.log("\n4) Re-uso del mismo token: indistinguible de inválido");
  {
    const res = await handleConfirm(
      db,
      getJson(`${BASE}/api/newsletter/confirm?token=${currentToken}`),
    );
    assert("confirm reuse: status 400", res.status === 400);
    const body = (await res.clone().json()) as { kind: string };
    assert("confirm reuse: kind=invalid", body.kind === "invalid");
  }

  // ------------------------------------------------------------------
  console.log("\n5) Alta de correo YA confirmado: respuesta idéntica, sin reissue");
  {
    const before = sqlite
      .prepare("SELECT * FROM subscribers WHERE email = ?1")
      .get({ 1: "alice@example.com" }) as SubscriberRow;

    const res = await handleSubscribe(
      db,
      env,
      postJson(`${BASE}/api/newsletter/subscribe`, { email: "alice@example.com" }),
    );
    assert("subscribe confirmed: status 200", res.status === 200);

    const after = sqlite
      .prepare("SELECT * FROM subscribers WHERE email = ?1")
      .get({ 1: "alice@example.com" }) as SubscriberRow;
    assert("subscribe confirmed: status sigue confirmado", after.status === "confirmado");
    assert(
      "subscribe confirmed: no se re-emite confirmation_token",
      after.confirmation_token === before.confirmation_token,
    );
  }

  // ------------------------------------------------------------------
  console.log("\n6) Baja con token válido");
  let aliceUnsubToken: string;
  {
    const row = sqlite
      .prepare("SELECT unsubscribe_token FROM subscribers WHERE email = ?1")
      .get({ 1: "alice@example.com" }) as { unsubscribe_token: string };
    aliceUnsubToken = row.unsubscribe_token;

    const res = await handleUnsubscribe(
      db,
      env,
      getJson(`${BASE}/api/newsletter/unsubscribe?token=${aliceUnsubToken}`),
    );
    assert("unsubscribe: status 200", res.status === 200);
    const body = (await res.clone().json()) as { kind: string };
    assert("unsubscribe: kind=unsubscribed", body.kind === "unsubscribed");

    const after = sqlite
      .prepare("SELECT * FROM subscribers WHERE email = ?1")
      .get({ 1: "alice@example.com" }) as SubscriberRow;
    assert("unsubscribe: status=baja", after.status === "baja");
    assert("unsubscribe: unsubscribed_at poblado", !!after.unsubscribed_at);
  }

  // ------------------------------------------------------------------
  console.log("\n7) Segundo clic en el link de baja: idempotente");
  {
    const res = await handleUnsubscribe(
      db,
      env,
      getJson(`${BASE}/api/newsletter/unsubscribe?token=${aliceUnsubToken}`),
    );
    assert("unsubscribe twice: status 200", res.status === 200);
    const body = (await res.clone().json()) as { kind: string };
    assert(
      "unsubscribe twice: kind=already_unsubscribed",
      body.kind === "already_unsubscribed",
    );
  }

  // ------------------------------------------------------------------
  console.log("\n8) Re-alta de correo en estado baja: no se re-suscribe");
  {
    const res = await handleSubscribe(
      db,
      env,
      postJson(`${BASE}/api/newsletter/subscribe`, { email: "alice@example.com" }),
    );
    assert("subscribe after baja: status 200", res.status === 200);
    const after = sqlite
      .prepare("SELECT * FROM subscribers WHERE email = ?1")
      .get({ 1: "alice@example.com" }) as SubscriberRow;
    assert("subscribe after baja: status sigue baja", after.status === "baja");
    assert(
      "subscribe after baja: confirmation_token NO se re-emite",
      after.confirmation_token === null,
    );
  }

  // ------------------------------------------------------------------
  console.log("\n9) Validación de inputs");
  {
    const r1 = await handleSubscribe(
      db,
      env,
      postJson(`${BASE}/api/newsletter/subscribe`, { email: "no-es-correo" }),
    );
    assert("invalid email: status 400", r1.status === 400);

    const r2 = await handleSubscribe(
      db,
      env,
      postJson(`${BASE}/api/newsletter/subscribe`, {}),
    );
    assert("missing email: status 400", r2.status === 400);

    const r3 = await handleConfirm(
      db,
      getJson(`${BASE}/api/newsletter/confirm?token=corto`),
    );
    assert("malformed token: status 400", r3.status === 400);

    const r4 = await handleUnsubscribe(
      db,
      env,
      getJson(`${BASE}/api/newsletter/unsubscribe`),
    );
    assert("missing unsub token: status 400", r4.status === 400);

    const r5 = await handleConfirm(
      db,
      getJson(`${BASE}/api/newsletter/confirm?token=${"f".repeat(64)}`),
    );
    assert("nonexistent token: status 400", r5.status === 400);
  }

  // ------------------------------------------------------------------
  console.log("\n10) Tokens únicos entre suscriptores distintos");
  {
    await handleSubscribe(
      db,
      env,
      postJson(`${BASE}/api/newsletter/subscribe`, { email: "bob@example.com" }),
    );
    await handleSubscribe(
      db,
      env,
      postJson(`${BASE}/api/newsletter/subscribe`, { email: "carla@example.com" }),
    );
    const tokens = sqlite
      .prepare("SELECT confirmation_token, unsubscribe_token FROM subscribers WHERE status = 'pendiente'")
      .all() as { confirmation_token: string; unsubscribe_token: string }[];
    const allTokens = tokens.flatMap((t) => [t.confirmation_token, t.unsubscribe_token]);
    const unique = new Set(allTokens);
    assert(
      "todos los tokens son únicos entre suscriptores",
      allTokens.length === unique.size,
    );
  }

  // ------------------------------------------------------------------
  const failed = checks.filter((c) => !c.ok);
  console.log("\n" + "=".repeat(60));
  console.log(`Resultado: ${checks.length - failed.length}/${checks.length} checks pasaron.`);
  if (failed.length > 0) {
    console.log("FALLOS:");
    for (const f of failed) {
      console.log(`  - ${f.name}${f.detail ? ` (${f.detail})` : ""}`);
    }
    process.exit(1);
  }
  console.log("OK — flujo doble opt-in funciona end-to-end (con stub de correo).");
}

main().catch((err) => {
  console.error("error inesperado:", err);
  process.exit(1);
});

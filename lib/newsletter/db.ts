import { generateToken } from "./tokens";
import type {
  ConfirmOutcome,
  SubscribeOutcome,
  Subscriber,
  UnsubscribeOutcome,
} from "./types";

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
  consent_at: string | null;
};

function rowToSubscriber(row: SubscriberRow): Subscriber {
  return {
    id: row.id,
    email: row.email,
    status: row.status as Subscriber["status"],
    confirmationToken: row.confirmation_token,
    confirmationTokenUsedAt: row.confirmation_token_used_at,
    unsubscribeToken: row.unsubscribe_token,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at,
    unsubscribedAt: row.unsubscribed_at,
    consentAt: row.consent_at,
  };
}

function nowIsoUtc(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findByEmail(
  db: D1Database,
  email: string,
): Promise<Subscriber | null> {
  const row = await db
    .prepare("SELECT * FROM subscribers WHERE email = ?1")
    .bind(normalizeEmail(email))
    .first<SubscriberRow>();
  return row ? rowToSubscriber(row) : null;
}

export async function findByConfirmationToken(
  db: D1Database,
  token: string,
): Promise<Subscriber | null> {
  const row = await db
    .prepare("SELECT * FROM subscribers WHERE confirmation_token = ?1")
    .bind(token)
    .first<SubscriberRow>();
  return row ? rowToSubscriber(row) : null;
}

export async function findByUnsubscribeToken(
  db: D1Database,
  token: string,
): Promise<Subscriber | null> {
  const row = await db
    .prepare("SELECT * FROM subscribers WHERE unsubscribe_token = ?1")
    .bind(token)
    .first<SubscriberRow>();
  return row ? rowToSubscriber(row) : null;
}

export async function subscribe(
  db: D1Database,
  rawEmail: string,
  consentAt: string,
): Promise<SubscribeOutcome> {
  const email = normalizeEmail(rawEmail);
  const existing = await findByEmail(db, email);

  if (!existing) {
    const confirmationToken = generateToken();
    const unsubscribeToken = generateToken();
    const createdAt = nowIsoUtc();
    await db
      .prepare(
        `INSERT INTO subscribers
           (email, status, confirmation_token, unsubscribe_token, created_at, consent_at)
         VALUES (?1, 'pendiente', ?2, ?3, ?4, ?5)`,
      )
      .bind(email, confirmationToken, unsubscribeToken, createdAt, consentAt)
      .run();

    const fresh = await findByEmail(db, email);
    if (!fresh) {
      throw new Error("subscribers row missing after insert");
    }
    return { kind: "created", subscriber: fresh };
  }

  if (existing.status === "confirmado") {
    return { kind: "already_confirmed" };
  }

  if (existing.status === "baja") {
    return { kind: "previously_unsubscribed" };
  }

  // status === "pendiente": re-emitimos el token de confirmación.
  // El token de baja se conserva: pertenece a esta alta y ya pudo
  // haber circulado en correos previos.
  const newConfirmationToken = generateToken();
  await db
    .prepare(
      `UPDATE subscribers
         SET confirmation_token = ?1,
             confirmation_token_used_at = NULL
       WHERE id = ?2`,
    )
    .bind(newConfirmationToken, existing.id)
    .run();

  const reissued = await findByEmail(db, email);
  if (!reissued) {
    throw new Error("subscribers row missing after token reissue");
  }
  return { kind: "reissued", subscriber: reissued };
}

export async function confirm(
  db: D1Database,
  token: string,
): Promise<ConfirmOutcome> {
  const existing = await findByConfirmationToken(db, token);
  if (!existing) {
    return { kind: "invalid" };
  }

  if (
    existing.confirmationTokenUsedAt !== null ||
    existing.status !== "pendiente"
  ) {
    return { kind: "already_used" };
  }

  const now = nowIsoUtc();
  // Token de un solo uso: lo anulamos al consumirlo. Cualquier reintento
  // con el mismo token caerá en `findByConfirmationToken` → null →
  // `invalid`, indistinguible de un token nunca emitido.
  await db
    .prepare(
      `UPDATE subscribers
         SET status = 'confirmado',
             confirmed_at = ?1,
             confirmation_token = NULL,
             confirmation_token_used_at = ?1
       WHERE id = ?2 AND status = 'pendiente'`,
    )
    .bind(now, existing.id)
    .run();

  const updated = await findByEmail(db, existing.email);
  if (!updated || updated.status !== "confirmado") {
    return { kind: "already_used" };
  }
  return { kind: "confirmed", subscriber: updated };
}

export async function unsubscribe(
  db: D1Database,
  token: string,
): Promise<UnsubscribeOutcome> {
  const existing = await findByUnsubscribeToken(db, token);
  if (!existing) {
    return { kind: "invalid" };
  }

  if (existing.status === "baja") {
    return { kind: "already_unsubscribed" };
  }

  const now = nowIsoUtc();
  // Baja idempotente: el clic desde correo puede repetirse y debe
  // seguir aterrizando en "estás dado de baja". El token de baja se
  // conserva para que sigan funcionando enlaces previos.
  await db
    .prepare(
      `UPDATE subscribers
         SET status = 'baja',
             unsubscribed_at = ?1,
             confirmation_token = NULL
       WHERE id = ?2`,
    )
    .bind(now, existing.id)
    .run();

  const updated = await findByEmail(db, existing.email);
  if (!updated) {
    throw new Error("subscribers row missing after unsubscribe");
  }
  return { kind: "unsubscribed", subscriber: updated };
}

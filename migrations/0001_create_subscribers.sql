-- Esquema inicial de la tabla de suscriptores del boletín.
--
-- Estados:
--   pendiente   → alta recibida, falta confirmar (doble opt-in).
--   confirmado  → confirmó vía token; cuenta como lista real.
--   baja        → solicitó darse de baja.
--
-- Solo los suscriptores en estado 'confirmado' deben recibir envíos.

CREATE TABLE IF NOT EXISTS subscribers (
  id                          INTEGER PRIMARY KEY AUTOINCREMENT,
  email                       TEXT    NOT NULL UNIQUE,
  status                      TEXT    NOT NULL
                                      CHECK (status IN ('pendiente', 'confirmado', 'baja')),
  confirmation_token          TEXT,
  confirmation_token_used_at  TEXT,
  unsubscribe_token           TEXT    NOT NULL UNIQUE,
  created_at                  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  confirmed_at                TEXT,
  unsubscribed_at             TEXT
);

CREATE INDEX IF NOT EXISTS idx_subscribers_confirmation_token
  ON subscribers (confirmation_token);

CREATE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token
  ON subscribers (unsubscribe_token);

CREATE INDEX IF NOT EXISTS idx_subscribers_status
  ON subscribers (status);

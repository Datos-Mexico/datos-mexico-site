# Capa de datos del boletín — D1 (DESACTIVADA)

> Estado al 2026-06-20: plomería montada, BD real provisionada,
> esquema aplicado en el D1 remoto y flujo validado end-to-end contra
> la base real. **No conectada al formulario público**.
> `NewsletterForm.tsx` sigue usando `defaultSimulatedSubmit` (fake) y
> los stubs de Resend siguen no-op. No captura un solo correo real.
>
> - BD remota: `datosmexico-newsletter` (`d3f14281-d325-4433-9fa9-5ff6c5d92314`), región ENAM.
> - Tabla `subscribers`: existe, vacía (0 filas tras los tests).

## Arquitectura

- **Almacenamiento**: Cloudflare D1 (binding `NEWSLETTER_DB`).
- **Envío transaccional**: Resend (PENDIENTE de montar). Hoy
  `lib/newsletter/email.ts` expone los stubs `sendConfirmationEmail()` y
  `sendUnsubscribeReceiptEmail()` como no-ops claramente marcados.
- **Doble opt-in**: alta → estado `pendiente` + token de confirmación →
  clic → estado `confirmado`. Solo `confirmado` cuenta como lista real.

## Esquema

Tabla `subscribers` (definición canónica en
[`migrations/0001_create_subscribers.sql`](../../migrations/0001_create_subscribers.sql)):

| Columna                       | Tipo    | Notas                                                  |
| ----------------------------- | ------- | ------------------------------------------------------ |
| `id`                          | INTEGER | PK autoincrement                                       |
| `email`                       | TEXT    | UNIQUE, normalizado a minúsculas                       |
| `status`                      | TEXT    | CHECK `IN ('pendiente','confirmado','baja')`           |
| `confirmation_token`          | TEXT    | 64 chars hex; NULL una vez consumido                   |
| `confirmation_token_used_at`  | TEXT    | ISO8601 UTC al consumirse                              |
| `unsubscribe_token`           | TEXT    | UNIQUE, idempotente (un mismo enlace puede repetirse)  |
| `created_at`                  | TEXT    | ISO8601 UTC, default `strftime('%Y-%m-%dT%H:%M:%SZ')`  |
| `confirmed_at`                | TEXT    | ISO8601 UTC al confirmar                               |
| `unsubscribed_at`             | TEXT    | ISO8601 UTC al darse de baja                           |

Índices: `confirmation_token`, `unsubscribe_token`, `status`.

## Endpoints

Los tres viven bajo `app/api/newsletter/` y leen el binding D1 vía
`getCloudflareContext()`.

### `POST /api/newsletter/subscribe`

Body: `{ "email": "tu@correo.com" }`.

Respuesta **uniforme** en los cuatro escenarios (nuevo, pendiente
re-emite, ya confirmado, ya dado de baja) → no se filtra si un correo
está o no en la lista.

Side effect en `nuevo`/`pendiente`: llama a `sendConfirmationEmail()`
(hoy no-op). En `confirmado` y `baja`: no se vuelve a emitir token ni a
"reactivar" al usuario.

### `GET /api/newsletter/confirm?token=...`

Valida shape (64 hex), busca por `confirmation_token`. Si encuentra y
está vigente: marca `confirmado`, anula el token, registra
`confirmed_at` y `confirmation_token_used_at`. Si el token está gastado
o nunca existió: 400 idéntico (`kind: "invalid"`).

### `GET /api/newsletter/unsubscribe?token=...`

Valida shape, busca por `unsubscribe_token`. Marca `baja` si está
activo; idempotente (segundo clic devuelve 200
`already_unsubscribed`). Token inválido → 400.

## Pruebas

### Local (rápido, SQLite en memoria)

```bash
npm run test:newsletter
```

Aplica el esquema sobre un SQLite en memoria (`node:sqlite`), invoca
los tres handlers con un adaptador D1 mínimo, y verifica el flujo
completo (39 checks): alta nueva, duplicados, reissue de token,
confirmación, re-uso del token confirmado, baja, idempotencia, baja
previa que no se re-suscribe, validación de inputs, unicidad de tokens.

### Remoto (contra la BD D1 real)

```bash
npm run test:newsletter:remote
```

Ejecuta los mismos handlers contra el D1 remoto (`--remote`) usando
un adaptador que reenvía cada query a `wrangler d1 execute`. 34
checks adicionales que demuestran que el esquema y el flujo
funcionan contra la base real, incluyendo la verificación a nivel D1
de la restricción `UNIQUE(email)`. El script **limpia la tabla** al
empezar y al terminar (la BD queda vacía).

## Provisión de la BD (ya hecho)

Hecho el 2026-06-20:

1. `wrangler d1 create datosmexico-newsletter` → UUID
   `d3f14281-d325-4433-9fa9-5ff6c5d92314`, región ENAM.
2. UUID sustituido en `wrangler.jsonc` (binding `NEWSLETTER_DB`).
3. `wrangler d1 migrations apply datosmexico-newsletter --remote` →
   migración `0001_create_subscribers.sql` aplicada (5 statements OK).
4. Tests remotos ejecutados (34/34 PASS) y BD limpia.

## Pasos del CEO (siguientes)

1. **Montar Resend**: sustituir el cuerpo de `sendConfirmationEmail()`
   y `sendUnsubscribeReceiptEmail()` en `lib/newsletter/email.ts`,
   añadir el secret `RESEND_API_KEY` vía
   `npx wrangler secret put RESEND_API_KEY` y verificar el remitente
   en el panel de Resend (dominio `datosmexico.org`).
2. **Conectar el formulario** (último paso): en
   `components/newsletter/NewsletterForm.tsx`, cambiar el `onSubmit`
   por defecto de `defaultSimulatedSubmit` a una función que llame a
   `POST /api/newsletter/subscribe` y actualizar el copy de éxito si
   procede. Hasta entonces el formulario sigue fake.

## Privacidad

- Tokens: 256 bits (32 bytes) de entropía por
  `crypto.getRandomValues()`, codificados como 64 chars hex. No
  adivinables por fuerza bruta dentro del horizonte del observatorio.
- Confirmación de un solo uso (token se anula en la BD al consumirse).
- Respuesta uniforme en `/subscribe` para evitar enumeración de la
  lista (no se filtra si un correo ya estaba suscrito o dado de baja).
- Baja sin login: un clic desde el correo basta. Token de baja
  idempotente: el mismo enlace funciona siempre y aterriza en "estás
  dado de baja".
- Email del correo de confirmación y del de baja deben enlazar a
  `/privacidad` (aviso vigente). El stub ya recibe `privacyUrl` en el
  payload — cuando Resend entre, ese campo va en el cuerpo del correo.

# Setup de Resend para el boletín — guía operativa del CEO

> Estado al 2026-06-20: el código que envía los correos del boletín
> está listo en `lib/newsletter/email.ts` y validado con un mock
> (33/33 checks). El envío **no se ejecuta todavía** porque el secret
> `RESEND_API_KEY` no existe en el worker. El formulario sigue fake.
>
> Este documento es la guía para activar Resend sin romper el Email
> Routing existente.

---

## Resumen de lo que hace falta

Tres bloques. Los tres los ejecuta el CEO porque tocan credenciales o
DNS. El código del repo no requiere cambios.

1. **Cuenta Resend + API key** (en el panel de Resend).
2. **DNS** (en el panel de Cloudflare): añadir los registros que
   Resend genera, en un **subdominio dedicado**, para no tocar el
   Email Routing del dominio raíz.
3. **Secret en el worker** (`wrangler secret put RESEND_API_KEY`).

Después: redeploy automático (al hacer un cambio cualquiera) o
manual, y conectar el formulario público (paso de código aparte).

---

## 1) Cuenta Resend y API key

1. Crear cuenta en [resend.com](https://resend.com) con un correo
   institucional (sugerencia: `contacto@datosmexico.org`).
2. Verificar el correo de la cuenta (es la dueña, no la remitente).
3. En el panel: **API Keys → Create API Key**.
   - Nombre: `datosmexico-newsletter-prod`.
   - Permission: **Sending access** (solo enviar, no leer ni gestionar).
   - Domain: dejar `All domains` por ahora; al verificar el dominio
     puedes restringirla luego.
4. Copiar la key (empieza con `re_...`). Solo se muestra una vez.
   **Esta key NO debe pasar por código, mensajes ni este repo.** Va
   directo al wrangler secret en el paso 3.

---

## 2) DNS — el punto crítico de coexistencia con Email Routing

### Decisión: enviar desde un subdominio dedicado

Configuración recomendada (la que asume el código):

- **Dominio de envío**: `mail.datosmexico.org`
- **Dirección visible**: `Datos México <boletin@mail.datosmexico.org>`
- **Reply-To**: `contacto@datosmexico.org` (Email Routing existente)

Esta decisión es clave. Hay dos opciones:

**Opción A: enviar desde el dominio raíz `@datosmexico.org`.**
Implicaría:
- modificar el SPF del root para incluir el include de Resend además
  del de Cloudflare,
- añadir el DKIM de Resend al root,
- añadir registros MX para bounces a un `send.datosmexico.org`.

Riesgos: cualquier error al editar el SPF root corta el envío Y la
recepción del Email Routing. Reputación compartida con cualquier otro
envío que salga del root.

**Opción B (RECOMENDADA): enviar desde `mail.datosmexico.org`.**
Todos los registros de Resend viven en el subdominio. El root
`datosmexico.org` queda **intacto**.

Resultado:
- Email Routing en root sigue funcionando exactamente igual
  (`contacto@`, `prensa@`, `academia@`, `correcciones@`).
- La reputación del envío del boletín está aislada del dominio
  principal: si algún día hay rebotes o quejas, no contaminan
  `datosmexico.org`.
- Cosmético: la dirección visible es `@mail.datosmexico.org`. En la
  bandeja del lector se ve "Datos México" como nombre. La dirección
  completa solo se ve al hacer click en los detalles del remitente.

Las dos personas que escriben transaccional desde un dominio (Stripe,
Vercel, GitHub, etc.) lo hacen así por defecto. Es la práctica
estándar.

### Lo que existe hoy en `datosmexico.org` (no tocar)

Verificado por `dig` el 2026-06-20:

| Registro                                      | Valor                                                    | Propósito           |
| --------------------------------------------- | -------------------------------------------------------- | ------------------- |
| `datosmexico.org` MX                          | `route1/2/3.mx.cloudflare.net`                           | Email Routing inbox |
| `datosmexico.org` TXT                         | `v=spf1 include:_spf.mx.cloudflare.net ~all`             | SPF Email Routing   |
| `cf2024-1._domainkey.datosmexico.org` TXT     | DKIM público de Cloudflare Email Routing                 | DKIM Email Routing  |
| `_dmarc.datosmexico.org` TXT                  | (no existe; opcional)                                    | DMARC               |

**Ningún registro de los anteriores debe modificarse al activar
Resend.** La opción B no los toca.

### Pasos en Cloudflare (después de verificar el dominio en Resend)

1. En el panel de Resend, **Domains → Add Domain**.
2. Escribir `mail.datosmexico.org` (no `datosmexico.org`).
3. Seleccionar región (sugerencia: `us-east-1` o la más cercana a la
   audiencia esperada — México queda mejor servido por `us-east-1`).
4. Resend mostrará una lista de **4 a 6 registros DNS** que hay que
   crear. **Todos los registros estarán bajo `mail.datosmexico.org`
   o `send.mail.datosmexico.org`** — ninguno bajo el root.

   La lista que Resend produce típicamente (los valores exactos los
   da el panel — pueden variar según región y rotación de keys):

   | Tipo    | Host                                                    | Valor                                                          |
   | ------- | ------------------------------------------------------- | -------------------------------------------------------------- |
   | TXT     | `mail.datosmexico.org`                                  | `v=spf1 include:amazonses.com ~all`                            |
   | MX      | `send.mail.datosmexico.org`                             | `10 feedback-smtp.<región>.amazonses.com`                      |
   | TXT     | `send.mail.datosmexico.org`                             | `v=spf1 include:amazonses.com ~all`                            |
   | TXT     | `resend._domainkey.mail.datosmexico.org`                | `p=<clave-pública-DKIM-larga>` (el panel da el valor completo) |
   | TXT     | `_dmarc.mail.datosmexico.org`                           | `v=DMARC1; p=none; rua=mailto:dmarc@datosmexico.org` *(*)*     |

   *(*) DMARC es opcional. Recomendado empezar con `p=none` para
   recolectar reportes; subir a `p=quarantine` cuando el envío esté
   asentado.*

5. En el panel de Cloudflare DNS, añadir cada uno **exactamente** como
   Resend pide (copy-paste). Por cada registro:
   - **Tipo y nombre** coincidir con la tabla.
   - **TTL**: Auto.
   - **Proxy**: Apagado (gris) — los registros de correo nunca van
     proxied por Cloudflare. Si dejas el icono naranja activado, los
     registros DNS no se resuelven correctamente para servidores SMTP.

6. Volver al panel de Resend y darle a **Verify Domain**. Resend hace
   consultas DNS y marca cada registro como verificado. Si alguno
   queda en rojo, esperar 5–10 minutos (propagación) y reintentar.

### Por qué la opción B no rompe el Email Routing

El argumento es que las dos zonas — root y subdominio — viven en
universos DNS separados:

- **Email Routing usa**: registros `MX` en `datosmexico.org` (root) y
  el SPF/DKIM también en root. Sirven mensajes entrantes para
  `*@datosmexico.org`.
- **Resend usará**: registros en `mail.datosmexico.org` y
  `send.mail.datosmexico.org`. Sirven mensajes salientes con `From:
  *@mail.datosmexico.org`.

Cuando un servidor receptor (Gmail, Outlook) recibe un correo de
`boletin@mail.datosmexico.org`:
1. Mira el `Return-Path` (en el subdominio `send.mail.datosmexico.org`).
2. Verifica SPF contra `mail.datosmexico.org` y/o
   `send.mail.datosmexico.org`. **No mira el SPF del root.**
3. Verifica DKIM con el selector `resend._domainkey.mail.datosmexico.org`.
4. Si hay DMARC en `_dmarc.mail.datosmexico.org`, evalúa
   alineación. **No mira `_dmarc.datosmexico.org`.**

Al mismo tiempo, cuando alguien manda un correo a
`prensa@datosmexico.org`:
1. Su servidor consulta `MX datosmexico.org` → `route1/2/3.mx.cloudflare.net`.
2. Cloudflare Email Routing lo recibe.
3. Cloudflare lo forwardea a Gmail con su propio DKIM y SRS, sin
   tocar ningún registro del subdominio.

Las dos zonas operan en paralelo y no se ven entre sí.

### Verificación post-cambios (ya con Resend activo)

Después de añadir los registros y verificar en Resend, correr desde
local para confirmar que nada del root cambió:

```bash
# Root debe seguir igual
dig +short MX datosmexico.org           # → route1/2/3.mx.cloudflare.net
dig +short TXT datosmexico.org          # → v=spf1 include:_spf.mx.cloudflare.net ~all
                                        #   (y el google-site-verification)

# Subdominio debe tener los nuevos registros
dig +short TXT mail.datosmexico.org     # → v=spf1 include:amazonses.com ~all
dig +short MX send.mail.datosmexico.org # → 10 feedback-smtp.<región>.amazonses.com
dig +short TXT send.mail.datosmexico.org
dig +short TXT resend._domainkey.mail.datosmexico.org
```

---

## 3) Cargar el secret en el worker

Esto lo hace el CEO directamente desde su terminal. La key **no debe
pasar por chats, issues, PRs ni este repo**.

```bash
cd ruta/al/repo/datos-mexico-site
npx wrangler secret put RESEND_API_KEY
```

Wrangler abre un prompt seguro: pegar la key copiada de Resend,
enter. La key queda guardada cifrada en Cloudflare; ni siquiera el
panel la muestra después.

Para verificar que el secret existe (sin revelar el valor):

```bash
npx wrangler secret list
```

Debe aparecer `RESEND_API_KEY` en la lista.

### Variables opcionales

El código respeta dos variables que pueden ajustar el remitente sin
tocar el repositorio:

```bash
npx wrangler secret put NEWSLETTER_FROM
# → "Datos México <boletin@mail.datosmexico.org>"  (default si no se setea)

npx wrangler secret put NEWSLETTER_REPLY_TO
# → "contacto@datosmexico.org"  (default si no se setea)
```

Los defaults son los recomendados; no hace falta setear estos a menos
que se quiera cambiar la dirección visible.

---

## 4) Después de cargar el secret

Cloudflare Workers Builds redeploya automáticamente al siguiente push
a `main`. El secret estará disponible desde el primer request post-deploy.

Para probar el envío end-to-end sin conectar todavía el formulario
público:

```bash
curl -X POST https://datosmexico.org/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-correo-personal@gmail.com"}'
```

Debe responder `200 OK` con `{ok: true, message: "..."}` y llegar un
correo de confirmación a esa dirección (revisar spam la primera vez —
los proveedores tardan un par de envíos en confiar). Si el correo
llega y al hacer clic en el enlace marca el estado como `confirmado`
en D1, todo el flujo funciona.

Limpiar después de probar:

```bash
npx wrangler d1 execute datosmexico-newsletter --remote \
  --command="DELETE FROM subscribers WHERE email='tu-correo-personal@gmail.com'"
```

---

## 5) Sigue pendiente — conectar el formulario

El último paso es modificar `components/newsletter/NewsletterForm.tsx`
para que el `onSubmit` por defecto deje de ser `defaultSimulatedSubmit`
y pase a llamar `POST /api/newsletter/subscribe`. Ese cambio va en un
PR aparte, **después** de que el setup de Resend esté verificado.

---

## Anexo: estado actual del envío en el código

- `lib/newsletter/email.ts` exporta `sendConfirmationEmail` y
  `sendUnsubscribeReceiptEmail` que envían vía Resend cuando
  `RESEND_API_KEY` está en el entorno.
- Sin la key, el código registra `confirmation.skipped` o
  `unsubscribe_receipt.skipped` y devuelve sin tocar la red. **No
  rompe** el flujo de suscripción aunque falte la key.
- Errores de Resend (4xx/5xx) o de red se loggean como
  `confirmation.error` y **no** lanzan excepción al handler — el
  usuario recibe la misma respuesta uniforme y, si quisiera, puede
  reintentar (el handler emite un nuevo token al reintentar).
- El HTML del correo es sobrio: tipografía serif acorde a la marca,
  un solo CTA, link al aviso de privacidad y a la baja, sin imágenes
  externas (mejor para deliverability).
- Headers `List-Unsubscribe` y `List-Unsubscribe-Post: One-Click`
  cumplen RFC 2369 / RFC 8058 — Gmail y Outlook mostrarán un botón
  de baja nativo al lado del remitente.
- Pruebas: `npm run test:newsletter:mock` valida el armado del
  correo, el manejo de errores y la skip-on-missing-key (33/33).

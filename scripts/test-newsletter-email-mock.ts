// Verifica el armado del correo de Resend SIN tocar la API real.
//
// Inyecta un `Sender` falso en `sendConfirmationEmail` y
// `sendUnsubscribeReceiptEmail`, captura el mensaje que ENVIARÍAN a
// Resend y comprueba:
//
//   - subject y `from` correctos
//   - destinatario único
//   - HTML y texto contienen el enlace de confirmación, el aviso
//     de privacidad y el enlace de baja
//   - header List-Unsubscribe presente (RFC 2369)
//   - reply_to apunta al buzón humano
//   - escape correcto de comillas en URLs
//   - sin API key, el envío se omite en silencio
//   - errores HTTP no rompen el flujo
//   - configuración por env override del remitente
//
// Sin la API key real. Sin tocar la red.

import {
  type EmailEnv,
  type Sender,
  buildConfirmationMessage,
  buildUnsubscribeReceiptMessage,
  sendConfirmationEmail,
  sendUnsubscribeReceiptEmail,
} from "../lib/newsletter/email";

type Check = { name: string; ok: boolean; detail?: string };
const checks: Check[] = [];

function assert(name: string, condition: boolean, detail?: string): void {
  checks.push({ name, ok: condition, detail });
  const mark = condition ? "PASS" : "FAIL";
  const tail = detail ? ` — ${detail}` : "";
  process.stdout.write(`  [${mark}] ${name}${tail}\n`);
}

type CapturedSend = {
  message: Parameters<Sender>[0];
  apiKey: string;
};

function createCapture() {
  const captured: CapturedSend[] = [];
  const sender: Sender = async (message, apiKey) => {
    captured.push({ message, apiKey });
    return { kind: "sent", id: `mock_${captured.length}` };
  };
  return { captured, sender };
}

const SAMPLE_CONFIRM = {
  to: "alice@example.com",
  confirmUrl: "https://datosmexico.org/boletin/confirmacion?token=" + "a".repeat(64),
  unsubscribeUrl: "https://datosmexico.org/boletin/baja?token=" + "b".repeat(64),
  privacyUrl: "https://datosmexico.org/privacidad",
};

const SAMPLE_UNSUB = {
  to: "alice@example.com",
  privacyUrl: "https://datosmexico.org/privacidad",
};

async function main(): Promise<void> {
  // ----------------------------------------------------------------
  console.log("1) Armado del correo de confirmación (defaults)");
  {
    const msg = buildConfirmationMessage(
      SAMPLE_CONFIRM,
      "Datos México <boletin@mail.datosmexico.org>",
      "contacto@datosmexico.org",
    );
    assert(
      "subject sobrio y específico",
      msg.subject === "Confirma tu suscripción al boletín de Datos México",
    );
    assert(
      "from default usa subdominio mail.",
      msg.from === "Datos México <boletin@mail.datosmexico.org>",
    );
    assert("destinatario único", Array.isArray(msg.to) && msg.to.length === 1 && msg.to[0] === "alice@example.com");
    assert("reply_to apunta a contacto@", msg.reply_to === "contacto@datosmexico.org");

    assert(
      "HTML contiene el enlace de confirmación",
      msg.html.includes(SAMPLE_CONFIRM.confirmUrl),
    );
    assert(
      "HTML contiene aviso de privacidad",
      msg.html.includes(SAMPLE_CONFIRM.privacyUrl),
    );
    assert(
      "HTML contiene enlace de baja",
      msg.html.includes(SAMPLE_CONFIRM.unsubscribeUrl),
    );
    assert(
      "HTML menciona 'Confirmar mi suscripción'",
      msg.html.includes("Confirmar mi suscripción"),
    );
    assert(
      "HTML identifica al observatorio",
      msg.html.includes("Datos México") &&
        msg.html.includes("Observatorio académico independiente"),
    );

    assert(
      "texto plano contiene el enlace de confirmación",
      msg.text.includes(SAMPLE_CONFIRM.confirmUrl),
    );
    assert(
      "texto plano contiene aviso de privacidad",
      msg.text.includes(SAMPLE_CONFIRM.privacyUrl),
    );
    assert(
      "texto plano contiene enlace de baja",
      msg.text.includes(SAMPLE_CONFIRM.unsubscribeUrl),
    );
    assert(
      "texto plano explica el doble opt-in",
      msg.text.toLowerCase().includes("un solo uso"),
    );

    assert(
      "List-Unsubscribe presente",
      msg.headers?.["List-Unsubscribe"] === `<${SAMPLE_CONFIRM.unsubscribeUrl}>`,
    );
    assert(
      "List-Unsubscribe-Post permite one-click",
      msg.headers?.["List-Unsubscribe-Post"] === "List-Unsubscribe=One-Click",
    );
  }

  // ----------------------------------------------------------------
  console.log("\n2) Armado del recibo de baja");
  {
    const msg = buildUnsubscribeReceiptMessage(
      SAMPLE_UNSUB,
      "Datos México <boletin@mail.datosmexico.org>",
      "contacto@datosmexico.org",
    );
    assert(
      "subject menciona baja",
      msg.subject === "Te dimos de baja del boletín de Datos México",
    );
    assert(
      "HTML invita a corregir si fue error",
      msg.html.includes("contacto@datosmexico.org"),
    );
    assert(
      "HTML referencia aviso de privacidad",
      msg.html.includes(SAMPLE_UNSUB.privacyUrl),
    );
    assert(
      "texto plano referencia aviso de privacidad",
      msg.text.includes(SAMPLE_UNSUB.privacyUrl),
    );
    assert(
      "recibo NO incluye List-Unsubscribe (ya está dado de baja)",
      msg.headers === undefined,
    );
  }

  // ----------------------------------------------------------------
  console.log("\n3) sendConfirmationEmail con API key: llama al sender");
  {
    const { captured, sender } = createCapture();
    const env: EmailEnv = { RESEND_API_KEY: "re_fake_test_key_only" };
    await sendConfirmationEmail(SAMPLE_CONFIRM, env, sender);

    assert("se llamó al sender una vez", captured.length === 1);
    assert("se pasó la API key tal cual", captured[0]?.apiKey === "re_fake_test_key_only");
    assert(
      "el mensaje capturado tiene el subject correcto",
      captured[0]?.message.subject === "Confirma tu suscripción al boletín de Datos México",
    );
  }

  // ----------------------------------------------------------------
  console.log("\n4) sendConfirmationEmail SIN API key: skipped");
  {
    const { captured, sender } = createCapture();
    const env: EmailEnv = {}; // sin RESEND_API_KEY
    await sendConfirmationEmail(SAMPLE_CONFIRM, env, sender);
    assert("sender NO se llama cuando falta la API key", captured.length === 0);
  }

  // ----------------------------------------------------------------
  console.log("\n5) Override de remitente vía env");
  {
    const { captured, sender } = createCapture();
    const env: EmailEnv = {
      RESEND_API_KEY: "re_fake_test_key_only",
      NEWSLETTER_FROM: "Observatorio <hola@boletin.datosmexico.org>",
      NEWSLETTER_REPLY_TO: "academia@datosmexico.org",
    };
    await sendConfirmationEmail(SAMPLE_CONFIRM, env, sender);
    assert(
      "from override respetado",
      captured[0]?.message.from === "Observatorio <hola@boletin.datosmexico.org>",
    );
    assert(
      "reply_to override respetado",
      captured[0]?.message.reply_to === "academia@datosmexico.org",
    );
  }

  // ----------------------------------------------------------------
  console.log("\n6) Error HTTP de Resend NO lanza excepción");
  {
    const errorSender: Sender = async () => ({
      kind: "error",
      status: 422,
      body: '{"name":"validation_error"}',
    });
    const env: EmailEnv = { RESEND_API_KEY: "re_fake_test_key_only" };
    let threw = false;
    try {
      await sendConfirmationEmail(SAMPLE_CONFIRM, env, errorSender);
    } catch {
      threw = true;
    }
    assert("send no lanza al recibir error HTTP", !threw);
  }

  // ----------------------------------------------------------------
  console.log("\n7) Error de red NO lanza excepción");
  {
    const networkErrorSender: Sender = async () => ({
      kind: "error",
      status: 0,
      body: "fetch failed",
    });
    const env: EmailEnv = { RESEND_API_KEY: "re_fake_test_key_only" };
    let threw = false;
    try {
      await sendConfirmationEmail(SAMPLE_CONFIRM, env, networkErrorSender);
    } catch {
      threw = true;
    }
    assert("send no lanza al fallar la red", !threw);
  }

  // ----------------------------------------------------------------
  console.log("\n8) Escape de URLs con caracteres especiales (defensivo)");
  {
    // En la práctica nuestros tokens son hex puro, pero el escape
    // debe estar listo para que cualquier futuro patrón sea seguro.
    const adversarial = {
      to: "test@example.com",
      confirmUrl: 'https://datosmexico.org/c?token=abc"><script>x</script>',
      unsubscribeUrl: "https://datosmexico.org/u?token=def",
      privacyUrl: "https://datosmexico.org/privacidad",
    };
    const msg = buildConfirmationMessage(
      adversarial,
      "Datos México <boletin@mail.datosmexico.org>",
      "contacto@datosmexico.org",
    );
    assert(
      "HTML escapa comillas dobles en atributos href",
      !msg.html.includes('"><script>'),
    );
    assert(
      "HTML escapa < en atributos",
      msg.html.includes("&lt;script") || !msg.html.includes("<script>x</script>"),
    );
  }

  // ----------------------------------------------------------------
  console.log("\n9) sendUnsubscribeReceiptEmail respeta SIN API key");
  {
    const { captured, sender } = createCapture();
    const env: EmailEnv = {};
    await sendUnsubscribeReceiptEmail(SAMPLE_UNSUB, env, sender);
    assert("recibo de baja: sender no llamado sin API key", captured.length === 0);
  }

  // ----------------------------------------------------------------
  console.log("\n10) sendUnsubscribeReceiptEmail con API key: llama al sender");
  {
    const { captured, sender } = createCapture();
    const env: EmailEnv = { RESEND_API_KEY: "re_fake_test_key_only" };
    await sendUnsubscribeReceiptEmail(SAMPLE_UNSUB, env, sender);
    assert("recibo de baja: sender llamado", captured.length === 1);
    assert(
      "recibo de baja: subject correcto",
      captured[0]?.message.subject === "Te dimos de baja del boletín de Datos México",
    );
  }

  // ----------------------------------------------------------------
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
  console.log("OK — armado del correo de Resend validado (sin tocar la red).");
}

main().catch((err) => {
  console.error("error inesperado:", err);
  process.exit(1);
});

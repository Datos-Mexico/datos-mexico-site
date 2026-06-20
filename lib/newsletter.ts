export type NewsletterSubmitResult = {
  ok: boolean;
  error?: string;
};

export type NewsletterSubmitFn = (
  email: string,
) => Promise<NewsletterSubmitResult>;

// Simple-but-strict email pattern. Sufficient for client-side validation; the
// real provider will validate again on its end.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/**
 * Envío real al endpoint del observatorio. El formulario público lo
 * usa como `onSubmit` por defecto a partir del encendido del boletín.
 *
 * Envía `consented: true` porque el formulario impone el tildado del
 * checkbox de consentimiento antes de habilitar el botón; el endpoint
 * vuelve a verificarlo del lado servidor (defensa en profundidad —
 * un POST crudo sin el flag recibe 400).
 *
 * La respuesta del endpoint es uniforme para los cuatro escenarios
 * (nuevo, pendiente reissue, ya confirmado, ya dado de baja) — el
 * cliente no sabe ni necesita saber cuál ocurrió, por privacidad.
 */
export const liveSubmit: NewsletterSubmitFn = async (email) => {
  let res: Response;
  try {
    res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, consented: true }),
      credentials: "omit",
    });
  } catch {
    return { ok: false, error: "Sin conexión. Inténtalo de nuevo." };
  }
  if (res.ok) {
    return { ok: true };
  }
  if (res.status === 400) {
    return { ok: false, error: "Introduce un correo electrónico válido." };
  }
  return {
    ok: false,
    error: "No pudimos procesar tu solicitud. Inténtalo en unos minutos.",
  };
};

/**
 * Submit simulado original. Se conserva exportado por si hace falta
 * diagnosticar sin tocar la red — no es el default del formulario.
 */
export const defaultSimulatedSubmit: NewsletterSubmitFn = async (email) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  if (typeof console !== "undefined") {
    console.log(`[Newsletter] Email capturado (simulación): ${email}`);
  }
  return { ok: true };
};

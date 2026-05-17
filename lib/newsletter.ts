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
 * Por ahora simulamos el envío. Cuando elijamos proveedor (Mailchimp,
 * Buttondown, ConvertKit, Substack u otro), reemplazar el cuerpo de esta
 * función por la llamada al API correspondiente. La firma debe permanecer
 * idéntica para no tocar `<NewsletterForm>`.
 */
export const defaultSimulatedSubmit: NewsletterSubmitFn = async (email) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  if (typeof console !== "undefined") {
    console.log(`[Newsletter] Email capturado (simulación): ${email}`);
  }
  return { ok: true };
};

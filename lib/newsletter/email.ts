// Stub del envío transaccional del boletín.
//
// PENDIENTE: enchufar Resend. Cuando se active, esta capa:
//   1. lee la API key desde env (binding/secret de Cloudflare),
//   2. arma el HTML del correo de confirmación / baja,
//   3. llama a Resend con el remitente verificado de datosmexico.org,
//   4. registra en logs el id de envío (no el cuerpo) para auditoría.
//
// Hoy ambos métodos son no-op: el flujo de doble opt-in funciona
// contra D1 pero no sale un solo correo. El formulario público sigue
// fake (defaultSimulatedSubmit) — esto es plomería desactivada.

export type ConfirmationEmail = {
  to: string;
  confirmUrl: string;
  unsubscribeUrl: string;
  privacyUrl: string;
};

export type UnsubscribeReceiptEmail = {
  to: string;
  privacyUrl: string;
};

export async function sendConfirmationEmail(
  payload: ConfirmationEmail,
): Promise<void> {
  // PENDIENTE: enchufar Resend. La firma define el contrato.
  void payload;
}

export async function sendUnsubscribeReceiptEmail(
  payload: UnsubscribeReceiptEmail,
): Promise<void> {
  // PENDIENTE: enchufar Resend. La firma define el contrato.
  void payload;
}

export type SubscriberStatus = "pendiente" | "confirmado" | "baja";

export type Subscriber = {
  id: number;
  email: string;
  status: SubscriberStatus;
  confirmationToken: string | null;
  confirmationTokenUsedAt: string | null;
  unsubscribeToken: string;
  createdAt: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  // ISO8601 UTC del momento en que el usuario aceptó el aviso de
  // privacidad. Se puebla en la inserción (estado pendiente). NULL
  // en filas previas a la migración 0002 (no se vuelve a poblar; la
  // BD estaba vacía cuando la migración corrió).
  consentAt: string | null;
};

export type SubscribeOutcome =
  | { kind: "created"; subscriber: Subscriber }
  | { kind: "reissued"; subscriber: Subscriber }
  | { kind: "already_confirmed" }
  | { kind: "previously_unsubscribed" };

export type ConfirmOutcome =
  | { kind: "confirmed"; subscriber: Subscriber }
  | { kind: "already_used" }
  | { kind: "invalid" };

export type UnsubscribeOutcome =
  | { kind: "unsubscribed"; subscriber: Subscriber }
  | { kind: "already_unsubscribed" }
  | { kind: "invalid" };

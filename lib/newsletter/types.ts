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

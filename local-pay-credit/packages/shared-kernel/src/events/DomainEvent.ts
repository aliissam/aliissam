export interface DomainEvent<TPayload = unknown> {
  readonly type: string;
  readonly occurredAt: Date;
  readonly payload: TPayload;
}

export function createEvent<TPayload>(type: string, payload: TPayload): DomainEvent<TPayload> {
  return { type, occurredAt: new Date(), payload };
}

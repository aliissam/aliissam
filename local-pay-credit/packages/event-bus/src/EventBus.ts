import { DomainEvent } from '@lpc/shared-kernel';

export type EventHandler<TPayload = unknown> = (event: DomainEvent<TPayload>) => void | Promise<void>;

// The port that every bounded context depends on instead of on each other.
// payment-service publishes PaymentSucceeded without knowing that
// credit-service, notification-service or merchant-dashboard-service are
// listening -- or that they exist at all. Swapping this in-memory
// implementation for Kafka/RabbitMQ/SNS later means changing only this
// file, not any service that publishes or subscribes.
export interface EventBus {
  publish<TPayload>(event: DomainEvent<TPayload>): Promise<void>;
  subscribe<TPayload>(eventType: string, handler: EventHandler<TPayload>): void;
}

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, EventHandler<any>[]>();

  subscribe<TPayload>(eventType: string, handler: EventHandler<TPayload>): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler as EventHandler<any>);
    this.handlers.set(eventType, existing);
  }

  async publish<TPayload>(event: DomainEvent<TPayload>): Promise<void> {
    const handlers = this.handlers.get(event.type) ?? [];
    for (const handler of handlers) {
      await handler(event);
    }
  }
}

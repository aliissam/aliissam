import { EventBus } from '@lpc/event-bus';
import { DomainEvent, PAYMENT_SUCCEEDED, PaymentSucceededPayload } from '@lpc/shared-kernel';
import { CreditService } from '../domain/CreditService';

export function registerCreditEventHandlers(eventBus: EventBus, creditService: CreditService): void {
  eventBus.subscribe<PaymentSucceededPayload>(
    PAYMENT_SUCCEEDED,
    (event: DomainEvent<PaymentSucceededPayload>) => {
      creditService.onPaymentSucceeded(event.payload.customerId);
    },
  );
}

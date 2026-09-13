import { EventBus } from '@lpc/event-bus';
import {
  DomainEvent,
  PAYMENT_SUCCEEDED,
  PaymentSucceededPayload,
  INSTALLMENT_SCHEDULED,
  InstallmentScheduledPayload,
} from '@lpc/shared-kernel';
import { NotificationService } from '../domain/NotificationService';

// notification-service never asks payment-service or credit-service "did
// something happen?" -- it just reacts to the events they publish.
export function registerNotificationEventHandlers(
  eventBus: EventBus,
  notifications: NotificationService,
): void {
  eventBus.subscribe<PaymentSucceededPayload>(
    PAYMENT_SUCCEEDED,
    async (event: DomainEvent<PaymentSucceededPayload>) => {
      await notifications.notify(
        event.payload.merchantId,
        `Payment of ${event.payload.amount} ${event.payload.currency} received via ${event.payload.provider}.`,
      );
    },
  );

  eventBus.subscribe<InstallmentScheduledPayload>(
    INSTALLMENT_SCHEDULED,
    async (event: DomainEvent<InstallmentScheduledPayload>) => {
      await notifications.notify(
        event.payload.customerId,
        `Installment ${event.payload.installmentNumber}/${event.payload.totalInstallments} of ` +
          `${event.payload.amount} ${event.payload.currency} is due on ${event.payload.dueDate}.`,
      );
    },
  );
}

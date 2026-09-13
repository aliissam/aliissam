import { EventBus } from '@lpc/event-bus';
import {
  DomainEvent,
  PAYMENT_SUCCEEDED,
  PAYMENT_FAILED,
  PaymentSucceededPayload,
  PaymentFailedPayload,
} from '@lpc/shared-kernel';
import { MerchantAnalyticsProjection } from './MerchantAnalyticsProjection';

export function registerDashboardProjector(eventBus: EventBus, projection: MerchantAnalyticsProjection): void {
  eventBus.subscribe<PaymentSucceededPayload>(
    PAYMENT_SUCCEEDED,
    (event: DomainEvent<PaymentSucceededPayload>) => {
      projection.recordSucceeded(event.payload.merchantId, event.payload.amount, event.payload.currency);
    },
  );

  eventBus.subscribe<PaymentFailedPayload>(PAYMENT_FAILED, (event: DomainEvent<PaymentFailedPayload>) => {
    projection.recordFailed(event.payload.merchantId);
  });
}

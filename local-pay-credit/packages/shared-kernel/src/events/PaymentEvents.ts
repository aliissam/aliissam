import { DomainEvent, createEvent } from './DomainEvent';

export const PAYMENT_SUCCEEDED = 'payment.succeeded';
export const PAYMENT_FAILED = 'payment.failed';

export interface PaymentSucceededPayload {
  transactionId: string;
  merchantId: string;
  customerId: string;
  amount: number;
  currency: string;
  provider: string;
  providerReference: string;
}

export interface PaymentFailedPayload {
  transactionId: string;
  merchantId: string;
  customerId: string;
  amount: number;
  currency: string;
  provider: string;
  failureReason: string;
}

export function paymentSucceeded(payload: PaymentSucceededPayload): DomainEvent<PaymentSucceededPayload> {
  return createEvent(PAYMENT_SUCCEEDED, payload);
}

export function paymentFailed(payload: PaymentFailedPayload): DomainEvent<PaymentFailedPayload> {
  return createEvent(PAYMENT_FAILED, payload);
}

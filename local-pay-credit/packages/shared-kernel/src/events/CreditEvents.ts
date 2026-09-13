import { DomainEvent, createEvent } from './DomainEvent';

export const CREDIT_APPROVED = 'credit.approved';
export const INSTALLMENT_SCHEDULED = 'installment.scheduled';
export const INSTALLMENT_REMINDER_DUE = 'installment.reminder_due';

export interface CreditApprovedPayload {
  customerId: string;
  limitAmount: number;
  currency: string;
}

export interface InstallmentScheduledPayload {
  customerId: string;
  planId: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  currency: string;
  dueDate: string;
}

export interface InstallmentReminderDuePayload {
  customerId: string;
  planId: string;
  installmentNumber: number;
  dueDate: string;
}

export function creditApproved(payload: CreditApprovedPayload): DomainEvent<CreditApprovedPayload> {
  return createEvent(CREDIT_APPROVED, payload);
}

export function installmentScheduled(
  payload: InstallmentScheduledPayload,
): DomainEvent<InstallmentScheduledPayload> {
  return createEvent(INSTALLMENT_SCHEDULED, payload);
}

export function installmentReminderDue(
  payload: InstallmentReminderDuePayload,
): DomainEvent<InstallmentReminderDuePayload> {
  return createEvent(INSTALLMENT_REMINDER_DUE, payload);
}
